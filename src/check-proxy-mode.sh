#!/bin/bash

echo "========================================"
echo "  Verificador de Modo do Proxy"
echo "========================================"
echo ""

# Verifica se proxy está rodando
echo "🔍 Verificando se proxy está ativo..."
response=$(curl -s http://localhost:8080/health 2>/dev/null)

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ PROXY NÃO ESTÁ RODANDO!"
    echo ""
    echo "Inicie o proxy primeiro:"
    echo ""
    echo "  export REAL_MODE=true"
    echo "  uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload"
    echo ""
    exit 1
fi

echo "✅ Proxy está ativo!"
echo ""

# Verifica modo
mode=$(echo $response | grep -o '"mode":"[^"]*"' | cut -d'"' -f4)

echo "========================================"
echo "  STATUS DO PROXY"
echo "========================================"
echo ""
echo "Resposta completa: $response"
echo ""

if [ "$mode" = "real" ]; then
    echo "✅ MODO: REAL"
    echo ""
    echo "🔥 O proxy está configurado corretamente!"
    echo "   As TAGs serão aplicadas DE VERDADE no BotConversa."
    echo ""
elif [ "$mode" = "simulated" ]; then
    echo "⚠️  MODO: SIMULADO"
    echo ""
    echo "🧪 O proxy está em modo de teste!"
    echo "   As TAGs NÃO serão aplicadas no BotConversa."
    echo ""
    echo "Para ativar modo REAL:"
    echo ""
    echo "  1. Pare o proxy (Ctrl+C)"
    echo "  2. Execute:"
    echo ""
    echo "     export REAL_MODE=true"
    echo "     uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload"
    echo ""
else
    echo "❓ MODO DESCONHECIDO: $mode"
    echo ""
fi

echo "========================================"
echo ""
