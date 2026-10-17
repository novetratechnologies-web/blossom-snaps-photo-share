import ProjectMediaCard from './ProjectMediaCard.jsx';

export default function GalleryProjectCard({ project, busy, projectDetails, setProjectDetails, showcaseDetails, setShowcaseDetails, onUpload, onDeleteProject, onSaveDetails, onRegenerateCode, onSaveShowcaseDetails, onShowcaseChange, onReplace, onDeleteAsset }) {
  return <article className="project-row !rounded-2xl !border !border-stone-200 !bg-white !p-4 sm:!p-6">
    <div className="project-heading">
      <div className="project-icon">✳</div>
      <div className="project-info"><div className="project-title-line"><h3>{project.title}</h3><span className="private-badge">Private album</span></div><p>{project.asset_count} {Number(project.asset_count) === 1 ? 'item' : 'items'} · {project.showcase_count} public · <a href={`/project/${project.slug}`} target="_blank" rel="noreferrer">Preview gallery ↗</a></p></div>
      <div className="project-actions">
        <label className="upload-button">＋ Add photos or videos<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" multiple onChange={(event) => onUpload(project.id, event)} /></label>
        <button className="delete-gallery-button" title={`Delete ${project.title}`} onClick={() => onDeleteProject(project)}>Delete album</button>
      </div>
    </div>
    <details className="gallery-settings">
      <summary><span>Client access & album details</span><span className="settings-summary-link">Manage details, link and access code</span></summary>
      <form className="gallery-details-form" onSubmit={(event) => onSaveDetails(event, project)}>
        <label>Client or album name<input required maxLength={160} value={projectDetails[project.id]?.title || ''} onChange={(event) => setProjectDetails((current) => ({ ...current, [project.id]: { ...current[project.id], title: event.target.value } }))} /></label>
        <label>Private note shown in gallery<textarea rows="2" maxLength={5000} value={projectDetails[project.id]?.description || ''} onChange={(event) => setProjectDetails((current) => ({ ...current, [project.id]: { ...current[project.id], description: event.target.value } }))} /></label>
        <div className="gallery-detail-actions"><button className="text-button">Save gallery details</button><button className="text-button" type="button" disabled={busy} onClick={() => onRegenerateCode(project)}>Create new access code</button></div>
        <p className="muted">Changing the code closes access for clients using the previous code. The private link stays the same.</p>
      </form>
    </details>
    <details className="gallery-settings public-settings">
      <summary><span>Public portfolio details</span><span className="settings-summary-link">Optional title and caption</span></summary>
      <form className="showcase-details-form" onSubmit={(event) => onSaveShowcaseDetails(event, project.id)}>
        <label>Public title<input maxLength={160} value={showcaseDetails[project.id]?.title || ''} onChange={(event) => setShowcaseDetails((current) => ({ ...current, [project.id]: { ...current[project.id], title: event.target.value } }))} /></label>
        <label>Public caption<input maxLength={5000} value={showcaseDetails[project.id]?.description || ''} onChange={(event) => setShowcaseDetails((current) => ({ ...current, [project.id]: { ...current[project.id], description: event.target.value } }))} /></label>
        <button className="text-button">Save public details</button>
      </form>
    </details>
    {project.assets?.length > 0 && <div className="project-media-list" aria-label={`Media in ${project.title}`}>
      {project.assets.map((asset) => <ProjectMediaCard key={asset.id} project={project} asset={asset} busy={busy} onShowcaseChange={onShowcaseChange} onReplace={onReplace} onDelete={onDeleteAsset} />)}
    </div>}
  </article>;
}
