import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { api } from '../services/api';
import './Feed.css';

const Feed = ({ refreshTrigger, onPostUpdate }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPosts();
      
      // A API retorna um array diretamente ou dentro de data
      const postsArray = Array.isArray(data) ? data : (data.data || []);
      
      // Ordenar por data decrescente (mais recente primeiro)
      const sortedPosts = [...postsArray].sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });
      
      setPosts(sortedPosts);
    } catch (err) {
      setError('Erro ao carregar posts. Tente novamente.');
      console.error('Erro ao buscar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="loading-spinner"></div>
        <p>Carregando posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-error">
        <p>{error}</p>
        <button onClick={fetchPosts} className="retry-btn">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="feed-empty">
        <p>Nenhum post ainda. Crie o primeiro post!</p>
      </div>
    );
  }

  const handleEdit = (post) => {
    // Chamar callback para abrir modal de edição
    if (onPostUpdate) {
      onPostUpdate(post);
    }
  };

  const handleDelete = async (post) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await api.deletePost(post.id);
        // Remover o post da lista localmente (atualização instantânea)
        setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        alert('Erro ao excluir post. Tente novamente.');
        // Se der erro, recarregar a lista completa
        fetchPosts();
      }
    }
  };

  return (
    <div className="feed-container">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
      {posts.length > 0 && (
        <div className="feed-end-message">
          Não existem mais itens a serem exibidos.
        </div>
      )}
    </div>
  );
};

export default Feed;
