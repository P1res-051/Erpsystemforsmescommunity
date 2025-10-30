# 🖼️ Guia Visual - Aba Geográfico

## 📱 Layout da Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                    🗺️ ABA GEOGRÁFICO                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📊 KPIs PRINCIPAIS (4 Cards)                                   │
├──────────┬──────────┬──────────┬──────────┐
│ Estados  │ Estado   │  DDDs    │ Telefones│
│ Cobertos │ Líder    │  Ativos  │ Processo.│
│ 18/27    │   SP     │   45     │   2.500  │
│ 66,7%    │ 450 cli. │  Top-5   │ 15 inval.│
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────────────────────────┐
│  💡 INSIGHTS AUTOMÁTICOS                                        │
│  ✅ SP concentra 22,4% da base total.                           │
│  ⚠️  BA tem 42 clientes vencendo em 7 dias.                     │
│  📈 Nordeste apresenta crescimento de 8% na base ativa.         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📑 TABS                                                        │
│  [ 🗺️ Mapa ] [ 📊 Gráficos ] [ 📋 Tabelas ]  [📥 Exportar]    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CONTEÚDO DA TAB SELECIONADA                                   │
│  (varia conforme a tab)                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Tab 1: MAPA

```
┌─────────────────────────────────────────────────────────────────┐
│                           MAPA                                  │
├────────────────────────────────┬────────────────────────────────┤
│                                │                                │
│   🗺️ MAPA DO BRASIL           │  📊 GRÁFICO PIZZA              │
│                                │                                │
│   ┌──────────────────────┐     │   ┌──────────────────────┐    │
│   │       RR   AP        │     │   │   Distribuição       │    │
│   │         \  /         │     │   │   por Região         │    │
│   │    AM    PA          │     │   │                      │    │
│   │   RO  /  │  \  MA    │     │   │   🔴 SE: 58%        │    │
│   │  AC  MT  TO  PI      │     │   │   🔵 S:  22%        │    │
│   │      │   GO  BA      │     │   │   🟠 NE: 15%        │    │
│   │     MS  /│\  PE      │     │   │   🟣 CO:  3%        │    │
│   │       DF MG  AL SE   │     │   │   🟢 N:   2%        │    │
│   │       SP RJ ES       │     │   │                      │    │
│   │      PR              │     │   └──────────────────────┘    │
│   │     SC   RS          │     │                                │
│   └──────────────────────┘     │  📋 DETALHES DO ESTADO        │
│                                │   (aparece ao clicar)          │
│  Estados coloridos por região  │                                │
│  Intensidade = nº clientes     │   📍 São Paulo                │
│  Clique para ver detalhes      │   Total: 450 clientes         │
│                                │   Ativos: 380 ✅              │
│                                │   Vencem 7d: 18 ⚠️            │
│                                │   Receita: R$ 15.200          │
│                                │   Ticket: R$ 33,78            │
│                                │   DDDs: 9                     │
└────────────────────────────────┴────────────────────────────────┘
```

**Cores do Mapa:**
- 🔴 Rosa = Sudeste (SE)
- 🔵 Azul = Sul (S)
- 🟠 Laranja = Nordeste (NE)
- 🟢 Verde = Norte (N)
- 🟣 Roxo = Centro-Oeste (CO)
- ⚫ Cinza escuro = Sem dados

---

## 📊 Tab 2: GRÁFICOS

```
┌─────────────────────────────────────────────────────────────────┐
│                        GRÁFICOS                                 │
├────────────────────────────────┬────────────────────────────────┤
│                                │                                │
│  📊 TOP 10 ESTADOS             │  📡 RADAR DE PERFORMANCE       │
│                                │                                │
│  SP ████████████████ 450       │          Receita               │
│  RJ ████████ 150               │            /\                  │
│  MG ██████ 120                 │           /  \                 │
│  BA █████ 90                   │  Churn --|    |-- Retenção    │
│  CE ████ 75                    │           \  /                 │
│  PR ████ 70                    │            \/                  │
│  RS ███ 60                     │           Ticket               │
│  SC ███ 55                     │                                │
│  PE ██ 45                      │  [Comparação entre 5 regiões]  │
│  GO ██ 40                      │                                │
│                                │                                │
└────────────────────────────────┴────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📞 HEATMAP DDD × STATUS (Top 20 DDDs)                          │
├─────┬────┬───────┬───────┬──────────┬──────────┬──────────┬─────┤
│ DDD │ UF │ Total │ Ativos│ Expirados│ Vencem 7d│Vencem 15d│ Dist│
├─────┼────┼───────┼───────┼──────────┼──────────┼──────────┼─────┤
│ (11)│ SP │  280  │  240  │    40    │    12    │    18    │█████│
│ (21)│ RJ │  150  │  130  │    20    │     8    │    12    │████ │
│ (85)│ CE │   90  │   75  │    15    │     5    │     8    │███  │
│ (71)│ BA │   80  │   60  │    20    │    14    │    20    │███  │
│ ... │    │  ...  │  ...  │   ...    │   ...    │   ...    │     │
└─────┴────┴───────┴───────┴──────────┴──────────┴──────────┴─────┘
```

