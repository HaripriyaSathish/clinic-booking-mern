import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { ChevronIcon, CloseIcon } from '../common/Icons';

export default function Gallery({ heading = {}, gallery = [] }) {
  const [open, setOpen] = useState(null); // index of the photo shown in the lightbox

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, gallery.length]);

  if (!gallery.length) return null;
  const current = open !== null ? gallery[open] : null;

  return (
    <section id="gallery" className="section gallery">
      <div className="container">
        <SectionTitle eyebrow={heading.eyebrow} title={heading.title} description={heading.description} />
        <div className="gallery__grid">
          {gallery.map((g, i) => (
            <motion.button
              type="button"
              key={g.id}
              className="gallery__item"
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={g.image_url} alt={g.title || ''} loading="lazy" />
              {g.title && <span className="gallery__caption">{g.title}</span>}
            </motion.button>
          ))}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {current && (
            <motion.div
              className="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setOpen(null)}
            >
              <button type="button" className="lightbox__close" onClick={() => setOpen(null)} aria-label="Close"><CloseIcon /></button>
              <button type="button" className="lightbox__arrow lightbox__arrow--left" onClick={() => setOpen((i) => (i - 1 + gallery.length) % gallery.length)} aria-label="Previous photo">
                <ChevronIcon dir="left" size={26} />
              </button>
              <motion.figure key={current.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
                <img src={current.image_url} alt={current.title || ''} />
                {current.title && <figcaption>{current.title}</figcaption>}
              </motion.figure>
              <button type="button" className="lightbox__arrow lightbox__arrow--right" onClick={() => setOpen((i) => (i + 1) % gallery.length)} aria-label="Next photo">
                <ChevronIcon size={26} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
