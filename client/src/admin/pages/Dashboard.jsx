import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getDashboard } from '../../api/adminApi';
import { ADMIN_NAV } from '../components/Sidebar';
import Loader from '../../components/common/Loader';
import {
  ArrowRightIcon, CalendarIcon, ClockIcon, DepartmentIcon, ExternalIcon, MailIcon, MedicalCrossIcon, TrendIcon, UsersIcon,
} from '../../components/common/Icons';
import { errorMessage } from '../utils';
import { shortTime } from '../../utils/formatDate';

const ease = [0.22, 1, 0.36, 1];

// Reserved status colours — always shown with the status text, never colour alone
const STATUS = {
  Pending: { color: '#b07a12', bg: '#fbf1dc' },
  Confirmed: { color: '#1f8a5c', bg: '#e1f3ea' },
  Completed: { color: '#2f6db5', bg: '#e3edf9' },
  Cancelled: { color: '#c0392b', bg: '#fbe6e3' },
  'No-show': { color: '#66706b', bg: '#eceeed' },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const initials = (n = '') => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function CountUp({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v); },
    });
    return () => controls.stop();
  }, [value]);
  return <span ref={ref}>0</span>;
}

function StatCard({ icon: Icon, label, value, hint, tone, i }) {
  return (
    <motion.div
      className={`d-stat d-stat--${tone}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease }}
      whileHover={{ y: -4 }}
    >
      <span className="d-stat__icon"><Icon size={20} /></span>
      <span className="d-stat__label">{label}</span>
      <strong className="d-stat__value"><CountUp value={value} /></strong>
      {hint && <span className="d-stat__hint">{hint}</span>}
    </motion.div>
  );
}

// Single series → no legend; hover shows exact count
function BookingsChart({ trend }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(4, ...trend.map((t) => t.count));
  const W = 560; const H = 180; const pad = 24;
  const slot = (W - pad) / trend.length;
  const barW = Math.min(22, slot - 8);
  const ticks = [0, Math.ceil(max / 2), max];

  return (
    <div className="d-chart">
      <svg viewBox={`0 0 ${W} ${H + 28}`} role="img" aria-label="Bookings received per day, last 14 days">
        {ticks.map((t) => {
          const y = H - (t / max) * (H - 10);
          return (
            <g key={t}>
              <line x1={pad} x2={W} y1={y} y2={y} className="d-chart__grid" />
              <text x={0} y={y + 4} className="d-chart__tick">{t}</text>
            </g>
          );
        })}
        {trend.map((t, i) => {
          const h = (t.count / max) * (H - 10);
          const x = pad + i * slot + (slot - barW) / 2;
          const isToday = i === trend.length - 1;
          return (
            <g key={t.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* wide invisible hit area */}
              <rect x={pad + i * slot} y={0} width={slot} height={H} fill="transparent" />
              <motion.rect
                x={x}
                width={barW}
                rx={4}
                className={`d-chart__bar ${isToday ? 'is-today' : ''} ${hover === i ? 'is-hover' : ''}`}
                initial={{ y: H, height: 0 }}
                animate={{ y: H - h, height: h }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.04, ease }}
              />
              {(i % 2 === 1 || isToday) && (
                <text x={x + barW / 2} y={H + 18} textAnchor="middle" className="d-chart__tick">
                  {isToday ? 'Today' : fmtDate(t.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="d-chart__tip" style={{ left: `${((pad + hover * slot + slot / 2) / W) * 100}%` }}>
          <strong>{trend[hover].count}</strong> booking{trend[hover].count === 1 ? '' : 's'}
          <span>{fmtDate(trend[hover].day)}</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard().then((r) => setData(r.data)).catch((e) => toast.error(errorMessage(e)));
  }, []);

  if (!data) return <Loader />;
  const { totals, trend, byStatus, topDepartments, recent } = data;
  const statusTotal = byStatus.reduce((s, b) => s + b.count, 0) || 1;
  const deptMax = Math.max(1, ...topDepartments.map((d) => d.count));
  const editors = ADMIN_NAV.flatMap((g) => g.items).filter((n) => n.ready && n.to !== '/admin');
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="d">
      <motion.section className="d-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <span className="d-hero__cross d-hero__cross--a"><MedicalCrossIcon size={120} strokeWidth={1} /></span>
        <span className="d-hero__cross d-hero__cross--b"><MedicalCrossIcon size={60} strokeWidth={1.2} /></span>
        <div>
          <span className="d-hero__date">{today}</span>
          <h1>{greeting()}, Admin</h1>
          <p>
            You have <strong>{totals.today}</strong> appointment{totals.today === 1 ? '' : 's'} today and{' '}
            <strong>{totals.pending}</strong> request{totals.pending === 1 ? '' : 's'} waiting for confirmation.
          </p>
        </div>
        <div className="d-hero__actions">
          <a href="/" target="_blank" rel="noreferrer" className="btn d-hero__btn"><ExternalIcon size={16} /> View website</a>
          <Link to="/admin/doctors" className="btn d-hero__btn d-hero__btn--ghost">Manage doctors</Link>
        </div>
      </motion.section>

      <div className="d-stats">
        <StatCard i={0} tone="green" icon={CalendarIcon} label="Appointments today" value={totals.today} hint={`${totals.upcoming} upcoming in total`} />
        <StatCard i={1} tone="gold" icon={ClockIcon} label="Awaiting confirmation" value={totals.pending} hint="Call patients to confirm" />
        <StatCard i={2} tone="blue" icon={TrendIcon} label="Bookings this week" value={totals.thisWeek} hint={`${totals.appointments} all time`} />
        <StatCard i={3} tone="teal" icon={UsersIcon} label="Active doctors" value={totals.doctors} hint={`${totals.departments} departments`} />
      </div>

      <div className="d-grid">
        <motion.section className="d-card d-card--wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35, ease }}>
          <header className="d-card__head">
            <div>
              <h2>Bookings received</h2>
              <p>New appointment requests per day · last 14 days</p>
            </div>
          </header>
          <BookingsChart trend={trend} />
        </motion.section>

        <motion.section className="d-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45, ease }}>
          <header className="d-card__head"><div><h2>By status</h2><p>All appointments</p></div></header>
          <ul className="d-status">
            {byStatus.map((s, i) => (
              <li key={s.status}>
                <span className="d-pill" style={{ color: STATUS[s.status]?.color, background: STATUS[s.status]?.bg }}>{s.status}</span>
                <span className="d-status__bar">
                  <motion.i
                    style={{ background: STATUS[s.status]?.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / statusTotal) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.5 + i * 0.08, ease }}
                  />
                </span>
                <strong>{s.count}</strong>
              </li>
            ))}
            {!byStatus.length && <li className="a-muted">No appointments yet.</li>}
          </ul>
        </motion.section>

        <motion.section className="d-card d-card--wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55, ease }}>
          <header className="d-card__head">
            <div><h2>Recent appointments</h2><p>Latest requests from the website</p></div>
            <Link to="/admin/appointments" className="d-link">View all <ArrowRightIcon size={14} /></Link>
          </header>
          <div className="a-table-wrap">
            <table className="d-table">
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Visit</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.06 }}>
                    <td>
                      <span className="d-person">
                        <span className="d-avatar">{initials(a.patient_name)}</span>
                        <span><strong>{a.patient_name}</strong><small>{a.booking_ref}</small></span>
                      </span>
                    </td>
                    <td><strong className="d-strong">{a.doctor_name || 'Any doctor'}</strong><small>{a.department_name || '—'}</small></td>
                    <td><strong className="d-strong">{fmtDate(a.appointment_date)}</strong><small>{a.appointment_time ? shortTime(a.appointment_time) : 'Any time'}</small></td>
                    <td><span className="d-pill" style={{ color: STATUS[a.status]?.color, background: STATUS[a.status]?.bg }}>{a.status}</span></td>
                  </motion.tr>
                ))}
                {!recent.length && <tr><td colSpan={4} className="a-muted">No appointments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section className="d-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65, ease }}>
          <header className="d-card__head"><div><h2>Top departments</h2><p>By number of bookings</p></div></header>
          <ul className="d-depts">
            {topDepartments.map((d, i) => (
              <li key={d.name}>
                <span className="d-depts__name">{d.name}</span>
                <span className="d-depts__bar">
                  <motion.i initial={{ width: 0 }} animate={{ width: `${(d.count / deptMax) * 100}%` }} transition={{ duration: 0.9, delay: 0.7 + i * 0.08, ease }} />
                </span>
                <strong>{d.count}</strong>
              </li>
            ))}
            {!topDepartments.length && <li className="a-muted">No bookings yet.</li>}
          </ul>
          <div className="d-mini">
            <span><MailIcon size={16} /> {totals.unreadMessages} unread message{totals.unreadMessages === 1 ? '' : 's'}</span>
          </div>
        </motion.section>
      </div>

      <section className="d-quick">
        <h2>Edit website sections</h2>
        <div className="d-quick__grid">
          {editors.map(({ to, label, icon: Icon }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 + i * 0.04 }}>
              <Link to={to} className="d-quick__tile">
                <span className="d-quick__icon">{Icon ? <Icon size={20} /> : <DepartmentIcon name="cross" size={20} />}</span>
                <span>{label}</span>
                <ArrowRightIcon size={16} className="d-quick__arrow" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
