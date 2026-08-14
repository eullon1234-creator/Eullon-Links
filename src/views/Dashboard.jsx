import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Search, 
  Plus, 
  Menu, 
  X, 
  Bookmark, 
  FolderOpen,
  Filter,
  Tag,
  Download,
  Lock,
  LayoutGrid,
  List,
  Sparkles,
  Cloud,
  Layers,
  Flame,
  Clock,
  Briefcase,
  Activity
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import LinkCard from "../components/LinkCard";
import ThemeToggle from "../components/ThemeToggle";
import AddEditLinkModal from "../components/AddEditLinkModal";
import CategoryManagerModal from "../components/CategoryManagerModal";
import FirebaseSettingsModal from "../components/FirebaseSettingsModal";
import ExtensionModal from "../components/ExtensionModal";
import InstallAppModal from "../components/InstallAppModal";
import BackupModal from "../components/BackupModal";
import QrCodeModal from "../components/QrCodeModal";
import HealthCheckModal from "../components/HealthCheckModal";

export default function Dashboard() {
  const { 
    links, 
    categories, 
    workspaces,
    currentWorkspace,
    selectWorkspace,
    isInstalled, 
    isInstallable, 
    isIOS,
    viewMode,
    toggleViewMode,
    currentUser,
    loadSampleLinks,
    reorderLinks
  } = useApp();

  // Estados dos filtros
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedSpecialFilter, setSelectedSpecialFilter] = useState("all"); // "all" | "most-visited" | "read-later"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Estados dos Modais
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extensionOpen, setExtensionOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [healthCheckOpen, setHealthCheckOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [linkForQr, setLinkForQr] = useState(null);

  // Drag and Drop reordering state
  const [draggedLinkId, setDraggedLinkId] = useState(null);

  // Links Ocultos
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);
  const [hiddenCodeInput, setHiddenCodeInput] = useState("");
  const [hiddenModalOpen, setHiddenModalOpen] = useState(false);

  // Responsividade Mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Workspace ativo
  const activeWorkspaceObj = workspaces.find(w => w.id === currentWorkspace) || workspaces[0];

  // Encontrar nome da categoria selecionada
  const activeCategory = categories.find(cat => cat.id === selectedCategoryId);
  let mainTitle = selectedCategoryId === "all" ? "Todos os Favoritos" : (activeCategory?.name || "Categoria");
  if (selectedSpecialFilter === "most-visited") mainTitle = "Mais Acessados 🔥";
  if (selectedSpecialFilter === "read-later") mainTitle = "Ler Mais Tarde ⏱️";

  // Ações de Links
  const handleOpenAddModal = () => {
    setLinkToEdit(null);
    setAddEditOpen(true);
  };

  const handleOpenEditModal = (link) => {
    setLinkToEdit(link);
    setAddEditOpen(true);
  };

  const handleOpenQrModal = (link) => {
    setLinkForQr(link);
    setQrModalOpen(true);
  };

  // Filtragem Inteligente dos Links
  let filteredLinks = links.filter(link => {
    // 0. Filtrar por Workspace
    if (currentWorkspace !== "all") {
      const linkWs = link.workspaceId || "ws-pessoal";
      if (linkWs !== currentWorkspace) return false;
    }

    // 1. Filtrar por Filtros Especiais
    if (selectedSpecialFilter === "read-later" && !link.isReadLater) {
      return false;
    }
    if (selectedSpecialFilter === "most-visited" && (!link.clickCount || link.clickCount <= 0)) {
      return false;
    }

    // 2. Filtrar por Categoria
    if (selectedCategoryId !== "all" && link.categoryId !== selectedCategoryId) {
      return false;
    }

    // 3. Filtrar por Prioridade
    if (selectedPriority !== "all" && link.priority !== selectedPriority) {
      return false;
    }

    // 4. Filtrar por Tag selecionada via click de card
    if (selectedTag && (!link.tags || !link.tags.includes(selectedTag))) {
      return false;
    }

    // 5. Filtrar por Busca Textual (Título ou Tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchTitle = link.title && link.title.toLowerCase().includes(query);
      const matchTags = link.tags && link.tags.some(tag => tag.toLowerCase().includes(query));
      return matchTitle || matchTags;
    }

    // 6. Se NÃO estiver desbloqueado, oculta links com isHidden
    if (link.isHidden && !hiddenUnlocked) {
      return false;
    }

    return true;
  });

  // Ordenação por Mais Acessados se filtro estiver ativo
  if (selectedSpecialFilter === "most-visited") {
    filteredLinks = [...filteredLinks].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
  }

  const clearTagFilter = () => {
    setSelectedTag("");
  };

  const clearSearchQuery = () => {
    setSearchQuery("");
  };

  // Coleta todas as tags do sistema para o autocomplete
  const allTags = Array.from(new Set(links.flatMap(link => link.tags || [])));

  // Filtra as sugestões de tags com base na busca
  const cleanSearchQueryText = searchQuery.startsWith("#") ? searchQuery.slice(1) : searchQuery;
  const tagSuggestions = searchQuery.trim() || searchQuery.startsWith("#")
    ? allTags.filter(tag => tag.toLowerCase().includes(cleanSearchQueryText.toLowerCase().trim()))
    : allTags;

  const showSuggestions = searchFocused && (
    searchQuery.startsWith("#") || 
    (searchQuery.trim().length > 0 && tagSuggestions.length > 0)
  );

  const handleSelectTagSuggestion = (tag) => {
    setSelectedTag(tag);
    setSearchQuery("");
    setSearchFocused(false);
  };

  // Drag & Drop reorder
  const handleDragStart = (e, link) => {
    setDraggedLinkId(link.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnCard = (e, targetLink) => {
    e.preventDefault();
    if (!draggedLinkId || draggedLinkId === targetLink.id) return;

    const sourceIndex = links.findIndex(l => l.id === draggedLinkId);
    const targetIndex = links.findIndex(l => l.id === targetLink.id);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newLinks = [...links];
      const [removed] = newLinks.splice(sourceIndex, 1);
      newLinks.splice(targetIndex, 0, removed);
      reorderLinks(newLinks);
    }
    setDraggedLinkId(null);
  };

  // Contadores para os Cards de Estatísticas
  const currentWsLinks = links.filter(l => {
    if (currentWorkspace !== "all" && (l.workspaceId || "ws-pessoal") !== currentWorkspace) return false;
    return !l.isHidden;
  });
  const totalLinksCount = currentWsLinks.length;
  const highPriorityCount = currentWsLinks.filter(l => l.priority === "high").length;
  const readLaterCount = currentWsLinks.filter(l => l.isReadLater).length;

  return (
    <div className="app-container">
      
      {/* HEADER MOBILE FLUTUANTE */}
      <header className="mobile-header">
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          className="btn-icon-only"
          title="Menu de navegação"
          aria-label="Abrir menu de navegação"
        >
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Bookmark size={20} style={{ color: "var(--accent)", fill: "currentColor" }} />
          <span style={{ fontWeight: 700, fontFamily: "var(--font-heading)" }}>Eullon Links</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {!isInstalled && (isInstallable || isIOS) && (
            <button 
              onClick={() => setInstallOpen(true)}
              className="btn-icon-only"
              title="Instalar App"
              style={{ color: "var(--accent)" }}
            >
              <Download size={20} />
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* PAINEL LATERAL (SIDEBAR) */}
      <Sidebar
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
          setSelectedSpecialFilter("all");
        }}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
        selectedSpecialFilter={selectedSpecialFilter}
        onSelectSpecialFilter={setSelectedSpecialFilter}
        onOpenCategories={() => setCategoriesOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenExtension={() => setExtensionOpen(true)}
        onOpenInstall={() => setInstallOpen(true)}
        onOpenHiddenLinks={() => setHiddenModalOpen(true)}
        onOpenBackup={() => setBackupOpen(true)}
        onOpenHealthCheck={() => setHealthCheckOpen(true)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* ÁREA PRINCIPAL DO DASHBOARD */}
      <main className="app-main animate-fade-in">
        
        {/* BARRA DE ESTATÍSTICAS RÁPIDAS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", color: "var(--accent)" }}>
              <Bookmark size={18} />
            </div>
            <div>
              <div className="stat-value">{totalLinksCount}</div>
              <div className="stat-label">Total no Espaço</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "var(--warning)" }}>
              <Flame size={18} />
            </div>
            <div>
              <div className="stat-value">{currentWsLinks.reduce((acc, l) => acc + (l.clickCount || 0), 0)}</div>
              <div className="stat-label">Cliques Totais</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "var(--danger)" }}>
              <Layers size={18} />
            </div>
            <div>
              <div className="stat-value">{highPriorityCount}</div>
              <div className="stat-label">Alta Prioridade</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
              <Clock size={18} />
            </div>
            <div>
              <div className="stat-value">{readLaterCount}</div>
              <div className="stat-label">Ler Mais Tarde</div>
            </div>
          </div>
        </div>

        {/* CABEÇALHO DO DASHBOARD */}
        <div className="dashboard-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge-tag" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                <Briefcase size={12} /> {activeWorkspaceObj.name}
              </span>
            </div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
              {selectedCategoryId !== "all" && activeCategory && (
                <span style={{ 
                  width: "12px", 
                  height: "12px", 
                  borderRadius: "50%", 
                  backgroundColor: activeCategory.color,
                  display: "inline-block"
                }} />
              )}
              {mainTitle}
            </h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              {filteredLinks.length} {filteredLinks.length === 1 ? "favorito encontrado" : "favoritos encontrados"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            
            {/* Campo de Busca Rápida */}
            <div className="search-container">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="search-input"
                placeholder="Buscar por título ou #tags..."
                aria-label="Buscar favoritos"
              />
              {searchQuery && (
                <button
                  onClick={clearSearchQuery}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-tertiary)",
                    cursor: "pointer",
                    zIndex: 5,
                    background: "none",
                    border: "none"
                  }}
                  title="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}

              {/* Autocomplete de Tags */}
              {showSuggestions && (
                <div 
                  className="glass-panel"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: "0.5rem",
                    borderRadius: "var(--radius-md)",
                    padding: "0.5rem",
                    maxHeight: "180px",
                    overflowY: "auto",
                    zIndex: 20,
                    boxShadow: "var(--shadow-lg)",
                    border: "1px solid var(--border-color)",
                    textAlign: "left"
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", padding: "0.25rem", borderBottom: "1px solid var(--border-color)", marginBottom: "0.35rem" }}>
                    Sugestões de Tags ({tagSuggestions.length})
                  </div>
                  {tagSuggestions.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                      {tagSuggestions.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleSelectTagSuggestion(tag)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.4rem 0.5rem",
                            width: "100%",
                            textAlign: "left",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            transition: "all var(--transition-fast)",
                            background: "none",
                            border: "none",
                            color: "var(--text-primary)"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <Tag size={14} style={{ color: "var(--accent)" }} />
                          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>#{tag}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "0.5rem", fontSize: "0.8rem", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                      Nenhuma tag correspondente.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alternador de Visualização (Grid vs List) */}
            <div className="view-mode-toggle" style={{ display: "flex", backgroundColor: "var(--bg-tertiary)", padding: "0.2rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <button 
                onClick={() => toggleViewMode("grid")}
                className={`btn-icon-only ${viewMode === "grid" ? "active" : ""}`}
                style={{
                  padding: "0.4rem",
                  backgroundColor: viewMode === "grid" ? "var(--bg-card)" : "transparent",
                  color: viewMode === "grid" ? "var(--accent)" : "var(--text-tertiary)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: viewMode === "grid" ? "var(--shadow-sm)" : "none"
                }}
                title="Visualização em Grade (Cards)"
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => toggleViewMode("list")}
                className={`btn-icon-only ${viewMode === "list" ? "active" : ""}`}
                style={{
                  padding: "0.4rem",
                  backgroundColor: viewMode === "list" ? "var(--bg-card)" : "transparent",
                  color: viewMode === "list" ? "var(--accent)" : "var(--text-tertiary)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: viewMode === "list" ? "var(--shadow-sm)" : "none"
                }}
                title="Visualização em Lista Compacta"
              >
                <List size={16} />
              </button>
            </div>

            {/* Alternador de Tema & Botão Adicionar */}
            <div className="desktop-only" style={{ display: "flex", gap: "0.5rem" }}>
              <ThemeToggle />
              <button onClick={handleOpenAddModal} className="btn btn-primary">
                <Plus size={18} />
                Adicionar Link
              </button>
            </div>

          </div>
        </div>

        {/* Botão flutuante mobile de Novo Link */}
        <div className="mobile-only" style={{ marginBottom: "1rem" }}>
          <button 
            onClick={handleOpenAddModal} 
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.8rem" }}
          >
            <Plus size={18} />
            Novo Link Favorito
          </button>
        </div>

        {/* Exibição de Tags de Filtro Ativos */}
        {(selectedTag || selectedPriority !== "all" || searchQuery || selectedSpecialFilter !== "all" || hiddenUnlocked) && (
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "0.5rem", 
            marginBottom: "1.5rem",
            padding: "0.75rem",
            backgroundColor: "var(--bg-secondary)",
            border: "1px dashed var(--border-color)",
            borderRadius: "var(--radius-md)"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              <Filter size={14} /> Filtros Ativos:
            </span>

            {selectedSpecialFilter !== "all" && (
              <span className="tag-token" style={{ padding: "0.15rem 0.5rem", fontSize: "0.75rem" }}>
                Modo: {selectedSpecialFilter === "most-visited" ? "Mais Acessados" : "Ler Mais Tarde"}
                <span onClick={() => setSelectedSpecialFilter("all")} className="tag-token-close"><X size={12} /></span>
              </span>
            )}

            {searchQuery && (
              <span className="tag-token" style={{ padding: "0.15rem 0.5rem", fontSize: "0.75rem" }}>
                Busca: "{searchQuery}"
                <span onClick={clearSearchQuery} className="tag-token-close"><X size={12} /></span>
              </span>
            )}

            {selectedTag && (
              <span className="tag-token" style={{ padding: "0.15rem 0.5rem", fontSize: "0.75rem" }}>
                Tag: #{selectedTag}
                <span onClick={clearTagFilter} className="tag-token-close"><X size={12} /></span>
              </span>
            )}

            {selectedPriority !== "all" && (
              <span className="tag-token" style={{ padding: "0.15rem 0.5rem", fontSize: "0.75rem" }}>
                Prioridade: {selectedPriority === "high" ? "Alta" : selectedPriority === "medium" ? "Média" : "Baixa"}
                <span onClick={() => setSelectedPriority("all")} className="tag-token-close"><X size={12} /></span>
              </span>
            )}

            <button 
              onClick={() => {
                setSelectedTag("");
                setSearchQuery("");
                setSelectedPriority("all");
                setSelectedSpecialFilter("all");
              }}
              style={{
                fontSize: "0.75rem",
                color: "var(--danger)",
                fontWeight: 600,
                marginLeft: "auto",
                cursor: "pointer",
                background: "none",
                border: "none"
              }}
            >
              Limpar Todos
            </button>
            {hiddenUnlocked && (
              <span className="tag-token" style={{ padding: "0.15rem 0.5rem", fontSize: "0.75rem", backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
                <Lock size={12} /> Links Ocultos Visíveis
                <span onClick={() => { setHiddenUnlocked(false); setHiddenCodeInput(""); }} className="tag-token-close"><X size={12} /></span>
              </span>
            )}
          </div>
        )}

        {/* LISTAGEM OU GRID DE FAVORITOS SALVOS (COM DRAG & DROP) */}
        {filteredLinks.length > 0 ? (
          viewMode === "list" ? (
            <div className="links-list-container">
              {filteredLinks.map(link => (
                <LinkCard 
                  key={link.id} 
                  link={link} 
                  onEdit={handleOpenEditModal}
                  onSelectTag={setSelectedTag}
                  onOpenQrCode={handleOpenQrModal}
                  viewMode="list"
                  onDragStart={(e) => handleDragStart(e, link)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnCard(e, link)}
                />
              ))}
            </div>
          ) : (
            <div className="links-grid">
              {filteredLinks.map(link => (
                <LinkCard 
                  key={link.id} 
                  link={link} 
                  onEdit={handleOpenEditModal}
                  onSelectTag={setSelectedTag}
                  onOpenQrCode={handleOpenQrModal}
                  viewMode="grid"
                  onDragStart={(e) => handleDragStart(e, link)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnCard(e, link)}
                />
              ))}
            </div>
          )
        ) : (
          /* ESTADO VAZIO INTELIGENTE COM AÇÕES DIRETAS */
          <div className="empty-state glass-panel animate-scale-up" style={{ borderRadius: "var(--radius-lg)", padding: "3rem 1.5rem" }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "rgba(var(--accent-rgb), 0.1)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem auto"
            }}>
              <FolderOpen size={36} />
            </div>

            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              {links.length === 0 ? "Nenhum favorito encontrado neste dispositivo" : "Nenhum link com os filtros selecionados"}
            </h3>

            <p style={{ color: "var(--text-secondary)", maxWidth: "480px", fontSize: "0.95rem", lineHeight: "1.5", margin: "0 auto 1.75rem auto" }}>
              {links.length === 0 ? (
                currentUser ? (
                  "Você está conectado! Seus links da nuvem serão carregados automaticamente ou você pode adicionar seu primeiro favorito."
                ) : (
                  "Já tem links salvos em outro aparelho? Conecte sua conta do Firebase para sincronizar, importe um arquivo de backup ou adicione novos favoritos abaixo."
                )
              ) : (
                "Nenhum dos seus favoritos salvos corresponde à pesquisa ou aos filtros de categoria/tags aplicados."
              )}
            </p>

            {/* Botões de Ação no Estado Vazio */}
            {links.length === 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", maxWidth: "520px", margin: "0 auto" }}>
                <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ padding: "0.75rem 1.25rem" }}>
                  <Plus size={16} />
                  Adicionar Link
                </button>
                
                {!currentUser && (
                  <button onClick={() => setSettingsOpen(true)} className="btn btn-secondary" style={{ padding: "0.75rem 1.25rem" }}>
                    <Cloud size={16} style={{ color: "var(--accent)" }} />
                    Sincronizar com a Nuvem
                  </button>
                )}

                <button onClick={() => setBackupOpen(true)} className="btn btn-secondary" style={{ padding: "0.75rem 1.25rem" }}>
                  <Layers size={16} />
                  Importar Backup
                </button>

                <button onClick={loadSampleLinks} className="btn btn-secondary" style={{ padding: "0.75rem 1.25rem" }}>
                  <Sparkles size={16} style={{ color: "var(--warning)" }} />
                  Carregar Exemplos
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL DE DESBLOQUEIO DE LINKS OCULTOS */}
      {hiddenModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 120 }}>
          <div className="modal-content animate-scale-up" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem" }}>
                <Lock size={22} style={{ color: "var(--warning)" }} />
                Links Ocultos
              </h2>
            </div>
            <div className="modal-body" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                Digite o código de desbloqueio para revelar os links ocultos.
              </p>
              <input
                type="password"
                value={hiddenCodeInput}
                onChange={(e) => setHiddenCodeInput(e.target.value)}
                className="form-input"
                placeholder="Digite o código..."
                style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "0.3em", marginBottom: "1rem" }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (hiddenCodeInput === "019273") {
                      setHiddenUnlocked(true);
                      setHiddenCodeInput("");
                      setHiddenModalOpen(false);
                    }
                  }
                }}
              />
              {hiddenCodeInput && hiddenCodeInput !== "019273" && (
                <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  Código inválido. Tente novamente.
                </div>
              )}
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => {
                  if (hiddenCodeInput === "019273") {
                    setHiddenUnlocked(true);
                    setHiddenCodeInput("");
                    setHiddenModalOpen(false);
                  }
                }}
              >
                <Lock size={16} />
                Desbloquear
              </button>
            </div>
            <div className="modal-footer" style={{ justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => { setHiddenModalOpen(false); setHiddenCodeInput(""); }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR / EDITAR FAVORITO */}
      <AddEditLinkModal
        isOpen={addEditOpen}
        onClose={() => {
          setAddEditOpen(false);
          setLinkToEdit(null);
        }}
        linkToEdit={linkToEdit}
      />

      {/* MODAL DE GERENCIAR CATEGORIAS */}
      <CategoryManagerModal
        isOpen={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
      />

      {/* MODAL DE CONFIGURAÇÃO DO FIREBASE */}
      <FirebaseSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* MODAL DE DOWNLOAD DA EXTENSÃO */}
      <ExtensionModal
        isOpen={extensionOpen}
        onClose={() => setExtensionOpen(false)}
      />

      {/* MODAL DE INSTALAÇÃO DO APP (PWA) */}
      <InstallAppModal
        isOpen={installOpen}
        onClose={() => setInstallOpen(false)}
      />

      {/* MODAL DE BACKUP E IMPORTAÇÃO */}
      <BackupModal
        isOpen={backupOpen}
        onClose={() => setBackupOpen(false)}
      />

      {/* MODAL DE QR CODE */}
      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setLinkForQr(null);
        }}
        link={linkForQr}
      />

      {/* MODAL DE VERIFICAÇÃO DE SAÚDE DOS LINKS */}
      <HealthCheckModal
        isOpen={healthCheckOpen}
        onClose={() => setHealthCheckOpen(false)}
        onEditLink={handleOpenEditModal}
      />

      {/* CSS extra para regras desktop/mobile */}
      <style>{`
        .desktop-only {
          display: flex;
        }
        .mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block;
          }
        }
      `}</style>

    </div>
  );
}
