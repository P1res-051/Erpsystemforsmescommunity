# Redesenho da Timeline Financeira

## Data: 31/10/2025

## Problema Identificado

A timeline financeira apresentava 4 pontos de desproporção:

1. **Faixa de dias muito "cheia" de cor** - Excesso de gradientes e brilhos
2. **Cards de baixo muito grandes** - Desproporção em relação aos cards da timeline
3. **Glow verde do container brigando** - Conflito visual com o card "HOJE"
4. **Pouco ar entre timeline e dashboard** - Falta de espaçamento vertical

## Solução Implementada

### 1. Cabeçalho da Seção (46px altura)
- **Background**: `#0B0F18`
- **Layout**: Título + subtítulo à esquerda | Filtros à direita
- **Título**: "Linha do tempo financeira" (14px, #EAF2FF, ícone verde #00E894)
- **Subtítulo**: "Últimos 7 dias • clique para detalhar" (12px, #7A8AAE)
- **Filtros**: Pills com "7d" | "30d" | "90d"
  - Background: `rgba(255,255,255,0.02)`
  - Borda: `#233047`
  - Texto: `#CCD7EE`
  - Ativo: Background `rgba(0,232,148,0.12)`, borda `#00E894`

### 2. Cards da Timeline (Compactos)

**Dimensões**: 98px × 120px (reduzidos de 105px × 140px)

**Card Padrão**:
```css
background: radial-gradient(circle at top, #141a29 0%, #0b0f18 42%, #0b0f18 100%);
border: 1px solid rgba(255,255,255,0.02);
border-radius: 12px;
padding: 6px 7px 8px;
gap: 3px;
```

**Badge do dia**:
- Background: `#101624`
- Borda: `1px solid rgba(255,73,196,0.25)`
- Cor: `#FF5BD2`
- Font: 10px, peso 600
- Formato: pill (border-radius: 999px)

**Número do dia**:
- Font: 20px (reduzido de 22px)
- Peso: 700
- Cor: `#FF29C5`

**Métricas**:
- Font: 10px
- Cores:
  - Líquido: `#22E3AF`
  - Renovações: `#A48BFF`
  - Perdas: `#FF4A9A`

**Card "HOJE"** (diferenciado):
```css
background: linear-gradient(180deg, #00ffc6 0%, #0083ff 100%);
transform: translateY(-4px);
box-shadow: 0 14px 40px rgba(0,255,166,0.25);
color: #042030;
```

### 3. Painel do Dia Selecionado

**Layout**: 2 colunas (240px + 1fr)

**Container**:
```css
margin-top: 8px; /* Espaçamento aumentado */
background: radial-gradient(circle at top, #0f1724 0%, #0b0f18 40%, #0b0f18 100%);
border: 1px solid rgba(0,255,166,0.35); /* Sem glow externo */
border-radius: 16px;
padding: 14px 16px;
gap: 18px;
```

**Coluna Esquerda** (Menu):
- Width: 240px fixa
- Background: `#0B121D`
- Detalhes do dia selecionado

**Coluna Direita** (Grid de Métricas):
- Grid: `repeat(auto-fit, minmax(150px, 1fr))`
- Gap: 14px
- Cards compactos com background `rgba(7,10,16,0.35)`
- Card destacado com gradiente radial verde suave

### 4. Hierarquia Visual Final

```
┌─────────────────────────────────────────────┐
│ CABEÇALHO (46px)                            │
│ Título + Filtros                            │
└─────────────────────────────────────────────┘
         ↓ (pequeno espaço)
┌─────────────────────────────────────────────┐
│ FAIXA DE DIAS (130px)                       │
│ [Card] [Card] [Card] [HOJE] [Card]          │
└─────────────────────────────────────────────┘
         ↓ (8px de espaço)
┌─────────────────────────────────────────────┐
│ PAINEL DO DIA                               │
│ ┌──────────┬────────────────────────────┐  │
│ │  Menu    │  Grid de Métricas          │  │
│ │ (240px)  │  3 cards compactos         │  │
│ └──────────┴────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Benefícios

✅ **Desproporção resolvida** - Cards mais compactos (98px × 120px)
✅ **Menos competição visual** - Remoção do glow verde excessivo
✅ **Card "HOJE" se destaca** - Gradiente vibrante + elevação + shadow
✅ **Melhor leitura** - Hierarquia clara e espaçamento adequado
✅ **Layout organizado** - 2 colunas no painel de detalhes

## Arquivos Modificados

- `/components/TimelineCard3D.tsx` - Cards compactos com novo estilo
- `/components/FinancialView.tsx` - Novo cabeçalho, timeline e painel refatorados

## Próximos Passos Sugeridos

- Adicionar animações suaves nos cards ao hover
- Implementar transições ao trocar de dia selecionado
- Expandir métricas do painel com mais dados relevantes
