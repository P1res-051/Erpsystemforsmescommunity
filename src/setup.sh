#!/bin/bash

echo "🚀 Setup do IPTV Dashboard"
echo "=========================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não está instalado!"
    echo "   Instale em: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js ${NODE_VERSION} detectado"
echo ""

# Instalar dependências
echo "📥 Instalando dependências..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Instalação concluída com sucesso!${NC}"
    echo ""
    echo "=========================="
    echo "🎯 Próximos passos:"
    echo "=========================="
    echo ""
    echo "1️⃣  Testar localmente:"
    echo "   npm run dev"
    echo ""
    echo "2️⃣  Configurar repositório:"
    echo "   - Edite vite.config.ts e altere o 'base' para o nome do seu repositório"
    echo "   - Exemplo: base: '/iptv-dashboard/'"
    echo ""
    echo "3️⃣  Fazer deploy:"
    echo "   npm run deploy"
    echo ""
    echo "📚 Leia o DEPLOY.md para instruções detalhadas"
    echo ""
else
    echo ""
    echo "❌ Erro na instalação!"
    echo "   Tente: npm install --legacy-peer-deps"
    exit 1
fi
