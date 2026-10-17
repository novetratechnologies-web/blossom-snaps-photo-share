export default function StoryEditor({ articles, editingArticle, title, setTitle, excerpt, setExcerpt, content, setContent, published, setPublished, onSubmit, onCancel, onEdit, onDelete, busy, formatDate }) {
  return <>
    <form className="stack-form story-form" onSubmit={onSubmit}>
      <label htmlFor="story-title">STORY TITLE</label>
      <input id="story-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required placeholder="A day worth remembering" />
      <label htmlFor="story-excerpt">SHORT INTRODUCTION</label>
      <input id="story-excerpt" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} maxLength={500} placeholder="Optional introduction" />
      <label htmlFor="story-content">STORY</label>
      <textarea id="story-content" rows="5" value={content} onChange={(event) => setContent(event.target.value)} maxLength={20000} required placeholder="Write your story..." />
      <label className="checkbox-label"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Publish on the public homepage</label>
      <div className="story-form-actions">
        <button className="button button-dark" disabled={busy}>{editingArticle ? 'Update story' : 'Save story'} <span>↗</span></button>
        {editingArticle && <button className="text-button" type="button" onClick={onCancel}>Cancel editing</button>}
      </div>
    </form>
    <div className="story-admin-list">
      {articles.map((article) => <div className="story-admin-row" key={article.id}>
        <div><h3>{article.title}</h3><p>{article.published_at ? 'Published' : 'Draft'} · {formatDate(article.created_at)}</p></div>
        <button className="text-button" onClick={() => onEdit(article)}>Edit</button>
        <button className="text-button" onClick={() => onDelete(article)}>Delete</button>
      </div>)}
    </div>
  </>;
}
