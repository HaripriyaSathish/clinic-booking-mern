import { Fragment, useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useBooking } from '../../context/BookingContext';
import { ArrowRightIcon, ClockIcon, ImageIcon } from '../common/Icons';

const ease = [0.22, 1, 0.36, 1];

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease },
});

// "grace." -> word "grace" (italic, green) + punctuation "." (regular)
const splitHighlight = (text = '') => {
  const m = text.match(/^(.*?)([.!?,]*)$/);
  return { word: m ? m[1] : text, punct: m ? m[2] : '' };
};

// Counts up numeric stats ("20" -> 0..20); non-numeric values like "24×7" just fade in
function StatValue({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const numeric = /^\d+$/.test(value);
  const [display, setDisplay] = useState(numeric ? '0' : value);

  useEffect(() => {
    if (!inView || !numeric) return undefined;
    const controls = animate(0, Number(value), {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, numeric, value]);

  return (
    <span ref={ref} className="hero-stat__value">
      {display}{suffix && <span className="hero-stat__suffix">{suffix}</span>}
    </span>
  );
}

export default function Hero({ hero, stats = [] }) {
  const { openBooking } = useBooking();
  const mediaRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: mediaRef, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  if (!hero) return null;

  const titleWords = (hero.title || '').split(' ');
  const { word, punct } = splitHighlight(hero.highlight_word);
  const baseDelay = 0.25;

  return (
    <section id="home" className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__grid">
        <div className="hero__content">
          {hero.badge_text && (
            <motion.span className="hero__badge" {...fadeUp(0.1)}>
              <span className="hero__badge-dot" />
              {hero.badge_text}
            </motion.span>
          )}

          <h1 className="hero__title">
            {titleWords.map((w, i) => (
              <Fragment key={`${w}-${i}`}>
                <span className="hero__word-mask">
                  <motion.span
                    className="hero__word"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: baseDelay + i * 0.08, ease }}
                  >
                    {w}
                  </motion.span>
                </span>{' '}
              </Fragment>
            ))}
            {word && (
              <span className="hero__word-mask">
                <motion.span
                  className="hero__word"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: baseDelay + titleWords.length * 0.08, ease }}
                >
                  <em className="hero__highlight">
                    {word}
                    <motion.svg
                      className="hero__underline"
                      viewBox="0 0 200 12"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <motion.path
                        d="M2 9 C 50 2, 150 2, 198 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.1, delay: 1.2, ease }}
                      />
                    </motion.svg>
                  </em>
                  {punct}
                </motion.span>
              </span>
            )}
          </h1>

          {hero.subtitle && (
            <motion.p className="hero__subtitle" {...fadeUp(0.75)}>{hero.subtitle}</motion.p>
          )}

          <motion.div className="hero__actions" {...fadeUp(0.9)}>
            {hero.primary_btn_text && (
              <button type="button" className="btn btn--primary" onClick={() => openBooking()}>
                {hero.primary_btn_text} <ArrowRightIcon size={18} />
              </button>
            )}
            {hero.secondary_btn_text && (
              <a href={hero.secondary_btn_link || '#doctors'} className="btn btn--outline">
                {hero.secondary_btn_text}
              </a>
            )}
          </motion.div>

          {stats.length > 0 && (
            <motion.div className="hero__stats" {...fadeUp(1.05)}>
              {stats.map((s, i) => (
                <motion.div
                  key={s.id}
                  className="hero-stat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.15 + i * 0.12, ease }}
                >
                  <StatValue value={s.value} suffix={s.suffix} />
                  <span className="hero-stat__label">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <motion.div
          ref={mediaRef}
          className="hero__media"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
        >
          <svg className="hero__frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <motion.rect
              x="0.5" y="0.5" width="99" height="99" rx="9" ry="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.35"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.6, ease: 'easeInOut' }}
            />
          </svg>

          <motion.div
            className="hero__image"
            initial={{ clipPath: 'inset(100% 0 0 0 round 40px)' }}
            animate={{ clipPath: 'inset(0% 0 0 0 round 40px)' }}
            transition={{ duration: 1.3, delay: 0.4, ease }}
          >
            {hero.image_url ? (
              // outer: scroll parallax (framer) · inner: slow continuous zoom + hover zoom (CSS)
              <motion.div className="hero__parallax" style={{ y: imageY, scale: 1.12 }}>
                <img className="hero__zoom" src={hero.image_url} alt="" />
              </motion.div>
            ) : (
              <div className="hero__placeholder">
                <ImageIcon size={40} />
                <span>Upload the hero image from the admin panel</span>
              </div>
            )}
          </motion.div>

          {(hero.info_title || hero.info_text) && (
            <motion.div
              className="hero__info"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: 1.3 },
                y: { duration: 5, delay: 1.3, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <span className="hero__info-icon"><ClockIcon size={20} /></span>
              <span>
                <strong>{hero.info_title}</strong>
                <small>{hero.info_text}</small>
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
