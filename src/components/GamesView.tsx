import { Card } from './ui/card';
import { Trophy, Target, TrendingUp, Award, Calendar as CalendarIcon, Percent, Sparkles, Flame, RefreshCw, MapPin, BarChart3, Timer, Wifi, Users, DollarSign, Zap, AlertCircle, Medal, Search } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [dataAtual, setDataAtual] = useState<string>('');

  // Carregar jogos de hoje automaticamente
  const carregarJogos = async (dataCustom?: string) => {
    setIsLoading(true);
    try {
      const { getGamesByDate, getGames, todayDateAPI } = await import('../utils/gamesService');
      
      let games;
      let dataExibicao;
      
      if (dataCustom) {
        // Buscar jogos de data específica (formato DD-MM-YYYY)
        games = await getGamesByDate(dataCustom);
        dataExibicao = dataCustom;
      } else {
        // Buscar jogos de hoje
        games = await getGames();
        dataExibicao = todayDateAPI();
      }
      
      setDataAtual(dataExibicao);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar jogos de hoje ao montar
  useEffect(() => {
    carregarJogos();
  }, []);

  // Buscar jogos quando a data for selecionada no calendário
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    
    // Converter para formato DD-MM-YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    
    carregarJogos(dateStr);
  };

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
      {/* 🎯 BUSCAR JOGOS */}
      <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#EAF2FF] font-semibold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#00BFFF]" />
                Buscar Jogos
              </h3>
              {dataAtual && (
                <p className="text-[#8ea9d9] text-xs mt-1">
                  Exibindo jogos de: <span className="text-[#00BFFF] font-medium">{dataAtual}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={() => {
                setSelectedDate(new Date());
                carregarJogos();
              }}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#00BFFF] to-[#7B5CFF] text-white border-0 hover:shadow-lg hover:shadow-[#00BFFF]/30 transition-all"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
              )}
              Jogos de Hoje
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  disabled={isLoading}
                  className="bg-[#1A2035] border-[#2a3a54] text-[#EAF2FF] hover:bg-[#2a3a54] hover:border-[#00BFFF] transition-all h-9 min-w-[200px] justify-start"
                >
                  <CalendarIcon className="w-3.5 h-3.5 mr-2" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#0B0F18] border-[#1e2a44]" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isLoading}
                  locale={ptBR}
                  className="rounded-md border-0"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center text-[#EAF2FF]",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[#EAF2FF]",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-[#8ea9d9] rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#00BFFF]/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-[#EAF2FF] hover:bg-[#1e2a44] rounded-md transition-colors",
                    day_selected: "bg-gradient-to-r from-[#00BFFF] to-[#7B5CFF] text-white hover:bg-gradient-to-r hover:from-[#00BFFF] hover:to-[#7B5CFF] focus:bg-gradient-to-r focus:from-[#00BFFF] focus:to-[#7B5CFF]",
                    day_today: "bg-[#1e2a44] text-[#00BFFF] font-bold",
                    day_outside: "text-[#8ea9d9]/30 opacity-50",
                    day_disabled: "text-[#8ea9d9]/20",
                    day_range_middle: "aria-selected:bg-[#00BFFF]/20 aria-selected:text-[#EAF2FF]",
                    day_hidden: "invisible",
                  }}
                />
              </PopoverContent>
            </Popover>

            <div className="text-[#8ea9d9] text-xs hidden md:flex items-center gap-2 px-3 py-2 bg-[#1A2035]/50 rounded-lg border border-[#2a3a54]">
              <CalendarIcon className="w-3.5 h-3.5" />
              Clique no calendário para selecionar
            </div>
          </div>
        </div>
      </Card>

      {/* 🎯 INSIGHTS INTELIGENTES */}
      <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#EAF2FF] font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00BFFF]" />
            Insights Inteligentes
          </h3>
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
                <CalendarIcon className="w-3 h-3 mr-1" />
                {period === 'day' ? 'Hoje' : period === 'week' ? '7 dias' : '30 dias'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* ⚽ JOGOS - CARDS PREMIUM */}
      {jogosFiltrados.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00BFFF] to-[#0090d4] rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[#dbe4ff] font-semibold">
                  {isLoading ? 'Carregando jogos...' : 'Jogos'}
                </h3>
                <p className="text-[#8ea9d9] text-xs">
                  {isLoading ? 'Aguarde...' : `${jogosFiltrados.length} partidas ${dataAtual ? 'em ' + dataAtual : 'encontradas'}`}
                </p>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              {(['todos', 'brasileiros', 'internacional', 'copa'] as const).map((filtro) => (
                <button
                  key={filtro}
                  onClick={() => setFiltroCategoria(filtro)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filtroCategoria === filtro
                      ? 'bg-[#00BFFF]/20 text-[#00BFFF] border border-[#00BFFF]/30'
                      : 'bg-[#1A2035] text-[#8ea9d9] border border-[#2a3a54] hover:border-[#00BFFF]/20'
                  }`}
                >
                  {filtro === 'todos' ? 'Todos' : filtro === 'brasileiros' ? 'Brasileiros' : filtro === 'internacional' ? 'Internacional' : 'Copas'}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-5 bg-[#0F172A] border-[#1e2a44] animate-pulse">
                  <div className="h-24 bg-[#1A2035] rounded mb-4"></div>
                  <div className="h-4 bg-[#1A2035] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#1A2035] rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jogosFiltrados.map((jogo, idx) => (
              <Card 
                key={idx} 
                className={`p-5 bg-[#0F172A] border-[#1e2a44] hover:border-[#00BFFF]/40 transition-all hover:shadow-lg hover:shadow-[#00BFFF]/10 ${
                  jogo.is_big_game ? 'ring-1 ring-[#FF00CC]/30' : ''
                }`}
              >
                {/* Header do Card */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-[#00BFFF]/10 text-[#00BFFF] border-[#00BFFF]/30 text-[10px]">
                    {jogo.campeonato}
                  </Badge>
                  {jogo.is_big_game && (
                    <Badge className="bg-[#FF00CC]/10 text-[#FF00CC] border-[#FF00CC]/30 text-[10px] flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Destaque
                    </Badge>
                  )}
                </div>

                {/* Times */}
                <div className="flex items-center justify-between mb-4">
                  {/* Time Casa */}
                  <div className="flex flex-col items-center flex-1">
                    <img 
                      src={jogo.brasao_casa} 
                      alt={jogo.time_casa}
                      className="w-12 h-12 mb-2 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/64/1e2a44/8ea9d9?text=?';
                      }}
                    />
                    <span className="text-[#dbe4ff] text-sm font-medium text-center line-clamp-2">
                      {jogo.time_casa}
                    </span>
                  </div>

                  {/* VS + Horário */}
                  <div className="flex flex-col items-center mx-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00BFFF]/20 to-[#FF00CC]/20 border border-[#00BFFF]/30 flex items-center justify-center mb-2">
                      <span className="text-[#00BFFF] font-bold text-xs">VS</span>
                    </div>
                    {jogo.horario && (
                      <span className="text-[#8ea9d9] text-xs font-medium">{jogo.horario}</span>
                    )}
                  </div>

                  {/* Time Fora */}
                  <div className="flex flex-col items-center flex-1">
                    <img 
                      src={jogo.brasao_fora} 
                      alt={jogo.time_fora}
                      className="w-12 h-12 mb-2 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/64/1e2a44/8ea9d9?text=?';
                      }}
                    />
                    <span className="text-[#dbe4ff] text-sm font-medium text-center line-clamp-2">
                      {jogo.time_fora}
                    </span>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="pt-4 border-t border-[#1e2a44] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#8ea9d9]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{jogo.estadio}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8ea9d9]">
                    <Wifi className="w-3.5 h-3.5" />
                    <span className="truncate">{jogo.canais}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-3 flex items-center justify-center">
                  <Badge 
                    className={`text-[10px] ${
                      jogo.status_text === 'Ao Vivo'
                        ? 'bg-[#00d18f]/10 text-[#00d18f] border-[#00d18f]/30 animate-pulse'
                        : 'bg-[#8ea9d9]/10 text-[#8ea9d9] border-[#8ea9d9]/30'
                    }`}
                  >
                    {jogo.status_text}
                  </Badge>
                </div>
              </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Mensagem quando não há jogos */}
      {!isLoading && jogosFiltrados.length === 0 && (
        <Card className="p-12 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] text-center">
          <AlertCircle className="w-16 h-16 text-[#8ea9d9] mx-auto mb-4 opacity-50" />
          <h3 className="text-[#dbe4ff] text-xl mb-2">Nenhum jogo encontrado</h3>
          <p className="text-[#8ea9d9] mb-4">
            Não há jogos programados para {dataAtual || 'esta data'}
          </p>
          <Button
            size="sm"
            onClick={() => carregarJogos()}
            className="bg-gradient-to-r from-[#00BFFF] to-[#7B5CFF] text-white border-0"
          >
            <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
            Ver Jogos de Hoje
          </Button>
        </Card>
      )}

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