# 🎨 Tabs Padronizadas - Sistema de Design

## 📋 Visual Antes e Depois

### ❌ ANTES (Problema)
```
┌─────────────────────────────────────────────┐
│ ┌─────────────┐ ┌──────────┐ ┌──────────┐  │
│ │ PERFORMANCE │ │ ANÁLISES │ │ INSIGHTS │  │ <- Fundo verde/azul brilhante
│ │  (verde)    │ │ (cinza)  │ │ (cinza)  │  │    Texto difícil de ler
│ └─────────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────┘
```

**Problemas:**
- ❌ Fundo colorido muito chamativo (`bg-[#00C897]`)
- ❌ Baixo contraste nas abas inativas
- ❌ Não segue padrão moderno de design
- ❌ Borda arredondada não combina com tema dark

### ✅ DEPOIS (Solução)
```
┌─────────────────────────────────────────────┐
│  PERFORMANCE   ANÁLISES   INSIGHTS          │ <- Texto colorido
│  ─────────                                  │ <- Borda inferior colorida
│  (verde)      (cinza)    (cinza)            │    Minimalista e moderno
└─────────────────────────────────────────────┘
```

**Melhorias:**
- ✅ Border-bottom colorido na aba ativa
- ✅ Texto colorido ao invés de fundo
- ✅ Hover sutil com fundo escuro
- ✅ Alto contraste e legibilidade
- ✅ Design moderno e profissional

---

## 🎯 Como Usar

### 1. Importar

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TAB_CLASSES } from '../utils/designSystem';
import { BarChart3, Activity, Sparkles } from 'lucide-react';
```

### 2. Implementar

```tsx
export function MyView() {
  const [activeTab, setActiveTab] = useState('performance');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* Lista de Tabs */}
      <TabsList className={TAB_CLASSES.list}>
        
        {/* Tab 1 - Success/Verde */}
        <TabsTrigger 
          value="performance" 
          className={TAB_CLASSES.triggerSuccess}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Performance
        </TabsTrigger>
        
        {/* Tab 2 - Info/Azul */}
        <TabsTrigger 
          value="analises" 
          className={TAB_CLASSES.triggerInfo}
        >
          <Activity className="w-4 h-4 mr-2" />
          Análises
        </TabsTrigger>
        
        {/* Tab 3 - Insight/Roxo */}
        <TabsTrigger 
          value="insights" 
          className={TAB_CLASSES.triggerInsight}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Insights
        </TabsTrigger>
      </TabsList>

      {/* Conteúdo das Tabs */}
      <TabsContent value="performance">
        {/* Conteúdo de Performance */}
      </TabsContent>

      <TabsContent value="analises">
        {/* Conteúdo de Análises */}
      </TabsContent>

      <TabsContent value="insights">
        {/* Conteúdo de Insights */}
      </TabsContent>
    </Tabs>
  );
}
```

---

## 🎨 Variações de Cores

### Success (Verde) - #00C897
```tsx
<TabsTrigger 
  value="performance" 
  className={TAB_CLASSES.triggerSuccess}
>
  Performance
</TabsTrigger>
```
**Uso:** Métricas positivas, performance, conversões

### Info (Azul) - #2D9CDB
```tsx
<TabsTrigger 
  value="info" 
  className={TAB_CLASSES.triggerInfo}
>
  Informações
</TabsTrigger>
```
**Uso:** Dados informativos, análises neutras, estatísticas

### Insight (Roxo) - #8B5CF6
```tsx
<TabsTrigger 
  value="insights" 
  className={TAB_CLASSES.triggerInsight}
>
  Insights
</TabsTrigger>
```
**Uso:** Insights, recomendações, análises avançadas

### Error (Vermelho) - #E84A5F
```tsx
<TabsTrigger 
  value="alerts" 
  className={TAB_CLASSES.triggerError}
>
  Alertas
</TabsTrigger>
```
**Uso:** Alertas, problemas, erros, atenção

### Warning (Amarelo) - #F2C94C
```tsx
<TabsTrigger 
  value="opportunities" 
  className={TAB_CLASSES.triggerWarning}
>
  Oportunidades
</TabsTrigger>
```
**Uso:** Avisos, oportunidades, ações pendentes

---

## 📐 Anatomia Visual

```
┌─────────────────────────────────────────────────────────┐
│  [ICON] PERFORMANCE   [ICON] ANÁLISES   [ICON] INSIGHTS │
│  ─────────────────                                      │
│  ↑                ↑                     ↑               │
│  Border-bottom    Texto cinza           Texto cinza     │
│  colorido         inativo               inativo         │
│  #00C897          #A3A9B5               #A3A9B5         │
│                                                         │
│  Texto ativo: #00C897                                   │
│  Hover background: #1A1E23                              │
│  Transição: 200ms                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Estados da Tab

### 1. **Inativa (Padrão)**
```css
text-color: #A3A9B5      (cinza médio)
border-bottom: transparent
background: transparent
```

### 2. **Hover (Ao passar o mouse)**
```css
text-color: #E9EDF1      (branco quase)
border-bottom: transparent
background: #1A1E23      (fundo escuro sutil)
```

### 3. **Ativa (Selecionada)**
```css
text-color: #00C897      (verde - ou cor específica)
border-bottom: 2px solid #00C897
background: transparent
```

---

## 💡 Boas Práticas

### ✅ FAÇA

