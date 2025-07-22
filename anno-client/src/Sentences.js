// src/Sentences.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import api                             from './api';

// Helper to render a tagged sentence with highlights on discourse particles
function renderTaggedSentence(taggedText, particleCodes) {
  return taggedText.split(/\s+/).map((piece, idx) => {
    // each piece is "word/tag" or just "word"
    const [word, code] = piece.split('/');
    const display = code ? `${word}/${code}` : word;
    if (particleCodes.includes(code)) {
      return (
        <span
          key={idx}
          className="bg-warning px-1 rounded me-1"
          style={{ display: 'inline-block' }}
        >
          {display}
        </span>
      );
    }
    return <span key={idx}>{display} </span>;
  });
}

export default function Sentences() {
  const { headingId } = useParams();
  const navigate      = useNavigate();

  // state
  const [sentences, setSentences]       = useState([]);
  const [current, setCurrent]           = useState(null);
  const [particles, setParticles]       = useState([]);         // [{code, english}, …]
  const [annotations, setAnnotations]   = useState({});         // { tokenIndex: tag, … }
  const [editText, setEditText]         = useState('');         // full tagged string

  // Load sentences on mount / heading change
  useEffect(() => {
    api.get(`/headings/${headingId}/sentences/`)
       .then(r => setSentences(r.data))
       .catch(console.error);
  }, [headingId]);

  // Load discourse particles once
  useEffect(() => {
    api.get('/particles/')
       .then(r => setParticles(r.data))
       .catch(console.error);
  }, []);

  // When a sentence is selected, initialize editText & annotations
  useEffect(() => {
    if (!current) return;
    const base = current.newsentence || current.text;
    setEditText(base);

    // build annotations map from any existing "/tag" in the saved string
    const ann = {};
    base.split(/\s+/).forEach((piece, idx) => {
      const [ , tag] = piece.split('/');
      if (tag) ann[idx] = tag;
    });
    setAnnotations(ann);
  }, [current]);

  // Rebuild the full tagged sentence from token‑level annotations
  const applyTags = () => {
    const tokens = current.text.split(/\s+/);
    const rebuilt = tokens
      .map((w,i) => annotations[i] ? `${w}/${annotations[i]}` : w)
      .join(' ');
    setEditText(rebuilt);
  };

  // Save the edited tagged sentence back to the server
  const saveNewsentence = async () => {
    try {
      await api.patch(`/sentences/${current.id}/`, { newsentence: editText });
      // update local state
      const updated = { ...current, newsentence: editText };
      setCurrent(updated);
      setSentences(list =>
        list.map(s => (s.id === updated.id ? updated : s))
      );
      alert('Tagged sentence saved.');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  // — LIST VIEW —
  if (!current) {
    return (
      <div className="container mt-4" style={{ maxWidth: 1200 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back to Headings
          </button>
          <h4 className="m-0">Choose a Sentence</h4>
        </div>
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th style={{ width: '15%' }}>Sentence ID</th>
              <th>Original</th>
              <th>Tagged</th>
            </tr>
          </thead>
          <tbody>
            {sentences.map(s => (
              <tr
                key={s.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setCurrent(s)}
              >
                <td>{s.sentence_id || s.id}</td>
                <td>{s.text}</td>
                <td>{s.newsentence || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // — DETAIL / EDIT VIEW —
  const tokens = current.text.split(/\s+/);
  const particleCodes = particles.map(p => p.code);

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Edit Sentence {current.sentence_id || current.id}</h5>
        <button
          className="btn btn-outline-secondary"
          onClick={() => setCurrent(null)}
        >
          ← Back to List
        </button>
      </div>

      {/* Original Text */}
      <div className="mb-3">
        <label className="form-label">Original Text</label>
        <p className="form-control-plaintext"><em>{current.text}</em></p>
      </div>

      {/* Previously Tagged with highlighting */}
      <div className="mb-4">
        <label className="form-label">Previously Tagged</label>
        <p className="form-control-plaintext text-break">
          {current.newsentence
            ? renderTaggedSentence(current.newsentence, particleCodes)
            : <span className="text-muted">(no saved tags yet)</span>
          }
        </p>
      </div>

      {/* Full‑text editor */}
      <div className="mb-4">
        <label className="form-label">Edit Tagged Sentence</label>
        <textarea
          className="form-control mb-2"
          rows={3}
          value={editText}
          onChange={e => setEditText(e.target.value)}
        />
        
        <button
          className="btn btn-primary me-2"
          onClick={saveNewsentence}
        >
          Save Tagged Sentence
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrent(null)}
        >
          Cancel
        </button>
      </div>

      {/* Token‑level dropdowns */}
      <h6>Token‑Level Tags</h6>
      <table className="table">
        <thead><tr><th>Token</th><th>Tag</th></tr></thead>
        <tbody>
          {tokens.map((w,i) => (
            <tr key={i}>
              <td>{w}</td>
              <td>
                <select
                  className="form-select form-select-sm"
                  value={annotations[i] || ''}
                  onChange={e =>
                    setAnnotations(a => ({ ...a, [i]: e.target.value }))
                  }
                >
                  <option value="">—</option>
                  {particles.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.code} – {p.english}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Apply token tags into the textarea */}
      <button
        className="btn btn-outline-info"
        onClick={applyTags}
      >
        Apply Tags to Sentence
      </button>
    </div>
  );
}
