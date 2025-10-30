# 💼 Exemplos Práticos - Aba Geográfico

## 🎯 Casos de Uso Reais

### Caso 1: Identificar Oportunidades de Expansão

**Situação**: Você quer expandir para novos estados

**Como usar:**

1. Acesse a aba **Geografia** → **Mapa**
2. Observe o **KPI "Estados Cobertos"**
   - Ex: "18/27 estados" = 66,7% de cobertura
3. Verifique o **Mapa do Brasil**
   - Estados em cinza escuro = SEM clientes
   - Estados coloridos = COM clientes
4. Analise o **Gráfico de Pizza** (Por Região)
   - Identifique regiões com baixa presença

**Resultado:**
```
✅ Estados sem cobertura: AC, RR, AP, TO, MS, RO, PI, MA, RN
✅ Região com menor presença: Norte (apenas 5%)
✅ Ação recomendada: Investir em ADS para região Norte
```

---

### Caso 2: Prevenir Churn em Estados Específicos

**Situação**: Você quer evitar perda de clientes

**Como usar:**

1. Acesse a aba **Geografia** → **Tabelas**
2. Ordene a coluna **"Vencem 7d"** (ordem decrescente)
3. Identifique estados com MAIS vencimentos iminentes
4. Leia os **Insights Automáticos**

**Exemplo de Insight:**
```
⚠️ "BA tem 42 clientes vencendo em 7 dias."
```

**Ação:**
1. Exportar clientes de BA que vencem em 7 dias
2. Criar TAG no BotConversa: "BA_VENCE_7D"
3. Enviar campanha de renovação com desconto

**Resultado Esperado:**
- Retenção de 60-80% dos 42 clientes
- Receita preservada: ~R$ 1.260 (42 × R$ 30)

---

### Caso 3: Análise de Rentabilidade por Região

**Situação**: Descobrir qual região traz mais receita

**Como usar:**

1. Acesse **Geografia** → **Gráficos**
2. Veja o **Radar de Performance Regional**
   - Eixo "Receita" mostra receita em milhares
3. Ou clique em **"Exportar Excel"**
4. Abra a aba **"Por Região"**
5. Ordene por **"Receita Total"**

**Exemplo de Resultado:**

| Região | Receita Total | Ticket Médio | Clientes |
|--------|---------------|--------------|----------|
| Sudeste | R$ 45.600 | R$ 38,00 | 1.200 |
| Sul | R$ 18.200 | R$ 35,00 | 520 |
| Nordeste | R$ 12.400 | R$ 31,00 | 400 |
| Centro-Oeste | R$ 6.800 | R$ 34,00 | 200 |
| Norte | R$ 2.100 | R$ 30,00 | 70 |

**Insights:**
- Sudeste = 53% da receita total
- Ticket médio similar em todas as regiões
- Norte tem potencial inexplorado

---

### Caso 4: Identificar Estados com Alto Churn

**Situação**: Entender onde há mais perda de clientes

**Como usar:**

1. Acesse **Geografia** → **Tabelas**
2. Ordene a coluna **"Churn %"** (ordem decrescente)
3. Identifique estados com churn > 40%

**Exemplo:**

| UF | Estado | Churn % | Total | Expirados |
|----|--------|---------|-------|-----------|
| RN | Rio Grande do Norte | 68% | 50 | 34 |
| PI | Piauí | 55% | 40 | 22 |
| AL | Alagoas | 52% | 60 | 31 |

**Ações Recomendadas:**
1. **RN**: Investigar problemas de qualidade de serviço
2. **PI**: Enviar pesquisa de satisfação
3. **AL**: Criar campanha de win-back

**Benefício:**
- Reduzir churn de 68% → 40% em RN = salvar 14 clientes
- Receita recuperada: ~R$ 420/mês

---

### Caso 5: Planejar Campanha Regional de Marketing

**Situação**: Investir em ADS para região específica

**Como usar:**

1. Acesse **Geografia** → **Mapa**
2. Clique em um **estado colorido** (ex: SP)
3. Veja o **Card de Detalhes** que aparece
4. Analise:
   - Total de clientes
   - Receita atual
   - Ticket médio
   - DDDs ativos

**Exemplo - São Paulo:**
```
📊 São Paulo
├─ Total: 450 clientes
├─ Ativos: 380
├─ Vencem 7d: 18
├─ Receita: R$ 15.200
├─ Ticket Médio: R$ 33,78
└─ DDDs: 9 (11, 12, 13, 14, 15, 16, 17, 18, 19)
```

**Estratégia:**
1. Investir R$ 1.000 em ADS no Google/Facebook
2. Segmentar: São Paulo, DDDs 11-19
3. Meta: Captar 100 novos clientes
4. ROI Esperado: 100 × R$ 33,78 = R$ 3.378
5. Lucro: R$ 3.378 - R$ 1.000 = R$ 2.378

---

### Caso 6: Validar Qualidade dos Dados

**Situação**: Verificar se os telefones estão corretos

