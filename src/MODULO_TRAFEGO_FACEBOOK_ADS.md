# 📱 Módulo Tráfego Pago - Facebook Ads

## 🎯 Visão Geral

Módulo completo para gestão de investimento em tráfego pago via Facebook Ads, com calendário interativo para registro de gastos diários e cálculos automáticos de métricas comerciais (ROI, CPL, conversões).

---

## 📦 Componentes Criados

### **1. FacebookAdsCalendar.tsx**
Calendário mensal interativo para registro de investimento diário.

**Funcionalidades:**
- ✅ Grade 7x5 (semanas x dias)
- ✅ Navegação entre meses (← Anterior | Próximo →)
- ✅ Clique em qualquer dia abre modal de edição
- ✅ Persistência automática em `localStorage`
- ✅ Tooltip rico ao passar mouse sobre dia
- ✅ Visual diferenciado para dia atual
- ✅ Heatmap de intensidade (dias com/sem gasto)
- ✅ Resumo do mês com 4 KPIs

**Props:**
```typescript
interface Props {
  data: any; // dados do dashboard
  onSpendUpdate?: (spends: DaySpend) => void;
}
```

---

### **2. TrafficAnalytics.tsx**
Gráficos e insights automáticos sobre performance do tráfego pago.

**Funcionalidades:**
- ✅ Gráfico de linha: Evolução de 30 dias (Gasto, Receita Tráfego, Receita Base)
- ✅ Gráfico de pizza: Distribuição Tráfego vs Base
- ✅ Gráfico de barras: ROI e CPL dos últimos 7 dias com gasto
- ✅ Sistema de insights automáticos baseados em thresholds
- ✅ Cards de alerta (positivo/negativo)

**Props:**
```typescript
interface Props {
  spends: { [date: string]: number };
  data: any;
}
```

---

## 🗓️ Calendário de Custos Diários

### **Layout:**

```
┌─────────────────────────────────────────────┐
│  ← Outubro 2025 →                           │
├─────────────────────────────────────────────┤
│ Dom  Seg  Ter  Qua  Qui  Sex  Sáb          │
├─────────────────────────────────────────────┤
│                  1    2    3    4    5     │
│  6    7    8    9   10   11   12           │
│ 13   14   15   16   17   18   19           │
│ 20   21   22   23   24   25   26           │
│ 27   28   29   30   31                     │
└─────────────────────────────────────────────┘
```

### **Célula do Dia:**

```
┌──────────┐
│    12    │  ← Número do dia
│ R$ 120   │  ← Valor gasto
│ ROI: 3.2x│  ← ROI calculado
└──────────┘
```

**Estados visuais:**
- 🟦 **Hoje**: Border azul ciano `#00BFFF`
- 🟩 **Com investimento**: Background verde `#00d18f15`
- ⬛ **Sem investimento**: Background padrão `#0b0f19`
- 🎯 **Hover**: Elevation + tooltip detalhado

---

## 💾 Persistência de Dados

### **Estrutura JSON (localStorage):**

```json
{
  "2025-10-01": 120.50,
  "2025-10-02": 90.00,
  "2025-10-03": 150.75,
  "2025-10-12": 0
}
```

**Key:** `facebook_ads_spends`  
**Formato de data:** `YYYY-MM-DD` (ISO 8601)

### **Operações:**

```typescript
// Salvar
localStorage.setItem('facebook_ads_spends', JSON.stringify(spends));

// Carregar
const saved = localStorage.getItem('facebook_ads_spends');
const spends = JSON.parse(saved);

// Atualizar
setSpends({ ...spends, [dateKey]: newValue });
```

---

## 📊 Cálculos e Métricas

### **1. Estatísticas por Dia:**

```typescript
interface DayStats {
  gasto: number;        // Valor investido
  conversoes: number;   // Novas vendas do tráfego
  renovacoes: number;   // Vendas da base (separado)
  creditos: number;     // Custo operacional (15% do gasto)
  receita: number;      // conversoes * ticketMedio
  roi: number;          // receita / gasto
}
```

**Fórmulas atuais (simuladas):**

```typescript
const conversoes = gasto > 0 ? Math.floor(gasto / 30) + Math.floor(Math.random() * 3) : 0;
const renovacoes = Math.floor(Math.random() * 5);
const creditos = gasto * 0.15;
const ticketMedio = 30;
const receita = conversoes * ticketMedio;
const roi = gasto > 0 ? receita / gasto : 0;
```

> **⚠️ IMPORTANTE:** Substitua os cálculos simulados pelos dados reais do seu sistema!

---

### **2. Resumo Mensal:**

