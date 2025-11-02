# 🚀 Guia Rápido - Módulo Tráfego Facebook Ads

## ⚡ Início Rápido (5 minutos)

### **1. Acesse o Módulo**
```
Dashboard → Financial → Tráfego e Custos
```

### **2. Registre Seu Primeiro Gasto**
1. **Clique em qualquer dia** do calendário
2. **Digite o valor** gasto no Facebook Ads (ex: 120.50)
3. **Clique "Salvar"**
4. ✅ Pronto! O dia agora mostra o valor e ROI calculado

### **3. Visualize os Resultados**
- 📊 **Calendário**: Veja todos os dias do mês com valores
- 📈 **Gráficos**: Scroll para baixo e veja evolução de 30 dias
- 💡 **Insights**: Alertas automáticos sobre performance

---

## 🎯 Funcionalidades Principais

### **📅 Calendário Interativo**

**Como usar:**
- **Clicar em um dia** → Abre modal para editar valor
- **Hover sobre dia** → Mostra tooltip com detalhes
- **Setas ← →** → Navega entre meses
- **Hoje**: Destacado com borda azul

**Exemplo de célula:**
```
     12
  R$ 120
ROI: 3.2x
```

---

### **💰 Modal de Edição**

**Atalhos:**
- **Tab**: Navegar entre campos
- **Enter**: Salvar
- **ESC**: Cancelar
- **Botão "Copiar do anterior"**: Auto-preenche com valor do dia anterior

**Dica:** Use "Copiar do anterior" para meses com investimento diário fixo!

---

### **📊 4 KPIs do Mês**

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Gasto Total  │ Conversões   │ ROI Médio    │ CPL         │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ R$ 3.450     │ 42 vendas    │ 3.2x         │ R$ 82,14    │
│ 12 dias      │ 58.3% total  │ ✅ Excelente │ Por lead    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Cores do ROI:**
- 🟢 **Verde (≥2x)**: Excelente
- 🟡 **Amarelo (1-2x)**: Regular
- 🔴 **Vermelho (<1x)**: Baixo

---

### **📈 Gráficos de Análise**

#### **1. Linha Temporal (30 dias)**
Mostra evolução de:
- Azul: Gasto Facebook
- Verde: Receita do tráfego
- Laranja: Receita da base

#### **2. Pizza: Distribuição**
Proporção entre:
- 🟢 Tráfego Pago (novos clientes)
- 🟠 Base Recorrente (renovações)

#### **3. Barras: ROI e CPL**
Performance dos últimos 7 dias com investimento

---

### **💡 Insights Automáticos**

O sistema analisa seus dados e gera alertas:

**Positivos (verde):**
- 📈 "ROI cresceu 12.5% nesta semana"
- ✅ "Conversões superaram renovações"
- 🎯 "ROI excelente de 3.2x"

**Alertas (vermelho):**
- ⚠️ "Gasto acima da média nos últimos 3 dias"
- 🚫 "2 dias sem conversões"

---

## 🎬 Casos de Uso Práticos

### **Caso 1: Investimento Diário Fixo**

**Cenário:** Você investe R$ 100/dia todo mês

**Solução rápida:**
1. Dia 1: Insira R$ 100
2. Dias seguintes: Use "Copiar do anterior"
3. 30 cliques = mês completo preenchido

**Tempo:** < 2 minutos

---

### **Caso 2: Investimento Variável**

**Cenário:** Você aumenta investimento em dias específicos (fins de semana, datas especiais)

**Exemplo:**
- Segunda a Quinta: R$ 80
- Sexta a Domingo: R$ 150

**Dica:** Preencha por semana, usando "Copiar" para dias iguais

---

### **Caso 3: Análise de Performance**

**Objetivo:** Descobrir se vale a pena continuar investindo

**Passos:**
1. Preencha pelo menos 7 dias
2. Veja os gráficos:
   - ROI médio > 2x? ✅ Continue
   - ROI médio < 1x? ⚠️ Reveja estratégia
3. Leia os insights automáticos
4. Ajuste investimento baseado em dados

---

### **Caso 4: Comparação Mensal**

**Objetivo:** Comparar outubro vs setembro

**Passos:**
1. Navegue para Outubro (atual)
2. Veja "Total Gasto" e "ROI Médio"
3. Clique ← para Setembro
4. Compare os números
5. Identifique tendências

---

## 🔧 Dicas e Truques

### **1. Preenchimento Rápido**

**Método do "Bloco":**
```
Semana 1: R$ 100/dia (5 cliques com "Copiar")
Semana 2: R$ 120/dia (5 cliques)
Semana 3: R$ 80/dia (5 cliques)
Semana 4: R$ 100/dia (5 cliques)
```
**Total:** 20 cliques para o mês inteiro

---

### **2. Correção de Erros**

**Erro comum:** Digitou R$ 1200 em vez de R$ 120

**Solução:**
1. Clique no dia com erro
2. Corrija o valor
3. Salve
4. Gráficos atualizam automaticamente

---

### **3. Exportar Dados** (Futuro)

**Nota:** Por enquanto, dados ficam no navegador (localStorage)

**Backup manual:**
1. Abra Console (F12)
2. Digite: `localStorage.getItem('facebook_ads_spends')`
3. Copie o JSON resultante
4. Cole em um arquivo .txt

---

### **4. Limpar Dados de Teste**

**Se preencheu valores de teste:**
1. Abra Console (F12)
2. Digite: `localStorage.removeItem('facebook_ads_spends')`
3. Recarregue a página (F5)
4. Calendário volta vazio

---

## ❓ FAQ

