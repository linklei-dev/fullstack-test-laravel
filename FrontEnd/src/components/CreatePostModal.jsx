import { useState, useEffect, useRef } from 'react';
import './CreatePostModal.css';

const CATEGORIAS = [
  { value: 'post', label: 'Post' },
  { value: 'artigo', label: 'Artigo' },
  { value: 'grupo', label: 'Grupo' },
];

export default function CreatePostModal({ isOpen, onClose, onSubmit, editPost }) {
  const [autor, setAutor] = useState('');
  const [categoria, setCategoria] = useState('post');
  const [publicacao, setPublicacao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editPost) {
      setAutor(editPost.autor ?? '');
      setCategoria(editPost.categoria ?? 'post');
      setPublicacao(editPost.publicacao ?? '');
      setImagem(null);
      setPreview(editPost.imagem ?? null);
    } else {
      setAutor('');
      setCategoria('post');
      setPublicacao('');
      setImagem(null);
      setPreview(null);
    }
  }, [isOpen, editPost]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 280) + 'px';
  }, [publicacao]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type;
    if (!/^image\/(jpeg|jpg|png)$/i.test(type)) {
      alert('Envie apenas imagens JPG ou PNG.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setImagem(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagem(null);
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const autorTrim = autor.trim();
    const pubTrim = publicacao.trim();
    if (!autorTrim || !pubTrim) {
      alert('Preencha autor e publicação.');
      return;
    }
    setSubmitting(true);
    const payload = {
      autor: autorTrim,
      categoria,
      publicacao: pubTrim,
      imagem: imagem || undefined,
    };
    if (editPost?.id) {
      payload.id = editPost.id;
      payload.created_at = editPost.created_at;
      payload.updated_at = editPost.updated_at;
    }
    onSubmit(payload);
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{editPost ? 'Editar post' : 'Criar post'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="modal-label">
            Autor
            <input
              type="text"
              className="modal-input"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              maxLength={60}
              placeholder="Seu nome"
              required
            />
          </label>
          <label className="modal-label">
            Categoria
            <select
              className="modal-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="modal-label">
            Publicação
            <textarea
              ref={textareaRef}
              className="modal-textarea"
              value={publicacao}
              onChange={(e) => setPublicacao(e.target.value)}
              placeholder="O que você quer publicar?"
              rows={4}
              required
            />
          </label>
          <div className="modal-label">
            Imagem (opcional, JPG ou PNG)
            <div className="modal-image-actions">
              <label className="modal-btn-file">
                <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFile} />
                Escolher imagem
              </label>
              {preview && (
                <button type="button" className="modal-btn-remove-img" onClick={handleRemoveImage}>
                  Remover imagem
                </button>
              )}
            </div>
            {preview && (
              <div className="modal-preview-wrap">
                <img src={preview} alt="" className="modal-preview" />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="modal-btn-submit" disabled={submitting}>
              {submitting ? 'Publicando...' : (editPost ? 'Salvar' : 'Publicar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
