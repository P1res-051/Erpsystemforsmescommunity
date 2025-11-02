# 🎨 Padronização Completa Aplicada - SaaS Premium

## ✅ O Que Foi Implementado

### **1. Tokens CSS Padronizados** (`/styles/globals.css`)

```css
/* Backgrounds */
--bg-app: #0B0F1A;
--surface-1: #111827;     /* navbar, cards header */
--surface-2: #0F172A;     /* cards normais */
--surface-3: rgba(15, 23, 42, 0.45); /* painéis grandes */

/* Strokes */
--stroke-soft: rgba(255, 255, 255, 0.04);
--stroke-strong: rgba(0, 212, 255, 0.45);

/* Colors Premium */
--primary: #00D4FF;
--secondary: #9945FF;
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;

/* Text */
--text-primary: #E2E8F0;
--text-muted: #94A3B8;
```

---

## 📦 Classes Padronizadas Criadas

### **1. Cards SaaS** (`.card-saas`)

```css
.card-saas {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  transition: all 0.28s ease-out;
}

.card-saas:hover {
  border: 1px solid rgba(0, 212, 255, 0.35);
  box-shadow: 0 0 22px rgba(0, 212, 255, 0.12);
  transform: translateY(-2px);
}
```

**Usar em:** TODAS as abas (Overview, Financeiro, Clientes, etc)

---

### **2. Cards de Jogos** (`.jogo-card`)

```css
.jogo-card {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
}
```

**Usar em:** GamesView, cards de insights especiais

---

### **3. Timeline Cards** (`.timeline-card`)

```css
.timeline-card {
  height: 72px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid var(--stroke-soft);
}

.timeline-card.selected {
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.35);
  box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.35);
  color: var(--text-primary);
}
```

**Usar em:** FinancialView (calendário de dias 27, 28, 29, 30)

---

### **4. Badges Padronizados**

#### **Neutro** (`.badge-neutral`)
```css
background: rgba(148, 163, 184, 0.12);
color: var(--text-primary);
border: 1px solid rgba(148, 163, 184, 0.2);
```

#### **Positivo** (`.badge-positive`)
```css
background: rgba(16, 185, 129, 0.12);
color: var(--success);
border: 1px solid rgba(16, 185, 129, 0.3);
```

#### **Crítico** (`.badge-critical`)
```css
background: rgba(239, 68, 68, 0.12);
color: var(--danger);
border: 1px solid rgba(239, 68, 68, 0.3);
```

**Usar em:** ClientsView (filtros "Todos", "Ativos", "Vencidos"), GamesView (chips)

---

### **5. Tabs Navegação** (`.tab` + `.tab.active`)

```css
.tab {
  padding: 10px 20px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
}

.tab.active {
  background: rgba(0, 212, 255, 0.12);
  border: 1px solid rgba(0, 212, 255, 0.35);
  color: var(--text-primary);
  box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.35);
}
```

**Usar em:** TODAS as navegações internas (Geográfico, Financeiro, etc)

---

### **6. Animação Padrão** (`.fade-in-up`)

```css
.fade-in-up {
  animation: fadeInUp 280ms ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Usar em:** TODAS as abas ao carregar conteúdo

---

### **7. Empty State** (`.empty-state`)

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid var(--stroke-soft);
  border-radius: 16px;
  text-align: center;
  min-height: 400px;
}
```

**Usar em:** Rastreamento, qualquer view vazia

---

### **8. Gradientes Oficiais**

#### **Hero Gradient** (`.hero-gradient`)
```css
background: radial-gradient(circle at top, #00D4FF 0%, #101827 42%, #0B0F1A 80%);
```
**Usar em:** Overview (topo da página)

#### **Special Gradient** (`.special-gradient`)
```css
background: linear-gradient(135deg, #00D4FF 0%, #9945FF 100%);
```
**Usar em:** Cards de destaque, botões especiais

---

### **9. Sidebar Interna** (`.sidebar-internal`)

```css
.sidebar-internal {
  background: rgba(15, 23, 42, 0.45);
  border-right: 1px solid rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
}
```

**Usar em:** ClientsView (menu lateral de filtros)

---

### **10. Radar Chart** (`.radar-card`)

```css
.radar-card {
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid var(--stroke-soft);
  border-radius: 16px;
  padding: 1.5rem;
}

.radar-card .recharts-polar-grid-angle line,
.radar-card .recharts-polar-grid-concentric-circle {
  stroke: rgba(0, 212, 255, 0.35);
}
```

