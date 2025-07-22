// src/Domains.js
import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import api                            from './api';

export default function Domains() {
  const [domains, setDomains] = useState([]);
  const [selected, setSelected] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    api.get('/domains/')
       .then(res => setDomains(res.data))
       .catch(console.error);
  }, []);  // empty deps = run once on mount

  const onChange = e => {
    const id = e.target.value;
    setSelected(id);
    if (id) nav(`/domains/${id}/headings`);
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 400 }}>
      <h4>Choose Domain</h4>
      <select className="form-select" value={selected} onChange={onChange}>
        <option value="">— Select Domain —</option>
        {domains.map(d=>(
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
    </div>
  );
}
