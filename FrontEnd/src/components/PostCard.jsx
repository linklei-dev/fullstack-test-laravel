import { useState, useEffect, useRef } from 'react';
import './PostCard.css';

const PostCard = ({ post, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Formatar data e hora no formato "Publicado em [dia] de [mês] de [ano] às [hora]"
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate();
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `Publicado em ${day} de ${month} de ${year} às ${hours}:${minutes}`;
  };

  // Verificar se precisa mostrar "ler mais"
  const needsReadMore = post.publicacao && post.publicacao.length > 500;

  // Obter texto a exibir
  const getDisplayText = () => {
    if (!post.publicacao) return '';
    if (!needsReadMore || isExpanded) return post.publicacao;
    return post.publicacao.substring(0, 500) + '...';
  };

  const displayText = getDisplayText();

  // Capitalizar primeira letra da categoria
  const categoriaCapitalized = post.categoria 
    ? post.categoria.charAt(0).toUpperCase() + post.categoria.slice(1)
    : 'Post';

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.autor_imagem ? (
              <img src={post.autor_imagem} alt={post.autor} />
            ) : (
              <img src="/assets/avatar_default.png" alt="Avatar padrão" />
            )}
          </div>
          <div className="author-info">
            <div className="author-name">{post.autor || 'Autor desconhecido'}</div>
            <div className="post-meta">
              <span className="category-icon">📄</span>
              <span className="category-text">{categoriaCapitalized}</span>
              <span className="post-date">{formatDateTime(post.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="post-actions" ref={menuRef}>
          <button
            className="menu-toggle"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Menu de ações"
          >
            <img src="/assets/dotdotdot.svg" alt="Menu" className="menu-icon" />
          </button>
          {showMenu && (
            <div className="action-menu">
              <button
                className="action-menu-item"
                onClick={() => {
                  setShowMenu(false);
                  if (onEdit) onEdit(post);
                }}
              >
                <img src="/assets/btn_edit.svg" alt="Editar" className="action-icon" />
                <span>Editar</span>
              </button>
              <button
                className="action-menu-item"
                onClick={() => {
                  setShowMenu(false);
                  if (onDelete) onDelete(post);
                }}
              >
                <img src="/assets/btn_delete.svg" alt="Excluir" className="action-icon" />
                <span>Excluir</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="post-content">
        <p className="post-resumo">{displayText}</p>
        {needsReadMore && (
          <button 
            className="read-more-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ler menos' : 'Leia mais...'}
          </button>
        )}
      </div>

      {post.imagem && (
        <div className="post-image">
          <img src={post.imagem} alt="Post" />
        </div>
      )}
    </article>
  );
};

export default PostCard;
