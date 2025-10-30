# 🎯 GUIA DEFINITIVO - IPTV Dashboard + BotConversa

## ⚡ INÍCIO RÁPIDO (3 minutos)

### 1️⃣ Instalar Dependências (primeira vez apenas)

```bash
# Dependências Node
npm install

# Dependências Python
pip install fastapi uvicorn httpx pydantic python-dotenv
```

### 2️⃣ Iniciar Proxy em MODO REAL

**Escolha uma opção:**

#### Opção A: Script Automático (Recomendado)

**Windows:**
```cmd
start-real.bat
```

**Linux/Mac:**
```bash
chmod +x start-real.sh
./start-real.sh
```

#### Opção B: Manual

**Windows:**
```cmd
set REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

**Linux/Mac:**
```bash
export REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

### 3️⃣ Verificar Proxy

```bash
curl http://localhost:8080/health
```

**Deve retornar:**
```json
{"status":"healthy","mode":"real"}
```

✅ Se aparecer `"mode":"real"` → **Perfeito!**  
❌ Se aparecer `"mode":"simulated"` → **Erro! Volte ao passo 2**

### 4️⃣ Iniciar Dashboard (outro terminal)

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## 🎮 USAR O SISTEMA

### Passo 1: Configurar BotConversa

1. Acesse: https://backend.botconversa.com.br
2. **Copiar API-KEY:**
   - Configurações → Webhooks → Copiar API-KEY

3. **Criar TAG:**
   - Configurações → Etiquetas → Nova Etiqueta
   - Nome: `COBRAR_JAN2025` (exemplo)
   - Salvar

### Passo 2: Configurar Dashboard

1. Dashboard → **Clientes** → **Cobrança**
2. **API-KEY:**
   - Colar API-KEY copiada
   - Clicar **"Testar"**
   - ✅ Deve mostrar: **"API-KEY válida! (Modo: real)"**

### Passo 3: Buscar TAG

1. **Campo TAG:** Digite `COBRAR_JAN2025`
2. Clicar: **🔍 Buscar TAG**
3. ✅ Deve mostrar: **"TAG encontrada: COBRAR_JAN2025 (ID: XXX)"**

### Passo 4: Importar Contatos

**Opção A: Importar Expirados Automaticamente**
1. Selecionar período: **"Últimos 30 dias"**
2. Clicar: **"Importar Expirados"**
3. ✅ Lista preenchida automaticamente

**Opção B: Colar Lista Manualmente**
1. Colar telefones (um por linha)
2. Formato: `5511999999999`

### Passo 5: Validar e Enviar

1. Clicar: **"Validar Números"**
2. Marcar checkboxes dos contatos desejados
3. Clicar: **"Enviar TAG"**
4. ✅ Aguardar barra de progresso

### Passo 6: Verificar no BotConversa

1. BotConversa → **Audiência**
2. Buscar por telefone ou filtrar por TAG
3. ✅ TAG deve estar aplicada nos contatos

---

## 🔥 VERIFICAÇÕES ESSENCIAIS

### ✅ Antes de Enviar TAGs

Execute este checklist:

```bash
# 1. Proxy rodando?
curl http://localhost:8080
# Deve conectar (não dar erro)

# 2. Modo REAL?
curl http://localhost:8080/health
# Deve retornar: {"mode":"real"}

# 3. Dashboard acessível?
curl http://localhost:5173
# Deve retornar HTML
```

### ✅ No Dashboard

- [ ] API-KEY testada mostra: **(Modo: real)**
- [ ] TAG encontrada (mostra ID)
- [ ] Telefones validados (verde)
- [ ] Contatos selecionados (checkbox)

### ❌ Sinais de Problema

Se aparecer:
- ❌ `"mode":"simulated"` → Proxy em modo teste
- ❌ `Failed to fetch` → Proxy não está rodando
- ❌ `TAG não encontrada` → TAG não existe no BotConversa
- ❌ `Telefone inválido` → Formato errado (falta 55)

---

## 📊 LOGS E DEBUG

### Terminal do Proxy (deve mostrar):

```
INFO:     Uvicorn running on http://0.0.0.0:8080
INFO:     127.0.0.1:xxxxx - "POST /bc/test-key HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "POST /bc/find-tag-by-name HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "POST /bc/upsert-subscriber HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "POST /bc/attach-tag HTTP/1.1" 200 OK
```

### Console do Navegador (F12):

```javascript
🔑 Testando API-KEY via Proxy...
✅ API-KEY válida! (Modo: real)

🔍 Buscando TAG "COBRAR_JAN2025" via proxy...
✅ TAG encontrada: { id: 123, name: "COBRAR_JAN2025" }

📞 [1/10] Processando: 5511999999999
✅ Subscriber: ID 456 (Modo: real)
✅ TAG associada! (Modo: real)
```

**Se aparecer `simulated` em QUALQUER lugar → Proxy em modo errado!**

---

## 🛠️ SOLUÇÃO DE PROBLEMAS

### Problema 1: "Proxy não está rodando"

**Sintoma:**
```
❌ Proxy não está rodando!
```

**Solução:**
```bash
# Abra um terminal e execute:
export REAL_MODE=true  # ou set REAL_MODE=true (Windows)
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

---

### Problema 2: "TAGs não aparecem no BotConversa"

**Sintoma:**
- Dashboard mostra sucesso
- BotConversa não mostra TAG

**Causa:** Proxy em modo SIMULADO

**Solução:**
```bash
# 1. Pare o proxy (Ctrl+C)

