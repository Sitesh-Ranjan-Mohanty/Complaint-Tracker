import { useEffect, useState } from 'react';
import http from '../api/http';

export default function AgentDashboardPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const res = await http.get('/complaints', { params: { limit: 50 } });
      setRows(res.data.data);
    } catch {
      setError('Unable to load assigned complaints. Please verify backend connection.');
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await http.put(`/complaints/${id}/status`, { status, resolutionNotes: status === 'resolved' ? 'Issue solved by support' : undefined });
    load();
  };

  return (
    <div className="card">
      <h2>Support Agent Dashboard</h2>
      {error && <p className="error">{error}</p>}
      {rows.map((r) => (
        <div key={r.id} className="row">
          <span>#{r.id} {r.title} ({r.status})</span>
          <div>
            <button onClick={() => updateStatus(r.id, 'in_progress')}>Start</button>
            <button onClick={() => updateStatus(r.id, 'resolved')}>Resolve</button>
          </div>
        </div>
      ))}
    </div>
  );
}
