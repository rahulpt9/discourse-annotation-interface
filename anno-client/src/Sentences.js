// src/Sentences.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';

/** Highlight tokens that have /TAG */
function renderTaggedSentence(taggedText = '', particleCodes = []) {
  return taggedText.split(/\s+/).map((piece, idx) => {
    const [word, code] = piece.split('/');
    const show = code ? `${word}/${code}` : word;
    if (code && particleCodes.includes(code)) {
      return (
        <span
          key={idx}
          className="bg-warning px-1 rounded me-1 d-inline-block"
        >
          {show}
        </span>
      );
    }
    return <span key={idx}>{show} </span>;
  });
}

export default function Sentences() {
  const { headingId } = useParams();
  const navigate      = useNavigate();

  const [sentences, setSentences]     = useState([]);
  const [current, setCurrent]         = useState(null);
  const [particles, setParticles]     = useState([]);   // [{code, english}]
  const [annotations, setAnnotations] = useState({});   // { idx: tag }
  const [editText, setEditText]       = useState('');

  /** particle code array for quick check */
  const particleCodes = particles.map(p => p.code);

  /** Load sentences for this heading */
  const loadSentences = useCallback(() => {
    api.get(`/headings/${headingId}/sentences/`)
      .then(r => setSentences(r.data))
      .catch(console.error);
  }, [headingId]);

  /** initial loads */
  useEffect(loadSentences, [loadSentences]);

  useEffect(() => {
    api.get('/particles/')
      .then(r => setParticles(r.data))
      .catch(console.error);
  }, []);

  /** initialize detail state on open */
  useEffect(() => {
    if (!current) return;
    const base = current.newsentence || current.text;
    setEditText(base);

    const ann = {};
    base.split(/\s+/).forEach((piece, i) => {
      const [, tag] = piece.split('/');
      if (tag) ann[i] = tag;
    });
    setAnnotations(ann);
  }, [current]);

  /** claim sentence then open */
  const openSentence = async (s) => {
    // If locked by someone else, stop.
    if (s.locked_by && !s.locked_by_me) {
      alert('This sentence is locked by another user.');
      return;
    }
    // If not locked, claim it.
    if (!s.locked_by) {
      try {
        await api.post(`/sentences/${s.id}/claim/`);
        // refresh list to get updated lock info
        await loadSentences();
        // find updated version
        const updated = sentences.find(x => x.id === s.id) || s;
        setCurrent(updated);
        return;
      } catch (e) {
        alert('Could not claim this sentence.');
        return;
      }
    }
    // Already mine
    setCurrent(s);
  };

  /** Apply dropdown tags into textarea */
  const applyTags = () => {
    const tokens  = current.text.split(/\s+/);
    const rebuilt = tokens
      .map((w, i) => annotations[i] ? `${w}/${annotations[i]}` : w)
      .join(' ');
    setEditText(rebuilt);
  };

  /** Save tagged sentence */
  const saveNewsentence = async () => {
    try {
      await api.patch(`/sentences/${current.id}/`, { newsentence: editText });
      // local update
      const updated = { ...current, newsentence: editText };
      setCurrent(updated);
      setSentences(list => list.map(s => (s.id === updated.id ? updated : s)));
      alert('Tagged sentence saved.');
      // Optionally reload to be 100% synced
      loadSentences();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  /** Optionally let user release (if you ever need it) */

  // ---------------- LIST VIEW ----------------
  if (!current) {
    // keep tagged ones in place but make sure sorted by sentence_id or id
    const sorted = [...sentences].sort((a, b) => {
      const aid = a.sentence_id || String(a.id);
      const bid = b.sentence_id || String(b.id);
      return aid.localeCompare(bid);
    });

    return (
      <div className="container mt-4" style={{ maxWidth: 1200 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            ← Back to Headings
          </button>
          <h4 className="m-0">Choose a Sentence</h4>
        </div>

        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th style={{ width: '12%' }}>Sentence ID</th>
              <th>Original</th>
              <th>Tagged</th>
              <th style={{ width: '12%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(s => {
              const mine   = s.locked_by_me;
              const locked = s.locked_by && !mine;
              return (
                <tr key={s.id}>
                  <td>{s.sentence_id || s.id}</td>
                  <td>{s.text}</td>
                  <td className="text-break">
                    {s.newsentence
                      ? renderTaggedSentence(s.newsentence, particleCodes)
                      : '—'}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${mine ? 'btn-success' : 'btn-primary'}`}
                      disabled={locked}
                      onClick={() => openSentence(s)}
                    >
                      {locked ? 'Locked' : mine ? 'Resume' : 'Annotate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ---------------- DETAIL / EDIT VIEW ----------------
  const tokens = current.text.split(/\s+/);

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Edit Sentence {current.sentence_id || current.id}</h5>
        <button className="btn btn-outline-secondary" onClick={() => setCurrent(null)}>
          ← Back to List
        </button>
      </div>

      {/* Original */}
      <div className="mb-3">
        <label className="form-label">Original Text</label>
        <p className="form-control-plaintext"><em>{current.text}</em></p>
      </div>

      {/* Previously saved (highlighted) */}
      <div className="mb-3">
        <label className="form-label">Previously Tagged</label>
        <p className="form-control-plaintext text-break">
          {current.newsentence
            ? renderTaggedSentence(current.newsentence, particleCodes)
            : <span className="text-muted">(no saved tags yet)</span>}
        </p>
      </div>

      {/* Editable textarea + highlighted preview */}
      <div className="mb-4">
        <label className="form-label">Edit Tagged Sentence</label>
        <textarea
          className="form-control mb-2"
          rows={3}
          value={editText}
          onChange={e => setEditText(e.target.value)}
        />
        <div className="small mb-2">
          <strong>Preview: </strong>
          <span className="text-break">
            {renderTaggedSentence(editText, particleCodes)}
          </span>
        </div>

        <button className="btn btn-primary me-2" onClick={saveNewsentence}>
          Save Tagged Sentence
        </button>
        <button className="btn btn-secondary" onClick={() => setCurrent(null)}>
          Cancel
        </button>
      </div>

      {/* Token-level selection */}
      <h6>Token‑Level Tags</h6>
      <table className="table">
        <thead>
          <tr><th>Token</th><th>Tag</th></tr>
        </thead>
        <tbody>
          {tokens.map((w, i) => (
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
                      {p.code} – {p.english}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-outline-info" onClick={applyTags}>
        Apply Tags to Sentence
      </button>
    </div>
  );
}
