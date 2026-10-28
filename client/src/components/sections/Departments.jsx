import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { DepartmentIcon } from '../common/Icons';
import { useBooking } from '../../context/BookingContext';

const ease = [0.22, 1, 0.36, 1];

// Card rises out of a soft blur, then its contents follow one after another
const card = {
  hidden: { opacity: 0, y: 60, scale: 0.94, filter: 'blur(8px)' },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, delay: (i % 3) * 0.14 + Math.floor(i / 3) * 0.08, ease, when: 'beforeChildren', staggerChildren: 0.08 },
  }),
};
const icon = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 14 } },
};
const text = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function Departments({ heading = {}, departments = [] }) {
  const { openBooking } = useBooking();
  if (!departments.length) return null;

  return (
    <section id="departments" className="section departments">
      <div className="container">
        <SectionTitle eyebrow={heading.eyebrow} title={heading.title} description={heading.description} />

        <div className="departments__grid">
          {departments.map((d, i) => (
            <motion.article
              key={d.id}
              className="dept-card"
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              whileHover={{ y: -10 }}
              transition={{ y: { type: 'spring', stiffness: 300, damping: 20 } }}
              viewport={{ once: true, margin: '-60px' }}
            >
              <span className="dept-card__bar" aria-hidden="true" />
              <motion.span className="dept-card__icon" variants={icon}>
                <DepartmentIcon name={d.icon} size={24} strokeWidth={1.8} />
              </motion.span>
              <motion.h3 className="dept-card__title" variants={text}>{d.name}</motion.h3>
              {d.short_desc && <motion.p className="dept-card__desc" variants={text}>{d.short_desc}</motion.p>}
              <button type="button" className="dept-card__link" onClick={() => openBooking({ department_id: d.id })}>
                Book in {d.name} <span aria-hidden="true">→</span>
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
