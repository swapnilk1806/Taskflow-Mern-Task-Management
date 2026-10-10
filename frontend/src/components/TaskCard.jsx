import { CalendarDays, Check, Circle, Clock3, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

const priorities = {
  high: { label: 'High priority', className: 'priority-high' },
  medium: { label: 'Medium priority', className: 'priority-medium' },
  low: { label: 'Low priority', className: 'priority-low' }
};

function formatDueDate(value) {
  if (!value) return null;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const priority = priorities[task.priority] || priorities.medium;
  const isDone = task.status === 'completed';

  return (
    <article className={`task-card${isDone ? ' task-done' : ''}`}>
      <button className={`task-check${isDone ? ' checked' : ''}`} onClick={() => onStatusChange(task, isDone ? 'pending' : 'completed')} aria-label={isDone ? 'Mark task as pending' : 'Mark task as completed'}>
        {isDone ? <Check size={14} /> : <Circle size={16} />}
      </button>
      <div className="task-card-main">
        <button className="task-title-button" onClick={() => onView(task)}>{task.title}</button>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <StatusBadge status={task.status} />
          <span className={`priority-dot ${priority.className}`}><span />{priority.label}</span>
          {task.dueDate && <span className="due-date"><CalendarDays size={13} />{formatDueDate(task.dueDate)}</span>}
        </div>
      </div>
      <div className="task-menu-wrap">
        <button className="icon-button task-more" aria-label={`Actions for ${task.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={19} /></button>
        {menuOpen && (
          <div className="task-menu" role="menu">
            <button role="menuitem" onClick={() => { setMenuOpen(false); onView(task); }}><Clock3 size={15} />View details</button>
            <button role="menuitem" onClick={() => { setMenuOpen(false); onEdit(task); }}><Pencil size={15} />Edit task</button>
            <button role="menuitem" className="menu-danger" onClick={() => { setMenuOpen(false); onDelete(task); }}><Trash2 size={15} />Delete task</button>
          </div>
        )}
      </div>
    </article>
  );
}
