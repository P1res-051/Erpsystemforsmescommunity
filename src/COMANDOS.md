# 🛠️ Comandos Úteis

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Instalar com resolução de conflitos
npm install --legacy-peer-deps

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar em
http://localhost:5173
```

## 🏗️ Build

```bash
# Build para produção
npm run build

# Preview do build local
npm run preview

# Build + Preview
npm run build && npm run preview
```

## 🌐 Deploy

```bash
# Deploy para GitHub Pages (automático)
npm run deploy

# Deploy manual
npm run build
git subtree push --prefix dist origin gh-pages
```

## 📂 Git

```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "Sua mensagem"

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git

# Push primeira vez
git branch -M main
git push -u origin main

# Push subsequentes
git push origin main

# Ver status
git status

# Ver histórico
git log --oneline

# Criar nova branch
git checkout -b nome-da-branch

# Voltar para main
git checkout main

# Ver branches
git branch -a
```

## 🔄 Atualizar Projeto

```bash
# 1. Fazer alterações no código

# 2. Adicionar arquivos modificados
git add .

# 3. Commit com mensagem descritiva
git commit -m "✨ Nova funcionalidade X"

# 4. Push para GitHub
git push origin main

# 5. Deploy automático
npm run deploy
```

## 🧹 Limpeza

```bash
# Limpar node_modules
rm -rf node_modules

# Limpar dist
rm -rf dist

# Limpar cache npm
npm cache clean --force

# Reinstalar tudo
npm install
```

## 🔍 Verificação

```bash
# Verificar versão do Node
node --version

# Verificar versão do npm
npm --version

# Verificar versão do git
git --version

# Listar dependências instaladas
npm list --depth=0

# Verificar pacotes desatualizados
npm outdated

# Atualizar pacotes
npm update
```

## 🐛 Debug

```bash
# Build com debug
npm run build -- --debug

# Ver erros detalhados
npm run dev --verbose

# Verificar configuração do Vite
npx vite --help
```

## 📊 Análise

```bash
# Analisar tamanho do bundle
npm run build -- --report

# Ver estrutura do projeto
tree -L 3 -I 'node_modules|dist'

# Contar linhas de código
find . -name '*.tsx' -o -name '*.ts' | xargs wc -l
```

## 🔐 Configuração Git

```bash
# Configurar nome
git config --global user.name "Seu Nome"

# Configurar email
git config --global user.email "seu@email.com"

# Ver configurações
git config --list

# Salvar credenciais
git config --global credential.helper store
```

## 🌿 Branches

```bash
# Criar e mudar para nova branch
git checkout -b feature/nova-funcionalidade

# Listar branches
git branch

# Mudar de branch
git checkout main

# Merge de branch
git merge feature/nova-funcionalidade

# Deletar branch local
git branch -d feature/nova-funcionalidade

# Deletar branch remota
git push origin --delete feature/nova-funcionalidade
```

## 📤 Deploy Avançado

```bash
# Deploy com build customizado
npm run build -- --mode production
gh-pages -d dist

# Deploy em branch diferente
gh-pages -d dist -b gh-pages-dev

# Deploy com mensagem customizada
gh-pages -d dist -m "Deploy $(date)"

# Deploy sem histórico (mais rápido)
gh-pages -d dist --nojekyll
```

## 🔄 Rollback

```bash
# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Desfazer último commit (descarta alterações)
git reset --hard HEAD~1

# Voltar para commit específico
git reset --hard <commit-hash>

# Criar tag de versão
git tag -a v1.0.0 -m "Versão 1.0.0"
git push origin v1.0.0
```

## 📦 Dependências

```bash
# Adicionar nova dependência
npm install nome-do-pacote

# Adicionar dependência de desenvolvimento
npm install --save-dev nome-do-pacote

# Remover dependência
npm uninstall nome-do-pacote

# Atualizar dependência específica
npm update nome-do-pacote

# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix
```

## 🎯 Comandos Personalizados (package.json)

Você pode adicionar seus próprios comandos no `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist",
    "clean": "rm -rf node_modules dist",
    "fresh": "npm run clean && npm install"
  }
}
```

Usar com:
```bash
npm run clean
npm run fresh
```

## 🆘 Resolver Problemas

```bash
# Erro de porta ocupada (mudar porta)
npm run dev -- --port 3000

# Erro de permissão (Linux/Mac)
sudo npm install

# Erro de EACCES
sudo chown -R $(whoami) ~/.npm

# Erro de lock file
rm package-lock.json
npm install

# Reinstalar tudo do zero
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📱 Mobile/Teste

```bash
# Acessar de outro dispositivo na mesma rede
npm run dev -- --host

# Aparecerá algo como:
# Local:   http://localhost:5173
# Network: http://192.168.1.100:5173  👈 Use este em outros dispositivos
```

## 🎨 Tailwind

```bash
# Verificar classes não utilizadas
npx tailwindcss-cli --help

# Rebuild CSS
npm run build
```

---

## 📚 Atalhos do Vite (no terminal)

Quando `npm run dev` estiver rodando:

- `r` - Reiniciar servidor
- `u` - Mostrar URLs
- `o` - Abrir no navegador
- `c` - Limpar console
- `q` - Sair

---

**Dica:** Salve este arquivo para consulta rápida! 🚀
