import { ClipboardList } from 'lucide-react';

export default function EmptyState({ title = 'Nothing on your list yet', message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><ClipboardList size={23} /></span>
      <h3>{title}</h3>
      <p>{message || 'A clear space to start something good.'}</p>
      {action}
    </div>
  );
}
