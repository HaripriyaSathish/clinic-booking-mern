import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, MapPinIcon, MedicalCrossIcon, PhoneIcon } from '../common/Icons';
import { timingText } from '../../utils/formatDate';

const tel = (p = '') => `tel:${p.replace(/[^\d+]/g, '')}`;

const column = (i) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
});

export default function Footer({ settings = {}, timings = [] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__glow" aria-hidden="true" />
      <div className="container footer__grid">
        <motion.div className="footer__brand" {...column(0)}>
          <Link to="/" className="footer__logo">
            <span className="footer__mark">
              {settings.logo_url ? <img src={settings.logo_url} alt="" /> : <MedicalCrossIcon size={20} />}
            </span>
            <span className="footer__name">{settings.clinic_name}</span>
          </Link>
          {settings.footer_text && <p>{settings.footer_text}</p>}
        </motion.div>

        <motion.div {...column(1)}>
          <h4 className="footer__heading">Contact</h4>
          <ul className="footer__contact">
            {settings.address && (
              <li><MapPinIcon size={18} /><span className="footer__address">{settings.address}</span></li>
            )}
            {settings.phone && (
              <li><PhoneIcon size={18} /><a href={tel(settings.phone)}>{settings.phone}</a></li>
            )}
            {settings.emergency_phone && (
              <li><ClockIcon size={18} /><a href={tel(settings.emergency_phone)}>Emergency: {settings.emergency_phone}</a></li>
            )}
          </ul>
        </motion.div>

        {timings.length > 0 && (
          <motion.div {...column(2)}>
            <h4 className="footer__heading">Consulting Hours</h4>
            <ul className="footer__hours">
              {timings.map((t) => (
                <li key={t.id}><span>{t.day_range}</span><strong>{timingText(t)}</strong></li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {year} {settings.clinic_name}. All rights reserved.</span>
          {settings.tagline && <span className="footer__tagline">{settings.tagline}</span>}
        </div>
      </div>
    </footer>
  );
}
