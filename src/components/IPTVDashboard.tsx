import { Card } from './ui/card';
import { Button } from './ui/button';
import { Users, CheckCircle, XCircle, TrendingDown, DollarSign, Target, Heart, Calendar, MapPin, Wifi, TrendingUp, Sparkles, Trophy, AlertTriangle, Zap, BarChart2, RefreshCw, Flame, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { parseDate, formatDate } from '../utils/dataProcessing';
import { useState, useEffect, useMemo } from 'react';
import { getMockBrazilianOrImportantGames } from '../utils/mockGamesData';

interface Props {
  data: DashboardData;
  onNavigateToGames?: () => void;
}

// Funções auxiliares para análise avançada
function calcularRenovacoesUltimaSemana(data: DashboardData): number {
  const hoje = new Date();
  const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return data.rawData.renovacoes.filter((ren: any) => {
    const dataRen = parseDate(ren.Data || ren.data || ren.Criado_Em || ren.criado_em);
    return dataRen && dataRen >= umaSemanaAtras && dataRen <= hoje;
  }).length;
}

function calcularRenovacoesProximaSemana(data: DashboardData): number {
  const hoje = new Date();
  const umaSemanaNaFrente = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return data.rawData.ativos.filter((ativo: any) => {
    const expiraEm = parseDate(ativo.Expira_Em || ativo.expira_em || ativo.Expiracao || ativo.expiracao);
    return expiraEm && expiraEm >= hoje && expiraEm <= umaSemanaNaFrente;
  }).length;
}

function calcularRenovacoesProximas2Semanas(data: DashboardData): number {
  const hoje = new Date();
  const duasSemanasNaFrente = new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  return data.rawData.ativos.filter((ativo: any) => {
    const expiraEm = parseDate(ativo.Expira_Em || ativo.expira_em || ativo.Expiracao || ativo.expiracao);
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

// Função auxiliar para normalizar data (apenas dia/mês/ano, sem hora/timezone)
function normalizarData(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calcularVencimentosPorDia(data: DashboardData): { dia: string; data: Date; count: number; label: string }[] {
  // Garantir data local correta (sem problemas de timezone)
  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const proximos7Dias: { dia: string; data: Date; count: number; label: string }[] = [];
  
  for (let i = 0; i < 7; i++) {
    const dataAtual = new Date(hoje);
    dataAtual.setDate(hoje.getDate() + i);
    const dataAtualNormalizada = normalizarData(dataAtual);
    
    // Verificar se rawData e ativos existem antes de filtrar
    const vencimentos = (data.rawData?.ativos && Array.isArray(data.rawData.ativos)) 
      ? data.rawData.ativos.filter((ativo: any) => {
          const expiraEm = parseDate(ativo.Expira_Em || ativo.expira_em || ativo.Expiracao || ativo.expiracao);
          if (!expiraEm) return false;
          // Normalizar ambas as datas para comparação sem timezone
          const expiraEmNormalizada = normalizarData(expiraEm);
          return expiraEmNormalizada === dataAtualNormalizada;
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
  brasao_casa?: string;
  brasao_fora?: string;
  canais?: string;
  status_text?: string;
  is_big_game?: boolean;
}

export function IPTVDashboard({ data, onNavigateToGames }: Props) {
  const [jogosDaSemana, setJogosDaSemana] = useState<JogoFutebol[]>([]);
  const [loadingJogos, setLoadingJogos] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState(0); // 0 = hoje, 1 = ontem, 2 = anteontem...
  
  // Função para carregar jogos (apenas mock - sem API)
  const carregarJogosMock = () => {
    setLoadingJogos(true);
    
    // Usar dados mock - apenas times brasileiros ou jogos importantes
    const mockGames = getMockBrazilianOrImportantGames();
    
    const jogosMock: JogoFutebol[] = mockGames.map(jogo => ({
      time_casa: jogo.time_casa,
      time_fora: jogo.time_fora,
      horario: jogo.horario,
      campeonato: jogo.campeonato,
      estadio: jogo.estadio,
      brasao_casa: jogo.brasao_casa,
      brasao_fora: jogo.brasao_fora,
      canais: jogo.canais,
      status_text: jogo.status_text,
      is_big_game: jogo.is_big_game
    }));
    
    setJogosDaSemana(jogosMock);
    setLoadingJogos(false);
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
        transmissoes: jogo.Transmissoes || jogo.transmissoes,
        brasao_casa: jogo.brasao_casa || jogo.Brasao_Casa,
        brasao_fora: jogo.brasao_fora || jogo.Brasao_Fora,
        canais: jogo.canais || jogo.Canais,
        status_text: jogo.status_text || jogo.Status_Text,
        is_big_game: jogo.is_big_game || jogo.Is_Big_Game || false
      }));
      
      setJogosDaSemana(jogosFormatados);
    } else {
      // Se não houver dados, manter vazio
      setJogosDaSemana([]);
    }
  };
  
  // Carregar jogos ao montar (automaticamente) com pipeline robusto
  useEffect(() => {
    const loadGames = async () => {
      try {
        // Importar serviço de jogos
        const { getGames } = await import('../utils/gamesService');
        
        // Passar dados da planilha se disponíveis
        const sheetData = data.rawData?.jogos;
        const games = await getGames(undefined, sheetData);
        
        // Formatar para o formato esperado
        const formatted = games.map(g => ({
          time_casa: g.home.name,
          time_fora: g.away.name,
          horario: g.time,
          campeonato: g.comp,
          estadio: g.stadium,
          brasao_casa: g.home.badge,
          brasao_fora: g.away.badge,
          canais: g.channels.join(' | '),
          status_text: g.status === 'live' ? 'Ao Vivo' : g.status === 'final' ? 'Encerrado' : 'Programado',
          is_big_game: g.is_big_game,
          placar: g.score,
        }));
        
        setJogosDaSemana(formatted);
      } catch (error) {
        console.error('Erro ao carregar jogos:', error);
        // Fallback para mock local
        carregarJogosMock();
      }
    };
    
    loadGames();
  }, [data.rawData]);
  
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
      color: 'text-[#7B5CFF]',
      bgColor: 'bg-[#7B5CFF]/10',
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

  // ===================================
  // CALCULAR DADOS DO DIA SELECIONADO
  // ===================================
  const dadosDoDiaSelecionado = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diaTarget = new Date(hoje);
    diaTarget.setDate(hoje.getDate() - diaSelecionado);
    
    const isSameDay = (d1: Date | null, d2: Date): boolean => {
      if (!d1) return false;
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };

    // Conversões do dia
    const conversoesDia = (data.rawData?.conversoes || []).filter((c: any) => 
      isSameDay(parseDate(c.Data || c.data), diaTarget)
    );

    // Renovações do dia
    const renovacoesDia = (data.rawData?.renovacoes || []).filter((r: any) => 
      isSameDay(parseDate(r.Data || r.data), diaTarget)
    );

    // Testes do dia
    const testesDia = (data.rawData?.testes || []).filter((t: any) => 
      isSameDay(parseDate(t.Criado_Em || t.criado_em), diaTarget)
    );

    // Expirados do dia
    const expiradosDia = (data.rawData?.expirados || []).filter((e: any) => 
      isSameDay(parseDate(e.Expira_Em || e.expira_em), diaTarget)
    );

    // Ativados do dia
    const ativadosDia = (data.rawData?.ativos || []).filter((a: any) => 
      isSameDay(parseDate(a.Criado_Em || a.criado_em), diaTarget)
    );

    // Calcular créditos gastos, receita e lucro
    const creditosConversoes = conversoesDia.reduce((sum: number, c: any) => sum + (c.Custo || c.custo || 0), 0);
    const creditosRenovacoes = renovacoesDia.reduce((sum: number, r: any) => sum + (r.Custo || r.custo || 0), 0);
    const creditosGastos = creditosConversoes + creditosRenovacoes;
    
    const receita = creditosGastos * 30; // Créditos × R$ 30
    const custo = creditosGastos * 6.5; // Créditos × R$ 6,50
    const lucro = receita - custo;

    return {
      conversoes: conversoesDia.length,
      renovacoes: renovacoesDia.length,
      testes: testesDia.length,
      expirados: expiradosDia.length,
      ativados: ativadosDia.length,
      creditosGastos,
      receita,
      lucro
    };
  }, [data, diaSelecionado]);

  // ===================================
  // CALCULAR DADOS POR HORA DO DIA SELECIONADO
  // ===================================
  const dadosPorHora = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diaTarget = new Date(hoje);
    diaTarget.setDate(hoje.getDate() - diaSelecionado);
    
    const isSameDay = (d1: Date | null, d2: Date): boolean => {
      if (!d1) return false;
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };

    // Inicializar array de 24 horas
    const porHora = Array.from({ length: 24 }, (_, hora) => ({
      hora: `${hora.toString().padStart(2, '0')}h`,
      testes: 0,
      conversoes: 0,
      renovacoes: 0
    }));

    // Contar testes por hora
    (data.rawData?.testes || []).forEach((t: any) => {
      const data = parseDate(t.Criado_Em || t.criado_em);
      if (data && isSameDay(data, diaTarget)) {
        const hora = data.getHours();
        porHora[hora].testes++;
      }
    });

    // Contar conversões por hora
    (data.rawData?.conversoes || []).forEach((c: any) => {
      const data = parseDate(c.Data || c.data);
      if (data && isSameDay(data, diaTarget)) {
        const hora = data.getHours();
        porHora[hora].conversoes++;
      }
    });

    // Contar renovações por hora
    (data.rawData?.renovacoes || []).forEach((r: any) => {
      const data = parseDate(r.Data || r.data);
      if (data && isSameDay(data, diaTarget)) {
        const hora = data.getHours();
        porHora[hora].renovacoes++;
      }
    });

    return porHora;
  }, [data, diaSelecionado]);

  // Função para mudar o dia
  const mudarDia = (dias: number) => {
    setDiaSelecionado(Math.max(0, diaSelecionado + dias));
  };

  // Obter label do dia selecionado
  const getLabelDia = () => {
    if (diaSelecionado === 0) return 'Hoje';
    if (diaSelecionado === 1) return 'Ontem';
    if (diaSelecionado === 2) return 'Anteontem';
    
    const hoje = new Date();
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() - diaSelecionado);
    return dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Debug
  console.log('📊 Overview - Dados do dia selecionado:', {
    dia: getLabelDia(),
    dadosDoDia: dadosDoDiaSelecionado,
    totalHorasComAtividade: dadosPorHora.filter(h => h.testes > 0 || h.conversoes > 0 || h.renovacoes > 0).length
  });

  return (
    <div className="space-y-6">
      {/* Insights Banner */}
      <div className="bg-gradient-to-r from-[#00BFFF] via-[#0090ff] to-[#7B5CFF] rounded-2xl p-6 shadow-2xl">
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
                  <Trophy className="w-4 h-4 text-[#00BFFF]" />
                  <span className="text-white/80 text-xs">Time Destaque</span>
                </>
              ) : estadoMaisPerdidos ? (
                <>
                  <MapPin className="w-4 h-4 text-red-300" />
                  <span className="text-white/80 text-xs">Estado c/ Mais Churn</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-[#7B5CFF]" />
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

      {/* Card HOJE - Métricas do Dia Selecionado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00BFFF]/15 via-[#0B0F18] to-[#FF00CC]/15 rounded-2xl p-6 border-2 border-[#00BFFF]/50 shadow-2xl shadow-[#00BFFF]/30">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #00BFFF 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative z-10">
          {/* Header com Seletor de Dia */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00BFFF] to-[#FF00CC] blur-xl opacity-70 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#00BFFF] to-[#FF00CC] rounded-xl flex items-center justify-center shadow-lg shadow-[#00BFFF]/50">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-[#EAF2FF] text-xl font-semibold tracking-tight">
                  📊 Resumo de {getLabelDia()}
                </h3>
                <p className="text-[#9FAAC6] text-xs mt-0.5">
                  {(() => {
                    const hoje = new Date();
                    const dia = new Date(hoje);
                    dia.setDate(hoje.getDate() - diaSelecionado);
                    return dia.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
                  })()}
                </p>
              </div>
            </div>

            {/* Seletor de Dia */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => mudarDia(1)}
                variant="outline"
                size="sm"
                className="bg-[#0B0F18]/50 border-[#00BFFF]/30 hover:bg-[#00BFFF]/10 hover:border-[#00BFFF]/50 text-[#00BFFF] transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                onClick={() => mudarDia(-1)}
                disabled={diaSelecionado === 0}
                variant="outline"
                size="sm"
                className="bg-[#0B0F18]/50 border-[#00BFFF]/30 hover:bg-[#00BFFF]/10 hover:border-[#00BFFF]/50 text-[#00BFFF] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Grid de Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Testes */}
              <div className="bg-gradient-to-br from-[#a48bff]/20 to-[#a48bff]/5 rounded-xl p-4 border border-[#a48bff]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-[#a48bff]" />
                  <span className="text-[#9FAAC6] text-xs">Testes</span>
                </div>
                <p className="text-white text-2xl font-bold">{dadosDoDiaSelecionado.testes}</p>
                <p className="text-[#a48bff] text-xs mt-1">iniciados</p>
              </div>

              {/* Conversões */}
              <div className="bg-gradient-to-br from-[#00BFFF]/20 to-[#00BFFF]/5 rounded-xl p-4 border border-[#00BFFF]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#00BFFF]" />
                  <span className="text-[#9FAAC6] text-xs">Conversões</span>
                </div>
                <p className="text-white text-2xl font-bold">{dadosDoDiaSelecionado.conversoes}</p>
                <p className="text-[#00BFFF] text-xs mt-1">novos clientes</p>
              </div>

              {/* Renovações */}
              <div className="bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 rounded-xl p-4 border border-[#10b981]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-[#10b981]" />
                  <span className="text-[#9FAAC6] text-xs">Renovações</span>
                </div>
                <p className="text-white text-2xl font-bold">{dadosDoDiaSelecionado.renovacoes}</p>
                <p className="text-[#10b981] text-xs mt-1">renovaram</p>
              </div>

              {/* Ativados */}
              <div className="bg-gradient-to-br from-[#7B5CFF]/20 to-[#7B5CFF]/5 rounded-xl p-4 border border-[#7B5CFF]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#7B5CFF]" />
                  <span className="text-[#9FAAC6] text-xs">Ativados</span>
                </div>
                <p className="text-white text-2xl font-bold">{dadosDoDiaSelecionado.ativados}</p>
                <p className="text-[#7B5CFF] text-xs mt-1">novos ativos</p>
              </div>

              {/* Expirados */}
              <div className="bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/5 rounded-xl p-4 border border-[#ef4444]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-[#ef4444]" />
                  <span className="text-[#9FAAC6] text-xs">Expirados</span>
                </div>
                <p className="text-white text-2xl font-bold">{dadosDoDiaSelecionado.expirados}</p>
                <p className="text-[#ef4444] text-xs mt-1">venceram</p>
              </div>

              {/* Créditos Gastos */}
              <div className="bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 rounded-xl p-4 border border-[#f59e0b]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-[#9FAAC6] text-xs">Créditos</span>
                </div>
                <p className="text-white text-2xl font-bold">{dadosDoDiaSelecionado.creditosGastos}</p>
                <p className="text-[#f59e0b] text-xs mt-1">gastos</p>
              </div>

              {/* Receita */}
              <div className="bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 rounded-xl p-4 border border-[#10b981]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-[#10b981]" />
                  <span className="text-[#9FAAC6] text-xs">Receita</span>
                </div>
                <p className="text-white text-2xl font-bold">R$ {dadosDoDiaSelecionado.receita.toFixed(0)}</p>
                <p className="text-[#10b981] text-xs mt-1">faturado</p>
              </div>

              {/* Lucro */}
              <div className="bg-gradient-to-br from-[#FF00CC]/20 to-[#FF00CC]/5 rounded-xl p-4 border border-[#FF00CC]/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#FF00CC]" />
                  <span className="text-[#9FAAC6] text-xs">Lucro</span>
                </div>
                <p className="text-white text-2xl font-bold">R$ {dadosDoDiaSelecionado.lucro.toFixed(0)}</p>
                <p className="text-[#FF00CC] text-xs mt-1">estimado</p>
              </div>
            </div>
        </div>
      </div>

      {/* Gráfico de Atividade por Hora */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7B5CFF]/10 via-[#0B0F18] to-[#00BFFF]/10 rounded-2xl p-6 border-2 border-[#7B5CFF]/40 shadow-2xl shadow-[#7B5CFF]/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #7B5CFF 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7B5CFF] to-[#00BFFF] blur-lg opacity-60 animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#7B5CFF] to-[#00BFFF] rounded-xl flex items-center justify-center shadow-lg shadow-[#7B5CFF]/50">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-[#EAF2FF] text-xl font-semibold tracking-tight">
                📈 Atividade por Hora - {getLabelDia()}
              </h3>
              <p className="text-[#9FAAC6] text-xs mt-0.5">
                Testes, Conversões e Renovações ao longo do dia
              </p>
            </div>
          </div>

          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={380}>
            <LineChart 
              data={dadosPorHora}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorTestes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a48bff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a48bff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConversoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00BFFF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRenovacoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="hora" 
                stroke="#9FAAC6"
                tick={{ fill: '#9FAAC6', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis 
                stroke="#9FAAC6"
                tick={{ fill: '#9FAAC6', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0B0F18', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
                labelStyle={{ color: '#EAF2FF' }}
                itemStyle={{ color: '#9FAAC6' }}
              />
              <Legend 
                wrapperStyle={{ color: '#EAF2FF' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="testes" 
                stroke="#a48bff" 
                strokeWidth={2.5}
                dot={{ fill: '#a48bff', r: 4 }}
                activeDot={{ r: 6 }}
                name="Testes"
                fillOpacity={1}
                fill="url(#colorTestes)"
                label={(props: any) => {
                  const { x, y, value } = props;
                  if (value === 0) return null;
                  return (
                    <text 
                      x={x} 
                      y={y - 10} 
                      fill="#a48bff" 
                      textAnchor="middle" 
                      fontSize={11}
                      fontWeight="600"
                    >
                      {value}
                    </text>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="conversoes" 
                stroke="#00BFFF" 
                strokeWidth={2.5}
                dot={{ fill: '#00BFFF', r: 4 }}
                activeDot={{ r: 6 }}
                name="Conversões"
                fillOpacity={1}
                fill="url(#colorConversoes)"
                label={(props: any) => {
                  const { x, y, value } = props;
                  if (value === 0) return null;
                  return (
                    <text 
                      x={x} 
                      y={y - 10} 
                      fill="#00BFFF" 
                      textAnchor="middle" 
                      fontSize={11}
                      fontWeight="600"
                    >
                      {value}
                    </text>
                  );
                }}
              />
              <Line 
                type="monotone" 
                dataKey="renovacoes" 
                stroke="#10b981" 
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Renovações"
                fillOpacity={1}
                fill="url(#colorRenovacoes)"
                label={(props: any) => {
                  const { x, y, value } = props;
                  if (value === 0) return null;
                  return (
                    <text 
                      x={x} 
                      y={y - 10} 
                      fill="#10b981" 
                      textAnchor="middle" 
                      fontSize={11}
                      fontWeight="600"
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Resumo do Dia */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-[#a48bff]/10 border border-[#a48bff]/30 rounded-lg px-4 py-2 backdrop-blur-sm">
              <Activity className="w-4 h-4 text-[#a48bff]" />
              <span className="text-[#9FAAC6] text-sm">Total de Testes:</span>
              <span className="text-[#a48bff] font-bold text-lg">{dadosDoDiaSelecionado.testes}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-lg px-4 py-2 backdrop-blur-sm">
              <Target className="w-4 h-4 text-[#00BFFF]" />
              <span className="text-[#9FAAC6] text-sm">Total de Conversões:</span>
              <span className="text-[#00BFFF] font-bold text-lg">{dadosDoDiaSelecionado.conversoes}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg px-4 py-2 backdrop-blur-sm">
              <RefreshCw className="w-4 h-4 text-[#10b981]" />
              <span className="text-[#9FAAC6] text-sm">Total de Renovações:</span>
              <span className="text-[#10b981] font-bold text-lg">{dadosDoDiaSelecionado.renovacoes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jogos de Futebol do Dia - 4 Principais em Horizontal */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00BFFF]/10 via-[#0B0F18] to-[#7B5CFF]/10 rounded-2xl p-6 border-2 border-[#00BFFF]/40 shadow-2xl shadow-[#00BFFF]/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #00BFFF 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00BFFF] to-[#7B5CFF] blur-lg opacity-60 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#00BFFF] to-[#1E90FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#00BFFF]/50">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-[#EAF2FF] text-xl font-semibold tracking-tight">
                  Principais Jogos do Dia
                </h3>
                <p className="text-[#9FAAC6] text-xs mt-0.5">
                  Times Brasileiros • Jogos Importantes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {jogosDaSemana.length > 0 && (
                <Badge className="bg-gradient-to-r from-[#00BFFF]/20 to-[#7B5CFF]/20 text-[#00BFFF] border-[#00BFFF]/50 text-sm px-3 py-1 shadow-lg shadow-[#00BFFF]/20">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {jogosDaSemana.length} jogos disponíveis
                </Badge>
              )}
            </div>
          </div>

          {jogosDaSemana.length > 0 ? (
            <>
              {/* Grid 2x2 com 4 Jogos - MENOR E QUADRADO */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {jogosDaSemana.slice(0, 4).map((jogo, idx) => (
                  <div 
                    key={idx} 
                    className={`group relative overflow-hidden rounded-lg border-2 p-3 transition-all duration-300 hover:scale-105 ${
                      jogo.is_big_game 
                        ? 'bg-gradient-to-br from-[#00BFFF]/15 to-[#7B5CFF]/15 border-[#00BFFF]/60 hover:border-[#7B5CFF]/80 hover:shadow-xl hover:shadow-[#7B5CFF]/30' 
                        : 'bg-gradient-to-br from-[#1A2035] to-[#121726] border-[#1E2840] hover:border-[#00BFFF]/60 hover:shadow-xl hover:shadow-[#00BFFF]/20'
                    }`}
                  >
                    {/* Badge "Jogo Importante" */}
                    {jogo.is_big_game && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-gradient-to-r from-[#FF00CC] to-[#FF1493] text-white text-[9px] px-1.5 py-0.5 shadow-lg shadow-[#FF00CC]/50">
                          <Flame className="w-2.5 h-2.5 mr-0.5" />
                          Hot
                        </Badge>
                      </div>
                    )}

                    {/* Time Casa com Emblema */}
                    <div className="flex flex-col items-center mb-2">
                      {jogo.brasao_casa && (
                        <div className="relative mb-1.5">
                          <div className="absolute inset-0 bg-[#00BFFF] blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                          <img 
                            src={jogo.brasao_casa} 
                            alt={jogo.time_casa || 'Time Casa'} 
                            className="relative w-10 h-10 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <span className="text-[#EAF2FF] font-semibold text-[11px] text-center leading-tight group-hover:text-[#00BFFF] transition-colors line-clamp-2">
                        {jogo.time_casa || jogo.time1 || 'Time A'}
                      </span>
                    </div>
                    
                    {/* VS Destacado */}
                    <div className="flex justify-center mb-2">
                      <div className="px-2 py-0.5 bg-gradient-to-r from-[#00BFFF]/30 to-[#7B5CFF]/30 rounded border border-[#00BFFF]/50">
                        <span className="text-[#00BFFF] font-bold text-[10px]">VS</span>
                      </div>
                    </div>
                    
                    {/* Time Fora com Emblema */}
                    <div className="flex flex-col items-center mb-2">
                      {jogo.brasao_fora && (
                        <div className="relative mb-1.5">
                          <div className="absolute inset-0 bg-[#7B5CFF] blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                          <img 
                            src={jogo.brasao_fora} 
                            alt={jogo.time_fora || 'Time Fora'} 
                            className="relative w-10 h-10 object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <span className="text-[#EAF2FF] font-semibold text-[11px] text-center leading-tight group-hover:text-[#00BFFF] transition-colors line-clamp-2">
                        {jogo.time_fora || jogo.time2 || 'Time B'}
                      </span>
                    </div>
                    
                    {/* Horário */}
                    <div className="flex justify-center mb-2">
                      <div className="px-3 py-1 bg-gradient-to-r from-[#00BFFF]/40 to-[#1E90FF]/40 rounded-md border border-[#00BFFF]/60 shadow-md">
                        <span className="text-[#00BFFF] font-bold text-sm tracking-wide">
                          {jogo.horario || jogo.hora || '--:--'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Detalhes do Jogo - Compacto */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-[#0b0f19]/70 rounded">
                        <Trophy className="w-3 h-3 text-[#7B5CFF] flex-shrink-0" />
                        <span className="text-[#B0BACD] text-[10px] truncate">{jogo.campeonato || jogo.competicao || 'Campeonato'}</span>
                      </div>
                      {(jogo.canais || (jogo.transmissoes && jogo.transmissoes.length > 0)) && (
                        <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-[#0b0f19]/70 rounded">
                          <Wifi className="w-3 h-3 text-[#00BFFF] flex-shrink-0" />
                          <span className="text-[#B0BACD] text-[10px] truncate">{jogo.canais || jogo.transmissoes?.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Insight Footer com Botão */}
              <div className="mt-6 p-4 bg-gradient-to-r from-[#00BFFF]/10 to-[#7B5CFF]/10 rounded-xl border border-[#00BFFF]/30 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#00BFFF] to-[#1E90FF] rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[#00BFFF] font-semibold text-sm mb-1">
                        💡 Insight de Conversão
                      </p>
                      <p className="text-[#B0BACD] text-xs leading-relaxed">
                        Dias com jogos importantes têm <span className="text-[#00BFFF] font-semibold">+23.4%</span> de conversão IPTV!
                        Invista em ADS durante esses horários para melhor ROI.
                      </p>
                    </div>
                  </div>
                  {onNavigateToGames && (
                    <Button
                      onClick={onNavigateToGames}
                      size="sm"
                      className="bg-gradient-to-r from-[#00BFFF] to-[#1E90FF] hover:from-[#1E90FF] hover:to-[#00BFFF] text-white text-sm h-9 px-4 shadow-lg shadow-[#00BFFF]/40 hover:shadow-[#00BFFF]/60 transition-all duration-300 whitespace-nowrap"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 bg-[#1A2035]/50 rounded-xl border border-[#1E2840] text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-[#00BFFF] opacity-50 animate-pulse" />
              <p className="text-[#EAF2FF] text-sm mb-2">
                📺 Carregando jogos do dia...
              </p>
              <p className="text-[#9FAAC6] text-xs">
                Os jogos serão carregados automaticamente
              </p>
            </div>
          )}
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
                <h3 className="text-[#EAF2FF] text-lg">Análise de Renovações</h3>
                <p className="text-[#9FAAC6] text-xs">Performance semanal detalhada</p>
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
                  // Formatar data como DD/MM
                  const dataFormatada = `${item.data.getDate()}/${item.data.getMonth() + 1}`;
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
                        <span className={`text-[10px] ${item.count > 0 ? 'text-emerald-200' : 'text-[#9FAAC6]'}`}>
                          {dataFormatada}
                        </span>
                        {item.count > 0 && (
                          <span className="text-white text-xs mt-0.5">{item.count}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-[#9FAAC6] mt-1">{item.label}</span>
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
                    <span className="text-[#9FAAC6] text-sm">Renovações realizadas</span>
                    <span className="text-[#EAF2FF] text-lg">{calcularRenovacoesUltimaSemana(data)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" 
                         style={{ width: `${(calcularRenovacoesUltimaSemana(data) / Math.max(calcularRenovacoesProximaSemana(data), 1)) * 100}%` }} />
                  </div>
                </div>
                
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#9FAAC6] text-sm">Vencimentos próximos</span>
                    <span className="text-[#EAF2FF] text-lg">{calcularRenovacoesProximaSemana(data)}</span>
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
                <h3 className="text-[#EAF2FF] text-lg">Recomendações & Insights</h3>
                <p className="text-[#9FAAC6] text-xs">Otimize suas campanhas</p>
              </div>
            </div>
            <Badge className="bg-orange-500/20 text-orange-200 border-orange-400/30">
              <Target className="w-3 h-3 mr-1 inline" />
              Ações
            </Badge>
          </div>
          
          <div className="space-y-4">
            {/* Melhores Dias para ADS - Com Calendário Visual */}
            <div className="p-5 bg-gradient-to-br from-orange-500/20 to-amber-600/10 rounded-xl border border-orange-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-orange-300" />
                  </div>
                  <span className="text-orange-200 font-semibold">Melhores Dias para ADS</span>
                </div>
                <Badge className="bg-orange-500/20 text-orange-200 border-orange-400/30">Top 3</Badge>
              </div>

              {/* Ranking de Dias */}
              <div className="grid grid-cols-1 gap-2 mb-4">
                {recomendarDiasParaAds(data).map((rec, idx) => (
                  <div key={idx} className="group p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 rounded-lg border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                          idx === 0 ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
                          idx === 1 ? 'bg-gradient-to-br from-orange-400 to-amber-400' :
                          'bg-gradient-to-br from-orange-300 to-amber-300'
                        }`}>
                          <span className="text-white text-sm font-bold">{idx + 1}º</span>
                        </div>
                        <span className="text-[#EAF2FF] capitalize font-medium">{rec.dia}</span>
                      </div>
                      <Badge className="bg-[#1E2840]/50 text-[#B0BACD] text-xs">{rec.motivo}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendário Visual Semanal */}
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 mb-3">
                <p className="text-[#9FAAC6] text-xs mb-3 text-center">Calendário de Conversões Históricas</p>
                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, idx) => {
                    const diasCompletos = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
                    const conversoes = (data.conversoesPorDia || {})[diasCompletos[idx]] || 0;
                    const maxConversoes = Math.max(...Object.values(data.conversoesPorDia || {}));
                    const intensity = maxConversoes > 0 ? conversoes / maxConversoes : 0;
                    const isTop3 = recomendarDiasParaAds(data).some(rec => rec.dia.includes(diasCompletos[idx].split('-')[0]));
                    
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div 
                          className={`w-full aspect-square rounded-lg border transition-all duration-300 hover:scale-110 cursor-pointer flex flex-col items-center justify-center ${
                            isTop3
                              ? 'bg-gradient-to-br from-orange-500/60 to-amber-500/40 border-orange-400/70 shadow-lg shadow-orange-500/30' 
                              : conversoes > 0
                              ? 'bg-gradient-to-br from-orange-500/30 to-amber-500/20 border-orange-400/40'
                              : 'bg-slate-800/30 border-slate-700/30'
                          }`}
                          style={{
                            boxShadow: isTop3 ? '0 0 15px rgba(249, 115, 22, 0.5)' : conversoes > 0 ? `0 0 ${5 + intensity * 10}px rgba(249, 115, 22, ${0.2 + intensity * 0.3})` : 'none'
                          }}
                        >
                          <span className={`text-[9px] ${isTop3 ? 'text-white font-bold' : conversoes > 0 ? 'text-orange-200' : 'text-[#9FAAC6]'}`}>
                            {dia}
                          </span>
                          {conversoes > 0 && (
                            <span className={`text-[10px] mt-0.5 ${isTop3 ? 'text-white font-bold' : 'text-orange-200'}`}>
                              {conversoes}
                            </span>
                          )}
                        </div>
                        {isTop3 && (
                          <div className="mt-1">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 p-2 bg-orange-500/10 rounded-lg">
                <p className="text-orange-300 text-xs flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Invista em ADS nesses dias para melhor ROI!
                </p>
              </div>
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
                <p className="text-[#9FAAC6] text-sm mb-2">{metric.title}</p>
                <p className="text-[#EAF2FF] text-3xl mb-1 group-hover:scale-105 transition-transform duration-300">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-[#9FAAC6] text-xs">{metric.subtitle}</p>
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
            <h3 className="text-[#EAF2FF]">Vendas por Mês</h3>
          </div>
          <p className="text-[#9FAAC6] text-sm mb-4">Quantas pessoas compraram em cada mês (linha do tempo completa)</p>
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
                <p className="text-[#9FAAC6] text-xs">
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
          <h3 className="text-[#EAF2FF]">Calendário de Vencimentos</h3>
        </div>
        <p className="text-[#9FAAC6] text-sm mb-4">Distribuição de vencimentos nos próximos 30 dias</p>
        
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
                <div className="text-center py-8 text-[#9FAAC6]">
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
          <div className="w-8 h-8 bg-gradient-to-br from-[#7B5CFF] to-[#5B3FCC] rounded-lg flex items-center justify-center">
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
