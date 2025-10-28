# 📊 IPTV Analytics Dashboard

Dashboard analytics profissional para gestão de clientes IPTV com processamento automático de arquivos Excel e análise avançada de métricas.

## 🚀 Funcionalidades

### 📈 Análises Disponíveis
- **Overview**: Visão geral com insights inteligentes
  - ✨ **NOVO**: Análise de renovações (última semana + próximos 7 dias)
  - ✨ **NOVO**: Calendário de vencimentos (30 dias)
  - ✨ **NOVO**: Jogos de futebol do dia com impacto nas conversões
  - ✨ **NOVO**: Recomendações inteligentes para ADS
  - ✨ **NOVO**: Rótulos visíveis em todos os gráficos
- **Financeiro**: MRR, ARR, LTV, CAC, ROAS, Ticket Médio
- **Clientes**: Busca avançada, exportação por categoria
  - 🔥 **NOVO**: Integração com BotConversa via Proxy
  - 📲 Envio de TAGs para audiência segmentada
  - 📅 Importação automática de expirados por período
- **Retenção**: Taxa de retenção, churn rate, clientes fiéis
- **Conversão**: Taxa de conversão, tempo médio, melhor dia
- **Jogos**: 
  - ✨ **NOVO**: Widgets ao vivo da API-Football
  - 🟢 Brasileirão Série A e B
  - 🔴 Copa Libertadores e Sul-Americana
  - 🟡 Tabela de classificação em tempo real
  - 📊 Análise de impacto nas conversões
- **Geografia**: Análise por estado e cidade
- **Tráfego**: Origem de tráfego e ROI

### 🎯 Características
- ✅ Processamento automático de Excel (múltiplas abas)
- ✅ Cálculo inteligente de receita por plano
- ✅ Análise de impacto de jogos (com pesos por competição)
- ✅ **NOVO**: Integração com jogos de futebol (Excel + API)
- ✅ **NOVO**: Insights avançados de renovação e churn semanal
- ✅ **NOVO**: Calendário de vencimentos com receita potencial
- ✅ **NOVO**: Recomendações acionáveis baseadas em dados
- ✅ Filtros dinâmicos e busca em tempo real
- ✅ Exportação para Excel por categoria
- ✅ Tema dark moderno e responsivo
- ✅ Gráficos interativos com rótulos visíveis (Recharts)

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Python 3.9+ (para integração BotConversa)

### Passos - Dashboard

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/iptv-dashboard.git
cd iptv-dashboard

# 2. Instale as dependências
npm install

# 3. Execute localmente
npm run dev

# 4. Acesse no navegador
# http://localhost:5173
```

### 🔌 Proxy BotConversa (Opcional)

Para usar a integração com BotConversa sem erros de CORS:

#### Método Rápido (Script Automático)

**Windows:**
```cmd
start-proxy.bat
```

**Linux/Mac:**
```bash
chmod +x start-proxy.sh
./start-proxy.sh
```

#### Método Manual

```bash
# 1. Instale dependências Python
pip install fastapi uvicorn httpx pydantic python-dotenv

# 2. Inicie o proxy (Modo Simulado)
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload

# 3. OU inicie em Modo Real
export REAL_MODE=true  # Linux/Mac
set REAL_MODE=true     # Windows
uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
```

📖 **Documentação completa:** [PROXY_SETUP.md](PROXY_SETUP.md)

## 🌐 Deploy no GitHub Pages

### Método 1: Automático

```bash
# 1. Altere o 'base' no vite.config.ts para o nome do seu repositório
# base: '/seu-repositorio/'

# 2. Execute o comando de deploy
npm run deploy
```

### Método 2: Manual

```bash
# 1. Build do projeto
npm run build

# 2. Faça push da pasta 'dist' para a branch gh-pages
git subtree push --prefix dist origin gh-pages
```

### Configurar GitHub Pages

1. Vá em **Settings** → **Pages**
2. Em **Source**, selecione **gh-pages** branch
3. Clique em **Save**
4. Aguarde alguns minutos
5. Acesse: `https://SEU-USUARIO.github.io/seu-repositorio/`

## 📊 Como Usar

### 1. Preparar o Excel

Seu arquivo Excel deve ter as seguintes abas:

- **Testes**: Dados de testes/leads
- **Conversões**: Vendas realizadas
- **Renovações**: Renovações de clientes
- **Clientes Ativos**: Base ativa
- **Clientes Expirados**: Clientes perdidos
- **Jogos** (opcional): Lista de jogos
- **Conv x Jogos** (opcional): Conversões relacionadas a jogos

### 2. Campos Importantes

**Conversões/Renovações:**
- `Custo`: Tipo de plano (1=Mensal, 1.5-2=2 Telas, 3=Trimestral, 6=Semestral, 12=Anual)
- `Data da Venda`
- `Estado`, `Cidade`
- `Origem de Tráfego`

**Jogos:**
- `Data e Hora`
- `Competição`
- `Time Casa`, `Time Visitante`
- **NOVO**: Jogos do dia são exibidos no Overview
- **NOVO**: Widgets ao vivo na aba "Jogos" com API-Football

### 3. Carregar Dados

1. Clique em **"Importar Excel"**
2. Selecione seu arquivo
3. Aguarde o processamento
4. Navegue pelas diferentes views

## 💰 Mapeamento de Planos

| Custo | Plano | Preço Real |
|-------|-------|------------|
| 1 | Mensal | R$ 32,50 |
| 1.5-2 | 2 Telas | R$ 55,00 |
| 3 | Trimestral | R$ 87,50 |
| 6 | Semestral | R$ 165,00 |
| 12 | Anual | R$ 290,00 |

