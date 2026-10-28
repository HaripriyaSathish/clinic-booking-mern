import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { DepartmentIcon } from '../common/Icons';

const card = {
  hidden: { opacity: 0, y: 40 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: (i % 3) * 0.12, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Services({ heading = {}, services = [] }) {
  if (!services.length) return null;
  return (
    <section id="facilities" className="section services">
      <div className="container">
        <SectionTitle eyebrow={heading.eyebrow} title={heading.title} description={heading.description} />
        <div className="services__grid">
          {services.map((s, i) => (
            <motion.article
              key={s.id}
              className="service-card"
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              <div className="service-card__media">
                {s.image_url ? <img src={s.image_url} alt={s.title} loading="lazy" /> : <span className="service-card__blank" />}
              </div>
              <span className="service-card__icon"><DepartmentIcon name={s.icon} size={22} strokeWidth={1.8} /></span>
              <div className="service-card__body">
                <h3>{s.title}</h3>
                {s.description && <p>{s.description}</p>}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
