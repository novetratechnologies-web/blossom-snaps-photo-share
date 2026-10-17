import React, { useEffect, useRef, useState } from 'react';
import { api, apiUpload } from '../shared/api.js';
import { formatDate } from '../shared/content.js';
import UploadProgressToast from './components/UploadProgressToast.jsx';
import HomepageContentForm from './forms/HomepageContentForm.jsx';
import StoryEditor from './forms/StoryEditor.jsx';
import GalleryManagementPanel from './components/GalleryManagementPanel.jsx';
import GalleryCreatedNotice from './components/GalleryCreatedNotice.jsx';

export default function Dashboard({ session, updateSession, onError, homeContent: initialHomeContent, setHomeContent: updateHomeContent }) {
  const [projects, setProjects] = useState([]);
  const [articles, setArticles] = useState([]);
  const [homeContent, setHomeContent] = useState(initialHomeContent);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showcaseTitle, setShowcaseTitle] = useState('');
  const [showcaseDescription, setShowcaseDescription] = useState('');
  const [showcaseDetails, setShowcaseDetails] = useState({});
  const [projectDetails, setProjectDetails] = useState({});
  const [storyTitle, setStoryTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [editingArticle, setEditingArticle] = useState(null);
  const [freshProject, setFreshProject] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadJobs, setUploadJobs] = useState([]);
  const [activePanel, setActivePanel] = useState('galleries');
  const uploadQueuesRef = useRef(new Map());
  const queuedUploadJobsRef = useRef([]);
  const activeUploadsRef = useRef(0);
  const uploadJobMetaRef = useRef(new Map());
  const csrf = { 'X-CSRF-Token': session.csrfToken };

  const refresh = async () => {
    const [projectResult, articleResult, contentResult] = await Promise.all([
      api('projects.php'),
      api('articles.php?admin=1'),
      api('site-content.php'),
    ]);
    setProjects(projectResult.projects);
    setProjectDetails((current) => Object.fromEntries(projectResult.projects.map((project) => [
      project.id,
      current[project.id] || { title: project.title, description: project.description || '' },
    ])));
    setShowcaseDetails((current) => Object.fromEntries(projectResult.projects.map((project) => [
      project.id,
      current[project.id] || { title: project.showcase_title || '', description: project.showcase_description || '' },
    ])));
    setArticles(articleResult.articles);
    setHomeContent(contentResult.content);
    updateHomeContent(contentResult.content);
  };

  useEffect(() => {
    refresh().catch((error) => onError(error.message));
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await api('projects.php', {
        method: 'POST', headers: csrf, body: JSON.stringify({ title, description, showcaseTitle, showcaseDescription }),
      });
      setFreshProject(result);
      setTitle('');
      setDescription('');
      setShowcaseTitle('');
      setShowcaseDescription('');
      await refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const updateUploadFile = (jobId, fileId, updates) => {
    setUploadJobs((jobs) => jobs.map((job) => job.id !== jobId ? job : {
      ...job,
      files: job.files.map((file) => file.id === fileId ? { ...file, ...updates } : file),
    }));
  };

  const startNextUploads = () => {
    while (activeUploadsRef.current < 4 && queuedUploadJobsRef.current.length) {
      const jobId = queuedUploadJobsRef.current.shift();
      const queue = uploadQueuesRef.current.get(jobId);
      const task = queue?.shift();
      if (!task) continue;
      if (queue.length) queuedUploadJobsRef.current.push(jobId);
      else uploadQueuesRef.current.delete(jobId);

      activeUploadsRef.current += 1;
      updateUploadFile(jobId, task.fileId, { status: 'uploading', percent: 0 });
      const body = new FormData();
      body.append('projectId', task.projectId);
      if (task.replaceAssetId) body.append('replaceAssetId', task.replaceAssetId);
      body.append('files[]', task.file);
      apiUpload('assets.php', body, csrf, (percent) => updateUploadFile(jobId, task.fileId, { percent }))
        .then(() => {
          updateUploadFile(jobId, task.fileId, { status: 'done', percent: 100 });
          uploadJobMetaRef.current.get(jobId).succeeded += 1;
        })
        .catch((error) => updateUploadFile(jobId, task.fileId, { status: 'error', percent: 0, error: error.message }))
        .finally(() => {
          const meta = uploadJobMetaRef.current.get(jobId);
          meta.finished += 1;
          activeUploadsRef.current -= 1;
          if (meta.finished === meta.total) {
            uploadJobMetaRef.current.delete(jobId);
            if (meta.succeeded) refresh().catch((error) => onError(error.message));
          }
          startNextUploads();
        });
    }
  };

  const uploadFiles = (projectId, event, replaceAssetId = null) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const jobId = crypto.randomUUID();
    const project = projects.find((item) => String(item.id) === String(projectId));
    const jobFiles = files.map((file, index) => ({
      id: `${jobId}-${index}`,
      name: file.name,
      size: file.size,
      percent: 0,
      status: file.size > 512 * 1024 * 1024 ? 'error' : 'queued',
      error: file.size > 512 * 1024 * 1024 ? 'Larger than the 512 MB per-file limit.' : '',
    }));
    const queue = [];
    files.forEach((file, index) => {
      if (file.size <= 512 * 1024 * 1024) queue.push({ projectId, replaceAssetId, file, fileId: jobFiles[index].id });
    });
    setUploadJobs((jobs) => [{ id: jobId, galleryTitle: project?.title || 'Client gallery', files: jobFiles }, ...jobs]);
    uploadJobMetaRef.current.set(jobId, { total: files.length, finished: files.length - queue.length, succeeded: 0 });
    if (queue.length) {
      uploadQueuesRef.current.set(jobId, queue);
      queuedUploadJobsRef.current.push(jobId);
      startNextUploads();
    } else uploadJobMetaRef.current.delete(jobId);
    event.target.value = '';
  };

  const replaceAsset = (projectId, asset, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadFiles(projectId, event, asset.id);
  };

  const deleteAsset = async (asset) => {
    if (!window.confirm(`Remove “${asset.name}” from this gallery? Clients will no longer be able to open it.`)) return;
    try {
      await api(`assets.php?id=${asset.id}`, { method: 'DELETE', headers: csrf });
      await refresh();
      setMessage('Media removed from the gallery.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveProjectDetails = async (event, project) => {
    event.preventDefault();
    const details = projectDetails[project.id] || project;
    try {
      await api('projects.php', {
        method: 'PUT', headers: csrf,
        body: JSON.stringify({ action: 'details', id: project.id, title: details.title, description: details.description }),
      });
      await refresh();
      setMessage('Client gallery details saved.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const regenerateAccessCode = async (project) => {
    if (!window.confirm(`Create a new access code for “${project.title}”? The previous code and active client sessions will stop working.`)) return;
    setBusy(true);
    try {
      const result = await api('projects.php', {
        method: 'PUT', headers: csrf,
        body: JSON.stringify({ action: 'regenerateAccessCode', id: project.id }),
      });
      setFreshProject({ ...result, project: { title: project.title } });
      setMessage('New client access details are ready.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const setAssetShowcase = async (asset, isShowcase) => {
    try {
      await api('assets.php', {
        method: 'PUT',
        headers: csrf,
        body: JSON.stringify({ id: asset.id, isShowcase }),
      });
      await refresh();
      setMessage(isShowcase ? 'Media added to the public portfolio.' : 'Media removed from the public portfolio.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveShowcaseDetails = async (event, projectId) => {
    event.preventDefault();
    const details = showcaseDetails[projectId] || { title: '', description: '' };
    try {
      await api('projects.php', {
        method: 'PUT', headers: csrf,
        body: JSON.stringify({ id: projectId, showcaseTitle: details.title, showcaseDescription: details.description }),
      });
      setMessage('Public portfolio details saved.');
      await refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteProject = async (project) => {
    if (!window.confirm(`Delete “${project.title}” and all its uploaded media?`)) return;
    try {
      await api(`projects.php?id=${project.id}`, { method: 'DELETE', headers: csrf });
      await refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveArticle = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await api('articles.php', {
        method: editingArticle ? 'PUT' : 'POST',
        headers: csrf,
        body: JSON.stringify({
          ...(editingArticle ? { id: editingArticle.id } : {}),
          title: storyTitle,
          excerpt,
          content,
          published,
        }),
      });
      resetArticleForm();
      await refresh();
      setMessage(editingArticle ? 'Story updated.' : 'Story saved.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const resetArticleForm = () => {
    setEditingArticle(null);
    setStoryTitle('');
    setExcerpt('');
    setContent('');
    setPublished(true);
  };

  const editArticle = (article) => {
    setEditingArticle(article);
    setStoryTitle(article.title);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setPublished(Boolean(article.published_at));
    document.getElementById('story-title')?.focus();
  };

  const saveHomeContent = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const result = await api('site-content.php', {
        method: 'POST',
        headers: csrf,
        body: JSON.stringify(homeContent),
      });
      setHomeContent(result.content);
      updateHomeContent(result.content);
      setMessage('Homepage content saved.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteArticle = async (article) => {
    if (!window.confirm(`Delete “${article.title}”?`)) return;
    try {
      await api(`articles.php?id=${article.id}`, { method: 'DELETE', headers: csrf });
      if (editingArticle?.id === article.id) resetArticleForm();
      await refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = async () => {
    try {
      const result = await api('session.php', { method: 'DELETE', headers: csrf });
      updateSession(result);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="dashboard !mx-auto !max-w-[1500px] !px-4 !py-8 sm:!px-8 lg:!px-12">
      <div className="dashboard-heading !mb-7 !rounded-3xl !border !border-rose-100 !bg-white !p-6 !shadow-sm sm:!p-8">
        <div><p className="eyebrow">BLOSSOM SNAPS · STUDIO</p><h1>Good to see you.</h1><p className="dashboard-email">{session.admin.email}</p></div>
        <div className="dashboard-heading-actions"><a className="studio-view-site" href="/" target="_blank" rel="noreferrer">View website ↗</a><button className="text-button" onClick={logout}>Sign out</button></div>
      </div>
      {message && <div className="notice" role="status">{message}</div>}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-md flex-col gap-3 overflow-y-auto sm:right-6 sm:top-6" aria-live="polite">
        {uploadJobs.map((job) => <UploadProgressToast key={job.id} progress={job} onDismiss={() => setUploadJobs((jobs) => jobs.filter((item) => item.id !== job.id))} />)}
      </div>
      <GalleryCreatedNotice result={freshProject} onDismiss={() => setFreshProject(null)} />
      <div className="studio-metrics !gap-3">
        <div><span>Client galleries</span><strong>{projects.length}</strong></div>
        <div><span>Selected portfolio pieces</span><strong>{projects.reduce((total, project) => total + Number(project.showcase_count || 0), 0)}</strong></div>
        <div><span>Stories</span><strong>{articles.length}</strong></div>
      </div>
      <nav className="studio-tabs !sticky !top-[76px] !z-10 !rounded-2xl !border !border-stone-200 !bg-white/95 !p-2 !shadow-sm !backdrop-blur" aria-label="Studio sections">
        <button className={activePanel === 'galleries' ? 'selected' : ''} onClick={() => setActivePanel('galleries')}>Client galleries</button>
        <button className={activePanel === 'website' ? 'selected' : ''} onClick={() => setActivePanel('website')}>Website content</button>
        <button className={activePanel === 'stories' ? 'selected' : ''} onClick={() => setActivePanel('stories')}>Stories</button>
      </nav>
      <div className="dashboard-columns !gap-6">
        <div className="dashboard-main">
          {activePanel === 'website' && <HomepageContentForm content={homeContent} onChange={setHomeContent} onSubmit={saveHomeContent} busy={busy} />}
          {activePanel === 'galleries' && <GalleryManagementPanel
            projects={projects} busy={busy}
            albumForm={{ title, setTitle, description, setDescription, showcaseTitle, setShowcaseTitle, showcaseDescription, setShowcaseDescription, onSubmit: createProject, busy }}
            projectDetails={projectDetails} setProjectDetails={setProjectDetails} showcaseDetails={showcaseDetails} setShowcaseDetails={setShowcaseDetails}
            onUpload={uploadFiles} onDeleteProject={deleteProject} onSaveDetails={saveProjectDetails} onRegenerateCode={regenerateAccessCode}
            onSaveShowcaseDetails={saveShowcaseDetails} onShowcaseChange={setAssetShowcase} onReplace={replaceAsset} onDeleteAsset={deleteAsset}
          />}          {activePanel === 'stories' && <section className="panel !rounded-3xl !border !border-stone-200 !bg-white !p-5 !shadow-sm sm:!p-8">
            <div className="panel-heading"><div><p className="eyebrow">THE JOURNAL</p><h2>Public stories <span className="count-pill">{articles.length}</span></h2></div></div>
            <StoryEditor articles={articles} editingArticle={editingArticle} title={storyTitle} setTitle={setStoryTitle} excerpt={excerpt} setExcerpt={setExcerpt} content={content} setContent={setContent} published={published} setPublished={setPublished} onSubmit={saveArticle} onCancel={resetArticleForm} onEdit={editArticle} onDelete={deleteArticle} busy={busy} formatDate={formatDate} />
          </section>}
        </div>
        <aside className="dashboard-aside">
          <div className="aside-note"><span>✳</span><p className="eyebrow">A NOTE FOR YOU</p><h3>Good work deserves a beautiful home.</h3><p>Your client's link is private. Remember to share their access code separately.</p></div>
          <div className="aside-stats"><p className="eyebrow">YOUR STUDIO AT A GLANCE</p><div><span>Private galleries</span><b>{projects.length}</b></div><div><span>Stories</span><b>{articles.length}</b></div></div>
        </aside>
      </div>
    </section>
  );
}
