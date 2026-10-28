import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getOne, saveOne } from '../../api/adminApi';
import ImageUploader from '../components/ImageUploader';
import StatsManager from '../components/StatsManager';
import { AField, Card, PageHeader, SaveBar } from '../components/Form';
import Loader from '../../components/common/Loader';
import { errorMessage, toFormData } from '../utils';

const FIELDS = [
  'badge_text', 'title', 'highlight_word', 'subtitle', 'primary_btn_text',
  'secondary_btn_text', 'secondary_btn_link', 'info_title', 'info_text',
];

const pickFields = (data = {}) => Object.fromEntries(FIELDS.map((f) => [f, data[f] ?? '']));

export default function HeroEditor() {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm();

  useEffect(() => {
    getOne('hero')
      .then(({ data }) => {
        reset(pickFields(data || {}));
        setImageUrl(data?.image_url || '');
      })
      .catch((e) => toast.error(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      const { data } = await saveOne('hero', toFormData(values, { image: imageFile }));
      reset(pickFields(data));
      setImageUrl(data.image_url || '');
      setImageFile(null);
      toast.success('Hero section saved');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader title="Hero & Stats" description="The first section visitors see on the homepage." />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="a-split">
          <Card title="Content">
            <div className="a-grid">
              <AField label="Badge" hint='Small pill above the heading, e.g. "SINCE 2004"' error={errors.badge_text}>
                <input className="a-input" maxLength={50} {...register('badge_text')} />
              </AField>
              <AField label="Highlighted word" hint="Shown in green italics at the end of the heading" error={errors.highlight_word}>
                <input className="a-input" maxLength={50} {...register('highlight_word')} />
              </AField>
              <AField label="Heading" full error={errors.title}>
                <input className="a-input" maxLength={200} {...register('title', { required: 'Heading is required' })} />
              </AField>
              <AField label="Subtitle" full error={errors.subtitle}>
                <textarea className="a-input" rows={3} {...register('subtitle')} />
              </AField>
              <AField label="Main button text" hint="Opens the booking form" error={errors.primary_btn_text}>
                <input className="a-input" maxLength={50} {...register('primary_btn_text')} />
              </AField>
              <AField label="Second button text" error={errors.secondary_btn_text}>
                <input className="a-input" maxLength={50} {...register('secondary_btn_text')} />
              </AField>
              <AField label="Second button link" hint="e.g. #doctors" error={errors.secondary_btn_link}>
                <input className="a-input" maxLength={200} {...register('secondary_btn_link')} />
              </AField>
            </div>
          </Card>

          <Card title="Image">
            <ImageUploader
              label="Hero image"
              currentUrl={imageUrl}
              onChange={(f) => setImageFile(f)}
              hint="Portrait image works best (about 1000 × 1100px)."
            />
            <div className="a-grid a-mt">
              <AField label="Card title" hint='e.g. "OPD today"' error={errors.info_title}>
                <input className="a-input" maxLength={60} {...register('info_title')} />
              </AField>
              <AField label="Card text" hint='e.g. "9:00 AM – 6:00 PM"' error={errors.info_text}>
                <input className="a-input" maxLength={100} {...register('info_text')} />
              </AField>
            </div>
          </Card>
        </div>
        <SaveBar saving={isSubmitting} dirty={isDirty || !!imageFile} />
      </form>

      <StatsManager />
    </>
  );
}
