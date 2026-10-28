import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionTitle from '../common/SectionTitle';
import { ArrowRightIcon, CalendarIcon, DepartmentIcon } from '../common/Icons';
import DoctorPhoto from '../doctors/DoctorPhoto';
import { useBooking } from '../../context/BookingContext';

const card = {
  hidden: { opacity: 0, y: 50 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Doctors({ heading = {}, doctors = [] }) {
  const { openBooking } = useBooking();
  if (!doctors.length) return null;

  return (
    <section id="doctors" className="section doctors">
      <div className="container">
        <SectionTitle eyebrow={heading.eyebrow} title={heading.title} description={heading.description}>
          <Link to="/doctors" className="link-arrow">
            View all doctors <ArrowRightIcon size={18} />
          </Link>
        </SectionTitle>

        <div className="doctors__grid">
          {doctors.map((d, i) => (
            <motion.article
              key={d.id}
              className="doctor-card"
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              <div className="doctor-card__media">
                <DoctorPhoto doctor={d} />
                {d.department_name && <span className="doctor-card__dept">{d.department_name}</span>}
                <button
                  type="button"
                  className="doctor-card__book"
                  onClick={() => openBooking({ doctor_id: d.id, department_id: d.department_id })}
                >
                  <CalendarIcon size={18} /> Book appointment
                </button>
              </div>
              <div className="doctor-card__body">
                <h3 className="doctor-card__name">{d.name}</h3>
                <p className="doctor-card__role">
                  {[d.designation, d.qualification].filter(Boolean).join(' · ')}
                </p>
                <div className="doctor-card__foot">
                  {d.experience_years > 0 && <span>{d.experience_years}+ yrs experience</span>}
                  <DepartmentIcon name="sparkles" size={20} strokeWidth={1.6} className="doctor-card__spark" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
