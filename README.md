# Eullon Links

O **Eullon Links** é um gerenciador de links favoritos completo, moderno e responsivo, projetado para rodar de forma estática no **GitHub Pages** e funcionar de forma integrada como **Extensão de Navegador**. O aplicativo funciona em modo **Local-First** (salvando no `localStorage` do navegador por padrão) e oferece sincronização opcional com a nuvem via **Firebase** (Firestore + Auth).

🔗 **Acesse o aplicativo em produção**: [https://eullon1234-creator.github.io/Eullon-Links/](https://eullon1234-creator.github.io/Eullon-Links/)

---

## ✨ Recursos Principais

- **Visual Premium**: Layout responsivo com tema escuro padrão, glassmorphism, paleta de cores HSL personalizada e transições suaves.
- **Sincronização Híbrida (Local-First + Nuvem)**: Use o aplicativo imediatamente offline. Configure suas credenciais do Firebase e faça login para sincronizar e migrar automaticamente seus favoritos locais para o Firestore.
- **Captura Inteligente de Metadados**: Ao salvar um link, o app busca metadados automaticamente (Título, Descrição e Capa) via API Microlink.
  - **Limpeza de Título**: Remove sufixos repetitivos e marcas dos títulos (ex: `"GitHub - repo/name..."` vira apenas `"name"`).
  - **Favicon Cover Fallback**: Caso a página não tenha uma imagem grande cadastrada, o app busca o logotipo (favicon) em alta resolução pelo serviço do Google.
  - **Auto-Categorização**: Sugere e seleciona automaticamente a categoria com base no domínio e título (ex: links com `github` vão para **Projetos**, `youtube` para **Vídeos**, `openai`/`chatgpt` para **IA**).
- **Busca e Filtros Avançados**:
  - Filtro por categorias personalizadas (com cores e ícones Lucide).
  - Busca textual em tempo real de títulos e tags.
  - Dropdown com autocomplete inteligente de tags na busca digitando `#`.
  - Filtro e ordenação de prioridade com notas e observações exclusivas por favorito.
- **Suporte a Extensão**: Código único compatível com extensão do Chrome/Firefox (`manifest.json` incluído na build).

---

## 🛠️ Tecnologias Utilizadas

- **Core**: React.js & Vite (JavaScript)
- **Estilização**: Vanilla CSS Customizado (HSL & HMR)
- **Ícones**: Lucide React
- **Nuvem & Sincronização**: Firebase (Auth & Firestore)
- **Captura**: API Microlink & Google Favicons API

---

## 🚀 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/eullon1234-creator/Eullon-Links.git
   ```
2. Entre no diretório do projeto:
   ```bash
   cd Eullon-Links
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Renomeie o arquivo `.env.example` para `.env` e configure suas chaves do Firebase.
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Abra `http://localhost:5173/` no seu navegador.
