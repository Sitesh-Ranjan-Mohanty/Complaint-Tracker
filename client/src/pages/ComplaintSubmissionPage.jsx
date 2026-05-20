import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';

export default function ComplaintSubmissionPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', categoryId: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    http.get('/meta/categories').then((res) => setCategories(res.data)).catch(() => {
      setError('Unable to load categories. Please start backend server on port 5000.');
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'attachments' && v) fd.append(k, v);
      });
      if (form.attachments) {
        Array.from(form.attachments).forEach((file) => fd.append('attachments', file));
      }
      await http.post('/complaints', fd);
      setMessage('Complaint submitted successfully');
      setForm({ title: '', description: '', priority: 'medium', categoryId: '' });
      setTimeout(() => navigate('/track?created=1'), 500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="card">
      <h2>Complaint Submission</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <input required minLength={5} placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <textarea required minLength={10} placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
        <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
          <option value="">Select Category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="file" multiple onChange={(e) => setForm((p) => ({ ...p, attachments: e.target.files }))} />
        <button type="submit">Create Complaint</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