**Legenda:**
- ✅ Verde = Ativos
- ❌ Vermelho = Expirados
- ⚠️ Amarelo = Vencem 7d
- 🟠 Laranja = Vencem 15d

---

## 📋 Tab 3: TABELAS

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 RANKING COMPLETO POR ESTADO                                 │
├────┬───────────┬──────────┬───────┬─────┬───────────┬──────────┤
│ UF │  Estado   │  Região  │ Total │  %  │Distribuiç.│ Vencem 7d│
├────┼───────────┼──────────┼───────┼─────┼───────────┼──────────┤
│ SP │ São Paulo │ Sudeste  │  450  │28.0%│████████░░│    18    │
│ RJ │ Rio de J. │ Sudeste  │  150  │ 9.3%│██████░░░░│     8    │
│ MG │ Minas Ger.│ Sudeste  │  120  │ 7.5%│█████░░░░░│     6    │
│ BA │ Bahia     │ Nordeste │   90  │ 5.6%│████░░░░░░│    14    │
│ CE │ Ceará     │ Nordeste │   75  │ 4.7%│███░░░░░░░│     5    │
│ PR │ Paraná    │ Sul      │   70  │ 4.4%│███░░░░░░░│     4    │
│... │    ...    │   ...    │  ...  │ ... │    ...    │   ...    │
└────┴───────────┴──────────┴───────┴─────┴───────────┴──────────┘
│  ... mais 6 colunas: Vencem 15d, Fiéis, Churn%, etc.           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ❌ TELEFONES INVÁLIDOS (15 encontrados)                        │
├─────────────────────────────────┬───────────────────────────────┤
│ Telefone Original               │ Motivo                        │
├─────────────────────────────────┼───────────────────────────────┤
│ 123456789                       │ Formato inválido              │
│ 00987654321                     │ DDD inválido                  │
│ (vazio)                         │ Formato inválido              │
│ 01123456789                     │ DDD inválido                  │
│ NULL                            │ Formato inválido              │
│ ...                             │ ...                           │
└─────────────────────────────────┴───────────────────────────────┘
```

---

## 📥 EXPORTAÇÃO EXCEL

```
┌─────────────────────────────────────────────────────────────────┐
│  ARQUIVO: analise_geografica_2025-10-28.xlsx                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📑 ABA 1: Ranking UF                                           │
│  ├─ 27 linhas (todos os estados identificados)                 │
│  └─ 13 colunas: UF, Estado, Região, Total, %, Ativos, ...     │
│                                                                 │
│  📑 ABA 2: Por Região                                           │
│  ├─ 5 linhas (5 regiões brasileiras)                          │
│  └─ 11 colunas: Região, Total, Ativos, Receita, ...           │
│                                                                 │
│  📑 ABA 3: DDDs                                                 │
│  ├─ N linhas (todos os DDDs encontrados)                       │
│  └─ 7 colunas: DDD, UF, Total, Ativos, Vencem 7d, ...         │
│                                                                 │
│  📑 ABA 4: Inválidos (se houver)                                │
│  ├─ N linhas (telefones rejeitados)                            │
│  └─ 2 colunas: Telefone, Motivo                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Paleta de Cores

### Por Região

```
🔴 Sudeste (SE)        #ec4899  ████  Rosa
🔵 Sul (S)             #06b6d4  ████  Azul/Ciano
🟠 Nordeste (NE)       #f59e0b  ████  Laranja
🟢 Norte (N)           #10b981  ████  Verde
🟣 Centro-Oeste (CO)   #8b5cf6  ████  Roxo
```

### Por Status

```
✅ Ativo               #10b981  ████  Verde
❌ Expirado            #ef4444  ████  Vermelho
⚠️  Vencem 7d          #fbbf24  ████  Amarelo
🟠 Vencem 15d          #f97316  ████  Laranja
⚫ Sem dados           #1e293b  ████  Cinza escuro
```

---

## 🔢 Exemplos de Métricas

### KPI Card: Estados Cobertos

```
┌────────────────────────────────┐
│  🗺️  Estados Cobertos          │
│                                │
│        18/27                   │
│   ━━━━━━━━━━━━━━━━━━━━        │
│   66,7% cobertura nacional     │
│                                │
└────────────────────────────────┘
```

### KPI Card: Estado Líder

```
┌────────────────────────────────┐
│  🎯  Estado Líder              │
│                                │
│     São Paulo                  │
│   450 clientes (28,0%)         │
│                                │
└────────────────────────────────┘
```

