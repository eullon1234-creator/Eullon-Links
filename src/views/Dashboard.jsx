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
  Lock
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import LinkCard from "../components/LinkCard";
import ThemeToggle from "../components/ThemeToggle";
import AddEditLinkModal from "../components/AddEditLinkModal";
import CategoryManagerModal from "../components/CategoryManagerModal";
import FirebaseSettingsModal from "../components/FirebaseSettingsModal";
import ExtensionModal from "../components/ExtensionModal";
import InstallAppModal from "../components/InstallAppModal";

export default function Dashboard() {
  const { links, categories, isInstalled, isInstallable, isIOS } = useApp();

  // Estados dos filtros
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
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
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);
  const [hiddenCodeInput, setHiddenCodeInput] = useState("");
  const [hiddenModalOpen, setHiddenModalOpen] = useState(false);

  // Responsividade Mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Encontrar nome da categoria selecionada
  const activeCategory = categories.find(cat => cat.id === selectedCategoryId);
  const categoryTitle = selectedCategoryId === "all" ? "Todos os Favoritos" : (activeCategory?.name || "Categoria");

  // Ações de Links
  const handleOpenAddModal = () => {
    setLinkToEdit(null);
    setAddEditOpen(true);
  };

  const handleOpenEditModal = (link) => {
    setLinkToEdit(link);
    setAddEditOpen(true);
  };

  // Filtragem Inteligente dos Links
  const filteredLinks = links.filter(link => {
    // 1. Filtrar por Categoria
    if (selectedCategoryId !== "all" && link.categoryId !== selectedCategoryId) {
      return false;
    }

    // 2. Filtrar por Prioridade
    if (selectedPriority !== "all" && link.priority !== selectedPriority) {
      return false;
    }

    // 3. Filtrar por Tag selecionada via click de card
    if (selectedTag && (!link.tags || !link.tags.includes(selectedTag))) {
      return false;
    }

    // 4. Filtrar por Busca Textual (Título ou Tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchTitle = link.title && link.title.toLowerCase().includes(query);
      const matchTags = link.tags && link.tags.some(tag => tag.toLowerCase().includes(query));
      return matchTitle || matchTags;
    }

    // 5. Se NÃO estiver desbloqueado, oculta links com isHidden
    if (link.isHidden && !hiddenUnlocked) {
      return false;
    }

    return true;
  });

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
    : allTags; // Se estiver em branco (ou apenas focada e com #), mostra todas

  const showSuggestions = searchFocused && (
    searchQuery.startsWith("#") || 
    (searchQuery.trim().length > 0 && tagSuggestions.length > 0)
  );

  const handleSelectTagSuggestion = (tag) => {
    setSelectedTag(tag);
    setSearchQuery("");
    setSearchFocused(false);
  };

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
        onSelectCategory={setSelectedCategoryId}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
        onOpenCategories={() => setCategoriesOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenExtension={() => setExtensionOpen(true)}
        onOpenInstall={() => setInstallOpen(true)}
        onOpenHiddenLinks={() => setHiddenModalOpen(true)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* ÁREA PRINCIPAL DO DASHBOARD */}
      <main className="app-main animate-fade-in">
        
        {/* Cabeçalho da área de conteúdo */}
        <div className="dashboard-header">
          <div>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {selectedCategoryId !== "all" && activeCategory && (
                <span style={{ 
                  width: "12px", 
                  height: "12px", 
                  borderRadius: "50%", 
                  backgroundColor: activeCategory.color,
                  display: "inline-block"
                }} />
              )}
              {categoryTitle}
            </h2>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              {filteredLinks.length} {filteredLinks.length === 1 ? "favorito encontrado" : "favoritos encontrados"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            
            {/* Campo de Busca Rápida */}
            <div className="search-container">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)} // Pequeno delay para registrar cliques em sugestões
                className="search-input"
                placeholder="Buscar ou digite # para tags..."
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
                    zIndex: 5
                  }}
                  title="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}

              {/* Menu de Autocomplete de Tags */}
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
                            transition: "all var(--transition-fast)"
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

            {/* Alternador de Tema (Oculto em celular por já estar no header flutuante) */}
            <div className="desktop-only" style={{ display: "flex", gap: "0.75rem" }}>
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
        {(selectedTag || selectedPriority !== "all" || searchQuery || hiddenUnlocked) && (
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
              }}
              style={{
                fontSize: "0.75rem",
                color: "var(--danger)",
                fontWeight: 600,
                marginLeft: "auto",
                cursor: "pointer"
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

        {/* GRID DE FAVORITOS SALVOS */}
        {filteredLinks.length > 0 ? (
          <div className="links-grid">
            {filteredLinks.map(link => (
              <LinkCard 
                key={link.id} 
                link={link} 
                onEdit={handleOpenEditModal}
                onSelectTag={setSelectedTag}
              />
            ))}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="empty-state glass-panel" style={{ borderRadius: "var(--radius-lg)" }}>
            <FolderOpen className="empty-state-icon" size={56} />
            <h3 style={{ fontSize: "1.25rem" }}>Nenhum favorito encontrado</h3>
            <p style={{ color: "var(--text-secondary)", maxWidth: "320px", fontSize: "0.9rem", lineHeight: "1.4" }}>
              {links.length === 0 
                ? "Sua lista de links está vazia. Comece adicionando o seu primeiro link favorito clicando no botão acima."
                : "Nenhum dos seus favoritos salvos corresponde aos filtros de busca ou tags selecionadas no momento."
              }
            </p>
            {links.length === 0 && (
              <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
                <Plus size={16} />
                Adicionar meu Primeiro Link
              </button>
            )}
          </div>
        )}

      </main>

      {/* MODAL DE DESBLOQUEIO DE LINKS OCULTOS */}
      {hiddenModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-up" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem" }}>
                <Lock size={22} style={{ color: "var(--accent)" }} />
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

      {/* CSS extra para regras desktop/mobile específicas no layout do Dashboard */}
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
