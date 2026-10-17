import brandLogo from '../brand-logo.png';
import PageIntro from './components/PageIntro.jsx';
import PortfolioGrid from './components/PortfolioGrid.jsx';
import ServiceCards from './components/ServiceCards.jsx';
import ArticleGrid from './components/ArticleGrid.jsx';

export function PublicPage({ page, articles, portfolio, homeContent }) {
  if (page === 'portfolio') return <PortfolioPage portfolio={portfolio} />;
  if (page === 'services') return <ServicesPage />;
  if (page === 'about') return <AboutPage />;
  if (page === 'stories') return <StoriesPage articles={articles} homeContent={homeContent} />;
  if (page === 'contact') return <ContactPage homeContent={homeContent} />;
  return <HomePage articles={articles} portfolio={portfolio} homeContent={homeContent} />;
}

function PortfolioPage({ portfolio }) {
  return <section className="editorial-page portfolio-page"><PageIntro eyebrow="A FEW FAVOURITE FRAMES" title="Made of" accent="real moments." description="A selection of stories, people, and places photographed with care." /><PortfolioGrid portfolio={portfolio} /></section>;
}

function ServicesPage() {
  return <section className="editorial-page services-page"><PageIntro eyebrow="PHOTOGRAPHY FOR YOUR STORY" title="Here for the moments" accent="you want to keep." description="A thoughtful, personal photography experience from the first hello to the final gallery." /><ServiceCards /><a className="button button-dark" href="/contact">Talk about your session <span>↗</span></a></section>;
}

function AboutPage() {
  return <section className="editorial-page about-page"><div className="about-mark"><img src={brandLogo} alt="Blossom Snaps" /></div><div><PageIntro eyebrow="A LITTLE ABOUT US" title="Photographs that" accent="feel like you." /><p>Blossom Snaps is here to preserve the feeling of a moment, not just how it looked. We make thoughtful, natural photographs for people who want to hold on to the good stuff.</p><p>Our sessions are relaxed, people-first, and guided by the small details that make your story yours. The result is a collection that feels honest today and meaningful for years to come.</p><a className="button button-dark" href="/contact">Let’s meet <span>↗</span></a></div></section>;
}

function StoriesPage({ articles, homeContent }) {
  return <section className="editorial-page stories-page"><PageIntro eyebrow={homeContent.storiesEyebrow} title={homeContent.storiesTitle} accent={homeContent.storiesTitleAccent} description="Notes from behind the lens and the stories we love to remember." /><ArticleGrid articles={articles} homeContent={homeContent} /></section>;
}

function ContactPage({ homeContent }) {
  return <section className="editorial-page contact-page"><PageIntro eyebrow="LET’S MAKE SOMETHING YOU’LL KEEP" title="Have a date or a story" accent="in mind?" description="Tell us a little about what you’re planning. We’d love to hear from you and help shape a session that feels like you." />
    <div className="contact-card"><img src={brandLogo} alt="Blossom Snaps" />{homeContent.contactEmail
      ? <><p>For bookings and enquiries, email us at</p><a className="contact-email" href={`mailto:${homeContent.contactEmail}`}>{homeContent.contactEmail}</a></>
      : <p>Enquiries are being set up. Please check back soon.</p>}</div>
  </section>;
}

function HomePage({ articles, portfolio, homeContent }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{homeContent.heroEyebrow}</p>
          <h1>{homeContent.heroTitle}<br /><em>{homeContent.heroTitleAccent}</em></h1>
          <p className="hero-intro">{homeContent.heroIntro}</p>
          <a className="button button-dark" href="/portfolio">Explore the portfolio <span>↗</span></a>
        </div>
        <div className="hero-art" aria-label="Photography by Blossom Snaps">
          {homeContent.heroImageUrl ? (
            <img className="hero-photo" src={homeContent.heroImageUrl} alt="" />
          ) : (
            <>
              <div className="sun"></div>
              <div className="art-frame"><span>{homeContent.heroArtTitle}</span><i>✳</i></div>
            </>
          )}
          <span className="art-caption">{homeContent.heroArtCaption}</span>
        </div>
        <span className="hero-index">{homeContent.heroIndex}</span>
      </section>
      <section className="portfolio-section">
        <div className="section-heading">
          <div><p className="eyebrow">A FEW FAVOURITE FRAMES</p><h2>Made of <em>real moments.</em></h2></div>
          <span className="section-count">SELECTED WORK</span>
        </div>
        <PortfolioGrid portfolio={portfolio.slice(0, 2)} />
        <a className="text-link-inline section-link" href="/portfolio">View all selected work ↗</a>
      </section>
      <section className="services-section">
        <p className="eyebrow">PHOTOGRAPHY FOR YOUR STORY</p><h2>Here for the moments<br /><em>you want to keep.</em></h2>
        <ServiceCards /><a className="text-link-inline section-link" href="/services">Explore services ↗</a>
      </section>
      <section className="about-section">
        <div className="about-mark"><img src={brandLogo} alt="Blossom Snaps" /></div>
        <div><p className="eyebrow">A LITTLE ABOUT US</p><h2>Photographs that<br /><em>feel like you.</em></h2><p>Blossom Snaps is here to preserve the feeling of a moment, not just how it looked. We make thoughtful, natural photographs for people who want to hold on to the good stuff.</p><a className="text-link-inline" href="/about">Get to know us ↗</a></div>
      </section>
      <section className="stories-section">
        <div className="section-heading">
          <div><p className="eyebrow">{homeContent.storiesEyebrow}</p><h2>{homeContent.storiesTitle} <em>{homeContent.storiesTitleAccent}</em></h2></div>
          <span className="section-count">{String(articles.length).padStart(2, '0')} {homeContent.storiesTitleAccent.toUpperCase()}</span>
        </div>
        <ArticleGrid articles={articles.slice(0, 3)} homeContent={homeContent} />
        <a className="text-link-inline section-link" href="/stories">Read all stories ↗</a>
      </section>
      <section className="client-banner">
        <span className="banner-flower">✳</span>
        <div><p className="eyebrow">LET’S MAKE SOMETHING YOU’LL KEEP</p><h2>Have a date or a story in mind?</h2><p>We’d love to hear about it and help you plan a session that feels like you.</p></div>
        <a className="button button-light" href="/contact">Enquire with us <span>↗</span></a>
      </section>
    </>
  );
}
