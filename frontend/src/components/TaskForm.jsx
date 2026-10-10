import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export default function TaskForm({ task, onSubmit, onCancel, busy, error }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    dueDate: toDateInput(task?.dueDate)
  });

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate ? new Date(`${form.dueDate}T23:59:00`).toISOString() : null
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <section className="modal-card task-modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <div className="modal-heading">
          <div><span className="eyebrow">{task ? 'MAKE IT BETTER' : 'A NEW BEGINNING'}</span><h2 id="task-form-title">{task ? 'Edit task' : 'Create a task'}</h2></div>
          <button className="icon-button" onClick={onCancel} aria-label="Close dialog"><X size={18} /></button>
        </div>
        <p className="dialog-copy">Give your next step a little shape.</p>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <form className="task-form" onSubmit={submit}>
          <label className="field-label" htmlFor="task-title">Task name <span className="required">*</span>
            <input id="task-title" autoFocus required minLength="1" maxLength="160" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="What would you like to get done?" />
          </label>
          <label className="field-label" htmlFor="task-description">A few details
            <textarea id="task-description" rows="3" maxLength="5000" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Add a note to help you get started…" />
          </label>
          <div className="form-grid">
            <label className="field-label" htmlFor="task-priority">Priority
              <select id="task-priority" value={form.priority} onChange={(event) => update('priority', event.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </label>
            <label className="field-label" htmlFor="task-status">Status
              <select id="task-status" value={form.status} onChange={(event) => update('status', event.target.value)}>
                <option value="pending">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option>
              </select>
            </label>
          </div>
          <label className="field-label" htmlFor="task-due-date">Due date <span className="optional">(optional)</span>
            <input id="task-due-date" type="date" value={form.dueDate} onChange={(event) => update('dueDate', event.target.value)} />
          </label>
          <div className="dialog-actions">
            <button type="button" className="button button-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={busy || !form.title.trim()}>{busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
