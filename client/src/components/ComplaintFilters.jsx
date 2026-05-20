const defaultFilters = { status: '', priority: '', categoryId: '', assignedAgentId: '', search: '' };

export default function ComplaintFilters({ filters, setFilters, categories, agents }) {
  return (
    <div className="filters">
      <input
        value={filters.search}
        onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
        placeholder="Search title or description"
      />
      <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
        <option value="">All Status</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
        <option value="overdue">Overdue</option>
      </select>
      <select value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}>
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <select value={filters.categoryId} onChange={(e) => setFilters((p) => ({ ...p, categoryId: e.target.value }))}>
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select value={filters.assignedAgentId} onChange={(e) => setFilters((p) => ({ ...p, assignedAgentId: e.target.value }))}>
        <option value="">All Agents</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      <button type="button" onClick={() => setFilters(defaultFilters)}>Reset Filters</button>
    </div>
  );
}
