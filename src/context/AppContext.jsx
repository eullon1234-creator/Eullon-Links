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
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  getDocs 
} from "firebase/firestore";

const AppContext = createContext();

export const DEFAULT_CATEGORIES = [
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

export const SAMPLE_LINKS = [
  {
    id: "sample-1",
    title: "GitHub",
    url: "https://github.com",
    categoryId: "cat-projects",
    priority: "high",
    notes: "Plataforma de hospedagem e desenvolvimento de código",
    observation: "Verificar repositórios ativos",
    tags: ["dev", "git", "codigo"],
    photoUrl: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
    isHidden: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-2",
    title: "ChatGPT",
    url: "https://chatgpt.com",
    categoryId: "cat-ai",
    priority: "high",
    notes: "Inteligência artificial para produtividade e pesquisa",
    observation: "Usar diariamente",
    tags: ["ia", "produtividade", "openai"],
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    isHidden: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "sample-3",
    title: "React Documentation",
    url: "https://react.dev",
    categoryId: "cat-study",
    priority: "medium",
    notes: "Documentação oficial do React com hooks e componentes",
    observation: "Estudar Server Components",
    tags: ["frontend", "javascript", "react"],
    photoUrl: "https://react.dev/images/og-home.png",
    isHidden: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "sample-4",
    title: "YouTube",
    url: "https://youtube.com",
    categoryId: "cat-videos",
    priority: "low",
    notes: "Tutoriais, cursos e entretenimento",
    observation: "",
    tags: ["video", "midia", "estudo"],
    photoUrl: "https://www.youtube.com/img/desktop/yt_1200.png",
    isHidden: false,
    createdAt: new Date(Date.now() - 10800000).toISOString()
  }
];

export const AppProvider = ({ children }) => {
  // Inicialização com leitura síncrona imediata para zero latência na tela inicial
  const [links, setLinks] = useState(() => {
    try {
      const saved = localStorage.getItem("eullon_links_data");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("eullon_categories_data");
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("eullon_links_view_mode") || "grid"; // "grid" | "list"
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("eullon_links_theme");
    return savedTheme || "dark";
  });

  const [firebaseConfigured, setFirebaseConfigured] = useState(isFirebaseConfigured);

  // --- Estados do PWA (Progressive Web App) ---
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detectar se o aplicativo já está instalado / rodando standalone
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
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

  // Disparar instalação nativa do PWA
  const installApp = async () => {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
      return outcome === 'accepted';
    } catch (e) {
      console.error("Erro ao solicitar instalação PWA:", e);
      return false;
    }
  };

  // Alternar modo de visualização (grade / lista)
  const toggleViewMode = (mode) => {
    const newMode = mode || (viewMode === "grid" ? "list" : "grid");
    setViewMode(newMode);
    localStorage.setItem("eullon_links_view_mode", newMode);
  };

  // Aplica o tema
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("eullon_links_theme", theme);
  }, [theme]);

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
        syncWithFirestore(user.uid);
      } else {
        loadLocalData();
      }
    });

    return () => unsubscribe();
  }, [firebaseConfigured]);

  // Carregar dados locais do localStorage
  const loadLocalData = () => {
    try {
      const localLinks = localStorage.getItem("eullon_links_data");
      const localCategories = localStorage.getItem("eullon_categories_data");

      if (localLinks) {
        setLinks(JSON.parse(localLinks));
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
    }
  };

  // Sincronizar em tempo real com o Firestore do usuário logado (com espelhamento em cache local)
  const syncWithFirestore = (userId) => {
    if (!firebaseDb) return;

    // Escutar categorias
    const categoriesRef = collection(firebaseDb, "users", userId, "categories");
    const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
      const cats = [];
      snapshot.forEach((docSnap) => {
        cats.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (cats.length === 0) {
        DEFAULT_CATEGORIES.forEach(async (cat) => {
          await setDoc(doc(firebaseDb, "users", userId, "categories", cat.id), {
            name: cat.name,
            color: cat.color,
            iconName: cat.iconName,
            createdAt: new Date().toISOString()
          });
        });
      } else {
        const sortedCats = cats.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        setCategories(sortedCats);
        // Salva espelho local para carregamento instantâneo offline
        localStorage.setItem("eullon_categories_data", JSON.stringify(sortedCats));
      }
    }, (error) => {
      console.warn("Erro ao sincronizar categorias da nuvem (usando cache local):", error);
      loadLocalData();
    });

    // Escutar links
    const linksRef = collection(firebaseDb, "users", userId, "links");
    const unsubscribeLinks = onSnapshot(linksRef, (snapshot) => {
      const lnks = [];
      snapshot.forEach((docSnap) => {
        lnks.push({ id: docSnap.id, ...docSnap.data() });
      });
      const sortedLinks = lnks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setLinks(sortedLinks);
      // Salva espelho local para carregamento instantâneo offline
      localStorage.setItem("eullon_links_data", JSON.stringify(sortedLinks));
    }, (error) => {
      console.warn("Erro ao sincronizar links da nuvem (usando cache local):", error);
      loadLocalData();
    });

    return () => {
      unsubscribeCategories();
      unsubscribeLinks();
    };
  };

  // Migrar dados locais para a nuvem após login sem perda
  const migrateLocalDataToCloud = async (userId) => {
    if (!firebaseDb) return;
    
    try {
      const localLinksStr = localStorage.getItem("eullon_links_data");
      const localCategoriesStr = localStorage.getItem("eullon_categories_data");

      const localLinks = localLinksStr ? JSON.parse(localLinksStr) : [];
      const localCategories = localCategoriesStr ? JSON.parse(localCategoriesStr) : [];

      const batch = writeBatch(firebaseDb);
      let migrationPerformed = false;

      // Migrar categorias
      if (localCategories.length > 0) {
        const cloudCatsSnap = await getDocs(collection(firebaseDb, "users", userId, "categories"));
        const cloudCatIds = cloudCatsSnap.docs.map(docSnap => docSnap.id);

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
        const cloudLinksUrls = cloudLinksSnap.docs.map(docSnap => docSnap.data().url);

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

    // Atualização otimista local imediata
    const updatedLinks = [newLink, ...links];
    setLinks(updatedLinks);
    localStorage.setItem("eullon_links_data", JSON.stringify(updatedLinks));

    if (currentUser && firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, "users", currentUser.uid, "links", newLink.id), newLink);
      } catch (e) {
        console.error("Erro ao salvar link no Firestore:", e);
      }
    }
  };

  const updateLink = async (linkId, updatedData) => {
    const updatedFields = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    const updatedLinks = links.map(lnk => {
      if (lnk.id === linkId) {
        return { ...lnk, ...updatedFields };
      }
      return lnk;
    });
    setLinks(updatedLinks);
    localStorage.setItem("eullon_links_data", JSON.stringify(updatedLinks));

    if (currentUser && firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, "users", currentUser.uid, "links", linkId), updatedFields, { merge: true });
      } catch (e) {
        console.error("Erro ao atualizar link no Firestore:", e);
      }
    }
  };

  const deleteLink = async (linkId) => {
    const updatedLinks = links.filter(lnk => lnk.id !== linkId);
    setLinks(updatedLinks);
    localStorage.setItem("eullon_links_data", JSON.stringify(updatedLinks));

    if (currentUser && firebaseDb) {
      try {
        await deleteDoc(doc(firebaseDb, "users", currentUser.uid, "links", linkId));
      } catch (e) {
        console.error("Erro ao deletar link no Firestore:", e);
      }
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

    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    localStorage.setItem("eullon_categories_data", JSON.stringify(updatedCats));

    if (currentUser && firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, "users", currentUser.uid, "categories", newCat.id), newCat);
      } catch (e) {
        console.error("Erro ao salvar categoria no Firestore:", e);
      }
    }
  };

  const updateCategory = async (catId, updatedData) => {
    const updatedCats = categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, ...updatedData };
      }
      return cat;
    });
    setCategories(updatedCats);
    localStorage.setItem("eullon_categories_data", JSON.stringify(updatedCats));

    if (currentUser && firebaseDb) {
      try {
        await setDoc(doc(firebaseDb, "users", currentUser.uid, "categories", catId), updatedData, { merge: true });
      } catch (e) {
        console.error("Erro ao atualizar categoria no Firestore:", e);
      }
    }
  };

  const deleteCategory = async (catId) => {
    if (catId === "cat-general") return;

    const updatedCats = categories.filter(cat => cat.id !== catId);
    setCategories(updatedCats);
    localStorage.setItem("eullon_categories_data", JSON.stringify(updatedCats));

    const updatedLinks = links.map(lnk => {
      if (lnk.categoryId === catId) {
        return { ...lnk, categoryId: "cat-general", updatedAt: new Date().toISOString() };
      }
      return lnk;
    });
    setLinks(updatedLinks);
    localStorage.setItem("eullon_links_data", JSON.stringify(updatedLinks));

    if (currentUser && firebaseDb) {
      try {
        await deleteDoc(doc(firebaseDb, "users", currentUser.uid, "categories", catId));
        const linksToUpdate = links.filter(lnk => lnk.categoryId === catId);
        for (const lnk of linksToUpdate) {
          await updateLink(lnk.id, { categoryId: "cat-general" });
        }
      } catch (e) {
        console.error("Erro ao deletar categoria no Firestore:", e);
      }
    }
  };

  // --- Carregar Links de Exemplo ---
  const loadSampleLinks = async () => {
    const existingUrls = links.map(l => l.url);
    const newItems = SAMPLE_LINKS.filter(s => !existingUrls.includes(s.url));
    if (newItems.length === 0) return;

    for (const item of newItems) {
      await addLink(item);
    }
  };

  // --- Exportação de Dados (Backup) ---
  const exportDataJSON = () => {
    const exportObject = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      appName: "Eullon Links",
      categories: categories,
      links: links
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement("a");
    const dateFormatted = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `eullon-links-backup-${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportDataHTML = () => {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. It will be read and overwritten. DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}" LAST_MODIFIED="${Math.floor(Date.now() / 1000)}">Eullon Links</H3>
    <DL><p>
`;

    categories.forEach(cat => {
      const catLinks = links.filter(l => l.categoryId === cat.id);
      if (catLinks.length > 0) {
        html += `        <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}">${cat.name}</H3>\n        <DL><p>\n`;
        catLinks.forEach(lnk => {
          const tagsStr = (lnk.tags || []).join(",");
          html += `            <DT><A HREF="${lnk.url}" ADD_DATE="${Math.floor(new Date(lnk.createdAt || Date.now()).getTime() / 1000)}" TAGS="${tagsStr}">${lnk.title}</A>\n`;
        });
        html += `        </DL><p>\n`;
      }
    });

    html += `    </DL><p>\n</DL><p>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    const dateFormatted = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `eullon-links-bookmarks-${dateFormatted}.html`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  // --- Importação de Dados ---
  const importDataJSON = async (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      let importedCount = 0;

      // Importar categorias
      if (data.categories && Array.isArray(data.categories)) {
        for (const cat of data.categories) {
          if (!categories.some(c => c.id === cat.id || c.name.toLowerCase() === cat.name.toLowerCase())) {
            await addCategory(cat);
          }
        }
      }

      // Importar links
      if (data.links && Array.isArray(data.links)) {
        for (const lnk of data.links) {
          if (!links.some(l => l.url === lnk.url)) {
            await addLink(lnk);
            importedCount++;
          }
        }
      }

      return { success: true, count: importedCount };
    } catch (e) {
      console.error("Erro ao importar JSON:", e);
      return { success: false, error: e.message };
    }
  };

  const importDataHTML = async (htmlString) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const linkElements = doc.querySelectorAll("a[href]");
      let importedCount = 0;

      for (const a of linkElements) {
        const href = a.getAttribute("href");
        const title = a.textContent.trim() || href;
        const tagsAttr = a.getAttribute("tags") || "";
        const tags = tagsAttr ? tagsAttr.split(",").map(t => t.trim()).filter(Boolean) : [];

        if (href && href.startsWith("http") && !links.some(l => l.url === href)) {
          await addLink({
            title: title,
            url: href,
            categoryId: "cat-general",
            priority: "low",
            tags: tags,
            notes: "Importado do navegador",
            observation: "",
            photoUrl: `https://www.google.com/s2/favicons?domain=${new URL(href).hostname}&sz=128`,
            isHidden: false
          });
          importedCount++;
        }
      }

      return { success: true, count: importedCount };
    } catch (e) {
      console.error("Erro ao importar HTML:", e);
      return { success: false, error: e.message };
    }
  };

  // --- Autenticação Firebase ---

  const registerWithEmail = async (email, password) => {
    if (!firebaseAuth) throw new Error("Firebase não está configurado.");
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await migrateLocalDataToCloud(userCredential.user.uid);
    return userCredential.user;
  };

  const loginWithEmail = async (email, password) => {
    if (!firebaseAuth) throw new Error("Firebase não está configurado.");
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
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
      viewMode,
      toggleViewMode,
      firebaseConfigured,
      addLink,
      updateLink,
      deleteLink,
      addCategory,
      updateCategory,
      deleteCategory,
      loadSampleLinks,
      exportDataJSON,
      exportDataHTML,
      importDataJSON,
      importDataHTML,
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
