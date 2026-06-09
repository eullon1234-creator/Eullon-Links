import React, { useState, useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import Dashboard from "./views/Dashboard";
import ExtensionPopup from "./views/ExtensionPopup";

function AppContent() {
  const [isExtensionPopup, setIsExtensionPopup] = useState(false);

  useEffect(() => {
    // 1. Verifica pelo parâmetro de query '?popup=true' configurado no manifest.json
    const params = new URLSearchParams(window.location.search);
    if (params.get("popup") === "true") {
      setIsExtensionPopup(true);
      return;
    }

    // 2. Alternativa: Verifica se roda no protocolo de extensão do Chrome/Firefox
    if (
      window.location.protocol.startsWith("chrome-extension:") ||
      window.location.protocol.startsWith("moz-extension:")
    ) {
      setIsExtensionPopup(true);
    }
  }, []);

  if (isExtensionPopup) {
    return <ExtensionPopup />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
