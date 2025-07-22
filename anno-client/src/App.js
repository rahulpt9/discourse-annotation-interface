// src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import { isLoggedIn } from './auth';

import Layout    from './Layout';
import Signup    from './Signup';
import Login     from './Login';
import Domains   from './Domains';
import Headings  from './Headings';
import Sentences from './Sentences';

export default function App() {
  // Rehydrate axios from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login"  element={<Login  />} />

          <Route
            path="/domains"
            element={
              isLoggedIn() ? <Domains /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/domains/:domainId/headings"
            element={
              isLoggedIn() ? <Headings /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/headings/:headingId/sentences"
            element={
              isLoggedIn() ? <Sentences /> : <Navigate to="/login" replace />
            }
          />

          {/* anything else → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
