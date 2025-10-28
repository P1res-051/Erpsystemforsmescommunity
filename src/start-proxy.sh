#!/bin/bash

echo "========================================"
echo "  BotConversa Proxy - Inicialização"
echo "========================================"
echo ""

# Verifica se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "[ERRO] Python3 não encontrado!"
    echo ""
    echo "Por favor, instale Python 3.9+ em:"
    echo "https://www.python.org/downloads/"
    echo ""
    exit 1
fi

echo "[OK] Python encontrado: $(python3 --version)"
echo ""

# Verifica se as dependências estão instaladas
echo "Verificando dependências..."
if ! python3 -c "import fastapi" &> /dev/null; then
    echo ""
    echo "[INSTALANDO] Dependências necessárias..."
    echo ""
    pip3 install fastapi uvicorn httpx pydantic python-dotenv
    if [ $? -ne 0 ]; then
        echo ""
        echo "[ERRO] Falha ao instalar dependências!"
        exit 1
    fi
    echo ""
    echo "[OK] Dependências instaladas com sucesso!"
else
    echo "[OK] Dependências já instaladas"
fi

echo ""
echo "========================================"
echo "  Escolha o modo de operação:"
echo "========================================"
echo ""
echo "1. SIMULADO (padrão) - Não usa API real"
echo "2. REAL - Faz requisições reais ao BotConversa"
echo ""
read -p "Digite 1 ou 2: " mode

if [ "$mode" = "2" ]; then
    echo ""
    echo "[MODO REAL ATIVADO]"
    export REAL_MODE=true
    echo ""
    echo "ATENÇÃO: O proxy fará requisições reais à API!"
else
    echo ""
    echo "[MODO SIMULADO ATIVADO]"
    export REAL_MODE=false
    echo ""
    echo "Os envios serão simulados (não usa API real)"
fi

echo ""
echo "========================================"
echo "  Iniciando proxy na porta 8080..."
echo "========================================"
echo ""
echo "Acesse: http://localhost:8080"
echo ""
echo "Pressione Ctrl+C para parar o proxy"
echo ""
echo "========================================"
echo ""

uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