**Usar em:** TrafficView, GeographicView

---

## 🎯 Regras de Uso

### **Cores Semáforo**

| Significado | Cor | Variável |
|-------------|-----|----------|
| ✅ Dado bom | Verde | `var(--success)` / `#10B981` |
| ⚠️ Atenção | Amarelo | `var(--warning)` / `#F59E0B` |
| ❌ Dado ruim | Vermelho | `var(--danger)` / `#EF4444` |
| 🎯 UI/Seleção | Ciano | `var(--primary)` / `#00D4FF` |

### **Ícones**

- **Padrão**: `var(--primary)` (#00D4FF)
- **Alerta**: `var(--warning)` (#F59E0B)
- **Erro**: `var(--danger)` (#EF4444)
- **Sucesso**: `var(--success)` (#10B981)

### **Altura de Cards**

| Tipo | Altura | Variável |
|------|--------|----------|
| KPI | 160px | `var(--kpi-height)` |
| Métrica | 180px max | `var(--metric-height)` |
| Gráfico | 400px | `var(--chart-height)` |
| Gráfico Grande | 500px | `var(--chart-large-height)` |

### **Gaps**

- Entre cards: `24px` (`var(--grid-gap)`)
- Entre seções: `48px` (`var(--space-2xl)`)

---

## 📋 Checklist de Aplicação por Aba

### ✅ **1. Ticker Bar**
- [x] Fundo: `rgba(11,15,26,0.6)`
- [x] Texto único: `#E2E8F0`
- [x] Números: cores semáforo

### ⏳ **2. Overview (IPTVDashboard)**
- [ ] Gradient hero: `.hero-gradient`
- [ ] Cards: `.card-saas`
- [ ] Cards de jogos: `.jogo-card` com `border-radius: 18px`
- [ ] Insights: `.card-saas`

### ⏳ **3. Financeiro (FinancialView)**
- [ ] Timeline cards: `.timeline-card` + `.selected`
- [ ] Remover glow verde, usar stroke: `box-shadow: inset 0 0 0 1px rgba(0,212,255,0.35)`
- [ ] Altura cards timeline: `72px`
- [ ] Todos gráficos: `.card-saas`

### ⏳ **4. Clientes (ClientsView)**
- [ ] Sidebar: `.sidebar-internal`
- [ ] Badges de filtro:
  - Todos: `.badge-neutral`
  - Ativos: `.badge-positive`
  - Vencidos: `.badge-critical`
- [ ] Tabela: `.card-saas`

### ⏳ **5. Retenção (RetentionView)**
- [ ] Cards métricas: altura `160-180px`
- [ ] Gap: `24px`
- [ ] Todos cards: `.card-saas`

### ⏳ **6. Conversão (ConversionView)**
- [ ] Cards métricas: altura `160-180px`
- [ ] Gap: `24px`
- [ ] Todos cards: `.card-saas`

### ⏳ **7. Geográfico (GeographicView)**
- [ ] Ícones: `var(--primary)` padrão
- [ ] Ícone de alerta (telefones inválidos): `var(--warning)`
- [ ] Título "Estatísticas": `font-weight: 600; color: #E2E8F0`
- [ ] Tabs: `.tab` + `.tab.active`

### ⏳ **8. Tráfego (TrafficView)**
- [ ] Radar: `.radar-card`
- [ ] Linhas radar: `rgba(0, 212, 255, 0.35)`
- [ ] Série ativa: `#00D4FF`
- [ ] Legenda: `#94A3B8`

### ⏳ **9. Jogos (GamesView)**
- [ ] Cards jogos: `.jogo-card`
- [ ] Chips de filtro:
  - Brasileiros: `.badge-neutral`
  - Todos: `.badge-neutral`
  - Série A: `.badge-neutral`

### ⏳ **10. Rastreamento**
- [ ] Usar: `.empty-state`
- [ ] Botão: `.btn-premium-primary`

---

## 🚀 Como Aplicar

### **Exemplo 1: Card Padrão**

**ANTES:**
```tsx
<div className="p-6 bg-[#0f141a] border-gray-800 rounded-lg">
  ...
</div>
```

**DEPOIS:**
```tsx
<div className="card-saas p-6">
  ...
</div>
```

### **Exemplo 2: Badge de Status**

**ANTES:**
```tsx
<Badge className="bg-green-500/10 text-green-400">
  Ativo
</Badge>
```

**DEPOIS:**
```tsx
<div className="badge-positive">
  Ativo
</div>
```

### **Exemplo 3: Tab Ativa**

**ANTES:**
```tsx
<TabsTrigger 
  value="mapa" 
  className="data-[state=active]:bg-blue-500"
>
  Mapa
</TabsTrigger>
```

**DEPOIS:**
```tsx
<button 
  className={`tab ${activeTab === 'mapa' ? 'active' : ''}`}
  onClick={() => setActiveTab('mapa')}
>
  Mapa
</button>
```

### **Exemplo 4: Ícone com Cor Padrão**

**ANTES:**
```tsx
<Map className="w-12 h-12 text-green-400" />
```

**DEPOIS:**
```tsx
<Map 
  className="w-12 h-12" 
  style={{ color: 'var(--primary)' }} 
/>
```

### **Exemplo 5: Animação de Entrada**

```tsx
<div className="fade-in-up card-saas p-6">
  <h3>Conteúdo</h3>
</div>
```

---

## 🎨 Paleta Reduzida - Regra de Ouro

| Uso | Cor |
|-----|-----|
| **Dado bom** | `#10B981` (Verde) |
| **Dado em atenção** | `#F59E0B` (Amarelo) |
| **Dado ruim** | `#EF4444` (Vermelho) |
| **UI / Navegação / Seleções** | `#00D4FF` (Ciano) |
| **Blocos especiais (jogos, insights)** | Gradient `#00D4FF → #9945FF` |

**Não misturar:** Rosa, roxo e ciano ao mesmo tempo. Usar apenas quando necessário.

---

## 📊 Gráficos - Configuração Padrão

### **Recharts Theme**

```tsx
const chartConfig = {
  // Grid
  CartesianGrid: {
    strokeDasharray: "3 3",
    stroke: "rgba(255, 255, 255, 0.05)"
  },
  
  // Eixos
  XAxis: {
    stroke: "var(--text-muted)",
    style: { fontSize: '12px' }
  },
  
  YAxis: {
    stroke: "var(--text-muted)",
    style: { fontSize: '12px' }
  },
  
  // Tooltip
  Tooltip: {
    contentStyle: {
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'var(--foreground)',
      borderRadius: '12px',
    }
  },
  
  // Legenda
  Legend: {
    wrapperStyle: {
      color: 'var(--text-muted)',
      fontSize: '12px'
    }
  }
};
```

---

## ✅ Resultado Esperado

Após aplicar todas as padronizações:

1. ✅ **Consistência Visual**: Todas as abas parecem parte do mesmo produto
2. ✅ **Cores Semáforo**: Sempre verde = bom, amarelo = atenção, vermelho = ruim
3. ✅ **Ícones Padronizados**: Ciano padrão, amarelo para alertas
4. ✅ **Animações Uniformes**: Todas com 280ms
5. ✅ **Cards Uniformes**: Mesmo tamanho, borda, sombra e hover
6. ✅ **Tabs Iguais**: Mesma aparência em toda navegação secundária
7. ✅ **Badges Consistentes**: Sempre com mesma estrutura e cores
8. ✅ **Gradientes Oficiais**: Apenas 2 variantes (hero e especial)
9. ✅ **Espaçamento Fixo**: 24px entre cards, 48px entre seções
10. ✅ **Tipografia Clara**: Hierarquia bem definida

---

## 🔧 Próximos Passos

1. **Criar componente `<DashboardSurface>`**
   - Substitui todos os `<section>` internos
   - Aplica `.card-saas` automaticamente

2. **Criar componente `<MetricCard>`**
   - Props: `title, value, delta, icon, tone`
   - Altura fixa de 180px
   - Aplica cores semáforo automaticamente

3. **Atualizar cada View sistematicamente:**
   - Overview → Financeiro → Clientes → ...
   - Substituir classes antigas pelas novas
   - Testar hover e animações

4. **Validar Responsividade:**
   - Desktop: 4 colunas
   - Tablet: 2 colunas
   - Mobile: 1 coluna

---

**Versão:** 1.0  
**Data:** 30/10/2025  
**Status:** Tokens criados, classes prontas, aguardando aplicação nas views
