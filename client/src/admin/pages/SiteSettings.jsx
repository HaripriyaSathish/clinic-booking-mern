import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getOne, saveOne } from '../../api/adminApi';
import ImageUploader from '../components/ImageUploader';
import { AField, Card, PageHeader, SaveBar } from '../components/Form';
import Loader from '../../components/common/Loader';
import { errorMessage, toFormData } from '../utils';

const FIELDS = [
  'clinic_name', 'tagline', 'phone', 'emergency_phone', 'email', 'whatsapp', 'address',
  'map_embed_url', 'facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url', 'footer_text',
];
const pickFields = (data = {}) => Object.fromEntries(FIELDS.map((f) => [f, data[f] ?? '']));

const phoneRule = { pattern: { value: /^[0-9+\-\s()]{7,20}$/, message: 'Digits, spaces, + - ( ) only' } };
const urlRule = { pattern: { value: /^https?:\/\/\S+$/, message: 'Must start with http:// or https://' } };

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm();

  useEffect(() => {
    getOne('settings')
      .then(({ data }) => {
        reset(pickFields(data || {}));
        setLogoUrl(data?.logo_url || '');
      })
      .catch((e) => toast.error(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      const { data } = await saveOne('settings', toFormData(values, { logo: logoFile }));
      reset(pickFields(data));
      setLogoUrl(data.logo_url || '');
      setLogoFile(null);
      toast.success('Settings saved');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader title="Navbar & Site Settings" description="Clinic name, logo and contact details used across the website." />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="a-split">
          <Card title="Brand">
            <div className="a-grid">
              <AField label="Clinic name" full error={errors.clinic_name}>
                <input className="a-input" maxLength={150} {...register('clinic_name', { required: 'Clinic name is required' })} />
              </AField>
              <AField label="Tagline" full hint="Shown in gold capitals under the name" error={errors.tagline}>
                <input className="a-input" maxLength={200} {...register('tagline')} />
              </AField>
            </div>
          </Card>
          <Card title="Logo">
            <ImageUploader label="Logo" round currentUrl={logoUrl} onChange={setLogoFile} hint="Leave empty to show the green cross icon." />
          </Card>
        </div>

        <Card title="Contact">
          <div className="a-grid">
            <AField label="Phone (navbar)" error={errors.phone}>
              <input className="a-input" maxLength={30} {...register('phone', phoneRule)} />
            </AField>
            <AField label="Emergency phone" error={errors.emergency_phone}>
              <input className="a-input" maxLength={30} {...register('emergency_phone', phoneRule)} />
            </AField>
            <AField label="Clinic email" hint="New appointment requests are emailed here" error={errors.email}>
              <input className="a-input" type="email" maxLength={150} {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/, message: 'Enter a valid email' } })} />
            </AField>
            <AField label="WhatsApp number" error={errors.whatsapp}>
              <input className="a-input" maxLength={30} {...register('whatsapp', phoneRule)} />
            </AField>
            <AField label="Address" full error={errors.address}>
              <textarea className="a-input" rows={2} {...register('address')} />
            </AField>
            <AField label="Google Maps embed URL" full error={errors.map_embed_url}>
              <input className="a-input" {...register('map_embed_url', urlRule)} />
            </AField>
          </div>
        </Card>

        <Card title="Social & footer">
          <div className="a-grid">
            <AField label="Facebook" error={errors.facebook_url}><input className="a-input" {...register('facebook_url', urlRule)} /></AField>
            <AField label="Instagram" error={errors.instagram_url}><input className="a-input" {...register('instagram_url', urlRule)} /></AField>
            <AField label="Twitter / X" error={errors.twitter_url}><input className="a-input" {...register('twitter_url', urlRule)} /></AField>
            <AField label="LinkedIn" error={errors.linkedin_url}><input className="a-input" {...register('linkedin_url', urlRule)} /></AField>
            <AField label="Footer description" full hint="Shown under the clinic name in the footer" error={errors.footer_text}><textarea className="a-input" rows={2} maxLength={300} {...register('footer_text')} /></AField>
          </div>
        </Card>

        <SaveBar saving={isSubmitting} dirty={isDirty || !!logoFile} />
      </form>
    </>
  );
}
