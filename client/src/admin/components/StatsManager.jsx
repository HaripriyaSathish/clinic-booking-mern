import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { create, list, remove, update } from '../../api/adminApi';
import { PlusIcon, TrashIcon } from '../../components/common/Icons';
import { Card } from './Form';
import { errorMessage } from '../utils';

const blank = { label: '', value: '', suffix: '', sort_order: 0, is_active: 1 };

// Inline-editable list of the counters shown under the hero buttons
export default function StatsManager() {
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = () => list('stats').then((r) => setRows(r.data)).catch((e) => toast.error(errorMessage(e)));
  useEffect(() => { load(); }, []);

  const change = (id, key, value) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const save = async (row) => {
    if (!row.label.trim() || !String(row.value).trim()) return toast.error('Label and value are required');
    setBusyId(row.id);
    try {
      const payload = { label: row.label, value: row.value, suffix: row.suffix || '', sort_order: Number(row.sort_order) || 0, is_active: row.is_active ? 1 : 0 };
      if (row.isNew) await create('stats', payload);
      else await update('stats', row.id, payload);
      toast.success('Stat saved');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const del = async (row) => {
    if (row.isNew) return setRows((rs) => rs.filter((r) => r.id !== row.id));
    if (!window.confirm(`Delete "${row.label}"?`)) return;
    try {
      await remove('stats', row.id);
      toast.success('Stat deleted');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const add = () => setRows((rs) => [...rs, { ...blank, id: `new-${Date.now()}`, isNew: true, sort_order: rs.length + 1 }]);

  return (
    <Card title="Stats" description="Counters under the hero buttons, e.g. 20+ Years of Care. Numbers count up on the website.">
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr><th>Value</th><th>Suffix</th><th>Label</th><th>Order</th><th>Visible</th><th /></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><input className="a-input a-input--sm" value={r.value} maxLength={20} onChange={(e) => change(r.id, 'value', e.target.value)} placeholder="20" /></td>
                <td><input className="a-input a-input--xs" value={r.suffix || ''} maxLength={10} onChange={(e) => change(r.id, 'suffix', e.target.value)} placeholder="+" /></td>
                <td><input className="a-input" value={r.label} maxLength={100} onChange={(e) => change(r.id, 'label', e.target.value)} placeholder="Years of Care" /></td>
                <td><input className="a-input a-input--xs" type="number" value={r.sort_order} onChange={(e) => change(r.id, 'sort_order', e.target.value)} /></td>
                <td><input type="checkbox" checked={!!r.is_active} onChange={(e) => change(r.id, 'is_active', e.target.checked ? 1 : 0)} /></td>
                <td className="a-table__actions">
                  <button type="button" className="a-btn a-btn--primary" disabled={busyId === r.id} onClick={() => save(r)}>
                    {busyId === r.id ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" className="a-icon-btn" onClick={() => del(r)} aria-label="Delete"><TrashIcon size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="a-btn a-btn--ghost a-mt" onClick={add}><PlusIcon size={16} /> Add stat</button>
    </Card>
  );
}
