import React, { useEffect, useState } from 'react';
import { api } from '../shared/api.js';
import AccessCodeForm from './forms/AccessCodeForm.jsx';
import ClientGallery from './ClientGallery.jsx';

export default function ProjectPage({ slug, session }) {
  const [project, setProject] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const loadProject = async () => {
    const result = await api(`project-access.php?slug=${encodeURIComponent(slug)}`);
    setProject(result.project);
    setUnlocked(true);
  };

  useEffect(() => {
    loadProject().catch((reason) => {
      if (!reason.message.includes('access code')) setError(reason.message);
    });
  }, [slug]);

  const unlock = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await api(`project-access.php?slug=${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'X-CSRF-Token': session.csrfToken },
        body: JSON.stringify({ accessCode: code }),
      });
      setProject(result.project);
      setUnlocked(true);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };

  if (!unlocked) return <AccessCodeForm code={code} setCode={setCode} error={error} busy={busy} onUnlock={unlock} />;
  return <ClientGallery project={project} slug={slug} />;
}
