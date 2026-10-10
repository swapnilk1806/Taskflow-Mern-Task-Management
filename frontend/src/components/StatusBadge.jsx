const statusLabels = {
  pending: 'To do',
  'in-progress': 'In progress',
  completed: 'Completed'
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{statusLabels[status] || status}</span>;
}
