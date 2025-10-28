@echo off
echo ========================================
echo   Verificador de Modo do Proxy
echo ========================================
echo.

echo Verificando se proxy esta ativo...
curl -s http://localhost:8080/health > temp_response.txt 2>nul

if errorlevel 1 (
    echo.
    echo [ERRO] PROXY NAO ESTA RODANDO!
    echo.
    echo Inicie o proxy primeiro:
    echo.
    echo   set REAL_MODE=true
    echo   uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
    echo.
    del temp_response.txt 2>nul
    pause
    exit /b 1
)

echo [OK] Proxy esta ativo!
echo.

echo ========================================
echo   STATUS DO PROXY
echo ========================================
echo.

type temp_response.txt
echo.
echo.

findstr /C:"\"mode\":\"real\"" temp_response.txt >nul
if errorlevel 1 (
    echo [AVISO] MODO: SIMULADO
    echo.
    echo O proxy esta em modo de teste!
    echo As TAGs NAO serao aplicadas no BotConversa.
    echo.
    echo Para ativar modo REAL:
    echo.
    echo   1. Pare o proxy (Ctrl+C)
    echo   2. Execute:
    echo.
    echo      set REAL_MODE=true
    echo      uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
    echo.
) else (
    echo [OK] MODO: REAL
    echo.
    echo O proxy esta configurado corretamente!
    echo As TAGs serao aplicadas DE VERDADE no BotConversa.
    echo.
)

echo ========================================
echo.

del temp_response.txt 2>nul
pause
