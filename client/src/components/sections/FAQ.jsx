import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { PhoneIcon } from '../common/Icons';

const ease = [0.22, 1, 0.36, 1];
const tel = (p = '') => `tel:${p.replace(/[^\d+]/g, '')}`;

export default function FAQ({ heading = {}, faqs = [], settings = {} }) {
  const [open, setOpen] = useState(0); // first question starts open
  if (!faqs.length) return null;

  const whatsapp = settings.whatsapp || settings.phone;

  return (
    <section id="faq" className="section faq">
      <div className="container faq__grid">
        <div className="faq__intro">
          <SectionTitle eyebrow={heading.eyebrow} title={heading.title} />
          {heading.description && (
            <motion.p
              className="faq__lead"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
            >
              {heading.description}
            </motion.p>
          )}

          {(settings.phone || whatsapp) && (
            <motion.div
              className="faq__help"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
            >
              <strong>Still have questions?</strong>
              <span>Our front desk is happy to help.</span>
              <div className="faq__help-actions">
                {settings.phone && (
                  <a href={tel(settings.phone)} className="btn btn--primary"><PhoneIcon size={16} /> Call us</a>
                )}
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                    WhatsApp
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="faq__list">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.id}
                className={`faq-item ${isOpen ? 'is-open' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.07, ease }}
              >
                <button
                  type="button"
                  className="faq-item__q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${f.id}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="faq-item__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="faq-item__text">{f.question}</span>
                  <span className="faq-item__toggle" aria-hidden="true"><i /><i /></span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${f.id}`}
                      className="faq-item__a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <p>{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
