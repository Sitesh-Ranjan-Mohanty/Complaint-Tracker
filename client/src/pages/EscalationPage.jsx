import { useEffect, useState } from 'react';
import http from '../api/http';

export default function EscalationPage() {
  const [rows, setRows] = useState([]);
  const [reason, setReason] = useState('Needs urgent escalation');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const res = await http.get('/complaints', { params: { status: 'overdue', limit: 50 } });
      setRows(res.data.data);
    } catch {
      setError('Unable to load escalations. Please verify backend connection.');
    }
  };

  useEffect(() => { load(); }, []);

  const escalate = async (id) => {
    await http.post(`/complaints/${id}/escalate`, { reason });
    load();
  };

  return (
    <div className="card">
      <h2>Escalation Management</h2>
      {error && <p className="error">{error}</p>}
      <input value={reason} onChange={(e) => setReason(e.target.value)} />
      {rows.length === 0 ? <p>No overdue complaints.</p> : rows.map((r) => (
        <div className="row" key={r.id}>
          <span>#{r.id} {r.title}</span>
          <button onClick={() => escalate(r.id)}>Escalate</button>
        </div>
      ))}
    </div>
  );
}
