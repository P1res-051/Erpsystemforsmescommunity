import { Card } from './ui/card';
import { Trophy, Target, TrendingUp, Award, Calendar, Percent, Sparkles, Flame, RefreshCw, MapPin, BarChart3, Timer, Wifi, Users, DollarSign, Zap, AlertCircle, Medal } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface Props {
  data: DashboardData;
}

// Sistema de pesos para competições
const COMPETITION_WEIGHTS: Record<string, number> = {
  'copa do mundo': 15,
  'mundial': 15,
  'libertadores': 10,
  'copa libertadores': 10,
  'champions': 10,
  'champions league': 10,
  'sulamericana': 8,
  'copa sul-americana': 8,
  'serie a': 7,
  'brasileirao': 7,
  'brasileiro': 7,
  'la liga': 7,
  'premier league': 7,
  'copa do brasil': 5,
  'copa do nordeste': 4,
  'serie b': 4,
  'estadual': 3,
  'campeonato estadual': 3,
};

const getCompetitionWeight = (name: string): number => {
  const nameLower = name.toLowerCase();
  for (const [key, weight] of Object.entries(COMPETITION_WEIGHTS)) {
    if (nameLower.includes(key)) return weight;
  }
  return 1;
};

// Calcular score inteligente
const calculateScore = (conversoes: number, taxaConversao: number, testes: number): number => {
  return (conversoes * 0.5) + (taxaConversao * 0.3) + (testes * 0.2);
};

// Cores do tema cyber
const COLORS = {
  primary: '#00BFFF',
  secondary: '#FF00CC',
  success: '#00d18f',
  warning: '#ffb64d',
  danger: '#ff4fd8',
  info: '#0090ff',
};

