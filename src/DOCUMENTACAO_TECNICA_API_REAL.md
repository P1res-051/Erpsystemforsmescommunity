# 📘 Documentação Técnica API Real - Backend AutonomyX
## Dashboard Analytics IPTV

**Versão:** 1.0.0  
**Data:** 03 de Novembro de 2024  
**Ambiente:** Produção  
**API Base URL:** `https://automatixbest-api.automation.app.br`  
**Tecnologia Frontend:** React + TypeScript + Tailwind CSS  
**Backend:** Node.js + Redis Cache

---

## 📋 Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Fluxo de Autenticação e Dados](#2-fluxo-de-autenticação-e-dados)
3. [Endpoints da API Real](#3-endpoints-da-api-real)
4. [Estruturas de Dados](#4-estruturas-de-dados)
5. [Cálculos e Métricas](#5-cálculos-e-métricas)
6. [Integração com Jogos](#6-integração-com-jogos)
7. [Sistema de Cache Redis](#7-sistema-de-cache-redis)
8. [Exemplos Práticos](#8-exemplos-práticos)

---

## 1. Visão Geral do Sistema

### 1.1 Arquitetura Real

```
┌─────────────────────┐
│  Frontend Dashboard │
│  (React + Tailwind) │
└──────────┬──────────┘
           │
           │ HTTPS REST
           │
┌──────────▼────────────────────────────────┐
│  API Backend                              │
│  automatixbest-api.automation.app.br     │
│                                            │
│  ┌──────────────┐    ┌─────────────────┐ │
│  │ Autenticação │    │  Redis Cache    │ │
│  │  (PHPSESSID) │◄──►│  (cache_key)    │ │
│  └──────────────┘    └─────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Módulos:                            │ │
│  │  - Clientes (ativos/expirados)       │ │
│  │  - Testes                            │ │
│  │  - Conversões                        │ │
│  │  - Renovações                        │ │
│  │  - Jogos                             │ │
│  │  - Updater Jobs                      │ │
│  └──────────────────────────────────────┘ │
└───────────────────────────────────────────┘
           │
           │
┌──────────▼──────────┐
│  API Externa Jogos  │
│  (Futebol)          │
└─────────────────────┘
```

### 1.2 Conceitos Importantes

**cache_key**: Identificador único no formato `panel:data:usuarioX` que:
- É gerado no login
- Identifica todos os dados do usuário no Redis
- Deve ser passado em TODAS as requisições após login
- Permite múltiplos usuários simultâneos sem conflito

**PHPSESSID**: Token de sessão retornado no login

**Reseller ID**: Identificador da revenda do usuário

---

## 2. Fluxo de Autenticação e Dados

### 2.1 Fluxo Completo (3 Passos)

```
┌──────────────────────────────────────────────────────────────────┐
│                      PASSO 1: LOGIN                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/painel/login                                          │
│  Body: { username, password }                                    │
│                                                                  │
│  ↓                                                               │
│                                                                  │
│  Response: { phpsessid, cache_key, resellerid }                  │
│  Guardar: cache_key para próximas requisições                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              PASSO 2: DISPARAR AGREGAÇÃO (OPCIONAL)              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/painel/execute-all?cache_key=panel:data:usuarioX      │
│  Body: (vazio)                                                   │
│                                                                  │
│  ↓                                                               │
│                                                                  │
│  Response: { cache_key, items: { ativos, expirados, ... } }     │
│  Processa e cacheia todos os dados no Redis                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                  PASSO 3: LEITURA DOS DADOS                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Opção A - TUDO DE UMA VEZ (Recomendado):                       │
│  GET /api/painel/cache-all?cache_key=panel:data:usuarioX         │
│                                                                  │
│  Response: { ativos, expirados, testes, conversoes, renovacoes } │
│                                                                  │
│  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  │
│                                                                  │
│  Opção B - INDIVIDUAL (Se necessário):                          │
│  GET /api/painel/get-clients-active?cache_key=...               │
│  GET /api/painel/get-clients-expired?cache_key=...              │
│  GET /api/painel/get-clients-test?cache_key=...                 │
│  GET /api/painel/get-conversions?cache_key=...                  │
│  GET /api/painel/get-renewals?cache_key=...                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Endpoints da API Real

### 3.1 Base URL

```
Produção: https://automatixbest-api.automation.app.br
```

### 3.2 Autenticação

#### **POST /api/painel/login**

Realiza login e retorna `cache_key` para todas as próximas operações.

**Request:**
```http
POST https://automatixbest-api.automation.app.br/api/painel/login
Content-Type: application/json

{
  "username": "usuario_do_painel",
  "password": "senha_do_painel"
}
```

**Response de Sucesso (200):**
```json
{
  "phpsessid": "abcdef123456789",
  "cache_key": "panel:data:usuarioX",
  "resellerid": "123"
}
```

**Response de Erro (401):**
```json
{
  "error": "Credenciais inválidas"
}
```

**Importante:**
- Guardar `cache_key` em `localStorage` ou state management
- Usar `cache_key` em TODAS as requisições seguintes
- `resellerid` identifica a revenda do usuário

---

### 3.3 Agregação de Dados

#### **POST /api/painel/execute-all**

Dispara processamento e agregação de todos os dados no Redis.

**Request:**
```http
POST https://automatixbest-api.automation.app.br/api/painel/execute-all?cache_key=panel:data:usuarioX
Content-Type: application/json

(Body vazio)
```

**Query Parameters:**
- `cache_key` (required): Cache key obtido no login

**Response de Sucesso (200):**
```json
{
  "cache_key": "panel:data:usuarioX",
  "items": {
    "ativos": 10,
    "expirados": 5,
    "testes": 2,
    "conversoes": 3,
    "renovacoes": 7
  }
}
```

**Quando usar:**
- Primeira vez após login (para garantir dados frescos)
- Quando quiser forçar refresh dos dados
- Não precisa chamar em toda requisição (dados já ficam cacheados)

---

### 3.4 Leitura Agregada (Tudo de Uma Vez)

#### **GET /api/painel/cache-all**

Retorna TODOS os dados do dashboard de uma só vez.

**Request:**
```http
GET https://automatixbest-api.automation.app.br/api/painel/cache-all?cache_key=panel:data:usuarioX
```

**Query Parameters:**
- `cache_key` (required): Cache key do usuário

**Response de Sucesso (200):**
```json
{
  "ativos": [
    {
      "Usuario": "11987654321",
      "Senha": "s3nh@F0rte",
      "Email": "cliente@example.com",
      "Criado_Em": "2024-10-01 12:34:56",
      "Expira_Em": "2025-01-01 00:00:00",
      "Reseller": "Parceiro Norte",
      "Max_Conn": 2,
      "Anotacoes": "DDD: 11; UF: SP",
      "Status": "enabled",
      "DDD": "11",
      "UF": "SP"
    }
  ],
  "expirados": [
    {
      "Usuario": "21976543210",
      "Senha": "senhaExp",
      "Email": "expirado@example.com",
      "Criado_Em": "2024-01-15 09:00:00",
      "Expira_Em": "2024-09-15 09:00:00",
      "Reseller": "Parceiro Sul",
      "Max_Conn": 1,
      "Anotacoes": "DDD: 21; UF: RJ",
      "Status": "disabled",
      "DDD": "21",
      "UF": "RJ"
    }
  ],
  "testes": [
    {
      "Usuario": "85988776655",
      "Senha": "testeTemp",
      "Email": "",
      "Criado_Em": "2024-11-01 14:00:00",
      "Expira_Em": "2024-11-04 14:00:00",
      "Reseller": "Parceiro Nordeste",
      "Max_Conn": 1,
      "Anotacoes": "DDD: 85; UF: CE",
      "Status": "trial",
      "DDD": "85",
      "UF": "CE"
    }
  ],
  "conversoes": [
    {
      "Usuario": "11987654321",
      "Owner": "parceiroA",
      "Tipo": "trial",
      "Acao": "trial-conversion",
      "Custo": 30.00,
      "Creditos_Antes": 0,
      "Creditos_Apos": 0,
      "Data": "2024-10-02 09:00:00"
    }
  ],
  "renovacoes": [
    {
      "Usuario": "11987654321",
      "Owner": "parceiroA",
      "Tipo": "renewal",
      "Acao": "plan-renewal",
      "Custo": 75.00,
      "Creditos_Antes": 50,
      "Creditos_Apos": 125,
      "Data": "2024-10-15 10:30:00"
    }
  ],
  "usuario": "usuarioX",
  "reseller": "123"
}
```

**Este é o endpoint mais importante** - retorna tudo que você precisa para montar o dashboard.

---

### 3.5 Leitura Individual por Categoria

Use estes endpoints se quiser carregar categorias separadamente.

#### **GET /api/painel/get-clients-active**

Retorna apenas clientes ativos.

**Request:**
```http
GET https://automatixbest-api.automation.app.br/api/painel/get-clients-active?cache_key=panel:data:usuarioX
```

**Response (Array):**
```json
[
  {
    "Usuario": "11987654321",
    "Senha": "s3nh@F0rte",
    "Email": "cliente@example.com",
    "Criado_Em": "2024-10-01 12:34:56",
    "Expira_Em": "2025-01-01 00:00:00",
    "Reseller": "Parceiro Norte",
    "Max_Conn": 2,
    "Anotacoes": "DDD: 11; UF: SP",
    "Status": "enabled",
    "DDD": "11",
    "UF": "SP"
  }
]
```

---

#### **GET /api/painel/get-clients-expired**

Retorna apenas clientes expirados.

**Request:**
```http
GET https://automatixbest-api.automation.app.br/api/painel/get-clients-expired?cache_key=panel:data:usuarioX
```

**Response:** Mesmo formato de `get-clients-active`, porém com `Status: "disabled"`

---

#### **GET /api/painel/get-clients-test**

Retorna apenas clientes em teste (trial).

**Request:**
```http
GET https://automatixbest-api.automation.app.br/api/painel/get-clients-test?cache_key=panel:data:usuarioX
```

**Response:** Mesmo formato de clientes, com `Status: "trial"`

---

#### **GET /api/painel/get-conversions**

Retorna logs de conversões (testes → clientes pagos).

**Request:**
```http
GET https://automatixbest-api.automation.app.br/api/painel/get-conversions?cache_key=panel:data:usuarioX
```

**Response (Array):**
```json
[
  {
    "Usuario": "11987654321",
    "Owner": "parceiroA",
    "Tipo": "trial",
    "Acao": "trial-conversion",
    "Custo": 30.00,
    "Creditos_Antes": 0,
    "Creditos_Apos": 0,
    "Data": "2024-10-02 09:00:00"
  }
]
```

**Campos:**
- `Usuario`: Telefone/ID do cliente
- `Owner`: Revendedor responsável
- `Tipo`: Tipo do log (`trial`, `renewal`, etc)
- `Acao`: Ação realizada (`trial-conversion`, `plan-renewal`)
- `Custo`: Valor pago (R$)
- `Creditos_Antes`: Saldo antes da compra
- `Creditos_Apos`: Saldo depois da compra
- `Data`: Data/hora do evento

---

#### **GET /api/painel/get-renewals**

Retorna logs de renovações.

**Request:**
```http
GET https://automatixbest-api.automation.app.br/api/painel/get-renewals?cache_key=panel:data:usuarioX
```

**Response:** Mesmo formato de `get-conversions`, porém com `Tipo: "renewal"` e `Acao: "plan-renewal"`

---

### 3.6 Jogos de Futebol

#### **GET /api/jogos**

Retorna jogos de futebol do dia (ou data específica).

**Request (Jogos de Hoje):**
```http
GET https://automatixbest-api.automation.app.br/api/jogos
```

**Request (Data Específica):**
```http
GET https://automatixbest-api.automation.app.br/api/jogos?date=03-11-2025
```

**Query Parameters:**
- `date` (optional): Data no formato `DD-MM-YYYY` (default: hoje)

**Response de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "date": "03-11-2025",
    "total_games": 8,
    "games": [
      {
        "id": "12345",
        "campeonato": "Brasileirão Série A",
        "horario": "16:00",
        "time_casa": {
          "nome": "Flamengo",
          "brasao": "https://cdn.example.com/flamengo.png"
        },
        "time_fora": {
          "nome": "Palmeiras",
          "brasao": "https://cdn.example.com/palmeiras.png"
        },
        "placar_casa": null,
        "placar_fora": null,
        "status": "1",
        "estadio": "Maracanã",
        "canais": "Premiere",
        "is_big_game": true,
        "status_text": "Programado"
      },
      {
        "id": "12346",
        "campeonato": "Copa Libertadores",
        "horario": "21:30",
        "time_casa": {
          "nome": "Corinthians",
          "brasao": "https://cdn.example.com/corinthians.png"
        },
        "time_fora": {
          "nome": "Boca Juniors",
          "brasao": "https://cdn.example.com/boca.png"
        },
        "placar_casa": 2,
        "placar_fora": 1,
        "status": "2",
        "estadio": "Neo Química Arena",
        "canais": "ESPN, Paramount+",
        "is_big_game": true,
        "status_text": "Ao Vivo"
      }
    ],
    "cached": true
  }
}
```

**Status do Jogo:**
- `"1"` = Programado (ainda não começou)
- `"2"` = Ao Vivo (jogo em andamento)
- `"3"` = Finalizado

**Campos Importantes:**
- `is_big_game`: Indica se é jogo de time grande (impacto maior nas conversões)
- `cached`: Se os dados vieram do cache Redis
- `placar_casa/placar_fora`: null se ainda não começou, número se em andamento/finalizado

---

### 3.7 Gerenciamento de Jobs (Updater)

#### **GET /api/painel/updater/jobs**

Lista jobs ativos de atualização.

**Request:**
```http
GET https://automatixbest-api.automation.app.br/api/painel/updater/jobs
```

**Response (Array):**
```json
[
  {
    "cache_key": "panel:data:usuarioX",
    "user": "usuarioX",
    "reseller": "123"
  },
  {
    "cache_key": "panel:data:usuarioY",
    "user": "usuarioY",
    "reseller": "124"
  }
]
```

---

#### **POST /api/painel/updater/stop**

Para um job específico de atualização.

**Request:**
```http
POST https://automatixbest-api.automation.app.br/api/painel/updater/stop
Content-Type: application/json

{
  "user": "usuarioX"
}
```

**Response de Sucesso (200):**
```json
{
  "success": true,
  "message": "Job do usuário usuarioX foi parado"
}
```

---

## 4. Estruturas de Dados

### 4.1 ClientDto (Cliente)

```typescript
interface ClientDto {
  Usuario: string;         // Telefone: "11987654321"
  Senha: string;           // Senha do cliente
  Email: string;           // Email (pode estar vazio)
  Criado_Em: string;       // Data criação: "2024-10-01 12:34:56"
  Expira_Em: string;       // Data expiração: "2025-01-01 00:00:00"
  Reseller: string;        // Nome do revendedor
  Max_Conn: number;        // Conexões simultâneas (1, 2, 3, 4)
  Anotacoes: string;       // Ex: "DDD: 11; UF: SP"
  Status: string;          // "enabled" | "disabled" | "trial"
  DDD: string;             // "11", "21", "85", etc
  UF: string;              // "SP", "RJ", "CE", etc
}
```

### 4.2 LogDto (Conversão/Renovação)

```typescript
interface LogDto {
  Usuario: string;         // Telefone do cliente
  Owner: string;           // Revendedor responsável
  Tipo: string;            // "trial" | "renewal" | "conversion"
  Acao: string;            // "trial-conversion" | "plan-renewal"
  Custo: number;           // Valor pago (R$)
  Creditos_Antes: number;  // Saldo antes da transação
  Creditos_Apos: number;   // Saldo depois da transação
  Data: string;            // "2024-10-02 09:00:00"
}
```

### 4.3 GameDto (Jogo)

```typescript
interface GameDto {
  id: string;
  campeonato: string;      // "Brasileirão Série A", "Libertadores"
  horario: string;         // "16:00"
  time_casa: {
    nome: string;
    brasao: string;        // URL do brasão
  };
  time_fora: {
    nome: string;
    brasao: string;
  };
  placar_casa: number | null;
  placar_fora: number | null;
  status: "1" | "2" | "3"; // 1=Programado, 2=Ao Vivo, 3=Finalizado
  estadio: string;
  canais: string;          // "Premiere, ESPN"
  is_big_game: boolean;
  status_text: string;     // "Programado" | "Ao Vivo" | "Finalizado"
}
```

### 4.4 DashboardData (Frontend)

```typescript
interface DashboardData {
  // Métricas principais
  testes: number;
  conversoes: number;
  renovacoes: number;
  clientesAtivos: number;
  clientesExpirados: number;
  
  // Taxas calculadas
  taxaConversao: number;         // (conversoes / testes) * 100
  taxaFidelidade: number;        // (clientesFieis / totalRenovadores) * 100
  churnRate: number;             // (expirados / total) * 100
  taxaRetencao: number;          // (ativos / total) * 100
  
  // Financeiro
  ticketMedio: number;           // Receita total / (conversoes + renovacoes)
  receitaMensal: number;         // MRR
  receitaAnual: number;          // ARR
  receitaTotal: number;          // Soma de todos os custos
  ltv: number;                   // Lifetime Value
  cac: number;                   // Custo de aquisição
  roas: number;                  // Retorno sobre investimento
  
  // Dados brutos (para análises)
  clientesData: ClientDto[];
  conversoesData: LogDto[];
  renovacoesData: LogDto[];
  
  // Análises geográficas
  porEstado: Array<{
    estado: string;
    testes: number;
    conversoes: number;
    ativos: number;
    expirados: number;
  }>;
  
  porDDD: Array<{
    ddd: string;
    count: number;
  }>;
}
```

---

## 5. Cálculos e Métricas

### 5.1 Taxa de Conversão

```typescript
// Fórmula
taxaConversao = (conversoes / testes) * 100

// Exemplo
testes = 100
conversoes = 35
taxaConversao = (35 / 100) * 100 = 35%
```

---

### 5.2 Taxa de Fidelidade

```typescript
// Fórmula
taxaFidelidade = (clientesFieis / totalRenovadores) * 100

// Onde:
// clientesFieis = clientes com 2 ou mais renovações
// totalRenovadores = total de clientes únicos que renovaram

// Algoritmo
const renovacoesPorCliente = {};

renovacoesData.forEach(ren => {
  renovacoesPorCliente[ren.Usuario] = 
    (renovacoesPorCliente[ren.Usuario] || 0) + 1;
});

const clientesFieis = Object.values(renovacoesPorCliente)
  .filter(count => count >= 2).length;

const totalRenovadores = Object.keys(renovacoesPorCliente).length;

const taxaFidelidade = (clientesFieis / totalRenovadores) * 100;

// Exemplo
// Cliente A: 1 renovação
// Cliente B: 3 renovações (fiel)
// Cliente C: 2 renovações (fiel)
// Cliente D: 1 renovação
// totalRenovadores = 4
// clientesFieis = 2 (B e C)
// taxaFidelidade = (2 / 4) * 100 = 50%
```

---

### 5.3 Churn Rate

```typescript
// Fórmula
churnRate = (clientesExpirados / totalClientes) * 100

// Onde:
// totalClientes = clientesAtivos + clientesExpirados

// Exemplo
clientesAtivos = 180
clientesExpirados = 20
totalClientes = 180 + 20 = 200
churnRate = (20 / 200) * 100 = 10%
```

---

### 5.4 Taxa de Retenção

```typescript
// Fórmula
taxaRetencao = 100 - churnRate
// OU
taxaRetencao = (clientesAtivos / totalClientes) * 100

// Exemplo
churnRate = 10%
taxaRetencao = 100 - 10 = 90%
```

---

### 5.5 Ticket Médio

```typescript
// Fórmula
ticketMedio = receitaTotal / (conversoes + renovacoes)

// Algoritmo
const receitaConversoes = conversoesData.reduce(
  (sum, conv) => sum + conv.Custo, 0
);

const receitaRenovacoes = renovacoesData.reduce(
  (sum, ren) => sum + ren.Custo, 0
);

const receitaTotal = receitaConversoes + receitaRenovacoes;
const totalVendas = conversoesData.length + renovacoesData.length;

const ticketMedio = receitaTotal / totalVendas;

// Exemplo
receitaConversoes = 1050.00   // 35 conversões × R$ 30 média
receitaRenovacoes = 5250.00   // 70 renovações × R$ 75 média
receitaTotal = 6300.00
totalVendas = 35 + 70 = 105
ticketMedio = 6300 / 105 = R$ 60.00
```

---

### 5.6 MRR (Monthly Recurring Revenue)

```typescript
// Fórmula
MRR = clientesAtivos * ticketMedio

// Exemplo
clientesAtivos = 180
ticketMedio = 60.00
MRR = 180 * 60 = R$ 10,800.00
```

---

### 5.7 ARR (Annual Recurring Revenue)

```typescript
// Fórmula
ARR = MRR * 12

// Exemplo
MRR = 10,800.00
ARR = 10800 * 12 = R$ 129,600.00
```

---

### 5.8 LTV (Lifetime Value)

```typescript
// Fórmula Simples
LTV = ticketMedio * vidaMediaEmMeses

// Onde:
// vidaMediaEmMeses = estimativa baseada em histórico
// (geralmente 6-12 meses para IPTV)

// Exemplo
ticketMedio = 60.00
vidaMediaEmMeses = 8
LTV = 60 * 8 = R$ 480.00

// Fórmula Avançada (com retenção)
LTV = (ticketMedio * taxaRetencao) / churnRate

// Exemplo
ticketMedio = 60.00
taxaRetencao = 0.90 (90%)
churnRate = 0.10 (10%)
LTV = (60 * 0.90) / 0.10 = R$ 540.00
```

---

### 5.9 CAC (Customer Acquisition Cost)

```typescript
// Fórmula
CAC = custoTotalMarketing / conversoes

// Nota: O campo "Custo" nas conversões pode representar
// o valor que o cliente pagou, NÃO o custo de aquisição.
// Se houver dados de investimento em marketing separados:

// Exemplo 1 (com dados de marketing)
investimentoMarketing = 1000.00
conversoes = 35
CAC = 1000 / 35 = R$ 28.57

// Exemplo 2 (estimativa)
// Assumindo 20% do valor da conversão como custo de aquisição
custoMedioConversao = 30.00
CAC_estimado = 30 * 0.20 = R$ 6.00
```

---

### 5.10 ROAS (Return on Ad Spend)

```typescript
// Fórmula
ROAS = receitaTotal / investimentoMarketing

// Exemplo
receitaTotal = 6300.00
investimentoMarketing = 1000.00
ROAS = 6300 / 1000 = 6.3

// Interpretação: Para cada R$ 1 investido, retornam R$ 6.30
```

---

### 5.11 Mapeamento Custo → Plano

```typescript
// Função de mapeamento
function mapCustoToPlano(custo: number) {
  if (custo <= 35) {
    return { nome: '1 Mês', precoMedio: 30, meses: 1 };
  } else if (custo <= 85) {
    return { nome: '3 Meses', precoMedio: 75, meses: 3 };
  } else if (custo <= 150) {
    return { nome: '6 Meses', precoMedio: 130, meses: 6 };
  } else {
    return { nome: '12 Meses', precoMedio: 320, meses: 12 };
  }
}

// Uso
conversoesData.forEach(conv => {
  const plano = mapCustoToPlano(conv.Custo);
  console.log(`Cliente ${conv.Usuario} comprou ${plano.nome}`);
});
```

---

### 5.12 Extração de DDD e UF

```typescript
// Os dados já vêm com DDD e UF nos campos do cliente
// Mas se precisar extrair manualmente:

function extractGeoFromPhone(usuario: string) {
  const digits = usuario.replace(/\D/g, '');
  const ddd = digits.substring(0, 2);
  
  // Mapa DDD → UF
  const dddMap: Record<string, string> = {
    '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP',
    '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP',
    '21': 'RJ', '22': 'RJ', '24': 'RJ',
    '27': 'ES', '28': 'ES',
    '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG',
    '37': 'MG', '38': 'MG',
    '41': 'PR', '42': 'PR', '43': 'PR', '44': 'PR', '45': 'PR', '46': 'PR',
    '47': 'SC', '48': 'SC', '49': 'SC',
    '51': 'RS', '53': 'RS', '54': 'RS', '55': 'RS',
    '61': 'DF',
    '62': 'GO', '64': 'GO',
    '85': 'CE', '88': 'CE',
    // ... etc
  };
  
  const uf = dddMap[ddd] || '';
  
  return { ddd, uf };
}

// Exemplo
const cliente = { Usuario: "11987654321", ... };
const geo = extractGeoFromPhone(cliente.Usuario);
// { ddd: "11", uf: "SP" }
```

---

### 5.13 Análise Temporal

```typescript
// Extrair dia da semana e turno
function analisarTemporal(data: string) {
  const date = new Date(data.replace(' ', 'T'));
  
  const diasSemana = [
    'domingo', 'segunda', 'terça', 
    'quarta', 'quinta', 'sexta', 'sábado'
  ];
  
  const diaSemana = diasSemana[date.getDay()];
  const hora = date.getHours();
  
  let turno: string;
  if (hora >= 6 && hora < 12) turno = 'Manhã';
  else if (hora >= 12 && hora < 18) turno = 'Tarde';
  else if (hora >= 18 && hora < 24) turno = 'Noite';
  else turno = 'Madrugada';
  
  return { diaSemana, hora, turno };
}

// Uso
conversoesData.forEach(conv => {
  const { diaSemana, hora, turno } = analisarTemporal(conv.Data);
  console.log(`Conversão em ${diaSemana} às ${hora}h (${turno})`);
});

// Agregação por turno
const conversoesPorTurno = {
  'Manhã': 0,
  'Tarde': 0,
  'Noite': 0,
  'Madrugada': 0
};

conversoesData.forEach(conv => {
  const { turno } = analisarTemporal(conv.Data);
  conversoesPorTurno[turno]++;
});

// Resultado exemplo:
// { Manhã: 12, Tarde: 45, Noite: 85, Madrugada: 3 }
```

---

### 5.14 Análise Geográfica

```typescript
// Análise por Estado
function analisarPorEstado(
  ativos: ClientDto[], 
  expirados: ClientDto[],
  testes: ClientDto[]
) {
  const porEstado: Record<string, any> = {};
  
  // Processar ativos
  ativos.forEach(cliente => {
    if (!porEstado[cliente.UF]) {
      porEstado[cliente.UF] = {
        estado: cliente.UF,
        testes: 0,
        conversoes: 0,
        ativos: 0,
        expirados: 0
      };
    }
    porEstado[cliente.UF].ativos++;
  });
  
  // Processar expirados
  expirados.forEach(cliente => {
    if (!porEstado[cliente.UF]) {
      porEstado[cliente.UF] = {
        estado: cliente.UF,
        testes: 0,
        conversoes: 0,
        ativos: 0,
        expirados: 0
      };
    }
    porEstado[cliente.UF].expirados++;
  });
  
  // Processar testes
  testes.forEach(cliente => {
    if (!porEstado[cliente.UF]) {
      porEstado[cliente.UF] = {
        estado: cliente.UF,
        testes: 0,
        conversoes: 0,
        ativos: 0,
        expirados: 0
      };
    }
    porEstado[cliente.UF].testes++;
  });
  
  return Object.values(porEstado);
}

// Resultado exemplo:
[
  { estado: 'SP', testes: 45, conversoes: 0, ativos: 85, expirados: 12 },
  { estado: 'RJ', testes: 22, conversoes: 0, ativos: 42, expirados: 8 },
  { estado: 'MG', testes: 18, conversoes: 0, ativos: 35, expirados: 5 }
]
```

---

## 6. Integração com Jogos

### 6.1 Buscar Jogos de Hoje

```typescript
// Função para buscar jogos
async function buscarJogos(date?: string) {
  const url = date 
    ? `https://automatixbest-api.automation.app.br/api/jogos?date=${date}`
    : 'https://automatixbest-api.automation.app.br/api/jogos';
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data;
}

// Uso
const jogosHoje = await buscarJogos();
console.log(`${jogosHoje.data.total_games} jogos hoje`);

// Jogos de data específica
const jogosAmanha = await buscarJogos('04-11-2025');
```

---

### 6.2 Análise de Impacto (Frontend)

```typescript
// Correlacionar conversões com jogos
function analisarImpactoJogos(
  conversoes: LogDto[], 
  jogos: GameDto[]
) {
  const impacto = {
    antes: 0,      // 2h antes do jogo
    durante: 0,    // Durante o jogo (2h)
    depois: 0      // 2h depois
  };
  
  conversoes.forEach(conv => {
    const dataConv = new Date(conv.Data.replace(' ', 'T'));
    
    jogos.forEach(jogo => {
      // Assumindo que jogo.horario está em formato "16:00"
      const [hora, min] = jogo.horario.split(':');
      const dataJogo = new Date();
      dataJogo.setHours(parseInt(hora), parseInt(min), 0);
      
      const diferencaHoras = 
        (dataConv.getTime() - dataJogo.getTime()) / (1000 * 60 * 60);
      
      if (diferencaHoras >= -2 && diferencaHoras < 0) {
        impacto.antes++;
      } else if (diferencaHoras >= 0 && diferencaHoras < 2) {
        impacto.durante++;
      } else if (diferencaHoras >= 2 && diferencaHoras < 4) {
        impacto.depois++;
      }
    });
  });
  
  const total = impacto.antes + impacto.durante + impacto.depois;
  
  return {
    antes: { count: impacto.antes, percentual: (impacto.antes / total) * 100 },
    durante: { count: impacto.durante, percentual: (impacto.durante / total) * 100 },
    depois: { count: impacto.depois, percentual: (impacto.depois / total) * 100 }
  };
}
```

---

## 7. Sistema de Cache Redis

### 7.1 Como Funciona

```
┌─────────────────────────────────────────────────────────┐
│                    REDIS CACHE                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  cache_key: panel:data:usuarioX                         │
│  ├─ ativos: [...]                                       │
│  ├─ expirados: [...]                                    │
│  ├─ testes: [...]                                       │
│  ├─ conversoes: [...]                                   │
│  └─ renovacoes: [...]                                   │
│                                                         │
│  cache_key: panel:data:usuarioY                         │
│  ├─ ativos: [...]                                       │
│  └─ ...                                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Vantagens:**
- Dados persistem entre requisições
- Múltiplos usuários simultâneos sem conflito
- Performance: não precisa reprocessar a cada requisição

**TTL (Time To Live):**
- Dados expiram após X minutos (configurável no backend)
- Pode forçar refresh com `execute-all`

---

### 7.2 Estratégia de Cache

```typescript
// Fluxo recomendado no frontend

// 1. Login
const { cache_key } = await login(username, password);
localStorage.setItem('cache_key', cache_key);

// 2. Execute (apenas na primeira vez ou quando quiser refresh)
const shouldRefresh = !localStorage.getItem('last_refresh') || 
                      Date.now() - localStorage.getItem('last_refresh') > 300000; // 5 min

if (shouldRefresh) {
  await executeAll(cache_key);
  localStorage.setItem('last_refresh', Date.now());
}

// 3. Cache-all (carregar dados)
const data = await getCacheAll(cache_key);

// 4. Atualizar apenas partes específicas (se necessário)
const ativos = await getClientsActive(cache_key);
```

---

## 8. Exemplos Práticos

### 8.1 Fluxo Completo de Login e Carregamento

```typescript
// 1. LOGIN
async function fazerLogin(username: string, password: string) {
  const response = await fetch(
    'https://automatixbest-api.automation.app.br/api/painel/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }
  );
  
  const data = await response.json();
  
  // Guardar cache_key
  localStorage.setItem('cache_key', data.cache_key);
  localStorage.setItem('phpsessid', data.phpsessid);
  localStorage.setItem('resellerid', data.resellerid);
  
  return data;
}

// 2. DISPARAR AGREGAÇÃO (opcional, mas recomendado na primeira vez)
async function executarAgregacao(cache_key: string) {
  const response = await fetch(
    `https://automatixbest-api.automation.app.br/api/painel/execute-all?cache_key=${cache_key}`,
    { method: 'POST' }
  );
  
  return await response.json();
}

// 3. BUSCAR TODOS OS DADOS
async function buscarDadosDashboard(cache_key: string) {
  const response = await fetch(
    `https://automatixbest-api.automation.app.br/api/painel/cache-all?cache_key=${cache_key}`
  );
  
  const data = await response.json();
  
  // data.ativos, data.expirados, data.testes, data.conversoes, data.renovacoes
  return data;
}

// USO COMPLETO
async function inicializarDashboard(username: string, password: string) {
  try {
    // 1. Login
    const loginData = await fazerLogin(username, password);
    console.log('Login OK, cache_key:', loginData.cache_key);
    
    // 2. Executar agregação
    const execResult = await executarAgregacao(loginData.cache_key);
    console.log('Dados processados:', execResult.items);
    
    // 3. Buscar dados
    const dashboardData = await buscarDadosDashboard(loginData.cache_key);
    
    console.log('Ativos:', dashboardData.ativos.length);
    console.log('Expirados:', dashboardData.expirados.length);
    console.log('Testes:', dashboardData.testes.length);
    console.log('Conversões:', dashboardData.conversoes.length);
    console.log('Renovações:', dashboardData.renovacoes.length);
    
    return dashboardData;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}
```

---

### 8.2 Processar Dados para o Dashboard

```typescript
function processarDadosDashboard(apiData: any) {
  const ativos = apiData.ativos || [];
  const expirados = apiData.expirados || [];
  const testes = apiData.testes || [];
  const conversoes = apiData.conversoes || [];
  const renovacoes = apiData.renovacoes || [];
  
  // Métricas básicas
  const metrics = {
    clientesAtivos: ativos.length,
    clientesExpirados: expirados.length,
    testes: testes.length,
    conversoes: conversoes.length,
    renovacoes: renovacoes.length,
  };
  
  // Taxa de conversão
  metrics.taxaConversao = testes.length > 0 
    ? (conversoes.length / testes.length) * 100 
    : 0;
  
  // Churn rate
  const totalClientes = ativos.length + expirados.length;
  metrics.churnRate = totalClientes > 0
    ? (expirados.length / totalClientes) * 100
    : 0;
  
  // Taxa de retenção
  metrics.taxaRetencao = 100 - metrics.churnRate;
  
  // Receita
  const receitaConversoes = conversoes.reduce(
    (sum, c) => sum + c.Custo, 0
  );
  const receitaRenovacoes = renovacoes.reduce(
    (sum, r) => sum + r.Custo, 0
  );
  
  metrics.receitaTotal = receitaConversoes + receitaRenovacoes;
  
  // Ticket médio
  const totalVendas = conversoes.length + renovacoes.length;
  metrics.ticketMedio = totalVendas > 0
    ? metrics.receitaTotal / totalVendas
    : 0;
  
  // MRR e ARR
  metrics.receitaMensal = ativos.length * metrics.ticketMedio;
  metrics.receitaAnual = metrics.receitaMensal * 12;
  
  // LTV
  metrics.ltv = metrics.ticketMedio * 6; // Assumindo 6 meses de vida média
  
  // Análise geográfica
  const porEstado = analisarPorEstado(ativos, expirados, testes);
  
  // Análise por DDD
  const porDDD: Record<string, number> = {};
  [...ativos, ...expirados, ...testes].forEach(cliente => {
    porDDD[cliente.DDD] = (porDDD[cliente.DDD] || 0) + 1;
  });
  
  const topDDDs = Object.entries(porDDD)
    .map(([ddd, count]) => ({ ddd, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    ...metrics,
    porEstado,
    topDDDs,
    clientesData: ativos,
    conversoesData: conversoes,
    renovacoesData: renovacoes
  };
}
```

---

### 8.3 Integração com Jogos

```typescript
async function buscarEAnalisarJogos() {
  // Buscar jogos
  const response = await fetch(
    'https://automatixbest-api.automation.app.br/api/jogos'
  );
  const jogosData = await response.json();
  
  if (!jogosData.success) {
    throw new Error('Erro ao buscar jogos');
  }
  
  const jogos = jogosData.data.games;
  
  // Filtrar apenas jogos importantes
  const jogosGrandes = jogos.filter(j => j.is_big_game);
  
  // Agrupar por competição
  const porCompeticao: Record<string, number> = {};
  jogos.forEach(jogo => {
    porCompeticao[jogo.campeonato] = 
      (porCompeticao[jogo.campeonato] || 0) + 1;
  });
  
  // Identificar jogos ao vivo
  const jogosAoVivo = jogos.filter(j => j.status === '2');
  
  return {
    total: jogos.length,
    jogosGrandes: jogosGrandes.length,
    jogosAoVivo: jogosAoVivo.length,
    porCompeticao,
    jogos
  };
}
```

---

## 📊 Resumo de Endpoints

### Autenticação
- `POST /api/painel/login` - Login e obtenção do cache_key

### Agregação
- `POST /api/painel/execute-all?cache_key=X` - Processar e cachear dados

### Leitura de Dados

**Tudo de uma vez (RECOMENDADO):**
- `GET /api/painel/cache-all?cache_key=X` - Todos os dados

**Individual:**
- `GET /api/painel/get-clients-active?cache_key=X` - Clientes ativos
- `GET /api/painel/get-clients-expired?cache_key=X` - Clientes expirados
- `GET /api/painel/get-clients-test?cache_key=X` - Clientes teste
- `GET /api/painel/get-conversions?cache_key=X` - Conversões
- `GET /api/painel/get-renewals?cache_key=X` - Renovações

### Jogos
- `GET /api/jogos` - Jogos de hoje
- `GET /api/jogos?date=DD-MM-YYYY` - Jogos de data específica

### Jobs (Interno)
- `GET /api/painel/updater/jobs` - Listar jobs ativos
- `POST /api/painel/updater/stop` - Parar job

---

## 🔒 Segurança

### Headers Recomendados

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

### Tratamento de Erros

```typescript
async function requestAPI(url: string, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Sessão expirada, fazer login novamente
        localStorage.removeItem('cache_key');
        window.location.href = '/login';
        throw new Error('Sessão expirada');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}
```

---

## 📈 Performance

### Cache Local (Frontend)

```typescript
// Cachear dados por 5 minutos
const CACHE_DURATION = 5 * 60 * 1000;

function getCachedData(key: string) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }
  
  return data;
}

function setCachedData(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
}

// Uso
async function getDashboardData(cache_key: string) {
  const cached = getCachedData('dashboard_data');
  if (cached) return cached;
  
  const data = await buscarDadosDashboard(cache_key);
  setCachedData('dashboard_data', data);
  
  return data;
}
```

---

## 🎯 Checklist de Implementação

- [ ] Implementar tela de login
- [ ] Guardar `cache_key` após login
- [ ] Chamar `execute-all` na primeira carga
- [ ] Usar `cache-all` para carregar dashboard
- [ ] Implementar cálculo de métricas (conversão, churn, etc)
- [ ] Implementar análise geográfica (DDD/UF)
- [ ] Integrar API de jogos
- [ ] Implementar cache local (5 min)
- [ ] Tratamento de erros 401 (sessão expirada)
- [ ] Botão de refresh forçado (execute-all)
- [ ] Loading states durante requisições
- [ ] Fallback para dados offline

---

## 📞 Suporte

**API Base:** https://automatixbest-api.automation.app.br

**Documentação Frontend:**
- `/COMECE_AQUI.md`
- `/GUIA_DEFINITIVO.md`
- `/QUICK_START_ADMIN.md`

---

**FIM DA DOCUMENTAÇÃO TÉCNICA DA API REAL**

*Atualizado em: 03/11/2024*  
*Versão: 1.0.0*
