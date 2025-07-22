// src/api.js

import axios from 'axios';

// You can also wire this to an env var, e.g. process.env.REACT_APP_API_URL
const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach the latest access token from localStorage on every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
