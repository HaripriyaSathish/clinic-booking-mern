import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { create, list, remove, update } from '../../api/adminApi';
import Modal from '../../components/common/Modal';
import { DEPARTMENT_ICONS, DepartmentIcon, PlusIcon, TrashIcon } from '../../components/common/Icons';
import ImageUploader from './ImageUploader';
import { AField, Card } from './Form';
import { errorMessage, toFormData } from '../utils';

/*
  Generic add / edit / delete list for simple sections.
  fields: [{ name, label, type: 'text'|'textarea'|'number'|'time'|'select'|'checkbox'|'icon', options, rules, full, hint }]
  image:  { label, urlKey } — optional single image (sent as "image")
  renderSummary(row) -> { title, subtitle }
*/
function ItemForm({ resource, fields, image, initial, onSaved, onCancel, noun }) {
  const [file, setFile] = useState(null);
  const defaults = Object.fromEntries(fields.map((f) => {
    const v = initial[f.name];
    if (f.type === 'checkbox') return [f.name, v === undefined ? !!f.defaultValue : !!v];
    if (f.type === 'time') return [f.name, v ? String(v).slice(0, 5) : ''];
    return [f.name, v ?? f.defaultValue ?? ''];
  }));
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues: defaults });

  const onSubmit = async (values) => {
    const payload = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === 'boolean' ? (v ? 1 : 0) : v]));
    try {
      const body = image ? toFormData(payload, { image: file }) : payload;
      if (initial.id) await update(resource, initial.id, body);
      else await create(resource, body);
      toast.success(`${noun} saved`);
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const input = (f) => {
    const reg = register(f.name, f.rules);
    switch (f.type) {
      case 'textarea': return <textarea className="a-input" rows={f.rows || 3} {...reg} />;
      case 'number': return <input className="a-input" type="number" {...reg} />;
      case 'time': return <input className="a-input" type="time" {...reg} />;
      case 'select':
        return (
          <select className="a-input" {...reg}>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case 'icon':
        return (
          <div className="a-icon-picker">
            {Object.keys(DEPARTMENT_ICONS).map((key) => (
              <button
                key={key}
                type="button"
                title={key}
                className={`a-icon-picker__item ${watch(f.name) === key ? 'is-active' : ''}`}
                onClick={() => setValue(f.name, key, { shouldDirty: true })}
              >
                <DepartmentIcon name={key} size={22} />
              </button>
            ))}
          </div>
        );
      default: return <input className="a-input" maxLength={f.maxLength} {...reg} />;
    }
  };

  const checkboxes = fields.filter((f) => f.type === 'checkbox');
  const others = fields.filter((f) => f.type !== 'checkbox');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="a-modal-form">
      <h2>{initial.id ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}</h2>
      <div className={image ? 'a-doctor-form' : ''}>
        {image && <ImageUploader label={image.label} currentUrl={initial[image.urlKey]} onChange={setFile} hint={image.hint} />}
        <div className="a-grid">
          {others.map((f) => (
            <AField key={f.name} label={f.label} hint={f.hint} full={f.full || f.type === 'textarea' || f.type === 'icon'} error={errors[f.name]}>
              {input(f)}
            </AField>
          ))}
        </div>
      </div>
      {checkboxes.length > 0 && (
        <div className="a-checks">
          {checkboxes.map((f) => (
            <label key={f.name} className="a-check"><input type="checkbox" {...register(f.name)} /> {f.label}</label>
          ))}
        </div>
      )}
      <div className="a-modal-form__actions">
        <button type="button" className="a-btn a-btn--ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function ListEditor({ resource, noun, title, description, fields, image, renderSummary }) {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => list(resource).then((r) => setRows(r.data)).catch((e) => toast.error(errorMessage(e)));
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [resource]);

  const del = async (row) => {
    if (!window.confirm(`Delete this ${noun.toLowerCase()}?`)) return;
    try {
      await remove(resource, row.id);
      toast.success(`${noun} deleted`);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <Card title={title} description={description}>
      <div className="a-list">
        {rows.map((r) => {
          const { title: t, subtitle } = renderSummary(r);
          const hidden = r.is_active === 0;
          return (
            <div key={r.id} className={`a-list__item ${hidden ? 'is-hidden' : ''}`}>
              <button type="button" className="a-list__body" onClick={() => setEditing(r)}>
                {image && (
                  <span className="a-list__thumb">{r[image.urlKey] ? <img src={r[image.urlKey]} alt="" /> : null}</span>
                )}
                <span className="a-list__text">
                  <strong>{t}</strong>
                  {subtitle && <small>{subtitle}</small>}
                  {hidden && <em className="a-tag a-tag--muted">Hidden</em>}
                </span>
              </button>
              <button type="button" className="a-icon-btn a-list__del" onClick={() => del(r)} aria-label="Delete"><TrashIcon size={16} /></button>
            </div>
          );
        })}
        {!rows.length && <p className="a-muted">Nothing here yet.</p>}
      </div>
      <button type="button" className="a-btn a-btn--ghost a-mt" onClick={() => setEditing({})}><PlusIcon size={16} /> Add {noun.toLowerCase()}</button>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={noun} width={image ? 820 : 620}>
        {editing && (
          <ItemForm
            resource={resource}
            fields={fields}
            image={image}
            initial={editing}
            noun={noun}
            onCancel={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        )}
      </Modal>
    </Card>
  );
}
