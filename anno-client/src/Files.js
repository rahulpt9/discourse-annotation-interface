// src/Files.js
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api                      from './api';

export default function Files() {
  const { domainId } = useParams();
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/domains/${domainId}/files/`)
       .then(res => setFiles(res.data))
       .catch(console.error);
  }, [domainId]);

  const chooseFile = fileId => {
    navigate(`/files/${fileId}/sentences`);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3>Files in Domain</h3>
      <select
        className="form-select"
        onChange={e => chooseFile(e.target.value)}
        defaultValue=""
      >
        <option value="">— select file —</option>
        {files.map(f => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );
}
