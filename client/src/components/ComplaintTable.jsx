import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function ComplaintTable({ rows, canDeleteComplaint, onDeleteComplaint }) {
  const showActions = typeof canDeleteComplaint === 'function' && typeof onDeleteComplaint === 'function';

  return (
    <div className="table-wrap">
      <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Description</th>
          <th>Customer</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Category</th>
          <th>Agent</th>
          <th>Created</th>
          <th>Due</th>
          {showActions ? <th>Action</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td data-label="ID"><Link to={`/complaints/${r.id}`}>#{r.id}</Link></td>
            <td data-label="Title">{r.title}</td>
            <td data-label="Description">{r.description}</td>
            <td data-label="Customer">{r.customer_name || '-'}</td>
            <td data-label="Priority">{r.priority}</td>
            <td data-label="Status"><StatusBadge status={r.status} /></td>
            <td data-label="Category">{r.category_name || '-'}</td>
            <td data-label="Agent">{r.agent_name || '-'}</td>
            <td data-label="Created">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
            <td data-label="Due">{r.due_at ? new Date(r.due_at).toLocaleString() : '-'}</td>
            {showActions ? (
              <td data-label="Action">
                {canDeleteComplaint(r) ? (
                  <button type="button" className="danger-btn" onClick={() => onDeleteComplaint(r.id)}>
                    Delete
                  </button>
                ) : (
                  '-'
                )}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}
