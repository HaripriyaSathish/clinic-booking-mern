import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getOne, saveOne } from '../../api/adminApi';
import { AField, Card, SaveBar } from './Form';
import { errorMessage } from '../utils';

// Edits the eyebrow / title / description shown at the top of a landing page section
export default function SectionHeadingForm({
  sectionKey,
  title = 'Section heading',
  description = 'Small gold label, main heading and the description on the right.',
  eyebrowLabel = 'Eyebrow (small gold label)',
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    defaultValues: { eyebrow: '', title: '', description: '' },
  });

  useEffect(() => {
    getOne(`sections/${sectionKey}`)
      .then(({ data }) => reset({ eyebrow: data.eyebrow || '', title: data.title || '', description: data.description || '' }))
      .catch((e) => toast.error(errorMessage(e)));
  }, [sectionKey, reset]);

  const onSubmit = async (values) => {
    try {
      const { data } = await saveOne(`sections/${sectionKey}`, values);
      reset({ eyebrow: data.eyebrow || '', title: data.title || '', description: data.description || '' });
      toast.success('Section heading saved');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card title={title} description={description}>
        <div className="a-grid">
          <AField label={eyebrowLabel} error={errors.eyebrow}>
            <input className="a-input" maxLength={80} {...register('eyebrow')} />
          </AField>
          <AField label="Heading" error={errors.title}>
            <input className="a-input" maxLength={150} {...register('title', { required: 'Heading is required' })} />
          </AField>
          <AField label="Description" full error={errors.description}>
            <textarea className="a-input" rows={2} {...register('description')} />
          </AField>
        </div>
        <SaveBar saving={isSubmitting} dirty={isDirty} />
      </Card>
    </form>
  );
}
