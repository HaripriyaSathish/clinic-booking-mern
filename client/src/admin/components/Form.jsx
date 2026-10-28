// Small building blocks shared by admin editor pages

export function PageHeader({ title, description, children }) {
  return (
    <div className="a-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="a-page-header__actions">{children}</div>}
    </div>
  );
}

export function Card({ title, description, children, className = '' }) {
  return (
    <section className={`a-card ${className}`}>
      {title && (
        <header className="a-card__head">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

// <AField label="Title" error={errors.title}><input {...register('title')} /></AField>
export function AField({ label, hint, error, full, children }) {
  return (
    <label className={`a-field ${full ? 'a-field--full' : ''}`}>
      <span>{label}</span>
      {children}
      {hint && !error && <small className="a-field__hint">{hint}</small>}
      {error && <small className="a-field__error">{error.message}</small>}
    </label>
  );
}

export function SaveBar({ saving, dirty = true, label = 'Save changes' }) {
  return (
    <div className="a-savebar">
      <button type="submit" className="btn btn--primary" disabled={saving || !dirty}>
        {saving ? 'Saving…' : label}
      </button>
    </div>
  );
}

export function ComingSoon({ title }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <p className="a-muted">This editor will be added when the {title} section of the website is built.</p>
      </Card>
    </>
  );
}
