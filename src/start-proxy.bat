@echo off
echo ========================================
echo   BotConversa Proxy - Inicializacao
echo ========================================
echo.

REM Verifica se Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo.
    echo Por favor, instale Python 3.9+ em:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [OK] Python encontrado
echo.

REM Verifica se as dependencias estao instaladas
echo Verificando dependencias...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo.
    echo [INSTALANDO] Dependencias necessarias...
    echo.
    pip install fastapi uvicorn httpx pydantic python-dotenv
    if errorlevel 1 (
        echo.
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas com sucesso!
) else (
    echo [OK] Dependencias ja instaladas
)

echo.
echo ========================================
echo   Escolha o modo de operacao:
echo ========================================
echo.
echo 1. SIMULADO (padrao) - Nao usa API real
echo 2. REAL - Faz requisicoes reais ao BotConversa
echo.
set /p mode="Digite 1 ou 2: "

if "%mode%"=="2" (
    echo.
    echo [MODO REAL ATIVADO]
    set REAL_MODE=true
    echo.
    echo ATENCAO: O proxy fara requisicoes reais a API!
) else (
    echo.
    echo [MODO SIMULADO ATIVADO]
    set REAL_MODE=false
    echo.
    echo Os envios serao simulados (nao usa API real)
)

echo.
echo ========================================
echo   Iniciando proxy na porta 8080...
echo ========================================
echo.
echo Acesse: http://localhost:8080
echo.
echo Pressione Ctrl+C para parar o proxy
echo.
echo ========================================
echo.

uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload

pause
