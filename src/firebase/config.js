import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const getFirebaseConfig = () => {
  // 1. Tenta ler do localStorage primeiro (configurações inseridas via interface)
  try {
    const savedConfig = localStorage.getItem("eullon_links_firebase_config");
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao ler configuração do Firebase do localStorage:", e);
  }

  // 2. Fallback para variáveis de ambiente (.env)
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Garante que não está com o valor padrão do .env.example
  if (
    envConfig.apiKey &&
    envConfig.projectId &&
    envConfig.apiKey !== "sua_api_key_aqui"
  ) {
    return envConfig;
  }

  return null;
};

let app = null;
let db = null;
let auth = null;

export const initFirebaseInstance = () => {
  const config = getFirebaseConfig();
  if (!config) {
    return { app: null, db: null, auth: null };
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
    } else {
      app = initializeApp(config);
    }
    db = getFirestore(app);
    auth = getAuth(app);
    return { app, db, auth };
  } catch (error) {
    console.error("Erro ao inicializar conexão do Firebase:", error);
    return { app: null, db: null, auth: null };
  }
};

const instance = initFirebaseInstance();
export const firebaseApp = instance.app;
export const firebaseDb = instance.db;
export const firebaseAuth = instance.auth;
export const isFirebaseConfigured = !!instance.app;
