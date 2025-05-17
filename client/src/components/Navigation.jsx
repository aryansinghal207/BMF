import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navigation({ isAdmin, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header>
      <nav className="nav-container">
        <Link to="/" className="logo">
          Movie Booking
        </Link>
        <ul>
          {isAdmin ? (
            <li>
              <Link to="/admin/dashboard">Dashboard</Link>
            </li>
          ) : (
            <>
              <li>
                <Link to="/booking">Book Movies</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
            </>
          )}
          <li>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
        