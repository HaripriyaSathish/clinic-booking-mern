import { NavLink } from 'react-router-dom';
import {
  BuildingIcon, CalendarIcon, ClockIcon, DepartmentIcon, GridIcon, HelpIcon, ImageIcon,
  LayoutIcon, MailIcon, MedicalCrossIcon, QuoteIcon, SlidersIcon,
} from '../../components/common/Icons';

const Dept = (name) => (p) => <DepartmentIcon name={name} {...p} />;

// `ready: false` pages are placeholders until that section's design is built
export const ADMIN_NAV = [
  { group: 'Overview', items: [
    { to: '/admin', label: 'Dashboard', icon: GridIcon, end: true, ready: true },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarIcon },
    { to: '/admin/messages', label: 'Messages', icon: MailIcon },
  ] },
  { group: 'Website sections', items: [
    // listed in the same order as the sections appear on the homepage
    { to: '/admin/settings', label: 'Navbar & Site Settings', icon: SlidersIcon, ready: true },
    { to: '/admin/hero', label: 'Hero & Stats', icon: LayoutIcon, ready: true },
    { to: '/admin/departments', label: 'Departments', icon: Dept('heart-pulse'), ready: true },
    { to: '/admin/doctors', label: 'Doctors & Schedules', icon: Dept('stethoscope'), ready: true },
    { to: '/admin/services', label: 'Facilities', icon: BuildingIcon, ready: true },
    { to: '/admin/testimonials', label: 'Patient Stories', icon: QuoteIcon, ready: true },
    { to: '/admin/gallery', label: 'Gallery', icon: ImageIcon, ready: true },
    { to: '/admin/timings', label: 'Timings, Contact & Banner', icon: ClockIcon, ready: true },
    { to: '/admin/faqs', label: 'FAQs', icon: HelpIcon, ready: true },
  ] },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="a-sidebar">
      <div className="a-sidebar__brand">
        <span className="a-sidebar__mark"><MedicalCrossIcon size={20} /></span>
        <div>
          <strong>Admin Panel</strong>
          <small>Website manager</small>
        </div>
      </div>
      <nav className="a-sidebar__nav">
        {ADMIN_NAV.map((g) => (
          <div key={g.group} className="a-sidebar__group">
            <span className="a-sidebar__group-label">{g.group}</span>
            {g.items.map(({ to, label, icon: Icon, end, ready }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) => `a-sidebar__link ${isActive ? 'is-active' : ''}`}
              >
                <span className="a-sidebar__icon"><Icon size={18} /></span>
                <span className="a-sidebar__label">{label}</span>
                {!ready && <span className="a-sidebar__soon">soon</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
