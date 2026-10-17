import { useState } from 'react';

export default function GalleryCreatedNotice({ result, onDismiss }) {
  const [copied, setCopied] = useState('');

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('Copy is unavailable here. Select the value and copy it.');
    }
  };

  if (!result) return null;
  return <section className="success-panel !mt-0 !mb-6 !rounded-2xl !bg-white !p-5 sm:!p-6" aria-labelledby="gallery-created-title" role="status">
    <span className="success-icon">✓</span>
    <div className="min-w-0">
      <p className="eyebrow !mb-2">GALLERY READY</p>
      <h2 id="gallery-created-title" className="!mb-2 !text-xl">{result.project?.title ? `Access details for ${result.project.title}` : 'Your private gallery is ready.'}</h2>
      <p className="!mb-4 !text-sm !text-stone-600">A unique client code was generated automatically. Save it now and share it separately from the private gallery link.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-stone-200 bg-stone-50 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">Private gallery link</p>
          <a className="block truncate text-sm font-semibold text-red-800 underline decoration-rose-200 underline-offset-4" href={result.link}>{result.link}</a>
          <button className="mt-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100" type="button" onClick={() => copy('Link copied', result.link)}>{copied === 'Link copied' ? 'Link copied ✓' : 'Copy link'}</button>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-800">Client access code</p>
          <code className="block break-all text-xl font-extrabold tracking-[.18em] text-stone-900">{result.accessCode}</code>
          <button className="mt-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-red-800 hover:bg-rose-100" type="button" onClick={() => copy('Code copied', result.accessCode)}>{copied === 'Code copied' ? 'Code copied ✓' : 'Copy access code'}</button>
        </div>
      </div>
      {copied && !['Link copied', 'Code copied'].includes(copied) && <p className="mb-0 mt-2 text-xs text-amber-800">{copied}</p>}
    </div>
    <button className="text-button" type="button" aria-label="Dismiss gallery access details" onClick={onDismiss}>Dismiss</button>
  </section>;
}
