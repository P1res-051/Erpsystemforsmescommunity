# 🔄 Fluxo Correto da API Real - AutonomyX Dashboard

## 📡 Endpoints Disponíveis

### Base URL
```
https://automatixbest-api.automation.app.br/api/painel
```

### 1️⃣ Login
```http
POST /api/painel/login
Content-Type: application/json

{
  "username": "seu_usuario",
  "password": "sua_senha"
}

Response:
{
  "cache_key": "panel:data:usuarioX"
}
```

### 2️⃣ Atualizar Cache (Executar Todos os Processamentos)
```http
POST /api/painel/execute-all?cache_key=panel:data:usuarioX

Response: 200 OK
```
**⚠️ IMPORTANTE:** Sempre execute isso ANTES de buscar dados, senão pega cache antigo!

### 3️⃣ Buscar Dados

#### Renovações
```http
GET /api/painel/get-renewals?cache_key=panel:data:usuarioX

Response: Array<{
  Data: "2024-10-02 09:00:00",
  Usuario: "5511999999999",
  Custo: 30,
  ...
}>
```

#### Conversões
```http
GET /api/painel/get-conversions?cache_key=panel:data:usuarioX

Response: Array<{
  Data: "2024-10-02 09:00:00",
  Usuario: "5511999999999",
  Custo: 30,
  ...
}>
```

#### Clientes Expirados
```http
GET /api/painel/get-clients-expired?cache_key=panel:data:usuarioX

Response: Array<{
  Expira_Em: "2024-10-02 09:00:00",
  Usuario: "5511999999999",
  ...
}>
```

#### Clientes Ativos
```http
GET /api/painel/get-clients-active?cache_key=panel:data:usuarioX
```

#### Testes
```http
GET /api/painel/get-tests?cache_key=panel:data:usuarioX
```

---

## 🔧 Formato Real da API: Datas Brasileiras

### ✅ Formato da API (REAL)
```javascript
"03/11/2025 18:16"  // ✅ Formato brasileiro DD/MM/YYYY HH:mm
"03/11/2025 21:05"
"02/12/2025 23:20"
```

### ❌ Problema
```javascript
new Date("03/11/2025 18:16")  // ❌ Invalid Date em alguns browsers
```

### ✅ Solução: Parse Manual com Regex
```javascript
// Regex: DD/MM/YYYY HH:mm
const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
const [, d, m, y, h = '12', mi = '0', s = '0'] = match;
const date = new Date(+y, +m - 1, +d, +h, +mi, +s);
```

---

## 📝 Função de Parse Segura (FORMATO BRASILEIRO)

```typescript
/**
 * Parse seguro de datas da API (formato brasileiro DD/MM/YYYY HH:mm)
 * Converte "03/11/2025 18:16" → Date
 */
function parseApiDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  
  // Formato brasileiro: DD/MM/YYYY HH:mm ou DD/MM/YYYY HH:mm:ss
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const [, d, m, y, h = '12', mi = '0', s = '0'] = match;
    const date = new Date(+y, +m - 1, +d, +h, +mi, +s);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Fallback: tentar parse direto
  const date = new Date(str);
  if (!isNaN(date.getTime())) return date;
  
  return null;
}
```

**Uso:**
```typescript
const dataStr = "03/11/2025 18:16"; // Da API (formato brasileiro)
const dataObj = parseApiDate(dataStr); // ✅ Date válido

if (dataObj) {
  console.log(dataObj.toLocaleDateString('pt-BR')); // "03/11/2025"
  console.log(dataObj.getHours());                   // 18
  console.log(dataObj.getMinutes());                 // 16
}
```

---

## 🔄 Fluxo Completo de Uso

### 1. Login
```typescript
const cacheKey = await login('usuario', 'senha');
localStorage.setItem('cache_key', cacheKey);
```

### 2. Atualizar e Buscar Dados
```typescript
// Atualizar cache
await executeAll(cacheKey);

// Buscar dados em paralelo
const [renovacoes, conversoes, expirados] = await Promise.all([
  getRenewals(cacheKey),
  getConversions(cacheKey),
  getClientsExpired(cacheKey)
]);
```

