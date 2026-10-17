import brandLogo from '../brand-logo.png';
import { PublicPage } from './PublicPages.jsx';

export default function PublicLayout({ page, articles, portfolio, homeContent, notice }) {
  return <div className="public-site">
    <header className="site-header">
      <a className="brand" href="/" aria-label="Blossom Snaps home"><img src={brandLogo} alt="Blossom Snaps" /></a>
      <nav aria-label="Main navigation">
        <a className={page === 'portfolio' ? 'active' : ''} href="/portfolio">Portfolio</a>
        <a className={page === 'services' ? 'active' : ''} href="/services">Services</a>
        <a className={page === 'about' ? 'active' : ''} href="/about">About</a>
        <a className={page === 'stories' ? 'active' : ''} href="/stories">Stories</a>
        <a className="nav-cta" href="/contact">Let’s talk <span>↗</span></a>
      </nav>
    </header>
    {notice && <div className="notice" role="alert">{notice}</div>}
    <main><PublicPage page={page} articles={articles} portfolio={portfolio} homeContent={homeContent} /></main>
    <footer className="site-footer">
      <a className="brand footer-brand" href="/" aria-label="Blossom Snaps home"><img src={brandLogo} alt="Blossom Snaps" /></a>
      <span>{homeContent.footerTagline}</span><span>Photography, held close.</span>
    </footer>
  </div>;
}