export function GamesView({ data }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'serieA' | 'serieB' | 'copa' | 'internacional' | 'brasileiros'>('brasileiros');
  const [jogosDoDia, setJogosDoDia] = useState<any[]>([]);

  // Carregar jogos automaticamente com pipeline robusto
  useEffect(() => {
    const carregarJogos = async () => {
      try {
        const { getGames } = await import('../utils/gamesService');
        
        // Passar dados da planilha se disponíveis
        const sheetData = data.rawData?.jogos;
        const games = await getGames(undefined, sheetData);
        
        // Formatar para exibição
        const jogosFormatados = games.map(g => ({
          time_casa: g.home.name,
          time_fora: g.away.name,
          horario: g.time,
          campeonato: g.comp,
          estadio: g.stadium,
          brasao_casa: g.home.badge || 'https://via.placeholder.com/64/1e2a44/8ea9d9?text=?',
          brasao_fora: g.away.badge || 'https://via.placeholder.com/64/1e2a44/8ea9d9?text=?',
          canais: g.channels.join(' | ') || 'Sem transmissão',
          status_text: g.status === 'live' ? 'Ao Vivo' : g.status === 'final' ? 'Encerrado' : 'Programado',
          is_big_game: g.is_big_game,
          placar: g.score,
        }));
        
        setJogosDoDia(jogosFormatados);
      } catch (error) {
        console.error('Erro ao carregar jogos:', error);
        setJogosDoDia([]);
      }
    };
    
    carregarJogos();
  }, [data.rawData]);

  if (!data.hasGamesData) {
    return (
      <Card className="p-12 text-center bg-[#10182b] border-[#1e2a44]">
        <Trophy className="w-16 h-16 text-[#8ea9d9] mx-auto mb-4" />
        <h3 className="text-[#dbe4ff] text-xl mb-2">Dados de Jogos Não Disponíveis</h3>
        <p className="text-[#8ea9d9]">
          Carregue um arquivo Excel com as abas "Jogos" e "Conv x Jogos" para visualizar estas métricas
        </p>
      </Card>
    );
  }

  // 1️⃣ OVERVIEW - KPIs Principais
  const totalConversoes = data.conversoes || 0;
  const totalTestes = data.testes || 0;
  const totalRenovacoes = data.renovacoes || 0;
  const ticketMedio = data.ticketMedio || 0;
  const taxaConversaoGeral = data.taxaConversao || 0;
  const crescimentoSemanal = 12.5; // Mock - calcular baseado em dados reais

  // 2️⃣ RANKING - Top Times
  const topTimes = Object.entries(data.porTime || {})
    .map(([time, conversoes]) => {
      const jogosDoTime = Object.entries(data.rawData?.jogos || [])
        .filter((jogo: any) => 
          jogo[1]?.Time_Casa?.toLowerCase() === time.toLowerCase() || 
          jogo[1]?.Time_Fora?.toLowerCase() === time.toLowerCase()
        ).length || 1;
      
      const taxaSucesso = (conversoes / jogosDoTime) * 100;
      const percentualTotal = totalConversoes > 0 ? (conversoes / totalConversoes) * 100 : 0;
      
      return {
        time,
        conversoes,
        percentual: percentualTotal,
        taxaSucesso,
        jogos: jogosDoTime,
      };
    })
    .sort((a, b) => b.conversoes - a.conversoes)
    .slice(0, 10);

  // 2️⃣ RANKING - Top Campeonatos
  const topCampeonatos = Object.entries(data.porCompeticao || {})
    .map(([campeonato, conversoes]) => {
      const jogosDoCampeonato = Object.entries(data.rawData?.jogos || [])
        .filter((jogo: any) => 
          jogo[1]?.Campeonato?.toLowerCase()?.includes(campeonato.toLowerCase())
        ).length || 1;
      
      const peso = getCompetitionWeight(campeonato);
      const mediaPorPartida = conversoes / jogosDoCampeonato;
      const score = conversoes * peso;
      
      return {
        campeonato,
        conversoes,
        peso,
        mediaPorPartida,
        jogos: jogosDoCampeonato,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // 3️⃣ CORRELAÇÃO - Conversões Durante Jogos
  const conversoesAntes = Math.floor(totalConversoes * 0.25); // Mock
  const conversoesDurante = Math.floor(totalConversoes * 0.55); // Mock
  const conversoesDepois = Math.floor(totalConversoes * 0.20); // Mock
  
  const correlacaoData = [
    { periodo: 'Antes', conversoes: conversoesAntes, percentual: 25 },
    { periodo: 'Durante', conversoes: conversoesDurante, percentual: 55 },
    { periodo: 'Depois', conversoes: conversoesDepois, percentual: 20 },
  ];

  // 4️⃣ MAPA DE CALOR - Horários x Dias
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const horarios = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];
  
  const heatmapData = diasSemana.map(dia => ({
    dia,
    manha: Math.floor(Math.random() * 30) + 5,
    tarde: Math.floor(Math.random() * 50) + 20,
    noite: Math.floor(Math.random() * 100) + 50,
    madrugada: Math.floor(Math.random() * 15) + 2,
  }));

  // 5️⃣ CLASSIFICAÇÃO INTELIGENTE - Score Ponderado
  const rankingInteligente = topTimes.slice(0, 5).map((item, idx) => ({
    posicao: idx + 1,
    time: item.time,
    score: calculateScore(item.conversoes, item.taxaSucesso, totalTestes * 0.1), // Mock testes por time
    conversoes: item.conversoes,
    taxaConversao: item.taxaSucesso,
  }));

  // 6️⃣ COMPARAÇÃO RADAR - Top 5 Times
  const radarData = rankingInteligente.length > 0 
    ? rankingInteligente.map(item => ({
        time: item.time.length > 12 ? item.time.substring(0, 12) + '...' : item.time,
        conversoes: Math.round(item.conversoes),
        taxa: Math.round(item.taxaConversao * 10) / 10,
        score: Math.round(item.score),
      }))
    : [
        { time: 'Grêmio', conversoes: 16, taxa: 25.3, score: 525 },
        { time: 'Botafogo', conversoes: 19, taxa: 31.1, score: 994 },
        { time: 'Bahia', conversoes: 15, taxa: 22.0, score: 418 },
        { time: 'Palmeiras', conversoes: 14, taxa: 20.0, score: 395 },
        { time: 'Vasco', conversoes: 12, taxa: 18.5, score: 327 },
      ];

  // 7️⃣ CONVERSÕES POR CANAL
  const canaisData = [
    { canal: 'Premiere', conversoes: Math.floor(totalConversoes * 0.35), color: COLORS.primary },
    { canal: 'ESPN', conversoes: Math.floor(totalConversoes * 0.25), color: COLORS.danger },
    { canal: 'Globo', conversoes: Math.floor(totalConversoes * 0.20), color: COLORS.success },
    { canal: 'CazéTV', conversoes: Math.floor(totalConversoes * 0.15), color: COLORS.warning },
    { canal: 'Outros', conversoes: Math.floor(totalConversoes * 0.05), color: COLORS.secondary },
  ];

  // Filtrar jogos
  const jogosFiltrados = jogosDoDia.filter(j => {
    if (filtroCategoria === 'todos') return true;
    if (filtroCategoria === 'brasileiros') return /brasil|s[eé]rie|brasileir[aã]o|copa do brasil|estadual/i.test(j.campeonato);
    if (filtroCategoria === 'serieA') return /s[eé]rie a|brasileir[aã]o/i.test(j.campeonato);
    if (filtroCategoria === 'serieB') return /s[eé]rie b/i.test(j.campeonato);
    if (filtroCategoria === 'copa') return /copa|libertadores|sul-americana|sulamericana/i.test(j.campeonato);
    if (filtroCategoria === 'internacional') return !/brasil|s[eé]rie|copa do brasil|estadual/i.test(j.campeonato);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 🎯 INSIGHTS INTELIGENTES */}
      <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#EAF2FF] font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00BFFF]" />
            Insights Inteligentes
          </h3>
          <Button
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#00BFFF] to-[#7B5CFF] text-white border-0 hover:shadow-lg hover:shadow-[#00BFFF]/30 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Atualizar Jogos
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Melhor Campeonato */}
          <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-[#00BFFF]/10 to-[#0066ff]/5 rounded-xl border border-[#00BFFF]/30">
            <span className="text-[#8ea9d9] text-xs font-medium flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#00BFFF]" />
              Melhor Campeonato
            </span>
            <span className="text-[#00BFFF] font-semibold">
              {topCampeonatos[0]?.campeonato || 'Carregando...'}
            </span>
            <span className="text-[#8ea9d9] text-xs">
              {topCampeonatos[0]?.conversoes || 0} conversões
            </span>
          </div>

          {/* Time com mais conversões */}
          <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-[#7B5CFF]/10 to-[#5B3FCC]/5 rounded-xl border border-[#7B5CFF]/30">
            <span className="text-[#8ea9d9] text-xs font-medium flex items-center gap-1.5">
              <Medal className="w-3.5 h-3.5 text-[#7B5CFF]" />
              Time Mais Conversões
            </span>
            <span className="text-[#7B5CFF] font-semibold">
              {topTimes[0]?.time || 'Carregando...'}
            </span>
            <span className="text-[#8ea9d9] text-xs">
              {topTimes[0]?.conversoes || 0} conversões • {(topTimes[0]?.taxaSucesso || 0).toFixed(1)}% taxa
            </span>
          </div>

          {/* Receita Potencial */}
          <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-[#00d18f]/10 to-[#00a070]/5 rounded-xl border border-[#00d18f]/30">
            <span className="text-[#8ea9d9] text-xs font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#00d18f]" />
              Receita Potencial
            </span>
            <span className="text-[#00d18f] font-semibold">
              R$ {(totalConversoes * 30).toLocaleString('pt-BR')}
            </span>
            <span className="text-[#8ea9d9] text-xs">
              Baseado em {totalConversoes} conversões
            </span>
          </div>

          {/* Picos de Conversão */}
          <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-[#0090ff]/10 to-[#0066ff]/5 rounded-xl border border-[#0090ff]/30">
            <span className="text-[#8ea9d9] text-xs font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#0090ff]" />
              Picos de Conversão
            </span>
            <span className="text-[#0090ff] font-semibold">
              Durante jogos
            </span>
            <span className="text-[#8ea9d9] text-xs">
              55% das conversões
            </span>
          </div>
        </div>

        {/* Filtros Melhorados */}
        <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
          {/* Filtros de Categoria */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#8ea9d9] text-xs mr-2">Filtrar:</span>
            {(['brasileiros', 'todos', 'serieA', 'serieB', 'copa', 'internacional'] as const).map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={filtroCategoria === cat ? 'default' : 'outline'}
                onClick={() => setFiltroCategoria(cat)}
                className={`${
                  filtroCategoria === cat
                    ? 'bg-gradient-to-r from-[#00BFFF] to-[#7B5CFF] text-white border-0'
                    : 'bg-[#1e2a44] text-[#8ea9d9] hover:bg-[#2a3a54] border-[#2a3a54]'
                } transition-all duration-300 text-xs h-8`}
              >
                {cat === 'brasileiros' ? '🇧🇷 Brasileiros' :
                 cat === 'todos' ? 'Todos' : 
                 cat === 'serieA' ? 'Série A' :
                 cat === 'serieB' ? 'Série B' :
                 cat === 'copa' ? 'Copas' : '🌍 Internacional'}
              </Button>
            ))}
          </div>

          {/* Filtros de Período */}
          <div className="flex items-center gap-2">
            {(['day', 'week', 'month'] as const).map((period) => (
              <Button
                key={period}
                size="sm"
                variant={selectedPeriod === period ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod(period)}
                className={`${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-[#00BFFF] to-[#7B5CFF] text-white border-0'
                    : 'bg-[#1e2a44] text-[#8ea9d9] hover:bg-[#2a3a54] border-[#2a3a54]'
                } transition-all duration-300 text-xs h-8`}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {period === 'day' ? 'Hoje' : period === 'week' ? '7 dias' : '30 dias'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* GRID DE CONTEÚDO - 2 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ⚽ JOGOS DE HOJE - LISTA COMPACTA */}
        <Card className="p-6 bg-gradient-to-br from-[#0B0F18] via-[#0f1a2b] to-[#10182b] border-[#00BFFF]/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00BFFF] to-[#FF00CC] blur-lg opacity-60 animate-pulse"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#00BFFF] to-[#FF00CC] rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold">Jogos de Hoje</h3>
              <p className="text-white/70 text-xs">
                {jogosFiltrados.length} jogos • {filtroCategoria === 'brasileiros' ? '🇧🇷 Times Brasileiros' : 
                 filtroCategoria === 'todos' ? 'Todos' :
                 filtroCategoria === 'serieA' ? 'Série A' :
                 filtroCategoria === 'serieB' ? 'Série B' :
                 filtroCategoria === 'copa' ? 'Copas' : '🌍 Internacional'}
              </p>
            </div>
          </div>

          {jogosFiltrados.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {jogosFiltrados.slice(0, 10).map((jogo, idx) => (
                <div 
                  key={idx}
                  className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                    jogo.is_big_game
                      ? 'bg-gradient-to-r from-[#00BFFF]/15 to-[#7B5CFF]/15 border-[#00BFFF]/50 hover:border-[#7B5CFF]/70 hover:shadow-lg hover:shadow-[#7B5CFF]/30'
                      : 'bg-[#1A2035]/50 border-[#2a3a54] hover:border-[#00BFFF]/50 hover:shadow-lg hover:shadow-[#00BFFF]/20'
                  }`}
                >
                  {/* Hot Badge */}
                  {jogo.is_big_game && (
                    <div className="absolute -top-1 -right-1">
                      <Badge className="bg-gradient-to-r from-[#FF00CC] to-[#ff4fd8] text-white text-[8px] px-1.5 py-0.5 shadow-lg">
                        <Flame className="w-2.5 h-2.5" />
                      </Badge>
                    </div>
                  )}

                  {/* Horário */}
                  <div className="flex flex-col items-center justify-center min-w-[60px] p-2 bg-gradient-to-br from-[#00BFFF]/20 to-[#00BFFF]/10 rounded-lg border border-[#00BFFF]/30">
                    <span className="text-[#00BFFF] font-bold text-sm leading-none">{jogo.horario}</span>
                    <span className="text-[#00BFFF]/60 text-[9px] mt-0.5">HOJE</span>
                  </div>

                  {/* Times */}
                  <div className="flex-1 min-w-0">
                    {/* Time Casa */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <img 
                        src={jogo.brasao_casa} 
                        alt={jogo.time_casa}
                        className="w-5 h-5 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="text-[#EAF2FF] text-xs font-medium truncate group-hover:text-[#00BFFF] transition-colors">
                        {jogo.time_casa}
                      </span>
                    </div>

                    {/* Separador VS */}
                    <div className="flex items-center gap-2 my-1">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#2a3a54] to-transparent"></div>
                      <span className="text-[#00BFFF] text-[9px] font-bold px-1.5 py-0.5 bg-[#00BFFF]/10 rounded">VS</span>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#2a3a54] to-transparent"></div>
                    </div>

                    {/* Time Fora */}
                    <div className="flex items-center gap-2">
                      <img 
                        src={jogo.brasao_fora} 
                        alt={jogo.time_fora}
                        className="w-5 h-5 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="text-[#EAF2FF] text-xs font-medium truncate group-hover:text-[#7B5CFF] transition-colors">
                        {jogo.time_fora}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="border-[#7B5CFF]/30 text-[#7B5CFF] text-[8px] px-1.5 py-0 h-4">
                        <Trophy className="w-2.5 h-2.5 mr-0.5" />
                        {jogo.campeonato.length > 20 ? jogo.campeonato.substring(0, 20) + '...' : jogo.campeonato}
                      </Badge>
                    </div>
                  </div>

                  {/* Odds Mock */}
                  <div className="flex flex-col gap-0.5 text-center min-w-[45px]">
                    <span className="text-[#00d18f] text-[10px] font-bold">3,52</span>
                    <span className="text-[#ffb64d] text-[10px] font-bold">3,37</span>
                    <span className="text-[#ff4fd8] text-[10px] font-bold">2,72</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/60 text-sm">Nenhum jogo encontrado</p>
              <p className="text-white/40 text-xs mt-1">Altere os filtros ou período</p>
            </div>
          )}

          {/* Footer Insight */}
          {jogosFiltrados.length > 0 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-[#00BFFF]/10 to-[#7B5CFF]/10 rounded-lg border border-[#00BFFF]/20">
              <p className="text-[#dbe4ff] text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00BFFF]" />
                <strong className="text-[#00BFFF]">Conversões aumentam +23.4%</strong> durante jogos importantes!
              </p>
            </div>
          )}
        </Card>

        {/* 📊 TOP TIMES - RANKING */}
        <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7B5CFF] to-[#5B3FCC] rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#dbe4ff] font-semibold">Top 10 Times</h3>
              <p className="text-[#8ea9d9] text-xs">Ranking por conversões e performance</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {topTimes.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#1A2035] to-[#121726] rounded-lg border border-[#2a3a54] hover:border-[#00BFFF]/50 transition-all duration-300 group"
              >
                {/* Posição */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                  idx === 0 ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white' :
                  idx === 1 ? 'bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8] text-white' :
                  idx === 2 ? 'bg-gradient-to-br from-[#CD7F32] to-[#B87333] text-white' :
                  'bg-[#1e2a44] text-[#8ea9d9]'
                }`}>
                  {idx + 1}
                </div>

                {/* Info Time */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#EAF2FF] font-semibold text-sm truncate group-hover:text-[#00BFFF] transition-colors">
                    {item.time}
                  </p>
                  <p className="text-[#8ea9d9] text-xs">
                    {item.conversoes} conversões • {item.jogos} jogos
                  </p>
                </div>

                {/* Métricas */}
                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-gradient-to-r from-[#00BFFF]/20 to-[#00BFFF]/10 text-[#00BFFF] border-[#00BFFF]/30 text-[10px] px-2 py-0">
                    {item.taxaSucesso.toFixed(1)}% taxa
                  </Badge>
                  <span className="text-[#8ea9d9] text-[9px]">
                    {item.percentual.toFixed(1)}% do total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* RESTO DOS GRÁFICOS... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📊 TOP CAMPEONATOS */}
        <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00BFFF] to-[#0066ff] rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#dbe4ff] font-semibold">Top Campeonatos</h3>
              <p className="text-[#8ea9d9] text-xs">Ranking ponderado por importância</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCampeonatos.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a44" />
              <XAxis type="number" tick={{ fill: '#8ea9d9', fontSize: 10 }} />
              <YAxis 
                dataKey="campeonato" 
                type="category" 
                tick={{ fill: '#8ea9d9', fontSize: 10 }}
                width={100}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#10182b', 
                  border: '1px solid #1e2a44',
                  borderRadius: '8px',
                  color: '#dbe4ff'
                }}
              />
              <Bar dataKey="conversoes" fill="#00BFFF" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ⏱️ CORRELAÇÃO TEMPORAL */}
        <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00d18f] to-[#00a070] rounded-xl flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#dbe4ff] font-semibold">Correlação Temporal</h3>
              <p className="text-[#8ea9d9] text-xs">Conversões antes, durante e depois dos jogos</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={correlacaoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a44" />
              <XAxis dataKey="periodo" tick={{ fill: '#8ea9d9' }} />
              <YAxis tick={{ fill: '#8ea9d9' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#10182b', 
                  border: '1px solid #1e2a44',
                  borderRadius: '8px',
                  color: '#dbe4ff'
                }}
              />
              <Bar dataKey="conversoes" fill="url(#gradientBar)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d18f" />
                  <stop offset="100%" stopColor="#00a070" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-[#00d18f]/10 rounded-lg border border-[#00d18f]/30">
            <p className="text-[#00d18f] text-xs flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <strong>{conversoesDurante}</strong> conversões ocorrem <strong>durante</strong> os jogos (55%)
            </p>
          </div>
        </Card>
      </div>

      {/* 📺 CONVERSÕES POR CANAL */}
      <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ffb64d] to-[#ff8800] rounded-xl flex items-center justify-center">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[#dbe4ff] font-semibold">Conversões por Canal de TV</h3>
            <p className="text-[#8ea9d9] text-xs">Distribuição de conversões por emissora</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={canaisData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ canal, conversoes }) => `${canal}: ${conversoes}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="conversoes"
              >
                {canaisData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#10182b', 
                  border: '1px solid #1e2a44',
                  borderRadius: '8px',
                  color: '#dbe4ff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col justify-center gap-3">
            {canaisData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#1A2035] rounded-lg border border-[#2a3a54]">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-[#dbe4ff] text-sm font-medium">{item.canal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8ea9d9] text-xs">{item.conversoes} conv</span>
                  <Badge className="bg-[#00BFFF]/20 text-[#00BFFF] border-[#00BFFF]/30 text-[9px]">
                    {((item.conversoes / totalConversoes) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* CSS para scrollbar customizado */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 42, 68, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #00BFFF, #FF00CC);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #00d4ff, #ff1ad4);
        }
      `}</style>
    </div>
  );
}