# 2. Reinicie em modo REAL:
export REAL_MODE=true  # Linux/Mac
set REAL_MODE=true     # Windows
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload

# 3. Verifique:
curl http://localhost:8080/health
# Deve retornar: {"mode":"real"}
```

---

### Problema 3: "Modo: simulated" no dashboard

**Sintoma:**
```
✅ API-KEY aceita!
🧪 Modo SIMULADO ativo
```

**Solução:** Mesmo que Problema 2

---

### Problema 4: "TAG não encontrada"

**Sintoma:**
```
❌ TAG "COBRAR_JAN2025" não encontrada
```

**Solução:**
1. Acesse BotConversa
2. Configurações → Etiquetas
3. Verifique se TAG existe
4. Se não: Crie com o nome EXATO
5. Volte ao dashboard e busque novamente

---

### Problema 5: "Telefone inválido"

**Sintoma:**
```
❌ Telefone inválido
```

**Formato correto:**
```
5511999999999
55 + DDD + Número
```

**Formato errado:**
```
11999999999   (falta 55)
+5511999999999 (não pode ter +)
(11) 99999-9999 (não pode ter formatação)
```

---

## 📁 EXPORTAR PROJETO

### Para outro computador:

1. **Compactar projeto:**
```bash
# Criar ZIP com arquivos essenciais
zip -r iptv-dashboard.zip \
  package.json \
  vite.config.ts \
  tsconfig.json \
  index.html \
  App.tsx \
  botconversa_proxy.py \
  start-real.* \
  components/ \
  styles/ \
  utils/
```

2. **No novo computador:**
```bash
# Extrair
unzip iptv-dashboard.zip
cd iptv-dashboard

# Instalar
npm install
pip install fastapi uvicorn httpx pydantic

# Executar
./start-real.sh  # ou start-real.bat (Windows)
```

---

## 🎯 CASOS DE USO

### Caso 1: Cobrar Vencidos Recentes

```
1. Criar TAG: "COBRAR_DEZ2024"
2. Importar: "Últimos 7 dias"
3. Enviar TAG
4. Criar campanha no BotConversa para TAG
```

### Caso 2: Reengajar Antigos

```
1. Criar TAG: "REATIVAR_3MESES"
2. Importar: "Últimos 90 dias"
3. Enviar TAG
4. Campanha de reativação
```

### Caso 3: VIPs

```
1. Criar TAG: "VIP_FIDELIDADE"
2. Lista manual de clientes VIP
3. Enviar TAG
4. Campanha de benefícios
```

---

## 📊 MÉTRICAS

Após enviar TAGs, você pode:

1. **Criar Campanhas** no BotConversa
2. **Segmentar Audiência** por TAG
3. **Automatizar Mensagens** para TAG específica
4. **Medir Conversão** por campanha

---

## 🔒 SEGURANÇA

✅ **Boas Práticas:**
- Não compartilhe API-KEY
- Use modo SIMULADO para testar
- Valide telefones antes de enviar
- Teste com 1-2 contatos primeiro

❌ **NÃO faça:**
- Expor proxy na internet sem autenticação
- Enviar para lista não validada
- Compartilhar logs com API-KEY

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **Instalação:** [README.md](README.md)
- **Proxy:** [PROXY_SETUP.md](PROXY_SETUP.md)
- **Exportação:** [EXPORT_PROJECT.md](EXPORT_PROJECT.md)
- **Solução de Problemas:** [SOLUCAO_TAGS_NAO_FUNCIONAM.md](SOLUCAO_TAGS_NAO_FUNCIONAM.md)

---

## 🆘 SUPORTE RÁPIDO

### Comandos de Diagnóstico:

```bash
# 1. Testar proxy
curl http://localhost:8080/health

# 2. Verificar modo
# Deve retornar: {"mode":"real"}

# 3. Testar API-KEY (substitua XXX)
curl -X POST http://localhost:8080/bc/test-key \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"SUA-API-KEY-AQUI"}'

# Deve retornar: {"ok":true,"mode":"real"}
```

### Scripts de Verificação:

**Windows:**
```cmd
check-proxy-mode.bat
```

**Linux/Mac:**
```bash
./check-proxy-mode.sh
```

---

## ✅ CHECKLIST FINAL

Antes de usar em produção:

- [ ] Proxy em modo REAL (verificado)
- [ ] Dashboard mostra "Modo: real"
- [ ] TAG criada no BotConversa
- [ ] TAG encontrada no dashboard
- [ ] Teste com 1 contato funcionou
- [ ] TAG apareceu no BotConversa

**Se TODOS os checkboxes ✅ → Sistema funcionando!**

---

## 🎉 RESULTADO ESPERADO

**Ao enviar TAGs corretamente:**

1. ✅ Dashboard: Progresso 100%
2. ✅ Console: Logs com "(Modo: real)"
3. ✅ Proxy: Requisições POST nos logs
4. ✅ BotConversa: TAGs aplicadas nos contatos
5. ✅ Campanhas: Prontas para envio

---

## 📞 FLUXO COMPLETO EM 1 MINUTO

```bash
# Terminal 1: Proxy REAL
export REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload

# Terminal 2: Dashboard
npm run dev

# Navegador:
# 1. http://localhost:5173
# 2. Clientes → Cobrança
# 3. API-KEY → Testar
# 4. TAG → Buscar
# 5. Importar Expirados
# 6. Enviar TAG
# 7. ✅ Verificar BotConversa
```

---

**🚀 Sistema pronto para uso em produção!**

**💡 Dica:** Sempre verifique `{"mode":"real"}` antes de enviar TAGs!
