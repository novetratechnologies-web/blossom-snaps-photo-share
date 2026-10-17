import React, { useEffect, useState } from 'react';
import brandLogo from '../brand-logo.png';
import { api } from '../shared/api.js';
import { DEFAULT_HOME_CONTENT } from '../shared/content.js';
import AdminPage from '../admin/AdminPage.jsx';
import ProjectPage from '../client/ProjectPage.jsx';
import PublicLayout from '../public/PublicLayout.jsx';

export default function App() {
  const path = window.location.pathname;
  const projectSlug = path.match(/^\/project\/([a-f0-9]{32})\/?$/)?.[1];
  const isAdminPage = path.replace(/\/+$/, '') === '/studio-room';
  const requestedPage = path.replace(/^\/+|\/+$/g, '');
  const currentPage = ['portfolio', 'services', 'about', 'stories', 'contact'].includes(requestedPage) ? requestedPage : 'home';
  const [session, setSession] = useState(null);
  const [articles, setArticles] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [homeContent, setHomeContent] = useState(DEFAULT_HOME_CONTENT);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    document.title = homeContent.siteTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', homeContent.siteDescription);
    let icon = document.querySelector('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.appendChild(icon);
    }
    icon.href = brandLogo;
  }, [homeContent.siteTitle, homeContent.siteDescription]);

  useEffect(() => {
    api('session.php')
      .then((value) => setSession(value))
      .catch((error) => setNotice(error.message))
      .finally(() => setLoading(false));
    api('site-content.php')
      .then((value) => setHomeContent((current) => ({ ...current, ...value.content })))
      .catch((error) => setNotice(error.message));
    if (!isAdminPage && !projectSlug) {
      api('articles.php')
        .then((value) => setArticles(value.articles))
        .catch((error) => setNotice(error.message));
      api('portfolio.php')
        .then((value) => setPortfolio(value.projects))
        .catch((error) => setNotice(error.message));
    }
  }, [isAdminPage, projectSlug]);

  const updateSession = (value) => setSession((current) => ({ ...current, ...value }));

  if (loading) return <div className="loading">Just a moment...</div>;
  if (isAdminPage) return <AdminPage session={session} updateSession={updateSession} onError={setNotice} homeContent={homeContent} setHomeContent={setHomeContent} />;
  if (projectSlug) return <div className="client-site"><main><ProjectPage slug={projectSlug} session={session} /></main></div>;
  return <PublicLayout page={currentPage} articles={articles} portfolio={portfolio} homeContent={homeContent} notice={notice} />;
}
