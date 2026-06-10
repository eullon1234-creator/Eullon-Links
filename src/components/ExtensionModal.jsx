import React from "react";
import { 
  X, 
  Download, 
  Puzzle, 
  Info,
  ExternalLink
} from "lucide-react";

export default function ExtensionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const baseUrl = import.meta.env.BASE_URL || "/";
  const zipUrl = baseUrl.endsWith("/") 
    ? `${baseUrl}eullon-links-extension.zip` 
    : `${baseUrl}/eullon-links-extension.zip`;

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div className="modal-content animate-scale-up" style={{ maxWidth: "540px" }}>
        
        {/* Header do Modal */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1.3rem" }}>
            <Puzzle size={22} style={{ color: "var(--accent)" }} />
            Extensão do Navegador
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
              <Puzzle size={32} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Salve links com apenas um clique!
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.5", maxWidth: "420px", margin: "0 auto" }}>
              Adicione links instantaneamente enquanto navega na web. A extensão sincroniza automaticamente com a sua conta do Eullon Links.
            </p>
          </div>

          {/* Botão de Download */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <a 
              href={zipUrl} 
              download="eullon-links-extension.zip"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.8rem 1.75rem",
                fontSize: "1rem",
                textDecoration: "none",
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)"
              }}
            >
              <Download size={20} />
              Baixar Extensão (.zip)
            </a>
          </div>

          {/* Instruções de Instalação */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
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
              Como instalar no Chrome / Edge / Brave:
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
                  <strong>Baixe e extraia:</strong> Clique no botão acima para baixar o arquivo <code>eullon-links-extension.zip</code> e extraia seu conteúdo em uma pasta de sua preferência.
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
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  <strong>Abra as Extensões:</strong> No seu navegador, acesse o menu de opções e vá em <strong>Extensões</strong> ou digite <code>chrome://extensions</code> na barra de endereços.
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
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  <strong>Ative o Modo Desenvolvedor:</strong> No canto superior direito da página de extensões, ative a chave <strong>"Modo do desenvolvedor"</strong>.
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
                  <strong>Carregar Sem Compactação:</strong> Clique no botão <strong>"Carregar sem compactação"</strong> (Load unpacked) no canto superior esquerdo e selecione a pasta onde você extraiu a extensão (a pasta que contém o arquivo <code>manifest.json</code>).
                </div>
              </div>

            </div>
          </div>

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
