import { PageHeader } from '../components/Form';
import SectionHeadingForm from '../components/SectionHeadingForm';
import ListEditor from '../components/ListEditor';

const fields = [
  { name: 'question', label: 'Question', maxLength: 300, full: true, rules: { required: 'Question is required' } },
  { name: 'answer', label: 'Answer', type: 'textarea', rows: 4, rules: { required: 'Answer is required' } },
  { name: 'sort_order', label: 'Display order', type: 'number', defaultValue: 0 },
  { name: 'is_active', label: 'Show on website', type: 'checkbox', defaultValue: true },
];

export default function FAQs() {
  return (
    <>
      <PageHeader title="FAQs" description="The question-and-answer section shown before the closing banner." />
      <SectionHeadingForm sectionKey="faq" description="Small gold label, heading and the short intro under it." />
      <ListEditor
        resource="faqs"
        noun="Question"
        title="Questions"
        fields={fields}
        renderSummary={(r) => ({ title: r.question, subtitle: r.answer })}
      />
    </>
  );
}
