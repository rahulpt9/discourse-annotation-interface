import { useState } from 'react';
import api from './api';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/signup/', form);
      alert('Signup requested! Wait for admin approval.');
      nav('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2>Sign up</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Username"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="form-control mb-3"
          placeholder="Password"
          required
        />
        <button className="btn btn-primary w-100">Sign Up</button>
      </form>
      <p className="mt-2 text-center">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
