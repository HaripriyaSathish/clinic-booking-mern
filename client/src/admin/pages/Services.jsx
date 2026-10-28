import { PageHeader } from '../components/Form';
import SectionHeadingForm from '../components/SectionHeadingForm';
import ListEditor from '../components/ListEditor';

const fields = [
  { name: 'title', label: 'Title', maxLength: 150, full: true, rules: { required: 'Title is required' } },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'icon', label: 'Icon', type: 'icon', defaultValue: 'activity' },
  { name: 'sort_order', label: 'Display order', type: 'number', defaultValue: 0 },
  { name: 'is_active', label: 'Show on website', type: 'checkbox', defaultValue: true },
];

export default function Services() {
  return (
    <>
      <PageHeader title="Facilities" description="The 'Care Under One Roof' section with photo cards." />
      <SectionHeadingForm sectionKey="services" />
      <ListEditor
        resource="services"
        noun="Facility"
        title="Facility cards"
        fields={fields}
        image={{ label: 'Photo', urlKey: 'image_url', hint: 'Landscape photo, about 1200 × 750px.' }}
        renderSummary={(r) => ({ title: r.title, subtitle: r.description })}
      />
    </>
  );
}
