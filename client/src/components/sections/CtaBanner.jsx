import { motion } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { ArrowRightIcon, CheckCircleIcon, MedicalCrossIcon, PhoneIcon } from '../common/Icons';

const ease = [0.22, 1, 0.36, 1];

// Decorative crosses drifting in the background: [left %, top %, size, duration]
const CROSSES = [[6, 18, 34, 7], [88, 14, 26, 9], [14, 72, 22, 8], [80, 70, 40, 10], [50, 8, 18, 6]];

const HIGHLIGHTS = ['Book online in a minute', 'Confirmation within hours', '24×7 emergency care'];

export default function CtaBanner({ content = {}, phone }) {
  const { openBooking } = useBooking();
  if (!content.title) return null;

  // Spotlight follows the pointer (CSS custom properties, no re-render)
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section className="cta">
      <div className="container">
        <motion.div
          className="cta__panel"
          onMouseMove={onMove}
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease }}
        >
          <span className="cta__blob cta__blob--gold" aria-hidden="true" />
          <span className="cta__blob cta__blob--green" aria-hidden="true" />
          <span className="cta__spotlight" aria-hidden="true" />
          {CROSSES.map(([left, top, size, duration], i) => (
            <motion.span
              key={i}
              className="cta__cross"
              style={{ left: `${left}%`, top: `${top}%` }}
              animate={{ y: [0, -14, 0], opacity: [0.12, 0.28, 0.12] }}
              transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
              aria-hidden="true"
            >
              <MedicalCrossIcon size={size} strokeWidth={1.4} />
            </motion.span>
          ))}

          <div className="cta__content">
            <motion.h2
              className="cta__title"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
            >
              {content.title}
            </motion.h2>
            {content.description && (
              <motion.p
                className="cta__text"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.35, ease }}
              >
                {content.description}
              </motion.p>
            )}

            <motion.div
              className="cta__actions"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease }}
            >
              <button type="button" className="btn cta__btn" onClick={() => openBooking()}>
                {content.eyebrow || 'Book an Appointment'} <ArrowRightIcon size={18} />
              </button>
              {phone && (
                <a className="cta__call" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
                  <PhoneIcon size={16} /> or call {phone}
                </a>
              )}
            </motion.div>

            <ul className="cta__highlights">
              {HIGHLIGHTS.map((h, i) => (
                <motion.li
                  key={h}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.7 + i * 0.1 }}
                >
                  <CheckCircleIcon size={15} /> {h}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
