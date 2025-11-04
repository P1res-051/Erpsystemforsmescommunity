# ⚙️ Configurar CORS no Backend

## 🎯 Objetivo
Permitir que o frontend faça requisições para a API sem erro de CORS.

---

## 🚀 Solução Rápida (Backend FastAPI)

### **1. Instalar dependência (se ainda não instalou):**
```bash
pip install fastapi-cors
```

### **2. Editar arquivo principal do backend:**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ⚡ CONFIGURAÇÃO DE CORS - Adicione ANTES das rotas
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://afbc6652-d717-46ff-a528-c639f76faabd-figmaiframepreview.figma.site",  # Figma Make
        "http://localhost:5173",  # Desenvolvimento local
        "http://localhost:3000",  # Desenvolvimento local alternativo
        "*"  # ⚠️ APENAS PARA TESTES! Remove em produção
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Suas rotas aqui...
@app.post("/api/painel/login")
async def login(username: str, password: str):
    # ...
```

### **3. Reiniciar o servidor:**
```bash
uvicorn main:app --reload
```

---

## ✅ Teste se CORS está funcionando

### **1. Abra o Console do Navegador (F12)**

### **2. Faça login no dashboard**

### **3. Verifique a aba Network:**

#### ✅ **Funcionando:**
```
Status: 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

#### ❌ **Ainda com erro:**
```
Status: (failed)
CORS policy: No 'Access-Control-Allow-Origin' header
```

---

## 🔧 Outras Plataformas

### **Flask (Python):**
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["*"])  # Ou lista específica
```

### **Express.js (Node.js):**
```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*',  // Ou lista específica
  credentials: true
}));
```

### **Django (Python):**
```python
# settings.py
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # Ou use CORS_ALLOWED_ORIGINS
```

---

## 📋 Checklist de Verificação

- [ ] CORS middleware instalado
- [ ] CORS middleware configurado ANTES das rotas
- [ ] Origin do frontend adicionado na lista
- [ ] Servidor reiniciado
- [ ] Testado no navegador (F12 > Network)
- [ ] Headers CORS presentes na resposta

---

## ⚠️ Segurança em Produção

**NÃO use `allow_origins=["*"]` em produção!**

Use domínios específicos:
```python
allow_origins=[
    "https://seu-dominio.com",
    "https://www.seu-dominio.com",
]
```

---

## 🆘 Ainda com problemas?

### **1. Verifique se o middleware está ANTES das rotas:**
```python
# ✅ CORRETO
app.add_middleware(CORSMiddleware, ...)  # Primeiro
@app.get("/api/...")  # Depois

# ❌ ERRADO
@app.get("/api/...")  # Primeiro
app.add_middleware(CORSMiddleware, ...)  # Depois (não funciona!)
```

### **2. Verifique os logs do backend:**
```bash
# Deve aparecer algo como:
INFO: 127.0.0.1:5000 - "OPTIONS /api/painel/login HTTP/1.1" 200 OK
INFO: 127.0.0.1:5000 - "POST /api/painel/login HTTP/1.1" 200 OK
```

### **3. Teste com cURL:**
```bash
curl -X OPTIONS \
  https://automatixbest-api.automation.app.br/api/painel/login \
  -H "Origin: https://figma.site" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Deve retornar headers CORS:
```
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, OPTIONS
```

---

## 📞 Contato

Se ainda tiver problemas, envie:
1. Logs do console (F12)
2. Framework do backend (FastAPI, Flask, Express, etc)
3. Código da configuração CORS
4. Print da aba Network

---

**Última atualização:** 04/11/2025
