import brandLogo from '../../brand-logo.png';

export default function AccessCodeForm({ code, setCode, error, busy, onUnlock }) {
  return <section className="access-shell min-h-[calc(100vh-88px)] px-4 py-10 sm:px-6">
    <div className="access-card mx-auto w-full max-w-xl rounded-3xl border border-rose-100 bg-white p-7 shadow-[0_24px_80px_rgba(65,25,30,0.10)] sm:p-12">
      <img className="mb-7 h-12 w-auto max-w-full object-contain" src={brandLogo} alt="Blossom Snaps" />
      <span className="access-flower">✳</span>
      <p className="eyebrow">A LITTLE SOMETHING JUST FOR YOU</p>
      <h1>Your memories<br /><em>are waiting.</em></h1>
      <p>Enter the private access code shared with you to open your gallery.</p>
      <form onSubmit={onUnlock} className="stack-form">
        <label htmlFor="access-code">YOUR ACCESS CODE</label>
        <input className="!min-h-12 !rounded-xl !border-stone-300 !bg-stone-50 !px-4 text-center !text-lg !tracking-[.22em] focus:!border-red-500 focus:!outline-none focus:!ring-4 focus:!ring-red-100" id="access-code" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Enter your code" required maxLength={16} />
        {error && <p className="form-error">{error}</p>}
        <button className="button button-dark full-button" disabled={busy}>{busy ? 'Opening...' : 'Open my gallery'} <span>↗</span></button>
      </form>
      <a href="/" className="text-link">← Back to Blossom Snaps</a>
    </div>
  </section>;
}
