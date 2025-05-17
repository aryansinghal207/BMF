import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Navigation from './components/Navigation';
import AdminDashboard from './components/AdminDashboard';
import BookingPage from './components/BookingPage';
import ProfilePage from './components/ProfilePage';
import GuestPage from './components/GuestPage';

function AppRoutes() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem('isAdmin') === 'true'
  );
  const navigate = useNavigate();

  const handleLogin = (token, adminFlag) => {
    setToken(token);
    localStorage.setItem('token', token);
    setIsAdmin(adminFlag);
    localStorage.setItem('isAdmin', adminFlag);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  useEffect(() => {
    if (token) {
      navigate(isAdmin ? '/admin/dashboard' : '/booking');
    }
  }, [token, isAdmin, navigate]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        token ? (
          <Navigate to={isAdmin ? "/admin/dashboard" : "/booking"} />
        ) : (
          <GuestPage />
        )
      } />
      <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/booking"} />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to={isAdmin ? "/admin/dashboard" : "/booking"} />} />

      {/* Protected User Routes */}
      <Route
        path="/booking"
        element={
          token && !isAdmin ? (
            <>
              <Navigation isAdmin={isAdmin} onLogout={handleLogout} />
              <BookingPage token={token} />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/profile"
        element={
          token && !isAdmin ? (
            <>
              <Navigation isAdmin={isAdmin} onLogout={handleLogout} />
              <ProfilePage token={token} />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          token && isAdmin ? (
            <>
              <Navigation isAdmin={isAdmin} onLogout={handleLogout} />
              <AdminDashboard token={token} />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
