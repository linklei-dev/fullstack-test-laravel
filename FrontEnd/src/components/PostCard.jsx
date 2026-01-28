import { useState } from 'react';
import { api } from '../services/api';
import './PostCard.css';

const MAX_PREVIEW = 500;
const AVATAR = '/assets/avatar_default.png';

export default function PostCard({ post, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const text = post.publicacao || '';
  const needsExpand = text.length > MAX_PREVIEW;
  const displayText = expanded || !needsExpand ? text : text.slice(0, MAX_PREVIEW);
  const showLeiaMais = needsExpand && !expanded;

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;
    setDeleting(true);
    setMenuOpen(false);
    try {
      await api.deletePost(post.id);
      window.location.reload();
    } catch (e) {
      alert('Erro ao excluir. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="post-card">
      <div className="post-card-header">
        <img src={AVATAR} alt="" className="post-card-avatar" />
        <div className="post-card-meta">
          <span className="post-card-author">{post.autor}</span>
          <span className="post-card-category">{post.categoria}</span>
        </div>
        <div className="post-card-actions">
          <button
            type="button"
            className="post-card-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            disabled={deleting}
          >
            <img src="/assets/dotdotdot.svg" alt="" />
          </button>
          {menuOpen && (
            <>
              <div className="post-card-menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="post-card-menu">
                <button type="button" onClick={() => { onEdit(post); setMenuOpen(false); }}>
                  <img src="/assets/btn_edit.svg" alt="" /> Editar
                </button>
                <button type="button" onClick={handleDelete}>
                  <img src="/assets/btn_delete.svg" alt="" /> Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="post-card-body">
        <p className="post-card-text">
          {displayText}
          {showLeiaMais && (
            <button type="button" className="post-card-leia-mais" onClick={() => setExpanded(true)}>
              Leia mais...
            </button>
          )}
        </p>
        {post.imagem && (
          <div className="post-card-image-wrap">
            <img src={post.imagem} alt="" className="post-card-image" />
          </div>
        )}
      </div>
    </article>
  );
}
