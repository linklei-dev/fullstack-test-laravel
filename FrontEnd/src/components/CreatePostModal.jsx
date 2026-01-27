import { useState } from 'react';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    autor: '',
    categoria: '',
    publicacao: '',
    imagem: null,
    imagemPreview: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem válido');
        return;
      }

      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('A imagem é muito grande. Tamanho máximo: 10MB');
        return;
      }

      setError('');
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagem: reader.result, // Base64 com prefixo data:image/...
          imagemPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!formData.autor.trim()) {
      setError('O campo Autor é obrigatório');
      return;
    }

    if (!formData.publicacao.trim()) {
      setError('O campo Publicação é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        autor: formData.autor.trim(),
        categoria: formData.categoria,
        publicacao: formData.publicacao.trim(),
        imagem: formData.imagem || null,
      });

      // Limpar formulário após sucesso
      setFormData({
        autor: '',
        categoria: '',
        publicacao: '',
        imagem: null,
        imagemPreview: null,
      });
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao criar post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      autor: '',
      categoria: '',
      publicacao: '',
      imagem: null,
      imagemPreview: null,
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Criar post</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleCancel}
            aria-label="Fechar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="autor"
              name="autor"
              value={formData.autor}
              onChange={handleInputChange}
              maxLength={60}
              placeholder="Autor do Post"
              required
            />
          </div>

          <div className="form-group">
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione a categoria</option>
              <option value="post">Post</option>
              <option value="artigo">Artigo</option>
              <option value="grupo">Grupo</option>
            </select>
          </div>

          <div className="form-group">
            <textarea
              id="publicacao"
              name="publicacao"
              value={formData.publicacao}
              onChange={handleInputChange}
              placeholder="Escrever publicação."
              rows={8}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {formData.imagemPreview && (
            <div className="image-preview">
              <img src={formData.imagemPreview} alt="Preview" />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    imagem: null,
                    imagemPreview: null,
                  }));
                  document.getElementById('imagem').value = '';
                }}
                className="remove-image-btn"
              >
                ✕
              </button>
            </div>
          )}

          <div className="modal-actions">
            <input
              type="file"
              id="imagem"
              name="imagem"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <label htmlFor="imagem" className="btn-imagem">
              <img src="/assets/btn_image.svg" alt="Imagem" className="btn-icon" />
              <span>IMAGEM</span>
            </label>
            <button
              type="submit"
              className="btn-publicar"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publicando...' : 'PUBLICAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