**Como usar:**

1. Importar Excel
2. Ir em **Geografia** → **Tabelas**
3. Rolar até **"Telefones Inválidos"**
4. Analisar a tabela

**Exemplo:**

| Telefone | Motivo |
|----------|--------|
| 123456789 | Formato inválido |
| 00987654321 | DDD inválido |
| (vazio) | Formato inválido |

**Ações:**
1. Voltar ao Excel original
2. Corrigir telefones listados
3. Reimportar arquivo
4. Verificar se a lista de inválidos diminuiu

**Resultado:**
- Antes: 15 inválidos
- Depois: 2 inválidos
- Melhoria: 87% dos dados corrigidos

---

### Caso 7: Comparar Performance de DDDs

**Situação**: Descobrir quais DDDs trazem mais clientes

**Como usar:**

1. Acesse **Geografia** → **Gráficos**
2. Role até **"Top 20 DDDs - Distribuição por Status"**
3. Analise a tabela

**Exemplo:**

| DDD | UF | Total | Ativos | Expirados | Vencem 7d |
|-----|----|----|--------|-----------|-----------|
| (11) | SP | 280 | 240 | 40 | 12 |
| (21) | RJ | 150 | 130 | 20 | 8 |
| (85) | CE | 90 | 75 | 15 | 5 |
| (71) | BA | 80 | 60 | 20 | 14 |

**Insights:**
- DDD 11 (SP) = 28% da base total
- DDD 71 (BA) tem alto risco (14 vencem em 7d)
- DDD 21 (RJ) tem boa retenção (86% ativos)

**Ações:**
1. Priorizar campanha para DDD 71
2. Replicar estratégia do DDD 21 em outros estados
3. Expandir investimento em DDD 11

---

### Caso 8: Exportar Relatório para Investidores

**Situação**: Apresentar análise geográfica para stakeholders

**Como usar:**

1. Acesse **Geografia** → qualquer aba
2. Clique em **"Exportar Excel"**
3. Abra o arquivo baixado
4. Verifique as 4 abas:
   - **Ranking UF**: Para análise estadual
   - **Por Região**: Para visão macro
   - **DDDs**: Para detalhamento
   - **Inválidos**: Para qualidade de dados

**Como apresentar:**

```
📊 Apresentação para Investidores

Slide 1 - Cobertura Nacional
- 18/27 estados cobertos (66,7%)
- 45 DDDs ativos
- 2.500 clientes processados

Slide 2 - Distribuição Regional
- Sudeste: 58% da base
- Sul: 22%
- Nordeste: 15%
- Centro-Oeste: 3%
- Norte: 2%

Slide 3 - Receita por Região
- Sudeste: R$ 45.600/mês
- Sul: R$ 18.200/mês
- Nordeste: R$ 12.400/mês
- Total: R$ 85.000/mês

Slide 4 - Oportunidades
- Expandir para Norte (97% de potencial não explorado)
- Reduzir churn em RN (68% → meta 35%)
- Investir em BA (alto volume, baixa retenção)
```

---

### Caso 9: Monitorar KPIs Semanalmente

**Situação**: Acompanhar evolução geográfica ao longo do tempo

**Como usar:**

**Semana 1:**
1. Importar Excel
2. Anotar KPIs:
   - Estados cobertos: 18/27
   - DDDs ativos: 45
   - Estado líder: SP (450 clientes)

**Semana 2:**
1. Importar novo Excel
2. Comparar:
   - Estados cobertos: 19/27 ✅ (+1)
   - DDDs ativos: 48 ✅ (+3)
   - Estado líder: SP (465 clientes) ✅ (+15)

**Semana 3:**
1. Identificar tendências
2. Ajustar estratégias

**Exemplo de Planilha de Acompanhamento:**

| Semana | Estados | DDDs | SP | RJ | MG | Total |
|--------|---------|------|----|----|----|----|
| 1 | 18 | 45 | 450 | 150 | 120 | 1.200 |
| 2 | 19 | 48 | 465 | 158 | 125 | 1.248 |
| 3 | 19 | 50 | 478 | 162 | 130 | 1.290 |
| 4 | 20 | 52 | 490 | 170 | 135 | 1.345 |

---

### Caso 10: Criar Campanhas Personalizadas por Estado

**Situação**: Enviar mensagens específicas por localização

**Como usar:**

1. Exportar Excel da aba Geografia
2. Abrir aba **"Ranking UF"**
3. Filtrar estados específicos
4. Usar integração BotConversa

**Exemplo - Campanha para o Nordeste:**

**Estados selecionados:** BA, CE, PE, RN

**Estratégia:**
```
TAG: NORDESTE_PROMO
Mensagem: 
"Olá! 🌞 Especial para o Nordeste! 
Renove agora e ganhe +7 dias GRÁTIS! 
Válido até domingo. 🎉"
```

