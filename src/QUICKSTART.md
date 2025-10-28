# ⚡ Guia Rápido - 5 Minutos para o Deploy!

## 🎯 Para Iniciantes Absolutos

### Opção 1: Windows

```bash
# 1. Abra o PowerShell ou CMD na pasta do projeto

# 2. Execute o setup automático
setup.bat

# 3. Teste localmente
npm run dev

# 4. Abra no navegador
# http://localhost:5173
```

### Opção 2: Mac/Linux

```bash
# 1. Abra o Terminal na pasta do projeto

# 2. Dê permissão ao script
chmod +x setup.sh

# 3. Execute o setup
./setup.sh

# 4. Teste localmente
npm run dev

# 5. Abra no navegador
# http://localhost:5173
```

## 🌐 Deploy no GitHub Pages (Rápido)

### Passo 1: Criar Repositório GitHub

1. Vá em https://github.com/new
2. Nome: `iptv-dashboard`
3. Público ✅
4. Criar repositório

### Passo 2: Configurar Base Path

Edite `vite.config.ts`, linha 6:

```typescript
base: '/iptv-dashboard/', // 👈 Nome do seu repositório
```

### Passo 3: Enviar para GitHub

```bash
# Inicializar git
git init
git add .
git commit -m "First commit"

# Conectar ao GitHub (ALTERE SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/iptv-dashboard.git

# Enviar
git branch -M main
git push -u origin main
```

### Passo 4: Deploy Automático

```bash
npm run deploy
```

### Passo 5: Ativar GitHub Pages

1. Vá no repositório → **Settings**
2. **Pages** no menu lateral
3. Source: **gh-pages** branch
4. Save

### Passo 6: Acessar

```
https://SEU-USUARIO.github.io/iptv-dashboard/
```

Pronto! 🎉

## 📊 Como Usar o Dashboard

### Preparar Excel

Crie um arquivo Excel com estas abas:

1. **Testes** - Leads/testes
2. **Conversões** - Vendas
3. **Renovações** - Renovações
4. **Clientes Ativos** - Base ativa
5. **Clientes Expirados** - Churned
6. **Jogos** (opcional) - Lista de jogos
7. **Conv x Jogos** (opcional) - Conversões + jogos

### Campos Mínimos

**Conversões/Renovações:**
- Data da Venda
- Custo (1, 1.5, 2, 3, 6, ou 12)
- Estado
- Cidade

### Carregar Dados

1. Clique em **"Importar Excel"**
2. Selecione o arquivo
3. Pronto! ✅

## 🆘 Problemas Comuns

### "npm não é reconhecido"

**Solução:** Instale o Node.js em https://nodejs.org/

### Página em branco após deploy

**Solução:** Verifique o `base` no `vite.config.ts`

### Erro ao fazer push

**Solução:** Configure o git:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

## 📚 Documentação Completa

- [README.md](README.md) - Documentação completa
- [DEPLOY.md](DEPLOY.md) - Guia detalhado de deploy
- [CHANGELOG.md](CHANGELOG.md) - Histórico de versões

## 🎨 Personalizar

### Alterar Logo

Edite `components/Logo.tsx`

### Alterar Cores

Edite `styles/globals.css`:

```css
--color-primary: #10b981; /* Sua cor aqui */
```

### Adicionar Nova View

1. Crie arquivo em `components/MinhaView.tsx`
2. Adicione no menu em `components/IPTVDashboard.tsx`

---

**Dúvidas?** Abra uma issue no GitHub! 🚀
