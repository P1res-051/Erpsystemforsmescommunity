# 📘 Documentação Técnica - API Backend e Cálculos
## Dashboard Analytics IPTV AutonomyX

**Versão:** 1.0.0  
**Data:** 03 de Novembro de 2024  
**Ambiente:** Produção  
**Tecnologia Frontend:** React + TypeScript + Tailwind CSS  
**Backend Esperado:** Node.js / Python / PHP (compatível com REST API)

---

## 📋 Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Estrutura de Dados Principal](#2-estrutura-de-dados-principal)
3. [Endpoints da API](#3-endpoints-da-api)
4. [Cálculos e Métricas](#4-cálculos-e-métricas)
5. [Autenticação e Segurança](#5-autenticação-e-segurança)
6. [Integração com Jogos de Futebol](#6-integração-com-jogos-de-futebol)
7. [Processamento de Dados Geográficos](#7-processamento-de-dados-geográficos)
8. [Webhooks e Eventos em Tempo Real](#8-webhooks-e-eventos-em-tempo-real)
9. [Estrutura de Banco de Dados](#9-estrutura-de-banco-de-dados)
10. [Exemplos de Requisições e Respostas](#10-exemplos-de-requisições-e-respostas)

---

## 1. Visão Geral do Sistema

### 1.1 Arquitetura

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Frontend React │◄───────►│  Backend API     │◄───────►│  Banco de Dados │
│  (Dashboard)    │  REST   │  (Node/Python)   │  SQL    │  (PostgreSQL)   │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  API Futebol    │         │  Webhook N8N     │
│  (Jogos)        │         │  (Pixel)         │
│                 │         │                  │
└─────────────────┘         └──────────────────┘
```

### 1.2 Fluxo de Dados

1. **Upload de Excel** (Temporário): Frontend processa arquivo XLSX localmente
2. **API Backend** (Futuro): Sincronização automática de dados do painel admin
3. **Tempo Real**: Webhooks N8N para rastreamento de pixel e eventos
4. **Jogos**: API externa de futebol para aba de Jogos

---

## 2. Estrutura de Dados Principal

### 2.1 Interface TypeScript - DashboardData

```typescript
export interface DashboardData {
  // ============================================
  // MÉTRICAS PRINCIPAIS (KPIs)
  // ============================================
  testes: number;                    // Total de testes criados
  conversoes: number;                // Total de conversões
  renovacoes: number;                // Total de renovações
  clientesAtivos: number;            // Clientes com status ativo
  clientesExpirados: number;         // Clientes expirados
  
  // ============================================
  // TAXAS CALCULADAS (Percentuais)
  // ============================================
  taxaConversao: number;             // (conversoes / testes) * 100
  taxaFidelidade: number;            // (clientesFieis / totalRenovadores) * 100
  churnRate: number;                 // (expirados / total) * 100
  taxaRetencao: number;              // (ativos / total) * 100
  
  // ============================================
  // FINANCEIRO (Valores em R$)
  // ============================================
  ticketMedio: number;               // Receita total / (conversoes + renovacoes)
  receitaMensal: number;             // MRR - Monthly Recurring Revenue
  receitaAnual: number;              // ARR - Annual Recurring Revenue
  receitaTotal: number;              // Soma de todas as vendas
  ltv: number;                       // Lifetime Value
  custoTotalConversoes: number;      // Soma dos custos de conversões
  custoTotalRenovacoes: number;      // Soma dos custos de renovações
  custoMedioConversao: number;       // Custo médio por conversão
  custoMedioRenovacao: number;       // Custo médio por renovação
  cac: number;                       // Customer Acquisition Cost
  roas: number;                      // Return on Ad Spend
  saldoMedioPosVenda: number;        // Créditos médios após venda
  
  // ============================================
  // ANÁLISE POR PLANO
  // ============================================
  conversoesPorPlano: Array<{
    plano: string;                   // Nome do plano (1 Mês, 3 Meses, etc)
    count: number;                   // Quantidade de conversões
    receita: number;                 // Receita gerada pelo plano
  }>;
  
  renovacoesPorPlano: Array<{
    plano: string;
    count: number;
    receita: number;
  }>;
  
  mixPlanos: Array<{
    plano: string;
    value: number;                   // Quantidade total
    percentual: number;              // Percentual do total
  }>;
  
  // ============================================
  // TEMPORAL (Análise de Tempo)
  // ============================================
  melhorDia: string;                 // Dia da semana com mais renovações
  melhorDiaCount: number;            // Quantidade do melhor dia
  testesPorDia: Record<string, number>;
  conversoesPorDia: Record<string, number>;
  renovacoesPorDia: Record<string, number>;
  
  testesPorMes: Array<{
    mes: string;                     // Formato: "jan/24"
    count: number;
  }>;
  
  conversoesPorMes: Array<{
    mes: string;
    count: number;
  }>;
  
  renovacoesPorMes: Array<{
    mes: string;
    count: number;
  }>;
  
  tempoMedioAteConversao: number;    // Em dias (mediana)
  
  heatmapHoraDia: Array<{
    dia: string;                     // "segunda-feira", "terça-feira", etc
    hora: number;                    // 0-23
    count: number;                   // Quantidade de conversões
  }>;
  
  // ============================================
  // TURNOS (Manhã, Tarde, Noite, Madrugada)
  // ============================================
  testesPorTurno: Record<string, number>;
  conversoesPorTurno: Record<string, number>;
  renovacoesPorTurno: Record<string, number>;
  melhorTurno: string;
  melhorTurnoCount: number;
  
  // ============================================
  // GEOGRÁFICO (Brasil - Estados e DDDs)
  // ============================================
  porEstado: Array<{
    estado: string;                  // UF: "SP", "RJ", "MG", etc
    testes: number;
    conversoes: number;
    ativos: number;
    expirados: number;
  }>;
  
  porDDD: Array<{
    ddd: string;                     // "11", "21", "85", etc
    count: number;
  }>;
  
  topEstados: Array<{
    estado: string;
    total: number;
    percentual: number;
  }>;
  
  estadosCobertos: number;           // Quantidade de estados com clientes
  
  // ============================================
  // CONEXÕES (Telas simultâneas)
  // ============================================
  conexoesPorTipo: Record<string, number>;  // "1 conexão", "2 conexões", etc
  mediaConexoes: number;
  maxConexoes: number;
  
  // ============================================
  // CLIENTES (Análise de Comportamento)
  // ============================================
  clientesFieis: number;             // Clientes com 2+ renovações
  totalRenovadores: number;          // Total de clientes que renovaram
  clientesData: any[];               // Array completo de clientes
  recentClients: any[];              // 10 clientes mais recentes
  
  distribuicaoRenovacoes: Array<{
    categoria: string;               // "1 renovação", "2-3 renovações", etc
    count: number;
  }>;
  
  // ============================================
  // STATUS (Análise de Status)
  // ============================================
  statusDistribution: Record<string, number>;  // "Ativo", "Teste", "Expirado"
  
  // ============================================
  // REVENDEDORES (Top Parceiros)
  // ============================================
  topRevendedores: Array<{
    revendedor: string;
    count: number;
  }>;
  
  // ============================================
  // JOGOS (Impacto de Futebol nas Conversões)
  // ============================================
  hasGamesData: boolean;             // Se tem dados de jogos
  jogosAnalisados: number;           // Total de jogos cadastrados
  jogosComConversoes: number;        // Jogos que geraram conversões
  conversoesDuranteJogos: number;    // Conversões durante as partidas
  conversoesAntesJogos: number;      // Conversões 2h antes
  conversoesDepoisJogos: number;     // Conversões 2h depois
  
  topTimes: Array<{
    time: string;
    conversoes: number;
  }>;
  
  porCompeticao: Record<string, number>;  // "Brasileirão", "Libertadores", etc
  
  impactoPorPeriodo: Array<{
    periodo: string;                 // "Antes", "Durante", "Depois"
    count: number;
    percentual: number;
  }>;
  
  // ============================================
  // RAW DATA (Dados Brutos para Análises)
  // ============================================
  rawData: {
    testes: any[];
    conversoes: any[];
    renovacoes: any[];
    ativos: any[];
    expirados: any[];
    jogos: any[];
    convJogos: any[];                // Conversões relacionadas a jogos
  };
}
```

---

## 3. Endpoints da API

### 3.1 Base URL

```
Produção:  https://api.autonomyx.com.br/v1
Staging:   https://staging-api.autonomyx.com.br/v1
Local:     http://localhost:3000/v1
```

### 3.2 Autenticação

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "admin@autonomyx.com.br",
  "senha": "senha_segura",
  "tipo": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "Admin AutonomyX",
    "email": "admin@autonomyx.com.br",
    "role": "admin",
    "revenda": "AutonomyX Premium"
  },
  "expiresIn": 86400
}
```

**Headers em Todas as Requisições:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

### 3.3 Dashboard - Obter Todos os Dados

**Endpoint:** `GET /dashboard/data`

**Query Parameters:**
```
?periodo=30d          // 7d, 30d, 90d, 365d, all
&revenda_id=123       // ID da revenda (opcional para admin)
```

**Response:** Retorna objeto completo `DashboardData` (ver seção 2.1)

**Exemplo de Response (resumido):**
```json
{
  "success": true,
  "data": {
    "testes": 1250,
    "conversoes": 438,
    "renovacoes": 892,
    "clientesAtivos": 1180,
    "clientesExpirados": 150,
    "taxaConversao": 35.04,
    "taxaFidelidade": 67.85,
    "churnRate": 11.28,
    "taxaRetencao": 88.72,
    "ticketMedio": 52.50,
    "receitaMensal": 61950.00,
    "receitaAnual": 743400.00,
    "ltv": 315.00,
    "cac": 18.50,
    "roas": 4.2,
    "conversoesPorPlano": [
      { "plano": "1 Mês", "count": 180, "receita": 5400.00 },
      { "plano": "3 Meses", "count": 150, "receita": 11250.00 },
      { "plano": "6 Meses", "count": 80, "receita": 10400.00 },
      { "plano": "12 Meses", "count": 28, "receita": 8960.00 }
    ],
    "porEstado": [
      { "estado": "SP", "testes": 450, "conversoes": 165, "ativos": 410, "expirados": 55 },
      { "estado": "RJ", "testes": 280, "conversoes": 98, "ativos": 250, "expirados": 30 }
    ],
    "topTimes": [
      { "time": "Flamengo", "conversoes": 85 },
      { "time": "Corinthians", "conversoes": 72 },
      { "time": "Palmeiras", "conversoes": 68 }
    ]
  }
}
```

---

### 3.4 Testes - Criar Novo Teste

**Endpoint:** `POST /testes`

**Request:**
```json
{
  "usuario": "11987654321",
  "max_conexoes": 1,
  "revenda": "AutonomyX",
  "revendedor": "João Silva",
  "status": "Teste",
  "observacoes": "Cliente interessado no plano premium"
}
```

**Response:**
```json
{
  "success": true,
  "teste": {
    "id": 1251,
    "usuario": "11987654321",
    "criado_em": "2024-11-03T14:30:00Z",
    "max_conexoes": 1,
    "status": "Teste",
    "ddd": "11",
    "uf": "SP"
  }
}
```

---

### 3.5 Conversões - Registrar Conversão

**Endpoint:** `POST /conversoes`

**Request:**
```json
{
  "usuario": "11987654321",
  "custo": 30.00,
  "creditos_antes": 0,
  "creditos_apos": 0,
  "revenda": "AutonomyX",
  "observacoes": "Primeira compra - 1 mês"
}
```

**Response:**
```json
{
  "success": true,
  "conversao": {
    "id": 439,
    "usuario": "11987654321",
    "data": "2024-11-03T14:35:00Z",
    "custo": 30.00,
    "plano": "1 Mês",
    "creditos_apos": 0
  }
}
```

---

### 3.6 Renovações - Registrar Renovação

**Endpoint:** `POST /renovacoes`

**Request:**
```json
{
  "usuario": "11987654321",
  "custo": 75.00,
  "creditos_antes": 50,
  "creditos_apos": 125,
  "revenda": "AutonomyX"
}
```

**Response:**
```json
{
  "success": true,
  "renovacao": {
    "id": 893,
    "usuario": "11987654321",
    "data": "2024-11-03T14:40:00Z",
    "custo": 75.00,
    "plano": "3 Meses",
    "numero_renovacao": 2
  }
}
```

---

### 3.7 Clientes - Listar Ativos

**Endpoint:** `GET /clientes/ativos`

**Query Parameters:**
```
?page=1
&limit=50
&search=11987654321
&ordenar=criado_em_desc
```

**Response:**
```json
{
  "success": true,
  "total": 1180,
  "page": 1,
  "limit": 50,
  "clientes": [
    {
      "id": 1,
      "usuario": "11987654321",
      "nome": "João da Silva",
      "email": "joao@email.com",
      "criado_em": "2024-01-15T10:00:00Z",
      "expira_em": "2024-12-15T10:00:00Z",
      "max_conexoes": 2,
      "status": "Ativo",
      "ddd": "11",
      "uf": "SP",
      "cidade": "São Paulo",
      "plano_atual": "6 Meses",
      "renovacoes": 3,
      "ultima_renovacao": "2024-10-15T10:00:00Z"
    }
  ]
}
```

---

### 3.8 Clientes - Listar Expirados

**Endpoint:** `GET /clientes/expirados`

**Query Parameters:** Mesmos de `/clientes/ativos`

**Response:** Mesmo formato de `/clientes/ativos`

---

### 3.9 Jogos - Listar Jogos do Dia

**Endpoint:** `GET /jogos`

**Query Parameters:**
```
?data=2024-11-03
&competicao=brasileirao
&time=Flamengo
```

**Response:**
```json
{
  "success": true,
  "total": 8,
  "jogos": [
    {
      "id": 1,
      "competicao": "Brasileirão Série A",
      "data": "2024-11-03",
      "horario": "16:00",
      "time_casa": "Flamengo",
      "brasao_casa": "https://cdn.api.com/times/flamengo.png",
      "time_fora": "Palmeiras",
      "brasao_fora": "https://cdn.api.com/times/palmeiras.png",
      "estadio": "Maracanã",
      "cidade": "Rio de Janeiro",
      "canal": "Premiere",
      "rodada": 32
    }
  ]
}
```

---

### 3.10 Jogos - Análise de Impacto

**Endpoint:** `GET /jogos/impacto`

**Query Parameters:**
```
?periodo=30d
&time=Flamengo
```

**Response:**
```json
{
  "success": true,
  "jogos_analisados": 45,
  "jogos_com_conversoes": 38,
  "impacto_por_periodo": [
    { "periodo": "Antes", "count": 12, "percentual": 15.79 },
    { "periodo": "Durante", "count": 52, "percentual": 68.42 },
    { "periodo": "Depois", "count": 12, "percentual": 15.79 }
  ],
  "top_times": [
    { "time": "Flamengo", "conversoes": 85 },
    { "time": "Corinthians", "conversoes": 72 }
  ]
}
```

---

### 3.11 Geográfico - Análise por Estado

**Endpoint:** `GET /geografico/estados`

**Response:**
```json
{
  "success": true,
  "estados_cobertos": 24,
  "total_clientes": 1330,
  "dados": [
    {
      "estado": "SP",
      "nome_completo": "São Paulo",
      "testes": 450,
      "conversoes": 165,
      "ativos": 410,
      "expirados": 55,
      "taxa_conversao": 36.67,
      "percentual": 30.83
    },
    {
      "estado": "RJ",
      "nome_completo": "Rio de Janeiro",
      "testes": 280,
      "conversoes": 98,
      "ativos": 250,
      "expirados": 30,
      "taxa_conversao": 35.00,
      "percentual": 21.05
    }
  ]
}
```

---

### 3.12 Geográfico - Top DDDs

**Endpoint:** `GET /geografico/ddds`

**Response:**
```json
{
  "success": true,
  "total_ddds": 67,
  "top_10": [
    { "ddd": "11", "count": 380, "estado": "SP", "cidade": "São Paulo" },
    { "ddd": "21", "count": 195, "estado": "RJ", "cidade": "Rio de Janeiro" },
    { "ddd": "85", "count": 142, "estado": "CE", "cidade": "Fortaleza" }
  ]
}
```

---

### 3.13 Revendedores - Top Parceiros

**Endpoint:** `GET /revendedores/top`

**Response:**
```json
{
  "success": true,
  "total_revendedores": 15,
  "top_10": [
    { "revendedor": "João Silva", "testes": 280, "conversoes": 105, "taxa": 37.5 },
    { "revendedor": "Maria Santos", "testes": 195, "conversoes": 78, "taxa": 40.0 }
  ]
}
```

---

### 3.14 Exportar Relatório

**Endpoint:** `GET /relatorios/exportar`

**Query Parameters:**
```
?formato=excel         // excel, pdf, csv
&periodo=30d
&incluir=todos         // todos, resumo, detalhado
```

**Response:** Arquivo binário (Excel/PDF/CSV)

---

### 3.15 Pixel Tracking - Webhook N8N

**Endpoint:** `POST /tracking/evento`

**Request:**
```json
{
  "evento": "page_view",
  "pagina": "/landing-page-promo",
  "usuario_id": "visitor_12345",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "black_friday_2024",
  "timestamp": "2024-11-03T14:45:00Z",
  "ip": "200.150.10.50",
  "user_agent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "evento_id": "evt_abc123",
  "processado": true
}
```

---

## 4. Cálculos e Métricas

### 4.1 Taxa de Conversão

```typescript
// Fórmula
taxaConversao = (conversoes / testes) * 100

// Exemplo
testes = 1250
conversoes = 438
taxaConversao = (438 / 1250) * 100 = 35.04%
```

---

### 4.2 Taxa de Fidelidade

```typescript
// Fórmula
taxaFidelidade = (clientesFieis / totalRenovadores) * 100

// Onde:
// clientesFieis = clientes com 2 ou mais renovações
// totalRenovadores = total de clientes únicos que renovaram

// Exemplo
clientesFieis = 285       // Clientes com >= 2 renovações
totalRenovadores = 420    // Total de clientes que renovaram pelo menos 1 vez
taxaFidelidade = (285 / 420) * 100 = 67.86%
```

---

### 4.3 Churn Rate (Taxa de Cancelamento)

```typescript
// Fórmula
churnRate = (clientesExpirados / totalClientes) * 100

// Onde:
// totalClientes = clientesAtivos + clientesExpirados

// Exemplo
clientesAtivos = 1180
clientesExpirados = 150
totalClientes = 1180 + 150 = 1330
churnRate = (150 / 1330) * 100 = 11.28%
```

---

### 4.4 Taxa de Retenção

```typescript
// Fórmula
taxaRetencao = (clientesAtivos / totalClientes) * 100
// OU
taxaRetencao = 100 - churnRate

// Exemplo
clientesAtivos = 1180
totalClientes = 1330
taxaRetencao = (1180 / 1330) * 100 = 88.72%
```

---

### 4.5 Ticket Médio

```typescript
// Fórmula
ticketMedio = receitaTotal / (conversoes + renovacoes)

// Exemplo
receitaTotal = 69,825.00    // Soma de todas as vendas
conversoes = 438
renovacoes = 892
totalVendas = 438 + 892 = 1330
ticketMedio = 69825 / 1330 = R$ 52.50
```

---

### 4.6 MRR (Monthly Recurring Revenue)

```typescript
// Fórmula
MRR = clientesAtivos * ticketMedio

// Exemplo
clientesAtivos = 1180
ticketMedio = 52.50
MRR = 1180 * 52.50 = R$ 61,950.00
```

---

### 4.7 ARR (Annual Recurring Revenue)

```typescript
// Fórmula
ARR = MRR * 12

// Exemplo
MRR = 61,950.00
ARR = 61950 * 12 = R$ 743,400.00
```

---

### 4.8 LTV (Lifetime Value)

```typescript
// Fórmula
LTV = ticketMedio * vidaMediaEmMeses

// Onde:
// vidaMediaEmMeses = 6 (estimativa baseada em análise de comportamento)

// Exemplo
ticketMedio = 52.50
vidaMediaEmMeses = 6
LTV = 52.50 * 6 = R$ 315.00
```

---

### 4.9 CAC (Customer Acquisition Cost)

```typescript
// Fórmula
CAC = custoTotalConversoes / conversoes

// Exemplo
custoTotalConversoes = 8,103.00   // Soma dos custos de anúncios/marketing
conversoes = 438
CAC = 8103 / 438 = R$ 18.50
```

---

### 4.10 ROAS (Return on Ad Spend)

```typescript
// Fórmula
ROAS = receitaTotal / custoTotalMarketing

// Onde:
// custoTotalMarketing = custoTotalConversoes + custoTotalRenovacoes

// Exemplo
receitaTotal = 69,825.00
custoTotalConversoes = 8,103.00
custoTotalRenovacoes = 8,550.00
custoTotalMarketing = 8103 + 8550 = 16,653.00
ROAS = 69825 / 16653 = 4.19

// Interpretação: Para cada R$ 1,00 investido, retornam R$ 4,19
```

---

### 4.11 Tempo Médio até Conversão

```typescript
// Fórmula: Mediana dos dias entre teste e conversão
// Algoritmo:

function calcularTempoMedioConversao(conversoes, testes) {
  const tempos = [];
  
  conversoes.forEach(conv => {
    const teste = testes.find(t => t.usuario === conv.usuario);
    
    if (teste) {
      const dataTeste = new Date(teste.criado_em);
      const dataConv = new Date(conv.data);
      const dias = (dataConv - dataTeste) / (1000 * 60 * 60 * 24);
      
      if (dias >= 0 && dias <= 365) {  // Filtrar valores absurdos
        tempos.push(dias);
      }
    }
  });
  
  // Calcular mediana
  tempos.sort((a, b) => a - b);
  const meio = Math.floor(tempos.length / 2);
  
  if (tempos.length % 2 === 0) {
    return (tempos[meio - 1] + tempos[meio]) / 2;
  } else {
    return tempos[meio];
  }
}

// Exemplo de resultado: 2.5 dias
```

---

### 4.12 Mapeamento Custo → Plano

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

// Exemplo de uso
custo = 75.00
plano = mapCustoToPlano(75)
// Retorna: { nome: "3 Meses", precoMedio: 75, meses: 3 }
```

---

### 4.13 Extração de DDD e UF do Telefone

```typescript
// Função de extração geográfica
function extractGeoFromPhone(usuario: string) {
  // Limpar caracteres não numéricos
  const digits = usuario.replace(/\D/g, '');
  
  // Extrair DDD (primeiros 2 dígitos após código país)
  let ddd = '';
  if (digits.length >= 11) {
    ddd = digits.substring(0, 2);  // Ex: "11" de "11987654321"
  }
  
  // Mapear DDD → UF
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
    '63': 'TO',
    '65': 'MT', '66': 'MT',
    '67': 'MS',
    '68': 'AC',
    '69': 'RO',
    '71': 'BA', '73': 'BA', '74': 'BA', '75': 'BA', '77': 'BA',
    '79': 'SE',
    '81': 'PE', '87': 'PE',
    '82': 'AL',
    '83': 'PB',
    '84': 'RN',
    '85': 'CE', '88': 'CE',
    '86': 'PI', '89': 'PI',
    '91': 'PA', '93': 'PA', '94': 'PA',
    '92': 'AM', '97': 'AM',
    '95': 'RR',
    '96': 'AP',
    '98': 'MA', '99': 'MA',
  };
  
  const uf = dddMap[ddd] || '';
  
  return { ddd, uf };
}

// Exemplo
usuario = "11987654321"
{ ddd: "11", uf: "SP" }
```

---

### 4.14 Classificação de Turnos

```typescript
// Função de classificação de turno
function getTurnoFromDate(date: Date): string {
  const hora = date.getHours();
  
  if (hora >= 6 && hora < 12) {
    return 'Manhã';
  } else if (hora >= 12 && hora < 18) {
    return 'Tarde';
  } else if (hora >= 18 && hora < 24) {
    return 'Noite';
  } else {
    return 'Madrugada';
  }
}

// Exemplo
date = new Date('2024-11-03T14:30:00')
turno = getTurnoFromDate(date)  // Retorna: "Tarde"
```

---

### 4.15 Heatmap Hora × Dia da Semana

```typescript
// Algoritmo de geração do heatmap
function gerarHeatmap(conversoes: any[]) {
  const heatmap: Record<string, Record<number, number>> = {};
  const dias = [
    'domingo', 'segunda-feira', 'terça-feira', 
    'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'
  ];
  
  // Processar conversões
  conversoes.forEach(conv => {
    const date = new Date(conv.data);
    const diaSemana = dias[date.getDay()];
    const hora = date.getHours();
    
    if (!heatmap[diaSemana]) {
      heatmap[diaSemana] = {};
    }
    
    heatmap[diaSemana][hora] = (heatmap[diaSemana][hora] || 0) + 1;
  });
  
  // Converter para array
  const resultado = [];
  dias.forEach(dia => {
    for (let hora = 0; hora < 24; hora++) {
      resultado.push({
        dia,
        hora,
        count: heatmap[dia]?.[hora] || 0
      });
    }
  });
  
  return resultado;
}

// Exemplo de saída:
[
  { dia: 'segunda-feira', hora: 0, count: 2 },
  { dia: 'segunda-feira', hora: 1, count: 0 },
  { dia: 'segunda-feira', hora: 14, count: 15 },
  { dia: 'segunda-feira', hora: 20, count: 28 },
  ...
]
```

---

### 4.16 Impacto de Jogos nas Conversões

```typescript
// Algoritmo de análise de impacto
function analisarImpactoJogos(conversoes: any[], jogos: any[]) {
  const periodoCounts = {
    'Antes': 0,      // 2h antes do jogo
    'Durante': 0,    // Durante o jogo (2h de duração)
    'Depois': 0      // 2h depois do jogo
  };
  
  conversoes.forEach(conv => {
    const dataConv = new Date(conv.data);
    
    jogos.forEach(jogo => {
      const dataJogo = new Date(`${jogo.data} ${jogo.horario}`);
      const diferencaHoras = (dataConv - dataJogo) / (1000 * 60 * 60);
      
      if (diferencaHoras >= -2 && diferencaHoras < 0) {
        periodoCounts['Antes']++;
      } else if (diferencaHoras >= 0 && diferencaHoras < 2) {
        periodoCounts['Durante']++;
      } else if (diferencaHoras >= 2 && diferencaHoras < 4) {
        periodoCounts['Depois']++;
      }
    });
  });
  
  const total = Object.values(periodoCounts).reduce((a, b) => a + b, 0);
  
  return Object.entries(periodoCounts).map(([periodo, count]) => ({
    periodo,
    count,
    percentual: total > 0 ? (count / total) * 100 : 0
  }));
}

// Exemplo de saída:
[
  { periodo: 'Antes', count: 12, percentual: 15.79 },
  { periodo: 'Durante', count: 52, percentual: 68.42 },
  { periodo: 'Depois', count: 12, percentual: 15.79 }
]
```

---

## 5. Autenticação e Segurança

### 5.1 JWT (JSON Web Token)

**Estrutura do Token:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": 1,
    "email": "admin@autonomyx.com.br",
    "role": "admin",
    "revenda_id": 123,
    "iat": 1699024800,
    "exp": 1699111200
  },
  "signature": "..."
}
```

**Validação no Backend:**
```typescript
// Middleware de autenticação
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token não fornecido'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }
}
```

---

### 5.2 Rate Limiting

**Limites por Endpoint:**
```
/auth/login          - 5 requisições / minuto
/dashboard/data      - 60 requisições / minuto
/testes              - 100 requisições / minuto
/conversoes          - 100 requisições / minuto
/tracking/evento     - 1000 requisições / minuto
```

**Implementação:**
```typescript
// Express Rate Limit
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minuto
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente em 1 minuto.'
});

app.post('/auth/login', loginLimiter, loginController);
```

---

### 5.3 CORS (Cross-Origin Resource Sharing)

**Configuração:**
```typescript
// Permitir apenas domínios autorizados
const corsOptions = {
  origin: [
    'https://dashboard.autonomyx.com.br',
    'https://autonomyx.com.br',
    'http://localhost:5173'  // Desenvolvimento
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

### 5.4 Validação de Dados

**Esquemas de Validação (Joi/Zod):**
```typescript
// Validação de criação de teste
const testeSchema = z.object({
  usuario: z.string().regex(/^\d{10,11}$/),  // 10-11 dígitos
  max_conexoes: z.number().min(1).max(4),
  revenda: z.string().min(3),
  revendedor: z.string().optional(),
  observacoes: z.string().max(500).optional()
});

// Uso
app.post('/testes', async (req, res) => {
  try {
    const validData = testeSchema.parse(req.body);
    // Processar...
  } catch (error) {
    return res.status(400).json({
      success: false,
      errors: error.errors
    });
  }
});
```

---

## 6. Integração com Jogos de Futebol

### 6.1 API de Futebol Recomendada

**Opções de APIs:**

1. **API-Football** (api-football.com)
   - Endpoint: `https://v3.football.api-sports.io/`
   - Plano Gratuito: 100 requisições/dia
   - Plano Pro: $30/mês - 3000 requisições/dia

2. **FootballData.org**
   - Endpoint: `https://api.football-data.org/v4/`
   - Plano Gratuito: 10 requisições/minuto
   - Dados: Brasileirão, Libertadores, Champions, etc

---

### 6.2 Buscar Jogos do Dia

**Endpoint Externo:** `GET https://v3.football.api-sports.io/fixtures`

**Query Parameters:**
```
?date=2024-11-03
&league=71           // ID do Brasileirão
&season=2024
```

**Request Headers:**
```
x-rapidapi-key: SEU_API_KEY_AQUI
x-rapidapi-host: v3.football.api-sports.io
```

**Response (Exemplo):**
```json
{
  "response": [
    {
      "fixture": {
        "id": 123456,
        "date": "2024-11-03T19:00:00-03:00",
        "venue": {
          "name": "Maracanã",
          "city": "Rio de Janeiro"
        },
        "status": {
          "long": "Not Started",
          "short": "NS"
        }
      },
      "league": {
        "id": 71,
        "name": "Serie A",
        "country": "Brazil",
        "logo": "https://media.api-sports.io/football/leagues/71.png",
        "round": "Regular Season - 32"
      },
      "teams": {
        "home": {
          "id": 127,
          "name": "Flamengo",
          "logo": "https://media.api-sports.io/football/teams/127.png"
        },
        "away": {
          "id": 131,
          "name": "Palmeiras",
          "logo": "https://media.api-sports.io/football/teams/131.png"
        }
      }
    }
  ]
}
```

---

### 6.3 Transformação de Dados

**Converter resposta da API para formato do Dashboard:**

```typescript
function transformarJogosAPI(apiResponse: any) {
  return apiResponse.response.map((item: any) => ({
    id: item.fixture.id,
    competicao: item.league.name,
    data: item.fixture.date.split('T')[0],
    horario: item.fixture.date.split('T')[1].substring(0, 5),
    time_casa: item.teams.home.name,
    brasao_casa: item.teams.home.logo,
    time_fora: item.teams.away.name,
    brasao_fora: item.teams.away.logo,
    estadio: item.fixture.venue.name,
    cidade: item.fixture.venue.city,
    canal: extrairCanal(item.league.name),  // Função customizada
    rodada: extrairRodada(item.league.round)
  }));
}

function extrairCanal(competicao: string): string {
  const canais: Record<string, string> = {
    'Serie A': 'Premiere',
    'Copa Libertadores': 'Paramount+',
    'Champions League': 'HBO Max',
    'Copa do Brasil': 'Prime Video'
  };
  return canais[competicao] || 'A definir';
}
```

---

### 6.4 Cache de Jogos

**Estratégia de Cache:**
```typescript
// Redis Cache
import Redis from 'ioredis';
const redis = new Redis();

async function buscarJogos(data: string) {
  const cacheKey = `jogos:${data}`;
  
  // Tentar buscar do cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Buscar da API
  const jogos = await fetchJogosAPI(data);
  
  // Salvar no cache (expira em 1 hora)
  await redis.setex(cacheKey, 3600, JSON.stringify(jogos));
  
  return jogos;
}
```

---

## 7. Processamento de Dados Geográficos

### 7.1 Tabela de Mapeamento DDD → Estado

**Estrutura SQL:**
```sql
CREATE TABLE ddds (
  ddd VARCHAR(2) PRIMARY KEY,
  uf VARCHAR(2) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  cidade_principal VARCHAR(100) NOT NULL,
  regiao VARCHAR(20) NOT NULL
);

-- Exemplos de dados
INSERT INTO ddds VALUES
('11', 'SP', 'São Paulo', 'São Paulo', 'Sudeste'),
('21', 'RJ', 'Rio de Janeiro', 'Rio de Janeiro', 'Sudeste'),
('85', 'CE', 'Ceará', 'Fortaleza', 'Nordeste'),
('47', 'SC', 'Santa Catarina', 'Joinville', 'Sul');
```

---

### 7.2 Análise Geográfica por Estado

**SQL Query:**
```sql
SELECT 
  d.uf,
  d.estado,
  COUNT(CASE WHEN c.tipo = 'teste' THEN 1 END) as testes,
  COUNT(CASE WHEN c.tipo = 'conversao' THEN 1 END) as conversoes,
  COUNT(CASE WHEN c.status = 'ativo' THEN 1 END) as ativos,
  COUNT(CASE WHEN c.status = 'expirado' THEN 1 END) as expirados,
  ROUND(
    COUNT(CASE WHEN c.tipo = 'conversao' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(CASE WHEN c.tipo = 'teste' THEN 1 END), 0), 
    2
  ) as taxa_conversao
FROM clientes c
JOIN ddds d ON SUBSTRING(c.usuario, 1, 2) = d.ddd
WHERE c.criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY d.uf, d.estado
ORDER BY conversoes DESC;
```

---

### 7.3 Coordenadas dos Estados (Para Mapa)

**JSON de Coordenadas:**
```json
{
  "SP": { "lat": -23.5505, "lng": -46.6333, "zoom": 7 },
  "RJ": { "lat": -22.9068, "lng": -43.1729, "zoom": 8 },
  "MG": { "lat": -19.9167, "lng": -43.9345, "zoom": 7 },
  "CE": { "lat": -3.7172, "lng": -38.5433, "zoom": 8 },
  "PR": { "lat": -25.4284, "lng": -49.2733, "zoom": 7 }
}
```

---

## 8. Webhooks e Eventos em Tempo Real

### 8.1 Webhook N8N - Pixel Tracking

**Fluxo de Integração:**
```
1. Usuário visita página → Pixel dispara evento
2. Frontend → POST /tracking/evento
3. Backend processa e envia para N8N
4. N8N executa workflows (notificações, análises, etc)
```

**Endpoint N8N:**
```
POST https://n8n.autonomyx.com.br/webhook/pixel-tracking
```

**Payload:**
```json
{
  "evento": "conversao_iniciada",
  "usuario": "11987654321",
  "plano_interesse": "3 Meses",
  "utm_source": "facebook",
  "utm_campaign": "black_friday",
  "timestamp": "2024-11-03T14:50:00Z",
  "metadata": {
    "pagina_origem": "/planos",
    "dispositivo": "mobile",
    "navegador": "Chrome"
  }
}
```

---

### 8.2 WebSockets para Atualizações em Tempo Real

**Conexão WebSocket:**
```typescript
// Cliente (Frontend)
const socket = new WebSocket('wss://api.autonomyx.com.br/ws');

socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'auth',
    token: localStorage.getItem('auth_token')
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'nova_conversao':
      // Atualizar dashboard em tempo real
      atualizarConversoes(data.payload);
      break;
    case 'novo_teste':
      atualizarTestes(data.payload);
      break;
  }
};
```

**Servidor (Backend):**
```typescript
// Socket.IO
io.on('connection', (socket) => {
  socket.on('auth', async (data) => {
    const user = await verifyToken(data.token);
    socket.join(`revenda_${user.revenda_id}`);
  });
});

// Emitir evento quando houver nova conversão
function notificarNovaConversao(conversao) {
  io.to(`revenda_${conversao.revenda_id}`).emit('nova_conversao', {
    type: 'nova_conversao',
    payload: conversao
  });
}
```

---

## 9. Estrutura de Banco de Dados

### 9.1 Diagrama ER (Entity-Relationship)

```
┌─────────────────┐
│    revendas     │
├─────────────────┤
│ id (PK)         │
│ nome            │
│ email           │
│ telefone        │
│ status          │
│ criado_em       │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│   usuarios      │
├─────────────────┤
│ id (PK)         │
│ revenda_id (FK) │
│ usuario         │
│ nome            │
│ email           │
│ criado_em       │
│ status          │
│ max_conexoes    │
│ expira_em       │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐         ┌─────────────────┐
│     testes      │         │   conversoes    │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ usuario_id (FK) │         │ usuario_id (FK) │
│ criado_em       │         │ data            │
│ status          │         │ custo           │
│ revendedor      │         │ creditos_antes  │
│ observacoes     │         │ creditos_apos   │
└─────────────────┘         │ plano           │
                           └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   renovacoes    │         │     jogos       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ usuario_id (FK) │         │ competicao      │
│ data            │         │ data            │
│ custo           │         │ horario         │
│ creditos_antes  │         │ time_casa       │
│ creditos_apos   │         │ time_fora       │
│ plano           │         │ estadio         │
│ numero_renovacao│         │ cidade          │
└─────────────────┘         │ canal           │
                           └─────────────────┘

┌─────────────────┐
│  conv_jogos     │
├─────────────────┤
│ id (PK)         │
│ conversao_id(FK)│
│ jogo_id (FK)    │
│ periodo         │
│ criado_em       │
└─────────────────┘
```

---

### 9.2 Schema SQL (PostgreSQL)

```sql
-- Tabela de Revendas
CREATE TABLE revendas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários/Clientes
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  revenda_id INTEGER REFERENCES revendas(id),
  usuario VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(255),
  email VARCHAR(255),
  ddd VARCHAR(2),
  uf VARCHAR(2),
  cidade VARCHAR(100),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_em TIMESTAMP,
  status VARCHAR(20) DEFAULT 'teste',
  max_conexoes INTEGER DEFAULT 1,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_usuarios_revenda ON usuarios(revenda_id);
CREATE INDEX idx_usuarios_status ON usuarios(status);
CREATE INDEX idx_usuarios_ddd ON usuarios(ddd);
CREATE INDEX idx_usuarios_uf ON usuarios(uf);

-- Tabela de Testes
CREATE TABLE testes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  revenda_id INTEGER REFERENCES revendas(id),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'teste',
  revendedor VARCHAR(255),
  observacoes TEXT
);

CREATE INDEX idx_testes_usuario ON testes(usuario_id);
CREATE INDEX idx_testes_revenda ON testes(revenda_id);
CREATE INDEX idx_testes_criado ON testes(criado_em);

-- Tabela de Conversões
CREATE TABLE conversoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  revenda_id INTEGER REFERENCES revendas(id),
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  custo DECIMAL(10, 2) NOT NULL,
  creditos_antes DECIMAL(10, 2) DEFAULT 0,
  creditos_apos DECIMAL(10, 2) DEFAULT 0,
  plano VARCHAR(50),
  observacoes TEXT
);

CREATE INDEX idx_conversoes_usuario ON conversoes(usuario_id);
CREATE INDEX idx_conversoes_revenda ON conversoes(revenda_id);
CREATE INDEX idx_conversoes_data ON conversoes(data);

-- Tabela de Renovações
CREATE TABLE renovacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  revenda_id INTEGER REFERENCES revendas(id),
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  custo DECIMAL(10, 2) NOT NULL,
  creditos_antes DECIMAL(10, 2) DEFAULT 0,
  creditos_apos DECIMAL(10, 2) DEFAULT 0,
  plano VARCHAR(50),
  numero_renovacao INTEGER DEFAULT 1,
  observacoes TEXT
);

CREATE INDEX idx_renovacoes_usuario ON renovacoes(usuario_id);
CREATE INDEX idx_renovacoes_revenda ON renovacoes(revenda_id);
CREATE INDEX idx_renovacoes_data ON renovacoes(data);

-- Tabela de Jogos
CREATE TABLE jogos (
  id SERIAL PRIMARY KEY,
  api_id INTEGER UNIQUE,
  competicao VARCHAR(255) NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  time_casa VARCHAR(255) NOT NULL,
  brasao_casa TEXT,
  time_fora VARCHAR(255) NOT NULL,
  brasao_fora TEXT,
  estadio VARCHAR(255),
  cidade VARCHAR(100),
  canal VARCHAR(100),
  rodada INTEGER,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jogos_data ON jogos(data);
CREATE INDEX idx_jogos_competicao ON jogos(competicao);

-- Tabela de Conversões x Jogos
CREATE TABLE conv_jogos (
  id SERIAL PRIMARY KEY,
  conversao_id INTEGER REFERENCES conversoes(id),
  jogo_id INTEGER REFERENCES jogos(id),
  periodo VARCHAR(20),  -- 'Antes', 'Durante', 'Depois'
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conv_jogos_conversao ON conv_jogos(conversao_id);
CREATE INDEX idx_conv_jogos_jogo ON conv_jogos(jogo_id);

-- Tabela de DDDs
CREATE TABLE ddds (
  ddd VARCHAR(2) PRIMARY KEY,
  uf VARCHAR(2) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  cidade_principal VARCHAR(100) NOT NULL,
  regiao VARCHAR(20) NOT NULL
);

-- Popular tabela de DDDs
INSERT INTO ddds VALUES
('11', 'SP', 'São Paulo', 'São Paulo', 'Sudeste'),
('12', 'SP', 'São Paulo', 'São José dos Campos', 'Sudeste'),
('13', 'SP', 'São Paulo', 'Santos', 'Sudeste'),
('14', 'SP', 'São Paulo', 'Bauru', 'Sudeste'),
('15', 'SP', 'São Paulo', 'Sorocaba', 'Sudeste'),
('16', 'SP', 'São Paulo', 'Ribeirão Preto', 'Sudeste'),
('17', 'SP', 'São Paulo', 'São José do Rio Preto', 'Sudeste'),
('18', 'SP', 'São Paulo', 'Presidente Prudente', 'Sudeste'),
('19', 'SP', 'São Paulo', 'Campinas', 'Sudeste'),
('21', 'RJ', 'Rio de Janeiro', 'Rio de Janeiro', 'Sudeste'),
('22', 'RJ', 'Rio de Janeiro', 'Campos dos Goytacazes', 'Sudeste'),
('24', 'RJ', 'Rio de Janeiro', 'Volta Redonda', 'Sudeste'),
('27', 'ES', 'Espírito Santo', 'Vitória', 'Sudeste'),
('28', 'ES', 'Espírito Santo', 'Cachoeiro de Itapemirim', 'Sudeste'),
('31', 'MG', 'Minas Gerais', 'Belo Horizonte', 'Sudeste'),
('32', 'MG', 'Minas Gerais', 'Juiz de Fora', 'Sudeste'),
('33', 'MG', 'Minas Gerais', 'Governador Valadares', 'Sudeste'),
('34', 'MG', 'Minas Gerais', 'Uberlândia', 'Sudeste'),
('35', 'MG', 'Minas Gerais', 'Poços de Caldas', 'Sudeste'),
('37', 'MG', 'Minas Gerais', 'Divinópolis', 'Sudeste'),
('38', 'MG', 'Minas Gerais', 'Montes Claros', 'Sudeste'),
('41', 'PR', 'Paraná', 'Curitiba', 'Sul'),
('42', 'PR', 'Paraná', 'Ponta Grossa', 'Sul'),
('43', 'PR', 'Paraná', 'Londrina', 'Sul'),
('44', 'PR', 'Paraná', 'Maringá', 'Sul'),
('45', 'PR', 'Paraná', 'Foz do Iguaçu', 'Sul'),
('46', 'PR', 'Paraná', 'Francisco Beltrão', 'Sul'),
('47', 'SC', 'Santa Catarina', 'Joinville', 'Sul'),
('48', 'SC', 'Santa Catarina', 'Florianópolis', 'Sul'),
('49', 'SC', 'Santa Catarina', 'Chapecó', 'Sul'),
('51', 'RS', 'Rio Grande do Sul', 'Porto Alegre', 'Sul'),
('53', 'RS', 'Rio Grande do Sul', 'Pelotas', 'Sul'),
('54', 'RS', 'Rio Grande do Sul', 'Caxias do Sul', 'Sul'),
('55', 'RS', 'Rio Grande do Sul', 'Santa Maria', 'Sul'),
('61', 'DF', 'Distrito Federal', 'Brasília', 'Centro-Oeste'),
('62', 'GO', 'Goiás', 'Goiânia', 'Centro-Oeste'),
('63', 'TO', 'Tocantins', 'Palmas', 'Norte'),
('64', 'GO', 'Goiás', 'Rio Verde', 'Centro-Oeste'),
('65', 'MT', 'Mato Grosso', 'Cuiabá', 'Centro-Oeste'),
('66', 'MT', 'Mato Grosso', 'Rondonópolis', 'Centro-Oeste'),
('67', 'MS', 'Mato Grosso do Sul', 'Campo Grande', 'Centro-Oeste'),
('68', 'AC', 'Acre', 'Rio Branco', 'Norte'),
('69', 'RO', 'Rondônia', 'Porto Velho', 'Norte'),
('71', 'BA', 'Bahia', 'Salvador', 'Nordeste'),
('73', 'BA', 'Bahia', 'Ilhéus', 'Nordeste'),
('74', 'BA', 'Bahia', 'Juazeiro', 'Nordeste'),
('75', 'BA', 'Bahia', 'Feira de Santana', 'Nordeste'),
('77', 'BA', 'Bahia', 'Barreiras', 'Nordeste'),
('79', 'SE', 'Sergipe', 'Aracaju', 'Nordeste'),
('81', 'PE', 'Pernambuco', 'Recife', 'Nordeste'),
('82', 'AL', 'Alagoas', 'Maceió', 'Nordeste'),
('83', 'PB', 'Paraíba', 'João Pessoa', 'Nordeste'),
('84', 'RN', 'Rio Grande do Norte', 'Natal', 'Nordeste'),
('85', 'CE', 'Ceará', 'Fortaleza', 'Nordeste'),
('86', 'PI', 'Piauí', 'Teresina', 'Nordeste'),
('87', 'PE', 'Pernambuco', 'Petrolina', 'Nordeste'),
('88', 'CE', 'Ceará', 'Juazeiro do Norte', 'Nordeste'),
('89', 'PI', 'Piauí', 'Picos', 'Nordeste'),
('91', 'PA', 'Pará', 'Belém', 'Norte'),
('92', 'AM', 'Amazonas', 'Manaus', 'Norte'),
('93', 'PA', 'Pará', 'Santarém', 'Norte'),
('94', 'PA', 'Pará', 'Marabá', 'Norte'),
('95', 'RR', 'Roraima', 'Boa Vista', 'Norte'),
('96', 'AP', 'Amapá', 'Macapá', 'Norte'),
('97', 'AM', 'Amazonas', 'Tefé', 'Norte'),
('98', 'MA', 'Maranhão', 'São Luís', 'Nordeste'),
('99', 'MA', 'Maranhão', 'Imperatriz', 'Nordeste');

-- Tabela de Eventos (Pixel Tracking)
CREATE TABLE eventos_tracking (
  id SERIAL PRIMARY KEY,
  evento VARCHAR(50) NOT NULL,
  usuario_id INTEGER REFERENCES usuarios(id),
  pagina VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  ip VARCHAR(45),
  user_agent TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eventos_usuario ON eventos_tracking(usuario_id);
CREATE INDEX idx_eventos_criado ON eventos_tracking(criado_em);
CREATE INDEX idx_eventos_utm_campaign ON eventos_tracking(utm_campaign);

-- Trigger para atualizar "atualizado_em"
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_revendas_modtime
  BEFORE UPDATE ON revendas
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_usuarios_modtime
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
```

---

## 10. Exemplos de Requisições e Respostas

### 10.1 Login de Administrador

**Request:**
```bash
curl -X POST https://api.autonomyx.com.br/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@autonomyx.com.br",
    "senha": "senha123",
    "tipo": "admin"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQGF1dG9ub215eC5jb20uYnIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTkwMjQ4MDAsImV4cCI6MTY5OTExMTIwMH0.ABC123",
  "user": {
    "id": 1,
    "nome": "Admin AutonomyX",
    "email": "admin@autonomyx.com.br",
    "role": "admin"
  },
  "expiresIn": 86400
}
```

---

### 10.2 Buscar Dados do Dashboard

**Request:**
```bash
curl -X GET "https://api.autonomyx.com.br/v1/dashboard/data?periodo=30d" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:** Ver seção 3.3

---

### 10.3 Criar Novo Teste

**Request:**
```bash
curl -X POST https://api.autonomyx.com.br/v1/testes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "11987654321",
    "max_conexoes": 1,
    "revenda": "AutonomyX",
    "revendedor": "João Silva"
  }'
```

**Response:**
```json
{
  "success": true,
  "teste": {
    "id": 1251,
    "usuario": "11987654321",
    "criado_em": "2024-11-03T14:30:00Z",
    "max_conexoes": 1,
    "status": "Teste",
    "ddd": "11",
    "uf": "SP"
  }
}
```

---

### 10.4 Registrar Conversão

**Request:**
```bash
curl -X POST https://api.autonomyx.com.br/v1/conversoes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "11987654321",
    "custo": 30.00,
    "creditos_antes": 0,
    "creditos_apos": 0,
    "revenda": "AutonomyX"
  }'
```

**Response:**
```json
{
  "success": true,
  "conversao": {
    "id": 439,
    "usuario": "11987654321",
    "data": "2024-11-03T14:35:00Z",
    "custo": 30.00,
    "plano": "1 Mês",
    "creditos_apos": 0
  },
  "metricas_atualizadas": {
    "total_conversoes": 439,
    "taxa_conversao": 35.12
  }
}
```

---

### 10.5 Buscar Jogos de Hoje

**Request:**
```bash
curl -X GET "https://api.autonomyx.com.br/v1/jogos?data=2024-11-03" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "success": true,
  "total": 8,
  "data": "2024-11-03",
  "jogos": [
    {
      "id": 1,
      "competicao": "Brasileirão Série A",
      "data": "2024-11-03",
      "horario": "16:00",
      "time_casa": "Flamengo",
      "brasao_casa": "https://cdn.autonomyx.com.br/times/flamengo.png",
      "time_fora": "Palmeiras",
      "brasao_fora": "https://cdn.autonomyx.com.br/times/palmeiras.png",
      "estadio": "Maracanã",
      "cidade": "Rio de Janeiro",
      "canal": "Premiere",
      "rodada": 32
    },
    {
      "id": 2,
      "competicao": "Brasileirão Série A",
      "data": "2024-11-03",
      "horario": "18:30",
      "time_casa": "Corinthians",
      "brasao_casa": "https://cdn.autonomyx.com.br/times/corinthians.png",
      "time_fora": "São Paulo",
      "brasao_fora": "https://cdn.autonomyx.com.br/times/sao-paulo.png",
      "estadio": "Neo Química Arena",
      "cidade": "São Paulo",
      "canal": "Premiere",
      "rodada": 32
    }
  ]
}
```

---

### 10.6 Análise Geográfica

**Request:**
```bash
curl -X GET https://api.autonomyx.com.br/v1/geografico/estados \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:** Ver seção 3.11

---

### 10.7 Evento de Pixel Tracking

**Request:**
```bash
curl -X POST https://api.autonomyx.com.br/v1/tracking/evento \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "page_view",
    "pagina": "/planos",
    "utm_source": "facebook",
    "utm_campaign": "black_friday_2024",
    "ip": "200.150.10.50"
  }'
```

**Response:**
```json
{
  "success": true,
  "evento_id": "evt_abc123",
  "processado": true,
  "webhook_n8n_enviado": true
}
```

---

## 📊 Resumo de Endpoints por Categoria

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token

### Dashboard
- `GET /dashboard/data` - Buscar todos os dados

### Testes
- `GET /testes` - Listar testes
- `POST /testes` - Criar teste
- `GET /testes/:id` - Buscar teste específico
- `PUT /testes/:id` - Atualizar teste
- `DELETE /testes/:id` - Excluir teste

### Conversões
- `GET /conversoes` - Listar conversões
- `POST /conversoes` - Registrar conversão
- `GET /conversoes/:id` - Buscar conversão específica

### Renovações
- `GET /renovacoes` - Listar renovações
- `POST /renovacoes` - Registrar renovação
- `GET /renovacoes/:id` - Buscar renovação específica

### Clientes
- `GET /clientes/ativos` - Listar clientes ativos
- `GET /clientes/expirados` - Listar clientes expirados
- `GET /clientes/:id` - Buscar cliente específico
- `PUT /clientes/:id` - Atualizar cliente

### Jogos
- `GET /jogos` - Listar jogos
- `GET /jogos/impacto` - Análise de impacto

### Geográfico
- `GET /geografico/estados` - Análise por estado
- `GET /geografico/ddds` - Top DDDs

### Revendedores
- `GET /revendedores/top` - Top parceiros

### Relatórios
- `GET /relatorios/exportar` - Exportar relatório

### Tracking
- `POST /tracking/evento` - Registrar evento de pixel

---

## 🔒 Segurança e Boas Práticas

### Checklist de Segurança

- [x] Autenticação via JWT com expiração
- [x] Rate limiting em todos os endpoints
- [x] Validação de dados com schemas
- [x] CORS configurado para domínios específicos
- [x] HTTPS obrigatório em produção
- [x] SQL Injection protegido (queries parametrizadas)
- [x] XSS protegido (sanitização de inputs)
- [x] Logs de auditoria para ações críticas
- [x] Backup automático do banco de dados
- [x] Variáveis de ambiente para secrets

### Variáveis de Ambiente (.env)

```bash
# API
NODE_ENV=production
PORT=3000
API_URL=https://api.autonomyx.com.br

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/autonomyx_db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# JWT
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
JWT_EXPIRES_IN=24h

# API de Futebol
FOOTBALL_API_KEY=sua_api_key_aqui
FOOTBALL_API_URL=https://v3.football.api-sports.io

# N8N Webhook
N8N_WEBHOOK_URL=https://n8n.autonomyx.com.br/webhook/pixel-tracking
N8N_API_KEY=sua_n8n_api_key

# Redis (Cache)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=sua_senha_redis

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

---

## 📈 Performance e Otimização

### Recomendações

1. **Indexação de Banco de Dados**
   - Índices em colunas de busca frequente (usuario, data, revenda_id)
   - Índices compostos para queries complexas

2. **Cache com Redis**
   - Cache de jogos (1 hora)
   - Cache de dados de dashboard (5 minutos)
   - Cache de análises geográficas (1 hora)

3. **Paginação**
   - Limite máximo de 100 registros por página
   - Cursor-based pagination para grandes volumes

4. **Compressão**
   - Gzip para respostas HTTP
   - Minificação de JSON

5. **CDN**
   - Servir imagens de brasões via CDN
   - Cache de assets estáticos

---

## 🚀 Deploy e CI/CD

### Checklist de Deploy

- [ ] Testes unitários passando (>90% coverage)
- [ ] Testes de integração passando
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] SSL/TLS configurado
- [ ] Monitoramento ativado (Sentry, DataDog)
- [ ] Backup automático configurado
- [ ] Logs centralizados (ELK Stack)

---

## 📞 Suporte e Contato

**Equipe AutonomyX**
- Email Técnico: dev@autonomyx.com.br
- Suporte: suporte@autonomyx.com.br
- Documentação: https://docs.autonomyx.com.br

---

## 📝 Changelog da API

### v1.0.0 (2024-11-03)
- ✅ Endpoints de autenticação
- ✅ CRUD completo de testes, conversões e renovações
- ✅ Integração com API de jogos
- ✅ Análise geográfica completa
- ✅ Webhook de pixel tracking
- ✅ Sistema de cache com Redis

---

**FIM DA DOCUMENTAÇÃO TÉCNICA**

*Este documento deve ser atualizado sempre que houver mudanças na API ou nos cálculos.*

**Gerado em:** 03/11/2024  
**Versão do Dashboard:** 1.0.0  
**Autor:** Equipe de Desenvolvimento AutonomyX
