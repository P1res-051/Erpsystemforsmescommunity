@echo off
echo Iniciando API de Jogos...
echo.
echo Instalando dependencias se necessario...
pip install -r requirements-jogos.txt
echo.
echo Iniciando servidor na porta 5000...
echo Acesse: http://localhost:5000/api/status
echo.
python JOGOS.PY --api --port 5000
pause