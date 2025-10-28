# 🚀 Enviar Projeto para GitHub - Guia Definitivo

## ✅ Pré-requisitos

- [x] GitHub conectado ✅
- [x] Arquivos editados (.github/workflows/deploy.yml, .gitignore) ✅
- [ ] Git instalado na sua máquina
- [ ] Repositório criado no GitHub

---

## 📋 Opção 1: Upload Direto pelo GitHub (MAIS FÁCIL)

### Passo 1: Criar Repositório

1. Acesse: https://github.com/new
2. Nome do repositório: `iptv-dashboard`
3. Deixe **público**
4. **NÃO** marque "Add a README file"
5. Clique em **Create repository**

### Passo 2: Baixar o Projeto

**No Figma Make:**
1. Clique no menu (☰) no canto superior direito
2. Procure por **"Export"** ou **"Download Project"**
3. Clique em **"Download as ZIP"**
4. Salve em seu computador
5. Extraia o arquivo ZIP

### Passo 3: Configurar o Base Path

1. Abra a pasta extraída
2. Edite o arquivo `vite.config.ts`
3. Na linha 6, altere:
   ```typescript
   base: '/iptv-dashboard/', // 👈 Use o nome do seu repositório
   ```
4. Salve o arquivo

### Passo 4: Upload pelo GitHub

1. Vá no seu repositório recém-criado
2. Clique em **"uploading an existing file"**
3. Arraste **TODOS** os arquivos da pasta (exceto node_modules se existir)
4. Escreva uma mensagem: `Initial commit - IPTV Dashboard v2.0`
5. Clique em **Commit changes**

### Passo 5: Instalar Dependências e Deploy

Agora você tem duas opções:

**A) Deploy Local (requer Node.js):**
```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/iptv-dashboard.git
cd iptv-dashboard

# Instale dependências
npm install

# Deploy para GitHub Pages
npm run deploy
```

**B) Deploy Automático (GitHub Actions):**

O arquivo `.github/workflows/deploy.yml` já está configurado!

Quando você fizer qualquer push para a branch `main`, o deploy será automático.

Mas para o primeiro deploy, você ainda precisa executar localmente uma vez:
```bash
npm install
npm run deploy
```

### Passo 6: Ativar GitHub Pages

1. Vá em **Settings** do repositório
2. Clique em **Pages** no menu lateral
3. Em **Source**, selecione: **gh-pages** branch
4. Clique em **Save**
5. Aguarde 2-5 minutos

### Passo 7: Acessar o Site

Seu dashboard estará em:
```
https://SEU-USUARIO.github.io/iptv-dashboard/
```

---

## 📋 Opção 2: Via Git (Terminal)

### Passo 1: Baixar e Extrair

1. No Figma Make, baixe o projeto como ZIP
2. Extraia para uma pasta

### Passo 2: Configurar Git

Abra o terminal na pasta do projeto:

```bash
# Configure seu nome e email (se ainda não fez)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Inicialize o repositório
git init
```

### Passo 3: Editar vite.config.ts

Edite `vite.config.ts` e altere o `base`:
```typescript
base: '/iptv-dashboard/', // Nome do seu repositório
```

### Passo 4: Adicionar e Comitar

```bash
# Adicionar todos os arquivos
git add .

# Fazer o commit
git commit -m "🎉 Initial commit - IPTV Dashboard v2.0"
```

### Passo 5: Conectar ao GitHub

```bash
# Adicionar o repositório remoto (ALTERE SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/iptv-dashboard.git

# Renomear branch para main
git branch -M main

# Enviar para o GitHub
git push -u origin main
```

Se pedir usuário e senha:
- **Usuário:** seu username do GitHub
- **Senha:** use um **Personal Access Token** (não a senha normal)

**Como criar Token:**
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Marque: `repo` (todas as permissões)
5. Copie o token e use como senha

### Passo 6: Deploy