| Métrica | Fórmula | Descrição |
|---------|---------|-----------|
| **Total Gasto** | `Σ gasto_dia` | Soma de todos os dias do mês |
| **Total Conversões** | `Σ conversoes_dia` | Novas vendas do tráfego |
| **Total Renovações** | `Σ renovacoes_dia` | Vendas da base (separado) |
| **Receita Total** | `Σ receita_dia` | Receita gerada pelo tráfego |
| **ROI Médio** | `total_receita / total_gasto` | Retorno sobre investimento |
| **CPL** | `total_gasto / total_conversoes` | Custo por lead/venda |
| **Mix Tráfego** | `(conversoes / (conversoes + renovacoes)) * 100` | % de novas vendas |
| **Dias Ativos** | `count(gasto > 0)` | Dias com investimento |

---

### **3. KPIs no Resumo:**

```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│  💰 Gasto Total  │  📈 Conversões   │  💹 ROI Médio    │  📊 CPL         │
│                  │                  │                  │                  │
│  R$ 3.450,00     │      42          │     3.2x         │  R$ 82,14       │
│  12 dias ativos  │  58.3% do total  │  ✅ Excelente    │  Custo por lead │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**Cores por threshold:**

- **ROI ≥ 2.0x**: Verde `#00d18f` → ✅ Excelente
- **ROI 1.0x - 2.0x**: Amarelo `#ffb64d` → ⚠️ Regular
- **ROI < 1.0x**: Vermelho `#ff4f6b` → 🚨 Baixo

---

## 🪟 Modal de Edição

### **Componentes:**

```
┌──────────────────────────────────────────┐
│  💰 Investimento em Tráfego Pago        │
├──────────────────────────────────────────┤
│                                          │
│  📅 Data: 2025-10-12                    │
│                                          │
│  Valor gasto no Facebook Ads (R$)       │
│  ┌────────────────────────────────────┐ │
│  │ 120.50                             │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 📋 Copiar do dia anterior          │ │
│  └────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤
│               [Cancelar]  [Salvar]       │
└──────────────────────────────────────────┘
```

### **Funcionalidades:**

1. **Input numérico** com step 0.01 (centavos)
2. **Botão "Copiar do dia anterior"** - automaticamente preenche com valor do dia anterior
3. **Validação** - aceita apenas números positivos
4. **Auto-save** ao clicar "Salvar"
5. **ESC** fecha o modal

---

## 📈 Gráficos de Análise

### **1. Linha Temporal (30 dias):**

```
Gasto Facebook  ──── (azul #0090ff)
Receita Tráfego ──── (verde #00d18f)
Receita Base    ──── (laranja #ffb64d)
```

**Eixos:**
- **X**: Datas (1/10, 2/10, 3/10...)
- **Y**: Valores em R$

**Tooltip:**
```
📅 12/10
━━━━━━━━━━━━━━━
Gasto Facebook: R$ 120,00
Receita Tráfego: R$ 360,00
Receita Base: R$ 150,00
```

---

### **2. Pizza: Distribuição Tráfego vs Base:**

```
          🟩 Tráfego Pago: 58.3%
          🟧 Base Recorrente: 41.7%
```

**Legenda:**
```
Mix: 58.3% Tráfego | 41.7% Base
```

---

### **3. Barras: ROI e CPL (últimos 7 dias com gasto):**

```
        ROI (3.2x, 2.8x, 4.1x...)  ■ verde claro
        CPL (R$ 82, R$ 95...)      ■ vermelho
```

**Tooltip:**
```
📅 12/10
━━━━━━━━━━━━━━━
ROI: 3.20x
CPL: R$ 82,14
```

---

## 💡 Sistema de Insights Automáticos

### **Regras de Gatilhos:**

#### **1. ROI Crescente** (Positivo 📈)
```typescript
if (avgRoiLastWeek > avgRoiPrevWeek && avgRoiLastWeek > 0) {
  "📈 Seu ROI no tráfego cresceu 12.5% nesta semana."
}
```

#### **2. Gasto Acima da Média** (Alerta ⚠️)
```typescript
if (avgGastoLast3 > avgGasto * 1.5 && avgGasto > 0) {
  "⚠️ Gasto acima da média nos últimos 3 dias. Monitore o ROI."
}
```

#### **3. Dias Sem Conversão** (Alerta 🚫)
```typescript
if (daysWithoutConversion >= 2) {
  "🚫 Investimento sem conversões em 2 dias consecutivos."
}
```

#### **4. Tráfego Superou Base** (Positivo ✅)
```typescript
if (totalConvRecent > totalRenovRecent && totalConvRecent > 0) {
  "✅ Conversões do tráfego superaram renovações da base!"
}
```

#### **5. ROI Excelente** (Positivo 🎯)
```typescript
if (avgRoiLastWeek >= 3) {
  "🎯 ROI excelente de 3.2x! Continue investindo nessa estratégia."
}
```

