import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Download, 
  Upload, 
  FileJson, 
  FileCode, 
  CheckCircle, 
  AlertCircle, 
  Layers,
  Sparkles
} from "lucide-react";

export default function BackupModal({ isOpen, onClose }) {
  const { 
    exportDataJSON, 
    exportDataHTML, 
    importDataJSON, 
    importDataHTML,
    links,
    categories,
    loadSampleLinks 
  } = useApp();

  const [activeTab, setActiveTab] = useState("export"); // "export" | "import"
  const [importStatus, setImportStatus] = useState(null); // { success: boolean, message: string }
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const isJson = file.name.endsWith(".json");
    const isHtml = file.name.endsWith(".html") || file.name.endsWith(".htm");

    reader.onload = async (event) => {
      const content = event.target.result;
      if (isJson) {
        const res = await importDataJSON(content);
        if (res.success) {
          setImportStatus({ success: true, message: `${res.count} links importados com sucesso a partir do arquivo JSON!` });
        } else {
          setImportStatus({ success: false, message: `Erro ao importar JSON: ${res.error}` });
        }
      } else if (isHtml) {
        const res = await importDataHTML(content);
        if (res.success) {
          setImportStatus({ success: true, message: `${res.count} favoritos importados com sucesso do arquivo HTML!` });
        } else {
          setImportStatus({ success: false, message: `Erro ao importar HTML: ${res.error}` });
        }
      } else {
        setImportStatus({ success: false, message: "Formato de arquivo não suportado. Escolha um arquivo .json ou .html" });
      }
    };

    reader.readAsText(file);
  };

  const handleLoadSamples = async () => {
    await loadSampleLinks();
    setImportStatus({ success: true, message: "Links de exemplo adicionados com sucesso!" });
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 115 }}>
      <div className="modal-content animate-scale-up" style={{ maxWidth: "520px" }}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.25rem" }}>
            <Layers size={22} style={{ color: "var(--accent)" }} />
            Backup & Restauração
          </h2>
          <button onClick={onClose} className="btn-icon-only">
            <X size={20} />
          </button>
        </div>

        {/* Abas */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-secondary)",
          padding: "0.5rem 1.5rem 0 1.5rem",
          gap: "0.5rem"
        }}>
          <button 
            onClick={() => { setActiveTab("export"); setImportStatus(null); }}
            style={{
              padding: "0.6rem 1rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "export" ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === "export" ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Download size={16} /> Exportar Backup
          </button>
          <button 
            onClick={() => { setActiveTab("import"); setImportStatus(null); }}
            style={{
              padding: "0.6rem 1rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "import" ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === "import" ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <Upload size={16} /> Importar / Restaurar
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="modal-body" style={{ padding: "1.5rem" }}>
          
          {importStatus && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
              backgroundColor: importStatus.success ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: importStatus.success ? "var(--success)" : "var(--danger)",
              border: `1px solid ${importStatus.success ? "var(--success)" : "var(--danger)"}40`
            }}>
              {importStatus.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{importStatus.message}</span>
            </div>
          )}

          {activeTab === "export" ? (
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                Gere uma cópia segura dos seus <strong>{links.length} favoritos</strong> e <strong>{categories.length} categorias</strong> para salvar no seu computador ou transferir para outros navegadores.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                
                {/* Opção 1: JSON */}
                <div style={{
                  backgroundColor: "var(--bg-tertiary)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      padding: "0.5rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "rgba(139, 92, 246, 0.15)",
                      color: "var(--accent)"
                    }}>
                      <FileJson size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Backup Completo (JSON)</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        Inclui todas as notas, prioridades, tags e categorias.
                      </div>
                    </div>
                  </div>
                  <button onClick={exportDataJSON} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    <Download size={15} /> Baixar JSON
                  </button>
                </div>

                {/* Opção 2: HTML Bookmarks */}
                <div style={{
                  backgroundColor: "var(--bg-tertiary)",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      padding: "0.5rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      color: "var(--success)"
                    }}>
                      <FileCode size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Favoritos de Navegador (HTML)</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        Compatível com Chrome, Edge, Safari e Firefox.
                      </div>
                    </div>
                  </div>
                  <button onClick={exportDataHTML} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    <Download size={15} /> Baixar HTML
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                Importe links a partir de um backup <strong>JSON</strong> do Eullon Links ou importe os favoritos do seu <strong>navegador (arquivo HTML exportado do Chrome/Edge/Firefox)</strong>.
              </p>

              {/* Upload Box */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".json,.html,.htm" 
                style={{ display: "none" }} 
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--accent)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2rem 1rem",
                  textAlign: "center",
                  backgroundColor: "rgba(var(--accent-rgb), 0.03)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginBottom: "1.25rem"
                }}
              >
                <Upload size={36} style={{ color: "var(--accent)", margin: "0 auto 0.75rem auto", display: "block" }} />
                <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>
                  Clique para selecionar seu arquivo
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                  Suporta arquivos <strong>.json</strong> (Eullon Links) ou <strong>.html</strong> (Favoritos do Chrome / Edge)
                </div>
              </div>

              {/* Links de exemplo */}
              <div style={{
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid var(--border-color)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={18} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Quer começar rápido? Carregue links populares:
                  </span>
                </div>
                <button 
                  onClick={handleLoadSamples} 
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Sparkles size={14} /> Carregar Exemplos
                </button>
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
