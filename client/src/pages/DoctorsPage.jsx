import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CtaBanner from '../components/sections/CtaBanner';
import FloatingActions from '../components/layout/FloatingActions';
import Loader from '../components/common/Loader';
import SectionTitle from '../components/common/SectionTitle';
import DoctorPhoto, { shortName } from '../components/doctors/DoctorPhoto';
import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, LanguagesIcon } from '../components/common/Icons';
import { useBooking } from '../context/BookingContext';
import { getDoctors, getHomeData } from '../api/publicApi';
import { formatSchedule } from '../utils/formatDate';

const rupees = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function DoctorsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openBooking } = useBooking();
  const [state, setState] = useState({ loading: true, error: null, home: null, doctors: [] });

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([getHomeData(), getDoctors()])
      .then(([home, doctors]) => setState({ loading: false, error: null, home: home.data, doctors: doctors.data }))
      .catch((error) => setState((s) => ({ ...s, loading: false, error })));
  }, []);

  useEffect(() => {
    if (state.home?.settings?.clinic_name) document.title = `Our Doctors · ${state.home.settings.clinic_name}`;
  }, [state.home]);

  // Back to wherever the visitor came from; straight to the homepage doctors section on a direct visit
  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/#doctors'));

  if (state.loading) return <Loader fullScreen />;
  if (state.error) {
    return (
      <div className="page-error">
        <div>
          <h1>We'll be right back</h1>
          <p>The doctors list couldn't load. Please try again shortly.</p>
        </div>
      </div>
    );
  }

  const heading = state.home?.sections?.doctors_page || {};

  return (
    <>
      <Navbar settings={state.home?.settings || {}} />
      <main className="doctors-page">
        <div className="container">
          <motion.button
            type="button"
            className="back-link"
            onClick={goBack}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ArrowLeftIcon size={18} /> Back
          </motion.button>

          <SectionTitle
            as="h1"
            className="section-title--page"
            eyebrow={heading.eyebrow}
            title={heading.title}
          />
          {heading.description && (
            <motion.p
              className="doctors-page__intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {heading.description}
            </motion.p>
          )}

          <div className="doctor-list">
            {state.doctors.map((d) => (
              <motion.article
                key={d.id}
                className="doctor-row"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <DoctorPhoto doctor={d} className="doctor-row__photo" />
                <div className="doctor-row__body">
                  <div className="doctor-row__head">
                    <h2 className="doctor-row__name">{d.name}</h2>
                    {d.department_name && <span className="pill">{d.department_name}</span>}
                  </div>
                  <p className="doctor-row__meta">
                    <CheckCircleIcon size={18} />
                    {[d.designation, d.qualification, d.experience_years > 0 && `${d.experience_years}+ yrs`]
                      .filter(Boolean).join(' · ')}
                  </p>
                  {d.bio && <p className="doctor-row__bio">{d.bio}</p>}
                  <div className="doctor-row__facts">
                    {d.languages && <span><LanguagesIcon size={18} /> {d.languages}</span>}
                    {d.consultation_fee != null && <strong>Consultation {rupees(d.consultation_fee)}</strong>}
                  </div>
                  {d.schedules?.length > 0 && (
                    <ul className="doctor-row__slots">
                      {d.schedules.map((s) => <li key={s.id}>{formatSchedule(s)}</li>)}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="btn btn--primary doctor-row__book"
                    onClick={() => openBooking({ doctor_id: d.id, department_id: d.department_id })}
                  >
                    <CalendarIcon size={18} /> Book with {shortName(d.name)}
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
        <CtaBanner content={state.home?.sections?.cta} phone={state.home?.settings?.phone} />
      </main>
      <Footer settings={state.home?.settings || {}} timings={state.home?.timings || []} />
      <FloatingActions settings={state.home?.settings || {}} />
    </>
  );
}
