@echo off
setlocal enabledelayedexpansion

echo.
echo ===============================================================
echo.
echo       PREPARAR PROJETO PARA GITHUB - IPTV DASHBOARD
echo.
echo ===============================================================
echo.

REM Perguntar nome do repositório
set /p REPO_NAME="Digite o nome do seu repositorio no GitHub (ex: iptv-dashboard): "

if "%REPO_NAME%"=="" (
    echo [ERRO] Nome do repositorio nao pode estar vazio!
    pause
    exit /b 1
)

REM Perguntar usuário do GitHub
set /p GITHUB_USER="Digite seu usuario do GitHub (ex: joaosilva): "

if "%GITHUB_USER%"=="" (
    echo [ERRO] Usuario nao pode estar vazio!
    pause
    exit /b 1
)

echo.
echo Configurando projeto...
echo.

REM 1. Atualizar vite.config.ts
echo 1. Atualizando vite.config.ts...
(
echo import { defineConfig } from 'vite';
echo import react from '@vitejs/plugin-react';
echo.
echo // https://vitejs.dev/config/
echo export default defineConfig^(^{
echo   plugins: [react^(^)],
echo   base: '/%REPO_NAME%/',
echo   optimizeDeps: ^{
echo     exclude: ['lucide-react'],
echo   ^},
echo ^}^);
) > vite.config.ts
echo [OK] vite.config.ts atualizado com base: /%REPO_NAME%/
echo.

REM 2. Verificar Git
echo 2. Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Git nao esta instalado!
    echo        Instale em: https://git-scm.com/
    pause
    exit /b 1
)
echo [OK] Git instalado
echo.

REM 3. Inicializar Git
echo 3. Inicializando repositorio Git...
if not exist ".git" (
    git init
    echo [OK] Repositorio Git inicializado
) else (
    echo [OK] Repositorio Git ja existe
)
echo.

REM 4. Configurar Git (opcional)
set /p CONFIG_GIT="Deseja configurar seu nome e email no Git? (s/n): "

if /i "%CONFIG_GIT%"=="s" (
    set /p GIT_NAME="Seu nome: "
    set /p GIT_EMAIL="Seu email: "
    git config --global user.name "!GIT_NAME!"
    git config --global user.email "!GIT_EMAIL!"
    echo [OK] Git configurado
    echo.
)

REM 5. Adicionar arquivos
echo 4. Adicionando arquivos ao Git...
git add .
echo [OK] Arquivos adicionados
echo.

REM 6. Commit
echo 5. Criando commit inicial...
git commit -m "Initial commit - IPTV Dashboard v2.0"
echo [OK] Commit criado
echo.

REM 7. Adicionar remote
echo 6. Conectando ao repositorio remoto...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
echo [OK] Repositorio remoto configurado
echo.

REM 8. Renomear branch para main
echo 7. Configurando branch main...
git branch -M main
echo [OK] Branch main configurada
echo.

echo ===============================================================
echo.
echo                  PROJETO CONFIGURADO!
echo.
echo ===============================================================
echo.
echo Proximos passos:
echo.
echo 1. Enviar para o GitHub:
echo    git push -u origin main
echo.
echo 2. Instalar dependencias:
echo    npm install
echo.
echo 3. Fazer deploy:
echo    npm run deploy
echo.
echo 4. Ativar GitHub Pages:
echo    - Va em Settings -^> Pages
echo    - Source: gh-pages branch
echo    - Save
echo.
echo 5. Seu site estara em:
echo    https://%GITHUB_USER%.github.io/%REPO_NAME%/
echo.
echo ===============================================================
echo.
echo Dica: Se pedir senha ao fazer push, use um Personal Access Token
echo       Crie em: https://github.com/settings/tokens
echo.
pause
