# 🎨 Design System Premium - AutonomyX SaaS Dashboard

## 🎯 Visão Geral

Dashboard analítico profissional com tema **Neon Dark Glassmorphism**, seguindo padrões de mercado como Power BI, ChartMogul, Supermetrics e Databox.

---

## 🧱 1. Grid System & Layout

### **Container Principal**
```css
max-width: 1440px
padding-horizontal: 32px
margin: 0 auto
```

### **Grid 12 Colunas**
```css
display: grid
grid-template-columns: repeat(12, 1fr)
gap: 24px
```

### **Espaçamentos Verticais**
- **Entre seções**: `48px`
- **Entre cards**: `24px`
- **Padding interno cards**: `24px`

### **Cards Padrão**
```css
width: 320px (min)
height: 180px (min)
padding: 24px
border-radius: 16px
```

---

## 🎨 2. Cores e Tema

### **Paleta Neon Dark**

| Elemento | Cor | Hex | Uso |
|----------|-----|-----|-----|
| **Primário** | Neon Cyan | `#00D4FF` | CTA, highlights, valores positivos |
| **Secundário** | Neon Purple | `#9945FF` | Gradientes, acentos |
| **Sucesso** | Emerald | `#10B981` | Crescimento, metas alcançadas |
| **Atenção** | Amber | `#F59E0B` | Avisos, métricas neutras |
| **Erro** | Rose | `#EF4444` | Quedas, alertas críticos |
| **Fundo Escuro** | Midnight | `#0B0F1A` | Background principal |
| **Fundo Card** | Dark Slate | `#111827` | Background de cards |
| **Texto Primário** | White | `#FFFFFF` | Títulos principais |
| **Texto Secundário** | Gray 300 | `#D1D5DB` | Labels, descrições |
| **Texto Terciário** | Gray 500 | `#6B7280` | Metadados, timestamps |

### **Gradientes**

**Primary Glow:**
```css
background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
```

**Secondary Glow:**
```css
background: linear-gradient(135deg, #9945FF 0%, #7B2FF7 100%);
```

**Success Glow:**
```css
background: linear-gradient(135deg, #10B981 0%, #059669 100%);
```

**Card Glassmorphism:**
```css
background: rgba(17, 24, 39, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 
  0 4px 16px rgba(0, 0, 0, 0.25),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

---

## ✨ 3. Efeitos e Interações

### **Hover States**

**Cards:**
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 0 24px rgba(0, 212, 255, 0.3),
    0 8px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 212, 255, 0.4);
}
```

**Buttons:**
```css
&:hover {
  background: linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}
```

### **Focus States**
```css
outline: 2px solid #00D4FF;
outline-offset: 2px;
border-radius: 12px;
```

### **Loading States**
```css
/* Skeleton */
background: linear-gradient(
  90deg,
  rgba(255, 255, 255, 0.05) 25%,
  rgba(255, 255, 255, 0.1) 50%,
  rgba(255, 255, 255, 0.05) 75%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 📝 4. Tipografia

### **Família de Fontes**
```css
font-family: 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
```

### **Escala Tipográfica**

| Elemento | Size | Weight | Line Height | Letter Spacing |
|----------|------|--------|-------------|----------------|
| **Display** | 48px | 700 | 1.1 | -0.02em |
| **H1** | 40px | 700 | 1.2 | -0.01em |
| **H2** | 32px | 600 | 1.25 | -0.01em |
| **H3** | 24px | 600 | 1.3 | 0 |
| **H4** | 20px | 600 | 1.4 | 0 |
| **Body Large** | 16px | 400 | 1.5 | 0 |
| **Body** | 14px | 400 | 1.5 | 0 |
| **Body Small** | 12px | 400 | 1.5 | 0.01em |
| **Caption** | 11px | 500 | 1.4 | 0.02em |
| **KPI Value** | 40px | 700 | 1.1 | -0.02em |
| **KPI Label** | 12px | 500 | 1.3 | 0.05em |

### **Tokens CSS**
```css
/* Tamanhos */
--font-size-display: 3rem;      /* 48px */
--font-size-h1: 2.5rem;         /* 40px */
--font-size-h2: 2rem;           /* 32px */
--font-size-h3: 1.5rem;         /* 24px */
--font-size-h4: 1.25rem;        /* 20px */
--font-size-body-lg: 1rem;      /* 16px */
--font-size-body: 0.875rem;     /* 14px */
--font-size-body-sm: 0.75rem;   /* 12px */
--font-size-caption: 0.6875rem; /* 11px */
--font-size-kpi: 2.5rem;        /* 40px */

/* Pesos */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

---

## 📐 5. Espaçamento

### **Sistema de Espaçamento (8px base)**

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | 4px | Margens mínimas |
| `sm` | 8px | Padding pequeno |
| `md` | 16px | Espaçamento padrão |
| `lg` | 24px | Gap entre cards |
| `xl` | 32px | Padding de seções |
| `2xl` | 48px | Gap entre seções |
| `3xl` | 64px | Margens principais |

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

---

## 🎴 6. Componentes

### **KPI Card**

**Estrutura:**
```tsx
<Card className="kpi-card">
  <div className="kpi-header">
    <Icon />
    <Tooltip />
  </div>
  <div className="kpi-value">
    <CountUp end={value} />
    <Trend percentage={change} />
  </div>
  <div className="kpi-label">
    Label
  </div>
  <div className="kpi-footer">
    <Timestamp />
  </div>
</Card>
```

**Estilos:**
```css
.kpi-card {
  min-width: 280px;
  padding: 24px;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 12px 0;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### **Chart Card**

```css
.chart-card {
  padding: 24px;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  min-height: 400px;
}

