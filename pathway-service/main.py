"""
Parivartan – Pathway real-time civic issue processing pipeline.

Architecture:
  ┌─────────────────────────────────────────────────────────────────┐
  │  Citizen App / Express API  ─POST─▶  Pathway REST connector     │
  │                                            │                    │
  │                                   Enrichment (severity,         │
  │                                   category via Pathway UDFs)    │
  │                                            │                    │
  │                              ┌─────────────┴──────────┐        │
  │                              ▼                         ▼        │
  │                     Firestore collection          SSE /stream   │
  │                   `processed_grievances`     (port 8081)        │
  └─────────────────────────────────────────────────────────────────┘

Environment variables (see .env.example):
  PATHWAY_PORT          – Pathway REST input port  (default: 8080)
  PATHWAY_SSE_PORT      – SSE output port          (default: 8081)
  FIREBASE_CREDENTIALS  – path to serviceAccountKey.json
"""

import json
import os
import queue
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pathway as pw

# ---------------------------------------------------------------------------
# Firebase initialisation (optional – outputs degrade gracefully if absent)
# ---------------------------------------------------------------------------
_FIREBASE_CRED = os.environ.get(
    "FIREBASE_CREDENTIALS",
    os.path.join(os.path.dirname(__file__), "..", "config", "serviceAccountKey.json"),
)
_firebase_ready = False
try:
    import firebase_admin
    from firebase_admin import credentials, firestore as _fs

    if not firebase_admin._apps:
        if os.path.exists(_FIREBASE_CRED):
            firebase_admin.initialize_app(credentials.Certificate(_FIREBASE_CRED))
            _firebase_ready = True
            print(f"[Pathway] Firebase initialised from {_FIREBASE_CRED}")
        else:
            print(
                f"[Pathway] Firebase credentials not found at {_FIREBASE_CRED}. "
                "Firestore writes will be skipped."
            )
    else:
        _firebase_ready = True
except ImportError:
    print("[Pathway] firebase-admin not installed – Firestore output disabled.")


# ---------------------------------------------------------------------------
# Input schema
# ---------------------------------------------------------------------------
class IssueInputSchema(pw.Schema):
    title: str
    description: str
    department: str
    location_address: str = pw.column_definition(default_value="")
    location_latitude: float = pw.column_definition(default_value=0.0)
    location_longitude: float = pw.column_definition(default_value=0.0)
    citizen_name: str = pw.column_definition(default_value="Anonymous")
    issue_id: str = pw.column_definition(default_value="")


# ---------------------------------------------------------------------------
# Enrichment UDFs
# ---------------------------------------------------------------------------
_HIGH_KEYWORDS = frozenset(
    {
        "emergency",
        "urgent",
        "danger",
        "flood",
        "fire",
        "collapse",
        "accident",
        "sewage",
        "overflow",
        "burst",
    }
)
_LOW_KEYWORDS = frozenset({"minor", "small", "cosmetic", "suggestion", "request"})

_DEPT_CATEGORY: dict[str, str] = {
    "pwd": "Road Infrastructure",
    "municipal": "Municipal Services",
    "water-sanitation": "Water & Sanitation",
    "traffic-police": "Traffic Management",
    "health": "Public Health",
    "electricity": "Electricity",
}
# Fallback category for department codes not in the mapping above
_CATEGORY_FALLBACK = "Other Services"


@pw.udf
def compute_severity(title: str, description: str) -> str:
    """Derive issue severity from keyword matching."""
    text = (title + " " + description).lower()
    if any(k in text for k in _HIGH_KEYWORDS):
        return "high"
    if any(k in text for k in _LOW_KEYWORDS):
        return "low"
    return "medium"


@pw.udf
def compute_category(department: str) -> str:
    """Map department code to a human-readable category."""
    return _DEPT_CATEGORY.get(department.strip().lower(), _CATEGORY_FALLBACK)