**Passos:**
1. Filtrar clientes dos estados: BA, CE, PE, RN
2. Exportar números de telefone
3. Criar TAG no BotConversa
4. Enviar campanha segmentada

**Resultado Esperado:**
- 400 clientes impactados
- Taxa de conversão: 15%
- 60 renovações
- Receita: R$ 1.800

---

## 📊 Comparação: Antes vs Depois

### Antes da Aba Geográfico v2.1

❌ Não sabia quantos estados cobriam  
❌ Não tinha alertas de vencimento por região  
❌ Não conseguia validar telefones  
❌ Análise manual em Excel (demorada)  
❌ Sem insights automáticos  
❌ Sem visualizações por região  

### Depois da Aba Geográfico v2.1

✅ **18/27 estados cobertos (66,7%)**  
✅ **42 clientes vencem em 7 dias em BA** (alerta automático)  
✅ **15 telefones inválidos identificados** (correção rápida)  
✅ **Análise em 5 segundos** (automática)  
✅ **3 insights gerados** (ação imediata)  
✅ **5 regiões analisadas** (visão estratégica)  

---

## 🎯 Dicas de Uso Avançado

### Dica 1: Use Filtros do Excel Exportado
Após exportar, use filtros do Excel para análises customizadas:
- Filtrar estados com churn > 50%
- Ordenar por receita decrescente
- Destacar DDDs com vencimentos iminentes

### Dica 2: Combine com Outras Abas
- **Financeiro** → Ver receita por plano
- **Geografia** → Ver receita por estado
- **Combinação** → Descobrir qual plano vende mais em cada estado

### Dica 3: Monitore Semanalmente
Importe Excel toda segunda-feira e compare:
- Crescimento de estados
- Novos DDDs
- Mudanças no estado líder

### Dica 4: Crie Metas por Região
```
Meta Q1 2025:
- Sudeste: Manter 58% da base
- Sul: Crescer de 22% → 25%
- Nordeste: Crescer de 15% → 18%
- Norte: Alcançar 5% (atualmente 2%)
```

### Dica 5: Use Insights para Reuniões
Imprima ou apresente os insights automáticos em reuniões semanais:
- "SP concentra 28% da base"
- "BA tem 42 vencendo em 7 dias"
- "Nordeste +8% no mês"

---

## 📈 Exemplos de Métricas de Sucesso

### Objetivo 1: Aumentar Cobertura Nacional
- **Antes**: 15/27 estados (55%)
- **Meta**: 22/27 estados (81%)
- **Ação**: Investir em ADS em estados vazios
- **Prazo**: 6 meses

### Objetivo 2: Reduzir Churn Regional
- **Antes**: RN com 68% de churn
- **Meta**: RN com 35% de churn
- **Ação**: Campanha de retenção + melhoria de serviço
- **Prazo**: 3 meses

### Objetivo 3: Equilibrar Receita Regional
- **Antes**: Sudeste = 58%, Norte = 2%
- **Meta**: Sudeste = 50%, Norte = 8%
- **Ação**: Expansão estratégica para o Norte
- **Prazo**: 12 meses

---

## 🔥 Casos de Sucesso (Simulados)

### Case 1: Empresa XYZ - Expansão para o Norte

**Situação Inicial:**
- 0 clientes na região Norte
- Cobertura nacional: 55%

**Ações:**
1. Identificou estados sem cobertura via Mapa
2. Investiu R$ 5.000 em ADS no Pará e Amazonas
3. Monitorou crescimento semanalmente

**Resultados (90 dias):**
- 120 novos clientes no Norte
- Cobertura nacional: 70% (+15%)
- Receita adicional: R$ 3.600/mês
- ROI: 216% em 3 meses

---

### Case 2: Empresa ABC - Redução de Churn em BA

**Situação Inicial:**
- BA com 80 clientes, 50% de churn
- 40 clientes perdidos/mês

**Ações:**
1. Identificou 42 vencendo em 7 dias
2. Criou campanha urgente com desconto
3. Melhorou atendimento ao cliente

**Resultados (60 dias):**
- Churn reduzido de 50% → 30%
- 16 clientes salvos/mês
- Receita preservada: R$ 480/mês
- NPS aumentou de 6 → 8

---

## 💡 Perguntas Frequentes

### Q1: Como atualizar os dados?
**R**: Reimporte o Excel. Os dados são recalculados automaticamente.

### Q2: Posso filtrar por período?
**R**: Não diretamente. Exporte o Excel e use filtros manuais.

### Q3: Como corrigir telefones inválidos?
**R**: Veja a aba "Tabelas" → "Inválidos", corrija no Excel original, reimporte.

### Q4: O mapa não mostra meu estado. Por quê?
**R**: Nenhum cliente válido daquele estado. Verifique telefones.

### Q5: Posso exportar apenas um estado?
**R**: Sim. Exporte Excel completo, depois filtre no Excel.

---

**Última Atualização**: Outubro 2025  
**Versão**: 2.1  
**Exemplos**: 10 casos práticos + 2 cases de sucesso
