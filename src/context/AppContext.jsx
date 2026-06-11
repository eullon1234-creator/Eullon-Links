import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  firebaseDb, 
  firebaseAuth, 
  isFirebaseConfigured, 
  initFirebaseInstance 
} from "../firebase/config";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  getDocs
} from "firebase/firestore";

const AppContext = createContext();

const DEFAULT_CATEGORIES = [
  { id: "cat-general", name: "Geral", color: "#6b7280", iconName: "Folder" },
  { id: "cat-work", name: "Trabalho", color: "#3b82f6", iconName: "Briefcase" },
  { id: "cat-study", name: "Estudos", color: "#10b981", iconName: "BookOpen" },
  { id: "cat-design", name: "Design", color: "#8b5cf6", iconName: "Palette" },
  { id: "cat-leisure", name: "Lazer", color: "#f59e0b", iconName: "Sparkles" },
  { id: "cat-pc-games", name: "Jogos de PC", color: "#ef4444", iconName: "Monitor" },
  { id: "cat-mobile-games", name: "Jogos de Celular", color: "#ec4899", iconName: "Smartphone" },
  { id: "cat-switch-games", name: "Jogos de Switch", color: "#f97316", iconName: "Gamepad" },
  { id: "cat-emulators", name: "Emuladores", color: "#ea580c", iconName: "Cpu" },
  { id: "cat-projects", name: "Projetos", color: "#6366f1", iconName: "Code" },
  { id: "cat-tools", name: "Ferramentas", color: "#06b6d4", iconName: "Wrench" },
  { id: "cat-videos", name: "Vídeos", color: "#dc2626", iconName: "Video" },
  { id: "cat-classes", name: "Aulas", color: "#059669", iconName: "GraduationCap" },
  { id: "cat-ai", name: "IA", color: "#a855f7", iconName: "Brain" },
];