### **P: Os dados ficam salvos?**
**R:** Sim! Ficam no navegador (localStorage). Não serão perdidos ao recarregar a página.

### **P: Posso editar dias passados?**
**R:** Sim! Clique em qualquer dia para editar.

### **P: Como funciona o cálculo de ROI?**
**R:** `ROI = Receita Tráfego / Gasto Facebook`

**Exemplo:**
- Gasto: R$ 100
- Conversões: 4 vendas
- Ticket médio: R$ 30
- Receita: 4 × R$ 30 = R$ 120
- ROI: R$ 120 / R$ 100 = **1.2x**

### **P: O que é CPL?**
**R:** Custo Por Lead (ou venda). Quanto você paga por cada nova venda.

**Fórmula:** `CPL = Gasto Total / Total de Conversões`

**Exemplo:**
- Gasto mensal: R$ 3.000
- Conversões: 40 vendas
- CPL: R$ 3.000 / 40 = **R$ 75 por venda**

### **P: Conversões aparecem automaticamente?**
**R:** Por enquanto são simuladas. Na versão final, virão dos seus logs reais de vendas.

### **P: Posso registrar outros canais (Google, TikTok)?**
**R:** Por enquanto só Facebook. Novos canais virão em versões futuras.

### **P: Os insights são confiáveis?**
**R:** Sim! São baseados em análise estatística dos seus dados. Mas sempre use bom senso e contexto do negócio.

---

## 📊 Interpretando os Números

### **ROI Bom:**

| ROI | Interpretação | Ação |
|-----|---------------|------|
| **3x+** | 🟢 Excelente | Continue investindo, considere aumentar |
| **2-3x** | 🟢 Bom | Mantenha estratégia atual |
| **1-2x** | 🟡 Regular | Monitore de perto, otimize campanhas |
| **<1x** | 🔴 Prejuízo | Reveja urgentemente ou pause |

### **CPL Ideal:**

Depende do seu ticket médio:

- **Ticket R$ 30**: CPL ideal < R$ 10 (ROI > 3x)
- **Ticket R$ 50**: CPL ideal < R$ 17 (ROI > 3x)
- **Ticket R$ 75**: CPL ideal < R$ 25 (ROI > 3x)

**Regra geral:** CPL deve ser no máximo 33% do ticket médio para ROI > 3x

---

## 🎯 Metas Sugeridas

### **Iniciante (Primeiros 3 meses):**
- ✅ ROI > 1.5x (lucro)
- ✅ CPL < R$ 50
- ✅ 10+ conversões/mês

### **Intermediário (3-6 meses):**
- ✅ ROI > 2.5x
- ✅ CPL < R$ 30
- ✅ 30+ conversões/mês

### **Avançado (6+ meses):**
- ✅ ROI > 3.5x
- ✅ CPL < R$ 20
- ✅ 50+ conversões/mês

---

## 🚨 Alertas Importantes

### **🔴 Atenção se:**
- ROI < 1x por 7 dias consecutivos
- CPL > R$ 100
- 3+ dias sem conversões com investimento ativo
- Gasto mensal > R$ 5.000 sem análise

### **🟢 Comemore se:**
- ROI > 4x
- CPL < R$ 15
- Mix tráfego > 60% (mais novos que renovações)
- Crescimento de ROI semana após semana

---

## 📱 Atalhos do Teclado

**No calendário:**
- `←` `→`: Navegar entre meses
- `Clique`: Editar dia

**No modal:**
- `Tab`: Próximo campo
- `Enter`: Salvar
- `ESC`: Cancelar
- `Ctrl+V`: Colar valor

---

## 🎓 Próximos Passos

### **Após dominar o básico:**
1. **Analise padrões**: Qual dia da semana converte mais?
2. **Teste valores**: Aumente/diminua investimento e compare ROI
3. **Acompanhe tendências**: ROI está crescendo ou caindo?
4. **Otimize campanhas**: Use dados para melhorar anúncios
5. **Escale com segurança**: Aumente investimento gradualmente

### **Integração futura:**
- ✨ Importação automática via API Facebook
- ✨ Múltiplos canais (Google, TikTok, Instagram)
- ✨ Alertas por email/WhatsApp
- ✨ Relatórios PDF automatizados
- ✨ Comparação com concorrentes

---

## ✅ Checklist Semanal

**Toda segunda-feira:**
- [ ] Revisar ROI da semana anterior
- [ ] Preencher dias faltantes
- [ ] Ler insights automáticos
- [ ] Comparar com semana anterior
- [ ] Ajustar investimento se necessário

**Toda sexta-feira:**
- [ ] Verificar CPL da semana
- [ ] Planejar investimento do fim de semana
- [ ] Conferir conversões x expectativa

**Todo dia 1:**
- [ ] Revisar mês anterior completo
- [ ] Calcular ROI mensal final
- [ ] Definir meta para novo mês
- [ ] Ajustar estratégia se necessário

---

## 🏆 Resultado Esperado

**Após 1 mês de uso consistente:**
- ✅ Visibilidade total de investimento
- ✅ ROI calculado automaticamente
- ✅ Decisões baseadas em dados
- ✅ Otimização de campanhas
- ✅ Aumento de lucratividade

**Meta:** Transformar investimento em tráfego de "gasto às cegas" para **estratégia data-driven** 📊

---

## 📞 Suporte

**Problemas?**
1. Verifique se o valor foi salvo (recarregue a página)
2. Limpe cache do navegador
3. Teste em modo anônimo
4. Consulte documentação completa: `MODULO_TRAFEGO_FACEBOOK_ADS.md`

**Bom proveito! 🚀**
