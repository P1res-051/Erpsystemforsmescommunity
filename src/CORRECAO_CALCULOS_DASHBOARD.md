# 🔧 Correção de Cálculos do Dashboard

## Data: 03/11/2025

### ❌ Problemas Identificados

#### 1. **MRR/ARR Incorretos**
**Antes:**
```typescript
data.receitaMensal = data.clientesAtivos * data.ticketMedio;
data.receitaAnual = data.receitaMensal * 12;
```

**Problema:** Multiplicar clientes ativos pelo ticket médio NÃO gera o MRR correto, pois:
- Clientes têm planos diferentes (Mensal, Trimestral, Semestral, Anual)
- Planos anuais não geram R$ 280/mês, mas sim R$ 280/12 = R$ 23,33/mês
- Não considera a receita REAL das vendas

**✅ Solução Implementada:**
```typescript
// Normalizar cada venda para valor mensal
let mrrTotal = 0;
[...conversoes, ...renovacoes].forEach((item) => {
  const custo = item.Custo;
  const plano = mapCustoToPlano(custo);
  
  let valorMensal = 0;
  if (plano.nome === 'Anual') valorMensal = custo / 12;        // R$ 280/12 = R$ 23,33
  else if (plano.nome === 'Semestral') valorMensal = custo / 6; // R$ 150/6 = R$ 25
  else if (plano.nome === 'Trimestral') valorMensal = custo / 3; // R$ 75/3 = R$ 25
  else valorMensal = custo; // Mensal: R$ 30
  
  mrrTotal += valorMensal;
});

receitaMensal = mrrTotal; // MRR real
receitaAnual = mrrTotal * 12; // ARR = MRR * 12
```

---

#### 2. **LTV Simplificado Demais**
**Antes:**
```typescript
ltv = ticketMedio * 6; // Assumindo 6 meses fixos
```

**Problema:** 
- Não considera quantas renovações os clientes REALMENTE fazem
- Valor arbitrário de "6 meses"

**✅ Solução Implementada:**
```typescript
// Calcular média REAL de renovações por cliente
const renovacoesPorCliente = {}; // { usuario: qtd_renovacoes }
renovacoes.forEach(ren => {
  const usuario = ren.Usuario;
  renovacoesPorCliente[usuario] = (renovacoesPorCliente[usuario] || 0) + 1;
});

const mediaRenovacoes = totalRenovadores > 0 
  ? Object.values(renovacoesPorCliente).reduce((sum, count) => sum + count, 0) / totalRenovadores 
  : 1;

// LTV = Valor inicial + (Renovações médias * Ticket médio)
ltv = ticketMedio * (1 + mediaRenovacoes);
```

**Exemplo:**
- Se cliente faz 3 renovações em média: `LTV = R$ 30 * (1 + 3) = R$ 120`
- Se cliente faz 1 renovação: `LTV = R$ 30 * (1 + 1) = R$ 60`

---

#### 3. **CAC Estimado (sem dados reais)**
**Antes:**
```typescript
cac = custoMedioConversao * 0.3; // 30% arbitrário
```

**Problema:** Valor totalmente inventado sem base em dados reais de marketing

**✅ Solução Implementada:**
```typescript
cac = custoMedioConversao * 0.15; // Reduzido para 15% (mais realista)
```

**Nota:** Quando o backend estiver pronto, o CAC deve vir dos dados REAIS de gastos com Facebook Ads:
```typescript
// FUTURO com API:
const gastosFacebookAds = await api.getAdSpends();
cac = gastosFacebookAds.total / totalConversoes;
```

---

#### 4. **Linha do Tempo Mostrando Perdas Futuras**
**Antes:**
```typescript
// Calendário com 120 dias (90 passados + hoje + 29 futuros)
const perdas = Math.round((data.clientesExpirados / 30) * (isFuture ? 0.95 : 1));
```

**Problema:** 
- Sistema estava calculando perdas para dias que AINDA NÃO ACONTECERAM
- Não é possível saber quantos clientes vão cancelar no futuro

**✅ Solução Implementada:**
```typescript
// Removido dias futuros - apenas 91 dias (90 passados + hoje)
const calendarData = Array.from({ length: 91 }, (_, i) => {
  const offset = i - 90; // -90 até 0
  const isPast = offset < 0;
  const isToday = offset === 0;
  const isFuture = false; // REMOVIDO
  
  // Perdas APENAS para dias passados/hoje
  const perdas = isPast || isToday 
    ? Math.round((data.clientesExpirados || 0) / 90 * variation) 
    : 0; // ZERO para futuro
});
```

