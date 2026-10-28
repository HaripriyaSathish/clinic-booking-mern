import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className={`a-shell ${navOpen ? 'a-shell--nav-open' : ''}`}>
      <Sidebar onNavigate={() => setNavOpen(false)} />
      <div className="a-shell__backdrop" onClick={() => setNavOpen(false)} />
      <div className="a-main">
        <Topbar onMenu={() => setNavOpen((o) => !o)} />
        <div className="a-content"><Outlet /></div>
      </div>
    </div>
  );
}
