import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Calendar, 
  Tag, 
  MessageSquare,
  AlertCircle,
  Lock
} from "lucide-react";
import { CategoryIcon } from "./CategoryManagerModal";

export default function LinkCard({ link, onEdit, onSelectTag }) {
  const { categories, deleteLink } = useApp();
  const [imageError, setImageError] = useState(false);

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
  const handleDelete = () => {
    if (window.confirm(`Tem certeza de que deseja excluir o favorito "${link.title}"?`)) {
      deleteLink(link.id);
    }
  };

  // Formata data de criação de forma simples
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

  // Primeira letra para fallback de imagem
  const firstLetter = link.title ? link.title.charAt(0) : "L";

  return (
    <div className="link-card animate-fade-in">
      
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
          <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "flex-start", gap: "0.25rem" }}>
            {link.title}
          </a>
        </h3>

        <a 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="card-url"
          title="Abrir link em nova aba"
        >
          {getDomain(link.url)}
          <ExternalLink size={12} style={{ marginLeft: "0.25rem", verticalAlign: "middle" }} />
        </a>

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
              Prioridade / Status:
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
