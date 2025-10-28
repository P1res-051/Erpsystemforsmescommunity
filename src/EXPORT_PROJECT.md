# 📦 EXPORTAÇÃO COMPLETA DO PROJETO - IPTV Dashboard

## 🎯 Arquivos Essenciais para Exportar

### 📁 Estrutura Mínima Necessária

```
iptv-dashboard/
├── package.json                    # Dependências do projeto
├── vite.config.ts                  # Configuração Vite
├── tsconfig.json                   # Configuração TypeScript
├── index.html                      # HTML principal
├── App.tsx                         # Componente raiz
├── README.md                       # Documentação principal
├── botconversa_proxy.py           # ⚠️ IMPORTANTE: Proxy Python
├── start-proxy.bat                 # Script Windows
├── start-proxy.sh                  # Script Linux/Mac
├── PROXY_SETUP.md                  # Documentação do proxy
│
├── styles/
│   └── globals.css                 # Estilos globais + Tailwind
│
├── utils/
│   └── dataProcessing.ts          # Processamento de dados Excel
│
└── components/
    ├── Dashboard.tsx               # Dashboard principal
    ├── ClientsView.tsx             # ⚠️ CRÍTICO: View de clientes com BotConversa
    ├── FinancialView.tsx          # View financeiro
    ├── ConversionView.tsx         # View conversão
    ├── RetentionView.tsx          # View retenção
    ├── GamesView.tsx              # View jogos
    ├── GeographicView.tsx         # View geografia
    ├── TrafficView.tsx            # View tráfego
    │
    ├── figma/
    │   └── ImageWithFallback.tsx
    │
    └── ui/                         # Componentes Shadcn (todos)
        ├── button.tsx
        ├── card.tsx
        ├── input.tsx
        ├── textarea.tsx
        ├── table.tsx
        ├── badge.tsx
        ├── progress.tsx
        ├── separator.tsx
        └── ... (todos os outros)
```

---

## 🔧 INSTRUÇÕES DE EXPORTAÇÃO

### Opção 1: Via GitHub (Recomendado)

```bash
# 1. Crie um repositório no GitHub
# 2. No terminal, execute:

git init
git add .
git commit -m "Initial commit - IPTV Dashboard completo"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/iptv-dashboard.git
git push -u origin main

# 3. Clone em outro computador:
git clone https://github.com/SEU-USUARIO/iptv-dashboard.git
cd iptv-dashboard
npm install
```

### Opção 2: Download ZIP Manual

1. **Baixe como ZIP** do GitHub
2. **Extraia** para uma pasta
3. **Instale dependências:**
```bash
npm install
```

### Opção 3: Copiar Arquivos Manualmente

**COPIE ESTES ARQUIVOS/PASTAS:**

✅ **Raiz:**
- package.json
- vite.config.ts
- tsconfig.json
- index.html
- App.tsx
- README.md
- botconversa_proxy.py ⚠️
- start-proxy.bat
- start-proxy.sh
- PROXY_SETUP.md

✅ **Pastas completas:**
- components/
- styles/
- utils/
- public/ (se existir)

---

## ⚠️ PROBLEMA IDENTIFICADO - TAGS NÃO APLICADAS

### 🔍 Diagnóstico

Olhando sua imagem do BotConversa, vejo que:
- ✅ TAG "AU0910" existe
- ✅ Contato tem a TAG
- ❌ MAS: Sistema pode estar em **Modo SIMULADO**

### 🛠️ CORREÇÃO NECESSÁRIA

O proxy está em **Modo SIMULADO por padrão**. Para aplicar TAGs reais:

#### Passo 1: Pare o proxy (Ctrl+C)

#### Passo 2: Inicie em Modo REAL

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

#### Passo 3: Verifique no terminal do proxy

Deve mostrar:
```
INFO:     Uvicorn running on http://0.0.0.0:8080
```

E ao testar API-KEY no dashboard:
```
INFO:     127.0.0.1:xxxxx - "POST /bc/test-key HTTP/1.1" 200 OK
```

#### Passo 4: Teste novamente no dashboard

1. Clientes → Cobrança
2. API-KEY → Testar
3. ⚠️ **Deve mostrar:** "API-KEY válida! (Modo: real)"
4. Se mostrar "(Modo: simulated)" → Proxy ainda em modo teste

---

## 🎯 CHECKLIST DE EXPORTAÇÃO

### ✅ Antes de Exportar

