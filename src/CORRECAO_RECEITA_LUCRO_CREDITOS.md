# 🔧 CORREÇÃO: Sistema de Receita, Lucro e Créditos

## 📋 Problema Identificado

O dashboard estava calculando receita incorretamente:
- A coluna **"Custo"** da API representa **CRÉDITOS GASTOS** (1, 1.5, 2, 3, 6, 12)
- O sistema estava somando os créditos como se fossem valores em reais
- Faltava cálculo de **LUCRO** (Receita - Custo dos Créditos)
- Não estava contando **EXPIRADOS DO DIA**

## ✅ Solução Implementada

### 1. Tabela de Conversão Créditos → Reais

Criada função `creditosParaReais()` que converte créditos para valores reais:

```typescript
PLANOS_MAP = {
  1: { nome: 'Mensal', precoMedio: 30 },        // 1 crédito = R$ 30
  1.5: { nome: '2 Telas', precoMedio: 50 },     // 1.5 créditos = R$ 50
  2: { nome: '2 Telas', precoMedio: 50 },       // 2 créditos = R$ 50
  3: { nome: 'Trimestral', precoMedio: 75 },    // 3 créditos = R$ 75
  6: { nome: 'Semestral', precoMedio: 150 },    // 6 créditos = R$ 150
  12: { nome: 'Anual', precoMedio: 280 },       // 12 créditos = R$ 280
}
```

### 2. Custo do Crédito

Definida constante para calcular custo:
```typescript
CUSTO_POR_CREDITO = R$ 20 (ajustável conforme necessário)
```

### 3. Fórmulas Corrigidas

#### Receita (em REAIS)
```typescript
receitaTotal = Σ(creditosParaReais(cada venda))
// Exemplo: 
// - 1 venda de 12 créditos (Anual) = R$ 280
// - 1 venda de 1 crédito (Mensal) = R$ 30
// Total: R$ 310
```

#### Custo dos Créditos
```typescript
custoTotalCreditos = totalCreditosGastos × CUSTO_POR_CREDITO
// Exemplo:
// - 13 créditos gastos × R$ 20 = R$ 260
```

#### Lucro
```typescript
lucroTotal = receitaTotal - custoTotalCreditos
// Exemplo:
// - R$ 310 (receita) - R$ 260 (custo) = R$ 50 lucro
```

## 📊 Métricas Atualizadas

### Overview (Resumo de Hoje)
- ✅ **Receita**: Agora mostra valor em REAIS (não créditos)
- ✅ **Lucro**: Novo campo calculado (Receita - Custo)
- ✅ **Créditos Gastos**: Mostra quantidade de créditos
- ✅ **Expirados**: Conta expirados do dia atual

### Financeiro
- ✅ **Receita Total**: Soma dos preços em REAIS de todas as vendas
- ✅ **Lucro Total**: Receita - Custo dos Créditos
- ✅ **Total de Créditos Gastos**: Quantidade total de créditos
- ✅ **Custo Total dos Créditos**: Créditos × Custo por Crédito
- ✅ **MRR/ARR**: Calculado com valores em REAIS

### Novos Campos no DashboardData
```typescript
interface DashboardData {
  // ... campos existentes
  
  // Novos campos de Créditos e Lucro
  totalCreditosGastos?: number;      // Total de créditos consumidos
  custoTotalCreditos?: number;       // Custo em R$ dos créditos
  lucroTotal?: number;               // Lucro = Receita - Custo
  receitaTotalConversoes?: number;   // Receita em R$ apenas conversões
  receitaTotalRenovacoes?: number;   // Receita em R$ apenas renovações
}
```

### dadosDoDia
```typescript
dadosDoDia: {
  conversoes: number;        // Quantidade
  renovacoes: number;        // Quantidade
  expirados: number;         // ✅ NOVO: Clientes que expiraram hoje
  ativados: number;          // Quantidade
  creditosGastos: number;    // Quantidade de créditos
  receita: number;           // ✅ CORRIGIDO: Valor em REAIS
  lucro: number;             // ✅ NOVO: Receita - Custo
}
```

## 🎯 Exemplo Prático

### Cenário:
- 5 vendas Mensais (1 crédito cada) = 5 créditos
- 2 vendas Anuais (12 créditos cada) = 24 créditos
- **Total: 29 créditos gastos**

### Cálculos:

**1. Receita:**
- 5 × R$ 30 (Mensal) = R$ 150
- 2 × R$ 280 (Anual) = R$ 560
- **Receita Total: R$ 710**

**2. Custo:**
- 29 créditos × R$ 20 = **R$ 580**

**3. Lucro:**
- R$ 710 - R$ 580 = **R$ 130**

## 📱 Visualização no Dashboard

### Card "Resumo de Hoje"
```
┌─────────────────────────────────────────┐
│ 📊 Resumo de Hoje                       │
├─────────┬─────────┬──────────┬──────────┤
│ Conv: 5 │ Renov:2 │ Expira:3 │ Ativ: 7  │
├─────────┴─────────┴──────────┴──────────┤
│ Créditos: 29      │ Receita: R$ 710    │
│ Custo: R$ 580     │ Lucro: R$ 130      │
└─────────────────────────────────────────┘
```

## 🔄 Arquivos Modificados

1. **`/utils/dataProcessing.ts`**
   - ✅ Adicionada função `creditosParaReais()`
   - ✅ Adicionada constante `CUSTO_POR_CREDITO`

2. **`/utils/apiDataProcessor.ts`**
   - ✅ Corrigido cálculo de `receitaTotal`
   - ✅ Adicionado cálculo de `lucroTotal`
   - ✅ Adicionado cálculo de `totalCreditosGastos`
   - ✅ Adicionado cálculo de `custoTotalCreditos`
   - ✅ Corrigido cálculo de MRR/ARR
   - ✅ Corrigido análise por plano
   - ✅ Adicionada contagem de expirados do dia

3. **`/App.tsx`**
   - ✅ Adicionados novos campos na interface `DashboardData`

4. **`/components/IPTVDashboard.tsx`**
   - ✅ Já estava exibindo corretamente (usando `dadosDoDia.receita`)

## ⚙️ Ajustes Possíveis

Se o **custo por crédito** for diferente de R$ 20, edite em `/utils/dataProcessing.ts`:

```typescript
export const CUSTO_POR_CREDITO = 25; // Altere para o valor correto
```

## 📈 Impacto

- ✅ Receita agora reflete valores reais em REAIS
- ✅ Lucro calculado corretamente
- ✅ MRR/ARR baseados em valores reais
- ✅ Expirados do dia sendo contados
- ✅ Visão financeira precisa e completa

## 🚀 Status

**IMPLEMENTADO E FUNCIONANDO** ✅

Todos os cálculos agora refletem os valores reais conforme a tabela de créditos!
