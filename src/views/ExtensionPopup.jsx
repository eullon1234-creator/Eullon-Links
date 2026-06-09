import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Bookmark, 
  Settings, 
  Tag, 
  X, 
  CheckCircle,
  ExternalLink,
  Lock,
  CloudOff
} from "lucide-react";
import FirebaseSettingsModal from "../components/FirebaseSettingsModal";

export default function ExtensionPopup() {
  const { 
    currentUser, 
    categories, 
    addLink, 
    firebaseConfigured 
  } = useApp();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("cat-general");
  const [priority, setPriority] = useState("low");
  const [observation, setObservation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [notes, setNotes] = useState("");
  
  // Tags Tokenizer
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  // Captura automática da aba ativa do navegador (se disponível)
  useEffect(() => {
    if (typeof window.chrome !== "undefined" && window.chrome.tabs) {
      window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          setUrl(tabs[0].url || "");
          setTitle(tabs[0].title || "");
        }
      });
    } else {
      // Mock para desenvolvimento/teste no navegador local
      setUrl("https://react.dev");
      setTitle("React - A JavaScript library for building user interfaces");
    }
  }, []);

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

  const removeTagToken = (idx) => {
    setTags(tags.filter((_, i) => i !== idx));
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

        if (finalTitle && (!title.trim() || title === "React - A JavaScript library for building user interfaces")) {
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
    if ((!title.trim() || title === "React - A JavaScript library for building user interfaces") && url.trim()) {
      fetchLinkMetadata();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !url.trim()) {
      setError("Título e URL são obrigatórios.");
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    try {
      await addLink({
        title: title.trim(),
        url: formattedUrl,
        categoryId,
        priority,
        observation: observation.trim(),
        photoUrl: photoUrl.trim(),
        notes: notes.trim(),
        tags
      });

      setSavedSuccess(true);
      
      // Fecha o popup da extensão após 1.2 segundos
      setTimeout(() => {
        if (typeof window.chrome !== "undefined" && window.chrome.action) {
          window.close();
        }
      }, 1200);

    } catch (err) {
      console.error(err);
      setError("Erro ao salvar link.");
    }
  };

  const handleOpenDashboard = () => {
    // Abre a página web do Eullon Links em uma nova aba
    if (typeof window.chrome !== "undefined" && window.chrome.tabs) {
      window.chrome.tabs.create({ url: window.location.href.replace("?popup=true", "") });
    } else {
      window.open(window.location.origin, "_blank");
    }
  };

  if (savedSuccess) {
    return (
      <div className="extension-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <div className="animate-scale-up" style={{ textAlign: "center" }}>
          <CheckCircle size={64} style={{ color: "var(--success)", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Favorito Salvo!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {firebaseConfigured && currentUser ? "Sincronizado na Nuvem" : "Salvo localmente"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="extension-container">
      
      {/* Header */}
      <header className="extension-header">
        <div className="extension-logo">
          <Bookmark size={20} style={{ fill: "currentColor" }} />
          <span>Eullon Links</span>
        </div>
        
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          {!currentUser && (
            <span 
              onClick={() => setSettingsOpen(true)}
              style={{ color: "var(--text-tertiary)", cursor: "pointer", display: "flex", padding: "4px" }}
              title="Sincronização Offline - Clique para conectar"
            >
              <CloudOff size={16} />
            </span>
          )}
          <button 
            onClick={() => setSettingsOpen(true)} 
            className="btn-icon-only"
            style={{ padding: "0.35rem", borderRadius: "var(--radius-sm)" }}
            title="Sincronização & Contas"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Body / Form */}
      <div className="extension-body">
        {error && (
          <div style={{
            backgroundColor: "var(--danger-light)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            color: "var(--danger)",
            padding: "0.5rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "0.75rem",
            fontSize: "0.75rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          
          {/* URL */}
          <div className="form-group" style={{ marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }} htmlFor="ext-url">URL</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                id="ext-url"
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", flex: 1 }}
                placeholder="https://exemplo.com"
              />
              <button
                type="button"
                onClick={fetchLinkMetadata}
                disabled={fetchingMetadata || !url.trim()}
                className="btn btn-secondary"
                style={{ padding: "0 0.5rem", fontSize: "0.75rem", height: "36px" }}
              >
                {fetchingMetadata ? "B..." : "Capturar"}
              </button>
            </div>
          </div>

          {/* Título */}
          <div className="form-group" style={{ marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }} htmlFor="ext-title">Título</label>
            <input
              id="ext-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
              placeholder="Título do Favorito"
            />
          </div>

          {/* Categoria e Prioridade */}
          <div className="form-row" style={{ gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }} htmlFor="ext-category">Categoria</label>
              <select
                id="ext-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", height: "36px", cursor: "pointer" }}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }} htmlFor="ext-priority">Prioridade</label>
              <select
                id="ext-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", height: "36px", cursor: "pointer" }}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Observação de Prioridade */}
          <div className="form-group" style={{ marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }} htmlFor="ext-observation">Status / Lembrete</label>
            <input
              id="ext-observation"
              type="text"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="form-input"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
              placeholder="Ex: Ler domingo"
            />
          </div>

          {/* Tags */}
          <div className="form-group" style={{ marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Tags</label>
            <div className="tags-input-container" style={{ padding: "0.25rem", minHeight: "36px" }}>
              {tags.map((tag, idx) => (
                <span key={tag} className="tag-token" style={{ padding: "0.1rem 0.35rem", fontSize: "0.75rem" }}>
                  {tag}
                  <span onClick={() => removeTagToken(idx)} className="tag-token-close">
                    <X size={10} />
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
                style={{ fontSize: "0.8rem" }}
                placeholder={tags.length === 0 ? "Enter para criar" : ""}
              />
            </div>
          </div>

          {/* Foto URL (opcional) */}
          <div className="form-group" style={{ marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }} htmlFor="ext-photo">URL da Foto (Capa)</label>
            <input
              id="ext-photo"
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="form-input"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          {/* Observações / Notas */}
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }} htmlFor="ext-notes">Notas</label>
            <textarea
              id="ext-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
              placeholder="Notas adicionais sobre o link..."
              rows={2}
            />
          </div>

          {/* Botão de Ação */}
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.6rem", fontSize: "0.9rem", marginTop: "auto" }}
          >
            Salvar Link Favorito
          </button>
        </form>
      </div>

      {/* Footer link to Dashboard */}
      <footer style={{
        padding: "0.75rem",
        borderTop: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-secondary)",
        display: "flex",
        justifyContent: "center"
      }}>
        <button 
          onClick={handleOpenDashboard}
          style={{ 
            fontSize: "0.8rem", 
            fontWeight: 600, 
            color: "var(--accent)", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.25rem",
            cursor: "pointer"
          }}
        >
          Abrir Painel Completo
          <ExternalLink size={12} />
        </button>
      </footer>

      {/* Modal de Configuração no Popup */}
      <FirebaseSettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />

    </div>
  );
}
