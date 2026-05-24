import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import http from '../api/http';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState('');

  const load = async () => {
    const res = await http.get(`/complaints/${id}`);
    setData(res.data);
  };

  useEffect(() => { load(); }, [id]);

  const addComment = async () => {
    await http.post(`/complaints/${id}/comment`, { comment });
    setComment('');
    load();
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>Complaint #{data.complaint.id}</h2>
      <p><strong>Customer Complaint No:</strong> {data.complaint.customer_complaint_no || '-'}</p>
      <p><strong>{data.complaint.title}</strong></p>
      <p>{data.complaint.description}</p>
      <h3>Comments</h3>
      {data.comments.map((c) => <p key={c.id}>[{c.role}] {c.name}: {c.comment}</p>)}
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comment" />
      <button onClick={addComment}>Post Comment</button>
    </div>
  );
}
