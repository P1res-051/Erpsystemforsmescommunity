@echo off
echo ========================================
echo   BotConversa Proxy - MODO REAL
echo ========================================
echo.
echo [AVISO] MODO REAL ATIVADO!
echo.
echo As requisicoes serao feitas DE VERDADE
echo para a API do BotConversa.
echo.
echo ========================================
echo.

set REAL_MODE=true

echo [OK] Variavel REAL_MODE definida
echo.
echo Iniciando proxy na porta 8080...
echo.
echo Acesse: http://localhost:8080
echo Verifique: http://localhost:8080/health
echo.
echo Deve mostrar: {"mode":"real"}
echo.
echo ========================================
echo.

uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload

pause
