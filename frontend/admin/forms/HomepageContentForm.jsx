import { HOME_CONTENT_FIELDS } from '../../shared/content.js';

export default function HomepageContentForm({ content, onChange, onSubmit, busy }) {
  return <section className="panel !rounded-3xl !border !border-stone-200 !bg-white !p-5 !shadow-sm sm:!p-8">
    <div className="panel-heading"><div><p className="eyebrow">YOUR PUBLIC WEBSITE</p><h2>Homepage content</h2></div></div>
    <form className="home-content-form" onSubmit={onSubmit}>
      {HOME_CONTENT_FIELDS.map((field) => (
        <div className="home-content-field" key={field.key}>
          <label htmlFor={`home-${field.key}`}>{field.label}</label>
          {field.multiline ? <textarea
            id={`home-${field.key}`} rows="2"
            maxLength={field.key === 'heroIntro' || field.key === 'heroArtTitle' || field.key === 'siteDescription' ? 1000 : 500}
            value={content[field.key] || ''}
            onChange={(event) => onChange((current) => ({ ...current, [field.key]: event.target.value }))}
          /> : <input
            id={`home-${field.key}`} type={field.type || 'text'} maxLength="500"
            value={content[field.key] || ''}
            onChange={(event) => onChange((current) => ({ ...current, [field.key]: event.target.value }))}
            placeholder={field.key === 'heroImageUrl' ? 'https://example.com/your-photo.jpg' : undefined}
          />}
        </div>
      ))}
      <button className="button button-dark" disabled={busy}>Save homepage <span>↗</span></button>
    </form>
  </section>;
}
