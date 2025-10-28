#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║       🚀 PREPARAR PROJETO PARA GITHUB - IPTV DASHBOARD    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Perguntar nome do repositório
echo -e "${BLUE}📝 Como você chamou seu repositório no GitHub?${NC}"
echo "   (Exemplo: iptv-dashboard)"
read -p "   Nome do repositório: " REPO_NAME

if [ -z "$REPO_NAME" ]; then
    echo -e "${RED}❌ Nome do repositório não pode estar vazio!${NC}"
    exit 1
fi

# Perguntar usuário do GitHub
echo ""
echo -e "${BLUE}👤 Qual é seu usuário do GitHub?${NC}"
echo "   (Exemplo: joaosilva)"
read -p "   Usuário: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo -e "${RED}❌ Usuário não pode estar vazio!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚙️  Configurando projeto...${NC}"
echo ""

# 1. Atualizar vite.config.ts
echo "1️⃣  Atualizando vite.config.ts..."
cat > vite.config.ts << EOL
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/${REPO_NAME}/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
EOL
echo -e "${GREEN}   ✅ vite.config.ts atualizado com base: /${REPO_NAME}/${NC}"

# 2. Verificar Git
echo ""
echo "2️⃣  Verificando Git..."
if ! command -v git &> /dev/null; then
    echo -e "${RED}   ❌ Git não está instalado!${NC}"
    echo "      Instale em: https://git-scm.com/"
    exit 1
fi
echo -e "${GREEN}   ✅ Git instalado${NC}"

# 3. Inicializar Git (se necessário)
if [ ! -d ".git" ]; then
    echo ""
    echo "3️⃣  Inicializando repositório Git..."
    git init
    echo -e "${GREEN}   ✅ Repositório Git inicializado${NC}"
else
    echo ""
    echo "3️⃣  Repositório Git já existe"
    echo -e "${GREEN}   ✅ OK${NC}"
fi

# 4. Configurar Git (opcional)
echo ""
echo -e "${BLUE}🔧 Deseja configurar seu nome e email no Git? (s/n)${NC}"
read -p "   Resposta: " CONFIG_GIT

if [ "$CONFIG_GIT" = "s" ] || [ "$CONFIG_GIT" = "S" ]; then
    read -p "   Seu nome: " GIT_NAME
    read -p "   Seu email: " GIT_EMAIL
    git config --global user.name "$GIT_NAME"
    git config --global user.email "$GIT_EMAIL"
    echo -e "${GREEN}   ✅ Git configurado${NC}"
fi

# 5. Adicionar arquivos
echo ""
echo "4️⃣  Adicionando arquivos ao Git..."
git add .
echo -e "${GREEN}   ✅ Arquivos adicionados${NC}"

# 6. Commit
echo ""
echo "5️⃣  Criando commit inicial..."
git commit -m "🎉 Initial commit - IPTV Dashboard v2.0"
echo -e "${GREEN}   ✅ Commit criado${NC}"

# 7. Adicionar remote
echo ""
echo "6️⃣  Conectando ao repositório remoto..."
git remote remove origin 2>/dev/null  # Remove se já existir
git remote add origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git
echo -e "${GREEN}   ✅ Repositório remoto configurado${NC}"

# 8. Renomear branch para main
echo ""
echo "7️⃣  Configurando branch main..."
git branch -M main
echo -e "${GREEN}   ✅ Branch main configurada${NC}"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║                  ✅ PROJETO CONFIGURADO!                  ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo ""
echo "1️⃣  Enviar para o GitHub:"
echo -e "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "2️⃣  Instalar dependências:"
echo -e "   ${BLUE}npm install${NC}"
echo ""
echo "3️⃣  Fazer deploy:"
echo -e "   ${BLUE}npm run deploy${NC}"
echo ""
echo "4️⃣  Ativar GitHub Pages:"
echo "   • Vá em Settings → Pages"
echo "   • Source: gh-pages branch"
echo "   • Save"
echo ""
echo "5️⃣  Seu site estará em:"
echo -e "   ${GREEN}https://${GITHUB_USER}.github.io/${REPO_NAME}/${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}💡 Dica: Se pedir senha ao fazer push, use um Personal Access Token${NC}"
echo "   Crie em: https://github.com/settings/tokens"
echo ""