export const AppProvider = ({ children }) => {
  // Estado local e de autenticação
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("eullon_links_theme");
    return savedTheme || "dark"; // Modo escuro por padrão
  });

  // Configuração ativa do Firebase
  const [firebaseConfigured, setFirebaseConfigured] = useState(isFirebaseConfigured);

  // --- Estados do PWA (Progressive Web App) ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detectar se o aplicativo já está instalado / rodando standalone
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      setIsInstalled(!!isStandalone);
    };

    checkInstalled();
    
    // 2. Detectar se o dispositivo é iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isDeviceIOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isDeviceIOS);

    // 3. Ouvir o evento beforeinstallprompt do Chrome/Edge/Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 4. Ouvir o evento de aplicativo instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('Eullon Links instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Função para disparar a instalação
  const installApp = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Escolha de instalação do usuário: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome === 'accepted';
  };

  // Aplica o tema inicial
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("eullon_links_theme", theme);
  }, [theme]);

  // Alternar tema
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Monitorar Autenticação do Firebase se estiver configurado
  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuth) {
      setAuthLoading(false);
      loadLocalData();
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      
      if (user) {
        // Se logado, sincroniza com o Firestore
        syncWithFirestore(user.uid);
      } else {
        // Se deslogar, volta a usar dados locais
        loadLocalData();
      }
    });

    return () => unsubscribe();
  }, [firebaseConfigured]);

  // Carregar dados offline do localStorage
  const loadLocalData = () => {
    try {
      const localLinks = localStorage.getItem("eullon_links_data");
      const localCategories = localStorage.getItem("eullon_categories_data");

      if (localLinks) {
        setLinks(JSON.parse(localLinks));
      } else {
        setLinks([]);
      }

      if (localCategories) {
        const parsed = JSON.parse(localCategories);
        const existingNames = parsed.map(c => c.name.toLowerCase());
        const missingDefaults = DEFAULT_CATEGORIES.filter(c => !existingNames.includes(c.name.toLowerCase()));
        
        if (missingDefaults.length > 0) {
          const merged = [...parsed, ...missingDefaults];
          setCategories(merged);
          localStorage.setItem("eullon_categories_data", JSON.stringify(merged));
        } else {
          setCategories(parsed);
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem("eullon_categories_data", JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (e) {
      console.error("Erro ao ler dados locais:", e);
      setLinks([]);
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  // Sincronizar em tempo real com o Firestore do usuário logado
  const syncWithFirestore = (userId) => {
    if (!firebaseDb) return;

    // Escutar categorias
    const categoriesRef = collection(firebaseDb, "users", userId, "categories");
    const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
      const cats = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });

      if (cats.length === 0) {
        // Se for novo usuário sem categorias na nuvem, inicia com as padrão
        DEFAULT_CATEGORIES.forEach(async (cat) => {
          await setDoc(doc(firebaseDb, "users", userId, "categories", cat.id), {
            name: cat.name,
            color: cat.color,
            iconName: cat.iconName,
            createdAt: new Date().toISOString()
          });
        });
      } else {
        setCategories(cats.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      }
    }, (error) => {
      console.error("Erro ao sincronizar categorias da nuvem:", error);
    });

    // Escutar links
    const linksRef = collection(firebaseDb, "users", userId, "links");
    const unsubscribeLinks = onSnapshot(linksRef, (snapshot) => {
      const lnks = [];
      snapshot.forEach((doc) => {
        lnks.push({ id: doc.id, ...doc.data() });
      });
      setLinks(lnks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }, (error) => {
      console.error("Erro ao sincronizar links da nuvem:", error);
    });

    return () => {
      unsubscribeCategories();
      unsubscribeLinks();
    };
  };

  // Migrar dados locais para a nuvem após login
  const migrateLocalDataToCloud = async (userId) => {
    if (!firebaseDb) return;
    
    try {
      const localLinksStr = localStorage.getItem("eullon_links_data");
      const localCategoriesStr = localStorage.getItem("eullon_categories_data");

      const localLinks = localLinksStr ? JSON.parse(localLinksStr) : [];
      const localCategories = localCategoriesStr ? JSON.parse(localCategoriesStr) : [];

      const batch = writeBatch(firebaseDb);
      let migrationPerformed = false;

      // Migrar categorias customizadas que não existam na nuvem
      if (localCategories.length > 0) {
        // Busca categorias existentes na nuvem para não duplicar
        const cloudCatsSnap = await getDocs(collection(firebaseDb, "users", userId, "categories"));
        const cloudCatIds = cloudCatsSnap.docs.map(doc => doc.id);

        localCategories.forEach(cat => {
          if (!cloudCatIds.includes(cat.id)) {
            const catRef = doc(firebaseDb, "users", userId, "categories", cat.id);
            batch.set(catRef, {
              name: cat.name,
              color: cat.color,
              iconName: cat.iconName,
              createdAt: cat.createdAt || new Date().toISOString()
            });
            migrationPerformed = true;
          }
        });
      }

      // Migrar links
      if (localLinks.length > 0) {
        const cloudLinksSnap = await getDocs(collection(firebaseDb, "users", userId, "links"));
        const cloudLinksUrls = cloudLinksSnap.docs.map(doc => doc.data().url);

        localLinks.forEach(link => {
          if (!cloudLinksUrls.includes(link.url)) {
            const linkRef = doc(firebaseDb, "users", userId, "links", link.id);
            batch.set(linkRef, {
              title: link.title,
              url: link.url,
              notes: link.notes || "",
              observation: link.observation || "",
              priority: link.priority || "low",
              photoUrl: link.photoUrl || "",
              categoryId: link.categoryId || "cat-general",
              tags: link.tags || [],
              isHidden: link.isHidden || false,
              createdAt: link.createdAt || new Date().toISOString(),
              updatedAt: link.updatedAt || new Date().toISOString()
            });
            migrationPerformed = true;
          }
        });
      }

      if (migrationPerformed) {
        await batch.commit();
        console.log("Dados locais migrados com sucesso para o Firebase!");
        // Limpar dados locais para evitar duplicidade ou confusão no localStorage
        localStorage.removeItem("eullon_links_data");
      }
    } catch (e) {
      console.error("Erro na migração de dados:", e);
    }
  };

  // --- Operações de LINKS ---

  const addLink = async (linkData) => {
    const newLink = {
      id: "lnk-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      title: linkData.title,
      url: linkData.url,
      notes: linkData.notes || "",
      observation: linkData.observation || "",
      priority: linkData.priority || "low",
      photoUrl: linkData.photoUrl || "",
      categoryId: linkData.categoryId || "cat-general",
      tags: linkData.tags || [],
      isHidden: linkData.isHidden || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (currentUser && firebaseDb) {
      // Salva no Firestore
      try {
        await setDoc(doc(firebaseDb, "users", currentUser.uid, "links", newLink.id), newLink);
      } catch (e) {
        console.error("Erro ao salvar link no Firestore:", e);
      }
    } else {
      // Salva localmente
      const updatedLinks = [newLink, ...links];
      setLinks(updatedLinks);
      localStorage.setItem("eullon_links_data", JSON.stringify(updatedLinks));
    }
  };

  const updateLink = async (linkId, updatedData) => {
    const updatedFields = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    if (currentUser && firebaseDb) {
      // Atualizar no Firestore
      try {
        await setDoc(doc(firebaseDb, "users", currentUser.uid, "links", linkId), updatedFields, { merge: true });
      } catch (e) {
        console.error("Erro ao atualizar link no Firestore:", e);
      }
    } else {
      // Atualizar localmente
      const updatedLinks = links.map(lnk => {
        if (lnk.id === linkId) {
          return { ...lnk, ...updatedFields };
        }
        return lnk;
      });
      setLinks(updatedLinks);
      localStorage.setItem("eullon_links_data", JSON.stringify(updatedLinks));
    }
  };

  const deleteLink = async (linkId) => {
    if (currentUser && firebaseDb) {
      // Excluir no Firestore
      try {
        await deleteDoc(doc(firebaseDb, "users", currentUser.uid, "links", linkId));
      } catch (e) {
        console.error("Erro ao deletar link no Firestore:", e);
      }
    } else {
      // Excluir localmente
      const updatedLinks = links.filter(lnk => lnk.id !== linkId);
      setLinks(updatedLinks);
      localStorage.setItem("eullon_links_data", JSON.stringify(updatedLinks));
    }
  };

  // --- Operações de CATEGORIAS ---

  const addCategory = async (catData) => {
    const newCat = {
      id: "cat-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
      name: catData.name,
      color: catData.color || "#6b7280",
      iconName: catData.iconName || "Folder",
      createdAt: new Date().toISOString()
    };

    if (currentUser && firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, "users", currentUser.uid, "categories", newCat.id), newCat);
      } catch (e) {
        console.error("Erro ao salvar categoria no Firestore:", e);
      }
    } else {
      const updatedCats = [...categories, newCat];
      setCategories(updatedCats);
      localStorage.setItem("eullon_categories_data", JSON.stringify(updatedCats));
    }
  };

  const updateCategory = async (catId, updatedData) => {
    if (currentUser && firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, "users", currentUser.uid, "categories", catId), updatedData, { merge: true });
      } catch (e) {
        console.error("Erro ao atualizar categoria no Firestore:", e);
      }
    } else {
      const updatedCats = categories.map(cat => {
        if (cat.id === catId) {
          return { ...cat, ...updatedData };
        }
        return cat;
      });
      setCategories(updatedCats);
      localStorage.setItem("eullon_categories_data", JSON.stringify(updatedCats));
    }
  };

  const deleteCategory = async (catId) => {
    // Evita deletar a categoria padrão Geral
    if (catId === "cat-general") return;

    if (currentUser && firebaseDb) {
      try {
        await deleteDoc(doc(firebaseDb, "users", currentUser.uid, "categories", catId));
        
        // Mapeia links dessa categoria de volta para Geral no Firestore
        const linksToUpdate = links.filter(lnk => lnk.categoryId === catId);
        for (const lnk of linksToUpdate) {
          await updateLink(lnk.id, { categoryId: "cat-general" });
        }
      } catch (e) {
        console.error("Erro ao deletar categoria no Firestore:", e);
      }
    } else {
      const updatedCats = categories.filter(cat => cat.id !== catId);
      setCategories(updatedCats);
      localStorage.setItem("eullon_categories_data", JSON.stringify(updatedCats));

      // Mapeia links dessa categoria de volta para Geral localmente
      const updatedLinks = links.map(lnk => {
        if (lnk.categoryId === catId) {
          return { ...lnk, categoryId: "cat-general", updatedAt: new Date().toISOString() };
        }
        return lnk;
      });
      setLinks(updatedLinks);
      localStorage.setItem("eullon_links_data", JSON.stringify(updatedLinks));
    }
  };

  // --- Autenticação Firebase ---

  const registerWithEmail = async (email, password) => {
    if (!firebaseAuth) throw new Error("Firebase não está configurado.");
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    // Realiza a migração pós-criação de conta
    await migrateLocalDataToCloud(userCredential.user.uid);
    return userCredential.user;
  };

  const loginWithEmail = async (email, password) => {
    if (!firebaseAuth) throw new Error("Firebase não está configurado.");
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    // Realiza a migração de links locais ao logar
    await migrateLocalDataToCloud(userCredential.user.uid);
    return userCredential.user;
  };

  const loginWithGoogle = async () => {
    if (!firebaseAuth) throw new Error("Firebase não está configurado.");
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(firebaseAuth, provider);
    await migrateLocalDataToCloud(userCredential.user.uid);
    return userCredential.user;
  };

  const logoutUser = async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
    setCurrentUser(null);
  };

  // --- Gerenciar credenciais Firebase ---

  const updateFirebaseConfig = (config) => {
    if (config) {
      localStorage.setItem("eullon_links_firebase_config", JSON.stringify(config));
    } else {
      localStorage.removeItem("eullon_links_firebase_config");
    }
    // Recarregar a página para inicializar a nova instância com as novas credenciais
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      authLoading,
      links,
      categories,
      theme,
      toggleTheme,
      firebaseConfigured,
      addLink,
      updateLink,
      deleteLink,
      addCategory,
      updateCategory,
      deleteCategory,
      registerWithEmail,
      loginWithEmail,
      loginWithGoogle,
      logoutUser,
      updateFirebaseConfig,
      isInstallable,
      isInstalled,
      isIOS,
      installApp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp deve ser usado dentro de um AppProvider");
  }
  return context;
};
