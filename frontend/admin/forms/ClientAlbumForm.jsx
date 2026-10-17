export default function ClientAlbumForm({ title, setTitle, description, setDescription, showcaseTitle, setShowcaseTitle, showcaseDescription, setShowcaseDescription, onSubmit, busy }) {
  return <form className="new-gallery-form" onSubmit={onSubmit}>
    <div className="new-gallery-intro"><span aria-hidden="true">＋</span><div><h3>Create a client album</h3><p>A private link and unique access code are generated automatically. You can add photos and videos now or later.</p></div></div>
    <div className="new-gallery-fields">
      <label htmlFor="project-title">Client or album name<input id="project-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. The Morgan Family" maxLength={160} required /></label>
      <label htmlFor="project-description">A note for the client <span>Optional</span><input id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A short welcome or session note" maxLength={5000} /></label>
    </div>
    <details className="public-album-options">
      <summary>Set up an optional public portfolio feature</summary>
      <div className="new-gallery-fields">
        <label htmlFor="showcase-title">Public title<input id="showcase-title" value={showcaseTitle} onChange={(event) => setShowcaseTitle(event.target.value)} placeholder="Shown only if selected media is public" maxLength={160} /></label>
        <label htmlFor="showcase-description">Public caption<input id="showcase-description" value={showcaseDescription} onChange={(event) => setShowcaseDescription(event.target.value)} placeholder="Optional portfolio caption" maxLength={5000} /></label>
      </div>
    </details>
    <button className="button button-dark" disabled={busy}>Create private album <span>↗</span></button>
  </form>;
}
