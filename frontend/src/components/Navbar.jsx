import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={onMenuClick}>
        <Menu size={20} />
      </button>
      <div className="topbar-greeting"><span className="greeting-dot" /> Your space, your pace</div>
      <div className="topbar-actions">
        <span className="topbar-divider" />
        <div className="user-summary">
          <span className="avatar">{initial}</span>
          <span className="user-name">{user?.name}</span>
        </div>
        <button className="icon-button logout-button" onClick={logout} aria-label="Log out" title="Log out">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
