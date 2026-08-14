import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  ExternalLink, 
  RefreshCw,
  Trash2,
  Edit2
} from "lucide-react";

export default function HealthCheckModal({ isOpen, onClose, onEditLink }) {
  const { links, deleteLink, checkLinksHealth } = useApp();
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setScanning(true);
    try {
      const activeLinks = links.filter(l => !l.isHidden);
      const res = await checkLinksHealth(activeLinks);
      setResults(res);
    } catch (e) {
      console.error("Erro no scanner:", e);
    } finally {
      setScanning(false);
    }
  };

  const brokenCount = results ? results.filter(r => r.status === "warning").length : 0;
  const onlineCount = results ? results.filter(r => r.status === "online").length : 0;

  return (
    <div className="modal-overlay" style={{ zIndex: 115 }}>
      <div className="modal-content animate-scale-up" style={{ maxWidth: "560px" }}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem" }}>
            <Activity size={22} style={{ color: "var(--accent)" }} />
            Verificador de Links (Health Check)
          </h2>
          <button onClick={onClose} className="btn-icon-only">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: "1.5rem", maxHeight: "65vh", overflowY: "auto" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
            Analise todos os seus <strong>{links.length} favoritos</strong> para identificar quais páginas continuam no ar e quais podem estar com problemas ou fora do ar (erro 404/500).
          </p>

          {/* Botão de Início de Scan */}
          {!results && !scanning && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
              <Activity size={48} style={{ color: "var(--accent)", margin: "0 auto 1rem auto" }} />
              <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Pronto para iniciar a verificação</div>
              <button 
                onClick={handleStartScan} 
                className="btn btn-primary"
                style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem", margin: "0.5rem auto 0 auto" }}
              >
                <RefreshCw size={16} /> Iniciar Verificação Agora
              </button>
            </div>
          )}

          {/* Loading do Scanner */}
          {scanning && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
              <Loader2 size={40} className="animate-spin" style={{ color: "var(--accent)", margin: "0 auto 1rem auto" }} />
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>Testando conexões dos seus favoritos...</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
                Verificando cabeçalhos HTTP e acessibilidade
              </div>
            </div>
          )}

          {/* Resultados */}
          {results && !scanning && (
            <div>
              {/* Placar de Resumo */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{
                  flex: 1,
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}>
                  <CheckCircle size={24} style={{ color: "var(--success)" }} />
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--success)" }}>{onlineCount}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Links Online</div>
                  </div>
                </div>

                <div style={{
                  flex: 1,
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: brokenCount > 0 ? "rgba(239, 68, 68, 0.1)" : "var(--bg-tertiary)",
                  border: `1px solid ${brokenCount > 0 ? "rgba(239, 68, 68, 0.3)" : "var(--border-color)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}>
                  <AlertTriangle size={24} style={{ color: brokenCount > 0 ? "var(--danger)" : "var(--text-tertiary)" }} />
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: brokenCount > 0 ? "var(--danger)" : "var(--text-primary)" }}>{brokenCount}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Com Alerta / Falha</div>
                  </div>
                </div>
              </div>

              {/* Lista dos Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {results.map(r => (
                  <div 
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--border-color)"
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, marginRight: "0.75rem" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.url}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.45rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: r.status === "online" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: r.status === "online" ? "var(--success)" : "var(--danger)"
                      }}>
                        {r.status === "online" ? "ONLINE" : "FALHA"}
                      </span>

                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn-icon-mini" title="Testar link no navegador">
                        <ExternalLink size={14} />
                      </a>

                      <button 
                        onClick={() => {
                          const linkObj = links.find(l => l.id === r.id);
                          if (linkObj && onEditLink) {
                            onClose();
                            onEditLink(linkObj);
                          }
                        }}
                        className="btn-icon-mini"
                        title="Editar link"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          {results && (
            <button onClick={handleStartScan} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
              <RefreshCw size={14} /> Verificar Novamente
            </button>
          )}
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