### 3. Processar Dados por Data
```typescript
// Agrupar renovações por data
const renovacoesPorData: Record<string, number> = {};

for (const item of renovacoes) {
  const dt = parseApiDate(item.Data);
  if (!dt) continue; // Pular datas inválidas
  
  dt.setHours(0, 0, 0, 0); // Normalizar para meia-noite
  const dateKey = dt.toISOString().split('T')[0]; // "2024-10-02"
  
  renovacoesPorData[dateKey] = (renovacoesPorData[dateKey] || 0) + 1;
}
```

---

## 📊 Exemplo Prático: Contar Renovações de Ontem

```typescript
async function contarRenovacoesOntem(cacheKey: string): Promise<number> {
  // 1. Buscar lista da API
  const lista = await getRenewals(cacheKey);
  
  // 2. Calcular data de ontem
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  const y = ontem.getFullYear();
  const m = ontem.getMonth();
  const d = ontem.getDate();
  
  // 3. Contar renovações de ontem
  let count = 0;
  for (const item of lista) {
    const dt = parseApiDate(item.Data);
    if (!dt) continue;
    
    // Verificar se é mesmo dia
    if (dt.getFullYear() === y && 
        dt.getMonth() === m && 
        dt.getDate() === d) {
      count++;
    }
  }
  
  return count;
}
```

**Uso:**
```typescript
const cacheKey = localStorage.getItem('cache_key');
const renovacoesOntem = await contarRenovacoesOntem(cacheKey);

console.log(`Ontem teve ${renovacoesOntem} renovações`); // "Ontem teve 12 renovações"
```

---

## 🗓️ Exemplo: Calendário dos Últimos 30 Dias

```typescript
async function gerarCalendario(cacheKey: string) {
  // 1. Buscar todos os dados
  await executeAll(cacheKey);
  const [renovacoes, conversoes, expirados] = await Promise.all([
    getRenewals(cacheKey),
    getConversions(cacheKey),
    getClientsExpired(cacheKey)
  ]);
  
  // 2. Agrupar por data
  const dadosPorData: Record<string, {
    renovacoes: number;
    conversoes: number;
    expirados: number;
  }> = {};
  
  // Processar renovações
  for (const item of renovacoes) {
    const dt = parseApiDate(item.Data);
    if (!dt) continue;
    
    dt.setHours(0, 0, 0, 0);
    const dateKey = dt.toISOString().split('T')[0];
    
    if (!dadosPorData[dateKey]) {
      dadosPorData[dateKey] = { renovacoes: 0, conversoes: 0, expirados: 0 };
    }
    dadosPorData[dateKey].renovacoes++;
  }
  
  // Processar conversões
  for (const item of conversoes) {
    const dt = parseApiDate(item.Data);
    if (!dt) continue;
    
    dt.setHours(0, 0, 0, 0);
    const dateKey = dt.toISOString().split('T')[0];
    
    if (!dadosPorData[dateKey]) {
      dadosPorData[dateKey] = { renovacoes: 0, conversoes: 0, expirados: 0 };
    }
    dadosPorData[dateKey].conversoes++;
  }
  
  // Processar expirados
  for (const item of expirados) {
    const dt = parseApiDate(item.Expira_Em);
    if (!dt) continue;
    
    dt.setHours(0, 0, 0, 0);
    const dateKey = dt.toISOString().split('T')[0];
    
    if (!dadosPorData[dateKey]) {
      dadosPorData[dateKey] = { renovacoes: 0, conversoes: 0, expirados: 0 };
    }
    dadosPorData[dateKey].expirados++;
  }
  
  // 3. Gerar calendário dos últimos 30 dias
  const calendario = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    
    calendario.push({
      data: dateKey,
      dia: date.getDate(),
      mes: date.getMonth() + 1,
      ano: date.getFullYear(),
      renovacoes: dadosPorData[dateKey]?.renovacoes || 0,
      conversoes: dadosPorData[dateKey]?.conversoes || 0,
      expirados: dadosPorData[dateKey]?.expirados || 0,
    });
  }
  
  return calendario;
}
```

