# 📍 Análise Geográfica Completa

## 🎯 Visão Geral

A aba **Geográfico** oferece análise completa da distribuição de clientes por localização, usando extração inteligente de DDD a partir do campo de telefone.

## 🚀 Funcionalidades Principais

### 📊 KPIs em Tempo Real

1. **Estados Cobertos**: Quantos dos 27 estados brasileiros têm clientes
2. **Cobertura Nacional**: Percentual de cobertura do Brasil
3. **Estado Líder**: Estado com maior número de clientes
4. **DDDs Ativos**: Quantidade de DDDs diferentes na base
5. **Concentração Top-5**: Percentual da base nos 5 principais estados

### 🔍 Extração Inteligente de DDD

O sistema extrai o DDD de diferentes formatos de telefone:

#### Exemplos Suportados:

```
✅ 557391774948  → DDD 73 → BA (Nordeste)
✅ 11952971214   → DDD 11 → SP (Sudeste)
✅ 558498198117  → DDD 84 → RN (Nordeste)
✅ 5521990348826 → DDD 21 → RJ (Sudeste)
✅ 553172282177  → DDD 31 → MG (Sudeste)
✅ 559891834768  → DDD 98 → MA (Nordeste)
✅ 557591510548  → DDD 75 → BA (Nordeste)
```

#### Regras de Extração:

1. Remove caracteres não numéricos
2. Se número começa com `55` (Brasil) → DDD = dígitos na posição [2:4]
3. Caso contrário → DDD = primeiros 2 dígitos [0:2]
4. Valida se DDD está entre 11-99
5. Mapeia DDD → UF → Região

### 📈 Métricas Calculadas por Estado

Para cada UF, o sistema calcula:

- **Total de Clientes**: Contagem total
- **Clientes Ativos**: Status = "Ativo"
- **Clientes Expirados**: Status = "Expirado"
- **Vencem em 7 dias**: Data de vencimento entre hoje e +7 dias
- **Vencem em 15 dias**: Data de vencimento entre hoje e +15 dias
- **Vencidos nos últimos 30 dias**: Vencimentos recentes
- **Clientes Fiéis**: Com 2 ou mais renovações
- **Receita Total**: Soma dos valores dos planos
- **Ticket Médio**: Receita ÷ Total de clientes
- **Churn Rate**: % de clientes expirados
- **DDDs Ativos**: Quantidade de DDDs diferentes no estado

### 🌍 Agregação por Região

5 regiões brasileiras com cores distintas:

| Região         | Cor     | Estados                                  |
| -------------- | ------- | ---------------------------------------- |
| **Sudeste**    | 🔴 Rosa | SP, RJ, MG, ES                           |
| **Sul**        | 🔵 Azul | PR, SC, RS                               |
| **Nordeste**   | 🟠 Laranja | BA, CE, PE, AL, SE, RN, PB, PI, MA    |
| **Norte**      | 🟢 Verde | AC, AM, AP, PA, RO, RR, TO              |
| **Centro-Oeste** | 🟣 Roxo | DF, GO, MT, MS                         |

### 🎯 Insights Automáticos

O sistema gera automaticamente insights como:

- **Concentração**: "SP concentra 22,4% da base total."
- **Risco de Churn**: "BA tem 42 clientes vencendo em 7 dias."
- **Crescimento**: "Nordeste +8% no mês na base ativa."

## 📊 Visualizações Disponíveis

### 1️⃣ Aba: Mapa

#### Mapa Interativo do Brasil
- Estados coloridos por região
- Intensidade baseada no número de clientes
- Clique em um estado para ver detalhes
- Tooltip com informações completas

#### Gráfico de Pizza - Por Região
- Distribuição percentual entre as 5 regiões
- Cores diferenciadas por região
- Rótulos com nome e percentual

#### Card de Detalhes do Estado (ao clicar)
- Total de clientes
- Clientes ativos
- Vencem em 7 e 15 dias
- Receita total e ticket médio
- Quantidade de DDDs

### 2️⃣ Aba: Gráficos

#### Top 10 Estados (Barras Horizontais)
- Ranking dos 10 estados com mais clientes
- Cores por região
- Ordenado por total de clientes

#### Radar de Performance Regional
- 5 eixos de análise:
  - **Receita**: Em milhares de reais
  - **Retenção %**: % de clientes ativos
  - **Ativos**: Base ativa (escala reduzida)
  - **Churn %**: Taxa de perda
  - **Ticket**: Ticket médio

#### Heatmap DDD × Status
- Top 20 DDDs
- Colunas: Total, Ativos, Expirados, Vencem 7d, Vencem 15d
- Barra visual de distribuição ativo/expirado

### 3️⃣ Aba: Tabelas

#### Ranking Completo por Estado
- Todos os 27 estados brasileiros
- 10 colunas de métricas
- Barra visual de distribuição
- Badges coloridos por status
- Ordenação por total de clientes

#### Validação de Telefones Inválidos
- Lista de telefones que não puderam ser processados
- Motivo da falha (DDD inválido ou formato incorreto)
- Primeiras 20 amostras
- Alertas visuais

## 📥 Exportação para Excel

Exporta 4 abas em um único arquivo:

### 1. **Ranking UF**
Colunas:
- UF, Estado, Região
- Total Clientes, Percentual
- Ativos, Expirados
- Vencem 7d, Vencem 15d
- Fiéis, Receita, Ticket Médio, Churn %
- DDDs Ativos

