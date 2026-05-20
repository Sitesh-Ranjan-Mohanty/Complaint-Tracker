import { useEffect, useState } from 'react';
import http from '../api/http';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    http.get('/dashboard/admin').then((res) => setStats(res.data)).catch(() => {
      setError('Unable to load analytics. Please verify backend connection.');
    });
  }, []);

  if (error) return <div className="card"><p className="error">{error}</p></div>;
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>Admin Analytics</h2>
      <p>Pending: {stats.counts.pending || 0}</p>
      <p>Resolved: {stats.counts.resolved || 0}</p>
      <p>Overdue: {stats.counts.overdue || 0}</p>
      <h3>By Priority</h3>
      {stats.byPriority.map((p) => <p key={p.priority}>{p.priority}: {p.count}</p>)}
      <h3>Agent Load</h3>
      {stats.byAgent.map((a) => <p key={a.agent_name}>{a.agent_name}: {a.assigned_count}</p>)}
    </div>
  );
}
