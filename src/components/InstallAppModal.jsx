import React from "react";
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
  HelpCircle
} from "lucide-react";

export default function InstallAppModal({ isOpen, onClose }) {
  const { isInstallable, isIOS, installApp } = useApp();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await installApp();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-content animate-scale-up" style={{ maxWidth: "500px" }}>
        
        {/* Header do Modal */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1.3rem" }}>
            <Download size={22} style={{ color: "var(--accent)" }} />
            Instalar Eullon Links
          </h2>
          <button onClick={onClose} className="btn-icon-only" style={{ padding: "0.25rem" }}>
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="modal-body" style={{ padding: "1.5rem" }}>
          
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto"
            }}>
              <Smartphone size={32} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Acesse como um Aplicativo!
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.5", maxWidth: "400px", margin: "0 auto" }}>
              Instale o Eullon Links para ter acesso rápido na sua tela inicial, melhor desempenho, funcionamento offline e visualização sem abas de navegador.
            </p>
          </div>

          {/* Seção Dinâmica com base no Dispositivo */}
          {isInstallable ? (
            /* Cenário 1: Android ou PC com suporte ao prompt automático */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", padding: "0.5rem 0" }}>
              <button 
                onClick={handleInstallClick} 
                className="btn btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 2rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-md)",
                  width: "100%"
                }}
              >
                <Download size={20} />
                Instalar Agora
              </button>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", color: "var(--text-tertiary)", fontSize: "0.8rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Monitor size={14} /> Compatível com PC
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Smartphone size={14} /> Compatível com Celular
                </span>
              </div>
            </div>
          ) : isIOS ? (
            /* Cenário 2: Dispositivos iOS (Safari não suporta prompt de instalação nativo) */
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
              <h4 style={{ 
                fontSize: "0.85rem", 
                fontWeight: 700, 
                textTransform: "uppercase", 
                color: "var(--text-tertiary)", 
                letterSpacing: "0.05em",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}>
                <Info size={16} style={{ color: "var(--accent)" }} />
                Como instalar no seu iPhone / iPad:
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Passo 1 */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    flexShrink: 0
                  }}>
                    1
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Abra esta página no navegador <strong>Safari</strong> do seu aparelho iOS.
                  </div>
                </div>

                {/* Passo 2 */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    flexShrink: 0
                  }}>
                    2
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4", display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: "0.25rem" }}>
                    Toque no botão de <strong>Compartilhar</strong> 
                    <span style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      padding: "0.1rem 0.3rem", 
                      backgroundColor: "var(--bg-tertiary)", 
                      borderRadius: "var(--radius-sm)",
                      color: "var(--accent)"
                    }}>
                      <Share size={14} />
                    </span> na barra inferior do Safari.
                  </div>
                </div>

                {/* Passo 3 */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    flexShrink: 0
                  }}>
                    3
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4", display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: "0.25rem" }}>
                    Role as opções e toque em <strong>Adicionar à Tela de Início</strong>
                    <span style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      padding: "0.1rem 0.3rem", 
                      backgroundColor: "var(--bg-tertiary)", 
                      borderRadius: "var(--radius-sm)",
                      color: "var(--accent)"
                    }}>
                      <PlusSquare size={14} />
                    </span>.
                  </div>
                </div>

                {/* Passo 4 */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    flexShrink: 0
                  }}>
                    4
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    Toque em <strong>Adicionar</strong> no canto superior direito para finalizar a instalação.
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Cenário 3: Navegador/Plataforma genérico (ou app já instalado) */
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
              <div className="glass-panel" style={{ 
                padding: "1rem", 
                borderRadius: "var(--radius-md)", 
                display: "flex", 
                gap: "0.75rem", 
                alignItems: "flex-start",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-tertiary)"
              }}>
                <HelpCircle size={20} style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.1rem" }} />
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  <strong style={{ color: "var(--text-primary)" }}>Como instalar manualmente:</strong>
                  <p style={{ marginTop: "0.35rem" }}>
                    1. Procure pelo ícone de instalação (geralmente uma tela com seta para baixo) na barra de endereços do seu navegador.
                  </p>
                  <p style={{ marginTop: "0.25rem" }}>
                    2. Ou abra o menu do navegador (três pontos ou barras) e selecione <strong>"Instalar Eullon Links"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer do Modal */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
