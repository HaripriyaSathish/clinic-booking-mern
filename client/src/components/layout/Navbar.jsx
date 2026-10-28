import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { CloseIcon, MedicalCrossIcon, MenuIcon, PhoneIcon } from '../common/Icons';

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Departments', href: '#departments' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'Timings & Contact', href: '#contact' },
];

// On the homepage links are in-page anchors; on other pages they go back to "/#section"
const NavItem = ({ href, isHome, ...rest }) =>
  isHome ? <a href={href} {...rest} /> : <Link to={`/${href}`} {...rest} />;

export default function Navbar({ settings = {} }) {
  const { openBooking } = useBooking();
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(pathname.startsWith('/doctors') ? '#doctors' : '#home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the link for the section currently in view
  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, '')}` : undefined;

  const book = () => {
    setMenuOpen(false);
    openBooking();
  };

  return (
    <motion.header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container navbar__inner">
        <NavItem href="#home" isHome={isHome} className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand__mark">
            {settings.logo_url
              ? <img src={settings.logo_url} alt="" />
              : <MedicalCrossIcon size={24} />}
          </span>
          <span className="brand__text">
            <span className="brand__name">{settings.clinic_name}</span>
            {settings.tagline && <span className="brand__tagline">{settings.tagline}</span>}
          </span>
        </NavItem>

        <nav className="navbar__links" aria-label="Main">
          {LINKS.map((l) => (
            <NavItem key={l.href} href={l.href} isHome={isHome} className={`navbar__link ${active === l.href ? 'is-active' : ''}`}>
              {l.label}
            </NavItem>
          ))}
        </nav>

        <div className="navbar__actions">
          {settings.phone && (
            <a href={phoneHref} className="navbar__phone">
              <PhoneIcon size={18} /> {settings.phone}
            </a>
          )}
          <button type="button" className="btn btn--primary navbar__cta" onClick={book}>
            Book Appointment
          </button>
          <button
            type="button"
            className="navbar__toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="navbar__mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container navbar__mobile-inner">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <NavItem href={l.href} isHome={isHome} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </NavItem>
                </motion.div>
              ))}
              {settings.phone && (
                <a href={phoneHref} className="navbar__phone"><PhoneIcon size={18} /> {settings.phone}</a>
              )}
              <button type="button" className="btn btn--primary" onClick={book}>Book Appointment</button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