---

### **Layout dos Insights:**

```
┌────────────────────────────────────────┐
│ 📈  Ótimo desempenho!                  │
│                                        │
│ Seu ROI no tráfego cresceu 12.5%      │
│ nesta semana.                          │
└────────────────────────────────────────┘
  └─ Background: gradient verde #00d18f15

┌────────────────────────────────────────┐
│ ⚠️  Atenção necessária                 │
│                                        │
│ Gasto acima da média nos últimos 3     │
│ dias. Monitore o ROI.                  │
└────────────────────────────────────────┘
  └─ Background: gradient vermelho #ff4f6b15
```

---

## 🎨 Paleta de Cores AutonomyX

```typescript
const COLORS = {
  gasto: '#0090ff',           // Azul - Investimento
  receitaTrafego: '#00d18f',  // Verde - Receita tráfego
  receitaBase: '#ffb64d',     // Laranja - Receita base
  roi: '#00ffa3',             // Verde claro - ROI
  cpl: '#ff4f6b',             // Rosa - CPL (custo)
  creditos: '#8ea9d9'         // Azul cinza - Créditos
};
```

### **Cards:**
```css
background: linear-gradient(to bottom right, #10182b, #0b0f19)
border: 1px solid #1e2a44
box-shadow: 0 8px 30px rgba(0,0,0,0.5)
```

### **Textos:**
- **Título principal**: `#EAF2FF` (branco gelo)
- **Texto secundário**: `#8ea9d9` (azul acinzentado)
- **Valores destaque**: Cores do COLORS object

---

## 🔌 Integração com FinancialView

### **Import:**
```typescript
import { FacebookAdsCalendar } from './FacebookAdsCalendar';
import { TrafficAnalytics } from './TrafficAnalytics';
```

### **Estado:**
```typescript
const [facebookSpends, setFacebookSpends] = useState<{ [date: string]: number }>({});
```

### **Renderização:**
```typescript
{activeSection === 'trafego-custos' && (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <h2 className="text-[#EAF2FF]">Tráfego Pago - Facebook Ads</h2>
      <p className="text-[#8ea9d9]">
        Gerencie investimento diário, acompanhe conversões e calcule ROI automaticamente
      </p>
    </div>

    {/* Calendário */}
    <FacebookAdsCalendar 
      data={data}
      onSpendUpdate={(spends) => setFacebookSpends(spends)}
    />

    {/* Analytics */}
    <TrafficAnalytics 
      spends={facebookSpends}
      data={data}
    />
  </div>
)}
```

---

## 📱 Responsividade

### **Desktop (lg+):**
- Calendário: 7 colunas (semana completa)
- KPIs resumo: 4 colunas
- Gráficos: 2 colunas lado a lado

### **Tablet (md):**
- Calendário: 7 colunas
- KPIs resumo: 2 colunas
- Gráficos: 1 coluna (empilhados)

### **Mobile (sm):**
- Calendário: 7 colunas (compacto)
- KPIs resumo: 1 coluna
- Gráficos: 1 coluna

---

## 🔧 Próximos Passos - Integração Real

### **1. Substituir Dados Simulados:**

**Atual (simulado):**
```typescript
const conversoes = gasto > 0 ? Math.floor(gasto / 30) + Math.floor(Math.random() * 3) : 0;
```

**Real (integrado):**
```typescript
// Filtrar conversões do dia específico vindas de "tráfego"
const conversoes = data.conversoes.filter(c => 
  c.data === dateKey && c.origem === 'trafego'
).length;
```

---

### **2. Integrar com Logs de Conversão:**

```typescript
interface Conversao {
  id: string;
  data: string; // "2025-10-12"
  origem: 'trafego' | 'organico' | 'indicacao';
  plano: string;
  valor: number;
  telefone: string;
}

// Buscar conversões do dia
const conversoesDay = data.conversoes.filter(c => 
  c.data === dateKey && c.origem === 'trafego'
);

const conversoes = conversoesDay.length;
const receita = conversoesDay.reduce((sum, c) => sum + c.valor, 0);
```

---

### **3. Integrar com Créditos Reais:**

```typescript
interface Credito {
  id: string;
  data: string;
  tipo: string;
  quantidade: number;
  custo: number;
}

// Buscar créditos gastos no dia
const creditosDay = data.creditos.filter(c => c.data === dateKey);
const creditosGastos = creditosDay.reduce((sum, c) => sum + c.custo, 0);
```

---

### **4. Ticket Médio Real:**

