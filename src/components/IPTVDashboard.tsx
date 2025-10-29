import { Card } from './ui/card';
import { Button } from './ui/button';
import { Users, CheckCircle, XCircle, TrendingDown, DollarSign, Target, Heart, Calendar, MapPin, Wifi, TrendingUp, Sparkles, Trophy, AlertTriangle, Zap, BarChart2, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { parseDate, formatDate, getRowDate } from '../utils/dataProcessing';
import { useState, useEffect } from 'react';

interface Props {
  data: DashboardData;
}

// Funções auxiliares para análise avançada
function calcularRenovacoesUltimaSemana(data: DashboardData): number {
  const hoje = new Date();
  const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return data.rawData.renovacoes.filter((ren: any) => {
    const dataRen = getRowDate(ren, 'data') || getRowDate(ren, 'criado');
    return dataRen && dataRen >= umaSemanaAtras && dataRen <= hoje;
  }).length;
}

function calcularRenovacoesProximaSemana(data: DashboardData): number {
  const hoje = new Date();
  const umaSemanaNaFrente = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return data.rawData.ativos.filter((ativo: any) => {
    const expiraEm = getRowDate(ativo, 'expira');
    return expiraEm && expiraEm >= hoje && expiraEm <= umaSemanaNaFrente;
  }).length;
}

function calcularRenovacoesProximas2Semanas(data: DashboardData): number {
  const hoje = new Date();
  const duasSemanasNaFrente = new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  return data.rawData.ativos.filter((ativo: any) => {
    const expiraEn = getRowDate(ativo, 'expira');
    const expiraEm = expiraEn;
    return expiraEm && expiraEm >= hoje && expiraEm <= duasSemanasNaFrente;
  }).length;
}

function calcularRenovacoesMesPassado(data: DashboardData): { renovacoesMesPassado: number; renovacoesMesAtual: number; diferenca: number } {
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  
  // Período do mês passado (dia 1 até o dia atual do mês passado)
  const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, diaAtual);
  
  // Período do mês atual (dia 1 até hoje)
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  const renovacoesMesPassado = data.rawData.renovacoes.filter((ren: any) => {
    const dataRen = parseDate(ren.Data || ren.data || ren.Criado_Em || ren.criado_em);
    return dataRen && dataRen >= inicioMesPassado && dataRen <= fimMesPassado;
  }).length;
  
  const renovacoesMesAtual = data.rawData.renovacoes.filter((ren: any) => {
    const dataRen = parseDate(ren.Data || ren.data || ren.Criado_Em || ren.criado_em);
    return dataRen && dataRen >= inicioMesAtual && dataRen <= hoje;
  }).length;
  
  const diferenca = renovacoesMesAtual - renovacoesMesPassado;
  
  return { renovacoesMesPassado, renovacoesMesAtual, diferenca };
}

function analisarPerdasSemanais(data: DashboardData): { perdidos: number; taxaPerda: number } {
  const hoje = new Date();
  const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const perdidos = data.rawData.expirados.filter((exp: any) => {
    const expiraEm = parseDate(exp.Expira_Em || exp.expira_em || exp.Expiracao || exp.expiracao);
    return expiraEm && expiraEm >= umaSemanaAtras && expiraEm <= hoje;
  }).length;
  
  const totalAtivosInicioSemana = data.clientesAtivos + perdidos;
  const taxaPerda = totalAtivosInicioSemana > 0 ? (perdidos / totalAtivosInicioSemana) * 100 : 0;
  
  return { perdidos, taxaPerda };
}

function recomendarDiasParaAds(data: DashboardData): { dia: string; motivo: string }[] {
  const diasOrdenados = Object.entries(data.conversoesPorDia || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);
  
  const recomendacoes = diasOrdenados.map(([dia, count]) => ({
    dia,
    motivo: `${count} conversões históricas`
  }));
  
  // Adicionar sexta/sábado se não estiverem na lista (jogos)
  if (!recomendacoes.some(r => r.dia === 'sexta-feira')) {
    recomendacoes.push({ dia: 'sexta-feira', motivo: 'Véspera de jogos importantes' });
  }
  
  return recomendacoes.slice(0, 3);
}

