import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app-shell">
      <div className={`sidebar-wrap${menuOpen ? ' sidebar-open' : ''}`}>
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </div>
      {menuOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="main-column">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
