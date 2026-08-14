import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  Lock,
  Copy,
  Check,
  QrCode,
  Flame,
  Clock,
  GripVertical
} from "lucide-react";
import { CategoryIcon } from "./CategoryManagerModal";

export default function LinkCard({ 
  link, 
  onEdit, 
  onSelectTag, 
  onOpenQrCode, 
  viewMode = "grid",
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) {
  const { categories, deleteLink, incrementClickCount, toggleReadLater } = useApp();
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Encontra a categoria correspondente
  const category = categories.find(cat => cat.id === link.categoryId) || {
    name: "Sem Categoria",
    color: "#6b7280",
    iconName: "Folder"
  };

  // Trata a extração do nome do host/domínio
  const getDomain = (urlStr) => {
    try {
      const urlObj = new URL(urlStr);
      return urlObj.hostname.replace("www.", "");
    } catch (e) {
      return urlStr;
    }
  };

  // Trata exclusão de link
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza de que deseja excluir o favorito "${link.title}"?`)) {
      deleteLink(link.id);
    }
  };

  // Copiar link com feedback
  const handleCopyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Abrir QR Code
  const handleQrClick = (e) => {
    e.stopPropagation();
    if (onOpenQrCode) {
      onOpenQrCode(link);
    }
  };

  // Clique no Link principal: incrementa contador de acessos
  const handleLinkClick = () => {
    incrementClickCount(link.id);
  };

  // Alternar Ler Mais Tarde
  const handleToggleReadLater = (e) => {
    e.stopPropagation();
    toggleReadLater(link.id);
  };

  // Eventos de Drag & Drop
  const handleDragStartInternal = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", link.id);
    e.dataTransfer.setData("application/json", JSON.stringify(link));
    if (onDragStart) onDragStart(e, link);
  };

  const handleDragEndInternal = (e) => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd(e, link);
  };

  const formatDate = (dateIso) => {
    if (!dateIso) return "";
    try {
      const date = new Date(dateIso);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (e) {
      return "";
    }
  };

  const firstLetter = link.title ? link.title.charAt(0).toUpperCase() : "L";

  // --- MODO LISTA COMPACTA ---
  if (viewMode === "list") {
    return (
      <div 
        className={`link-list-row animate-fade-in ${isDragging ? "dragging" : ""}`}
        draggable="true"
        onDragStart={handleDragStartInternal}
        onDragEnd={handleDragEndInternal}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Grip Icon */}
        <div style={{ color: "var(--text-tertiary)", cursor: "grab", display: "flex", alignItems: "center" }}>
          <GripVertical size={16} />
        </div>

        {/* Favicon / Letra */}
        <div 
          className="list-row-avatar"
          style={{ 
            borderColor: `${category.color}40`,
            backgroundColor: `rgba(var(--accent-rgb), 0.05)`, 
            color: category.color 
          }}
        >
          {link.photoUrl && !imageError ? (
            <img 
              src={link.photoUrl} 
              alt={link.title} 
              onError={() => setImageError(true)} 
              className="list-row-img"
              loading="lazy"
            />
          ) : (
            firstLetter
          )}
        </div>

        {/* Informações Principais */}
        <div className="list-row-info">
          <div className="list-row-header">
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={handleLinkClick}
              className="list-row-title"
              title={link.title}
            >
              {link.title}
            </a>
            <span 
              className="badge-tag" 
              style={{ 
                color: category.color, 
                backgroundColor: `${category.color}15`, 
                borderColor: `${category.color}30` 
              }}
            >
              <CategoryIcon name={category.iconName} size={11} style={{ color: category.color }} />
              {category.name}
            </span>
            {link.priority === "high" && (
              <span className="priority-pill priority-high">Alta</span>
            )}
            {link.isReadLater && (
              <span className="badge-tag" style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", color: "var(--accent)" }}>
                <Clock size={11} /> Ler mais tarde
              </span>
            )}
            {link.clickCount > 0 && (
              <span style={{ fontSize: "0.7rem", color: "var(--warning)", display: "inline-flex", alignItems: "center", gap: "0.2rem", fontWeight: 600 }}>
                <Flame size={12} /> {link.clickCount} {link.clickCount === 1 ? "clique" : "cliques"}
              </span>
            )}
          </div>
          
          <div className="list-row-details">
            <span className="list-row-domain">{getDomain(link.url)}</span>
            {link.notes && <span className="list-row-note">• {link.notes}</span>}
            {link.tags && link.tags.length > 0 && (
              <div className="list-row-tags">
                {link.tags.map(t => (
                  <span key={t} className="tag-pill" onClick={() => onSelectTag(t)}>#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas da Linha */}
        <div className="list-row-actions">
          <button 
            onClick={handleToggleReadLater} 
            className="btn-icon-only" 
            title={link.isReadLater ? "Remover de Ler Mais Tarde" : "Marcar para Ler Mais Tarde"}
            style={{ color: link.isReadLater ? "var(--accent)" : "var(--text-tertiary)" }}
          >
            <Clock size={16} />
          </button>
          <button 
            onClick={handleCopyLink} 
            className="btn-icon-only" 
            title={copied ? "Copiado!" : "Copiar URL"}
            style={{ color: copied ? "var(--success)" : "var(--text-tertiary)" }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button 
            onClick={handleQrClick} 
            className="btn-icon-only" 
            title="Ver QR Code para celular"
          >
            <QrCode size={16} />
          </button>
          <button 
            onClick={() => onEdit(link)} 
            className="btn-icon-only" 
            title="Editar favorito"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={handleDelete} 
            className="btn-icon-only" 
            style={{ color: "var(--danger)" }}
            title="Excluir favorito"
          >
            <Trash2 size={16} />
          </button>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleLinkClick}
            className="btn-icon-only"
            title="Abrir em nova aba"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    );
  }

  // --- MODO GRADE PADRÃO ---
  return (
    <div 
      className={`link-card animate-fade-in ${isDragging ? "dragging" : ""}`}
      draggable="true"
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      
      {/* Imagem de Capa do Card */}
      <div className="card-image-container">
        
        {/* Indicador de Prioridade */}
        <span className={`priority-tag priority-${link.priority}`}>
          <AlertCircle size={12} />
          {link.priority === "high" ? "Alta" : link.priority === "medium" ? "Média" : "Baixa"}
        </span>

        {/* Categoria Flutuante */}
        <span 
          className="card-badge glass-panel" 
          style={{ 
            color: category.color, 
            border: `1px solid ${category.color}40`,
            display: "flex",
            alignItems: "center",
            gap: "0.25rem"
          }}
        >
          <CategoryIcon name={category.iconName} size={12} style={{ color: category.color }} />
          {category.name}
        </span>

        {link.photoUrl && !imageError ? (
          <img 
            src={link.photoUrl} 
            alt={link.title} 
            onError={() => setImageError(true)} 
            className="card-image"
            loading="lazy"
          />
        ) : (
          <div 
            className="card-image-fallback" 
            style={{ 
              backgroundColor: `rgba(var(--accent-rgb), 0.05)`, 
              color: category.color 
            }}
          >
            {firstLetter}
          </div>
        )}
      </div>

      {/* Corpo do Card */}
      <div className="card-body">
        
        {/* Título & Domínio */}
        <h3 className="card-title" title={link.title}>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleLinkClick}
            style={{ display: "inline-flex", alignItems: "flex-start", gap: "0.25rem" }}
          >
            {link.title}
          </a>
        </h3>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleLinkClick}
            className="card-url"
            title="Abrir link em nova aba"
          >
            {getDomain(link.url)}
            <ExternalLink size={12} style={{ marginLeft: "0.25rem", verticalAlign: "middle" }} />
          </a>

          {/* Badges Rápidos (Cliques & Ler Mais Tarde) */}
          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
            {link.clickCount > 0 && (
              <span 
                style={{
                  fontSize: "0.7rem",
                  color: "var(--warning)",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  fontWeight: 600
                }}
                title={`${link.clickCount} acessos`}
              >
                <Flame size={12} /> {link.clickCount}
              </span>
            )}
            <button 
              onClick={handleToggleReadLater} 
              className="btn-icon-mini" 
              title={link.isReadLater ? "Remover de Ler Mais Tarde" : "Marcar para Ler Mais Tarde"}
              style={{ color: link.isReadLater ? "var(--accent)" : "var(--text-tertiary)" }}
            >
              <Clock size={13} />
            </button>
            <button 
              onClick={handleCopyLink} 
              className="btn-icon-mini" 
              title={copied ? "Link Copiado!" : "Copiar URL"}
              style={{ color: copied ? "var(--success)" : "var(--text-tertiary)" }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <button 
              onClick={handleQrClick} 
              className="btn-icon-mini" 
              title="Abrir no Celular via QR Code"
            >
              <QrCode size={13} />
            </button>
          </div>
        </div>

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div className="tags-list">
            {link.tags.map(tag => (
              <span 
                key={tag} 
                className="tag-badge"
                onClick={() => onSelectTag(tag)}
                title={`Filtrar por tag: ${tag}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Notas Personalizadas */}
        {link.notes && (
          <div className="card-notes" title="Minhas Notas">
            {link.notes}
          </div>
        )}

        {/* Observações de Prioridade / Lembrete */}
        {link.observation && (
          <div className="card-observation" title="Observação de Prioridade">
            <div style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "0.15rem" }}>
              Status / Lembrete:
            </div>
            {link.observation}
          </div>
        )}

        {/* Footer com Metadados & Ações */}
        <div className="card-footer">
          <span className="card-date" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Calendar size={12} />
            {formatDate(link.createdAt)}
          </span>

          <div className="card-actions">
            <button 
              onClick={() => onEdit(link)} 
              className="btn-icon-only" 
              title="Editar favorito"
            >
              <Edit2 size={15} />
            </button>
            <button 
              onClick={handleDelete} 
              className="btn-icon-only" 
              style={{ color: "var(--danger)" }}
              title="Excluir favorito"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

      </div>

      {link.isHidden && (
        <span style={{
          position: "absolute",
          bottom: "0.5rem",
          right: "0.5rem",
          color: "var(--warning)",
          opacity: 0.6
        }}>
          <Lock size={14} />
        </span>
      )}

    </div>
  );
}
