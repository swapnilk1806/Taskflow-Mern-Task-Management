import { BarChart3, CheckSquare, CircleHelp, LayoutDashboard, ListTodo } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tasks', label: 'All tasks', icon: ListTodo }
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/dashboard" onClick={onNavigate}>
        <span className="brand-mark"><CheckSquare size={19} strokeWidth={2.6} /></span>
        <span>task<span className="brand-accent">flow</span></span>
      </NavLink>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
            {label === 'All tasks' && <span className="nav-arrow">›</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-note">
        <span className="note-icon"><BarChart3 size={16} /></span>
        <strong>Small steps add up.</strong>
        <p>Keep your focus on what matters today.</p>
      </div>
      <div className="sidebar-foot"><CircleHelp size={14} /> Your personal workspace</div>
    </aside>
  );
}
