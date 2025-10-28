# 📥 Como Baixar Todo o Projeto

## 🎯 Opção 1: Baixar pelo Figma Make (RECOMENDADO)

Se você está vendo este projeto no Figma Make:

1. Clique no ícone de **menu** (☰) no canto superior direito
2. Procure por **"Export"** ou **"Download"**
3. Clique em **"Download Project"** ou **"Export as ZIP"**
4. Salve o arquivo ZIP no seu computador
5. Extraia o ZIP para uma pasta
6. Pronto! ✅

---

## 🎯 Opção 2: Copiar Arquivos Manualmente

Se a opção acima não estiver disponível, você pode copiar arquivo por arquivo:

### Estrutura Completa do Projeto

```
iptv-dashboard/
├── 📄 package.json
├── 📄 vite.config.ts
├── 📄 tsconfig.json
├── 📄 tsconfig.node.json
├── 📄 index.html
├── 📄 .gitignore
├── 📄 README.md
├── 📄 DEPLOY.md
├── 📄 QUICKSTART.md
├── 📄 COMANDOS.md
├── 📄 CHECKLIST.md
├── 📄 setup.sh
├── 📄 setup.bat
├── 📄 App.tsx
├── .github/
│   └── workflows/
│       └── deploy.yml
├── styles/
│   └── globals.css
├── utils/
│   └── dataProcessing.ts
└── components/
    ├── IPTVDashboard.tsx
    ├── FinancialView.tsx
    ├── ClientsView.tsx
    ├── RetentionView.tsx
    ├── ConversionView.tsx
    ├── GamesView.tsx
    ├── GeographicView.tsx
    ├── TrafficView.tsx
    ├── Logo.tsx
    ├── figma/
    │   └── ImageWithFallback.tsx
    └── ui/
        ├── accordion.tsx
        ├── alert-dialog.tsx
        ├── alert.tsx
        ├── aspect-ratio.tsx
        ├── avatar.tsx
        ├── badge.tsx
        ├── breadcrumb.tsx
        ├── button.tsx
        ├── calendar.tsx
        ├── card.tsx
        ├── carousel.tsx
        ├── chart.tsx
        ├── checkbox.tsx
        ├── collapsible.tsx
        ├── command.tsx
        ├── context-menu.tsx
        ├── dialog.tsx
        ├── drawer.tsx
        ├── dropdown-menu.tsx
        ├── form.tsx
        ├── hover-card.tsx
        ├── input-otp.tsx
        ├── input.tsx
        ├── label.tsx
        ├── menubar.tsx
        ├── navigation-menu.tsx
        ├── pagination.tsx
        ├── popover.tsx
        ├── progress.tsx
        ├── radio-group.tsx
        ├── resizable.tsx
        ├── scroll-area.tsx
        ├── select.tsx
        ├── separator.tsx
        ├── sheet.tsx
        ├── sidebar.tsx
        ├── skeleton.tsx
        ├── slider.tsx
        ├── sonner.tsx
        ├── switch.tsx
        ├── table.tsx
        ├── tabs.tsx
        ├── textarea.tsx
        ├── toggle-group.tsx
        ├── toggle.tsx
        ├── tooltip.tsx
        ├── use-mobile.ts
        └── utils.ts
```

### Passos para Copiar Manualmente

1. **Crie a estrutura de pastas:**
   ```bash
   mkdir iptv-dashboard
   cd iptv-dashboard
   mkdir -p components/ui components/figma styles utils .github/workflows
   ```

2. **Copie cada arquivo:**
   - Navegue pela estrutura de arquivos na interface
   - Abra cada arquivo
   - Copie o conteúdo
   - Cole em um novo arquivo local com o mesmo nome

3. **Arquivos essenciais (copie nesta ordem):**
   - ✅ `package.json`
   - ✅ `vite.config.ts`
   - ✅ `tsconfig.json`
   - ✅ `index.html`
   - ✅ `App.tsx`
   - ✅ `styles/globals.css`
   - ✅ `utils/dataProcessing.ts`
   - ✅ Todos os arquivos da pasta `components/`

---

## 🎯 Opção 3: Via GitHub (se já estiver no GitHub)

Se o projeto já está em um repositório GitHub:

```bash
# Clone o repositório
git clone https://github.com/USUARIO/iptv-dashboard.git

# Entre na pasta
cd iptv-dashboard

# Instale dependências
npm install

# Execute
npm run dev
```

---

## 🎯 Opção 4: Criar Manualmente do Zero

Se nada funcionar, você pode criar um projeto Vite novo e copiar os componentes:

```bash
# 1. Criar projeto Vite
npm create vite@latest iptv-dashboard -- --template react-ts

# 2. Entrar na pasta
cd iptv-dashboard

# 3. Instalar dependências base
npm install

# 4. Instalar dependências adicionais
npm install lucide-react recharts date-fns xlsx
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar
npm install class-variance-authority clsx tailwind-merge sonner
npm install -D tailwindcss autoprefixer gh-pages

# 5. Agora copie os arquivos manualmente conforme Opção 2
```

---

## 📦 Depois de Baixar

1. **Extraia o ZIP** (se baixou como ZIP)

2. **Abra o terminal** na pasta do projeto

3. **Instale dependências:**
   ```bash
   npm install
   ```

4. **Teste localmente:**
   ```bash
   npm run dev
   ```

5. **Abra no navegador:**
   ```
   http://localhost:5173
   ```

---

## ✅ Verificar se Baixou Tudo

Execute estes comandos para verificar:

```bash
# Ver estrutura do projeto
ls -la

# Deve mostrar:
# - package.json
# - vite.config.ts
# - index.html
# - App.tsx
# - components/
# - styles/
# - utils/

# Verificar se node_modules foi instalado
ls node_modules | wc -l
# Deve mostrar um número > 500
```

---

## 🆘 Problemas ao Baixar

### "Não consigo baixar como ZIP"

**Solução:** Use a Opção 2 (copiar manualmente)

### "Baixei mas faltam arquivos"

**Solução:** Compare com a lista de arquivos acima e copie os que faltam

### "npm install dá erro"

**Solução:**
```bash
# Tente com força
npm install --legacy-peer-deps

# Ou limpe e reinstale
rm -rf node_modules package-lock.json
npm install
```

### "Projeto não abre"

**Solução:** Verifique se:
1. Node.js está instalado (`node --version`)
2. Executou `npm install`
3. Não tem erros no terminal
4. A porta 5173 não está ocupada

---

## 📋 Checklist Pós-Download

- [ ] Projeto extraído em uma pasta
- [ ] Terminal aberto na pasta do projeto
- [ ] `npm install` executado sem erros
- [ ] `npm run dev` executado sem erros
- [ ] Dashboard abre em `http://localhost:5173`
- [ ] Consegue clicar em "Importar Excel"

---

## 🎯 Próximos Passos

Depois de baixar e testar:

1. 📖 Leia o [QUICKSTART.md](QUICKSTART.md) para começar
2. 🚀 Leia o [DEPLOY.md](DEPLOY.md) para fazer deploy
3. ✅ Use o [CHECKLIST.md](CHECKLIST.md) para verificar tudo
4. 🛠️ Consulte [COMANDOS.md](COMANDOS.md) para comandos úteis

---

## 💡 Dicas

- **Mantenha backup:** Sempre salve uma cópia do projeto
- **Versão do Node:** Use Node 18 ou superior
- **Use VSCode:** Melhor editor para este projeto
- **Instale extensões:**
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

---

**Boa sorte! Se tiver problemas, consulte a documentação completa.** 🚀