```bash
# Instalar dependências
npm install

# Deploy para GitHub Pages
npm run deploy
```

### Passo 7: Ativar GitHub Pages

1. Vá em **Settings** → **Pages**
2. Source: **gh-pages** branch
3. Save

---

## 📋 Opção 3: Deploy Automático com GitHub Actions (RECOMENDADO)

Já está configurado! O arquivo `.github/workflows/deploy.yml` fará deploy automático a cada push.

**Mas atenção:** O GitHub Actions precisa de permissões.

### Configurar Permissões

1. Vá em **Settings** do repositório
2. **Actions** → **General**
3. Em **Workflow permissions**, selecione:
   - ✅ **Read and write permissions**
4. Clique em **Save**

Agora, toda vez que você fizer push para `main`, o deploy será automático! 🎉

---

## 🔍 Verificar se Funcionou

### Checklist Final

- [ ] Código está no GitHub
- [ ] `vite.config.ts` com base correto
- [ ] `npm install` executado sem erros
- [ ] `npm run deploy` executado com sucesso
- [ ] Branch `gh-pages` criada
- [ ] GitHub Pages ativado
- [ ] Site acessível na URL

### Testar Localmente Antes

Antes de fazer deploy:
```bash
# Testar localmente
npm run dev

# Abrir no navegador
http://localhost:5173
```

Se funcionar localmente, funcionará no GitHub Pages!

---

## 🐛 Problemas Comuns

### ❌ Erro ao fazer push

**Problema:** Authentication failed

**Solução:**
1. Use Personal Access Token (não senha)
2. Ou configure SSH keys

### ❌ Página em branco

**Problema:** Assets não carregam

**Solução:**
1. Verifique o `base` no `vite.config.ts`
2. Deve ser: `base: '/nome-exato-do-repo/',`

### ❌ GitHub Actions falhou

**Problema:** Build error

**Solução:**
1. Vá em **Actions** no GitHub
2. Clique no workflow que falhou
3. Veja os logs de erro
4. Geralmente é: permissões ou `npm ci` falhando

**Solução rápida:** Faça deploy manual:
```bash
npm run deploy
```

### ❌ 404 Not Found

**Problema:** Site não aparece

**Solução:**
1. Aguarde 10 minutos
2. Verifique se GitHub Pages está ativado
3. Verifique se a branch `gh-pages` existe
4. Limpe cache do navegador (Ctrl+Shift+R)

---

## 📊 Resumo dos Comandos

```bash
# Setup inicial
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU-USUARIO/iptv-dashboard.git
git branch -M main
git push -u origin main

# Instalar e deploy
npm install
npm run deploy

# Atualizações futuras
git add .
git commit -m "Descrição da alteração"
git push origin main
npm run deploy
```

---

## 🎯 Fluxo de Trabalho Ideal

```
┌─────────────────────┐
│ 1. Criar Repo       │
│    GitHub           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Baixar Projeto   │
│    Figma Make       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Editar           │
│    vite.config.ts   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Upload GitHub    │
│    ou git push      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. npm install      │
│    npm run deploy   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 6. Ativar Pages     │
│    Settings → Pages │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 7. Site no Ar! 🎉  │
│    Aguarde 5 min    │
└─────────────────────┘
```

---

## ✅ Pronto!

Agora seu dashboard está:
- ✅ No GitHub (versionado)
- ✅ Deploy automático configurado
- ✅ Acessível publicamente
- ✅ Pronto para compartilhar

**URL Final:**
```
https://SEU-USUARIO.github.io/iptv-dashboard/
```

---

## 🆘 Precisa de Ajuda?

1. Consulte [DEPLOY.md](DEPLOY.md)
2. Veja [CHECKLIST.md](CHECKLIST.md)
3. Leia [COMANDOS.md](COMANDOS.md)
4. Abra uma issue no GitHub

---

**Boa sorte com o deploy! 🚀**