## 🎮 Sistema de Pesos - Competições

| Competição | Peso |
|------------|------|
| Copa do Mundo | 15 |
| Libertadores/Champions | 10 |
| Sulamericana | 8 |
| Série A | 7 |
| Copa do Brasil | 5 |
| Estaduais | 3 |
| Outros | 1 |

## 🎯 Novidades da Versão 2.0

### 📊 Melhorias na Aba Overview

#### Rótulos nos Gráficos
Agora todos os gráficos de barras exibem os valores diretamente nas barras, sem necessidade de passar o mouse.

#### Insights Avançados de Renovação
- **Última Semana**: Total de renovações realizadas nos últimos 7 dias
- **Próxima Semana**: Clientes com vencimento iminente (oportunidades)
- **Análise de Perdas**: Taxa de churn semanal com avaliação automática
- **Comparativo**: Expectativa vs realidade de renovações

#### Calendário de Vencimentos
- Distribuição de vencimentos nos próximos 30 dias
- Visualização em gráfico de barras
- Cálculo de receita potencial baseado no ticket médio
- Foco nos próximos 7 dias (urgente)

#### Recomendações Inteligentes
- **Melhores Dias para ADS**: Ranking dos dias com mais conversões históricas
- **Jogos do Dia**: Exibição automática de jogos de futebol importantes
- **Ação Recomendada**: Alerta personalizado baseado nas métricas atuais

### 🎮 Integração com Jogos de Futebol (API-Football)
- ✅ **Widgets ao vivo** integrados na aba "Jogos"
- ✅ Brasileirão Série A e B em tempo real
- ✅ Copa Libertadores e Sul-Americana
- ✅ Tabela de classificação atualizada
- ✅ Seletor de data para ver jogos de qualquer dia
- ✅ Botão de atualização manual
- ✅ Tema dark personalizado
- ✅ Análise de impacto histórico via Excel
- ✅ Exibição de jogos do dia no Overview

📖 **Documentação completa:** 
- [INTEGRACAO_API_FUTEBOL.md](./INTEGRACAO_API_FUTEBOL.md) - Detalhes técnicos
- [COMO_USAR_WIDGETS_JOGOS.md](./COMO_USAR_WIDGETS_JOGOS.md) - Guia de uso

### 📈 Métricas Adicionais
- Taxa de perda semanal (churn rate granular)
- Receita potencial de vencimentos
- Média de renovações por dia
- Projeção de renovações futuras

## 🛠️ Tecnologias

- **React 18** + TypeScript
- **Tailwind CSS 4.0**
- **Recharts** (gráficos interativos)
- **ShadcN UI** (componentes)
- **XLSX** (processamento Excel)
- **Lucide React** (ícones)
- **API-Football** (widgets de jogos ao vivo)
- **Vite** (build tool)

## 📁 Estrutura do Projeto

```
iptv-dashboard/
├── App.tsx                      # Componente principal
├── components/
│   ├── IPTVDashboard.tsx       # Dashboard principal
│   ├── FinancialView.tsx       # View financeira
│   ├── ClientsView.tsx         # View de clientes
│   ├── RetentionView.tsx       # View de retenção
│   ├── ConversionView.tsx      # View de conversão
│   ├── GamesView.tsx           # View de jogos
│   ├── GeographicView.tsx      # View geográfica
│   ├── TrafficView.tsx         # View de tráfego
│   └── ui/                     # Componentes ShadcN
├── utils/
│   └── dataProcessing.ts       # Lógica de processamento
├── styles/
│   └── globals.css             # Estilos globais
└── package.json
```

## 🎨 Customização

### Alterar Cores

Edite `/styles/globals.css`:

```css
@theme {
  --color-primary: #10b981; /* Verde */
  --color-secondary: #3b82f6; /* Azul */
  /* ... */
}
```

### Adicionar Novos Campos

1. Modifique a interface em `utils/dataProcessing.ts`
2. Adicione o processamento no `processarArquivo()`
3. Exiba na view desejada

## 📚 Documentação Completa

- 📖 [Melhorias do Overview](./MELHORIAS_OVERVIEW.md) - Detalhes sobre a nova versão 2.0
- 🔌 [Integração com API de Futebol](./INTEGRACAO_API_FUTEBOL.md) - Como conectar APIs de jogos
- 📝 [Changelog](./CHANGELOG.md) - Histórico completo de versões
- 🚀 [Guia de Deploy](./DEPLOY.md) - Instruções para publicar no GitHub Pages
- 📋 [Como Começar](./COMECE_AQUI.md) - Guia passo a passo para iniciantes

## 📝 Changelog

### Versão 2.0 (27/10/2025)
- ✨ Rótulos visíveis em todos os gráficos de barras
- ✨ Análise avançada de renovações (última semana + próxima semana)
- ✨ Calendário de vencimentos (30 dias) com receita potencial
- ✨ Integração com jogos de futebol do dia
- ✨ Recomendações inteligentes para investimento em ADS
- ✨ Alertas personalizados baseados em métricas
- ✨ Análise de perda semanal (churn granular)
- 🔧 Melhorias de UX e performance

Veja [CHANGELOG.md](./CHANGELOG.md) para histórico completo de versões.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:

1. Fork o projeto
2. Criar uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🐛 Suporte

Se encontrar algum bug ou tiver sugestões:

1. Abra uma [Issue](https://github.com/SEU-USUARIO/iptv-dashboard/issues)
2. Descreva o problema detalhadamente
3. Inclua capturas de tela se possível

## 📧 Contato

Criado com ❤️ para gestão profissional de IPTV.

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
