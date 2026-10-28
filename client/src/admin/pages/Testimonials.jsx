import { PageHeader } from '../components/Form';
import SectionHeadingForm from '../components/SectionHeadingForm';
import ListEditor from '../components/ListEditor';

const fields = [
  {
    name: 'patient_name', label: 'Patient name', maxLength: 120,
    rules: { required: 'Name is required', pattern: { value: /^[A-Za-z][A-Za-z .']*$/, message: 'Letters only' } },
  },
  { name: 'location', label: 'City', maxLength: 100 },
  {
    name: 'rating', label: 'Rating', type: 'select', defaultValue: 5,
    options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n > 1 ? 's' : ''}` })),
  },
  { name: 'sort_order', label: 'Display order', type: 'number', defaultValue: 0 },
  { name: 'message', label: 'Review', type: 'textarea', rows: 4, rules: { required: 'Review text is required' } },
  { name: 'is_active', label: 'Show on website', type: 'checkbox', defaultValue: true },
];

export default function Testimonials() {
  return (
    <>
      <PageHeader title="Patient Stories" description="Reviews shown in the testimonials carousel." />
      <SectionHeadingForm sectionKey="testimonials" />
      <ListEditor
        resource="testimonials"
        noun="Story"
        title="Stories"
        fields={fields}
        image={{ label: 'Photo (optional)', urlKey: 'photo_url', hint: 'Leave empty to show initials.' }}
        renderSummary={(r) => ({ title: `${r.patient_name}${r.location ? ` · ${r.location}` : ''}`, subtitle: r.message })}
      />
    </>
  );
}
