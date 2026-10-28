import { useState } from 'react';

// "Dr. Vikram Iyer" -> "VI"
const initials = (name = '') =>
  name.replace(/^Dr\.?\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Doctor photo with a branded initials fallback when no photo is uploaded (or it fails to load)
export default function DoctorPhoto({ doctor, className = '' }) {
  const [failed, setFailed] = useState(false);
  const showImage = doctor.photo_url && !failed;
  return (
    <div className={`doctor-photo ${className}`}>
      {showImage ? (
        <img src={doctor.photo_url} alt={doctor.name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="doctor-photo__initials" aria-label={doctor.name}>{initials(doctor.name)}</span>
      )}
    </div>
  );
}

// "Dr. Meera Chatterjee" -> "Dr. Meera"
export const shortName = (name = '') => {
  const parts = name.split(/\s+/);
  return /^Dr\.?$/i.test(parts[0]) ? parts.slice(0, 2).join(' ') : parts[0];
};