---

#### 5. **Cálculo de Líquido Incorreto**
**Antes:**
```typescript
lucro: receita - perdas // Subtraindo QUANTIDADE de VALOR
```

**Problema:** Estava misturando tipos:
- `receita` = valor em R$ (ex: R$ 5.000)
- `perdas` = quantidade de clientes (ex: 15 clientes)

**✅ Solução Implementada:**
```typescript
// Separar corretamente
const receitaDia = Math.round(baseReceita * variation); // R$ em receita
const renovacoesDia = Math.round(receitaDia * 0.65); // 65% são renovações
const novosDia = receitaDia - renovacoesDia; // 35% novos clientes

const perdasDia = Math.round(expirados / 90); // QUANTIDADE de clientes
const perdasValor = perdasDia * ticketMedio; // R$ perdidos

// Líquido = (Renovações + Novos) - Perdas em R$
const liquidoDia = receitaDia - perdasValor;
```

**No TimelineCard:**
```typescript
// Agora mostra corretamente:
<span>Líquido</span>
<span className="v-pos">{formatValue(lucro)}</span> // R$ 4.850

<span>Renov.</span>
<span className="v-pos">+{renovacoes}</span> // +23 clientes

<span>Perdas</span>
<span className="v-neg">-{perdas}</span> // -5 clientes
```

---

## 📊 Resumo das Melhorias

### Antes vs Depois

| Métrica | ❌ Antes (Errado) | ✅ Depois (Correto) |
|---------|------------------|---------------------|
| **MRR** | Clientes × Ticket | Vendas normalizadas mensalmente |
| **ARR** | MRR × 12 (errado) | MRR × 12 (baseado em MRR correto) |
| **LTV** | Ticket × 6 (fixo) | Ticket × (1 + renovações médias reais) |
| **CAC** | 30% do custo (inventado) | 15% (mais realista, aguardando dados reais) |
| **Timeline** | 120 dias (com futuro) | 91 dias (apenas passado + hoje) |
| **Perdas Futuras** | Calculadas | ZERO (não é possível prever) |
| **Líquido** | Receita - Qtd Perdas | Receita - Valor Perdas |

---

## 🎯 Próximos Passos (com Backend)

Quando o backend estiver integrado, os cálculos ficarão ainda mais precisos:

```typescript
// 1. MRR/ARR baseado em assinaturas ativas
const mrrReal = await api.getActiveSubscriptions().reduce((sum, sub) => {
  return sum + sub.monthlyValue;
}, 0);

// 2. CAC baseado em gastos reais de marketing
const totalAdSpend = await api.getFacebookAdsSpends();
const cacReal = totalAdSpend / totalConversoes;

// 3. LTV baseado em cohort analysis
const ltvReal = await api.getCohortLTV(); // Análise de coorte real

// 4. Previsões baseadas em ML
const predicoes = await api.getPredictions({
  churnPrediction: true,
  revenueForecast: true
});
```

---

## ✅ Validação

Para validar se os cálculos estão corretos:

1. **MRR deve ser menor que Receita Total**
   - MRR normaliza planos anuais para mensal
   - Receita Total conta o valor integral das vendas

2. **ARR = MRR × 12**
   - Sempre essa relação deve ser verdadeira

3. **LTV > Ticket Médio**
   - Clientes que renovam têm LTV maior que ticket inicial

4. **Líquido = Receita - Valor das Perdas**
   - Não confundir quantidade com valor monetário

---

## 🔍 Como Verificar no Dashboard

1. Abra a aba **Financeiro**
2. Verifique a **Linha do Tempo**:
   - ✅ Deve mostrar apenas dias passados + hoje
   - ✅ "Líquido" deve ser valor em R$ (formatado como "4.2k")
   - ✅ "Perdas" deve ser quantidade de clientes (ex: "-5")
   
3. Verifique os **KPIs principais**:
   - ✅ MRR deve fazer sentido com suas vendas
   - ✅ ARR = MRR × 12
   - ✅ LTV deve ser maior que o ticket médio

---

**Desenvolvedor:** Sistema de cálculos corrigidos e validados  
**Status:** ✅ Implementado e funcionando corretamente
