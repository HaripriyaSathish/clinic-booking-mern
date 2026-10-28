import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { create, list, remove, update } from '../../api/adminApi';
import Modal from '../../components/common/Modal';
import { DEPARTMENT_ICONS, DepartmentIcon, PlusIcon, TrashIcon } from '../../components/common/Icons';
import SectionHeadingForm from '../components/SectionHeadingForm';
import { AField, Card, PageHeader } from '../components/Form';
import { errorMessage } from '../utils';

const empty = { name: '', icon: 'heart-pulse', short_desc: '', sort_order: 0, is_active: true };

function DepartmentForm({ initial, onSaved, onCancel }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { ...empty, ...initial, is_active: initial?.is_active === undefined ? true : !!initial.is_active },
  });
  const icon = watch('icon');

  const onSubmit = async (values) => {
    const payload = { ...values, sort_order: Number(values.sort_order) || 0, is_active: values.is_active ? 1 : 0 };
    try {
      if (initial?.id) await update('departments', initial.id, payload);
      else await create('departments', payload);
      toast.success('Department saved');
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="a-modal-form">
      <h2>{initial?.id ? 'Edit department' : 'Add department'}</h2>
      <div className="a-grid">
        <AField label="Name" error={errors.name}>
          <input className="a-input" maxLength={100} {...register('name', { required: 'Name is required' })} />
        </AField>
        <AField label="Display order" error={errors.sort_order}>
          <input className="a-input" type="number" {...register('sort_order')} />
        </AField>
        <AField label="Short description" full error={errors.short_desc}>
          <textarea className="a-input" rows={3} maxLength={300} {...register('short_desc', { maxLength: { value: 300, message: 'Max 300 characters' } })} />
        </AField>
      </div>

      <span className="a-label">Icon</span>
      <div className="a-icon-picker">
        {Object.keys(DEPARTMENT_ICONS).map((key) => (
          <button
            key={key}
            type="button"
            title={key}
            className={`a-icon-picker__item ${icon === key ? 'is-active' : ''}`}
            onClick={() => setValue('icon', key, { shouldDirty: true })}
          >
            <DepartmentIcon name={key} size={22} />
          </button>
        ))}
      </div>

      <label className="a-check"><input type="checkbox" {...register('is_active')} /> Show on website</label>

      <div className="a-modal-form__actions">
        <button type="button" className="a-btn a-btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function Departments() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null); // null | {} (new) | row

  const load = () => list('departments').then((r) => setRows(r.data)).catch((e) => toast.error(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const del = async (row) => {
    if (!window.confirm(`Delete "${row.name}"? Doctors in this department will become unassigned.`)) return;
    try {
      await remove('departments', row.id);
      toast.success('Department deleted');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <>
      <PageHeader title="Departments" description="The 'Our Departments' section and the department list in the booking form.">
        <button type="button" className="btn btn--primary" onClick={() => setEditing({})}><PlusIcon size={18} /> Add department</button>
      </PageHeader>

      <SectionHeadingForm sectionKey="departments" />

      <Card title="Departments" description="Click a card to edit it.">
        <div className="a-dept-grid">
          {rows.map((d) => (
            <div key={d.id} className={`a-dept ${d.is_active ? '' : 'is-hidden'}`}>
              <button type="button" className="a-dept__body" onClick={() => setEditing(d)}>
                <span className="a-dept__icon"><DepartmentIcon name={d.icon} size={22} /></span>
                <strong>{d.name}</strong>
                <small>{d.short_desc}</small>
                {!d.is_active && <em>Hidden</em>}
              </button>
              <button type="button" className="a-icon-btn a-dept__del" onClick={() => del(d)} aria-label={`Delete ${d.name}`}>
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
          {!rows.length && <p className="a-muted">No departments yet.</p>}
        </div>
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Department" width={620}>
        {editing && (
          <DepartmentForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        )}
      </Modal>
    </>
  );
}
