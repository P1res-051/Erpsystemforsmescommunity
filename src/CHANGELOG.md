# Changelog - Dashboard IPTV Analytics

## ✅ Versão 2.1 - Integração de API de Jogos e Refatoração de Código (Novembro 2025)

### 🎯 Principais Melhorias

#### 1. **Integração API de Jogos (UOL)**
- Adicionado backend em Python (`JOGOS.PY`) com Flask para servir dados de jogos em tempo real.
- `GamesView.tsx` agora consome a nova API local (`http://localhost:5000`), exibindo jogos em destaque e outros jogos do dia.
- Incluído indicador de status da API (Conectada/Offline) na interface.
- Criados scripts (`start-jogos-api.bat`, `start-jogos-api.sh`) para facilitar a inicialização.

#### 2. **Proxy do BotConversa Aprimorado**
- Revisado e validado o proxy FastAPI (`botconversa_proxy.py`) para comunicação com a API do BotConversa.
- Assegurada a funcionalidade dos modos simulado e real.

#### 3. **Correções de TypeScript e Build**
- Corrigidos múltiplos erros de tipo (TS7006, TS18047, TS2322, TS2367) em `QuickBilling.tsx`, `QuickInvoice.tsx`, `ClientsView.tsx`, `App.tsx`, e `FinancialView.tsx`.
- Normalizadas as importações em todos os componentes da UI (`src/components/ui/*.tsx`) para remover sufixos de versão, melhorando a manutenibilidade.

### 🔧 Melhorias Técnicas

#### Validação e Qualidade de Código
- Executados `npm run typecheck` e `npm run build` com sucesso, garantindo um código livre de erros de tipo e pronto para produção.
- Adicionada e atualizada a documentação sobre as novas funcionalidades de backend (`INTEGRACAO_JOGOS_UOL.md`, `PROXY_SETUP.md`).

### 📊 Componentes Atualizados
- `GamesView.tsx`
- `ClientsView.tsx`
- `App.tsx`
- `QuickBilling.tsx`
- `QuickInvoice.tsx`
- `FinancialView.tsx`
- Todos os componentes em `src/components/ui/`

---

## ✅ Versão 2.0 - Sistema de Cálculo Inteligente (Outubro 2025)

### 🎯 Principais Melhorias

#### 1. **Cálculo de Receita Real Baseado em Planos**
- O sistema agora mapeia automaticamente o campo `Custo` para o tipo de plano e preço correspondente
- **Tabela de Mapeamento Custo → Plano:**
  - `1 crédito` = Mensal (R$ 30-35, média R$ 32,50)
  - `1.5-2 créditos` = 2 Telas (R$ 50-60, média R$ 55)
  - `3 créditos` = Trimestral (R$ 75-100, média R$ 87,50)
  - `6 créditos` = Semestral (R$ 150-180, média R$ 165)
  - `12 créditos` = Anual (R$ 260-320, média R$ 290)

#### 2. **Novos KPIs Financeiros**
- **Receita Total**: Soma real de todas as vendas (conversões + renovações)
- **Ticket Médio Real**: Calculado como `Receita Total / (Conversões + Renovações)`
- **LTV Ajustado**: `Ticket Médio × 6 meses`
- **ROAS Real**: `Receita Total / Custo Total`
- **Saldo Médio Pós-Venda**: Média de créditos restantes após cada venda

#### 3. **Análise por Tipo de Plano**
- **Mix de Planos**: Gráfico de pizza mostrando distribuição de vendas por plano
- **Vendas por Plano**: Gráfico de barras com quantidade e receita de cada plano
- **Conversões por Plano**: Detalhamento de conversões por tipo de plano
- **Renovações por Plano**: Detalhamento de renovações por tipo de plano

#### 4. **Tempo até Conversão**
- Novo KPI: **Tempo Médio até Conversão** (em dias)
- Calcula o tempo entre a criação do teste e a conversão
- Usa mediana para evitar distorções de valores extremos
- Filtra valores absurdos (> 365 dias)

#### 5. **Análise de Jogos Aprimorada**
- Suporte completo para 3 períodos: **Antes**, **Durante** e **Depois**
- Gráfico de distribuição por período
- Percentuais calculados corretamente considerando os 3 períodos
- Identificação de padrões de conversão em relação aos jogos

#### 6. **Heatmap de Conversões**
- Matriz Hora × Dia da Semana
- Identifica os melhores horários e dias para conversões
- Dados preparados para visualização futura

### 🔧 Melhorias Técnicas

#### Processamento de Dados
- Funções utilitárias: `mapCustoToPlano()`, `extractHourFromDate()`, `daysDifference()`
- Cálculo automático de planos em `processConversoesCustos()` e `processRenovacoesCustos()`
- Validação e fallbacks para prevenir erros de dados faltantes

#### Exportação Excel
- Adicionados novos campos no resumo exportado:
  - Receita Total
  - Tempo Médio até Conversão
  - Saldo Médio Pós-Venda

#### Interface
- Banner informativo explicando o sistema de cálculo
- Todos os valores monetários formatados em pt-BR
- Proteções contra valores `undefined` em todos os componentes

### 📊 Componentes Atualizados

1. **FinancialView.tsx**
   - Card de Receita Total
   - Gráfico de Mix de Planos (Pizza)
   - Gráfico de Vendas por Plano (Barras duplas)
   - Banner informativo sobre cálculos

2. **ConversionView.tsx**
   - Card de Tempo Médio até Conversão
   - Card de Saldo Médio Pós-Venda

3. **GamesView.tsx**
   - Card de Conversões Depois dos Jogos
   - Gráfico atualizado com 3 períodos
   - Cálculos de percentuais corrigidos

4. **App.tsx**
   - Interface `DashboardData` expandida
   - Novos campos: `receitaTotal`, `saldoMedioPosVenda`, `conversoesPorPlano`, etc.
   - Função `calculateDerivedMetrics()` atualizada

### 🎨 Melhorias de UX

- Mensagens mais claras e em linguagem acessível
- Proteção contra erros com fallbacks (`|| 0`)
- Gráficos condicionais (só aparecem se há dados)
- Tooltips informativos em todos os gráficos

### 📋 Próximas Melhorias Sugeridas

- [ ] Visualização do Heatmap Hora × Dia
- [ ] Análise de cohort de clientes
- [ ] Previsão de receita com ML
- [ ] Dashboard de comparação mensal
- [ ] Alertas automáticos de performance

---

## Versão 1.0 - Dashboard Base

- Processamento de Excel com múltiplas abas
- Análise geográfica por DDD/UF
- Métricas de conversão e retenção
- Análise de jogos e impacto
- Exportação para Excel
- Logo AUTONOMYX
