# 🎯 Guia de Integração com API de Futebol

## 📋 Visão Geral

O dashboard agora possui integração completa com a **API-Football (api-sports.io)** na aba "Jogos", exibindo:

1. **Widgets ao vivo** - Jogos do dia de Brasileirão A, Brasileirão B, Libertadores e Sul-Americana
2. **Tabela de Classificação** - Classificação atualizada do Brasileirão Série A
3. **Análise de dados históricos** - Jogos importados do Excel para análise de impacto

## ✅ Status da Integração

- ✅ **API-Football Integrada** - Widgets oficiais funcionando
- ✅ **Chave API Configurada** - `522d123a0f3c2347ef711a772f0438bf`
- ✅ **Tema Dark** - Widgets personalizados para combinar com o dashboard
- ✅ **Seletor de Data** - Permite visualizar jogos de qualquer dia
- ✅ **Auto-refresh** - Botão para atualizar widgets em tempo real

## 🎮 Widgets Integrados (API-Football)

### Widgets Ativos na Aba "Jogos":

1. **Brasileirão Série A** (Liga 71)
   - Fixtures do dia
   - Status: Ao vivo, programados e finalizados
   
2. **Brasileirão Série B** (Liga 72)
   - Todos os jogos da segunda divisão

3. **Copa Libertadores** (Liga 13)
   - Jogos da competição sul-americana

4. **Copa Sul-Americana** (Liga 12)
   - Competição complementar

5. **Tabela de Classificação**
   - Brasileirão Série A atualizada

### Recursos dos Widgets:

- ✅ Tema dark integrado
- ✅ Idioma: Português (pt-BR)
- ✅ Timezone: America/Sao_Paulo
- ✅ Auto-carregamento via script oficial
- ✅ Temporada 2025 configurada

## 🔧 Configuração Técnica

### API-Football (Implementada) ⭐
- **Site:** https://www.api-football.com/
- **Documentação:** https://www.api-football.com/documentation-v3
- **Plano Grátis:** 100 requisições/dia
- **Chave API:** `522d123a0f3c2347ef711a772f0438bf`
- **Widget Loader:** `https://widgets.api-sports.io/football/3.0.0/widget.js`

### Como os Widgets Funcionam:

Os widgets são divs HTML com atributos `data-*` que o script oficial da API-Football renderiza:

```tsx
<div
  id="wg-br-a"
  data-host="v3.football.api-sports.io"
  data-key="522d123a0f3c2347ef711a772f0438bf"
  data-type="fixtures"
  data-theme="dark"
  data-lang="pt"
  data-league="71"
  data-season="2025"
  data-date="2025-10-27"
  data-timezone="America/Sao_Paulo"
/>
```

O componente `GamesView.tsx` carrega o script automaticamente:

```typescript
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://widgets.api-sports.io/football/3.0.0/widget.js';
  script.async = true;
  document.body.appendChild(script);
}, []);
```

### Atualização Dinâmica de Data:

```typescript
const handleDateChange = (newDate: string) => {
  const widgetIds = ['wg-br-a', 'wg-br-b', 'wg-liberta', 'wg-sula'];
  widgetIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute('data-date', newDate);
      if ((window as any)?.AFW?.reload) {
        (window as any).AFW.reload(el);
      }
    }
  });
};
```

### 2. Football-Data.org
- **Site:** https://www.football-data.org/
- **Plano Grátis:** 10 requisições/minuto
- **Cobertura:** Principais ligas europeias

### 3. OpenFootball / football.db
- **Site:** https://github.com/openfootball
- **Plano:** Totalmente gratuito (dados estáticos)

## 🎨 Personalização Visual

### Estilos Customizados (globals.css)

O dashboard aplica estilos personalizados para integrar os widgets ao tema dark:

```css
/* Estilos para os widgets da API-Football */
[id^="wg-"] {
  border-radius: 0.5rem;
  overflow: hidden;
}

[data-theme="dark"] {
  background: transparent !important;
}

.afw-widget {
  border-radius: 0.5rem;
}

.afw-widget iframe {
  border-radius: 0.5rem;
}
```

### Cores por Competição:

- 🟢 **Série A**: Verde (`bg-green-500`)
- 🔵 **Série B**: Azul (`bg-blue-500`)
- 🔴 **Libertadores**: Vermelho (`bg-red-500`)
- 🟠 **Sul-Americana**: Laranja (`bg-orange-500`)
- 🟡 **Tabela**: Amarelo/Ouro (`bg-yellow-500`)

## 📱 Responsividade

Os widgets da API-Football são responsivos e se adaptam automaticamente:
- **Desktop**: Exibição completa com todos os detalhes
- **Tablet**: Layout ajustado mantendo legibilidade
- **Mobile**: Versão compacta otimizada

## 📊 Leagues IDs Configuradas (API-Football)

| Campeonato | ID | Season | Status |
|------------|----|---------|---------
| Brasileirão Série A | 71 | 2025 | ✅ Ativo |
| Brasileirão Série B | 72 | 2025 | ✅ Ativo |
| Copa Libertadores | 13 | 2025 | ✅ Ativo |
| Copa Sul-Americana | 12 | 2025 | ✅ Ativo |
| Copa do Brasil | 73 | 2025 | ⏸️ Disponível |
| Champions League | 2 | 2024 | ⏸️ Disponível |
| Premier League | 39 | 2024 | ⏸️ Disponível |

### Como Adicionar Mais Ligas:

Edite `/components/GamesView.tsx` e adicione um novo widget:

