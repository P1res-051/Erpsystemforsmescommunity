# 📖 Guia Rápido - Dashboard IPTV Analytics

## 🚀 Como Usar

### 1. Carregamento de Dados
1. Clique no botão **"Carregar Excel"** no topo da página
2. Selecione seu arquivo Excel (.xlsx ou .xls)
3. Aguarde o processamento (pode levar alguns segundos)
4. O dashboard será carregado automaticamente

### 2. Estrutura do Excel

Seu arquivo Excel deve conter as seguintes abas:

#### ✅ Abas Obrigatórias
- **Testes**: Usuários em período de teste
- **Conversões**: Vendas realizadas (teste → pago)
- **Renovações**: Clientes que renovaram
- **Clientes Ativos**: Base ativa atual
- **Clientes Expirados**: Clientes que cancelaram/expiraram

#### 📊 Abas Opcionais
- **Jogos**: Calendário de jogos de futebol
- **Conv x Jogos**: Cruzamento de conversões com jogos
- **Testes x Jogos**: Cruzamento de testes com jogos
- **Ativos x Jogos**: Cruzamento de ativos com jogos

### 3. Colunas Importantes

#### Na aba "Testes":
- `Usuario`: Número de telefone (ex: 5511978062542)
- `Criado_Em`: Data/hora de criação
- `Expira_Em`: Data/hora de expiração
- `Revendedor`: Nome do revendedor
- `Status`: "Ativo" ou "Expirado"

#### Na aba "Conversões" e "Renovações":
- `Usuario`: Número de telefone
- `Owner`: Revendedor responsável
- `Custo`: **IMPORTANTE** - Define o tipo de plano
- `Creditos_Apos`: Saldo restante após a venda
- `Data`: Data/hora da transação

#### Campo CUSTO - Mapeamento de Planos:
```
1     → Mensal      (R$ 32,50)
1.5-2 → 2 Telas     (R$ 55,00)
3     → Trimestral  (R$ 87,50)
6     → Semestral   (R$ 165,00)
12    → Anual       (R$ 290,00)
```

### 4. Navegação no Dashboard

O menu lateral possui 8 abas principais:

#### 📊 **Overview** (Dashboard)
- Resumo geral de todas as métricas
- Cards com principais KPIs
- Gráficos de tendência

#### 💰 **Financeiro**
- Receita Total, MRR e ARR
- Ticket Médio e LTV
- Mix de planos (gráfico pizza)
- Vendas por tipo de plano
- Evolução mensal do faturamento

#### 👥 **Clientes**
- Base ativa vs. expirada
- Clientes fiéis
- Busca de clientes específicos
- Lista dos clientes mais recentes

#### 🔄 **Retenção**
- Taxa de retenção e churn
- Distribuição de renovações
- Análise de fidelidade

#### 🎯 **Conversão**
- Taxa de conversão (%)
- Funil de vendas
- **Tempo médio até conversão**
- **Saldo médio pós-venda**
- Conversão por dia da semana

#### ⚽ **Jogos** (se disponível)
- Impacto de jogos nas conversões
- Análise **Antes / Durante / Depois**
- Top times que mais convertem
- Conversões por competição

#### 🗺️ **Geografia**
- Distribuição por estado (UF)
- Mapa de calor por DDD
- Top 10 estados

#### 📈 **Tráfego**
- Análise por turno (madrugada/manhã/tarde/noite)
- Melhor dia da semana
- Padrões de atividade

### 5. Como Interpretar os KPIs

#### 💵 **Receita Total**
Soma REAL de todas as vendas (conversões + renovações).
Calculada automaticamente a partir do campo `Custo`.

#### 📊 **Ticket Médio**
`Receita Total ÷ (Conversões + Renovações)`
Valor médio que cada cliente paga.

#### 💰 **MRR (Monthly Recurring Revenue)**
`Clientes Ativos × Ticket Médio`
Receita recorrente mensal estimada.

#### 💎 **LTV (Lifetime Value)**
`Ticket Médio × 6 meses`
Valor vitalício estimado de um cliente.

#### 📈 **Taxa de Conversão**
`(Conversões ÷ Testes) × 100`
Percentual de testes que viraram vendas.

#### 🔄 **Churn Rate**
`(Expirados ÷ Total) × 100`
Taxa de cancelamento.

#### ⏱️ **Tempo até Conversão**
Mediana de dias entre criar teste e realizar venda.
Valores < 1 dia = conversão muito rápida ✅
Valores > 7 dias = funil lento ⚠️

#### 💳 **Saldo Médio Pós-Venda**
Média de créditos que sobram na carteira após cada venda.
Útil para entender lucratividade real.

### 6. Exportação de Dados

Clique no botão **"Exportar Excel"** para:
- Baixar relatório completo em Excel
- Resumo de todas as métricas
- Dados por dia da semana
- Top times (se houver dados de jogos)
- Lista completa de clientes

### 7. Dicas de Uso

✅ **Faça upload regularmente**: Os dados são salvos no navegador, mas podem ser perdidos ao limpar cache.

✅ **Compare períodos**: Use filtros de data para comparar meses diferentes.

✅ **Analise padrões**: Observe quais dias/turnos têm melhor conversão.

✅ **Acompanhe o Mix de Planos**: Identifique quais planos vendem mais.

✅ **Monitore o Tempo de Conversão**: Quanto menor, melhor sua taxa de fechamento.

### 8. Troubleshooting

**Erro ao carregar Excel?**
- Verifique se o arquivo está no formato .xlsx ou .xls
- Confirme que as abas têm os nomes corretos
- Certifique-se que as colunas obrigatórias existem

**Dados incorretos?**
- Verifique o campo `Custo` nas conversões
- Confirme que as datas estão no formato ISO 8601
- Certifique-se que o campo `Usuario` é consistente

**Gráficos vazios?**
- Pode não haver dados para o filtro selecionado
- Verifique se as datas estão dentro do período válido

---

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação técnica em `CHANGELOG.md`.
