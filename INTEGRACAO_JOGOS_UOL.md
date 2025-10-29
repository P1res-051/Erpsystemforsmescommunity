# 🎯 Integração de Jogos UOL no Dashboard

## 📋 Visão Geral

O arquivo `JOGOS.PY` foi modificado para integrar dados de jogos do UOL diretamente no dashboard. Agora você pode ver todos os jogos do dia em tempo real na aba "Jogos".

## ✅ Funcionalidades Implementadas

- ✅ **API REST Local** - Servidor Flask integrado no JOGOS.PY
- ✅ **Dados em Tempo Real** - Busca jogos diretamente da API do UOL
- ✅ **Interface Integrada** - Nova seção no dashboard para jogos locais
- ✅ **Status da API** - Indicador visual de conexão
- ✅ **Jogos em Destaque** - Separação automática de jogos importantes
- ✅ **Informações Completas** - Horários, estádios, canais, placares

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
pip install -r requirements-jogos.txt
```

### 2. Iniciar a API de Jogos

**Windows:**
```bash
start-jogos-api.bat
```

**Linux/Mac:**
```bash
chmod +x start-jogos-api.sh
./start-jogos-api.sh
```

**Manual:**
```bash
python JOGOS.PY --api --port 5000
```

### 3. Acessar o Dashboard

1. Inicie o dashboard React normalmente
2. Vá para a aba "Jogos"
3. Você verá uma nova seção "Jogos do Dia - Dados UOL"
4. O status da API aparecerá como "● API Conectada" se tudo estiver funcionando

## 🎮 Recursos da Interface

### Indicador de Status
- 🟢 **API Conectada** - Tudo funcionando
- 🔴 **API Offline** - Execute o comando para iniciar
- 🟡 **Carregando** - Verificando conexão

### Seções de Jogos
1. **Jogos em Destaque** - Jogos marcados como importantes
2. **Outros Jogos** - Lista compacta dos demais jogos

### Informações Exibidas
- ⚽ Times e placares (quando disponível)
- 🕐 Horários dos jogos
- 🏟️ Estádios
- 📺 Campeonatos
- 📡 Canais de transmissão
- 🔴 Status (Programado/Em andamento/Encerrado)

## 🔧 Endpoints da API

### `/api/status`
Verifica se a API está funcionando
```json
{
  "success": true,
  "message": "API de Jogos funcionando",
  "timestamp": "2025-01-28T10:30:00"
}
```

### `/api/jogos/hoje`
Retorna jogos de hoje
```json
{
  "success": true,
  "data": {
    "date": "28-01-2025",
    "total_games": 5,
    "games": [...]
  }
}
```

### `/api/jogos?date=DD-MM-YYYY`
Retorna jogos de uma data específica
```json
{
  "success": true,
  "data": {
    "date": "28-01-2025",
    "total_games": 3,
    "games": [
      {
        "id": "Flamengo_vs_Palmeiras_16:00",
        "time_casa": "Flamengo",
        "time_fora": "Palmeiras",
        "horario": "16:00",
        "campeonato": "Brasileirão Série A",
        "status": "1",
        "brasao_casa": "https://...",
        "brasao_fora": "https://...",
        "estadio": "Maracanã",
        "canais": "Globo, SporTV",
        "is_big_game": true,
        "status_text": "Programado"
      }
    ]
  }
}
```

## 🎯 Comandos Úteis

### Gerar apenas JSON (sem PDF)
```bash
python JOGOS.PY --json
```

### Gerar para data específica
```bash
python JOGOS.PY 28-01-2025 --json
```

### Iniciar API em porta diferente
```bash
python JOGOS.PY --api --port 8000
```

## 🔄 Integração com Dashboard

O dashboard automaticamente:
1. Verifica se a API está rodando
2. Busca jogos do dia atual
3. Atualiza quando você muda a data
4. Mostra status de conexão em tempo real
5. Permite atualização manual dos dados

## 🐛 Troubleshooting

### API não conecta
1. Verifique se o JOGOS.PY está rodando com `--api`
2. Confirme que a porta 5000 está livre
3. Verifique se as dependências estão instaladas

### Jogos não aparecem
1. Verifique se há jogos na data selecionada
2. Teste o endpoint diretamente: `http://localhost:5000/api/jogos/hoje`
3. Veja os logs do JOGOS.PY para erros

### Erro de CORS
- O Flask já está configurado com CORS habilitado
- Se persistir, verifique se o dashboard está na mesma máquina

## 📈 Próximos Passos

1. **Cache Inteligente** - Salvar dados localmente para acesso offline
2. **Notificações** - Alertas para jogos importantes
3. **Filtros** - Por campeonato, time, etc.
4. **Histórico** - Dados de jogos anteriores
5. **Análise** - Correlação entre jogos e métricas do dashboard

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do JOGOS.PY
2. Teste os endpoints manualmente
3. Confirme que todas as dependências estão instaladas
4. Verifique se não há conflitos de porta