- [ ] Todos os arquivos commitados no Git
- [ ] `package.json` atualizado
- [ ] `README.md` com instruções claras
- [ ] Proxy testado em modo REAL
- [ ] Sem dados sensíveis (API-KEYs) no código

### ✅ Após Importar em Novo Ambiente

```bash
# 1. Instalar dependências Node
npm install

# 2. Instalar dependências Python
pip install fastapi uvicorn httpx pydantic python-dotenv

# 3. Iniciar proxy em modo REAL
export REAL_MODE=true  # ou set REAL_MODE=true no Windows
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload

# 4. Em outro terminal, iniciar dashboard
npm run dev

# 5. Testar integração BotConversa
# → http://localhost:5173
# → Clientes → Cobrança
# → Inserir API-KEY real do BotConversa
# → Testar (deve mostrar "Modo: real")
```

---

## 🔥 SOLUÇÃO RÁPIDA - TAGS NÃO FUNCIONAM

### Se as TAGs não estão sendo aplicadas no BotConversa:

#### 1. Verifique Modo do Proxy

No terminal do proxy, deve aparecer:
```
POST /bc/test-key → { "ok": true, "mode": "real" }
```

Se aparecer `"mode": "simulated"`, o proxy está em modo teste!

#### 2. Reinicie o Proxy em Modo REAL

**Windows:**
```cmd
# Pare o proxy (Ctrl+C)
set REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

**Linux/Mac:**
```bash
# Pare o proxy (Ctrl+C)
export REAL_MODE=true
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

#### 3. Verifique no Dashboard

Ao testar API-KEY, deve mostrar:
```
✅ API-KEY válida! (Modo: real)
```

**NÃO deve mostrar:**
```
🧪 Modo SIMULADO ativo
```

#### 4. Envie TAG de Teste

1. Crie TAG "TESTE" no BotConversa manualmente
2. Busque TAG no dashboard
3. Adicione 1 telefone de teste
4. Envie
5. Verifique no BotConversa se a TAG foi aplicada

---

## 📝 ARQUIVO DE COMANDOS RÁPIDOS

Salve este arquivo como `COMANDOS_RAPIDOS.txt`:

```bash
# =========================================
# COMANDOS RÁPIDOS - IPTV Dashboard
# =========================================

# --- INSTALAÇÃO INICIAL ---
npm install
pip install fastapi uvicorn httpx pydantic python-dotenv

# --- EXECUTAR (2 terminais) ---

# Terminal 1: Proxy em modo REAL
export REAL_MODE=true  # Linux/Mac
set REAL_MODE=true     # Windows
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload

# Terminal 2: Dashboard
npm run dev

# --- ACESSAR ---
Dashboard: http://localhost:5173
Proxy Status: http://localhost:8080

# --- TESTAR PROXY ---
curl http://localhost:8080/health

# Deve retornar:
# {"status":"healthy","mode":"real"}

# --- VERIFICAR MODO ---
# Se retornar "mode":"simulated" → Reinicie com REAL_MODE=true

# --- LOGS ---
# Terminal do proxy mostra todas as requisições
# Console do navegador (F12) mostra respostas

# --- PROBLEMAS? ---
# 1. Proxy não inicia → pip install fastapi uvicorn httpx pydantic
# 2. CORS error → Proxy não está rodando
# 3. Tags simuladas → Falta REAL_MODE=true
# 4. Porta ocupada → Use porta 8081 (ajuste código)
```

---

## 🚨 ERRO COMUM: "Diz que deu certo mas não deu"

### Causa Raiz
O proxy está em **MODO SIMULADO** (padrão).

Neste modo:
- ✅ Retorna sucesso
- ✅ Simula criação de TAGs
- ❌ **MAS não faz requisições REAIS à API**

### Sintomas
- Dashboard mostra "✅ TAG aplicada com sucesso"
- Console mostra "Modo: simulated"
- BotConversa NÃO mostra a TAG no contato

### Solução Definitiva

