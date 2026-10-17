import { useState } from 'react';
import ClientAlbumForm from '../forms/ClientAlbumForm.jsx';
import GalleryProjectCard from './GalleryProjectCard.jsx';

export default function GalleryManagementPanel({ projects, busy, albumForm, projectDetails, setProjectDetails, showcaseDetails, setShowcaseDetails, onUpload, onDeleteProject, onSaveDetails, onRegenerateCode, onSaveShowcaseDetails, onShowcaseChange, onReplace, onDeleteAsset }) {
  const [filter, setFilter] = useState('');
  const visibleProjects = projects.filter((project) => project.title.toLowerCase().includes(filter.trim().toLowerCase()));
  return <section className="panel !rounded-3xl !border !border-stone-200 !bg-white !p-5 !shadow-sm sm:!p-8">
    <div className="panel-heading gallery-panel-heading"><div><p className="eyebrow">CLIENT GALLERIES</p><h2>Client albums <span className="count-pill">{projects.length}</span></h2></div>
      {projects.length > 0 && <label className="gallery-search"><span className="sr-only">Search client albums</span><span aria-hidden="true">⌕</span><input type="search" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Find a client album" /></label>}
    </div>
    <p className="muted showcase-consent-note">Public titles, captions, and checked media appear on the website. Share only work and details you have permission to publish; unchecked media remains private.</p>
    <ClientAlbumForm {...albumForm} />
    <div className="project-list">
      {projects.length === 0 && <p className="muted">No galleries yet. Create a private link to get started.</p>}
      {projects.length > 0 && visibleProjects.length === 0 && <p className="muted gallery-empty">No albums match that search.</p>}
      {visibleProjects.map((project) => <GalleryProjectCard key={project.id} project={project} busy={busy} projectDetails={projectDetails} setProjectDetails={setProjectDetails} showcaseDetails={showcaseDetails} setShowcaseDetails={setShowcaseDetails} onUpload={onUpload} onDeleteProject={onDeleteProject} onSaveDetails={onSaveDetails} onRegenerateCode={onRegenerateCode} onSaveShowcaseDetails={onSaveShowcaseDetails} onShowcaseChange={onShowcaseChange} onReplace={onReplace} onDeleteAsset={onDeleteAsset} />)}
    </div>
  </section>;
}
