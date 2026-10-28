import Reveal from './Reveal';

// Eyebrow + heading (with animated gold underline) + optional description or action (children) on the right
export default function SectionTitle({ eyebrow, title, description, children, as: Heading = 'h2', className = '' }) {
  return (
    <div className={`section-title ${className}`}>
      <Reveal className="section-title__main">
        {eyebrow && <span className="section-title__eyebrow">{eyebrow}</span>}
        {title && <Heading className="section-title__heading">{title}</Heading>}
        <span className="section-title__line" />
      </Reveal>
      {description && (
        <Reveal as="p" delay={0.15} className="section-title__desc">{description}</Reveal>
      )}
      {children && <Reveal delay={0.2} className="section-title__action">{children}</Reveal>}
    </div>
  );
}
