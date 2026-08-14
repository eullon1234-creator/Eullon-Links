import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Download, 
  Smartphone, 
  Monitor, 
  Share, 
  PlusSquare, 
  Info,
  CheckCircle,
  HelpCircle,
  Laptop,
  Check
} from "lucide-react";

export default function InstallAppModal({ isOpen, onClose }) {
  const { isInstallable, isIOS, installApp, isInstalled } = useApp();
  const [activeTab, setActiveTab] = useState(isIOS ? "ios" : "pc");
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await installApp();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-content animate-scale-up" style={{ maxWidth: "540px" }}>
        
        {/* Header do Modal */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1.25rem" }}>
            <Download size={22} style={{ color: "var(--accent)" }} />
            Instalar Aplicativo
          </h2>
          <button onClick={onClose} className="btn-icon-only">
            <X size={20} />
          </button>
        </div>

        {/* Abas de Plataforma */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-secondary)",
          padding: "0.5rem 1.5rem 0 1.5rem",
          gap: "0.5rem"
        }}>
          <button 
            onClick={() => setActiveTab("pc")}
            style={{
              padding: "0.6rem 1rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "pc" ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === "pc" ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Laptop size={16} /> Computador (PC / Mac)
          </button>
          <button 
            onClick={() => setActiveTab("android")}
            style={{
              padding: "0.6rem 1rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "android" ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === "android" ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Smartphone size={16} /> Android
          </button>
          <button 
            onClick={() => setActiveTab("ios")}
            style={{
              padding: "0.6rem 1rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "ios" ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === "ios" ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Smartphone size={16} /> iPhone / iPad
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="modal-body" style={{ padding: "1.5rem" }}>
          
          {/* Botão de instalação direta 1-click se suportado */}
          {isInstallable && (
            <div style={{
              backgroundColor: "rgba(var(--accent-rgb), 0.08)",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem",
              textAlign: "center",
              marginBottom: "1.5rem"
            }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.35rem", color: "var(--text-primary)" }}>
                ✨ Instalação Automática Disponível!
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                Seu navegador suporta instalação instantânea com apenas 1 clique:
              </p>
              <button 
                onClick={handleInstallClick} 
                className="btn btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  padding: "0.8rem 2rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  width: "100%",
                  boxShadow: "0 4px 15px rgba(var(--accent-rgb), 0.35)"
                }}
              >
                {installedSuccess ? <Check size={20} /> : <Download size={20} />}
                {installedSuccess ? "Instalado com Sucesso!" : "Instalar Eullon Links no seu Aparelho"}
              </button>
            </div>
          )}

          {/* GUIA PC */}
          {activeTab === "pc" && (
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Monitor size={18} style={{ color: "var(--accent)" }} />
                Como instalar no Google Chrome ou Microsoft Edge (PC):
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    1
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Olhe para a <strong>barra de endereço (URL)</strong> no topo do seu navegador.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    2
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Clique no ícone de <strong>Instalar Aplicativo</strong> (um monitor com seta para baixo ou o botão <strong>"Instalar"</strong> à direita da barra de URL).
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    3
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Confirme clicando em <strong>"Instalar"</strong>. O Eullon Links abrirá em sua própria janela independente, com atalho na Área de Trabalho e Barra de Tarefas!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GUIA ANDROID */}
          {activeTab === "android" && (
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Smartphone size={18} style={{ color: "var(--accent)" }} />
                Como instalar no celular Android:
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    1
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Abra o app no navegador <strong>Chrome</strong> do seu celular.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    2
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Toque nos <strong>3 pontinhos (Menu)</strong> no canto superior direito.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    3
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GUIA IOS */}
          {activeTab === "ios" && (
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Smartphone size={18} style={{ color: "var(--accent)" }} />
                Como instalar no iPhone / iPad (Safari):
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    1
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Abra o site no navegador <strong>Safari</strong> do seu iPhone ou iPad.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    2
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4", display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                    Toque no botão de <strong>Compartilhar</strong> <Share size={15} style={{ color: "var(--accent)" }} /> na barra inferior.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", backgroundColor: "var(--bg-tertiary)", padding: "0.85rem", borderRadius: "var(--radius-md)" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0 }}>
                    3
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4", display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                    Role e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={15} style={{ color: "var(--accent)" }} />.
                  </div>
                </div>
              </div>
            </div>
          )}

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
