// src/Headings.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import api                             from './api';

export default function Headings() {
  const { domainId } = useParams();
  const navigate     = useNavigate();
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    api.get(`/domains/${domainId}/headings/`)
      .then(res => setHeadings(res.data))
      .catch(err => {
        console.error('Failed to fetch headings:', err);
        if (err.response?.status === 401) {
          navigate('/login', { replace: true });
        }
      });
  }, [domainId, navigate]);  // now all used variables are listed

  return (
    <div className="container mt-4" style={{ maxWidth: 1200 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/domains')}
        >
          ← Back to Domains
        </button>
        <h4 className="m-0">Choose a Heading</h4>
        <div style={{ width: 120 }} />
      </div>
      <ul className="list-group">
        {headings.map(h => (
          <li
            key={h.id}
            className="list-group-item"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/headings/${h.id}/sentences`)}
          >
            <strong>{h.id}.</strong> {h.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
