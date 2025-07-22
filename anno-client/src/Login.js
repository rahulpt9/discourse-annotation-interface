// src/Login.js
import React, { useState } from 'react';
import { useNavigate }      from 'react-router-dom';
import api                   from './api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // 1) Call login endpoint
      const { data } = await api.post('/login/', { username, password });
      
      // 2) Store token and attach to future requests
      localStorage.setItem('access', data.access);

      // 3) Now navigate
      navigate('/domains');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: '3rem' }}>
      <h3>Login</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Username</label>
          <input 
            type="username" 
            className="form-control"
            value={username}
            onChange={e=>setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input 
            type="password" 
            className="form-control"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Log In
        </button>
      </form>
    </div>
  );
}
