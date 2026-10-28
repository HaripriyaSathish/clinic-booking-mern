import { PageHeader } from '../components/Form';
import SectionHeadingForm from '../components/SectionHeadingForm';
import ListEditor from '../components/ListEditor';

const fields = [
  { name: 'title', label: 'Caption', maxLength: 150, full: true },
  { name: 'sort_order', label: 'Display order', type: 'number', defaultValue: 0 },
  { name: 'is_active', label: 'Show on website', type: 'checkbox', defaultValue: true },
];

export default function Gallery() {
  return (
    <>
      <PageHeader title="Gallery" description="Photos of your clinic. The 1st and 4th photos appear larger." />
      <SectionHeadingForm sectionKey="gallery" />
      <ListEditor
        resource="gallery"
        noun="Photo"
        title="Photos"
        fields={fields}
        image={{ label: 'Photo', urlKey: 'image_url', hint: 'Required for new photos.' }}
        renderSummary={(r) => ({ title: r.title || 'Untitled photo', subtitle: `Order ${r.sort_order}` })}
      />
    </>
  );
}