```tsx
// 1. Use ícones para melhor identificação visual
<TabsTrigger className={TAB_CLASSES.triggerSuccess}>
  <BarChart3 className="w-4 h-4 mr-2" />
  Performance
</TabsTrigger>

// 2. Mantenha labels curtos e descritivos
<TabsTrigger>Performance</TabsTrigger>  // ✅ Bom
<TabsTrigger>Análises</TabsTrigger>     // ✅ Bom

// 3. Use cores consistentes com o contexto
<TabsTrigger className={TAB_CLASSES.triggerSuccess}>  // Verde para positivo
<TabsTrigger className={TAB_CLASSES.triggerError}>    // Vermelho para alertas

// 4. Limite a 3-5 tabs por grupo
<TabsList>
  <TabsTrigger value="1">Tab 1</TabsTrigger>
  <TabsTrigger value="2">Tab 2</TabsTrigger>
  <TabsTrigger value="3">Tab 3</TabsTrigger>
</TabsList>
```

### ❌ NÃO FAÇA

```tsx
// 1. Não use fundos coloridos
<TabsTrigger className="bg-green-500">  // ❌ Muito chamativo

// 2. Não use labels muito longos
<TabsTrigger>
  Análise Detalhada de Performance e Métricas
</TabsTrigger>  // ❌ Muito longo

// 3. Não misture estilos
<TabsTrigger className="rounded-lg bg-blue-500">  // ❌ Fora do padrão

// 4. Não crie mais de 6 tabs
<TabsList>
  {/* 10 tabs */}  // ❌ Difícil de navegar
</TabsList>
```

---

## 📊 Exemplo Completo

### Aba de Retenção

```tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TAB_CLASSES } from '../utils/designSystem';
import { BarChart3, Activity, Sparkles } from 'lucide-react';

export function RetentionView() {
  const [activeTab, setActiveTab] = useState<'performance' | 'analises' | 'insights'>('performance');

  return (
    <div className="space-y-6 p-6">
      {/* KPIs no topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... KPIs ... */}
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className={TAB_CLASSES.list}>
          <TabsTrigger value="performance" className={TAB_CLASSES.triggerSuccess}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          
          <TabsTrigger value="analises" className={TAB_CLASSES.triggerInfo}>
            <Activity className="w-4 h-4 mr-2" />
            Análises
          </TabsTrigger>
          
          <TabsTrigger value="insights" className={TAB_CLASSES.triggerInsight}>
            <Sparkles className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo: Performance */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráficos de performance */}
          </div>
        </TabsContent>

        {/* Conteúdo: Análises */}
        <TabsContent value="analises" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Análises detalhadas */}
          </div>
        </TabsContent>

        {/* Conteúdo: Insights */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Cards de insights */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🎨 CSS Breakdown

### TabsList (Container)
```css
background: transparent              /* Sem fundo */
border-bottom: 1px solid #2C323B    /* Linha divisória */
padding: 0
height: auto
border-radius: 0                    /* Sem arredondamento */
width: 100%
justify-content: flex-start         /* Alinhamento à esquerda */
```

### TabsTrigger (Individual)
```css
/* Layout */
position: relative
padding: 12px 24px                  /* py-3 px-6 */
border-radius: 0
border-bottom: 2px solid transparent

/* Tipografia */
text-transform: uppercase
letter-spacing: 0.05em             /* tracking-wider */
font-size: 12px                    /* text-xs */
font-weight: 500                   /* font-medium */

/* Estados */
/* Inativa */
color: #A3A9B5

/* Hover */
color: #E9EDF1
background: #1A1E23

/* Ativa */
border-bottom-color: #00C897      /* Verde - ou cor específica */
color: #00C897

/* Transição */
transition: all 200ms
```

---

## 📱 Responsividade

### Desktop (> 1024px)
```
┌──────────────────────────────────────────┐
│  PERFORMANCE   ANÁLISES   INSIGHTS       │
│  ───────────                             │
└──────────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌────────────────────────────────┐
│  PERFORMANCE   ANÁLISES        │
│  ───────────                   │
│  INSIGHTS                      │
└────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────┐
│  PERFORMANCE │
│  ───────────  │
│  ANÁLISES    │
│  INSIGHTS    │
└──────────────┘
```

**Implementação:**
```tsx
<TabsList className={`${TAB_CLASSES.list} flex-col md:flex-row`}>
  {/* Vertical em mobile, horizontal em desktop */}
</TabsList>
```

---

## ✅ Checklist de Implementação

Ao criar tabs em qualquer aba do dashboard:

- [ ] Importar `TAB_CLASSES` de `designSystem`
- [ ] Usar `TabsList` com `TAB_CLASSES.list`
- [ ] Aplicar `TAB_CLASSES.triggerX` conforme contexto
- [ ] Adicionar ícones para identificação visual
- [ ] Manter labels curtos (1-2 palavras)
- [ ] Limitar a 3-5 tabs por grupo
- [ ] Usar cores consistentes (verde=positivo, vermelho=alertas, etc)
- [ ] Adicionar espaçamento adequado no conteúdo (`mt-6`)
- [ ] Testar responsividade em diferentes telas

---

## 🚀 Benefícios

### Antes da Padronização
- ❌ Fundo colorido chamativo
- ❌ Baixo contraste
- ❌ Visual "amador"
- ❌ Inconsistente entre abas

### Depois da Padronização
- ✅ Border-bottom minimalista
- ✅ Alto contraste e legibilidade
- ✅ Visual profissional moderno
- ✅ 100% consistente

---

## 📚 Referências

- **Inspiração:** GitHub, Linear, Vercel
- **Padrão:** Material Design Tabs + Custom Dark Theme
- **Acessibilidade:** WCAG AAA (contraste 7:1+)

---

**Versão:** 1.0.0  
**Data:** Outubro 2025  
**Status:** ✅ Implementado e Pronto para Uso
