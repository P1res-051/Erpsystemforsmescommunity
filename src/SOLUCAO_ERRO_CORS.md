# 🚫 Solução: Erro de CORS

## ❌ Problema

Você está vendo este erro:
```
🚫 ERRO DE CORS: O backend não permite requisições deste domínio
```

**O que é CORS?**
CORS (Cross-Origin Resource Sharing) é uma medida de segurança dos navegadores que bloqueia requisições entre domínios diferentes.

**Por que acontece?**
- **Frontend:** `https://afbc6652-d717-46ff-a528-c639f76faabd-figmaiframepreview.figma.site`
- **Backend:** `https://automatixbest-api.automation.app.br`

Como são domínios diferentes, o navegador bloqueia a requisição por segurança.

---

## ✅ Solução 1: Login Admin (RECOMENDADO para Testes)

**Mais rápido e simples!** Use o login admin que bypassa a API:

### **Credenciais:**
- **Username:** `admin`
- **Senha:** `admin123`

### **Como usar:**
1. Vá para a tela de login
2. Digite `admin` no campo "Nome da Revenda"
3. Digite `admin123` no campo "Senha da Revenda"
4. Clique em "Entrar no Dashboard"

✅ **Você terá acesso completo ao dashboard com dados de exemplo!**

---

## ✅ Solução 2: Configurar CORS no Backend (PERMANENTE)

**Ideal para produção!** Configure o backend para aceitar requisições do frontend.

### **1. Backend FastAPI (Python)**

Adicione no arquivo principal do backend:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://afbc6652-d717-46ff-a528-c639f76faabd-figmaiframepreview.figma.site",
        "http://localhost:5173",  # Para desenvolvimento local
        "http://localhost:3000",
        "*"  # ⚠️ APENAS PARA TESTES - Não use em produção!
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **2. Backend Express.js (Node.js)**

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Configurar CORS
app.use(cors({
  origin: [
    'https://afbc6652-d717-46ff-a528-c639f76faabd-figmaiframepreview.figma.site',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### **3. Backend Flask (Python)**

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configurar CORS
CORS(app, origins=[
    "https://afbc6652-d717-46ff-a528-c639f76faabd-figmaiframepreview.figma.site",
    "http://localhost:5173",
    "http://localhost:3000"
])
```

### **4. Backend em .htaccess (Apache)**

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://afbc6652-d717-46ff-a528-c639f76faabd-figmaiframepreview.figma.site"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

### **5. Backend NGINX**

```nginx
location /api {
    add_header 'Access-Control-Allow-Origin' 'https://afbc6652-d717-46ff-a528-c639f76faabd-figmaiframepreview.figma.site' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

---

## ✅ Solução 3: Proxy Local (TEMPORÁRIO)

**Útil durante desenvolvimento!** Use um proxy local para contornar CORS.

### **Usando o Proxy Python incluído:**

```bash
# Windows
start-proxy.bat

# Linux/Mac
./start-proxy.sh
```

Ou manualmente:

```bash
python botconversa_proxy.py
```

O proxy estará rodando em `http://localhost:8000`

### **Atualizar URL da API:**

Depois de iniciar o proxy, atualize a URL no código:

**Arquivo:** `/utils/apiService.ts`

```typescript
// Antes
const API_BASE_URL = 'https://automatixbest-api.automation.app.br/api/painel';

// Depois (com proxy)
const API_BASE_URL = 'http://localhost:8000/api/painel';
```

---

## ✅ Solução 4: Extensão do Chrome (TEMPORÁRIO)

**Apenas para testes!** Desabilita CORS no navegador.

### **Opção A: Extensão "CORS Unblock"**

1. Instale: [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)
2. Ative a extensão
3. Recarregue a página

### **Opção B: Chrome com CORS desabilitado**

⚠️ **CUIDADO:** Só use para testes!

**Windows:**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome-dev"
```

**Mac:**
```bash
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome-dev" --disable-web-security
```

**Linux:**
```bash
google-chrome --disable-web-security --user-data-dir="/tmp/chrome-dev"
```

---

## 🧪 Como Verificar se CORS foi Resolvido

### **1. Abra o Console (F12)**

### **2. Verifique os Headers da Resposta**

No console, você deve ver:
```
Access-Control-Allow-Origin: https://seu-dominio.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### **3. Tente Fazer Login**

Se CORS estiver configurado corretamente:
- ✅ Não haverá erro de CORS
- ✅ A requisição será completada
- ✅ Você receberá resposta do backend

---

## 📊 Comparação das Soluções

| Solução | Velocidade | Permanente | Produção | Dificuldade |
|---------|-----------|------------|----------|-------------|
| **Login Admin** | ⚡ Imediato | ❌ Não | ❌ Não | ⭐ Fácil |
| **Configurar Backend** | 🕐 5-10 min | ✅ Sim | ✅ Sim | ⭐⭐ Média |
| **Proxy Local** | 🕐 2 min | ❌ Não | ❌ Não | ⭐ Fácil |
| **Extensão Chrome** | ⚡ Imediato | ❌ Não | ❌ Não | ⭐ Fácil |

---

## 🎯 Recomendação

### **Para Testes Rápidos:**
👉 Use **Login Admin** (admin / admin123)

### **Para Desenvolvimento:**
👉 Use **Proxy Local** ou configure **CORS no Backend**

### **Para Produção:**
👉 **Configure CORS no Backend** corretamente com domínios específicos

---

## ❓ Perguntas Frequentes

### **Q: Por que o login admin funciona?**
**A:** Porque ele não faz requisições à API. Os dados são gerados localmente no frontend.

### **Q: É seguro desabilitar CORS?**
**A:** ❌ Não! Só faça isso para testes locais. Nunca em produção.

### **Q: O proxy local é seguro?**
**A:** Apenas para desenvolvimento. Nunca use em produção.

### **Q: Como adicionar múltiplos domínios no CORS?**
**A:** Use array:
```python
allow_origins=[
    "https://dominio1.com",
    "https://dominio2.com",
    "http://localhost:5173"
]
```

### **Q: O que é requisição OPTIONS?**
**A:** É o "preflight" que o navegador faz antes do GET/POST para verificar CORS.

---

## 🆘 Ainda com Problemas?

1. **Verifique o console (F12)**
   - Procure por erros de CORS
   - Copie a mensagem completa

2. **Teste o endpoint com cURL**
   ```bash
   curl -X OPTIONS https://automatixbest-api.automation.app.br/api/painel/login \
     -H "Origin: https://seu-dominio.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -v
   ```

3. **Verifique os headers da resposta**
   - Deve ter `Access-Control-Allow-Origin`
   - Deve ter `Access-Control-Allow-Methods`

4. **Use Login Admin temporariamente**
   - Username: `admin`
   - Senha: `admin123`

---

## 📝 Exemplo de Request CORS

### **Request do Navegador:**
```http
OPTIONS /api/painel/login HTTP/1.1
Host: automatixbest-api.automation.app.br
Origin: https://figma.site
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
```

### **Resposta Esperada do Backend:**
```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://figma.site
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: content-type
Access-Control-Allow-Credentials: true
```

Se o backend NÃO retornar esses headers, o navegador bloqueará a requisição!

---

**Data:** 04/11/2025  
**Status:** ✅ Documento Completo
