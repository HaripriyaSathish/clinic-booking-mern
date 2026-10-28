import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from '../../components/common/Icons';

const MAX_MB = 5;

// Shows the current image (or a newly picked file) and hands the File to the parent
export default function ImageUploader({ label = 'Image', currentUrl, onChange, hint, round = false }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image file');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Image must be under ${MAX_MB}MB`);
    setError('');
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const src = preview || currentUrl;

  return (
    <div className="a-uploader">
      <span className="a-uploader__label">{label}</span>
      <button
        type="button"
        className={`a-uploader__box ${round ? 'a-uploader__box--round' : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        {src ? <img src={src} alt="" /> : (
          <span className="a-uploader__empty"><ImageIcon size={28} /> Click to upload</span>
        )}
        <span className="a-uploader__overlay">{src ? 'Change image' : 'Upload image'}</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
      {preview && <small className="a-uploader__note">New image selected — click Save to upload.</small>}
      {hint && !preview && <small className="a-uploader__note">{hint}</small>}
      {error && <small className="a-field__error">{error}</small>}
    </div>
  );
}
