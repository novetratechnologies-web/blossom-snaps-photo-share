export default function PortfolioGrid({ portfolio }) {
  if (!portfolio.length) return <div className="portfolio-empty"><span>✳</span><p>Our portfolio is growing. Come back soon to see selected stories.</p></div>;
  return <div className="portfolio-grid">{portfolio.map((project) => <article className="portfolio-card" key={project.id}>
    {project.assets.map((asset) => asset.mimeType.startsWith('video/')
      ? <video key={asset.id} controls preload="metadata" src={asset.url} />
      : <img key={asset.id} loading="lazy" src={asset.url} alt={asset.name} />)}
    <div><p className="eyebrow">BLOSSOM SNAPS · SELECTED STORY</p><h3>{project.title}</h3>{project.description && <p>{project.description}</p>}</div>
  </article>)}</div>;
}
