# 🔧 Troubleshooting - Erro de Login

## ❌ Erro: "Credenciais inválidas. Verifique seu nome de revenda e senha."

### 🔍 Possíveis Causas

1. **Backend Offline ou Inacessível**
   - O servidor da API não está respondendo
   - URL incorreta: `https://automatixbest-api.automation.app.br/api/painel/login`

2. **Credenciais Incorretas**
   - Nome de revenda digitado errado
   - Senha incorreta
   - Conta não existe no backend

3. **Problemas de CORS**
   - Backend não permite requisições do frontend
   - Headers incorretos

4. **Formato de Resposta Incorreto**
   - Backend não retorna `cache_key` e `phpsessid`
   - JSON malformado

---

## ✅ Correções Aplicadas

### 1. **Console Logs Detalhados**
```typescript
console.log('🔐 Tentando fazer login...');
console.log('📧 Username:', nomeRevenda);
console.log('🌐 Chamando API de login real...');
console.log('📡 Status da resposta:', response.status);
console.log('📄 Resposta bruta:', textResponse);
console.log('✅ JSON parseado:', data);
console.log('📦 Dados recebidos:', { phpsessid, cache_key, resellerid });
```

### 2. **Timeout de 15 segundos**
Evita que o login fique travado indefinidamente:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 15000);
```

### 3. **Mensagens de Erro Específicas**
```typescript
// Timeout
⏱️ Timeout: O servidor demorou muito para responder. Tente novamente.

// Sem conexão
❌ Não foi possível conectar ao servidor. Verifique sua conexão de internet.

// Resposta inválida
❌ Servidor retornou resposta inválida. Entre em contato com o suporte.

// Cache key ausente
Cache key não retornado pela API. Verifique o backend.

// PHPSESSID ausente
PHPSESSID não retornado pela API. Verifique o backend.
```

### 4. **Validação Robusta**
```typescript
// 1. Verifica status HTTP
if (!response.ok) {
  throw new Error(errorMsg);
}

// 2. Verifica flag de sucesso
if (data.success === false || data.error) {
  throw new Error(errorMsg);
}

// 3. Verifica campos obrigatórios
if (!cache_key) {
  throw new Error('Cache key não retornado');
}

if (!phpsessid) {
  throw new Error('PHPSESSID não retornado');
}
```

---

## 🧪 Como Debugar

### **1. Abrir Console do Navegador (F12)**
Pressione `F12` → Aba "Console"

### **2. Tentar Fazer Login**
Digite suas credenciais e clique em "Entrar"

### **3. Observar os Logs**
Você verá algo como:
```
🔐 Tentando fazer login...
📧 Username: gabrielpires
🌐 Chamando API de login real...
📡 Status da resposta: 200 OK
📄 Resposta bruta: {"success":true,"cache_key":"panel:data:gabrielpires",...}
✅ JSON parseado: {success: true, cache_key: "...", ...}
📦 Dados recebidos: {phpsessid: "***", cache_key: "panel:data:...", resellerid: "123"}
✅ Login bem-sucedido!
```

### **4. Identificar o Problema**

#### **Cenário A: Erro de Rede**
```
❌ Não foi possível conectar ao servidor
```
**Solução:** Verifique sua conexão de internet ou se o backend está online.

#### **Cenário B: Timeout**
```
⏱️ Timeout: O servidor demorou muito para responder
```
**Solução:** O backend está lento. Tente novamente ou aumente o timeout.

#### **Cenário C: Status 401/403**
```
📡 Status da resposta: 401 Unauthorized
❌ API retornou erro: Credenciais inválidas
```
**Solução:** Verifique se o nome de revenda e senha estão corretos.

#### **Cenário D: Cache Key Ausente**
```
📦 Dados recebidos: {phpsessid: "***", cache_key: "AUSENTE", resellerid: "123"}
❌ Cache key ausente
```
**Solução:** O backend não está retornando o `cache_key`. Verifique o código do backend.

#### **Cenário E: JSON Inválido**
```
📄 Resposta bruta: <html>Error 500</html>
❌ Erro ao parsear JSON
```
**Solução:** O backend está retornando HTML ao invés de JSON. Erro no servidor.

---

## 🔑 Login Admin (Desenvolvimento)

Para testar sem backend:
- **Username:** `admin`
- **Senha:** `admin123`

Isso cria um token fake e permite acessar o dashboard.

---

## 🛠️ Verificar Endpoint da API

### **Testar com cURL**
```bash
curl -X POST https://automatixbest-api.automation.app.br/api/painel/login \
  -H "Content-Type: application/json" \
  -d '{"username":"SEU_USUARIO","password":"SUA_SENHA"}'
```

### **Resposta Esperada**
```json
{
  "success": true,
  "phpsessid": "abc123def456",
  "cache_key": "panel:data:gabrielpires",
  "resellerid": "123"
}
```

### **Resposta de Erro**
```json
{
  "success": false,
  "error": "Credenciais inválidas"
}
```

---

## 📝 Checklist de Verificação

- [ ] Backend está online em `https://automatixbest-api.automation.app.br`
- [ ] Endpoint `/api/painel/login` existe
- [ ] Backend retorna JSON válido
- [ ] Backend retorna `cache_key` e `phpsessid`
- [ ] CORS configurado corretamente no backend
- [ ] Credenciais estão corretas
- [ ] Console não mostra erros de rede (Failed to fetch)

---

## 🆘 Suporte

Se o problema persistir:

1. **Copie os logs do console** (F12 → Console → Botão direito → "Save as...")
2. **Tire screenshot da mensagem de erro**
3. **Envie para o suporte com:**
   - Username que está tentando usar
   - Horário do erro
   - Logs do console
   - Screenshot

---

## 📊 Status das Correções

- [x] Console logs detalhados implementados
- [x] Timeout de 15s adicionado
- [x] Mensagens de erro específicas
- [x] Validação robusta de resposta
- [x] Tratamento de erros de rede
- [x] Parsing seguro de JSON
- [x] Verificação de campos obrigatórios

**Data:** 04/11/2025  
**Status:** ✅ COMPLETO