### Insight Automático

```
┌─────────────────────────────────────────────────────────────────┐
│  💡 INSIGHTS AUTOMÁTICOS                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ℹ️  SP concentra 22,4% da base total.                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  ⚠️  BA tem 42 clientes vencendo em 7 dias.                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  ✅ Nordeste apresenta crescimento de 8% na base ativa.         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Exemplo de Dados Processados

### Input (Excel)

```
| Telefone      | Status | Vencimento | Plano |
|---------------|--------|------------|-------|
| 5511987654321 | Ativo  | 2025-11-05 | 1     |
| 2198765432    | Ativo  | 2025-10-30 | 3     |
| 8598765432    | Expirado| 2025-10-20| 1     |
```

### Output (Processado)

```
Telefone 1:
├─ DDD: 11
├─ UF: SP
├─ Região: Sudeste (SE)
├─ Status: Ativo ✅
├─ Vence em: 8 dias
└─ Alerta: Não ⬜

Telefone 2:
├─ DDD: 21
├─ UF: RJ
├─ Região: Sudeste (SE)
├─ Status: Ativo ✅
├─ Vence em: 2 dias
└─ Alerta: Sim (Vencem 7d) ⚠️

Telefone 3:
├─ DDD: 85
├─ UF: CE
├─ Região: Nordeste (NE)
├─ Status: Expirado ❌
├─ Vencido há: 8 dias
└─ Alerta: Vencido 30d ⚠️
```

---

## 🎯 Fluxo de Uso

```
┌─────────────────────────────────────────────────────────────────┐
│  1️⃣  IMPORTAR EXCEL                                             │
│      └─ Clicar em "Importar Excel"                             │
│      └─ Selecionar arquivo                                     │
│      └─ Aguardar processamento                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  2️⃣  VER KPIS NO TOPO                                           │
│      └─ Estados Cobertos: 18/27                                │
│      └─ Estado Líder: SP (450 clientes)                        │
│      └─ DDDs Ativos: 45                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  3️⃣  LER INSIGHTS                                               │
│      └─ "SP concentra 22,4% da base"                           │
│      └─ "BA tem 42 vencendo em 7 dias"                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  4️⃣  NAVEGAR ENTRE ABAS                                         │
│      └─ Mapa: Ver distribuição visual                         │
│      └─ Gráficos: Análises comparativas                       │
│      └─ Tabelas: Dados detalhados                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  5️⃣  EXPORTAR DADOS                                             │
│      └─ Clicar em "Exportar Excel"                            │
│      └─ Abrir arquivo baixado                                 │
│      └─ Usar para análises externas                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Detalhes Visuais

### Barra de Distribuição (Ativo/Expirado)

```
Visualização em Tabela:

┌─────────────────────────────────────────┐
│ Distribuição:                           │
│ ████████████████░░░░                    │
│ ↑ 80% Ativos    ↑ 20% Expirados         │
└─────────────────────────────────────────┘
```

### Badge de Status

```
┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐
│ SP  │   │ Ativ│   │  18 │   │52,3%│
└─────┘   └─────┘   └─────┘   └─────┘
  UF      Status    Vencem7d   Churn
```

### Tooltip do Mapa

```
┌────────────────────────────┐
│  📍 São Paulo              │
├────────────────────────────┤
│  Total: 450 clientes       │
│  Ativos: 380 (84,4%)      │
│  Vencem 7d: 18            │
│  Receita: R$ 15.200       │
│  Região: Sudeste          │
└────────────────────────────┘
```

---

## 🎓 Legenda de Ícones

```
🗺️  = Mapa
📊 = Gráficos
📋 = Tabelas
📥 = Exportar
💡 = Insights
✅ = Ativo
❌ = Expirado
⚠️  = Alerta/Aviso
🎯 = Meta/Objetivo
📈 = Crescimento
📉 = Queda
🔴 = Sudeste
🔵 = Sul
🟠 = Nordeste
🟢 = Norte
🟣 = Centro-Oeste
⚫ = Sem dados
```

---

## 📱 Responsividade

### Desktop (> 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│  [4 KPIs lado a lado]                                           │
│  [Insights]                                                     │
│  [Tabs]                                                         │
│  [ Mapa 2/3 ]  [ Pizza + Detalhes 1/3 ]                        │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)

```
┌─────────────────┐
│  [KPI 1]        │
│  [KPI 2]        │
│  [KPI 3]        │
│  [KPI 4]        │
│  [Insights]     │
│  [Tabs]         │
│  [Mapa 100%]    │
│  [Pizza 100%]   │
│  [Detalhes 100%]│
└─────────────────┘
```

---

**Versão**: 2.1  
**Última Atualização**: Outubro 2025  
**Guia**: Visual e Layout da Aba Geográfico
