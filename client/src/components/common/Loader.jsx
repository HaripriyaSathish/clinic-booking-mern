import { MedicalCrossIcon } from './Icons';

export default function Loader({ fullScreen = false, label = 'Loading…' }) {
  return (
    <div className={`loader ${fullScreen ? 'loader--full' : ''}`} role="status">
      <span className="loader__mark"><MedicalCrossIcon size={26} /></span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
