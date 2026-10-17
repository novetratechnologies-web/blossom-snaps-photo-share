export default function ProjectMediaCard({ project, asset, busy, onShowcaseChange, onReplace, onDelete }) {
  return <div className="asset-admin-row">
    <div className="asset-admin-preview">{asset.mimeType.startsWith('video/')
      ? <video muted preload="metadata" src={`/api/media.php?id=${asset.id}`} aria-label={`Preview ${asset.name}`} />
      : <img loading="lazy" src={`/api/media.php?id=${asset.id}`} alt="" />}</div>
    <span className="asset-admin-name" title={asset.name}>{asset.name}</span>
    <label className="showcase-toggle"><input type="checkbox" checked={asset.isShowcase} onChange={(event) => onShowcaseChange(asset, event.target.checked)} /><span>Public showcase</span><small>{asset.isShowcase ? 'Visible publicly' : 'Private to client'}</small></label>
    <label className="upload-button asset-action">Replace<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={(event) => onReplace(project.id, asset, event)} /></label>
    <button className="text-button danger-button asset-action" type="button" onClick={() => onDelete(asset)}>Delete</button>
  </div>;
}
