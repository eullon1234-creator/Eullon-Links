import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Folder, 
  Bookmark, 
  Settings, 
  Plus, 
  Cloud, 
  CloudOff, 
  Grid, 
  LogOut,
  ChevronRight,
  TrendingUp,
  FolderOpen
} from "lucide-react";
import { CategoryIcon } from "./CategoryManagerModal";

export default function Sidebar({ 
  selectedCategoryId, 
  onSelectCategory, 
  selectedPriority, 
  onSelectPriority, 
  onOpenCategories, 
  onOpenSettings,
  isOpenMobile,
  onCloseMobile
}) {
  const { 
    currentUser, 
    firebaseConfigured, 
    categories, 
    links, 
    logoutUser 
  } = useApp();

  // Função para contar links em uma categoria
  const getLinkCountForCategory = (catId) => {
    return links.filter(lnk => lnk.categoryId === catId).length;
  };

  // Função para contar links por prioridade
  const getLinkCountForPriority = (priority) => {
    return links.filter(lnk => lnk.priority === priority).length;
  };

  const handleCategoryClick = (catId) => {
    onSelectCategory(catId);
    if (onCloseMobile) onCloseMobile();
  };

  const handlePriorityClick = (prio) => {
    onSelectPriority(prio);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`sidebar ${isOpenMobile ? "open" : ""}`} style={{ zIndex: 99 }}>
      
      {/* Header Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{
          backgroundColor: "var(--accent-light)",
          color: "var(--accent)",
          padding: "0.6rem",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Bookmark size={24} style={{ fill: "currentColor" }} />
        </div>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>Eullon Links</h1>
          <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>Guarde & Organize</span>
        </div>
      </div>

      {/* Status da Sincronização */}
      <div style={{ marginBottom: "1.5rem" }}>
        {firebaseConfigured && currentUser ? (
          <div 
            onClick={onOpenSettings}
            className="badge-settings connected"
            style={{ padding: "0.5rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            title="Sincronização Ativa - Clique para ver detalhes"
          >
            <Cloud size={16} />
            <span style={{ fontWeight: 600, fontSize: "0.75rem" }}>Nuvem Ativa</span>
          </div>
        ) : (
          <div 
            onClick={onOpenSettings}
            className="badge-settings"
            style={{ padding: "0.5rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            title="Salvar Local - Clique para conectar ao Firebase"
          >
            <CloudOff size={16} />
            <span style={{ fontWeight: 600, fontSize: "0.75rem" }}>Modo Local (Offline)</span>
          </div>
        )}
      </div>

      {/* Filtro Todos os Links */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => handleCategoryClick("all")}
          className={`category-item ${selectedCategoryId === "all" ? "active" : ""}`}
          style={{ width: "100%", textAlign: "left" }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Grid size={18} style={{ marginRight: "0.75rem" }} />
            Todos os Favoritos
          </span>
          <span style={{ fontSize: "0.8rem", backgroundColor: "var(--bg-tertiary)", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)" }}>
            {links.length}
          </span>
        </button>
      </div>

      {/* Lista de Categorias */}
      <div style={{ marginBottom: "1.5rem", flex: 1, overflowY: "auto", minHeight: "150px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: "0.75rem",
          padding: "0 0.5rem"
        }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>
            Categorias
          </span>
          <button 
            onClick={onOpenCategories}
            className="btn-icon-only" 
            style={{ padding: "0.15rem", borderRadius: "var(--radius-sm)" }}
            title="Gerenciar Categorias"
          >
            <Settings size={14} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`category-item ${selectedCategoryId === cat.id ? "active" : ""}`}
              style={{ width: "100%", textAlign: "left" }}
            >
              <span style={{ display: "flex", alignItems: "center", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                <CategoryIcon 
                  name={cat.iconName} 
                  size={16} 
                  style={{ marginRight: "0.75rem", color: cat.color }} 
                />
                {cat.name}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                {getLinkCountForCategory(cat.id)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros de Prioridade */}
      <div style={{ marginBottom: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
        <span style={{ 
          display: "block",
          fontSize: "0.75rem", 
          fontWeight: 700, 
          textTransform: "uppercase", 
          color: "var(--text-tertiary)", 
          letterSpacing: "0.05em",
          marginBottom: "0.75rem",
          padding: "0 0.5rem"
        }}>
          Prioridades
        </span>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          <button
            onClick={() => handlePriorityClick("all")}
            className={`category-item ${selectedPriority === "all" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left" }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <TrendingUp size={16} style={{ marginRight: "0.75rem" }} />
              Qualquer Prioridade
            </span>
          </button>

          <button
            onClick={() => handlePriorityClick("high")}
            className={`category-item ${selectedPriority === "high" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left" }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <span className="category-dot" style={{ backgroundColor: "var(--danger)" }} />
              Prioridade Alta
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
              {getLinkCountForPriority("high")}
            </span>
          </button>

          <button
            onClick={() => handlePriorityClick("medium")}
            className={`category-item ${selectedPriority === "medium" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left" }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <span className="category-dot" style={{ backgroundColor: "var(--warning)" }} />
              Prioridade Média
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
              {getLinkCountForPriority("medium")}
            </span>
          </button>

          <button
            onClick={() => handlePriorityClick("low")}
            className={`category-item ${selectedPriority === "low" ? "active" : ""}`}
            style={{ width: "100%", textAlign: "left" }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <span className="category-dot" style={{ backgroundColor: "var(--success)" }} />
              Prioridade Baixa
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
              {getLinkCountForPriority("low")}
            </span>
          </button>
        </div>
      </div>

      {/* Perfil de Usuário / Logout */}
      <div className="user-profile">
        {currentUser ? (
          <>
            <div className="user-info">
              <div className="user-avatar">
                {currentUser.email ? currentUser.email[0].toUpperCase() : "U"}
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser.displayName || "Usuário"}</span>
                <span className="user-status">{currentUser.email}</span>
              </div>
            </div>
            <button 
              onClick={logoutUser} 
              className="btn-icon-only"
              style={{ color: "var(--danger)" }}
              title="Desconectar"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div 
            onClick={onOpenSettings}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              cursor: "pointer", 
              width: "100%",
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: "0.85rem"
            }}
          >
            <Settings size={16} />
            <span>Configurar Sincronização</span>
          </div>
        )}
      </div>

    </aside>
  );
}
