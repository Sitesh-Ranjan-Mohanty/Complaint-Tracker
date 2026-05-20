import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import http from '../api/http';
import ComplaintFilters from '../components/ComplaintFilters';
import ComplaintTable from '../components/ComplaintTable';

export default function TrackingPage() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', categoryId: '', assignedAgentId: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const limit = 1000;
  const createdMessage = new URLSearchParams(location.search).get('created') === '1';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== ''),
      );
      const res = await http.get('/complaints', { params: { ...filteredParams, page: 1, limit } });
      setRows(res.data.data);
    } catch {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.status, filters.priority, filters.categoryId, filters.assignedAgentId, filters.search]);

  useEffect(() => {
    Promise.all([http.get('/meta/categories'), http.get('/meta/agents')])
      .then(([c, a]) => {
        setCategories(c.data);
        setAgents(a.data);
      })
      .catch(() => {
        setError('Unable to load metadata. Please verify backend server is running.');
      });
  }, []);

  return (
    <div className="card">
      <h2>Complaint Tracking</h2>
      {createdMessage && <p className="success">Complaint created and added to tracker.</p>}
      <ComplaintFilters filters={filters} setFilters={setFilters} categories={categories} agents={agents} />
      {error && <p className="error">{error}</p>}
      {loading ? <p className="muted">Loading complaints...</p> : null}
      {!loading && rows.length === 0 ? <p className="muted">No complaints found for selected filters.</p> : null}
      {!loading && rows.length > 0 ? <ComplaintTable rows={rows} /> : null}
    </div>
  );
}
