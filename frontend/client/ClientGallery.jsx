import brandLogo from '../brand-logo.png';

function ClientMediaCard({ asset }) {
  return <figure className="gallery-item group !overflow-hidden !rounded-2xl !border !border-stone-200 !bg-white !shadow-sm">
    {asset.mimeType.startsWith('video/')
      ? <video className="!aspect-[4/3] !w-full !bg-stone-950 !object-contain" controls preload="metadata" src={asset.url} />
      : <img className="!aspect-[4/3] !w-full !object-cover" loading="lazy" src={asset.url} alt={asset.name} />}
    <figcaption className="!flex !items-center !justify-between !gap-3 !px-4 !py-3">
      <span className="min-w-0 truncate" title={asset.name}>{asset.name}</span>
      <a className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-rose-50" href={`${asset.url}&download=1`} download aria-label={`Download ${asset.name}`}>Download <span aria-hidden="true">↓</span></a>
    </figcaption>
  </figure>;
}

export default function ClientGallery({ project, slug }) {
  return <section className="gallery-section !mx-auto !max-w-[1500px] !px-4 !py-10 sm:!px-8 lg:!px-12">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-rose-100 pb-6">
      <div className="min-w-0">
        <img className="mb-5 h-10 w-auto max-w-full object-contain" src={brandLogo} alt="Blossom Snaps" />
        <p className="eyebrow">YOUR PRIVATE GALLERY · {project?.assets.length || 0} FILES</p>
        <h1 className="!text-4xl sm:!text-5xl">{project?.title || 'Your gallery'}</h1>
        {project?.description && <p className="gallery-description !mb-0">{project.description}</p>}
      </div>
      {project?.assets.length > 0 && <a className="button button-dark rounded-xl !justify-center !gap-3 !px-5 !py-4 shadow-sm" href={`/api/project-download.php?slug=${encodeURIComponent(slug)}`} download>
        Download album <span>↓</span>
      </a>}
    </div>
    <div className="gallery-grid !grid-cols-1 !gap-5 sm:!grid-cols-2 xl:!grid-cols-3">
      {project?.assets.map((asset) => <ClientMediaCard asset={asset} key={asset.id} />)}
      {project?.assets.length === 0 && <p className="muted rounded-2xl border border-dashed border-rose-200 bg-white p-10 text-center sm:col-span-2 xl:col-span-3">Your gallery is ready. Photos and videos will appear here soon.</p>}
    </div>
  </section>;
}
