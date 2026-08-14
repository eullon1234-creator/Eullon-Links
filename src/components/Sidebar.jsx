import React, { useState } from "react";
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
  FolderOpen, 
  Puzzle, 
  Download, 
  Lock,
  Layers,
  Flame,
  Clock,
  Briefcase,
  Globe,
  Home,
  GraduationCap,
  Code,
  Activity
} from "lucide-react";
import { CategoryIcon } from "./CategoryManagerModal";

export default function Sidebar({ 
  selectedCategoryId, 
  onSelectCategory, 
  selectedPriority, 
  onSelectPriority,
  selectedSpecialFilter, // "all" | "most-visited" | "read-later"
  onSelectSpecialFilter,
  onOpenCategories, 
  onOpenSettings,
  onOpenExtension,
  onOpenInstall,
  onOpenHiddenLinks,
  onOpenBackup,
  onOpenHealthCheck,
  isOpenMobile,
  onCloseMobile
}) {
  const { 
    currentUser, 
    firebaseConfigured, 
    categories, 
    links, 
    workspaces,
    currentWorkspace,
    selectWorkspace,
    logoutUser,
    isInstalled,
    moveLinkToCategory
  } = useApp();

  const [dragOverCatId, setDragOverCatId] = useState(null);

  // Filtra links pelo workspace selecionado para as contagens
  const workspaceLinks = links.filter(lnk => {
    if (currentWorkspace === "all") return true;
    return (lnk.workspaceId || "ws-pessoal") === currentWorkspace;
  });

  const getLinkCountForCategory = (catId) => {
    return workspaceLinks.filter(lnk => lnk.categoryId === catId && !lnk.isHidden).length;
  };

  const getLinkCountForPriority = (priority) => {
    return workspaceLinks.filter(lnk => lnk.priority === priority && !lnk.isHidden).length;
  };

  const readLaterCount = workspaceLinks.filter(lnk => lnk.isReadLater && !lnk.isHidden).length;
  const mostVisitedCount = workspaceLinks.filter(lnk => (lnk.clickCount || 0) > 0 && !lnk.isHidden).length;

  const handleCategoryClick = (catId) => {
    onSelectCategory(catId);
    if (onSelectSpecialFilter) onSelectSpecialFilter("all");
    if (onCloseMobile) onCloseMobile();
  };

  const handlePriorityClick = (prio) => {
    onSelectPriority(prio);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSpecialFilterClick = (filter) => {
    if (onSelectSpecialFilter) onSelectSpecialFilter(filter);
    if (onCloseMobile) onCloseMobile();
  };

  // Drag & Drop Handlers para Categorias
  const handleDragOverCategory = (e, catId) => {
    e.preventDefault();
    setDragOverCatId(catId);
  };

  const handleDragLeaveCategory = () => {
    setDragOverCatId(null);
  };

  const handleDropCategory = async (e, targetCatId) => {
    e.preventDefault();
    setDragOverCatId(null);
    const linkId = e.dataTransfer.getData("text/plain");
    if (linkId) {
      await moveLinkToCategory(linkId, targetCatId);
    }
  };

  return (
    <aside className={`sidebar ${isOpenMobile ? "open" : ""}`} style={{ zIndex: 99 }}>
      
      {/* Header Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{
          backgroundColor: "var(--accent-light)",
          color: "var(--accent)",
          padding: "0.6rem",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 15px rgba(var(--accent-rgb), 0.2)"
        }}>
          <Bookmark size={24} style={{ fill: "currentColor" }} />
        </div>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>Eullon Links</h1>
          <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>Guarde & Organize</span>
        </div>
      </div>

      {/* Seletor de Espaço de Trabalho (Workspace) */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.05em", marginBottom: "0.4rem", padding: "0 0.25rem" }}>
          Espaço de Trabalho
        </div>
        <select
          value={currentWorkspace}
          onChange={(e) => selectWorkspace(e.target.value)}
          className="form-input"
          style={{
            height: "40px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--border-color)",
            paddingLeft: "0.75rem"
          }}
        >
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status da Sincronização */}
      <div style={{ marginBottom: "1.25rem" }}>
        {firebaseConfigured && currentUser ? (
          <div 
            onClick={onOpenSettings}
            className="badge-settings connected"
            style={{ padding: "0.5rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            title="Sincronização Ativa - Clique para ver detalhes"
          >
            <Cloud size={16} />
            <span style={{ fontWeight: 600, fontSize: "0.75rem" }}>Nuvem Sincronizada</span>
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

      {/* Filtros Principais & Especiais */}
      <div style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <button
          onClick={() => handleCategoryClick("all")}
          className={`category-item ${selectedCategoryId === "all" && selectedSpecialFilter === "all" ? "active" : ""}`}
          style={{ width: "100%", textAlign: "left" }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Grid size={18} style={{ marginRight: "0.75rem" }} />
            Todos os Favoritos
          </span>
          <span style={{ fontSize: "0.8rem", backgroundColor: "var(--bg-tertiary)", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)" }}>
            {workspaceLinks.filter(lnk => !lnk.isHidden).length}
          </span>
        </button>

        {/* Mais Acessados */}
        <button
          onClick={() => handleSpecialFilterClick("most-visited")}
          className={`category-item ${selectedSpecialFilter === "most-visited" ? "active" : ""}`}
          style={{ width: "100%", textAlign: "left" }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Flame size={18} style={{ marginRight: "0.75rem", color: "var(--warning)" }} />
            Mais Acessados
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
            {mostVisitedCount}
          </span>
        </button>

        {/* Ler Mais Tarde */}
        <button
          onClick={() => handleSpecialFilterClick("read-later")}
          className={`category-item ${selectedSpecialFilter === "read-later" ? "active" : ""}`}
          style={{ width: "100%", textAlign: "left" }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Clock size={18} style={{ marginRight: "0.75rem", color: "var(--accent)" }} />
            Ler Mais Tarde
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
            {readLaterCount}
          </span>
        </button>
      </div>

      {/* Lista de Categorias (com suporte a Drop Target) */}
      <div style={{ marginBottom: "1.25rem", flex: 1, overflowY: "auto", minHeight: "150px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          marginBottom: "0.5rem",
          padding: "0 0.5rem"
        }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>
            Categorias (Arraste aqui)
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
              onDragOver={(e) => handleDragOverCategory(e, cat.id)}
              onDragLeave={handleDragLeaveCategory}
              onDrop={(e) => handleDropCategory(e, cat.id)}
              className={`category-item ${selectedCategoryId === cat.id && selectedSpecialFilter === "all" ? "active" : ""} ${dragOverCatId === cat.id ? "drop-target-active" : ""}`}
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
      <div style={{ marginBottom: "1.25rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
        <span style={{ 
          display: "block",
          fontSize: "0.75rem", 
          fontWeight: 700, 
          textTransform: "uppercase", 
          color: "var(--text-tertiary)", 
          letterSpacing: "0.05em",
          marginBottom: "0.5rem",
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

      {/* Ferramentas Extras: Health Check & Backup & Links Ocultos */}
      <div style={{ marginBottom: "1.25rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        
        {/* Verificador de Saúde */}
        <button
          onClick={() => {
            if (onOpenHealthCheck) onOpenHealthCheck();
            if (onCloseMobile) onCloseMobile();
          }}
          className="category-item"
          style={{
            width: "100%",
            textAlign: "left",
            backgroundColor: "var(--bg-tertiary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            padding: "0.55rem 0.75rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Activity size={16} style={{ marginRight: "0.75rem", color: "var(--success)" }} />
            <span style={{ fontWeight: 600 }}>Verificar Links</span>
          </span>
          <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
        </button>

        {/* Backup & Importar */}
        <button
          onClick={() => {
            if (onOpenBackup) onOpenBackup();
            if (onCloseMobile) onCloseMobile();
          }}
          className="category-item"
          style={{
            width: "100%",
            textAlign: "left",
            backgroundColor: "var(--bg-tertiary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            padding: "0.55rem 0.75rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Layers size={16} style={{ marginRight: "0.75rem", color: "var(--accent)" }} />
            <span style={{ fontWeight: 600 }}>Backup / Importar</span>
          </span>
          <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
        </button>

        {/* Links Ocultos */}
        <button
          onClick={() => {
            if (onOpenHiddenLinks) onOpenHiddenLinks();
            if (onCloseMobile) onCloseMobile();
          }}
          className="category-item"
          style={{
            width: "100%",
            textAlign: "left",
            backgroundColor: "var(--bg-tertiary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            padding: "0.55rem 0.75rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Lock size={16} style={{ marginRight: "0.75rem", color: "var(--warning)" }} />
            <span style={{ fontWeight: 600 }}>Links Ocultos</span>
          </span>
          <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
        </button>
      </div>

      {/* Extensão e Instalação */}
      <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <button
          onClick={() => {
            if (onOpenExtension) onOpenExtension();
            if (onCloseMobile) onCloseMobile();
          }}
          className="category-item"
          style={{ 
            width: "100%", 
            textAlign: "left",
            backgroundColor: "var(--accent-light)",
            color: "var(--accent)",
            fontWeight: 600,
            borderRadius: "var(--radius-md)",
            border: "1px solid transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.55rem 0.75rem",
            cursor: "pointer",
            transition: "all var(--transition-fast)"
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Puzzle size={16} style={{ marginRight: "0.75rem" }} />
            Extensão do Navegador
          </span>
          <ChevronRight size={14} />
        </button>

        {!isInstalled && (
          <button
            onClick={() => {
              if (onOpenInstall) onOpenInstall();
              if (onCloseMobile) onCloseMobile();
            }}
            className="category-item"
            style={{ 
              width: "100%", 
              textAlign: "left",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontWeight: 600,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.55rem 0.75rem",
              cursor: "pointer",
              transition: "all var(--transition-fast)"
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <Download size={16} style={{ marginRight: "0.75rem" }} />
              Instalar Aplicativo
            </span>
            <ChevronRight size={14} />
          </button>
        )}
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