```typescript
// Calcular ticket médio dos planos ativos
const ticketMedio = data.receitaMensal / data.clientesAtivos;

// Ou usar valor fixo conforme mapeamento
const TICKET_PLANOS = {
  'mensal': 30,
  '2telas': 50,
  'trimestral': 75,
  'semestral': 150,
  'anual': 280
};
```

---

### **5. API Externa (Facebook Ads):**

**Opcional - Integração com API do Facebook:**

```typescript
// Buscar gastos reais da API do Facebook
async function fetchFacebookSpends(startDate: string, endDate: string) {
  const response = await fetch(`https://graph.facebook.com/v18.0/act_YOUR_ACCOUNT_ID/insights`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    },
    params: {
      time_range: { since: startDate, until: endDate },
      fields: 'spend,impressions,clicks,conversions'
    }
  });
  
  return response.json();
}
```

**Benefícios:**
- ✅ Dados reais automáticos
- ✅ Sem entrada manual
- ✅ Sincronização diária

---

## 📊 Casos de Uso

### **1. Registro de Investimento Diário:**

```
Usuário:
1. Acessa Financial → Tráfego e Custos
2. Visualiza calendário do mês atual
3. Clica no dia 12
4. Modal abre com campo de valor
5. Digite: R$ 150,00
6. Clica "Salvar"
7. Calendário atualiza com valor e ROI calculado
```

---

### **2. Análise de Performance Semanal:**

```
Dashboard mostra automaticamente:
- 📊 Gasto total da semana: R$ 850
- 📈 Conversões: 28
- 💹 ROI médio: 3.1x
- 📉 CPL: R$ 30,36

Insight automático:
"📈 Seu ROI cresceu 8% nesta semana!"
```

---

### **3. Correção de Valor Errado:**

```
Usuário:
1. Identifica valor incorreto no dia 10
2. Clica na célula do dia 10
3. Modal abre pré-preenchido: R$ 120,00
4. Corrige para: R$ 180,00
5. Salva
6. Gráficos atualizam automaticamente
```

---

### **4. Cópia Rápida de Investimento:**

```
Cenário: Investimento padrão de R$ 100/dia

1. Dia 1: Insere R$ 100
2. Dia 2: Clica no dia → "Copiar do anterior" → R$ 100 preenchido
3. Salva
4. Repete para todos os dias do mês
```

---

## 🎯 Métricas de Sucesso

### **Objetivos do Módulo:**

1. **Facilitar registro** de gastos diários (< 10s por dia)
2. **Calcular ROI** automaticamente em tempo real
3. **Identificar padrões** através de gráficos
4. **Alertar problemas** via insights automáticos
5. **Projetar resultados** baseado em histórico

### **KPIs do Módulo:**

- ⏱️ **Tempo médio de registro**: < 10 segundos
- 📊 **Taxa de preenchimento**: > 80% dos dias
- 💡 **Insights gerados**: 3-5 por semana
- 🎯 **Precisão de ROI**: ±5% do real
- 📈 **Adoção**: > 90% dos usuários

---

## ✅ Checklist de Implementação

### **Backend (Futuro):**
- [ ] Criar tabela `facebook_ads_spends`
- [ ] Endpoint `POST /api/traffic/facebook`
- [ ] Endpoint `GET /api/traffic/facebook/:year/:month`
- [ ] Integrar com logs de conversão
- [ ] Integrar com logs de créditos
- [ ] Calcular métricas reais (ROI, CPL, ticket)

### **Frontend (Atual):**
- [x] Componente FacebookAdsCalendar
- [x] Componente TrafficAnalytics
- [x] Integração com FinancialView
- [x] Persistência em localStorage
- [x] Modal de edição
- [x] Tooltips informativos
- [x] Gráficos de análise
- [x] Sistema de insights
- [x] Cores AutonomyX padronizadas
- [x] Responsividade mobile

### **Testes:**
- [ ] Testar entrada de valores
- [ ] Testar navegação entre meses
- [ ] Testar persistência localStorage
- [ ] Testar cálculos de métricas
- [ ] Testar insights automáticos
- [ ] Testar responsividade
- [ ] Testar performance com 365 dias

---

## 🚀 Status do Módulo

**Versão:** 1.0  
**Status:** ✅ **PRONTO PARA USO** (frontend completo)  
**Data:** 30/10/2025  
**Próxima versão:** Integração com backend real e API Facebook

---

## 📞 Suporte e Contato

Para dúvidas sobre implementação ou customização do módulo, consulte a documentação completa do dashboard AutonomyX.

**Módulo desenvolvido seguindo:**
- ✅ Design System AutonomyX
- ✅ Paleta de cores oficial
- ✅ Componentes shadcn/ui
- ✅ TypeScript strict mode
- ✅ React best practices
- ✅ Recharts library
- ✅ Responsive design
