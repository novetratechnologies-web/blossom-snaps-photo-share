import React, { useState } from 'react';
import { api } from '../shared/api.js';

export default function LoginForm({ session, updateSession }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await api('session.php', {
        method: 'POST',
        headers: { 'X-CSRF-Token': session.csrfToken },
        body: JSON.stringify({ email, password }),
      });
      updateSession(result);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="admin-shell">
      <form className="admin-card stack-form" onSubmit={submit}>
        <p className="eyebrow">THE STUDIO</p>
        <h1>Welcome <em>back.</em></h1>
        <p className="muted">Sign in to manage galleries and stories.</p>
        <label htmlFor="admin-email">EMAIL ADDRESS</label>
        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="admin-password">PASSWORD</label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error && <p className="form-error">{error}</p>}
        <button className="button button-dark full-button" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'} <span>↗</span></button>
      </form>
    </section>
  );
}
