import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { ClockIcon, MapPinIcon, PhoneIcon, ShieldCheckIcon } from '../common/Icons';
import { timingText } from '../../utils/formatDate';

const tel = (p = '') => `tel:${p.replace(/[^\d+]/g, '')}`;

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function TimingsContact({ heading = {}, timings = [], settings = {} }) {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <SectionTitle eyebrow={heading.eyebrow} title={heading.title} />

        <div className="contact__grid">
          <motion.div className="contact-card hours" {...rise(0)}>
            <h3 className="contact-card__title"><span className="contact-card__icon"><ClockIcon size={20} /></span>Consulting Hours</h3>
            <ul className="hours__list">
              {timings.map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                >
                  <strong>{t.day_range}</strong>
                  <span>{timingText(t)}</span>
                </motion.li>
              ))}
            </ul>
            {heading.description && (
              <p className="hours__note"><ShieldCheckIcon size={18} /> {heading.description}</p>
            )}
          </motion.div>

          <div className="contact__side">
            {settings.address && (
              <motion.div className="contact-card" {...rise(0.12)}>
                <h3 className="contact-card__title"><span className="contact-card__icon"><MapPinIcon size={20} /></span>Visit Us</h3>
                <address className="contact__address">{settings.address}</address>
              </motion.div>
            )}

            {(settings.phone || settings.emergency_phone) && (
              <motion.div className="contact-card contact-card--dark" {...rise(0.24)}>
                <h3 className="contact-card__title"><span className="contact-card__icon"><PhoneIcon size={20} /></span>Call Us</h3>
                {settings.phone && (
                  <div className="call__line">
                    <span>Reception</span>
                    <a href={tel(settings.phone)}>{settings.phone}</a>
                  </div>
                )}
                {settings.emergency_phone && (
                  <div className="call__line call__line--emergency">
                    <span>24×7 Emergency</span>
                    <a href={tel(settings.emergency_phone)}>{settings.emergency_phone}</a>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
