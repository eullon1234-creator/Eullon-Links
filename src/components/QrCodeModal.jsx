import React, { useState } from "react";
import { X, QrCode, Copy, Check, ExternalLink, Smartphone } from "lucide-react";

export default function QrCodeModal({ isOpen, onClose, link }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !link) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(link.url)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 120 }}>
      <div className="modal-content animate-scale-up" style={{ maxWidth: "420px", textAlign: "center" }}>
        
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.2rem" }}>
            <QrCode size={20} style={{ color: "var(--accent)" }} />
            Abrir no Celular
          </h2>
          <button onClick={onClose} className="btn-icon-only">
            <X size={20} />
          </button>
        </div>

        {/* Corpo */}
        <div className="modal-body" style={{ padding: "1.5rem 1rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}>
            <Smartphone size={16} style={{ color: "var(--accent)" }} />
            Aponte a câmera do seu celular para o QR Code abaixo:
          </p>

          {/* QR Code Container */}
          <div style={{
            background: "#ffffff",
            padding: "1rem",
            borderRadius: "var(--radius-lg)",
            display: "inline-block",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            marginBottom: "1.25rem"
          }}>
            <img 
              src={qrCodeUrl} 
              alt={`QR Code para ${link.title}`}
              style={{ width: "220px", height: "220px", display: "block" }}
            />
          </div>

          {/* Título & URL */}
          <div style={{
            backgroundColor: "var(--bg-tertiary)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            textAlign: "left",
            border: "1px solid var(--border-color)",
            marginBottom: "1rem"
          }}>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {link.title}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {link.url}
            </div>
          </div>

          {/* Botões de Ação */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button 
              onClick={handleCopy} 
              className="btn btn-secondary"
              style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {copied ? <Check size={16} style={{ color: "var(--success)" }} /> : <Copy size={16} />}
              {copied ? "Link Copiado!" : "Copiar Link"}
            </button>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", textDecoration: "none" }}
            >
              <ExternalLink size={16} />
              Abrir Link
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
