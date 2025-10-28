# ✅ Checklist de Deploy - IPTV Dashboard

## 📋 Antes de Começar

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Git instalado (`git --version`)
- [ ] Conta no GitHub criada
- [ ] Código do projeto baixado/extraído

## 🔧 Configuração Inicial

- [ ] Executou `npm install` sem erros
- [ ] Testou localmente com `npm run dev`
- [ ] Dashboard abre em `http://localhost:5173`
- [ ] Consegue importar arquivo Excel de teste
- [ ] Gráficos e métricas aparecem corretamente

## 📝 Configuração do Projeto

- [ ] Editou `vite.config.ts` com o nome correto do repositório
  ```typescript
  base: '/SEU-REPOSITORIO/',
  ```
- [ ] Verificou `package.json` (nome, versão, etc)
- [ ] README.md personalizado (opcional)

## 🌐 GitHub

### Criar Repositório

- [ ] Acessou https://github.com/new
- [ ] Criou repositório (nome: `iptv-dashboard` ou outro)
- [ ] Repositório marcado como **Público**
- [ ] **NÃO** inicializou com README/gitignore

### Configurar Git Local

- [ ] Executou `git config --global user.name "Seu Nome"`
- [ ] Executou `git config --global user.email "seu@email.com"`
- [ ] Inicializou repositório: `git init`

### Primeiro Commit

- [ ] Executou `git add .`
- [ ] Executou `git commit -m "Initial commit"`
- [ ] Adicionou remote: `git remote add origin URL-DO-SEU-REPO`
- [ ] Executou `git branch -M main`
- [ ] Executou `git push -u origin main`
- [ ] Código aparece no GitHub

## 🚀 Deploy

### Build Local

- [ ] Executou `npm run build` sem erros
- [ ] Pasta `dist/` foi criada
- [ ] Executou `npm run preview` e testou
- [ ] Preview funcionou em `http://localhost:4173`

### Deploy para GitHub Pages

- [ ] Executou `npm run deploy`
- [ ] Comando finalizou sem erros
- [ ] Branch `gh-pages` foi criada no GitHub
- [ ] Verificou commits na branch `gh-pages`

### Ativar GitHub Pages

- [ ] Acessou Settings do repositório
- [ ] Clicou em "Pages" no menu lateral
- [ ] Source definido como: **gh-pages** branch
- [ ] Clicou em **Save**
- [ ] Aguardou 2-5 minutos

### Verificar Deploy

- [ ] Acessou `https://SEU-USUARIO.github.io/SEU-REPO/`
- [ ] Site carregou corretamente
- [ ] CSS e estilos aplicados
- [ ] Logo aparece
- [ ] Botão "Importar Excel" funciona
- [ ] Consegue navegar entre abas
- [ ] Gráficos renderizam

## 🎨 Personalização (Opcional)

- [ ] Logo customizado em `components/Logo.tsx`
- [ ] Cores alteradas em `styles/globals.css`
- [ ] Título da página em `index.html`
- [ ] Favicon customizado

## 📊 Teste Final

- [ ] Upload de arquivo Excel funciona
- [ ] Todas as 8 views funcionam:
  - [ ] Overview
  - [ ] Financeiro
  - [ ] Clientes
  - [ ] Retenção
  - [ ] Conversão
  - [ ] Jogos
  - [ ] Geografia
  - [ ] Tráfego
- [ ] Busca de clientes funciona
- [ ] Exportação Excel funciona
- [ ] Gráficos são interativos
- [ ] Responsivo em mobile

## 🔄 Fluxo de Atualização

Após alterações futuras:

- [ ] Fez as modificações no código
- [ ] Testou localmente (`npm run dev`)
- [ ] Commit: `git add . && git commit -m "Descrição"`
- [ ] Push: `git push origin main`
- [ ] Deploy: `npm run deploy`
- [ ] Aguardou 2-5 minutos
- [ ] Verificou site atualizado

## 📱 Compatibilidade

Testado em:

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

## 🐛 Resolução de Problemas

Se algo deu errado:

### Página em Branco

- [ ] Verificou console do navegador (F12)
- [ ] Conferiu `base` no `vite.config.ts`
- [ ] Nome do repositório está correto
- [ ] Fez rebuild: `npm run build && npm run deploy`

### Assets Não Carregam

- [ ] Verificou Network tab (F12)
- [ ] Confirmou que `base` está correto
- [ ] Limpou cache do navegador (Ctrl+Shift+R)

### Erro ao Fazer Deploy

- [ ] Confirmou que `gh-pages` está instalado: `npm install gh-pages --save-dev`
- [ ] Verificou se tem permissão no repositório
- [ ] Tentou login no GitHub via terminal

### Erro 404

- [ ] GitHub Pages está ativado
- [ ] Branch `gh-pages` existe
- [ ] Aguardou 10 minutos
- [ ] URL está correta

## 📈 Métricas de Sucesso

- [ ] Site acessível publicamente
- [ ] Tempo de carregamento < 3 segundos
- [ ] Todas as funcionalidades operacionais
- [ ] Zero erros no console
- [ ] Mobile responsivo

## 🎯 Próximos Passos

- [ ] Compartilhar URL com equipe
- [ ] Adicionar link no README
- [ ] Criar documentação de uso
- [ ] Preparar arquivo Excel de exemplo
- [ ] Configurar domínio customizado (opcional)

## 📝 Notas

**Data do Deploy:** ___/___/______

**URL do Site:** _________________________________

**URL do Repositório:** _________________________________

**Problemas Encontrados:**
_________________________________________
_________________________________________
_________________________________________

**Soluções Aplicadas:**
_________________________________________
_________________________________________
_________________________________________

---

## ✅ Deploy Completo!

Se todos os itens estão marcados, parabéns! 🎉

Seu dashboard está no ar e funcionando.

**Próximo passo:** Comece a usar e analisar seus dados IPTV! 📊

---

**Versão da Checklist:** 2.0  
**Última Atualização:** Outubro 2025
