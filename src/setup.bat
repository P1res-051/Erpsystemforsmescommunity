@echo off
echo.
echo ========================================
echo   SETUP DO IPTV DASHBOARD
echo ========================================
echo.

REM Verificar Node.js
echo Verificando Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao esta instalado!
    echo        Instale em: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detectado
echo.

REM Instalar dependências
echo Instalando dependencias...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo [ERRO] Falha na instalacao!
    echo        Tente: npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo ========================================
echo   INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Proximos passos:
echo.
echo 1. Testar localmente:
echo    npm run dev
echo.
echo 2. Configurar repositorio:
echo    - Edite vite.config.ts
echo    - Altere o 'base' para o nome do seu repositorio
echo    - Exemplo: base: '/iptv-dashboard/'
echo.
echo 3. Fazer deploy:
echo    npm run deploy
echo.
echo Leia o DEPLOY.md para instrucoes detalhadas
echo.
pause