function calcularVencimentosPorDia(data: DashboardData): { dia: string; data: Date; count: number; label: string }[] {
  const hoje = new Date();
  const proximos7Dias: { dia: string; data: Date; count: number; label: string }[] = [];
  
  for (let i = 0; i < 7; i++) {
    const dataAtual = new Date(hoje);
    dataAtual.setDate(hoje.getDate() + i);
    
    // Verificar se rawData e ativos existem antes de filtrar
    const vencimentos = (data.rawData?.ativos && Array.isArray(data.rawData.ativos)) 
      ? data.rawData.ativos.filter((ativo: any) => {
          const expiraEm = parseDate(ativo.Expira_Em || ativo.expira_em || ativo.Expiracao || ativo.expiracao);
          if (!expiraEm) return false;
          return expiraEm.toDateString() === dataAtual.toDateString();
        }).length
      : 0;
    
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    proximos7Dias.push({
      dia: diasSemana[dataAtual.getDay()],
      data: dataAtual,
      count: vencimentos,
      label: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `${dataAtual.getDate()}/${dataAtual.getMonth() + 1}`
    });
  }
  
  return proximos7Dias;
}

// Interface para jogos de futebol
interface JogoFutebol {
  time_casa?: string;
  time_fora?: string;
  time1?: string;
  time2?: string;
  horario?: string;
  hora?: string;
  campeonato?: string;
  competicao?: string;
  estadio?: string;
  transmissoes?: string[];
}

