# 🎨 Sistema de Design - IPTV Dashboard

## 📋 Índice

1. [Paleta de Cores](#paleta-de-cores)
2. [Tamanhos de Cards](#tamanhos-de-cards)
3. [Grid System](#grid-system)
4. [Tipografia](#tipografia)
5. [Componentes](#componentes)
6. [Como Usar](#como-usar)
7. [Exemplos Práticos](#exemplos-práticos)

---

## 🎨 Paleta de Cores

### Fundos (3 níveis de profundidade)

```css
Fundo Principal:  #0F1115
Card Padrão:      #1A1E23
Card Hover:       #222832
```

**Uso:**
- `#0F1115` → Fundo global da aplicação
- `#1A1E23` → Cards, painéis, boxes
- `#222832` → Hover states, destaques

### Textos

```css
Texto Primário:   #E9EDF1
Texto Secundário: #A3A9B5
Texto Muted:      #8A8F9B
```

**Uso:**
- `#E9EDF1` → Títulos, números, texto principal
- `#A3A9B5` → Subtítulos, labels, descrições
- `#8A8F9B` → Texto pequeno, timestamps

### Bordas e Divisores

```css
Bordas:           #2C323B
```

**Uso:**
- Separação de cards
- Bordas de inputs
- Divisores horizontais/verticais

### Cores Funcionais

```css
Verde (Positivo):   #00C897  →  Retenção, Lucro, Conversões
Vermelho (Negativo): #E84A5F  →  Churn, Perdas, Cancelamentos
Azul (Informativo):  #2D9CDB  →  Tempo de Vida, Info neutras
Roxo (Insights):     #8B5CF6  →  Fidelidade, Análises
Amarelo (Ações):     #F2C94C  →  Oportunidades, Alertas
```

**Tabela de Uso:**

| Tipo de Elemento | Cor Base | Exemplo de Uso |
|------------------|----------|----------------|
| Fundo Principal | `#0F1115` | Background global |
| Card Padrão | `#1A1E23` | Painéis e boxes |
| Card Ativo/Hover | `#222832` | Destaques ao passar mouse |
| Texto Primário | `#E9EDF1` | Títulos, números |
| Texto Secundário | `#A3A9B5` | Subtítulos e labels |
| Bordas/Divisores | `#2C323B` | Separação de cards |
| **Verde (Positivo)** | `#00C897` | Retenção, Lucro, Conversões |
| **Vermelho (Negativo)** | `#E84A5F` | Churn, Perdas |
| **Azul (Informativo)** | `#2D9CDB` | Tempo de Vida, Info neutras |
| **Roxo (Insights)** | `#8B5CF6` | Fidelidade, Gráficos analíticos |
| **Amarelo (Ações)** | `#F2C94C` | Oportunidades, Alertas neutros |

---

## 📏 Tamanhos de Cards

### Sistema de Alturas Fixas

```typescript
KPI Principal:        140px (h-[140px])
Métricas Secundárias: 180px (h-[180px])
Gráficos:             360px (h-[360px])
Gráficos Médios:      300px (h-[300px])
Tabelas/Rankings:     500px (h-[500px])
Cards de Insight:     120px (h-[120px])
```

### Tabela de Dimensões

| Tipo de Card | Altura (px) | Largura (colunas) | Uso |
|--------------|-------------|-------------------|-----|
| **KPI Principal** | 120–140 | 3 | Taxa de Retenção, Churn, LTV |
| **Métricas Secundárias** | 160–180 | 6 | Clientes Ativos, Fidelidade |
| **Gráficos** | 300–360 | 6 ou 12 | Barras, linhas, radar |
| **Tabelas/Rankings** | 400–500 | 12 | Listas detalhadas |
| **Cards de Insight** | 100–120 | 4 | Alertas e sugestões |

### Padding e Espaçamento

```css
Padding Interno:  24px (p-6)
Border Radius:    12px (rounded-xl)
Gap entre cards:  16px (gap-4)
```

---

## 🎯 Grid System (12 colunas)

### Layouts Pré-definidos

```typescript
// 4 KPIs no topo (3 colunas cada = 25%)
kpisTop: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'

// 2 colunas iguais (6 colunas cada = 50%)
cols2: 'grid grid-cols-1 lg:grid-cols-2 gap-4'

// 3 colunas iguais (4 colunas cada = 33%)
cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'

// 1 coluna grande + 1 pequena (8 + 4 = 66% + 33%)
cols8_4: 'grid grid-cols-1 lg:grid-cols-12 gap-4'
```

### Estrutura Padrão de Aba

```jsx
<div className="space-y-6 p-6">
  {/* Seção 1: 4 KPIs no topo */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card /> {/* 3 colunas */}
    <Card /> {/* 3 colunas */}
    <Card /> {/* 3 colunas */}
    <Card /> {/* 3 colunas */}
  </div>

  {/* Seção 2: Conteúdo em 2 colunas */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Card /> {/* 6 colunas */}
    <Card /> {/* 6 colunas */}
  </div>
</div>
```

---

## 🔤 Tipografia

### Hierarquia de Texto

| Elemento | Tamanho | Peso | Cor | Uso |
|----------|---------|------|-----|-----|
| **Título Principal (H1)** | 20–22px | 600 | `#E9EDF1` | Título da página |
| **Título Secundário (H2)** | 20px | 600 | `#E9EDF1` | Título de seções |
| **Título Terciário (H3)** | 18px | 500 | `#E9EDF1` | Título de cards |
| **Título Quaternário (H4)** | 16px | 500 | `#E9EDF1` | Subtítulos |
| **Texto Primário** | 14px | 400 | `#E9EDF1` | Corpo de texto |
| **Texto Secundário** | 14px | 400 | `#A3A9B5` | Descrições |
| **Texto Menor** | 12px | 400 | `#8A8F9B` | Timestamps, notas |
| **Label** | 12px | 400 | `#A3A9B5` | UPPERCASE labels |
| **KPI (Grande)** | 36px | 700 | `#FFFFFF` | Números principais |
| **KPI (Médio)** | 28px | 700 | `#E9EDF1` | Números secundários |
| **KPI (Pequeno)** | 24px | 600 | `#E9EDF1` | Números terciários |

### Classes CSS Padronizadas

```typescript
// Títulos
h1: 'text-[22px] font-semibold text-[#E9EDF1]'
h2: 'text-[20px] font-semibold text-[#E9EDF1]'
h3: 'text-[18px] font-medium text-[#E9EDF1]'
h4: 'text-[16px] font-medium text-[#E9EDF1]'

// Textos
primary: 'text-[14px] text-[#E9EDF1]'
secondary: 'text-[14px] text-[#A3A9B5]'
muted: 'text-[12px] text-[#8A8F9B]'

// Labels
label: 'text-[12px] uppercase tracking-wider text-[#A3A9B5]'

// KPIs
kpi: 'text-[36px] font-bold text-[#E9EDF1]'
kpiMedium: 'text-[28px] font-bold text-[#E9EDF1]'
kpiSmall: 'text-[24px] font-semibold text-[#E9EDF1]'
```

### Fonte Padrão

```css
Font Family: "Inter", "Poppins", system-ui, sans-serif
```

---

## 🧩 Componentes

### Card KPI Principal

```jsx
import { CARD_CLASSES, TEXT_CLASSES, COLORS } from '../utils/designSystem';

<Card className={CARD_CLASSES.kpi}>
  <div className="flex items-start justify-between">
    <div>
      <p className={TEXT_CLASSES.label}>TAXA DE RETENÇÃO</p>
      <p className={TEXT_CLASSES.kpi}>51.1<span className="text-xl">%</span></p>
      <div className="flex items-center gap-2 mt-2">
        <TrendingUp className="w-4 h-4" style={{ color: COLORS.success }} />
        <span className={TEXT_CLASSES.secondary}>+2.9% vs período anterior</span>
      </div>
    </div>
    <UserCheck className="w-12 h-12" style={{ color: COLORS.success }} />
  </div>
</Card>
```

### Card com Gráfico

```jsx
import { CARD_CLASSES, CHART_TOOLTIP_STYLE, getChartAxisConfig } from '../utils/designSystem';

<Card className={CARD_CLASSES.chart}>
  <h3 className={TEXT_CLASSES.h3}>Título do Gráfico</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#2C323B" />
      <XAxis {...getChartAxisConfig()} />
      <YAxis {...getChartAxisConfig()} />
      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
      <Bar dataKey="value" fill={COLORS.success} />
    </BarChart>
  </ResponsiveContainer>
</Card>
```

### Badge com Status

```jsx
import { BADGE_CLASSES } from '../utils/designSystem';

<Badge className={BADGE_CLASSES.success}>✅ Ótimo</Badge>
<Badge className={BADGE_CLASSES.warning}>⚠️ Atenção</Badge>
<Badge className={BADGE_CLASSES.error}>❌ Crítico</Badge>
```

---

## 📚 Como Usar

### 1. Importar o Sistema de Design

```typescript
import { 
  COLORS,           // Paleta de cores
  CARD_CLASSES,     // Classes de cards
  TEXT_CLASSES,     // Classes de texto
  GRID_LAYOUTS,     // Layouts de grid
  BADGE_CLASSES,    // Classes de badges
  CHART_TOOLTIP_STYLE,  // Style para tooltips
  getChartAxisConfig,   // Config de eixos
  GradientDefs,         // Componente de gradientes
} from '../utils/designSystem';
```

### 2. Usar Classes Padronizadas

```jsx
// Card KPI
<Card className={CARD_CLASSES.kpi}>
  <p className={TEXT_CLASSES.label}>LABEL</p>
  <p className={TEXT_CLASSES.kpi}>123</p>
</Card>

// Card Gráfico
<Card className={CARD_CLASSES.chart}>
  {/* Conteúdo */}
</Card>

// Grid 4 colunas
<div className={GRID_LAYOUTS.kpisTop}>
  <Card />
  <Card />
  <Card />
  <Card />
</div>
```

### 3. Usar Cores Diretamente

```jsx
// Inline style
<Icon style={{ color: COLORS.success }} />

// Tailwind (criar classes personalizadas)
<div className="bg-[#1A1E23] text-[#E9EDF1]">
```

### 4. Configurar Gráficos

```jsx
import { GradientDefs, CHART_TOOLTIP_STYLE, getChartAxisConfig } from '../utils/designSystem';

<ResponsiveContainer>
  <BarChart data={data}>
    <GradientDefs />
    <XAxis {...getChartAxisConfig()} />
    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
    <Bar dataKey="value" fill="url(#successGradient)" />
  </BarChart>
</ResponsiveContainer>
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Card KPI Completo

```jsx
import { CARD_CLASSES, TEXT_CLASSES, COLORS } from '../utils/designSystem';
import { TrendingUp, UserCheck } from 'lucide-react';

function KpiCard({ title, value, change, icon: Icon, positive = true }) {
  const color = positive ? COLORS.success : COLORS.error;
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <Card 
      className={CARD_CLASSES.kpi}
      style={{ boxShadow: `0 0 10px rgba(${hexToRgb(color)}, 0.15)` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={TEXT_CLASSES.label}>{title}</p>
          <p className={TEXT_CLASSES.kpi}>{value}</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendIcon className="w-4 h-4" style={{ color }} />
            <span className={TEXT_CLASSES.secondary}>{change}</span>
          </div>
        </div>
        <Icon className="w-12 h-12" style={{ color }} />
      </div>
    </Card>
  );
}
```

### Exemplo 2: Grid de 4 KPIs

```jsx
import { GRID_LAYOUTS } from '../utils/designSystem';

function DashboardKpis() {
  return (
    <div className={GRID_LAYOUTS.kpisTop}>
      <KpiCard 
        title="TAXA DE RETENÇÃO" 
        value="51.1%" 
        change="+2.9% vs mês anterior"
        icon={UserCheck}
        positive
      />
      <KpiCard 
        title="CHURN MENSAL" 
        value="48.9%" 
        change="-1.1% melhor"
        icon={ArrowDownRight}
        positive={false}
      />
      <KpiCard 
        title="CLIENTES FIÉIS" 
        value="2,639" 
        change="60.5% dos renovadores"
        icon={Heart}
        positive
      />
      <KpiCard 
        title="TEMPO MÉDIO DE VIDA" 
        value="7 meses" 
        change="+0.5 meses"
        icon={Award}
        positive
      />
    </div>
  );
}
```

### Exemplo 3: Card com Gráfico de Barras

```jsx
import { 
  CARD_CLASSES, 
  TEXT_CLASSES, 
  COLORS, 
  CHART_TOOLTIP_STYLE,
  getChartAxisConfig,
  GradientDefs
} from '../utils/designSystem';

function ChartCard({ title, data }) {
  return (
    <Card className={CARD_CLASSES.chart}>
      <h3 className={TEXT_CLASSES.h3}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <GradientDefs />
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis dataKey="name" {...getChartAxisConfig()} />
          <YAxis {...getChartAxisConfig()} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Bar dataKey="value" fill="url(#successGradient)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

### Exemplo 4: Seção com Título

```jsx
import { getSectionClasses } from '../utils/designSystem';

function Section({ title, children }) {
  const classes = getSectionClasses();

  return (
    <div className={classes.container}>
      <div>
        <h3 className={classes.title}>{title}</h3>
        <div 
          className={classes.divider} 
          style={{ 
            background: 'linear-gradient(to right, #00C897, transparent)' 
          }}
        />
      </div>
      {children}
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

### Para cada nova aba do dashboard:

- [ ] Importar `designSystem.ts`
- [ ] Usar `GRID_LAYOUTS.kpisTop` para 4 KPIs no topo
- [ ] Aplicar `CARD_CLASSES.kpi` nos cards principais
- [ ] Usar `TEXT_CLASSES` para toda tipografia
- [ ] Aplicar `COLORS` em ícones e badges
- [ ] Configurar gráficos com `GradientDefs` e `CHART_TOOLTIP_STYLE`
- [ ] Garantir altura consistente dos cards
- [ ] Usar espaçamento padrão: `space-y-6` e `gap-4`

---

## 🎨 Variações de Cards

### Com Box Shadow Colorido

```jsx
import { getCardWithGlow, COLORS } from '../utils/designSystem';

<Card className={getCardWithGlow(COLORS.success, 0.15)}>
  {/* Conteúdo */}
</Card>
```

### Com Hover Effect

```jsx
<Card className={`${CARD_CLASSES.kpi} hover:scale-105 hover:brightness-110`}>
  {/* Conteúdo */}
</Card>
```

### Com Gradiente de Fundo

```jsx
<Card 
  className={CARD_CLASSES.base}
  style={{
    background: 'linear-gradient(135deg, rgba(0,200,151,0.1), rgba(45,156,219,0.1))',
    borderColor: COLORS.success + '40'
  }}
>
  {/* Conteúdo */}
</Card>
```

---

## 📊 Configuração de Gráficos

### Recharts - Configuração Padrão

```jsx
import { 
  COLORS, 
  CHART_TOOLTIP_STYLE, 
  getChartAxisConfig,
  GradientDefs
} from '../utils/designSystem';

<ResponsiveContainer width="100%" height={360}>
  <BarChart data={data}>
    <GradientDefs />
    
    <CartesianGrid 
      strokeDasharray="3 3" 
      stroke={COLORS.border} 
    />
    
    <XAxis 
      dataKey="name" 
      {...getChartAxisConfig()}
    />
    
    <YAxis 
      {...getChartAxisConfig()}
    />
    
    <Tooltip 
      contentStyle={CHART_TOOLTIP_STYLE}
      cursor={{ fill: COLORS.bg.hover }}
    />
    
    <Legend 
      wrapperStyle={{ color: COLORS.text.primary }}
    />
    
    <Bar 
      dataKey="value" 
      fill="url(#successGradient)"
      radius={[4, 4, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>
```

---

## 🚨 Erros Comuns a Evitar

### ❌ NÃO FAÇA:

```jsx
// Cores hardcoded
<div className="bg-[#121212] text-white">

// Tamanhos inconsistentes
<Card className="p-4 h-[180px]"> {/* deveria ser p-6 e h-[140px] */}

// Textos pretos em fundo escuro
<p className="text-black">

// Grid sem responsividade
<div className="grid grid-cols-4"> {/* deveria ter grid-cols-1 md:grid-cols-2 */}
```

### ✅ FAÇA:

```jsx
// Usar sistema de cores
<div className="bg-[#1A1E23] text-[#E9EDF1]">

// Tamanhos padronizados
<Card className={CARD_CLASSES.kpi}>

// Cores do sistema
<p className={TEXT_CLASSES.primary}>

// Grid responsivo
<div className={GRID_LAYOUTS.kpisTop}>
```

---

## 🎯 Resultado Final

Com este sistema de design, todas as abas do dashboard terão:

✅ **Cores consistentes** em todos os elementos  
✅ **Tamanhos padronizados** de cards  
✅ **Grid responsivo** com 12 colunas  
✅ **Tipografia uniforme** e legível  
✅ **Gráficos padronizados** com gradientes  
✅ **Hover effects** consistentes  
✅ **Acessibilidade** com contraste adequado  

---

## 📝 Referências Rápidas

### Cores Mais Usadas

```typescript
COLORS.bg.main      // #0F1115 - Fundo
COLORS.bg.card      // #1A1E23 - Card
COLORS.text.primary // #E9EDF1 - Texto
COLORS.success      // #00C897 - Verde
COLORS.error        // #E84A5F - Vermelho
COLORS.info         // #2D9CDB - Azul
```

### Classes Mais Usadas

```typescript
CARD_CLASSES.kpi        // Card KPI (140px)
CARD_CLASSES.chart      // Card Gráfico (360px)
TEXT_CLASSES.label      // Label UPPERCASE
TEXT_CLASSES.kpi        // Número grande (36px)
GRID_LAYOUTS.kpisTop    // Grid 4 colunas
```

---

**Versão**: 1.0.0  
**Data**: Outubro 2025  
**Mantido por**: Equipe IPTV Dashboard  
**Última atualização**: Sistema implementado com consistência total
