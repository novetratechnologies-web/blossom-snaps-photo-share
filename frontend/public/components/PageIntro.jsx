export default function PageIntro({ eyebrow, title, accent, description }) {
  return <div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title} <em>{accent}</em></h1>{description && <p>{description}</p>}</div>;
}
