export default function UploadProgressToast({ progress, onDismiss }) {
  if (!progress) return null;
  const totalBytes = progress.files.reduce((sum, file) => sum + file.size, 0);
  const sentBytes = progress.files.reduce((sum, file) => sum + file.size * (file.status === 'done' ? 1 : file.percent / 100), 0);
  const percent = totalBytes ? Math.min(100, Math.floor((sentBytes / totalBytes) * 100)) : 0;
  const finished = progress.files.filter((file) => file.status === 'done' || file.status === 'error').length;
  const failures = progress.files.filter((file) => file.status === 'error');
  const complete = finished === progress.files.length;
  const activeFiles = progress.files.filter((file) => file.status === 'uploading');
  const queuedFiles = progress.files.filter((file) => file.status === 'queued').length;
  const label = !complete
    ? (activeFiles.length ? `Uploading · ${activeFiles.length} active` : 'Waiting to upload')
    : (failures.length ? 'Upload finished with errors' : 'Upload complete');

  return <section className="pointer-events-auto max-h-[76vh] overflow-y-auto rounded-2xl border border-rose-100 bg-white p-4 shadow-2xl ring-1 ring-black/5 sm:p-5" role="status" aria-live="polite">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="mb-1 text-sm font-bold text-stone-800">{label}</p>
        <p className="m-0 truncate text-xs font-semibold text-red-800" title={progress.galleryTitle}>{progress.galleryTitle}</p>
        <p className="mb-0 mt-1 truncate text-[11px] text-stone-500">
          {finished} of {progress.files.length} files finished{queuedFiles ? ` · ${queuedFiles} waiting` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${complete && failures.length === 0 ? 'bg-emerald-50 text-emerald-700' : failures.length ? 'bg-rose-50 text-rose-700' : 'bg-stone-100 text-stone-600'}`}>{percent}%</span>
        {complete && <button className="grid h-7 w-7 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700" type="button" aria-label={`Dismiss upload for ${progress.galleryTitle}`} onClick={onDismiss}>×</button>}
      </div>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-label={`Upload progress for ${progress.galleryTitle}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}>
      <div className={`h-full rounded-full transition-[width] duration-200 ${complete && failures.length === 0 ? 'bg-emerald-500' : failures.length ? 'bg-rose-600' : 'bg-red-600'}`} style={{ width: `${percent}%` }} />
    </div>
    {(activeFiles.length > 0 || failures.length > 0) && <ul className="mb-0 mt-3 space-y-1.5">
      {[...activeFiles.map((file) => ({ ...file, detail: `${file.percent}%` })), ...failures.map((file) => ({ ...file, detail: file.error || 'Upload failed' }))]
        .slice(0, 5)
        .map((file) => <li key={file.id} className="flex min-w-0 items-center justify-between gap-3 text-[11px]">
          <span className="truncate text-stone-600" title={file.name}>{file.name}</span>
          <span className={`shrink-0 ${file.status === 'error' ? 'text-rose-700' : 'text-stone-500'}`} title={file.error}>{file.detail}</span>
        </li>)}
      {activeFiles.length + failures.length > 5 && <li className="text-[11px] text-stone-500">And {activeFiles.length + failures.length - 5} more…</li>}
    </ul>}
  </section>;
}
