import { formatDate } from '../../shared/content.js';

export default function ArticleGrid({ articles, homeContent }) {
  if (!articles.length) return <div className="empty-stories"><span className="empty-flower">✳</span><h3>{homeContent.storiesEmptyTitle}</h3><p>{homeContent.storiesEmptyDescription}</p></div>;
  return <div className="article-grid">{articles.map((article, index) => <article className="article-card" key={article.id}>
    <div className={`article-art article-art-${index % 3}`}><span>{String(index + 1).padStart(2, '0')}</span><i>✳</i></div>
    <p className="article-date">{formatDate(article.published_at || article.created_at)}</p><h3>{article.title}</h3>
    {article.excerpt && <p className="article-excerpt">{article.excerpt}</p>}<p className="article-content">{article.content}</p>
  </article>)}</div>;
}