export function IPTVDashboard({ data }: Props) {
  const [jogosDaSemana, setJogosDaSemana] = useState<JogoFutebol[]>([]);
  const [loadingJogos, setLoadingJogos] = useState(false);
  const [nomeRevenda, setNomeRevenda] = useState<string>('');
  
  // Buscar nome da revenda dos dados
  useEffect(() => {
    if (data.rawData.ativos && data.rawData.ativos.length > 0) {
      const revenda = data.rawData.ativos[0].Revenda || data.rawData.ativos[0].revenda || 
                      data.rawData.ativos[0].Revendedor || data.rawData.ativos[0].revendedor || 'Minha Revenda IPTV';
      setNomeRevenda(revenda);
    } else if (data.topRevendedores && data.topRevendedores.length > 0) {
      setNomeRevenda(data.topRevendedores[0].revendedor || 'Minha Revenda IPTV');
    }
  }, [data]);
  
  // Função para buscar jogos da API
  const buscarJogosAPI = async () => {
    setLoadingJogos(true);
    try {
      const response = await fetch('/jogos-hoje', { cache: 'no-store' });
      if (response.ok) {
        const { jogos = [] } = await response.json();
        if (jogos.length > 0) {
          setJogosDaSemana(jogos.slice(0, 10));
          return;
        }
      }
    } catch (error) {
      console.log('API de jogos não disponível, usando dados do Excel');
    } finally {
      setLoadingJogos(false);
    }
    
    // Fallback: buscar da aba "Jogos" importada do Excel
    buscarJogosExcel();
  };
  
  // Função para buscar jogos do Excel
  const buscarJogosExcel = () => {
    if (data.rawData.jogos && data.rawData.jogos.length > 0) {
      const hoje = new Date();
      const seteDiasNaFrente = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const jogosSemana = data.rawData.jogos.filter((jogo: any) => {
        const dataJogo = parseDate(jogo.Data || jogo.data);
        if (!dataJogo) return false;
        return dataJogo >= hoje && dataJogo <= seteDiasNaFrente;
      }).slice(0, 10);
      
      const jogosFormatados: JogoFutebol[] = jogosSemana.map((jogo: any) => ({
        time_casa: jogo.Time_Casa || jogo.time_casa || jogo.Time || jogo.time1,
        time_fora: jogo.Time_Fora || jogo.time_fora || jogo.Oponente || jogo.time2,
        horario: jogo.Horario || jogo.horario || jogo.hora,
        campeonato: jogo.Competicao || jogo.competicao || jogo.Campeonato || jogo.campeonato,
        estadio: jogo.Estadio || jogo.estadio,
        transmissoes: jogo.Transmissoes || jogo.transmissoes
      }));
      
      setJogosDaSemana(jogosFormatados);
    } else {
      // Se não houver dados, manter vazio
      setJogosDaSemana([]);
    }
  };
  
  // Carregar jogos ao montar
  useEffect(() => {
    buscarJogosExcel();
  }, [data]);
  
  const statusData = [
    { name: 'Ativos', value: data.clientesAtivos || 0, color: '#10b981' },
    { name: 'Vencidos', value: data.clientesExpirados || 0, color: '#ef4444' },
  ];

  const conexoesData = Object.entries(data.conexoesPorTipo || {}).map(([name, value]) => ({
    name,
    value,
    color: '#8b5cf6'
  })).slice(0, 6);

  const statusTestesData = Object.entries(data.statusDistribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const weekdayOrder = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const dailyTrendData = weekdayOrder.map(day => ({
    day: day.substring(0, 3),
    testes: (data.testesPorDia || {})[day] || 0,
    conversoes: (data.conversoesPorDia || {})[day] || 0,
    renovacoes: (data.renovacoesPorDia || {})[day] || 0,
  }));

  // Calcular melhor dia de conversão
  const melhorDiaConversao = Object.entries(data.conversoesPorDia || {})
    .reduce((max, [dia, count]) => count > (max.count || 0) ? { dia, count } : max, { dia: 'domingo', count: 0 });

  // Top time com mais conversões (se houver dados de jogos)
  const topTime = data.topTimes && data.topTimes.length > 0 
    ? data.topTimes[0] 
    : null;

  // Estado com mais clientes perdidos
  const estadoMaisPerdidos = data.porEstado && data.porEstado.length > 0
    ? data.porEstado.reduce((max, estado) => 
        estado.expirados > (max.expirados || 0) ? estado : max, 
        data.porEstado[0]
      )
    : null;

  const metrics = [
    {
      title: 'Total de Clientes',
      value: ((data.clientesAtivos || 0) + (data.clientesExpirados || 0)).toLocaleString('pt-BR'),
      subtitle: `Em ${data.estadosCobertos || 0} estados`,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Assinaturas Ativas',
      value: (data.clientesAtivos || 0).toLocaleString('pt-BR'),
      subtitle: `${(data.taxaRetencao || 0).toFixed(1)}% continuam assinando`,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pessoas que Compraram',
      value: `${(data.taxaConversao || 0).toFixed(1)}%`,
      subtitle: `${data.conversoes || 0} compraram de ${data.testes || 0} testes`,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Faturamento Mensal',
      value: `R$ ${(data.receitaMensal || 0).toLocaleString('pt-BR')}`,
      subtitle: `Anual: R$ ${((data.receitaAnual || 0) / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Clientes Fiéis',
      value: `${(data.taxaFidelidade || 0).toFixed(1)}%`,
      subtitle: `${data.clientesFieis || 0} renovaram 2+ vezes`,
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Clientes Perdidos',
      value: `${(data.churnRate || 0).toFixed(1)}%`,
      subtitle: `${data.clientesExpirados || 0} não renovaram`,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Calcular métricas para o resumo executivo
  const renovacoesUltimaSemana = calcularRenovacoesUltimaSemana(data);
  const renovacoesProximaSemana = calcularRenovacoesProximaSemana(data);
  const renovacoesProximas2Semanas = calcularRenovacoesProximas2Semanas(data);
  const { perdidos, taxaPerda } = analisarPerdasSemanais(data);
  const comparativoRenovacoes = calcularRenovacoesMesPassado(data);

  return (
    <div className="space-y-6">
      {/* Header com nome da revenda */}
      {nomeRevenda && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Relatório da Revenda</p>
                <h1 className="text-white text-xl">{nomeRevenda}</h1>
              </div>
            </div>
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
              Dashboard Analítico
            </Badge>
          </div>
        </div>
      )}
      
      {/* Insights Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-white text-xl">Insights Inteligentes do Dia</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-white/80 text-xs">Taxa de conversão</span>
            </div>
            <p className="text-white text-lg">
              {(data.taxaConversao || 0).toFixed(1)}% 
              <span className="text-xs text-white/60 ml-1">
                {data.taxaConversao > 18 ? 'acima' : 'abaixo'} da média (18%)
              </span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-300" />
              <span className="text-white/80 text-xs capitalize">{melhorDiaConversao.dia}</span>
            </div>
            <p className="text-white text-lg">
              é seu melhor dia: 
              <span className="text-xs text-white/60 ml-1">
                {melhorDiaConversao.count.toLocaleString('pt-BR')} conversões
              </span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-yellow-300" />
              <span className="text-white/80 text-xs">Receita Potencial</span>
            </div>
            <p className="text-white text-lg">
              R$ {((data.receitaMensal || 0) * 12 / 1000).toFixed(0)}k 
              <span className="text-xs text-white/60 ml-1">anual projetada</span>
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              {topTime ? (
                <>
                  <Trophy className="w-4 h-4 text-pink-300" />
                  <span className="text-white/80 text-xs">Time Destaque</span>
                </>
              ) : estadoMaisPerdidos ? (
                <>
                  <MapPin className="w-4 h-4 text-red-300" />
                  <span className="text-white/80 text-xs">Estado c/ Mais Churn</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-pink-300" />
                  <span className="text-white/80 text-xs">Retenção</span>
                </>
              )}
            </div>
            <p className="text-white text-lg">
              {topTime ? (
                <>{topTime.time} <span className="text-xs text-white/60 ml-1">{topTime.conversoes} conversões</span></>
              ) : estadoMaisPerdidos ? (
                <>{estadoMaisPerdidos.estado} <span className="text-xs text-white/60 ml-1">{estadoMaisPerdidos.expirados} perdidos</span></>
              ) : (
                <>{(data.taxaRetencao || 0).toFixed(1)}% <span className="text-xs text-white/60 ml-1">mantidos</span></>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Insights Avançados - Análise Semanal e Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise de Renovações e Perdas */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 border-slate-700 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg">Análise de Renovações</h3>
                <p className="text-slate-400 text-xs">Performance semanal detalhada</p>
              </div>
            </div>
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Insights
            </Badge>
          </div>
          
          <div className="space-y-4">
            {/* Última Semana - Melhorado */}
            <div className="p-5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-blue-300" />
                  </div>
                  <span className="text-blue-200">Última Semana</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">7 dias</Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-white text-4xl">{calcularRenovacoesUltimaSemana(data)}</p>
                <p className="text-blue-300">renovações</p>
              </div>
              <div className="flex items-center gap-2 text-blue-300 text-sm mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {calcularRenovacoesUltimaSemana(data) > 0 
                    ? `${(calcularRenovacoesUltimaSemana(data) / 7).toFixed(1)} por dia em média`
                    : 'Nenhuma renovação registrada'}
                </span>
              </div>
              {/* Mini barra de progresso */}
              <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((calcularRenovacoesUltimaSemana(data) / Math.max(calcularRenovacoesProximaSemana(data), 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Calendário Visual de Vencimentos */}
            <div className="p-5 bg-gradient-to-br from-emerald-500/20 to-green-600/10 rounded-xl border border-emerald-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-300" />
                  </div>
                  <span className="text-emerald-200">Calendário de Vencimentos</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                  {calcularRenovacoesProximaSemana(data)} total
                </Badge>
              </div>
              
              {/* Calendário mini visual */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {calcularVencimentosPorDia(data).map((item, idx) => {
                  const maxCount = Math.max(...calcularVencimentosPorDia(data).map(d => d.count), 1);
                  const intensity = item.count / maxCount;
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div 
                        className={`w-full aspect-square rounded-lg border transition-all duration-300 hover:scale-110 cursor-pointer flex flex-col items-center justify-center ${
                          item.count > 0 
                            ? 'bg-gradient-to-br from-emerald-500/40 to-green-500/30 border-emerald-400/50 shadow-md' 
                            : 'bg-slate-800/30 border-slate-700/30'
                        }`}
                        style={{
                          boxShadow: item.count > 0 ? `0 0 ${10 + intensity * 10}px rgba(16, 185, 129, ${0.3 + intensity * 0.3})` : 'none'
                        }}
                      >
                        <span className={`text-[10px] ${item.count > 0 ? 'text-emerald-200' : 'text-slate-500'}`}>
                          {item.dia}
                        </span>
                        {item.count > 0 && (
                          <span className="text-white text-xs mt-0.5">{item.count}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1">{item.label}</span>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-emerald-300 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Oportunidade de renovação nos próximos dias!
              </p>
            </div>

            {/* Perdas - Melhorado */}
            <div className="p-5 bg-gradient-to-br from-red-500/20 to-rose-600/10 rounded-xl border border-red-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-300" />
                  </div>
                  <span className="text-red-200">Clientes Perdidos</span>
                </div>
                <Badge className="bg-red-500/20 text-red-200 border-red-400/30">7 dias</Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-white text-4xl">{analisarPerdasSemanais(data).perdidos}</p>
                <p className="text-red-300">clientes</p>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-red-300">Taxa de Churn</span>
                  <span className="text-white">{analisarPerdasSemanais(data).taxaPerda.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      analisarPerdasSemanais(data).taxaPerda < 5 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                        : analisarPerdasSemanais(data).taxaPerda < 10
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                        : 'bg-gradient-to-r from-red-500 to-rose-400'
                    }`}
                    style={{ width: `${Math.min(analisarPerdasSemanais(data).taxaPerda * 5, 100)}%` }}
                  />
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm ${
                analisarPerdasSemanais(data).taxaPerda < 5 ? 'text-green-300' :
                analisarPerdasSemanais(data).taxaPerda < 10 ? 'text-yellow-300' : 'text-red-300'
              }`}>
                <Heart className="w-4 h-4" />
                <span>
                  {analisarPerdasSemanais(data).taxaPerda < 5 
                    ? 'Excelente retenção!' 
                    : analisarPerdasSemanais(data).taxaPerda < 10 
                    ? 'Boa retenção' 
                    : 'Considere ações de retenção'}
                </span>
              </div>
            </div>

            {/* Comparativo - Melhorado */}
            <div className="p-5 bg-gradient-to-br from-purple-500/20 to-violet-600/10 rounded-xl border border-purple-500/40 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-purple-300" />
                </div>
                <span className="text-purple-200">Análise Comparativa</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-sm">Renovações realizadas</span>
                    <span className="text-white text-lg">{calcularRenovacoesUltimaSemana(data)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" 
                         style={{ width: `${(calcularRenovacoesUltimaSemana(data) / Math.max(calcularRenovacoesProximaSemana(data), 1)) * 100}%` }} />
                  </div>
                </div>
                
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-sm">Vencimentos próximos</span>
                    <span className="text-white text-lg">{calcularRenovacoesProximaSemana(data)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full w-full" />
                  </div>
                </div>
                
                <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-300" />
                      <span className="text-purple-200 text-sm">Meta de renovações</span>
                    </div>
                    <span className="text-purple-100 text-lg">
                      ~{Math.round(calcularRenovacoesProximaSemana(data) * (1 - (data.churnRate || 0) / 100))}
                    </span>
                  </div>
                  <p className="text-purple-300 text-xs mt-1">
                    Com {((1 - (data.churnRate || 0) / 100) * 100).toFixed(0)}% de taxa de conversão esperada
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recomendações e Jogos */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 border-slate-700 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg">Recomendações & Insights</h3>
                <p className="text-slate-400 text-xs">Otimize suas campanhas</p>
              </div>
            </div>
            <Badge className="bg-orange-500/20 text-orange-200 border-orange-400/30">
              <Target className="w-3 h-3 mr-1 inline" />
              Ações
            </Badge>
          </div>
          
          <div className="space-y-4">
            {/* Melhores Dias para ADS - Melhorado */}
            <div className="p-5 bg-gradient-to-br from-orange-500/20 to-amber-600/10 rounded-xl border border-orange-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-300" />
                  </div>
                  <span className="text-orange-200">Melhores Dias para ADS</span>
                </div>
                <Badge className="bg-orange-500/20 text-orange-200 border-orange-400/30">Top 3</Badge>
              </div>
              <div className="space-y-2">
                {recomendarDiasParaAds(data).map((rec, idx) => (
                  <div key={idx} className="group p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-lg border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-md hover:shadow-orange-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                          <span className="text-white text-sm">{idx + 1}º</span>
                        </div>
                        <span className="text-white capitalize group-hover:text-orange-200 transition-colors">{rec.dia}</span>
                      </div>
                      <Badge className="bg-slate-700/50 text-slate-300 text-xs">{rec.motivo}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-orange-500/10 rounded-lg">
                <p className="text-orange-300 text-xs flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Invista em ADS nesses dias para melhor ROI!
                </p>
              </div>
            </div>

            {/* Jogos de Futebol da Semana - Melhorado com API */}
            <div className="p-5 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-xl border border-green-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-green-300" />
                  </div>
                  <span className="text-green-200">Jogos de Futebol da Semana</span>
                </div>
                <div className="flex items-center gap-2">
                  {jogosDaSemana.length > 0 && (
                    <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                      {jogosDaSemana.length} jogos
                    </Badge>
                  )}
                  <Button
                    onClick={buscarJogosAPI}
                    disabled={loadingJogos}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3"
                  >
                    {loadingJogos ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Carregar API
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {jogosDaSemana.length > 0 ? (
                <div className="space-y-2">
                  {jogosDaSemana.slice(0, 5).map((jogo, idx) => (
                    <div key={idx} className="group p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-lg border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-md hover:shadow-green-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-white text-sm group-hover:text-green-200 transition-colors">
                            {jogo.time_casa || jogo.time1 || 'Time A'} <span className="text-slate-500">vs</span> {jogo.time_fora || jogo.time2 || 'Time B'}
                          </span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 text-xs border-green-500/30">
                          {jogo.horario || jogo.hora || '--:--'}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-slate-400 text-xs">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-3 h-3" />
                          <span>{jogo.campeonato || jogo.competicao || 'Campeonato'}</span>
                        </div>
                        {jogo.estadio && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span>{jogo.estadio}</span>
                          </div>
                        )}
                        {jogo.transmissoes && jogo.transmissoes.length > 0 && (
                          <div className="flex items-center gap-2 text-blue-400">
                            <Wifi className="w-3 h-3" />
                            <span>{jogo.transmissoes.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                    <p className="text-green-300 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Dias de jogos importantes têm maior conversão IPTV!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <p className="text-slate-400 text-sm text-center">
                    📺 Nenhum jogo encontrado para esta semana
                  </p>
                  <p className="text-slate-500 text-xs text-center mt-1">
                    Clique em "Carregar API" ou importe a aba "Jogos" do Excel
                  </p>
                </div>
              )}
            </div>

            {/* Alerta de Ação - Melhorado com Novas Métricas */}
            <div className="p-5 bg-gradient-to-br from-yellow-500/20 to-orange-600/10 rounded-xl border border-yellow-500/40 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-300" />
                </div>
                <span className="text-yellow-200">Ação Recomendada</span>
              </div>
              
              {/* Alertas Principais */}
              <div className="space-y-2 mb-3">
                {/* Clientes que deixaram de pagar */}
                {perdidos > 0 && (
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 text-sm">Perdas na Última Semana</span>
                    </div>
                    <p className="text-white">
                      ⚠️ {perdidos} clientes deixaram de pagar nos últimos 7 dias
                      <span className="text-red-300 text-xs ml-2">
                        ({taxaPerda.toFixed(1)}% de churn semanal)
                      </span>
                    </p>
                  </div>
                )}
                
                {/* Renovações próximas */}
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">Renovações Próximas</span>
                  </div>
                  <p className="text-white text-sm">
                    📅 {renovacoesProximaSemana} clientes vencem em 7 dias | {renovacoesProximas2Semanas} em 14 dias
                  </p>
                </div>
                
                {/* Comparativo com mês passado */}
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart2 className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm">Comparativo Mensal</span>
                  </div>
                  <p className="text-white text-sm">
                    {comparativoRenovacoes.diferenca >= 0 ? '📈' : '📉'} 
                    {' '}{comparativoRenovacoes.renovacoesMesAtual} renovações até agora vs {comparativoRenovacoes.renovacoesMesPassado} no mês passado
                    <span className={`text-xs ml-2 ${comparativoRenovacoes.diferenca >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      ({comparativoRenovacoes.diferenca >= 0 ? '+' : ''}{comparativoRenovacoes.diferenca})
                    </span>
                  </p>
                </div>
              </div>
              
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg border border-blue-500/30">
                  <p className="text-blue-300 text-xs mb-1">Taxa de Conversão</p>
                  <p className="text-white text-lg">{(data.taxaConversao || 0).toFixed(1)}%</p>
                </div>
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-lg border border-green-500/30">
                  <p className="text-green-300 text-xs mb-1">Taxa de Retenção</p>
                  <p className="text-white text-lg">{(data.taxaRetencao || 0).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-2">{metric.title}</p>
                <p className="text-white text-3xl mb-1 group-hover:scale-105 transition-transform duration-300">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-slate-500 text-xs">{metric.subtitle}</p>
                )}
              </div>
              <div className={`w-14 h-14 rounded-xl ${metric.bgColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className={`w-7 h-7 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Status de Clientes</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => value.toLocaleString('pt-BR')}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} label={{ position: 'right', fill: '#fff', fontSize: 14 }}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-green-400 text-xs">Taxa de Retenção</p>
              <p className="text-green-400 text-xl">{(data.taxaRetencao || 0).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="text-red-400 text-xs">Taxa de Churn</p>
              <p className="text-red-400 text-xl">{(data.churnRate || 0).toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        {/* Conexões Distribution */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Vendas por Mês</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">Quantas pessoas compraram em cada mês (linha do tempo completa)</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.conversoesPorMes || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Vendas']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} name="Vendas no Mês" dot={{ r: 5, fill: '#06b6d4' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-1 gap-2">
            <div className="text-center p-3 bg-cyan-500/10 rounded-lg">
              <p className="text-cyan-400 text-xs">Total de Vendas</p>
              <p className="text-cyan-400 text-xl">{(data.conversoes || 0).toLocaleString('pt-BR')}</p>
            </div>
            {data.conversoesPorMes && data.conversoesPorMes.length > 0 && (
              <div className="text-center p-2 bg-slate-800/50 rounded border border-slate-700">
                <p className="text-slate-400 text-xs">
                  📅 Operação iniciada em {data.conversoesPorMes[0]?.mes || '-'}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Calendário de Vencimentos - Próximos 30 dias */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white">Calendário de Vencimentos</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">Distribuição de vencimentos nos próximos 30 dias</p>
        
        {(() => {
          const hoje = new Date();
          const proximos30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
          
          // Agrupar vencimentos por dia
          const vencimentosPorDia: Record<string, number> = {};
          
          data.rawData.ativos.forEach((ativo: any) => {
            const expiraEm = parseDate(ativo.Expira_Em || ativo.expira_em || ativo.Expiracao || ativo.expiracao);
            if (expiraEm && expiraEm >= hoje && expiraEm <= proximos30Dias) {
              const dia = Math.floor((expiraEm.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
              vencimentosPorDia[dia] = (vencimentosPorDia[dia] || 0) + 1;
            }
          });
          
          // Criar array de dados para o gráfico
          const vencimentosData = Array.from({ length: 30 }, (_, i) => ({
            dia: `+${i + 1}d`,
            vencimentos: vencimentosPorDia[i] || 0
          })).filter(d => d.vencimentos > 0).slice(0, 15); // Mostrar apenas dias com vencimentos
          
          const totalVencimentos = Object.values(vencimentosPorDia).reduce((a, b) => a + b, 0);
          
          return (
            <>
              {vencimentosData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={vencimentosData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="dia" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                        formatter={(value: any) => [`${value} vencimentos`, 'Quantidade']}
                      />
                      <Bar dataKey="vencimentos" fill="#8b5cf6" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#8b5cf6', fontSize: 11 }} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 text-center">
                      <p className="text-purple-300 text-xs">Total 30 dias</p>
                      <p className="text-white text-xl">{totalVencimentos}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 text-center">
                      <p className="text-blue-300 text-xs">Próximos 7 dias</p>
                      <p className="text-white text-xl">{calcularRenovacoesProximaSemana(data)}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
                      <p className="text-green-300 text-xs">Receita potencial</p>
                      <p className="text-white text-lg">R$ {(totalVencimentos * (data.ticketMedio || 30)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Nenhum vencimento nos próximos 30 dias
                </div>
              )}
            </>
          );
        })()}
      </Card>

      {/* Activity by Day */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white">Atividade por Dia da Semana</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">Performance de testes e vendas por dia da semana</p>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dailyTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              formatter={(value: any) => value.toLocaleString('pt-BR')}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="testes" fill="#6366f1" name="Testes Grátis" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#6366f1', fontSize: 12 }} />
            <Bar dataKey="conversoes" fill="#10b981" name="Conversões" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#10b981', fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30 text-center">
            <p className="text-purple-300 text-xs mb-1">Melhor Dia (Conversões)</p>
            <p className="text-white capitalize">{melhorDiaConversao.dia}</p>
            <p className="text-purple-300 text-sm">{melhorDiaConversao.count} vendas</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
            <p className="text-green-300 text-xs mb-1">Taxa Média Conversão</p>
            <p className="text-white text-xl">{(data.taxaConversao || 0).toFixed(1)}%</p>
            <p className="text-green-300 text-sm">{data.conversoes} de {data.testes} testes</p>
          </div>
        </div>
      </Card>


    </div>
  );
}