**Uso:**
```typescript
const cacheKey = localStorage.getItem('cache_key');
const calendario = await gerarCalendario(cacheKey);

calendario.forEach(dia => {
  console.log(`${dia.dia}/${dia.mes}: ${dia.renovacoes} renovações, ${dia.conversoes} conversões`);
});
```

**Output:**
```
01/10: 12 renovações, 5 conversões
02/10: 8 renovações, 3 conversões
03/10: 15 renovações, 7 conversões
...
```

---

## ⚠️ Pontos de Atenção

### 1. Sempre atualizar cache antes de ler
```typescript
// ❌ ERRADO
const dados = await getRenewals(cacheKey); // Pode estar desatualizado

// ✅ CORRETO
await executeAll(cacheKey); // Atualiza primeiro
const dados = await getRenewals(cacheKey); // Agora está fresco
```

### 2. Sempre normalizar data para "T"
```typescript
// ❌ ERRADO
const dt = new Date("2024-10-02 09:00:00"); // Pode dar erro

// ✅ CORRETO
const dt = parseApiDate("2024-10-02 09:00:00"); // Normaliza e valida
```

### 3. Sempre validar data antes de usar
```typescript
// ❌ ERRADO
const dateKey = dt.toISOString().split('T')[0]; // Se dt for null, erro!

// ✅ CORRETO
const dt = parseApiDate(item.Data);
if (!dt) continue; // Pular se inválida
const dateKey = dt.toISOString().split('T')[0]; // Seguro
```

### 4. Sempre usar setHours(0,0,0,0) para comparar dias
```typescript
// ❌ ERRADO
if (dt1 === dt2) // Compara hora também!

// ✅ CORRETO
dt1.setHours(0, 0, 0, 0);
dt2.setHours(0, 0, 0, 0);
if (dt1.getTime() === dt2.getTime()) // Compara só o dia
```

---

## 📦 Serviço Completo (apiService.ts)

Criado em `/utils/apiService.ts` com todas as funções prontas:

```typescript
import { 
  login, 
  executeAll, 
  getRenewals, 
  getConversions, 
  getClientsExpired,
  contarRenovacoesDia,
  contarConversoesDia,
  contarExpiradosDia,
  agruparTodosDadosPorData,
  agruparPerdasPorData,
  parseApiDate
} from '@/utils/apiService';
```

### Uso Simplificado:
```typescript
// Login
const cacheKey = await login('usuario', 'senha');

// Buscar dados de hoje
const hoje = await getDadosHoje(cacheKey);
console.log(hoje); // { renovacoes: 12, conversoes: 5, expirados: 3 }

// Buscar dados de ontem
const ontem = await getDadosOntem(cacheKey);

// Buscar calendário completo
const { dadosPorData, perdasPorData } = await atualizarEBuscarDados(cacheKey);
```

---

## ✅ Validação

Para verificar se está funcionando:

1. **Teste o parse de data:**
```typescript
const teste = parseApiDate("2024-10-02 09:00:00");
console.log(teste); // Deve ser um Date válido
```

2. **Teste a contagem:**
```typescript
const cacheKey = 'panel:data:seuUsuario';
await executeAll(cacheKey);
const renovacoes = await contarRenovacoesOntem(cacheKey);
console.log(`Ontem: ${renovacoes} renovações`);
```

3. **Verifique no Excel:**
- Abra a aba "Renovações"
- Filtre pela data de ontem
- Conte as linhas
- **Deve bater** com o número do dashboard!

---

## 🎯 Resumo

1. ✅ Sempre use `parseApiDate()` para converter datas da API
2. ✅ Sempre execute `executeAll()` antes de buscar dados
3. ✅ Sempre valide se a data é válida com `if (!dt) continue;`
4. ✅ Use `.setHours(0,0,0,0)` para normalizar dias
5. ✅ Use `.toISOString().split('T')[0]` para chave de data

**Resultado:** Dashboard com dados 100% reais e precisos! 🎯
