export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const date = new Date(); date.setHours(h, m);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
};

// "09:00:00" -> "9 AM", "12:30:00" -> "12:30 PM"
export const shortTime = (t = '') => {
  const [h, m] = t.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${suffix}`;
};

// { day_of_week: 'Mon', start_time: '09:00:00', end_time: '13:00:00' } -> "Mon · 9 AM–1 PM"
export const formatSchedule = (s) => `${s.day_of_week} · ${shortTime(s.start_time)}–${shortTime(s.end_time)}`;

// "09:00:00" -> "9:00 AM"
const fullTime = (t) => {
  const s = shortTime(t);
  return /:/.test(s) ? s : s.replace(' ', ':00 ');
};

// Right-hand text of a clinic_timings row: "9:00 AM – 6:00 PM", "24 × 7" or the closed note
export const timingText = (t) => {
  if (t.is_24x7) return '24 × 7';
  if (t.is_closed) return t.note || 'Closed';
  if (t.open_time && t.close_time) return `${fullTime(t.open_time)} – ${fullTime(t.close_time)}`;
  return t.note || '';
};

const WEEKDAYS =['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "2026-10-28" -> "Wed" (parsed as a local date, not UTC)
export const weekdayOf = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
};
