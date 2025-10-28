# 🔧 Configuração do Proxy BotConversa

## ❓ Por que preciso do proxy?

O navegador bloqueia requisições diretas para a API do BotConversa devido à política CORS (Cross-Origin Resource Sharing). O proxy backend resolve isso intermediando as requisições.

## 📋 Pré-requisitos

- Python 3.9 ou superior instalado
- Terminal/Prompt de Comando

## 🚀 Instalação e Execução

### 1. Instalar dependências (uma única vez)

Abra um terminal na pasta do projeto e execute:

```bash
pip install fastapi uvicorn httpx pydantic python-dotenv
```

### 2. Iniciar o proxy

#### Windows:
```cmd
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

#### Linux/Mac:
```bash
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

### 3. Verificar se está rodando

Você verá uma mensagem como:

```
INFO:     Uvicorn running on http://0.0.0.0:8080 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Acesse no navegador: http://localhost:8080

Você deve ver:
```json
{
  "status": "ok",
  "mode": "simulated",
  "message": "BotConversa Proxy ativo. Use POST /bc/* endpoints"
}
```

## 🎮 Modos de Operação

### Modo SIMULADO (padrão)

Não faz requisições reais à API do BotConversa. Ideal para testar o fluxo.

```bash
# Já está ativo por padrão
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

### Modo REAL

Faz requisições reais à API do BotConversa.

#### Windows:
```cmd
set REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

#### Linux/Mac:
```bash
export REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

## 🔌 Endpoints Disponíveis

| Endpoint | Descrição |
|----------|-----------|
| `POST /bc/test-key` | Valida API-KEY |
| `POST /bc/find-tag-by-name` | Busca TAG pelo nome |
| `POST /bc/upsert-subscriber` | Cria ou busca subscriber |
| `POST /bc/attach-tag` | Anexa TAG a subscriber |
| `POST /bc/bulk-attach-tag` | Aplica TAG em massa |
| `GET /` | Status do proxy |
| `GET /health` | Health check |

## 📝 Uso no Dashboard

1. **Inicie o proxy** (veja passo 2 acima)
2. **Abra o dashboard** no navegador
3. **Vá para:** Clientes → Cobrança
4. **Insira sua API-KEY** do BotConversa
5. **Clique em "Testar"**

Se aparecer:
- ✅ "API-KEY aceita! Modo SIMULADO ativo" → Funcionando!
- ❌ "Proxy não está rodando!" → Volte ao passo 1

## 🛠️ Solução de Problemas

### Erro: "Proxy não está rodando"

**Causa:** O proxy não foi iniciado ou parou.

**Solução:**
```bash
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

### Erro: "Address already in use"

**Causa:** A porta 8080 já está em uso.

**Solução:** Use outra porta:
```bash
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8081 --reload
```

E atualize o código em `ClientsView.tsx`:
```typescript
const proxyUrl = 'http://localhost:8081'; // Mudou de 8080 para 8081
```

### Erro: "Module not found: fastapi"

**Causa:** Dependências não instaladas.

**Solução:**
```bash
pip install fastapi uvicorn httpx pydantic python-dotenv
```

### Modo REAL não funciona

**Causa:** Variável de ambiente não foi definida.

**Solução:**

Windows:
```cmd
set REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

Linux/Mac:
```bash
export REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

## 🎯 Fluxo Completo de Uso

```
1. Terminal 1:
   $ uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
   ✅ Proxy rodando

2. Terminal 2 (ou nova aba):
   $ npm run dev
   ✅ Dashboard rodando

3. Navegador:
   → http://localhost:5173
   → Clientes → Cobrança
   → Inserir API-KEY → Testar
   → ✅ Funcionando!
```

## 📊 Logs e Debug

O proxy mostra logs detalhados no terminal:

```
INFO:     127.0.0.1:54321 - "POST /bc/test-key HTTP/1.1" 200 OK
INFO:     127.0.0.1:54322 - "POST /bc/find-tag-by-name HTTP/1.1" 200 OK
INFO:     127.0.0.1:54323 - "POST /bc/upsert-subscriber HTTP/1.1" 200 OK
INFO:     127.0.0.1:54324 - "POST /bc/attach-tag HTTP/1.1" 200 OK
```

## 🔒 Segurança

- ✅ CORS habilitado para todas as origens (apenas para desenvolvimento)
- ✅ API-KEY enviada via body (não via URL)
- ✅ Timeout de 30 segundos
- ✅ Retry automático com backoff
- ⚠️  **NÃO exponha este proxy publicamente sem autenticação!**

## 💡 Dicas

1. **Deixe o proxy rodando** enquanto usa o dashboard
2. **Use Modo SIMULADO** para testar o fluxo sem gastar API
3. **Use Modo REAL** apenas quando tiver certeza
4. **Monitore os logs** para debug
5. **Ctrl+C** para parar o proxy

## 📚 Referências

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Uvicorn Docs](https://www.uvicorn.org/)
- [BotConversa API](https://backend.botconversa.com.br/swagger/)

---

**🎉 Pronto! Agora você pode usar o dashboard sem erros de CORS!**
