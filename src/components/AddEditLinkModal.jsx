import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X, Bookmark, Plus, Tag, HelpCircle, Image as ImageIcon, Lock } from "lucide-react";

export default function AddEditLinkModal({ isOpen, onClose, linkToEdit = null }) {
  const { categories, addLink, updateLink } = useApp();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("cat-general");
  const [photoUrl, setPhotoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("low");
  const [observation, setObservation] = useState("");
  
  // Tags Tokenizer
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [isHidden, setIsHidden] = useState(false);

  const [error, setError] = useState("");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  // Carrega os dados se for edição
  useEffect(() => {
    if (linkToEdit) {
      setTitle(linkToEdit.title || "");
      setUrl(linkToEdit.url || "");
      setCategoryId(linkToEdit.categoryId || "cat-general");
      setPhotoUrl(linkToEdit.photoUrl || "");
      setNotes(linkToEdit.notes || "");
      setPriority(linkToEdit.priority || "low");
      setObservation(linkToEdit.observation || "");
      setTags(linkToEdit.tags || []);
      setIsHidden(linkToEdit.isHidden || false);
    } else {
      // Limpar formulário para inserção
      setTitle("");
      setUrl("");
      setCategoryId("cat-general");
      setPhotoUrl("");
      setNotes("");
      setPriority("low");
      setObservation("");
      setTags([]);
      setIsHidden(false);
    }
    setError("");
  }, [linkToEdit, isOpen]);

  if (!isOpen) return null;

  // Lidar com inserção de tag
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagToken();
    }
  };

  const addTagToken = () => {
    const cleanTag = tagInput.trim().toLowerCase().replace(/,/g, "");
    if (!cleanTag) return;
    
    if (tags.includes(cleanTag)) {
      setTagInput("");
      return;
    }

    setTags([...tags, cleanTag]);
    setTagInput("");
  };

  const removeTagToken = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const fetchLinkMetadata = async () => {
    let targetUrl = url.trim();
    if (!targetUrl) return;

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    setFetchingMetadata(true);
    setError("");

    try {
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`);
      const result = await response.json();

      if (result.status === "success" && result.data) {
        const { title: fetchedTitle, description, image } = result.data;

        // 1. Limpeza de Título Inteligente
        let finalTitle = fetchedTitle || "";
        if (finalTitle) {
          try {
            const hostname = new URL(targetUrl).hostname.replace("www.", "");
            const brandName = hostname.split('.')[0];
            if (brandName) {
              const brandRegex = new RegExp(`\\s*[|–\\-:]\\s*${brandName}.*$`, 'i');
              finalTitle = finalTitle.replace(brandRegex, '');
            }
          } catch (e) {}
          finalTitle = finalTitle.replace(/\s*[|–\-:]\s*$/, '').trim();
        }

        if (finalTitle && !title.trim()) {
          setTitle(finalTitle);
        }
        if (description && !notes.trim()) {
          setNotes(description);
        }

        // 2. Favicon de Alta Resolução como Capa Fallback
        let finalPhotoUrl = (image && image.url) ? image.url : "";
        if (!finalPhotoUrl) {
          try {
            const urlObj = new URL(targetUrl);
            finalPhotoUrl = `https://www.google.com/s2/favicons?sz=128&domain=${urlObj.hostname}`;
          } catch (e) {}
        }
        if (finalPhotoUrl && !photoUrl.trim()) {
          setPhotoUrl(finalPhotoUrl);
        }

        // 3. Recomendação / Auto-Seleção de Categoria
        if (categoryId === "cat-general") {
          const categoryCheckText = `${finalTitle} ${description || ""} ${targetUrl}`.toLowerCase();
          if (/\b(ia|ai|inteligência artificial|artificial intelligence|chatgpt|openai|gemini|claude|copilot|llama|deepseek|neural|machine learning|deep learning|robot|bot)\b/.test(categoryCheckText)) {
            setCategoryId("cat-ai");
          } else if (/\b(pc game|jogos? de pc|steam|epic games|gog|pcgaming)\b/.test(categoryCheckText)) {
            setCategoryId("cat-pc-games");
          } else if (/\b(switch|nintendo|retroarch|roms?|yuzu|ryujinx|gamepad)\b/.test(categoryCheckText)) {
            setCategoryId("cat-switch-games");
          } else if (/\b(mobile game|jogos? de celular|android game|ios game|google play|app store|play store)\b/.test(categoryCheckText)) {
            setCategoryId("cat-mobile-games");
          } else if (/\b(emulator|emulador|dolphin|citra|pcsx|retroarch|mame|emulação)\b/.test(categoryCheckText)) {
            setCategoryId("cat-emulators");
          } else if (/\b(aula|curso|class|tutorial|learn|aprender|estudos|devocional|lesson|lectures?|faculdade|universidade)\b/.test(categoryCheckText)) {
            setCategoryId("cat-classes");
          } else if (/\b(github|gitlab|repositório|repository|projetos?|código-fonte|source code|programming)\b/.test(categoryCheckText)) {
            setCategoryId("cat-projects");
          } else if (/\b(ferramenta|tools?|utilitário|editor|npm|package|library|framework|api|saas|gerador)\b/.test(categoryCheckText)) {
            setCategoryId("cat-tools");
          } else if (/\b(youtube|video|assista|vimeo|twitch|stream|live|filme|série|trailer)\b/.test(categoryCheckText)) {
            setCategoryId("cat-videos");
          } else if (/\b(estudo|study|documentação|docs|wikipedia|wiki|livro|artigo|pesquisa)\b/.test(categoryCheckText)) {
            setCategoryId("cat-study");
          } else if (/\b(trabalho|work|vaga|emprego|linkedin|slack|trello|jira|reunião|meeting)\b/.test(categoryCheckText)) {
            setCategoryId("cat-work");
          }
        }
      }
    } catch (err) {
      console.error("Erro ao buscar metadados:", err);
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleUrlBlur = () => {
    if (!title.trim() && url.trim()) {
      fetchLinkMetadata();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !url.trim()) {
      setError("Os campos Título e URL são obrigatórios.");
      return;
    }

    // Formatar e validar URL
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    const linkData = {
      title: title.trim(),
      url: formattedUrl,
      categoryId,
      photoUrl: photoUrl.trim(),
      notes: notes.trim(),
      priority,
      observation: observation.trim(),
      tags,
      isHidden
    };

    try {
      if (linkToEdit) {
        await updateLink(linkToEdit.id, linkData);
      } else {
        await addLink(linkData);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao salvar o link.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale-up" style={{ maxWidth: "560px" }}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem" }}>
            <Bookmark size={22} style={{ color: "var(--accent)" }} />
            {linkToEdit ? "Editar Favorito" : "Adicionar Favorito"}
          </h2>
          <button onClick={onClose} className="btn-icon-only" style={{ padding: "0.25rem" }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: "65vh" }}>
            {error && (
              <div style={{
                backgroundColor: "var(--danger-light)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                color: "var(--danger)",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                fontSize: "0.85rem"
              }}>
                {error}
              </div>
            )}

            {/* URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="link-url">URL do Link *</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  id="link-url"
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  className="form-input"
                  placeholder="exemplo.com ou https://exemplo.com"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={fetchLinkMetadata}
                  disabled={fetchingMetadata || !url.trim()}
                  className="btn btn-secondary"
                  style={{ padding: "0 1rem", fontSize: "0.85rem", height: "46px" }}
                >
                  {fetchingMetadata ? "Buscando..." : "Capturar"}
                </button>
              </div>
            </div>

            {/* Título */}
            <div className="form-group">
              <label className="form-label" htmlFor="link-title">Título *</label>
              <input
                id="link-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Nome curto do favorito"
              />
            </div>

            {/* Categoria & Prioridade */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="link-category">Categoria</label>
                <select
                  id="link-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="form-input"
                  style={{ cursor: "pointer", height: "46px" }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="link-priority">Prioridade</label>
                <select
                  id="link-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-input"
                  style={{ cursor: "pointer", height: "46px" }}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            {/* Observação de prioridade */}
            <div className="form-group">
              <label className="form-label" htmlFor="link-obs">Observação de Prioridade / Status</label>
              <input
                id="link-obs"
                type="text"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="form-input"
                placeholder="Ex: Ler no fim de semana, Urgente para o projeto..."
              />
            </div>

            {/* Foto URL e Preview */}
            <div className="form-group">
              <label className="form-label" htmlFor="link-photo">URL da Imagem de Capa (Opcional)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  id="link-photo"
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="form-input"
                  placeholder="https://exemplo.com/imagem.png"
                  style={{ flex: 1 }}
                />
              </div>

              {photoUrl && (
                <div style={{ 
                  marginTop: "0.5rem", 
                  borderRadius: "var(--radius-md)", 
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                  height: "90px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "var(--bg-primary)"
                }}>
                  <img 
                    src={photoUrl} 
                    alt="Preview da Capa" 
                    onError={(e) => e.target.style.display = 'none'}
                    style={{ height: "100%", width: "120px", objectFit: "cover" }} 
                  />
                  <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <p style={{ fontWeight: 600 }}>Visualização da Capa</p>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", wordBreak: "break-all" }}>
                      {photoUrl}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tags Tokenizer */}
            <div className="form-group">
              <label className="form-label">Tags (Pressione Enter ou vírgula para adicionar)</label>
              <div className="tags-input-container">
                {tags.map((tag, idx) => (
                  <span key={tag} className="tag-token">
                    <Tag size={12} />
                    {tag}
                    <span 
                      onClick={() => removeTagToken(idx)} 
                      className="tag-token-close"
                      title="Remover tag"
                    >
                      <X size={12} />
                    </span>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={addTagToken}
                  className="tags-raw-input"
                  placeholder={tags.length === 0 ? "Ex: javascript, design, estudos" : ""}
                />
              </div>
            </div>

            {/* Link Oculto */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--accent)", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.875rem" }}>Link Oculto (só aparece após desbloqueio com código)</span>
                <Lock size={14} style={{ color: isHidden ? "var(--accent)" : "var(--text-tertiary)", marginLeft: "0.25rem" }} />
              </label>
            </div>

            {/* Notas Personalizadas */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="link-notes">Notas Personalizadas</label>
              <textarea
                id="link-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                placeholder="Insira descrições, trechos importantes, ou anotações extras sobre este link..."
                rows={3}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {linkToEdit ? "Salvar Alterações" : "Salvar Favorito"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
