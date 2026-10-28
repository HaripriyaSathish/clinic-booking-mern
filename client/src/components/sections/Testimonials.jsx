import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { ChevronIcon, QuoteIcon, StarIcon } from '../common/Icons';

const initials = (name = '') => name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Auto-advancing carousel: two stories at a time on desktop, one on mobile
export default function Testimonials({ heading = {}, testimonials = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  useEffect(() => {
    if (paused || count < 2) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);

  if (!count) return null;
  const visible = count === 1 ? [testimonials[0]] : [testimonials[index], testimonials[(index + 1) % count]];
  const go = (step) => setIndex((i) => (i + step + count) % count);

  return (
    <section id="testimonials" className="section testimonials">
      <div className="container">
        <SectionTitle eyebrow={heading.eyebrow} title={heading.title} description={heading.description} />

        <div className="testimonials__stage" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((t, slot) => (
              <motion.figure
                key={`${t.id}-${slot}`}
                className={`quote-card ${slot === 1 ? 'quote-card--second' : ''}`}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.6, delay: slot * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <QuoteIcon size={30} className="quote-card__mark" />
                <div className="quote-card__stars" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon key={i} size={16} className={i < t.rating ? 'is-on' : ''} />
                  ))}
                </div>
                <blockquote>{t.message}</blockquote>
                <figcaption>
                  {t.photo_url ? <img src={t.photo_url} alt="" /> : <span className="quote-card__avatar">{initials(t.patient_name)}</span>}
                  <span>
                    <strong>{t.patient_name}</strong>
                    {t.location && <small>{t.location}</small>}
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>

        {count > 2 && (
          <div className="testimonials__nav">
            <button type="button" onClick={() => go(-1)} aria-label="Previous story"><ChevronIcon dir="left" size={20} /></button>
            <div className="testimonials__dots">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  className={i === index ? 'is-active' : ''}
                  onClick={() => setIndex(i)}
                  aria-label={`Show story ${i + 1}`}
                />
              ))}
            </div>
            <button type="button" onClick={() => go(1)} aria-label="Next story"><ChevronIcon size={20} /></button>
          </div>
        )}
      </div>
    </section>
  );
}