### 2. **Por Região**
Colunas:
- Região
- Total Clientes, Ativos, Expirados
- Receita Total, Ticket Médio
- Estados Cobertos, DDDs Ativos
- Fiéis, Vencem 7d, Vencem 15d

### 3. **DDDs**
Colunas:
- DDD, UF
- Total, Ativos, Expirados
- Vencem 7d, Vencem 15d

### 4. **Inválidos** (se houver)
Colunas:
- Telefone original
- Motivo da falha

## 🎨 Interface

### Cards de KPI
- **4 cards principais** no topo
- Ícones distintos e cores temáticas
- Métricas atualizadas em tempo real

### Cards de Insights
- **Insights automáticos** baseados em análise de dados
- 3 tipos: Sucesso (verde), Aviso (amarelo), Info (azul)
- Aparece apenas quando há insights relevantes

### Sistema de Tabs
- 3 abas: Mapa, Gráficos, Tabelas
- Transição suave entre visualizações
- Botão de exportação sempre visível

### Tema Dark
- Fundo cinza escuro (`#1f2937`)
- Bordas sutis (`#374151`)
- Texto claro para contraste
- Cores vibrantes para dados

## 🔧 Implementação Técnica

### Mapeamento Completo

```typescript
// 112 DDDs mapeados
DDD_MAP = {
  '11': { uf: 'SP', regiao: 'SE' },
  '21': { uf: 'RJ', regiao: 'SE' },
  '71': { uf: 'BA', regiao: 'NE' },
  // ... +109 DDDs
}
```

### Funções Principais

```typescript
// Extração de DDD
extractDDD(phone: string): string | null

// Extração completa de geolocalização
extractGeoFromPhone(phone: any): {
  ddd: string | null;
  uf: string | null;
  regiao: string | null;
  regiaoNome: string | null;
  isValid: boolean;
  original: string;
}
```

### Performance

- **useMemo** para cálculos pesados
- Processamento otimizado de arrays grandes
- Lazy loading de visualizações por tabs

## 📋 Fontes de Dados

### Campos Utilizados

**Clientes Ativos/Expirados:**
- `Telefone` ou `telefone` ou `Usuario` ou `usuario`
- `Status` ou `status`
- `Vencimento` ou `vencimento` ou `Data_Vencimento`
- `Plano` ou `plano`

**Renovações (para cálculo de fidelidade):**
- `Usuario` ou `usuario`

### Tratamento de Dados

1. Unifica clientes ativos e expirados
2. Extrai DDD de todos os formatos
3. Valida e filtra números inválidos
4. Calcula datas relativas (7d, 15d, 30d)
5. Agrega métricas por UF e Região
6. Gera insights automáticos

## ✅ Casos de Uso

### 1. Identificar Regiões de Crescimento
- Ver qual região tem mais clientes ativos
- Comparar crescimento regional no radar

### 2. Prevenir Churn Regional
- Verificar estados com muitos vencimentos em 7/15 dias
- Priorizar campanhas de retenção

### 3. Planejar Expansão
- Identificar estados/regiões sem cobertura
- Analisar cobertura nacional (%)

### 4. Análise de Rentabilidade
- Comparar ticket médio por estado
- Verificar receita total por região

### 5. Validação de Dados
- Identificar telefones inválidos
- Corrigir formatos de telefone no Excel

## 🐛 Diagnóstico de Problemas

### Telefones Não Processados

**Problema**: Telefones aparecem como inválidos

**Causas Comuns:**
1. DDD fora do intervalo 11-99
2. Número muito curto (< 10 dígitos)
3. DDD não existe no Brasil
4. Campo vazio ou nulo

**Solução**:
- Verificar formato no Excel
- Adicionar código do país (55) se necessário
- Conferir coluna "Telefones Inválidos" na aba Tabelas

### Mapa em Branco

**Problema**: Mapa não mostra estados coloridos

**Causa**: Nenhum telefone válido foi encontrado

**Solução**:
- Verificar se a coluna de telefone existe
- Conferir aba de validação
- Corrigir formatos no Excel de origem

## 🆕 Melhorias Futuras

- [ ] Evolução temporal por estado (últimos 6 meses)
- [ ] Mapa de calor por densidade de clientes
- [ ] Comparação de performance estado vs média nacional
- [ ] Alertas automáticos de risco de churn por região
- [ ] Exportação de relatório em PDF
- [ ] Filtros avançados (por data, status, região)

## 📞 Formatos de Telefone Aceitos

### ✅ Válidos

```
557391774948    // Com 55 + DDD + 9 dígitos
11952971214     // Sem 55 + DDD + 9 dígitos
5511952971214   // Com 55 + DDD + 9 dígitos
(11) 95297-1214 // Formatado (símbolos removidos)
+55 11 9 5297-1214 // Formatado internacional
```

### ❌ Inválidos

```
123456789       // Menos de 10 dígitos
00123456789     // DDD = 00 (inválido)
10987654321     // DDD = 10 (não existe)
                // Vazio
ABC123          // Caracteres inválidos sem números suficientes
```

## 📚 Referências

- **Anatel**: Plano de Numeração Brasileiro
- **DDDs do Brasil**: 112 códigos de área ativos
- **Regiões do Brasil**: IBGE (5 macrorregiões)

---

**Versão**: 2.0  
**Última Atualização**: Outubro 2025  
**Autor**: Dashboard IPTV Analytics
