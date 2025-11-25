import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import LoginForm from './components/admin/LoginForm';
import Register from './pages/Register';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import AcceptOffer from './pages/AcceptOffer';
import CandidateDocumentUpload from './pages/CandidateDocumentUpload';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/accept-offer/:id" element={<AcceptOffer />} />
            {/* Document upload - supports both ID and email-based access */}
            <Route path="/upload-documents/:selectedCandidateId?" element={<CandidateDocumentUpload />} />
            <Route path="/upload-documents" element={<CandidateDocumentUpload />} />
            
            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<SuperAdmin />} />
            
            {/* Admin Login Route */}
            <Route
              path="/admin/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* Redirect /admin to /admin/login if not authenticated */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
