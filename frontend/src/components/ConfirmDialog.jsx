import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, children, tone = 'danger' }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="modal-heading">
          <span className={`dialog-icon ${tone}`}><AlertTriangle size={20} /></span>
          <button className="icon-button" onClick={onCancel} aria-label="Close dialog"><X size={18} /></button>
        </div>
        <h2 id="dialog-title">{title}</h2>
        {message && <p className="dialog-copy">{message}</p>}
        {children}
        {!children && (
          <div className="dialog-actions">
            <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>
            <button type="button" className={`button ${tone === 'danger' ? 'button-danger' : 'button-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
          </div>
        )}
      </section>
    </div>
  );
}
