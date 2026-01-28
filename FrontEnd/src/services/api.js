const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  getPosts: async (page = 1, perPage = 15) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar posts');
    }
    
    return response.json();
  },

  createPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar post');
    }
    
    return response.json();
  },

  updatePost: async (postId, postData) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar post');
    }
    
    return response.json();
  },

  deletePost: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao deletar post');
    }
    
    return response.ok;
  },
};
