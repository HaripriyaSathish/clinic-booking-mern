import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { create, list, remove, update } from '../../api/adminApi';
import Modal from '../../components/common/Modal';
import DoctorPhoto from '../../components/doctors/DoctorPhoto';
import { PlusIcon, TrashIcon } from '../../components/common/Icons';
import ImageUploader from '../components/ImageUploader';
import SectionHeadingForm from '../components/SectionHeadingForm';
import { AField, Card, PageHeader } from '../components/Form';
import { errorMessage, toFormData } from '../utils';
import { formatSchedule } from '../../utils/formatDate';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const blank = {
  name: '', department_id: '', designation: '', qualification: '', experience_years: '',
  bio: '', languages: '', consultation_fee: '', sort_order: 0, is_featured: false, is_active: true,
};

const toFormValues = (d = {}) => ({
  ...blank,
  ...Object.fromEntries(Object.keys(blank).map((k) => [k, d[k] ?? blank[k]])),
  department_id: d.department_id ? String(d.department_id) : '',
  consultation_fee: d.consultation_fee != null ? String(Math.round(d.consultation_fee)) : '',
  is_featured: !!d.is_featured,
  is_active: d.is_active === undefined ? true : !!d.is_active,
});

function ScheduleEditor({ rows, onChange }) {
  const set = (i, key, value) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  return (
    <div className="a-schedule">
      {rows.map((r, i) => (
        <div key={i} className="a-schedule__row">
          <select className="a-input" value={r.day_of_week} onChange={(e) => set(i, 'day_of_week', e.target.value)}>
            {DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <input className="a-input" type="time" value={r.start_time} onChange={(e) => set(i, 'start_time', e.target.value)} />
          <span className="a-muted">to</span>
          <input className="a-input" type="time" value={r.end_time} onChange={(e) => set(i, 'end_time', e.target.value)} />
          <button type="button" className="a-icon-btn" aria-label="Remove slot" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>
            <TrashIcon size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="a-btn a-btn--ghost"
        onClick={() => onChange([...rows, { day_of_week: 'Mon', start_time: '09:00', end_time: '13:00' }])}
      >
        <PlusIcon size={16} /> Add time slot
      </button>
    </div>
  );
}

function DoctorForm({ initial, departments, onSaved, onCancel }) {
  const [photo, setPhoto] = useState(null);
  const [schedules, setSchedules] = useState(
    (initial.schedules || []).map((s) => ({
      day_of_week: s.day_of_week, start_time: s.start_time.slice(0, 5), end_time: s.end_time.slice(0, 5),
    }))
  );
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: toFormValues(initial) });

  const onSubmit = async (values) => {
    const badSlot = schedules.find((s) => !s.start_time || !s.end_time || s.start_time >= s.end_time);
    if (badSlot) return toast.error(`${badSlot.day_of_week}: end time must be after start time`);
    const payload = {
      ...values,
      is_featured: values.is_featured ? 1 : 0,
      is_active: values.is_active ? 1 : 0,
      schedules: JSON.stringify(schedules),
    };
    try {
      const fd = toFormData(payload, { photo });
      if (initial.id) await update('doctors', initial.id, fd);
      else await create('doctors', fd);
      toast.success('Doctor saved');
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="a-modal-form">
      <h2>{initial.id ? 'Edit doctor' : 'Add doctor'}</h2>
      <div className="a-doctor-form">
        <ImageUploader label="Photo" currentUrl={initial.photo_url} onChange={setPhoto} hint="Square or portrait photo." />
        <div className="a-grid">
          <AField label="Full name" full error={errors.name}>
            <input className="a-input" maxLength={120} placeholder="Dr. …" {...register('name', { required: 'Name is required' })} />
          </AField>
          <AField label="Department" error={errors.department_id}>
            <select className="a-input" {...register('department_id')}>
              <option value="">— None —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </AField>
          <AField label="Experience (years)" error={errors.experience_years}>
            <input
              className="a-input"
              inputMode="numeric"
              {...register('experience_years', { pattern: { value: /^\d{0,2}$/, message: 'Whole number, max 2 digits' } })}
            />
          </AField>
          <AField label="Designation" error={errors.designation}>
            <input className="a-input" maxLength={150} placeholder="Consultant Neurologist" {...register('designation')} />
          </AField>
          <AField label="Qualification" error={errors.qualification}>
            <input className="a-input" maxLength={200} placeholder="MD, DM (Neurology)" {...register('qualification')} />
          </AField>
          <AField label="Languages" error={errors.languages}>
            <input className="a-input" maxLength={200} placeholder="English, Hindi" {...register('languages')} />
          </AField>
          <AField label="Consultation fee (₹)" error={errors.consultation_fee}>
            <input
              className="a-input"
              inputMode="numeric"
              {...register('consultation_fee', { pattern: { value: /^\d{0,6}$/, message: 'Digits only' } })}
            />
          </AField>
        </div>
      </div>

      <div className="a-grid a-mt">
        <AField label="Bio" full error={errors.bio}>
          <textarea className="a-input" rows={4} {...register('bio')} />
        </AField>
        <AField label="Display order" error={errors.sort_order}>
          <input className="a-input" type="number" {...register('sort_order')} />
        </AField>
      </div>

      <span className="a-label">Weekly schedule</span>
      <ScheduleEditor rows={schedules} onChange={setSchedules} />

      <div className="a-checks">
        <label className="a-check"><input type="checkbox" {...register('is_featured')} /> Show on homepage</label>
        <label className="a-check"><input type="checkbox" {...register('is_active')} /> Visible on website</label>
      </div>

      <div className="a-modal-form__actions">
        <button type="button" className="a-btn a-btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function Doctors() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => list('doctors').then((r) => setRows(r.data)).catch((e) => toast.error(errorMessage(e)));
  useEffect(() => {
    load();
    list('departments').then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  const del = async (d) => {
    if (!window.confirm(`Delete ${d.name}? Their schedule will be removed too.`)) return;
    try {
      await remove('doctors', d.id);
      toast.success('Doctor deleted');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Doctors" description="Homepage doctor cards, the 'Our Doctors' page and the doctor list in the booking form.">
        <button type="button" className="btn btn--primary" onClick={() => setEditing({})}><PlusIcon size={18} /> Add doctor</button>
      </PageHeader>

      <div className="a-split a-split--even">
        <SectionHeadingForm sectionKey="doctors" title="Homepage heading" description="Shown above the doctor cards on the homepage." />
        <SectionHeadingForm sectionKey="doctors_page" title="'View all doctors' page heading" description="Heading and intro of the full doctors page." />
      </div>

      <Card title="All doctors" description="Click a doctor to edit. The first 4 with 'Show on homepage' appear on the homepage.">
        <div className="a-doctor-grid">
          {rows.map((d) => (
            <div key={d.id} className={`a-doctor ${d.is_active ? '' : 'is-hidden'}`}>
              <button type="button" className="a-doctor__body" onClick={() => setEditing(d)}>
                <DoctorPhoto doctor={d} className="a-doctor__photo" />
                <span className="a-doctor__info">
                  <strong>{d.name}</strong>
                  <small>{[d.department_name, d.designation].filter(Boolean).join(' · ')}</small>
                  <small className="a-doctor__slots">{d.schedules.map(formatSchedule).join('  |  ') || 'No schedule'}</small>
                  <span className="a-doctor__tags">
                    {!!d.is_featured && <em className="a-tag">Homepage</em>}
                    {!d.is_active && <em className="a-tag a-tag--muted">Hidden</em>}
                    {!d.photo_url && <em className="a-tag a-tag--warn">No photo</em>}
                  </span>
                </span>
              </button>
              <button type="button" className="a-icon-btn a-doctor__del" onClick={() => del(d)} aria-label={`Delete ${d.name}`}>
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
          {!rows.length && <p className="a-muted">No doctors yet.</p>}
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Doctor" width={860}>
        {editing && (
          <DoctorForm
            initial={editing}
            departments={departments}
            onCancel={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        )}
      </Modal>
    </>
  );
}
