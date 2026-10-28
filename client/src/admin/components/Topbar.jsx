import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ExternalIcon, LogoutIcon, MenuIcon } from '../../components/common/Icons';

export default function Topbar({ onMenu }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="a-topbar">
      <button type="button" className="a-topbar__menu" onClick={onMenu} aria-label="Toggle menu">
        <MenuIcon />
      </button>
      <div className="a-topbar__actions">
        <a href="/" target="_blank" rel="noreferrer" className="a-btn a-btn--ghost">
          <ExternalIcon size={16} /> View website
        </a>
        <button type="button" className="a-btn a-btn--ghost" onClick={signOut}>
          <LogoutIcon size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
