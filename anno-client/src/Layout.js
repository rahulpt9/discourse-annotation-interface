// src/Layout.js

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';
import { isLoggedIn } from './auth';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  const handleLogout = () => {
    // 1) Wipe tokens
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    // 2) Remove axios header
    delete api.defaults.headers.common.Authorization;
    // 3) Redirect to login
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to={ loggedIn ? "/domains" : "/login" }>
            Discourse Particle Annotation Interface
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              {loggedIn ? (
                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <>
                  <li className="nav-item me-2">
                    <Link className="btn btn-outline-primary" to="/login">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="btn btn-primary" to="/signup">
                      Signup
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