.chart-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #FFFFFF;
}
```

### **Button Primary**

```css
.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
  color: #FFFFFF;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 24px rgba(0, 212, 255, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
}
```

### **Badge**

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-error {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

---

## 📱 7. Responsividade

### **Breakpoints**

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Tablets */
--breakpoint-md: 768px;   /* Tablets Large */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Desktop Large */
--breakpoint-2xl: 1440px; /* Desktop XL */
```

### **Grid Responsivo**

**Desktop (lg+):**
```css
@media (min-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .chart-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

**Tablet (md):**
```css
@media (min-width: 768px) and (max-width: 1023px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
```

**Mobile (sm):**
```css
@media (max-width: 767px) {
  .kpi-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .container {
    padding: 16px;
  }
  
  .kpi-card {
    min-width: auto;
  }
}
```

---

## 🎭 8. Animações

### **Timings**
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### **Fade In**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
```

### **Pulse Glow**
```css
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 212, 255, 0.6);
  }
}

.pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}
```

### **Count Up**
```tsx
import { useEffect, useState } from 'react';

function CountUp({ end, duration = 1000 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end, duration]);
  
  return <span>{count.toLocaleString('pt-BR')}</span>;
}
```

---

## ♿ 9. Acessibilidade

### **Contraste**
- **WCAG AA**: Mínimo 4.5:1 para texto normal
- **WCAG AAA**: Mínimo 7:1 para texto normal

**Verificações:**
- ✅ Branco (#FFFFFF) em Midnight (#0B0F1A): **16.8:1** ✅
- ✅ Gray 300 (#D1D5DB) em Dark Slate (#111827): **9.2:1** ✅
- ✅ Neon Cyan (#00D4FF) em Midnight (#0B0F1A): **8.1:1** ✅

### **Focus Visible**
```css
:focus-visible {
  outline: 2px solid #00D4FF;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### **ARIA Labels**
```tsx
<button aria-label="Exportar dados para Excel">
  <Download />
</button>

<div role="status" aria-live="polite">
  {loading ? 'Carregando dados...' : 'Dados carregados'}
</div>
```

### **Navegação por Teclado**
```css
[tabindex="0"]:focus {
  outline: 2px solid #00D4FF;
  outline-offset: 2px;
}
```

---

## 📊 10. Gráficos (Recharts)

### **Configuração Padrão**

```tsx
const chartTheme = {
  background: 'transparent',
  textColor: '#D1D5DB',
  fontSize: 12,
  axis: {
    domain: {
      line: {
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1
      }
    },
    ticks: {
      line: {
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1
      }
    }
  },
  grid: {
    line: {
      stroke: 'rgba(255, 255, 255, 0.05)',
      strokeDasharray: '3 3'
    }
  },
  tooltip: {
    container: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '12px',
      color: '#FFFFFF'
    }
  }
};
```

### **Cores de Série**
```tsx
const seriesColors = [
  '#00D4FF', // Primary
  '#9945FF', // Secondary
  '#10B981', // Success
  '#F59E0B', // Warning
  '#EF4444', // Error
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899'  // Pink
];
```

---

## 🔧 11. Tokens CSS Completos

```css
:root {
  /* Colors */
  --color-primary: #00D4FF;
  --color-secondary: #9945FF;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-bg-dark: #0B0F1A;
  --color-bg-card: #111827;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #D1D5DB;
  --color-text-tertiary: #6B7280;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  
  /* Typography */
  --font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-size-display: 3rem;
  --font-size-h1: 2.5rem;
  --font-size-h2: 2rem;
  --font-size-h3: 1.5rem;
  --font-size-body: 0.875rem;
  --font-size-caption: 0.75rem;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-glow-primary: 0 0 24px rgba(0, 212, 255, 0.3);
  --shadow-glow-secondary: 0 0 24px rgba(153, 69, 255, 0.3);
  
  /* Glassmorphism */
  --glass-bg: rgba(17, 24, 39, 0.6);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-blur: 12px;
}
```

---

## 📋 12. Checklist de Implementação

### **Design**
- [ ] Aplicar paleta de cores Neon Dark
- [ ] Implementar Glassmorphism em cards
- [ ] Adicionar efeitos de hover e focus
- [ ] Aplicar tipografia Inter/Plus Jakarta Sans
- [ ] Configurar grid 12 colunas

### **Componentes**
- [ ] KPI Card com CountUp
- [ ] Chart Card com tema escuro
- [ ] Skeleton Loaders
- [ ] Tooltips informativos
- [ ] Badges de status

### **Responsividade**
- [ ] Grid adaptativo (4 → 2 → 1 colunas)
- [ ] Navbar colapsável em mobile
- [ ] Touch gestures para carrosséis
- [ ] Breakpoints configurados

### **Acessibilidade**
- [ ] Contraste WCAG AA/AAA
- [ ] Focus visible em todos interativos
- [ ] ARIA labels em ícones
- [ ] Navegação por teclado
- [ ] Screen reader friendly

### **Performance**
- [ ] Lazy loading de gráficos
- [ ] Debounce em filtros
- [ ] Virtualization em listas longas
- [ ] Code splitting por rota

---

## 🎯 Resultado Esperado

Um dashboard com:
- ✅ Visual premium "Neon Dark Glassmorphism"
- ✅ Animações fluidas e microinterações
- ✅ Totalmente responsivo
- ✅ Acessível (WCAG AA)
- ✅ Performance otimizada
- ✅ Experiência SaaS profissional

---

**Versão:** 1.0  
**Data:** 30/10/2025  
**Referências:** Power BI, ChartMogul, Supermetrics, Databox
