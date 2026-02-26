#!/usr/bin/env python3
"""
demo.py – Parivartan / Pathway integration demo.

Submits two test civic issues to the Pathway service and displays
the enriched/processed updates streamed back via SSE.

Usage (from the pathway-service/ directory):
    python demo.py

Prerequisites:
    - Pathway service must be running:  python main.py
"""

import json
import threading
import time
import urllib.request

PATHWAY_URL = "http://localhost:8080/"
SSE_URL = "http://localhost:8081/stream"
_ISSUE_POST_DELAY = 0.5  # seconds between sequential issue submissions

DEMO_ISSUES = [
    {
        "title": "Dangerous pothole on highway",
        "description": (
            "Emergency – large dangerous pothole causing accidents near the "
            "main junction. Several vehicles damaged this morning."
        ),
        "department": "pwd",
        "location_address": "NH-7 near Kapurthala Junction",
        "location_latitude": 31.38,
        "location_longitude": 75.37,
        "citizen_name": "Rajesh Kumar",
        "issue_id": "demo-001",
    },
    {
        "title": "Street light not working",
        "description": (
            "Minor – street light at the bus stop has been off for two days, "
            "making it dark at night."
        ),
        "department": "municipal",
        "location_address": "Bus Stand Road, Kapurthala",
        "location_latitude": 31.39,
        "location_longitude": 75.38,
        "citizen_name": "Priya Singh",
        "issue_id": "demo-002",
    },
]

_received_count = 0
_expected_count = len(DEMO_ISSUES)
_done_event = threading.Event()


def _listen_sse() -> None:
    """Connect to SSE endpoint and print enriched events as they arrive."""
    global _received_count
    print(f"[SSE] Connecting to {SSE_URL} …")
    try:
        with urllib.request.urlopen(SSE_URL, timeout=60) as resp:
            for raw_line in resp:
                line = raw_line.decode().strip()
                if not line.startswith("data: "):
                    continue
                payload = json.loads(line[6:])
                _received_count += 1
                print(
                    f"\n[SSE] ✅ Enriched issue #{_received_count} received:\n"
                    f"      title     : {payload.get('title')}\n"
                    f"      severity  : {payload.get('severity')}\n"
                    f"      category  : {payload.get('category')}\n"
                    f"      processed : {payload.get('pathway_processed_at')}\n"
                )
                if _received_count >= _expected_count:
                    _done_event.set()
    except Exception as exc:
        print(f"[SSE] Connection error: {exc}")
        _done_event.set()


def _post_issue(issue: dict) -> None:
    data = json.dumps(issue).encode()
    req = urllib.request.Request(
        PATHWAY_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"[POST] Submitted '{issue['title']}' → HTTP {resp.status}")
    except Exception as exc:
        print(f"[POST] Error submitting '{issue['title']}': {exc}")


if __name__ == "__main__":
    print("=" * 60)
    print("  Parivartan – Pathway Real-Time Processing Demo")
    print("=" * 60)
    print()
    print("Ensure the Pathway service is running:  python main.py\n")

    # Start SSE listener in background thread
    listener = threading.Thread(target=_listen_sse, daemon=True)
    listener.start()
    time.sleep(_ISSUE_POST_DELAY)  # give SSE connection a moment to establish

    # Submit demo issues sequentially
    for i, issue in enumerate(DEMO_ISSUES):
        if i > 0:
            time.sleep(_ISSUE_POST_DELAY)
        _post_issue(issue)

    # Wait up to 10 seconds for all updates to stream back
    if _done_event.wait(timeout=10):
        print("\n[Demo] All issues processed and streamed. ✅")
    else:
        print("\n[Demo] Timeout – some updates may still be processing.")

    print("[Demo] Check Firestore 'processed_grievances' collection for enriched data.")
