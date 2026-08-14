import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Bookmark, 
  Tag, 
  Image as ImageIcon, 
  Lock, 
  Sparkles, 
  Clock, 
  Briefcase, 
  Check, 
  Loader2 
} from "lucide-react";

export default function AddEditLinkModal({ isOpen, onClose, linkToEdit = null }) {
  const { categories, workspaces, currentWorkspace, addLink, updateLink, fetchUrlMetadata } = useApp();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("cat-general");
  const [workspaceId, setWorkspaceId] = useState("ws-pessoal");
  const [photoUrl, setPhotoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("low");
  const [observation, setObservation] = useState("");
  
  // Tags Tokenizer
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [isHidden, setIsHidden] = useState(false);
  const [isReadLater, setIsReadLater] = useState(false);

  const [error, setError] = useState("");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataSuccess, setMetadataSuccess] = useState(false);

  // Carrega os dados se for edição
  useEffect(() => {
    if (linkToEdit) {
      setTitle(linkToEdit.title || "");
      setUrl(linkToEdit.url || "");
      setCategoryId(linkToEdit.categoryId || "cat-general");
      setWorkspaceId(linkToEdit.workspaceId || "ws-pessoal");
      setPhotoUrl(linkToEdit.photoUrl || "");
      setNotes(linkToEdit.notes || "");
      setPriority(linkToEdit.priority || "low");
      setObservation(linkToEdit.observation || "");
      setTags(linkToEdit.tags || []);
      setIsHidden(linkToEdit.isHidden || false);
      setIsReadLater(linkToEdit.isReadLater || false);
    } else {
      // Limpar formulário para inserção
      setTitle("");
      setUrl("");
      setCategoryId("cat-general");
      setWorkspaceId(currentWorkspace === "all" ? "ws-pessoal" : currentWorkspace);
      setPhotoUrl("");
      setNotes("");
      setPriority("low");
      setObservation("");
      setTags([]);
      setIsHidden(false);
      setIsReadLater(false);
    }
    setError("");
    setMetadataSuccess(false);
  }, [linkToEdit, isOpen, currentWorkspace]);

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

  const handleFetchMetadata = async () => {
    let targetUrl = url.trim();
    if (!targetUrl) return;

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    setFetchingMetadata(true);
    setError("");
    setMetadataSuccess(false);

    try {
      const meta = await fetchUrlMetadata(targetUrl);
      if (meta) {
        if (!title.trim() || title === targetUrl) {
          setTitle(meta.title);
        }
        if (!notes.trim() && meta.description) {
          setNotes(meta.description);
        }
        if (!photoUrl.trim() && meta.image) {
          setPhotoUrl(meta.image);
        }

        // Sugestão automática de categoria baseada em palavras-chave
        if (categoryId === "cat-general") {
          const checkText = `${meta.title} ${meta.description} ${targetUrl}`.toLowerCase();
          if (/\b(ia|ai|inteligência artificial|chatgpt|openai|gemini|claude|deepseek|neural|llm)\b/.test(checkText)) {
            setCategoryId("cat-ai");
          } else if (/\b(pc game|steam|epic games|gog|jogos? de pc)\b/.test(checkText)) {
            setCategoryId("cat-pc-games");
          } else if (/\b(switch|nintendo|retroarch|roms?|yuzu|ryujinx)\b/.test(checkText)) {
            setCategoryId("cat-switch-games");
          } else if (/\b(celular|mobile game|android|ios|play store|app store)\b/.test(checkText)) {
            setCategoryId("cat-mobile-games");
          } else if (/\b(emulator|emulador|dolphin|citra|pcsx|mame)\b/.test(checkText)) {
            setCategoryId("cat-emulators");
          } else if (/\b(aula|curso|tutorial|learn|aprender|estudos|devocional|faculdade)\b/.test(checkText)) {
            setCategoryId("cat-classes");
          } else if (/\b(github|gitlab|repositório|projetos?|código|programming|dev)\b/.test(checkText)) {
            setCategoryId("cat-projects");
          } else if (/\b(ferramenta|tools?|utilitário|editor|npm|api|saas|gerador)\b/.test(checkText)) {
            setCategoryId("cat-tools");
          } else if (/\b(youtube|video|vimeo|twitch|stream|live|filme|série)\b/.test(checkText)) {
            setCategoryId("cat-videos");
          } else if (/\b(estudo|study|documentação|docs|wikipedia|artigo)\b/.test(checkText)) {
            setCategoryId("cat-study");
          } else if (/\b(trabalho|work|linkedin|slack|trello|jira|reunião)\b/.test(checkText)) {
            setCategoryId("cat-work");
          }
        }

        setMetadataSuccess(true);
        setTimeout(() => setMetadataSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro ao buscar metadados:", err);
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleUrlBlur = () => {
    if (!title.trim() && url.trim()) {
      handleFetchMetadata();
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
      workspaceId,
      photoUrl: photoUrl.trim(),
      notes: notes.trim(),
      priority,
      observation: observation.trim(),
      tags,
      isHidden,
      isReadLater
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
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-content animate-scale-up" style={{ maxWidth: "580px" }}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem" }}>
            <Bookmark size={22} style={{ color: "var(--accent)" }} />
            {linkToEdit ? "Editar Favorito" : "Adicionar Novo Favorito"}
          </h2>
          <button onClick={onClose} className="btn-icon-only">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
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

            {/* URL com Auto-Fetch Inteligente */}
            <div className="form-group">
              <label className="form-label" htmlFor="link-url" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>URL do Link *</span>
                {metadataSuccess && (
                  <span style={{ color: "var(--success)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Check size={12} /> Dados preenchidos automaticamente!
                  </span>
                )}
              </label>
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
                  onClick={handleFetchMetadata}
                  disabled={fetchingMetadata || !url.trim()}
                  className="btn btn-primary"
                  style={{ 
                    padding: "0 1rem", 
                    fontSize: "0.85rem", 
                    height: "46px", 
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                  title="Detectar Título, Capa e Descrição automaticamente"
                >
                  {fetchingMetadata ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Detectando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Preencher Auto</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Título */}
            <div className="form-group">
              <label className="form-label" htmlFor="link-title">Título do Favorito *</label>
              <input
                id="link-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Ex: Documentação do React"
              />
            </div>

            {/* Workspace & Categoria */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="link-workspace">
                  <Briefcase size={14} style={{ display: "inline", marginRight: "0.3rem", verticalAlign: "middle" }} />
                  Espaço de Trabalho (Workspace)
                </label>
                <select
                  id="link-workspace"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className="form-input"
                  style={{ cursor: "pointer", height: "46px" }}
                >
                  {workspaces.filter(w => w.id !== "all").map(ws => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>

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
            </div>

            {/* Prioridade & Ler Mais Tarde */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="link-priority">Nível de Prioridade</label>
                <select
                  id="link-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-input"
                  style={{ cursor: "pointer", height: "46px" }}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta Prioridade 🔥</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="link-obs">Lembrete / Status</label>
                <input
                  id="link-obs"
                  type="text"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Revisar até sexta-feira..."
                />
              </div>
            </div>

            {/* Foto URL e Preview */}
            <div className="form-group">
              <label className="form-label" htmlFor="link-photo">Imagem de Capa / Favicon</label>
              <input
                id="link-photo"
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="form-input"
                placeholder="https://exemplo.com/imagem.png"
              />

              {photoUrl && (
                <div style={{ 
                  marginTop: "0.5rem", 
                  borderRadius: "var(--radius-md)", 
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "var(--bg-primary)"
                }}>
                  <img 
                    src={photoUrl} 
                    alt="Preview da Capa" 
                    onError={(e) => e.target.style.display = 'none'}
                    style={{ height: "100%", width: "100px", objectFit: "cover" }} 
                  />
                  <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <p style={{ fontWeight: 600 }}>Capa detectada com sucesso</p>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", wordBreak: "break-all" }}>
                      {photoUrl}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tags Tokenizer */}
            <div className="form-group">
              <label className="form-label">Tags (Pressione Enter ou vírgula)</label>
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
                  placeholder={tags.length === 0 ? "Ex: dev, react, tutorial..." : ""}
                />
              </div>
            </div>

            {/* Checkboxes de Opções Rápidas (Ler Mais Tarde & Oculto) */}
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isReadLater}
                  onChange={(e) => setIsReadLater(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--accent)", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Clock size={15} style={{ color: "var(--accent)" }} />
                  Marcar para <strong>Ler Mais Tarde</strong>
                </span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--warning)", cursor: "pointer" }}
                />
                <span style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Lock size={15} style={{ color: "var(--warning)" }} />
                  Link Oculto (protegido por código)
                </span>
              </label>
            </div>

            {/* Notas Personalizadas */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="link-notes">Notas / Descrição</label>
              <textarea
                id="link-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                placeholder="Insira anotações, resumo ou detalhes importantes sobre este favorito..."
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
              {linkToEdit ? "Salvar Alterações" : "Adicionar Favorito"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