**1. SEMPRE inicie o proxy com:**
```bash
export REAL_MODE=true  # Linux/Mac
set REAL_MODE=true     # Windows
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

**2. Verifique no navegador:**

Ao testar API-KEY, deve aparecer:
```
✅ API-KEY válida! (Modo: real)
```

**3. Logs do proxy devem mostrar:**
```
INFO: Fazendo requisição real para BotConversa API
```

---

## 📦 ARQUIVO ZIP - CONTEÚDO MÍNIMO

Se for exportar como ZIP, inclua:

```
iptv-dashboard.zip
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── App.tsx
├── README.md
├── botconversa_proxy.py        ⚠️ ESSENCIAL
├── start-proxy.bat
├── start-proxy.sh
├── PROXY_SETUP.md
├── COMANDOS_RAPIDOS.txt        ⚠️ CRIAR ESTE
│
├── components/
│   ├── Dashboard.tsx
│   ├── ClientsView.tsx         ⚠️ ESSENCIAL
│   ├── FinancialView.tsx
│   ├── ConversionView.tsx
│   ├── RetentionView.tsx
│   ├── GamesView.tsx
│   ├── GeographicView.tsx
│   ├── TrafficView.tsx
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/                     ⚠️ TODOS os arquivos
│
├── styles/
│   └── globals.css
│
└── utils/
    └── dataProcessing.ts
```

**Tamanho esperado:** ~2-5 MB

---

## 🎬 VÍDEO TUTORIAL (ROTEIRO)

### 1. Instalação (2 min)
```
1. Extrair ZIP
2. npm install
3. pip install fastapi uvicorn httpx pydantic
```

### 2. Executar (1 min)
```
Terminal 1: export REAL_MODE=true && uvicorn botconversa_proxy:app --reload
Terminal 2: npm run dev
```

### 3. Configurar BotConversa (3 min)
```
1. Criar TAG no BotConversa
2. Copiar API-KEY
3. Colar no dashboard
4. Testar (verificar "Modo: real")
```

### 4. Usar (2 min)
```
1. Buscar TAG
2. Importar expirados
3. Enviar TAG
4. Verificar no BotConversa
```

---

## 🆘 SUPORTE

### Se AINDA não funcionar:

1. **Compartilhe os logs do proxy** (terminal 1)
2. **Compartilhe os logs do console** (F12 no navegador)
3. **Confirme:**
   - [ ] Proxy mostra "mode: real"?
   - [ ] TAG existe no BotConversa?
   - [ ] API-KEY está correta?
   - [ ] Telefone está no formato correto (55...)

### Comandos de Debug

```bash
# Ver variável de ambiente
echo $REAL_MODE  # Linux/Mac
echo %REAL_MODE%  # Windows

# Deve retornar: true

# Testar proxy diretamente
curl -X POST http://localhost:8080/bc/test-key \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"SUA-API-KEY-AQUI"}'

# Deve retornar: {"ok":true,"mode":"real"}
```

---

## ✅ CHECKLIST FINAL

Antes de considerar "funcionando":

- [ ] Proxy em modo REAL (não simulated)
- [ ] Dashboard mostra "Modo: real" ao testar
- [ ] TAG criada manualmente no BotConversa
- [ ] TAG encontrada via "Buscar TAG"
- [ ] Envio de 1 telefone de teste
- [ ] TAG aparece no BotConversa no contato
- [ ] Logs do proxy mostram requisições reais

---

## 📧 EXPORTAÇÃO VIA EMAIL/DRIVE

### Criar pacote para envio:

```bash
# 1. Criar arquivo com arquivos essenciais
tar -czf iptv-dashboard.tar.gz \
  package.json \
  vite.config.ts \
  tsconfig.json \
  index.html \
  App.tsx \
  README.md \
  botconversa_proxy.py \
  start-proxy.* \
  PROXY_SETUP.md \
  components/ \
  styles/ \
  utils/

# 2. Enviar via email/drive
```

**Ou no Windows:**
- Selecione arquivos/pastas listados acima
- Clique direito → Enviar para → Pasta compactada
- Nomeie: `iptv-dashboard.zip`

---

## 🎯 RESUMO EXECUTIVO

**Para exportar e usar em outro lugar:**

1. ✅ Copie TODOS os arquivos (ou clone do Git)
2. ✅ `npm install`
3. ✅ `pip install fastapi uvicorn httpx pydantic`
4. ⚠️ **IMPORTANTE:** `export REAL_MODE=true`
5. ✅ `uvicorn botconversa_proxy:app --reload`
6. ✅ `npm run dev` (outro terminal)
7. ✅ Teste com TAG real do BotConversa

**Modo SIMULADO vs REAL:**
- 🧪 SIMULADO: Testa sem API (padrão)
- 🔥 REAL: Envia de verdade (precisa REAL_MODE=true)

---

**🚀 Pronto! Projeto completo e funcional!**