# ---------------------------------------------------------------------------
# Pathway REST input connector
# ---------------------------------------------------------------------------
PATHWAY_PORT = int(os.environ.get("PATHWAY_PORT", "8080"))

_connector_result = pw.io.http.rest_connector(
    host="0.0.0.0",
    port=PATHWAY_PORT,
    schema=IssueInputSchema,
    autocommit_duration_ms=100,
    delete_completed_queries=False,
)
# rest_connector returns (table, response_writer) in most Pathway versions
issues = _connector_result[0] if isinstance(_connector_result, tuple) else _connector_result

# ---------------------------------------------------------------------------
# Enrichment step
# ---------------------------------------------------------------------------
enriched = issues.select(
    *pw.this,
    severity=compute_severity(pw.this.title, pw.this.description),
    category=compute_category(pw.this.department),
)

# ---------------------------------------------------------------------------
# SSE broadcast helper (background thread)
# ---------------------------------------------------------------------------
# Maximum number of buffered SSE messages per connected client before back-pressure is applied
_SSE_QUEUE_SIZE = 200
_sse_queues: list[queue.Queue] = []
_sse_lock = threading.Lock()


def _broadcast(msg: str) -> None:
    with _sse_lock:
        for q in list(_sse_queues):
            try:
                q.put_nowait(msg)
            except queue.Full:
                pass


def _sse_server() -> None:
    class _Handler(BaseHTTPRequestHandler):
        def log_message(self, *_a) -> None:  # silence default access log
            pass

        def do_GET(self) -> None:
            if self.path.rstrip("/") != "/stream":
                self.send_response(404)
                self.end_headers()
                return
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            q: queue.Queue = queue.Queue(maxsize=_SSE_QUEUE_SIZE)
            with _sse_lock:
                _sse_queues.append(q)
            try:
                while True:
                    msg = q.get(timeout=30)
                    self.wfile.write(f"data: {msg}\n\n".encode())
                    self.wfile.flush()
            except Exception:
                pass
            finally:
                with _sse_lock:
                    if q in _sse_queues:
                        _sse_queues.remove(q)

    sse_port = int(os.environ.get("PATHWAY_SSE_PORT", "8081"))
    srv = ThreadingHTTPServer(("0.0.0.0", sse_port), _Handler)
    print(f"[Pathway] SSE endpoint  → http://localhost:{sse_port}/stream")
    srv.serve_forever()


threading.Thread(target=_sse_server, daemon=True).start()

# ---------------------------------------------------------------------------
# Output: subscribe and write to Firestore + SSE
# ---------------------------------------------------------------------------


def _on_change(key, row, time, is_addition: bool) -> None:
    if not is_addition:
        return

    doc = dict(row)
    doc["pathway_processed_at"] = datetime.now(timezone.utc).isoformat()

    # Firestore write
    if _firebase_ready:
        try:
            _fs.client().collection("processed_grievances").add(doc)
            print(
                f"[Pathway] ✅ Saved → Firestore | "
                f"title={doc.get('title')!r} severity={doc.get('severity')}"
            )
        except Exception as exc:
            print(f"[Pathway] ⚠️  Firestore write error: {exc}")
    else:
        print(
            f"[Pathway] 📦 Processed (no Firestore) | "
            f"title={doc.get('title')!r} severity={doc.get('severity')}"
        )

    # SSE broadcast to all connected clients
    _broadcast(json.dumps(doc))


pw.io.subscribe(enriched, _on_change)

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    sse_port = int(os.environ.get("PATHWAY_SSE_PORT", "8081"))
    print(
        f"[Pathway] Pipeline starting …\n"
        f"          REST input  → POST http://localhost:{PATHWAY_PORT}/\n"
        f"          SSE output  → http://localhost:{sse_port}/stream\n"
        f"          Firestore   → {'enabled' if _firebase_ready else 'disabled (no credentials)'}\n"
    )
    pw.run()