```tsx
<div>
  <h4 className="text-white mb-3 flex items-center gap-2">
    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
    Copa do Brasil
  </h4>
  <div
    id="wg-copa-brasil"
    data-host="v3.football.api-sports.io"
    data-key="522d123a0f3c2347ef711a772f0438bf"
    data-type="fixtures"
    data-theme="dark"
    data-lang="pt"
    data-league="73"
    data-season="2025"
    data-date={selectedDate}
    data-timezone="America/Sao_Paulo"
  />
</div>
```

## 🔐 Segurança e Limites

### Chave API Atual:
- **Key**: `522d123a0f3c2347ef711a772f0438bf`
- **Plano**: Free tier (100 requisições/dia)
- **Localização**: Hardcoded em `/components/GamesView.tsx`

### ⚠️ Recomendações para Produção:

1. **Mova a chave para variáveis de ambiente:**
   ```typescript
   const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
   ```

2. **Crie um arquivo `.env`:**
   ```
   VITE_FOOTBALL_API_KEY=522d123a0f3c2347ef711a772f0438bf
   ```

3. **Adicione `.env` ao `.gitignore`**

4. **Para produção**, considere:
   - Proxy backend para ocultar a chave
   - Upgrade para plano pago se necessário
   - Monitorar uso de quota

### Monitoramento de Quota:

Acesse: https://dashboard.api-football.com/
- Veja requisições usadas
- Monitore limite diário
- Configure alertas de uso

## 💡 Funcionalidades Implementadas

### ✅ Recursos Ativos:

1. **Visualização de Jogos ao Vivo**
   - Fixtures do dia de todas as ligas configuradas
   - Status em tempo real (ao vivo, agendados, finalizados)
   - Placar atualizado automaticamente

2. **Seletor de Data**
   - Input de data integrado
   - Botão de atualização manual
   - Feedback visual durante carregamento

3. **Tabela de Classificação**
   - Brasileirão Série A sempre atualizada
   - Posição, pontos, jogos, vitórias, etc.

4. **Análise Histórica**
   - Dados de jogos importados do Excel
   - Correlação com conversões
   - Ranking de times que mais influenciam
   - Competições mais impactantes

### 🚀 Melhorias Futuras:

1. **Alertas Automáticos**
   - Notificar quando há jogo de time popular
   - Sugerir impulsionar ads antes de clássicos

2. **Previsão de Impacto**
   - ML para prever impacto de jogos específicos
   - Recomendação de orçamento de ads

3. **Integração com Analytics**
   - Cruzar dados de fixtures com conversões em tempo real
   - Dashboard unificado de jogos + performance

## 📝 Formato dos Dados

O componente espera um array de objetos com este formato:

```typescript
interface JogoFutebol {
  time_casa: string;    // Ex: "Flamengo"
  time_fora: string;    // Ex: "Palmeiras"
  horario: string;      // Ex: "16:00"
  campeonato: string;   // Ex: "Brasileirão Série A"
}
```

## 🎯 Importação via Excel

Enquanto não implementar a API, você pode continuar importando jogos manualmente:

**Estrutura da aba "Jogos":**

| Data | Time_Casa | Time_Fora | Horario | Competicao |
|------|-----------|-----------|---------|------------|
| 27/10/2025 | Flamengo | Palmeiras | 16:00 | Brasileirão |
| 27/10/2025 | São Paulo | Corinthians | 18:30 | Brasileirão |

O dashboard automaticamente detectará e exibirá esses jogos quando a data corresponder ao dia atual.

## 📞 Suporte

Se precisar de ajuda para implementar a integração com API:

1. Escolha a API desejada
2. Obtenha sua API key
3. Siga os exemplos deste guia
4. Teste com dados pequenos primeiro

## 🐛 Troubleshooting

### Widgets não aparecem:

1. **Verifique se o script carregou:**
   ```javascript
   console.log(window.AFW); // Deve retornar objeto
   ```

2. **Verifique a quota da API:**
   - Acesse dashboard.api-football.com
   - Confirme que ainda tem requisições disponíveis

3. **Verifique o console do navegador:**
   - Erros de CORS indicam problema com a chave
   - Erros 429 indicam limite de requisições excedido

### Widgets não atualizam:

1. **Force reload:**
   ```javascript
   window.AFW.reload(document.getElementById('wg-br-a'));
   ```

2. **Limpe o cache do navegador**

3. **Verifique a data:**
   - Data futura pode não ter jogos
   - Data muito antiga pode estar fora da temporada

### Performance lenta:

1. **Reduza número de widgets** se necessário
2. **Implemente lazy loading** para widgets abaixo da dobra
3. **Considere cache** se usando backend

## 📞 Recursos e Links

- **Documentação Oficial**: https://www.api-football.com/documentation-v3
- **Widgets**: https://www.api-football.com/documentation-v3#tag/Widgets
- **Dashboard**: https://dashboard.api-football.com/
- **Suporte**: support@api-sports.io
- **Status da API**: https://status.api-sports.io/

## 📝 Changelog

### v2.0 (27/10/2025) - Integração Completa
- ✅ Integrado widgets oficiais da API-Football
- ✅ Suporte a Brasileirão A, B, Libertadores e Sul-Americana
- ✅ Tabela de classificação
- ✅ Seletor de data dinâmico
- ✅ Tema dark customizado
- ✅ Auto-carregamento de script

### v1.0 (Versão Anterior)
- Jogos de exemplo estáticos
- Importação via Excel apenas

---

**Última atualização:** 27/10/2025  
**Versão:** 2.0  
**Status:** ✅ Produção
