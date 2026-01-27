import { useState } from 'react';
import CreatePostModal from './components/CreatePostModal';
import Feed from './components/Feed';
import { api } from './services/api';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreatePost = async (postData) => {
    try {
      await api.createPost(postData);
      // Atualizar o feed após criar o post
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      throw error; // Re-throw para o modal tratar
    }
  };

  return (
    <div className="app-container">
      <main className="app-main">
        <div className="feed-wrapper">
          <button 
            className="btn-create-post"
            onClick={() => setIsModalOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="btn-icon">
              <line x1="4" y1="6" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Criar Post</span>
          </button>
          <Feed refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}

export default App;
