import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, FolderPlus, Trash2, Folder, Briefcase, BookOpen, Palette, Sparkles, Globe, Bookmark, Code, Heart, List } from "lucide-react";
import * as LucideIcons from "lucide-react";

const COLOR_OPTIONS = [
  "#6b7280", // Geral (Gray)
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899"  // Pink
];

const ICON_OPTIONS = [
  "Folder",
  "Briefcase",
  "BookOpen",
  "Palette",
  "Sparkles",
  "Globe",
  "Bookmark",
  "Code",
  "Heart",
  "List",
  "Monitor",
  "Smartphone",
  "Gamepad",
  "Cpu",
  "Wrench",
  "Video",
  "GraduationCap",
  "Brain",
  "Bot"
];

// Helper para renderizar ícones dinamicamente
export function CategoryIcon({ name, ...props }) {
  const IconComponent = LucideIcons[name] || Folder;
  return <IconComponent {...props} />;
}

export default function CategoryManagerModal({ isOpen, onClose }) {
  const { categories, addCategory, deleteCategory } = useApp();
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(COLOR_OPTIONS[6]); // Default azul
  const [newCatIcon, setNewCatIcon] = useState(ICON_OPTIONS[0]); // Default Folder
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!newCatName.trim()) {
      setError("O nome da categoria não pode ficar em branco.");
      return;
    }

    if (newCatName.toLowerCase() === "geral" || newCatName.toLowerCase() === "general") {
      setError("A categoria 'Geral' é padrão e não pode ser recriada.");
      return;
    }

    // Verifica se já existe
    const exists = categories.some(cat => cat.name.toLowerCase() === newCatName.trim().toLowerCase());
    if (exists) {
      setError("Já existe uma categoria com este nome.");
      return;
    }

    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      iconName: newCatIcon
    });

    setNewCatName("");
    setNewCatColor(COLOR_OPTIONS[6]);
    setNewCatIcon(ICON_OPTIONS[0]);
  };

  const handleDelete = (id, name) => {
    if (id === "cat-general") {
      alert("A categoria 'Geral' é protegida e não pode ser excluída.");
      return;
    }

    if (window.confirm(`Tem certeza de que deseja excluir a categoria "${name}"? Todos os links vinculados a ela serão movidos para a categoria "Geral".`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale-up" style={{ maxWidth: "440px" }}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem" }}>
            <FolderPlus size={22} style={{ color: "var(--accent)" }} />
            Gerenciar Categorias
          </h2>
          <button onClick={onClose} className="btn-icon-only" style={{ padding: "0.25rem" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
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

          {/* Adicionar Nova Categoria */}
          <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Criar Nova Categoria</h3>
            
            <div className="form-group">
              <label className="form-label" htmlFor="cat-name-input">Nome da Categoria</label>
              <input
                id="cat-name-input"
                type="text"
                required
                maxLength={20}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="form-input"
                placeholder="Ex: Receitas, Viagens..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cor Visual</label>
              <div className="color-picker">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCatColor(color)}
                    className={`color-option ${newCatColor === color ? "selected" : ""}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Selecionar cor ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ícone Correspondente</label>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(5, 1fr)", 
                gap: "0.5rem",
                marginTop: "0.5rem" 
              }}>
                {ICON_OPTIONS.map(iconName => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setNewCatIcon(iconName)}
                    style={{
                      padding: "0.6rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid " + (newCatIcon === iconName ? "var(--accent)" : "var(--border-color)"),
                      backgroundColor: newCatIcon === iconName ? "var(--accent-light)" : "var(--bg-primary)",
                      color: newCatIcon === iconName ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all var(--transition-fast)"
                    }}
                    aria-label={`Selecionar ícone ${iconName}`}
                  >
                    <CategoryIcon name={iconName} size={20} />
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              Adicionar Categoria
            </button>
          </form>

          {/* Listagem de Categorias Existentes */}
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
              Categorias Existentes ({categories.length})
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.8rem",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: cat.color
                    }} />
                    <CategoryIcon name={cat.iconName} size={18} style={{ color: cat.color }} />
                    <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{cat.name}</span>
                    {cat.id === "cat-general" && (
                      <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                        (Padrão)
                      </span>
                    )}
                  </div>

                  {cat.id !== "cat-general" && (
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="btn-icon-only"
                      style={{ color: "var(--danger)", padding: "0.25rem" }}
                      title="Deletar categoria"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
