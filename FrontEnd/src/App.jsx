import { useState } from 'react';
import CreatePostModal from './components/CreatePostModal';
import Feed from './components/Feed';
import { api } from './services/api';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [prependPost, setPrependPost] = useState(null);
  const [updatedPost, setUpdatedPost] = useState(null);
  const [optimisticPost, setOptimisticPost] = useState(null);
  const [optimisticUpdatedPost, setOptimisticUpdatedPost] = useState(null);
  const [revertPost, setRevertPost] = useState(null);

  const handleSubmitPost = async (postData) => {
    const isEdit = postData.id && !String(postData.id).startsWith('temp-');
    if (isEdit) {
      const originalPost = editingPost;
      handleCloseModal();
      setOptimisticUpdatedPost({
        ...postData,
        id: originalPost.id,
        created_at: originalPost.created_at,
        updated_at: new Date().toISOString(),
      });
      try {
        const res = await api.updatePost(postData.id, {
          autor: postData.autor,
          categoria: postData.categoria,
          publicacao: postData.publicacao,
          imagem: postData.imagem,
        });
        const post = res?.data ?? res;
        if (post) setUpdatedPost(post);
      } catch (e) {
        setRevertPost(originalPost);
        setOptimisticUpdatedPost(null);
        alert('Erro ao atualizar post. Tente novamente.');
      }
      return;
    }
    handleCloseModal();
    const tempPost = {
      ...postData,
      id: 'temp-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    setOptimisticPost(tempPost);
    try {
      const created = await api.createPost(postData);
      const post = created?.data ?? created;
      if (post) setPrependPost(post);
    } catch (e) {
      setOptimisticPost(null);
      alert('Erro ao criar post. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-inner">
          <button
            className="btn-create-post"
            onClick={handleOpenCreate}
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="btn-icon">
              <line x1="4" y1="6" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Criar Post</span>
          </button>
        </div>
      </header>
      <main className="app-main">
        <div className="feed-wrapper">
          <Feed 
            onPostUpdate={(post) => { setEditingPost(post); setIsModalOpen(true); }}
            prependPost={prependPost}
            onPrependConsumed={() => { setPrependPost(null); setOptimisticPost(null); }}
            updatedPost={updatedPost}
            onUpdatedConsumed={() => { setUpdatedPost(null); setOptimisticUpdatedPost(null); }}
            optimisticPost={optimisticPost}
            onClearOptimistic={() => setOptimisticPost(null)}
            optimisticUpdatedPost={optimisticUpdatedPost}
            revertPost={revertPost}
            onRevertConsumed={() => setRevertPost(null)}
          />
        </div>
      </main>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPost}
        editPost={editingPost}
      />
    </div>
  );
}

export default App;
