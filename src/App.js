import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import FAQPage from './pages/FAQPage';
import CheckStatusPage from './pages/CheckStatusPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/faq" element={
              <>
                <Header />
              <main className="main-content">
                <FAQPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/login" element={
            <>
              <Header />
              <main className="main-content">
                <LoginPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/check-status" element={
            <>
              <Header />
              <main className="main-content">
                <CheckStatusPage />
              </main>
              <Footer />
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Header />
              <main className="main-content">
                <Dashboard />
              </main>
              <Footer />
            </>
          } />
          <Route path="/staff" element={
            <>
              <Header />
              <main className="main-content">
                <StaffDashboard />
              </main>
              <Footer />
            </>
          } />
          <Route path="/admin" element={
            <>
              <Header />
              <main className="main-content">
                <AdminDashboard />
              </main>
              <Footer />
            </>
          } />
          <Route path="/department/:departmentCode" element={
            <>
              <Header />
              <main className="main-content">
                <ErrorBoundary>
                  <DepartmentDashboard />
                </ErrorBoundary>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;