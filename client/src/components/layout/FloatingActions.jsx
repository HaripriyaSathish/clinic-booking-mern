import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PhoneIcon } from '../common/Icons';

const WhatsAppIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.73 1.2h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.22 8.23z" />
  </svg>
);

const digits = (p = '') => p.replace(/\D/g, '');

// Fixed bottom-right Call + WhatsApp buttons; numbers come from Site Settings
export default function FloatingActions({ settings = {} }) {
  const [visible, setVisible] = useState(false);

  // Slide in after the hero animation so they don't compete with it
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const phone = settings.phone;
  const whatsapp = settings.whatsapp || settings.phone;
  if (!phone && !whatsapp) return null;

  const message = encodeURIComponent(`Hello ${settings.clinic_name || ''}, I'd like to book an appointment.`);
  const actions = [
    whatsapp && {
      key: 'whatsapp',
      label: 'Chat on WhatsApp',
      href: `https://wa.me/${digits(whatsapp)}?text=${message}`,
      icon: <WhatsAppIcon size={26} />,
      external: true,
    },
    phone && {
      key: 'call',
      label: `Call ${phone}`,
      href: `tel:${phone.replace(/[^\d+]/g, '')}`,
      icon: <PhoneIcon size={22} />,
    },
  ].filter(Boolean);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fab" role="group" aria-label="Contact us">
          {actions.map((a, i) => (
            <motion.a
              key={a.key}
              href={a.href}
              className={`fab__btn fab__btn--${a.key}`}
              aria-label={a.label}
              target={a.external ? '_blank' : undefined}
              rel={a.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, scale: 0.4, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20, delay: i * 0.12 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <span className="fab__ring" aria-hidden="true" />
              {a.icon}
              <span className="fab__label">{a.label}</span>
            </motion.a>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
