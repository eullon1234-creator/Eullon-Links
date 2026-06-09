import React from "react";
import { useApp } from "../context/AppContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon-only glass-panel"
      style={{
        borderRadius: "var(--radius-md)",
        padding: "0.6rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--border-color)",
        cursor: "pointer",
        transition: "all var(--transition-fast)"
      }}
      title={theme === "light" ? "Ativar Modo Escuro" : "Ativar Modo Claro"}
      aria-label="Alternar tema de cor"
    >
      {theme === "light" ? (
        <Moon size={20} className="animate-scale-up" style={{ color: "var(--text-secondary)" }} />
      ) : (
        <Sun size={20} className="animate-scale-up" style={{ color: "var(--warning)" }} />
      )}
    </button>
  );
}
