# 🚀 Guia Completo de Deploy - GitHub Pages

## 📋 Pré-requisitos

- [x] Conta no GitHub
- [x] Git instalado
- [x] Node.js 18+ instalado
- [x] Projeto baixado/clonado

## 🔧 Passo a Passo

### 1️⃣ Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **New repository**
3. Nome do repositório: `iptv-dashboard` (ou outro nome)
4. Deixe **público**
5. **NÃO** inicialize com README
6. Clique em **Create repository**

### 2️⃣ Configurar o Projeto Localmente

```bash
# Navegue até a pasta do projeto
cd iptv-dashboard

# Inicialize o git (se ainda não foi feito)
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "🎉 Initial commit - IPTV Dashboard"

# Adicione o repositório remoto (substitua SEU-USUARIO e SEU-REPOSITORIO)
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# Envie para o GitHub
git push -u origin main
```

> ⚠️ **Se der erro de branch**: Use `git branch -M main` antes do push

### 3️⃣ Configurar o Base Path

Edite o arquivo `/vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/SEU-REPOSITORIO/', // ⚠️ ALTERE AQUI!
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

**Exemplo:** Se seu repositório se chama `iptv-dashboard`:
```typescript
base: '/iptv-dashboard/',
```

### 4️⃣ Instalar Dependências

```bash
# Instale todas as dependências
npm install

# Teste localmente
npm run dev
```

Acesse `http://localhost:5173` e verifique se tudo está funcionando.

### 5️⃣ Deploy Automático

```bash
# Faça o build e deploy de uma vez
npm run deploy
```

Este comando:
1. ✅ Compila o projeto (`npm run build`)
2. ✅ Cria a pasta `dist/`
3. ✅ Faz push para a branch `gh-pages`
4. ✅ Configura automaticamente

### 6️⃣ Ativar GitHub Pages

1. Vá no seu repositório no GitHub
2. Clique em **Settings** (⚙️)
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - Branch: **gh-pages**
   - Folder: **/ (root)**
5. Clique em **Save**
6. Aguarde 2-5 minutos

### 7️⃣ Acessar o Site

Seu dashboard estará disponível em:
```
https://SEU-USUARIO.github.io/SEU-REPOSITORIO/
```

**Exemplo:**
```
https://joaosilva.github.io/iptv-dashboard/
```

## 🔄 Atualizações Futuras

Sempre que fizer alterações:

```bash
# 1. Faça as alterações no código

# 2. Adicione os arquivos
git add .

# 3. Commit
git commit -m "✨ Descrição da alteração"

# 4. Push para main
git push origin main

# 5. Deploy novamente
npm run deploy
```

## 🐛 Resolução de Problemas

### ❌ Erro: "gh-pages not found"

```bash
# Instale o gh-pages
npm install --save-dev gh-pages
```

### ❌ Página em branco após deploy

**Problema:** O `base` no `vite.config.ts` está incorreto.

**Solução:**
1. Verifique o nome exato do seu repositório
2. Edite `vite.config.ts`:
   ```typescript
   base: '/nome-exato-do-repositorio/',
   ```
3. Faça deploy novamente: `npm run deploy`

### ❌ Assets (imagens/CSS) não carregam

**Problema:** Caminho dos assets incorreto.

**Solução:**
1. Certifique-se que o `base` no `vite.config.ts` está correto
2. Use caminhos relativos no código
3. Rebuild: `npm run build && npm run deploy`

### ❌ Erro 404 ao acessar

**Soluções:**
1. Verifique se o GitHub Pages está ativado
2. Aguarde 5-10 minutos após o deploy
3. Limpe o cache do navegador (Ctrl+Shift+R)
4. Verifique se a branch `gh-pages` existe

### ❌ Deploy dá erro de permissão

```bash
# Configure o git com suas credenciais
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Tente novamente
npm run deploy
```

## 🔐 Deploy com Token (se necessário)

Se pedir autenticação:

1. Vá em GitHub → **Settings** → **Developer settings**
2. Clique em **Personal access tokens** → **Tokens (classic)**
3. Gere um novo token com permissão **repo**
4. Use o token como senha ao fazer push

## 📊 Verificar Status do Deploy

1. Vá no repositório
2. Clique em **Actions** (se habilitado)
3. Veja o status do último deploy

Ou veja os commits da branch `gh-pages`:
```
https://github.com/SEU-USUARIO/SEU-REPOSITORIO/tree/gh-pages
```

## 🎯 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado para branch `main`
- [ ] `vite.config.ts` com base correto
- [ ] Dependências instaladas (`npm install`)
- [ ] Testado localmente (`npm run dev`)
- [ ] Deploy realizado (`npm run deploy`)
- [ ] GitHub Pages ativado nas configurações
- [ ] Site acessível na URL pública

## 🌟 Dica Extra: Custom Domain

Se você tem um domínio próprio:

1. Crie um arquivo `CNAME` na pasta `public/`:
   ```
   seudominio.com
   ```

2. Configure o DNS do seu domínio:
   ```
   Type: CNAME
   Name: www
   Value: SEU-USUARIO.github.io
   ```

3. No GitHub Pages, adicione o domínio customizado

---

## 🆘 Ainda com Problemas?

1. Verifique a documentação oficial: [GitHub Pages Docs](https://docs.github.com/en/pages)
2. Abra uma issue no repositório
3. Verifique se o Node.js está atualizado: `node --version`

**Boa sorte com o deploy! 🚀**
