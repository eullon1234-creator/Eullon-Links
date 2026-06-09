import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Database, 
  User, 
  Key, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Lock,
  UserPlus
} from "lucide-react";
import { getFirebaseConfig } from "../firebase/config";

export default function FirebaseSettingsModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    firebaseConfigured, 
    registerWithEmail, 
    loginWithEmail, 
    loginWithGoogle, 
    logoutUser, 
    updateFirebaseConfig 
  } = useApp();

  const [activeTab, setActiveTab] = useState("auth"); // 'auth' ou 'config'
  
  // Estados para formulário de Config do Firebase
  const currentConfig = getFirebaseConfig() || {};
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || "");
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || "");
  const [projectId, setProjectId] = useState(currentConfig.projectId || "");
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || "");
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || "");
  const [appId, setAppId] = useState(currentConfig.appId || "");

  // Estados para login/cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      setError("API Key e Project ID são obrigatórios para configurar o Firebase.");
      return;
    }
    setError("");
    const newConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    };
    updateFirebaseConfig(newConfig);
  };

  const handleResetConfig = () => {
    if (window.confirm("Deseja realmente remover as configurações do Firebase? O app voltará a rodar no modo Local-First.")) {
      updateFirebaseConfig(null);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      setEmail("");
      setPassword("");
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está sendo utilizado.");
      } else if (err.code === "auth/invalid-credential") {
        setError("E-mail ou senha incorretos.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha deve ter no mínimo 6 caracteres.");
      } else {
        setError(err.message || "Ocorreu um erro ao autenticar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro no login com Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale-up" style={{ maxWidth: "480px" }}>
        
        {/* Header do Modal */}
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem" }}>
            <Database size={22} style={{ color: "var(--accent)" }} />
            Sincronização na Nuvem
          </h2>
          <button onClick={onClose} className="btn-icon-only" style={{ padding: "0.25rem" }}>
            <X size={20} />
          </button>
        </div>

        {/* Abas */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", background: "var(--bg-primary)" }}>
          <button
            onClick={() => setActiveTab("auth")}
            style={{
              flex: 1,
              padding: "1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              borderBottom: activeTab === "auth" ? "2px solid var(--accent)" : "none",
              color: activeTab === "auth" ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer"
            }}
          >
            Acesso à Conta
          </button>
          <button
            onClick={() => setActiveTab("config")}
            style={{
              flex: 1,
              padding: "1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              borderBottom: activeTab === "config" ? "2px solid var(--accent)" : "none",
              color: activeTab === "config" ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer"
            }}
          >
            Configurações Firebase
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="modal-body" style={{ padding: "1.5rem" }}>
          {error && (
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              backgroundColor: "var(--danger-light)",
              border: "1px solid rgba(244, 63, 94, 0.2)",
              color: "var(--danger)",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              fontSize: "0.85rem"
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: AUTENTICAÇÃO */}
          {activeTab === "auth" && (
            <div>
              {!firebaseConfigured ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <AlertTriangle size={40} style={{ color: "var(--warning)", marginBottom: "1rem" }} />
                  <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Firebase Não Configurado</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.4", marginBottom: "1.25rem" }}>
                    Você está rodando no modo <strong>Local-First (Offline)</strong>. Seus links são salvos de forma segura no navegador.
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.4", marginBottom: "1.5rem" }}>
                    Para habilitar sincronização em tempo real entre dispositivos, configure suas credenciais do Firebase na aba ao lado.
                  </p>
                  <button 
                    onClick={() => setActiveTab("config")} 
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    Configurar Firebase
                  </button>
                </div>
              ) : currentUser ? (
                /* Usuário Logado */
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <CheckCircle2 size={48} style={{ color: "var(--success)", marginBottom: "1rem" }} />
                  <h3 style={{ marginBottom: "0.25rem", fontSize: "1.2rem" }}>Conectado à Nuvem</h3>
                  <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
                    Sincronização em tempo real ativa
                  </p>
                  
                  <div style={{
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    marginBottom: "2rem",
                    textAlign: "left"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "1.2rem"
                      }}>
                        {currentUser.email ? currentUser.email[0].toUpperCase() : "U"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {currentUser.displayName || "Usuário Sincronizado"}
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={logoutUser} 
                    className="btn btn-danger"
                    style={{ width: "100%" }}
                  >
                    <LogOut size={18} />
                    Desconectar Conta
                  </button>
                </div>
              ) : (
                /* Formulário de Login / Cadastro */
                <form onSubmit={handleAuthSubmit}>
                  <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
                    {isRegistering ? "Criar nova conta" : "Entrar na sua conta"}
                  </h3>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-email">E-mail</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        id="auth-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        placeholder="seuemail@exemplo.com"
                        style={{ paddingLeft: "2.75rem" }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-password">Senha</label>
                    <div style={{ position: "relative" }}>
                      <Lock size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                      <input
                        id="auth-password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        placeholder="Mínimo de 6 caracteres"
                        style={{ paddingLeft: "2.75rem" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ width: "100%", marginTop: "0.5rem" }}
                  >
                    {loading ? (
                      "Carregando..."
                    ) : isRegistering ? (
                      <>
                        <UserPlus size={18} />
                        Cadastrar
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Entrar
                      </>
                    )}
                  </button>

                  <div style={{ margin: "1.5rem 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <hr style={{ flex: 1, borderColor: "var(--border-color)", borderStyle: "solid", borderWidth: "0.5px" }} />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>OU</span>
                    <hr style={{ flex: 1, borderColor: "var(--border-color)", borderStyle: "solid", borderWidth: "0.5px" }} />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="btn btn-secondary"
                    style={{ 
                      width: "100%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: "0.5rem" 
                    }}
                  >
                    {/* SVG Oficial da Google */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Entrar com o Google
                  </button>

                  <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
                    >
                      {isRegistering 
                        ? "Já possui uma conta? Faça Login" 
                        : "Não tem uma conta? Cadastre-se"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CONFIGURAÇÕES DE CREDENCIAIS */}
          {activeTab === "config" && (
            <form onSubmit={handleSaveConfig}>
              <h3 style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>
                Configuração Manual do Firebase
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: "1.4", marginBottom: "1.25rem" }}>
                Insira as credenciais do seu projeto Firebase Console. Ao salvar, a página recarregará automaticamente para validar a conexão.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="firebase-api-key">API Key *</label>
                <input
                  id="firebase-api-key"
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="form-input"
                  placeholder="AIzaSy..."
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="firebase-project-id">Project ID *</label>
                <input
                  id="firebase-project-id"
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="form-input"
                  placeholder="eullon-links-123"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="firebase-auth-domain">Auth Domain</label>
                <input
                  id="firebase-auth-domain"
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="form-input"
                  placeholder="eullon-links-123.firebaseapp.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="firebase-storage-bucket">Storage Bucket</label>
                <input
                  id="firebase-storage-bucket"
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  className="form-input"
                  placeholder="eullon-links-123.appspot.com"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="firebase-messaging-sender">Messaging Sender ID</label>
                  <input
                    id="firebase-messaging-sender"
                    type="text"
                    value={messagingSenderId}
                    onChange={(e) => setMessagingSenderId(e.target.value)}
                    className="form-input"
                    placeholder="9876543210"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="firebase-app-id">App ID</label>
                  <input
                    id="firebase-app-id"
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className="form-input"
                    placeholder="1:9876:web:abcd..."
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  <Key size={18} />
                  Salvar e Recarregar
                </button>
                {firebaseConfigured && (
                  <button
                    type="button"
                    onClick={handleResetConfig}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    Remover
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
