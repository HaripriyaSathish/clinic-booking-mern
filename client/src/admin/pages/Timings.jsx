import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../components/Form';
import SectionHeadingForm from '../components/SectionHeadingForm';
import ListEditor from '../components/ListEditor';

const fields = [
  { name: 'day_range', label: 'Days', maxLength: 100, hint: 'e.g. Monday – Friday', rules: { required: 'Days are required' } },
  { name: 'label', label: 'Group', maxLength: 100, defaultValue: 'OPD', hint: 'For your reference, e.g. OPD / Emergency' },
  { name: 'open_time', label: 'Opens', type: 'time' },
  { name: 'close_time', label: 'Closes', type: 'time' },
  { name: 'note', label: 'Text when closed', maxLength: 100, hint: 'e.g. Closed (Emergency open)' },
  { name: 'sort_order', label: 'Display order', type: 'number', defaultValue: 0 },
  { name: 'is_24x7', label: 'Open 24 × 7', type: 'checkbox' },
  { name: 'is_closed', label: 'Closed', type: 'checkbox' },
];

const summary = (r) => {
  let value = r.is_24x7 ? '24 × 7' : r.is_closed ? r.note || 'Closed' : '';
  if (!value && r.open_time) value = `${r.open_time.slice(0, 5)} – ${(r.close_time || '').slice(0, 5)}`;
  return { title: r.day_range, subtitle: value };
};

export default function Timings() {
  return (
    <>
      <PageHeader title="Timings, Contact & Banner" description="Consulting hours, the note box, the contact cards and the closing banner." />
      <SectionHeadingForm
        sectionKey="contact"
        description="The description is shown in the green note box under the consulting hours."
      />
      <SectionHeadingForm
        sectionKey="cta"
        title="Closing banner (above the footer)"
        description="The green 'Your health can't wait.' banner. Its button opens the booking form."
        eyebrowLabel="Button text"
      />
      <ListEditor resource="timings" noun="Timing" title="Consulting hours" fields={fields} renderSummary={summary} />
      <Card title="Address & phone numbers">
        <p className="a-muted">
          The Visit Us and Call Us cards use the address, phone and emergency phone from{' '}
          <Link to="/admin/settings" className="a-link">Navbar &amp; Site Settings</Link>.
        </p>
      </Card>
    </>
  );
}
