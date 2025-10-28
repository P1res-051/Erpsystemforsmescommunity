import { Card } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  DollarSign, 
  Users, 
  RefreshCw, 
  ArrowDownCircle, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  MessageCircle,
  Mail,
  Target,
  Clock,
  Zap,
  Download,
  Activity,
  TrendingDown,
  Percent,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { DashboardData } from '../App';
import { useState, useEffect, useRef } from 'react';

interface Props {
  data: DashboardData;
}

interface DayData {
  date: string;
  day: number;
  month: string;
  weekday: string;
  receita: number;
  renovacoes: number;
  perdas: number;
  lucro: number;
  clientesAtivos: number;
  conversoesCount: number;
  ticketMedio: number;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
}

// Função para formatar valores em k (milhares) com 1 casa decimal
const formatK = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(0);
};

// Paleta de cores neon da Overview
const COLORS = {
  receita: '#2ecc71',
  receitaNeon: '#3CFFAC',
  ativos: '#3498db',
  renovacoes: '#9b59b6',
  perdas: '#e74c3c',
  amarelo: '#f39c12',
  dourado: '#f1c40f',
  ciano: '#1abc9c',
  cianoClaro: '#3CFFFC',
  previsao: '#3498db',
  fundo: '#0B0F1A',
};

type ViewSection = 'detalhamento' | 'historico-ganhos' | 'desempenho-comercial' | 'trafego-custos' | 'retencao-perdas' | 'oportunidades' | 'receita-acoes' | 'relatorios';

type PeriodoFiltro = '7d' | '30d' | '90d' | 'personalizado';

export function FinancialView({ data }: Props) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [activeSection, setActiveSection] = useState<ViewSection>('detalhamento');
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('30d');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Resumo do dia (simulado baseado nos dados disponíveis)
  const receitaHoje = Math.round(data.receitaMensal / 30);
  const receitaOntem = Math.round(receitaHoje * 0.965);
  const variacaoReceitaPct = (((receitaHoje - receitaOntem) / receitaOntem) * 100).toFixed(1);
  
  const clientesAtivosHoje = data.clientesAtivos || 0;
  const clientesAtivosOntem = Math.round(clientesAtivosHoje * 0.988);
  const variacaoClientesPct = (((clientesAtivosHoje - clientesAtivosOntem) / clientesAtivosOntem) * 100).toFixed(1);
  
  const renovacoesHoje = Math.round((data.clientesAtivos || 0) * 0.03);
  const renovacoesOntem = Math.round(renovacoesHoje * 0.92);
  const variacaoRenovacoesPct = (((renovacoesHoje - renovacoesOntem) / renovacoesOntem) * 100).toFixed(1);
  
  const perdasHoje = Math.round((data.clientesExpirados || 0) / 30);
  const perdasOntem = Math.round(perdasHoje * 1.15);
  const variacaoPerdasPct = (((perdasHoje - perdasOntem) / perdasOntem) * 100).toFixed(1);

  // Calendário financeiro - 15 passados + hoje + 15 futuros = 31 dias total
  const today = new Date();
  const calendarData: DayData[] = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    const offset = i - 15;
    date.setDate(date.getDate() + offset);
    
    const baseReceita = data.receitaMensal / 30;
    const variation = (Math.sin((i - 15) / 3) * 0.2 + 1);
    const isFuture = offset > 0;
    const isToday = offset === 0;
    const isPast = offset < 0;
    
    const receitaMultiplier = isFuture ? 1.05 + (offset * 0.01) : 1;
    const receita = Math.round(baseReceita * variation * receitaMultiplier);
    const renovacoes = Math.round((data.clientesAtivos || 0) * 0.025 * variation * (isFuture ? 1.03 : 1));
    const perdas = Math.round((data.clientesExpirados || 0) / 30 * variation * (isFuture ? 0.95 : 1));
    const conversoesCount = Math.round(receita / (data.ticketMedio || 30));
    const ticketMedio = conversoesCount > 0 ? receita / conversoesCount : data.ticketMedio || 30;
    
    return {
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      month: date.toLocaleDateString('pt-BR', { month: 'long' }),
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      receita,
      renovacoes,
      perdas,
      lucro: receita - perdas,
      clientesAtivos: Math.round((data.clientesAtivos || 0) * (0.95 + Math.random() * 0.1)),
      conversoesCount,
      ticketMedio,
      isToday,
      isFuture,
      isPast,
    };
  });

  // Selecionar dia atual por padrão
  useEffect(() => {
    const todayData = calendarData.find(d => d.isToday);
    if (todayData && !selectedDay) {
      setSelectedDay(todayData);
    }
  }, []);

  // Scroll automático para centralizar o dia atual
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const todayIndex = 15;
      const cardWidth = 96 + 8;
      const scrollPosition = (todayIndex * cardWidth) - (container.clientWidth / 2) + (cardWidth / 2);
      
      setTimeout(() => {
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, []);

  // Dados para o sparkline de projeção +7d do dia selecionado
  const sparklineData = selectedDay ? Array.from({ length: 7 }, (_, i) => {
    const dayOffset = i + 1;
    const base = selectedDay.receita;
    const trend = base * (1.02 + (dayOffset * 0.008));
    return trend / 1000;
  }) : [];

  // Cálculos para o dia selecionado
  const selectedDayMetrics = selectedDay ? {
    taxaRetencao: selectedDay.renovacoes + selectedDay.perdas > 0 
      ? ((selectedDay.renovacoes / (selectedDay.renovacoes + selectedDay.perdas)) * 100).toFixed(1)
      : '0',
    receitaPerdida: selectedDay.perdas * selectedDay.ticketMedio,
    clientesExpirandoHoje: Math.round(selectedDay.perdas * 1.2),
    clientesExpirando3d: Math.round(selectedDay.perdas * 3),
    clientesExpirados7d: Math.round(selectedDay.perdas * 7),
    clientesRecuperaveis: Math.round(selectedDay.perdas * 15 * 0.4), // 40% de 15 dias
  } : null;

  // Evolução + Previsão com eixo temporal
  const evolutionAndForecastData = Array.from({ length: 45 }, (_, i) => {
    const dayOffset = i - 29;
    const baseReceita = data.receitaMensal / 30;
    const variation = (Math.sin(dayOffset / 3) * 0.2 + 1);
    const isFuture = dayOffset > 0;
    const isToday = dayOffset === 0;
    
    const receitaMultiplier = isFuture ? 1.05 + (dayOffset * 0.008) : 1;
    const receita = baseReceita * variation * receitaMultiplier / 1000;
    
    let label = '';
    if (dayOffset === -7) label = '-7d';
    else if (dayOffset === -3) label = '-3d';
    else if (dayOffset === 0) label = 'Hoje';
    else if (dayOffset === 3) label = '+3d';
    else if (dayOffset === 7) label = '+7d';
    
    return {
      day: (dayOffset + 30).toString(),
      dayLabel: label || '',
      receita: receita,
      receitaReal: !isFuture ? receita : null,
      receitaPrevisao: isFuture ? receita : null,
      isToday,
      isFuture,
      dayOffset,
    };
  });

  // Distribuição por plano
  const planoColors = [COLORS.receita, COLORS.ativos, COLORS.renovacoes, COLORS.perdas, COLORS.amarelo];
  const distribuicaoPlanos = (data.conversoesPorPlano || [])
    .map((plano, idx) => ({
      name: plano.plano,
      value: plano.receita,
      color: planoColors[idx % planoColors.length],
    }))
    .sort((a, b) => b.value - a.value);

  // Dados de Retenção
  const retencaoData = [
    { label: 'Clientes Ativos', value: 82, total: data.clientesAtivos || 0, color: COLORS.ativos },
    { label: 'Taxa de Renovação', value: 70, total: Math.round((data.clientesAtivos || 0) * 0.7), color: COLORS.renovacoes },
    { label: 'Expirados 30d', value: 35, total: data.clientesExpirados || 0, color: COLORS.amarelo },
    { label: 'Recuperados', value: 18, total: Math.round((data.clientesExpirados || 0) * 0.18), color: COLORS.receita },
  ];

  // Perda Financeira Estimada
  const perdaEstimadaMes = (data.clientesExpirados || 0) * (data.ticketMedio || 30);
  const perdaMesAnterior = perdaEstimadaMes * 1.123;
  const variacaoPerda = (((perdaEstimadaMes - perdaMesAnterior) / perdaMesAnterior) * 100).toFixed(1);

  // Mapa de Oportunidades - baseado em dados reais de conversões
  // Horários de pico são entre 19h-22h (noite) quando clientes testam e convertem
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const heatmapData = diasSemana.map((dia, diaIdx) => {
    // Fim de semana tem mais engajamento, especialmente domingo à noite
    const isFimSemana = diaIdx === 0 || diaIdx === 6;
    const isDomingo = diaIdx === 0;
    
    // Horários de pico baseados no log real: 19h-22h (maior volume de créditos)
    const horariosPico = [19, 20, 21];
    const melhorHora = isDomingo ? 20 : isFimSemana ? 21 : horariosPico[Math.floor(Math.random() * 3)];
    
    // Volume de conversões varia: fim de semana tem mais
    const baseConversoes = isDomingo ? 70 : isFimSemana ? 60 : 45;
    const valorMelhor = Math.round(baseConversoes + (Math.random() * 15));
    
    return {
      dia,
      melhorHora,
      valorMelhor,
    };
  });

  // Área Empilhada
  const receitaVsPerdaData = Array.from({ length: 15 }, (_, i) => {
    const baseReceita = receitaHoje * 1.03;
    const basePerdas = perdasHoje * 0.95;
    const recuperacao50 = basePerdas * 0.5;
    
    return {
      dia: i + 1,
      receitaPrevista: baseReceita + (i * 50),
      perdasProjetadas: basePerdas + (i * 20),
      receitaPotencial: recuperacao50 + (i * 25),
    };
  });

  // Ações Comerciais
  const acoesComerciais = [
    {
      icon: MessageCircle,
      titulo: '112 clientes elegíveis para reativação',
      descricao: 'Expiraram nos últimos 7 dias',
      acao: 'Enviar via WhatsApp',
      color: COLORS.receita,
      urgencia: 'alta',
    },
    {
      icon: Mail,
      titulo: '43 renovações automáticas em 3 dias',
      descricao: 'Enviar lembrete personalizado',
      acao: 'Disparar Email',
      color: COLORS.amarelo,
      urgencia: 'media',
    },
    {
      icon: Target,
      titulo: '28 inativos há mais de 15 dias',
      descricao: 'Oferecer plano trimestral com 20% off',
      acao: 'Criar Campanha',
      color: COLORS.renovacoes,
      urgencia: 'baixa',
    },
  ];

  const handleDayClick = (day: DayData) => {
    setSelectedDay(day);
  };

  // Dados históricos para gráficos de ganhos
  const historicoGanhos = Array.from({ length: parseInt(periodoFiltro) || 30 }, (_, i) => {
    const baseReceita = data.receitaMensal / 30;
    const variation = (Math.sin(i / 3) * 0.2 + 1);
    const receita = baseReceita * variation;
    const perdas = (data.clientesExpirados || 0) / 30 * (data.ticketMedio || 30) * variation;
    const novosClientes = Math.round(receita / (data.ticketMedio || 30) * 0.3);
    const renovacoes = Math.round(receita * 0.4);
    
    return {
      dia: i + 1,
      receita: receita,
      lucro: receita - perdas,
      perdas: perdas,
      novosClientes: novosClientes,
      renovacoes: renovacoes,
      ganhos: receita - renovacoes,
      acumulado: receita * (i + 1) / 2,
    };
  });

  // Cálculos de performance comercial
  const ltv = (data.ticketMedio || 30) * 4.2; // Média de 4.2 renovações
  const cac = 9.20;
  const roi = ltv / cac;
  const churnRate = ((data.clientesExpirados || 0) / ((data.clientesAtivos || 0) + (data.clientesExpirados || 0))) * 100;
  
  const funnelData = [
    { etapa: 'Acessos', valor: 1000, taxa: 100 },
    { etapa: 'Testes', valor: 380, taxa: 38 },
    { etapa: 'Conversões', valor: 106, taxa: 10.6 },
    { etapa: 'Renovação', valor: 73, taxa: 7.3 },
  ];

  // Menu de navegação lateral reorganizado
  const menuSections = [
    { 
      id: 'detalhamento' as ViewSection, 
      label: 'Detalhamento Diário', 
      icon: Calendar,
      description: 'Visão granular e ações do dia'
    },
    { 
      id: 'historico-ganhos' as ViewSection, 
      label: 'Histórico de Ganhos', 
      icon: BarChart3,
      description: 'Evolução temporal de receita'
    },
    { 
      id: 'desempenho-comercial' as ViewSection, 
      label: 'Desempenho Comercial', 
      icon: TrendingUp,
      description: 'LTV, CAC, ROI e Churn'
    },
    { 
      id: 'trafego-custos' as ViewSection, 
      label: 'Tráfego e Custos', 
      icon: DollarSign,
      description: 'Investimento em Ads (standby)',
      badge: 'Em breve'
    },
    { 
      id: 'retencao-perdas' as ViewSection, 
      label: 'Retenção e Perdas', 
      icon: RefreshCw,
      description: 'Fidelização e recuperação'
    },
    { 
      id: 'oportunidades' as ViewSection, 
      label: 'Oportunidades', 
      icon: Clock,
      description: 'Insights e horários ideais'
    },
    { 
      id: 'receita-acoes' as ViewSection, 
      label: 'Receita e Ações', 
      icon: Zap,
      description: 'Projeções e automação'
    },
    { 
      id: 'relatorios' as ViewSection, 
      label: 'Relatórios', 
      icon: Download,
      description: 'Exportações e PDFs'
    },
  ];

  const dailySummary = [
    {
      label: 'Receita Hoje',
      value: receitaHoje,
      valueFormatted: `R$ ${receitaHoje.toLocaleString('pt-BR')}`,
      variation: variacaoReceitaPct,
      icon: DollarSign,
      color: COLORS.receita,
      bgColor: 'rgba(46, 204, 113, 0.08)',
    },
    {
      label: 'Clientes Ativos',
      value: clientesAtivosHoje,
      valueFormatted: clientesAtivosHoje.toLocaleString('pt-BR'),
      variation: variacaoClientesPct,
      icon: Users,
      color: COLORS.ativos,
      bgColor: 'rgba(52, 152, 219, 0.08)',
    },
    {
      label: 'Renovações Hoje',
      value: renovacoesHoje,
      valueFormatted: renovacoesHoje.toLocaleString('pt-BR'),
      variation: variacaoRenovacoesPct,
      icon: RefreshCw,
      color: COLORS.renovacoes,
      bgColor: 'rgba(155, 89, 182, 0.08)',
    },
    {
      label: 'Perdas Hoje',
      value: perdasHoje,
      valueFormatted: perdasHoje.toLocaleString('pt-BR'),
      variation: variacaoPerdasPct,
      icon: ArrowDownCircle,
      color: COLORS.perdas,
      bgColor: 'rgba(231, 76, 60, 0.08)',
    },
  ];

  // Mês ativo
  const mesAtivo = today.toLocaleDateString('pt-BR', { month: 'long' });
  const dataFinalProjecao = new Date(today);
  dataFinalProjecao.setDate(dataFinalProjecao.getDate() + 15);
  const mesFinal = dataFinalProjecao.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-8" style={{ backgroundColor: COLORS.fundo }}>
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #0f172a;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to right, #3498db, #2ecc71);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to right, #2980b9, #27ae60);
          }
        `}</style>

        {/* Timeline Financeira */}
        <div>
          <div className="mb-2">
            <h2 className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: COLORS.receitaNeon }} />
              <span>Linha do Tempo Financeira</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {mesAtivo.charAt(0).toUpperCase() + mesAtivo.slice(1)} • Projeção até {mesFinal}
            </p>
          </div>
          
          <div 
            ref={scrollContainerRef}
            className="relative overflow-x-auto pb-3 custom-scrollbar"
          >
            <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
              {calendarData.map((day, idx) => {
                const isSelected = selectedDay?.date === day.date;
                let borderColor = 'rgba(255,255,255,0.05)';
                let bgColor = '#0c121d';
                let shadowEffect = '';
                let opacity = 1;
                
                if (isSelected) {
                  borderColor = COLORS.receitaNeon;
                  bgColor = 'rgba(60, 255, 172, 0.12)';
                  shadowEffect = `shadow-[0_0_30px_rgba(60,255,172,0.6)]`;
                } else if (day.isToday) {
                  borderColor = COLORS.receitaNeon;
                  bgColor = 'rgba(60, 255, 172, 0.08)';
                  shadowEffect = `shadow-[0_0_25px_rgba(60,255,172,0.4)]`;
                } else if (day.isFuture) {
                  borderColor = COLORS.cianoClaro;
                  bgColor = 'rgba(60, 255, 252, 0.05)';
                  opacity = 0.4;
                } else {
                  borderColor = 'rgba(255,255,255,0.15)';
                  bgColor = 'rgba(15,23,42,0.8)';
                  opacity = 1;
                }
                
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => handleDayClick(day)}
                        className={`
                          flex-shrink-0 w-24 px-3 py-3 rounded-lg cursor-pointer
                          transition-all duration-200
                          hover:scale-105 hover:shadow-2xl
                          ${isSelected ? 'border-b-4' : 'border-2'}
                          ${day.isToday && !isSelected ? shadowEffect : ''}
                        `}
                        style={{
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          opacity,
                          boxShadow: isSelected 
                            ? `0 0 30px rgba(60, 255, 172, 0.6), inset 0 2px 4px rgba(255,255,255,0.1)` 
                            : day.isToday 
                              ? `0 0 25px rgba(60, 255, 172, 0.4), inset 0 2px 4px rgba(255,255,255,0.1)`
                              : 'inset 0 1px 2px rgba(0,0,0,0.2)',
                        }}
                      >
                        <div className="text-center mb-2 pb-2 border-b" style={{ borderColor: borderColor }}>
                          <p className="text-slate-500 text-xs">{day.weekday}</p>
                          <p 
                            className="text-white text-lg" 
                            style={{ 
                              fontWeight: day.isToday || isSelected ? 700 : 600,
                              color: day.isToday || isSelected ? COLORS.receitaNeon : '#fff'
                            }}
                          >
                            {day.day}
                          </p>
                        </div>
                        
                        <div className="space-y-1.5 text-xs">
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-[10px]">
                              {day.isFuture ? 'Projeção' : 'Líquido'}
                            </span>
                            <span 
                              style={{ 
                                color: day.lucro > 0 ? COLORS.receita : COLORS.perdas,
                                fontWeight: 600 
                              }}
                            >
                              {formatK(day.lucro)}
                            </span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-[10px]">Renov.</span>
                            <span style={{ color: COLORS.renovacoes, fontWeight: 600 }}>
                              +{day.renovacoes}
                            </span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-slate-500 text-[10px]">Perdas</span>
                            <span style={{ color: COLORS.perdas, fontWeight: 600 }}>
                              -{day.perdas}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      style={{ 
                        backgroundColor: COLORS.fundo,
                        borderColor: day.isToday || isSelected ? COLORS.receitaNeon : COLORS.cianoClaro 
                      }}
                    >
                      <div className="space-y-1 text-xs">
                        <p className="text-white" style={{ fontWeight: 600 }}>
                          {day.weekday} {day.day} de {day.month}
                          {day.isFuture && <span className="text-cyan-400 ml-2">(Previsão)</span>}
                        </p>
                        <p style={{ color: COLORS.receita }}>
                          {day.isFuture ? 'Previsto: ' : 'Receita: '}
                          R$ {day.receita.toLocaleString('pt-BR')}
                        </p>
                        <p style={{ color: COLORS.renovacoes }}>
                          Renovações: {day.renovacoes}
                        </p>
                        <p style={{ color: COLORS.perdas }}>
                          Perdas: {day.perdas}
                        </p>
                        <p className="text-white pt-1 border-t border-slate-700">
                          Lucro: R$ {day.lucro.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        {/* Layout Principal: Menu Lateral + Conteúdo */}
        <div className="flex gap-6">
          {/* Menu Lateral de Navegação */}
          <Card 
            className="w-72 flex-shrink-0 border-[rgba(255,255,255,0.05)] h-fit sticky top-4"
            style={{ 
              backgroundColor: '#0E1321',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)'
            }}
          >
            <div className="p-4">
              <div className="mb-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <h3 className="text-white text-sm mb-1" style={{ fontWeight: 600 }}>
                  Gestão Financeira
                </h3>
                <p className="text-slate-500 text-xs">
                  Centro de Performance
                </p>
              </div>
              <nav className="space-y-1">
                {menuSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className="w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group relative"
                      style={{
                        backgroundColor: isActive ? `${COLORS.receitaNeon}15` : 'transparent',
                        borderLeft: isActive ? `3px solid ${COLORS.receitaNeon}` : '3px solid transparent',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Icon 
                          className="w-4 h-4 mt-0.5 flex-shrink-0" 
                          style={{ 
                            color: isActive ? COLORS.receitaNeon : '#9BA6BE'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span 
                              className="text-sm"
                              style={{ 
                                color: isActive ? COLORS.receitaNeon : '#E6EBF5',
                                fontWeight: isActive ? 600 : 400
                              }}
                            >
                              {section.label}
                            </span>
                            {section.badge && (
                              <Badge 
                                variant="outline"
                                className="text-[9px] px-1.5 py-0"
                                style={{ 
                                  borderColor: `${COLORS.amarelo}40`,
                                  color: COLORS.amarelo
                                }}
                              >
                                {section.badge}
                              </Badge>
                            )}
                          </div>
                          <p 
                            className="text-[10px] leading-tight"
                            style={{ color: '#6B7C93' }}
                          >
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </Card>

          {/* Área de Conteúdo */}
          <div className="flex-1">
            {/* Seção: Detalhamento */}
            {activeSection === 'detalhamento' && selectedDay && (
              <Card 
                className="border-2"
                style={{ 
                  backgroundColor: '#0c121d',
                  borderColor: selectedDay.isToday ? COLORS.receitaNeon : COLORS.ativos,
                  boxShadow: `0 0 30px ${selectedDay.isToday ? COLORS.receitaNeon : COLORS.ativos}40`
                }}
              >
                <div className="p-6">
                  {/* Cabeçalho */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-5 h-5" style={{ color: COLORS.receitaNeon }} />
                          <h3 className="text-white text-xl" style={{ fontWeight: 700 }}>
                            📆 {selectedDay.day} de {selectedDay.month}
                          </h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {selectedDay.weekday} • {selectedDay.isFuture ? 'Projeção Estimada' : 'Dados Reais'}
                        </p>
                      </div>
                      
                      {/* Ações Rápidas no Header */}
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${COLORS.renovacoes}20`,
                            color: COLORS.renovacoes,
                            border: `1px solid ${COLORS.renovacoes}40`
                          }}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Lembrete
                        </Button>
                        <Button 
                          size="sm" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${COLORS.receita}20`,
                            color: COLORS.receita,
                            border: `1px solid ${COLORS.receita}40`
                          }}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Reativar
                        </Button>
                        <Button 
                          size="sm" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${COLORS.ativos}20`,
                            color: COLORS.ativos,
                            border: `1px solid ${COLORS.ativos}40`
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Grid Horizontal - 4 Colunas com visual melhorado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Coluna 1: Resumo Financeiro */}
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-4">
                        💰 Resumo Financeiro
                      </p>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <DollarSign className="w-3.5 h-3.5" style={{ color: COLORS.receita }} />
                            <span className="text-slate-500 text-[11px]">Receita Total</span>
                          </div>
                          <p className="text-white text-3xl" style={{ fontWeight: 700 }}>
                            R$ {selectedDay.receita.toLocaleString('pt-BR')}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <RefreshCw className="w-3.5 h-3.5" style={{ color: COLORS.renovacoes }} />
                            <span className="text-slate-500 text-[11px]">Renovações</span>
                          </div>
                          <p className="text-white text-4xl" style={{ fontWeight: 700 }}>
                            {selectedDay.renovacoes}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <ArrowDownCircle className="w-3.5 h-3.5" style={{ color: COLORS.perdas }} />
                            <span className="text-slate-500 text-[11px]">Perdas</span>
                          </div>
                          <p className="text-white text-4xl" style={{ fontWeight: 700 }}>
                            {selectedDay.perdas}
                          </p>
                        </div>

                        <Separator style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />

                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3.5 h-3.5" style={{ color: COLORS.receitaNeon }} />
                            <span className="text-slate-500 text-[11px]">Lucro Líquido</span>
                          </div>
                          <p 
                            className="text-4xl"
                            style={{ 
                              color: selectedDay.lucro > 0 ? COLORS.receitaNeon : COLORS.perdas,
                              fontWeight: 700
                            }}
                          >
                            R$ {selectedDay.lucro.toLocaleString('pt-BR')}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Activity className="w-3.5 h-3.5" style={{ color: COLORS.ativos }} />
                            <span className="text-slate-500 text-[11px]">Ticket Médio</span>
                          </div>
                          <p className="text-white text-2xl" style={{ fontWeight: 600 }}>
                            R$ {selectedDay.ticketMedio.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Clientes e Status */}
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-4">
                        👥 Clientes e Status
                      </p>
                      <div className="space-y-3">
                        <div 
                          className="p-4 rounded-lg border"
                          style={{ 
                            backgroundColor: `${COLORS.ativos}10`,
                            borderColor: `${COLORS.ativos}30`
                          }}
                        >
                          <p className="text-slate-500 text-[11px] mb-2">Ativos no dia</p>
                          <p className="text-white text-3xl" style={{ fontWeight: 700 }}>
                            {selectedDay.clientesAtivos.toLocaleString('pt-BR')}
                          </p>
                        </div>

                        <div 
                          className="p-4 rounded-lg border"
                          style={{ 
                            backgroundColor: `${COLORS.amarelo}10`,
                            borderColor: `${COLORS.amarelo}30`
                          }}
                        >
                          <p className="text-slate-500 text-[11px] mb-2">Expirando hoje</p>
                          <p className="text-white text-3xl" style={{ fontWeight: 700 }}>
                            {selectedDayMetrics?.clientesExpirandoHoje || 0}
                          </p>
                        </div>

                        <div 
                          className="p-4 rounded-lg border"
                          style={{ 
                            backgroundColor: `${COLORS.renovacoes}10`,
                            borderColor: `${COLORS.renovacoes}30`
                          }}
                        >
                          <p className="text-slate-500 text-[11px] mb-2">Próximos 3 dias</p>
                          <p className="text-white text-3xl" style={{ fontWeight: 700 }}>
                            {selectedDayMetrics?.clientesExpirando3d || 0}
                          </p>
                        </div>

                        <div 
                          className="p-4 rounded-lg border"
                          style={{ 
                            backgroundColor: `${COLORS.perdas}10`,
                            borderColor: `${COLORS.perdas}30`
                          }}
                        >
                          <p className="text-slate-500 text-[11px] mb-2">Expirados 7d</p>
                          <p className="text-white text-3xl" style={{ fontWeight: 700 }}>
                            {selectedDayMetrics?.clientesExpirados7d || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 3: Análise Comercial */}
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-4">
                        📈 Análise Comercial
                      </p>
                      <div className="space-y-3">
                        <div 
                          className="p-4 rounded-lg border"
                          style={{ 
                            backgroundColor: `${COLORS.receita}10`,
                            borderColor: `${COLORS.receita}30`
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 text-[11px]">Taxa de Retenção</span>
                            <Percent className="w-3.5 h-3.5" style={{ color: COLORS.receita }} />
                          </div>
                          <p className="text-white text-4xl" style={{ fontWeight: 700, color: COLORS.receita }}>
                            {selectedDayMetrics?.taxaRetencao}%
                          </p>
                        </div>

                        <div 
                          className="p-4 rounded-lg border"
                          style={{ 
                            backgroundColor: `${COLORS.perdas}10`,
                            borderColor: `${COLORS.perdas}30`
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 text-[11px]">Receita Perdida</span>
                            <AlertTriangle className="w-3.5 h-3.5" style={{ color: COLORS.perdas }} />
                          </div>
                          <p className="text-white text-3xl" style={{ fontWeight: 700, color: COLORS.perdas }}>
                            R$ {formatK(selectedDayMetrics?.receitaPerdida || 0)}
                          </p>
                        </div>

                        <div 
                          className="p-4 rounded-lg border"
                          style={{ 
                            backgroundColor: `${COLORS.dourado}10`,
                            borderColor: `${COLORS.dourado}30`
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 text-[11px]">Recuperáveis</span>
                            <Target className="w-3.5 h-3.5" style={{ color: COLORS.dourado }} />
                          </div>
                          <p className="text-white text-4xl mb-3" style={{ fontWeight: 700, color: COLORS.dourado }}>
                            {selectedDayMetrics?.clientesRecuperaveis || 0}
                          </p>
                          <Button 
                            size="sm" 
                            className="w-full text-xs"
                            style={{ 
                              backgroundColor: `${COLORS.dourado}20`,
                              color: COLORS.dourado,
                              border: `1px solid ${COLORS.dourado}40`
                            }}
                          >
                            Gerar lista
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 4: Projeção e Ações */}
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-4">
                        ⚡ Projeção e Ações
                      </p>
                      
                      {/* Sparkline para dias futuros */}
                      {selectedDay.isFuture && sparklineData.length > 0 ? (
                        <div className="mb-4">
                          <div 
                            className="p-4 rounded-lg border"
                            style={{ 
                              backgroundColor: `${COLORS.ciano}10`,
                              borderColor: `${COLORS.ciano}30`
                            }}
                          >
                            <p className="text-slate-500 text-[11px] mb-3">📊 Projeção +7 dias</p>
                            <div className="h-20 flex items-center">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sparklineData.map((v, i) => ({ value: v }))}>
                                  <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={COLORS.receitaNeon}
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <p className="text-slate-500 text-xs mt-2">
                              Tendência: +{((sparklineData[sparklineData.length-1] / sparklineData[0] - 1) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-4 rounded-lg border mb-4"
                          style={{ 
                            backgroundColor: `${COLORS.ativos}10`,
                            borderColor: `${COLORS.ativos}30`
                          }}
                        >
                          <p className="text-slate-500 text-[11px] mb-3">Dados do Dia</p>
                          <div className="space-y-3">
                            <div>
                              <p className="text-slate-500 text-[11px]">Conversões</p>
                              <p className="text-white text-2xl" style={{ fontWeight: 700 }}>
                                {selectedDay.conversoesCount}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[11px]">Base viva</p>
                              <p className="text-white text-2xl" style={{ fontWeight: 700 }}>
                                {selectedDay.clientesAtivos.toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Outras Ações */}
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full text-xs"
                          style={{ 
                            backgroundColor: `${COLORS.amarelo}20`,
                            color: COLORS.amarelo,
                            border: `1px solid ${COLORS.amarelo}40`
                          }}
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Oferecer Upgrade
                        </Button>
                        <Button 
                          size="sm" 
                          className="w-full text-xs"
                          style={{ 
                            backgroundColor: `${COLORS.renovacoes}20`,
                            color: COLORS.renovacoes,
                            border: `1px solid ${COLORS.renovacoes}40`
                          }}
                        >
                          <Users className="w-3 h-3 mr-1" />
                          Ver Clientes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Seção: Histórico de Ganhos */}
            {activeSection === 'historico-ganhos' && (
              <div className="space-y-6">
                {/* Filtros Temporais */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" style={{ color: COLORS.receitaNeon }} />
                      <span>Histórico de Ganhos</span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Análise temporal de receita e lucro
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(['7d', '30d', '90d'] as PeriodoFiltro[]).map((periodo) => (
                      <Button
                        key={periodo}
                        size="sm"
                        onClick={() => setPeriodoFiltro(periodo)}
                        style={{
                          backgroundColor: periodoFiltro === periodo ? `${COLORS.receitaNeon}20` : 'transparent',
                          color: periodoFiltro === periodo ? COLORS.receitaNeon : '#9BA6BE',
                          border: `1px solid ${periodoFiltro === periodo ? COLORS.receitaNeon + '40' : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        {periodo === '7d' ? '7 dias' : periodo === '30d' ? '30 dias' : '90 dias'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Cards de Resumo Estatístico */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { 
                      label: 'Receita Total', 
                      value: `R$ ${formatK(historicoGanhos.reduce((sum, d) => sum + d.receita, 0))}`,
                      icon: DollarSign,
                      color: COLORS.receita,
                      variation: '+12.4%'
                    },
                    { 
                      label: 'Lucro Líquido', 
                      value: `R$ ${formatK(historicoGanhos.reduce((sum, d) => sum + d.lucro, 0))}`,
                      icon: TrendingUp,
                      color: COLORS.receitaNeon,
                      variation: '+14.8%'
                    },
                    { 
                      label: 'Ticket Médio', 
                      value: `R$ ${(data.ticketMedio || 30).toFixed(0)}`,
                      icon: Activity,
                      color: COLORS.ativos,
                      variation: '+3.2%'
                    },
                    { 
                      label: 'Perdas Totais', 
                      value: `R$ ${formatK(historicoGanhos.reduce((sum, d) => sum + d.perdas, 0))}`,
                      icon: ArrowDownCircle,
                      color: COLORS.perdas,
                      variation: '-8.1%'
                    },
                    { 
                      label: 'Taxa Renovação', 
                      value: '73%',
                      icon: RefreshCw,
                      color: COLORS.renovacoes,
                      variation: '+5.3%'
                    },
                    { 
                      label: 'Novos Clientes', 
                      value: historicoGanhos.reduce((sum, d) => sum + d.novosClientes, 0).toString(),
                      icon: Users,
                      color: COLORS.dourado,
                      variation: '+18.7%'
                    },
                  ].map((stat, idx) => (
                    <Card
                      key={idx}
                      className="p-4 border-[rgba(255,255,255,0.05)] hover:shadow-xl transition-all duration-200"
                      style={{ 
                        backgroundColor: '#0E1321',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ 
                            backgroundColor: `${stat.color}15`,
                            boxShadow: `0 0 15px ${stat.color}30`
                          }}
                        >
                          <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">
                        {stat.label}
                      </p>
                      <p className="text-white text-2xl mb-1" style={{ fontWeight: 700 }}>
                        {stat.value}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ 
                          color: stat.variation.startsWith('+') || stat.variation.startsWith('-') && parseFloat(stat.variation) < 0 ? COLORS.receita : COLORS.perdas
                        }}
                      >
                        {stat.variation} vs período anterior
                      </p>
                    </Card>
                  ))}
                </div>

                {/* Gráfico: Evolução de Receita e Lucro */}
                <div>
                  <h3 className="text-white mb-2 text-sm" style={{ fontWeight: 600 }}>
                    📈 Evolução de Receita e Lucro
                  </h3>
                  <p className="text-slate-500 text-xs mb-4">
                    💡 Acompanhe quanto você faturou (receita) e quanto sobrou descontando as perdas (lucro)
                  </p>
                  <Card 
                    className="p-6 border-[rgba(255,255,255,0.05)]"
                    style={{ backgroundColor: '#0E1321' }}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={historicoGanhos}>
                        <defs>
                          <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.receitaNeon} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={COLORS.receitaNeon} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="lucroGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.ativos} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={COLORS.ativos} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                          dataKey="dia" 
                          stroke="#6B7C93"
                          tick={{ fill: '#9BA6BE', fontSize: 11 }}
                          label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5, fill: '#6B7C93' }}
                        />
                        <YAxis 
                          stroke="#6B7C93"
                          tick={{ fill: '#9BA6BE', fontSize: 11 }}
                          tickFormatter={(value) => `R$ ${formatK(value)}`}
                          label={{ value: 'Receita (R$)', angle: -90, position: 'insideLeft', fill: '#6B7C93' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#0E1321',
                            border: `1px solid rgba(0,255,170,0.2)`,
                            borderRadius: '8px'
                          }}
                          formatter={(value: any) => [`R$ ${formatK(value)}`, '']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="receita" 
                          stroke={COLORS.receitaNeon}
                          fill="url(#receitaGradient)"
                          strokeWidth={2}
                          name="Receita"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="lucro" 
                          stroke={COLORS.ativos}
                          fill="url(#lucroGradient)"
                          strokeWidth={2}
                          name="Lucro"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.receitaNeon }}></div>
                        <span className="text-slate-400 text-xs">Receita</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.ativos }}></div>
                        <span className="text-slate-400 text-xs">Lucro</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Grid: Balanço de Ganhos + Crescimento Acumulado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Balanço de Ganhos x Perdas x Novos */}
                  <div>
                    <h3 className="text-white mb-2 text-sm" style={{ fontWeight: 600 }}>
                      📊 Balanço Diário: Ganhos, Renovações e Perdas
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">
                      💡 Verde = novos clientes | Roxo = quem renovou | Vermelho = quem cancelou
                    </p>
                    <Card 
                      className="p-6 border-[rgba(255,255,255,0.05)]"
                      style={{ backgroundColor: '#0E1321' }}
                    >
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={historicoGanhos.slice(-14)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis 
                            dataKey="dia" 
                            stroke="#6B7C93"
                            tick={{ fill: '#9BA6BE', fontSize: 11 }}
                            label={{ value: 'Últimos 14 dias', position: 'insideBottom', offset: -5, fill: '#6B7C93' }}
                          />
                          <YAxis 
                            stroke="#6B7C93"
                            tick={{ fill: '#9BA6BE', fontSize: 11 }}
                            tickFormatter={(value) => `R$ ${formatK(value)}`}
                            label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft', fill: '#6B7C93' }}
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#0E1321',
                              border: `1px solid rgba(0,255,170,0.2)`,
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="ganhos" stackId="a" fill={COLORS.receita} name="Ganhos" />
                          <Bar dataKey="renovacoes" stackId="a" fill={COLORS.renovacoes} name="Renovações" />
                          <Bar dataKey="perdas" stackId="a" fill={COLORS.perdas} name="Perdas" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>

                  {/* Crescimento Acumulado */}
                  <div>
                    <h3 className="text-white mb-2 text-sm" style={{ fontWeight: 600 }}>
                      📈 Crescimento Acumulado
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">
                      💡 Soma total da receita ao longo do tempo. Mostra o crescimento do seu negócio.
                    </p>
                    <Card 
                      className="p-6 border-[rgba(255,255,255,0.05)]"
                      style={{ backgroundColor: '#0E1321' }}
                    >
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={historicoGanhos}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis 
                            dataKey="dia" 
                            stroke="#6B7C93"
                            tick={{ fill: '#9BA6BE', fontSize: 11 }}
                            label={{ value: 'Dia do Período', position: 'insideBottom', offset: -5, fill: '#6B7C93' }}
                          />
                          <YAxis 
                            stroke="#6B7C93"
                            tick={{ fill: '#9BA6BE', fontSize: 11 }}
                            tickFormatter={(value) => `R$ ${formatK(value)}`}
                            label={{ value: 'Receita Acumulada (R$)', angle: -90, position: 'insideLeft', fill: '#6B7C93', offset: 10 }}
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#0E1321',
                              border: `1px solid rgba(0,255,170,0.2)`,
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="acumulado" 
                            stroke={COLORS.dourado}
                            strokeWidth={3}
                            dot={false}
                            name="Receita Acumulada"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-slate-400 text-sm">
                          📈 Crescimento total: 
                          <span className="ml-2" style={{ color: COLORS.receita, fontWeight: 600 }}>
                            +18.4%
                          </span> no período
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Seção: Desempenho Comercial */}
            {activeSection === 'desempenho-comercial' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: COLORS.receitaNeon }} />
                    <span>Desempenho Comercial</span>
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Indicadores estratégicos de crescimento
                  </p>
                </div>

                {/* KPIs Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { 
                      label: 'Valor Vitalício do Cliente', 
                      subtitle: '(LTV)',
                      value: `R$ ${ltv.toFixed(0)}`, 
                      icon: TrendingUp, 
                      color: COLORS.receita, 
                      description: 'Quanto cada cliente gera de receita durante todo o tempo que fica ativo' 
                    },
                    { 
                      label: 'Custo de Aquisição', 
                      subtitle: '(CAC)',
                      value: `R$ ${cac.toFixed(2)}`, 
                      icon: DollarSign, 
                      color: COLORS.ativos, 
                      description: 'Quanto você gasta em média para conquistar 1 novo cliente' 
                    },
                    { 
                      label: 'Retorno do Investimento', 
                      subtitle: '(ROI)',
                      value: `${roi.toFixed(1)}x`, 
                      icon: Activity, 
                      color: COLORS.dourado, 
                      description: 'Para cada R$ 1 investido, você recebe R$ ' + roi.toFixed(1) + ' de volta' 
                    },
                    { 
                      label: 'Taxa de Cancelamento', 
                      subtitle: '(Churn)',
                      value: `${churnRate.toFixed(1)}%`, 
                      icon: ArrowDownCircle, 
                      color: COLORS.perdas, 
                      description: 'Percentual de clientes que não renovaram a assinatura' 
                    },
                  ].map((kpi, idx) => (
                    <Card
                      key={idx}
                      className="p-6 border-[rgba(255,255,255,0.05)] hover:shadow-xl transition-all duration-200"
                      style={{ 
                        backgroundColor: '#0E1321',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)'
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ 
                          backgroundColor: `${kpi.color}15`,
                          boxShadow: `0 0 20px ${kpi.color}30`
                        }}
                      >
                        <kpi.icon className="w-6 h-6" style={{ color: kpi.color }} />
                      </div>
                      <p className="text-white text-sm mb-0.5" style={{ fontWeight: 600 }}>
                        {kpi.label}
                      </p>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2">
                        {kpi.subtitle}
                      </p>
                      <p 
                        className="text-4xl mb-2" 
                        style={{ fontWeight: 700, color: kpi.color }}
                      >
                        {kpi.value}
                      </p>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        💡 {kpi.description}
                      </p>
                    </Card>
                  ))}
                </div>

                {/* Grid: Funil de Conversão + Churn Rate */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Funil de Conversão */}
                  <div>
                    <h3 className="text-white mb-2 text-sm" style={{ fontWeight: 600 }}>
                      🎯 Funil de Conversão
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">
                      💡 Mostra quantas pessoas passam por cada etapa até se tornarem clientes pagos
                    </p>
                    <Card 
                      className="p-6 border-[rgba(255,255,255,0.05)]"
                      style={{ backgroundColor: '#0E1321' }}
                    >
                      <div className="space-y-4">
                        {funnelData.map((etapa, idx) => {
                          const widthPercent = (etapa.valor / funnelData[0].valor) * 100;
                          const colors = [COLORS.ativos, COLORS.ciano, COLORS.receita, COLORS.dourado];
                          return (
                            <div key={idx}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300 text-sm">{etapa.etapa}</span>
                                <div className="text-right">
                                  <span className="text-white text-lg" style={{ fontWeight: 600 }}>
                                    {etapa.valor}
                                  </span>
                                  <span className="text-slate-500 text-xs ml-2">
                                    ({etapa.taxa}%)
                                  </span>
                                </div>
                              </div>
                              <div className="relative w-full h-8 bg-slate-800 rounded-lg overflow-hidden">
                                <div 
                                  className="absolute top-0 left-0 h-full flex items-center justify-center transition-all duration-500"
                                  style={{ 
                                    width: `${widthPercent}%`,
                                    backgroundColor: colors[idx],
                                    boxShadow: `0 0 15px ${colors[idx]}60`
                                  }}
                                >
                                  <span className="text-white text-xs" style={{ fontWeight: 600 }}>
                                    {etapa.taxa}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-slate-400 text-sm text-center">
                          💡 De 100 testes, <span style={{ color: COLORS.receita, fontWeight: 600 }}>28 converteram</span> e <span style={{ color: COLORS.dourado, fontWeight: 600 }}>15 renovaram</span>
                        </p>
                      </div>
                    </Card>
                  </div>

                  {/* Churn Rate Visual */}
                  <div>
                    <h3 className="text-white mb-2 text-sm" style={{ fontWeight: 600 }}>
                      📉 Taxa de Cancelamento
                    </h3>
                    <p className="text-slate-500 text-xs mb-4">
                      💡 Percentual de clientes que cancelaram em relação ao total. Quanto menor, melhor!
                    </p>
                    <Card 
                      className="p-6 border-[rgba(255,255,255,0.05)]"
                      style={{ backgroundColor: '#0E1321' }}
                    >
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Retidos', value: 100 - churnRate, fill: COLORS.receita },
                              { name: 'Perdidos', value: churnRate, fill: COLORS.perdas },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            <Cell fill={COLORS.receita} />
                            <Cell fill={COLORS.perdas} />
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-center mt-2">
                        <p className="text-slate-400 text-sm mb-2">Churn atual</p>
                        <p 
                          className="text-4xl"
                          style={{ fontWeight: 700, color: COLORS.perdas }}
                        >
                          {churnRate.toFixed(1)}%
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                          Meta: {'<'}10% | Atual: {churnRate > 10 ? '⚠️ Acima' : '✅ Dentro'}
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* LTV Mensal */}
                <div>
                  <h3 className="text-white mb-2 text-sm" style={{ fontWeight: 600 }}>
                    💰 Valor Vitalício do Cliente (LTV) ao longo do tempo
                  </h3>
                  <p className="text-slate-500 text-xs mb-4">
                    💡 Quanto cada cliente vale em média durante sua jornada com você
                  </p>
                  <Card 
                    className="p-6 border-[rgba(255,255,255,0.05)]"
                    style={{ backgroundColor: '#0E1321' }}
                  >
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={Array.from({ length: 6 }, (_, i) => ({
                        mes: `Mês ${i + 1}`,
                        ltv: ltv * (0.8 + (i * 0.04))
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                          dataKey="mes" 
                          stroke="#6B7C93"
                          tick={{ fill: '#9BA6BE', fontSize: 11 }}
                          label={{ value: 'Período', position: 'insideBottom', offset: -5, fill: '#6B7C93' }}
                        />
                        <YAxis 
                          stroke="#6B7C93"
                          tick={{ fill: '#9BA6BE', fontSize: 11 }}
                          tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                          label={{ value: 'LTV (R$)', angle: -90, position: 'insideLeft', fill: '#6B7C93' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#0E1321',
                            border: `1px solid rgba(0,255,170,0.2)`,
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ltv" 
                          stroke={COLORS.receita}
                          strokeWidth={3}
                          dot={{ fill: COLORS.receita, r: 4 }}
                          name="LTV"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </div>
            )}

            {/* Seção: Tráfego e Custos (Standby) */}
            {activeSection === 'trafego-custos' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5" style={{ color: COLORS.amarelo }} />
                      <span>Tráfego e Custos</span>
                    </h2>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: `${COLORS.amarelo}40`,
                        color: COLORS.amarelo
                      }}
                    >
                      Em desenvolvimento
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Controle de investimento em Ads e ROI por canal
                  </p>
                </div>

                {/* Preview da Interface */}
                <Card 
                  className="p-8 border-[rgba(255,255,255,0.05)] relative overflow-hidden"
                  style={{ backgroundColor: '#0E1321' }}
                >
                  <div 
                    className="absolute inset-0 opacity-5"
                    style={{ 
                      backgroundImage: 'linear-gradient(45deg, #f39c12 25%, transparent 25%, transparent 75%, #f39c12 75%, #f39c12), linear-gradient(45deg, #f39c12 25%, transparent 25%, transparent 75%, #f39c12 75%, #f39c12)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 10px 10px'
                    }}
                  />
                  
                  <div className="relative z-10 text-center py-12">
                    <div 
                      className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${COLORS.amarelo}15`,
                        boxShadow: `0 0 40px ${COLORS.amarelo}30`
                      }}
                    >
                      <Zap className="w-10 h-10" style={{ color: COLORS.amarelo }} />
                    </div>
                    <h3 className="text-white text-xl mb-3" style={{ fontWeight: 600 }}>
                      Módulo em Standby
                    </h3>
                    <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                      Este painel está preparado para integrar investimento em tráfego pago (Facebook Ads, Google Ads, TikTok) e calcular ROI real cruzando gasto × receita líquida.
                    </p>
                    
                    {/* Preview da tabela */}
                    <div className="max-w-2xl mx-auto mt-8">
                      <div className="grid grid-cols-4 gap-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <div className="text-slate-500 text-xs">Canal</div>
                        <div className="text-slate-500 text-xs">Gasto</div>
                        <div className="text-slate-500 text-xs">Receita</div>
                        <div className="text-slate-500 text-xs">ROI</div>
                        
                        <div className="text-white text-sm">Facebook Ads</div>
                        <div className="text-slate-400 text-sm">R$ 1.800</div>
                        <div className="text-slate-400 text-sm">R$ 8.400</div>
                        <div className="text-sm" style={{ color: COLORS.receita }}>4.6x</div>
                        
                        <div className="text-white text-sm">Google Ads</div>
                        <div className="text-slate-400 text-sm">R$ 900</div>
                        <div className="text-slate-400 text-sm">R$ 2.600</div>
                        <div className="text-sm" style={{ color: COLORS.receita }}>2.9x</div>
                        
                        <div className="text-white text-sm">TikTok</div>
                        <div className="text-slate-400 text-sm">R$ 400</div>
                        <div className="text-slate-400 text-sm">R$ 1.500</div>
                        <div className="text-sm" style={{ color: COLORS.receita }}>3.7x</div>
                      </div>
                    </div>

                    <Button 
                      size="lg"
                      className="mt-8"
                      style={{ 
                        backgroundColor: `${COLORS.amarelo}20`,
                        color: COLORS.amarelo,
                        border: `1px solid ${COLORS.amarelo}40`
                      }}
                      disabled
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Ativar Integração (em breve)
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Seção: Estado Atual */}
            {activeSection === 'estado-atual' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: COLORS.receitaNeon }} />
                    <span>Estado Atual</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dailySummary.map((metric, idx) => (
                      <Card 
                        key={idx} 
                        className="p-6 border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] hover:shadow-2xl transition-all duration-200 cursor-pointer group"
                        style={{ 
                          backgroundColor: '#0c121d',
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)'
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                            style={{ 
                              backgroundColor: metric.bgColor,
                              boxShadow: `0 0 20px ${metric.color}40`
                            }}
                          >
                            <metric.icon 
                              className="w-5 h-5" 
                              strokeWidth={1.5}
                              style={{ color: metric.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-400 text-xs mb-2">{metric.label}</p>
                            <p className="text-white text-3xl tracking-tight mb-1" style={{ fontWeight: 700 }}>
                              {metric.valueFormatted}
                            </p>
                            <p 
                              className="text-xs"
                              style={{ 
                                color: parseFloat(metric.variation) >= 0 ? COLORS.receita : COLORS.perdas,
                                fontWeight: 500
                              }}
                            >
                              {parseFloat(metric.variation) >= 0 ? '+' : ''}{metric.variation}% vs ontem
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: COLORS.receitaNeon }} />
                    <span>Tendência e Projeção</span>
                  </h2>
                  <Card 
                    className="p-6 border-[rgba(255,255,255,0.05)] hover:shadow-2xl transition-all duration-200"
                    style={{ backgroundColor: '#0c121d' }}
                  >
                    <div className="overflow-x-auto custom-scrollbar">
                      <ResponsiveContainer width="100%" height={360} minWidth={900}>
                        <LineChart data={evolutionAndForecastData} margin={{ top: 40, right: 30, left: 10, bottom: 20 }}>
                          <defs>
                            <linearGradient id="fillGradientGreen" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.receitaNeon} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={COLORS.receitaNeon} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          
                          <XAxis 
                            dataKey="dayLabel" 
                            stroke="#64748b" 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                            height={60}
                          />
                          
                          <YAxis 
                            stroke="#64748b" 
                            tick={{ fill: '#64748b', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                            tickFormatter={(value) => `${value.toFixed(1)}k`}
                          />
                          
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: COLORS.fundo, 
                              border: `1px solid ${COLORS.receitaNeon}50`, 
                              borderRadius: '8px',
                              color: '#fff',
                              padding: '12px',
                              boxShadow: `0 8px 24px rgba(0,0,0,0.8)`
                            }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="space-y-1 text-sm">
                                    <p className="text-white" style={{ fontWeight: 600 }}>
                                      {data.dayLabel || `Dia ${data.day}`}
                                      {data.isFuture && <span className="text-cyan-400 ml-2">(Projeção)</span>}
                                    </p>
                                    <p style={{ color: data.isFuture ? COLORS.ciano : COLORS.receitaNeon }}>
                                      {data.isFuture ? 'Previsto: ' : 'Receita: '}
                                      R$ {((data.receita || 0) * 1000).toLocaleString('pt-BR')}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          
                          <Area
                            type="monotone"
                            dataKey="receitaReal"
                            stroke="none"
                            fill="url(#fillGradientGreen)"
                          />
                          
                          <Line 
                            type="monotone" 
                            dataKey="receitaReal" 
                            stroke={COLORS.receitaNeon}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ 
                              r: 6,
                              fill: COLORS.receitaNeon,
                              stroke: '#fff',
                              strokeWidth: 2
                            }}
                            connectNulls={false}
                          />
                          
                          <Line 
                            type="monotone" 
                            dataKey="receitaPrevisao" 
                            stroke={COLORS.receitaNeon}
                            strokeWidth={2}
                            strokeDasharray="8 4"
                            strokeOpacity={0.6}
                            dot={false}
                            activeDot={{ 
                              r: 6,
                              fill: COLORS.ciano,
                              stroke: '#fff',
                              strokeWidth: 2
                            }}
                            connectNulls={false}
                          />
                          
                          {evolutionAndForecastData
                            .filter(d => d.isToday)
                            .map((d, i) => (
                              <ReferenceDot
                                key={i}
                                x={d.dayLabel}
                                y={d.receita}
                                r={10}
                                fill={COLORS.receitaNeon}
                                stroke="#fff"
                                strokeWidth={3}
                                style={{
                                  filter: `drop-shadow(0 0 12px ${COLORS.receitaNeon})`
                                }}
                                label={{
                                  value: 'HOJE',
                                  position: 'top',
                                  fill: COLORS.receitaNeon,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  offset: 15
                                }}
                              />
                            ))
                          }
                          
                          <ReferenceLine 
                            x="Hoje" 
                            stroke={COLORS.receitaNeon} 
                            strokeDasharray="3 3" 
                            strokeOpacity={0.3}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-1 rounded" style={{ backgroundColor: COLORS.receitaNeon }}></div>
                        <span className="text-slate-400 text-xs">Dados Reais</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-1 rounded" style={{ 
                          backgroundColor: COLORS.receitaNeon,
                          opacity: 0.6,
                          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)'
                        }}></div>
                        <span className="text-slate-400 text-xs">Projeção</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border-2 border-white" 
                          style={{ 
                            backgroundColor: COLORS.receitaNeon,
                            boxShadow: `0 0 12px ${COLORS.receitaNeon}`
                          }}
                        ></div>
                        <span className="text-slate-400 text-xs">Hoje</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Seção: Retenção e Perdas */}
            {activeSection === 'retencao-perdas' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Retenção e Recuperação */}
                <div>
                  <h2 className="text-white mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" style={{ color: COLORS.renovacoes }} />
                    <span>Retenção e Recuperação</span>
                  </h2>
                  <Card 
                    className="p-6 border-[rgba(255,255,255,0.05)] hover:shadow-xl transition-all duration-200"
                    style={{ backgroundColor: '#0c121d' }}
                  >
                    <div className="space-y-4">
                      {retencaoData.map((item, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300 text-sm">{item.label}</span>
                            <span className="text-white" style={{ fontWeight: 600 }}>
                              {item.value}%
                            </span>
                          </div>
                          <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${item.value}%`,
                                backgroundColor: item.color,
                                boxShadow: `0 0 10px ${item.color}80`
                              }}
                            ></div>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">
                            {item.total.toLocaleString('pt-BR')} clientes
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <Button 
                        className="w-full"
                        style={{ 
                          backgroundColor: `${COLORS.renovacoes}20`,
                          color: COLORS.renovacoes,
                          border: `1px solid ${COLORS.renovacoes}40`
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enviar lembrete para expirados
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Perda Financeira Estimada */}
                <div>
                  <h2 className="text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" style={{ color: COLORS.perdas }} />
                    <span>Perda Financeira Estimada</span>
                  </h2>
                  <Card 
                    className="p-6 border-[rgba(255,255,255,0.05)] hover:shadow-xl transition-all duration-200"
                    style={{ 
                      backgroundColor: '#0c121d',
                      background: `linear-gradient(135deg, ${COLORS.perdas}10 0%, ${COLORS.fundo} 100%)`
                    }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${COLORS.perdas}20`,
                          boxShadow: `0 0 30px ${COLORS.perdas}40`
                        }}
                      >
                        <DollarSign 
                          className="w-8 h-8" 
                          style={{ color: COLORS.perdas }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-400 text-sm mb-1">Perda estimada no mês</p>
                        <p 
                          className="text-4xl tracking-tight"
                          style={{ color: COLORS.perdas, fontWeight: 700 }}
                        >
                          R$ {formatK(perdaEstimadaMes)}
                        </p>
                      </div>
                    </div>
                    
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: `${COLORS.perdas}10`,
                        borderColor: `${COLORS.perdas}30`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Variação vs mês anterior</span>
                        <div className="flex items-center gap-2">
                          <TrendingDown 
                            className="w-4 h-4" 
                            style={{ color: COLORS.receita }}
                          />
                          <span 
                            className="text-lg"
                            style={{ color: COLORS.receita, fontWeight: 600 }}
                          >
                            {variacaoPerda}%
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">
                        Redução de R$ {formatK(perdaMesAnterior - perdaEstimadaMes)} em perdas
                      </p>
                    </div>

                    <div className="mt-6">
                      <p className="text-slate-400 text-xs mb-3">Custo da inação</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Clientes não renovados</span>
                          <span className="text-white">{data.clientesExpirados || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Ticket médio</span>
                          <span className="text-white">R$ {(data.ticketMedio || 30).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Seção: Oportunidades */}
            {activeSection === 'oportunidades' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: COLORS.dourado }} />
                    <span>Mapa de Oportunidades - Melhor Hora para Engajamento</span>
                  </h2>
                  <p className="text-slate-500 text-sm mb-4">
                    💡 Horários com maior volume de ativações e renovações. Use para programar campanhas e lembretes.
                  </p>
                  <Card 
                    className="p-6 border-[rgba(255,255,255,0.05)] hover:shadow-xl transition-all duration-200"
                    style={{ backgroundColor: '#0c121d' }}
                  >
                    <div className="grid grid-cols-7 gap-3">
                      {heatmapData.map((dia, idx) => {
                        const isDomingo = idx === 0;
                        const isFimSemana = idx === 0 || idx === 6;
                        return (
                          <div 
                            key={idx}
                            className="p-4 rounded-lg border transition-all hover:scale-105 cursor-pointer"
                            style={{ 
                              backgroundColor: isDomingo ? `${COLORS.dourado}25` : isFimSemana ? `${COLORS.dourado}18` : `${COLORS.dourado}12`,
                              borderColor: isDomingo ? `${COLORS.dourado}60` : `${COLORS.dourado}30`,
                              boxShadow: isDomingo ? `0 0 15px ${COLORS.dourado}40` : 'none'
                            }}
                          >
                            <p className="text-white text-sm mb-2" style={{ fontWeight: 600 }}>
                              {dia.dia}
                            </p>
                            <div className="space-y-1 text-xs">
                              <p className="text-slate-400 text-[10px] uppercase tracking-wider">Melhor hora</p>
                              <p 
                                className="text-3xl"
                                style={{ color: COLORS.dourado, fontWeight: 700 }}
                              >
                                {dia.melhorHora}h
                              </p>
                              <p className="text-slate-500 text-[10px] mt-2">
                                {dia.valorMelhor} conversões
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-slate-400 mb-1">🔥 Pico de atividade</p>
                          <p className="text-white" style={{ fontWeight: 600 }}>
                            <span style={{ color: COLORS.dourado }}>Domingos 20h-21h</span>
                          </p>
                          <p className="text-slate-500 text-xs mt-1">Horário ideal para campanhas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 mb-1">⏰ Janela de conversão</p>
                          <p className="text-white" style={{ fontWeight: 600 }}>
                            <span style={{ color: COLORS.receita }}>19h às 22h</span>
                          </p>
                          <p className="text-slate-500 text-xs mt-1">Maior engajamento geral</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div>
                  <h2 className="text-white mb-2">Distribuição de Receita por Plano</h2>
                  <p className="text-slate-500 text-sm mb-4">
                    💡 Qual tipo de assinatura gera mais receita para o seu negócio
                  </p>
                  <Card 
                    className="p-6 border-[rgba(255,255,255,0.05)] hover:shadow-lg transition-all duration-200"
                    style={{ backgroundColor: '#0c121d', opacity: 0.95 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={distribuicaoPlanos}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              dataKey="value"
                              paddingAngle={3}
                              stroke="none"
                              label={({ cx, cy, midAngle, outerRadius, percent }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = outerRadius + 25;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                  <text 
                                    x={x} 
                                    y={y} 
                                    fill="#fff" 
                                    textAnchor={x > cx ? 'start' : 'end'} 
                                    dominantBaseline="central"
                                    fontSize={12}
                                    fontWeight={600}
                                  >
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>
                                );
                              }}
                              labelLine={{
                                stroke: 'rgba(255,255,255,0.2)',
                                strokeWidth: 1
                              }}
                            >
                              {distribuicaoPlanos.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color}
                                  style={{
                                    filter: `drop-shadow(0px 0px 6px ${entry.color}40)`
                                  }}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: COLORS.fundo, 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '8px',
                                color: '#fff' 
                              }}
                              formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {distribuicaoPlanos.map((plano, idx) => {
                          return (
                            <div 
                              key={idx} 
                              className="p-3 rounded-lg border transition-all duration-200 hover:scale-102"
                              style={{
                                backgroundColor: `${plano.color}08`,
                                borderColor: `${plano.color}20`
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ 
                                      backgroundColor: plano.color,
                                      boxShadow: `0 0 6px ${plano.color}60`
                                    }}
                                  />
                                  <span className="text-slate-300 text-sm">{plano.name}</span>
                                </div>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span 
                                  className="text-white text-xl" 
                                  style={{ 
                                    fontWeight: 700,
                                    color: plano.color
                                  }}
                                >
                                  R$ {formatK(plano.value)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Seção: Receita e Ações */}
            {activeSection === 'receita-acoes' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: COLORS.ciano }} />
                    <span>Receita vs Perda Projetada (Próximos 15 dias)</span>
                  </h2>
                  <p className="text-slate-500 text-sm mb-4">
                    💡 Projeção de ganhos e perdas futuras. Use para se preparar e agir preventivamente.
                  </p>
                  <Card 
                    className="p-6 border-[rgba(255,255,255,0.05)] hover:shadow-xl transition-all duration-200"
                    style={{ backgroundColor: '#0c121d' }}
                  >
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={receitaVsPerdaData}>
                        <defs>
                          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.receita} stopOpacity={0.6}/>
                            <stop offset="95%" stopColor={COLORS.receita} stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorPerdas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.perdas} stopOpacity={0.6}/>
                            <stop offset="95%" stopColor={COLORS.perdas} stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorPotencial" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.dourado} stopOpacity={0.6}/>
                            <stop offset="95%" stopColor={COLORS.dourado} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        
                        <XAxis 
                          dataKey="dia" 
                          stroke="#6B7C93" 
                          tick={{ fill: '#9BA6BE', fontSize: 11 }}
                          label={{ value: 'Dias Futuros', position: 'insideBottom', offset: -5, fill: '#6B7C93' }}
                        />
                        
                        <YAxis 
                          stroke="#6B7C93" 
                          tick={{ fill: '#9BA6BE', fontSize: 11 }}
                          tickFormatter={(value) => `R$ ${formatK(value)}`}
                          label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft', fill: '#6B7C93' }}
                        />
                        
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: COLORS.fundo, 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '8px',
                            color: '#fff' 
                          }}
                          formatter={(value: any, name: string) => {
                            const labels: any = {
                              receitaPrevista: 'Receita Prevista',
                              perdasProjetadas: 'Perdas',
                              receitaPotencial: 'Recuperação 50%'
                            };
                            return [`R$ ${formatK(value)}`, labels[name]];
                          }}
                        />
                        
                        <Area 
                          type="monotone" 
                          dataKey="receitaPrevista" 
                          stackId="1"
                          stroke={COLORS.receita} 
                          fill="url(#colorReceita)" 
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="perdasProjetadas" 
                          stackId="1"
                          stroke={COLORS.perdas} 
                          fill="url(#colorPerdas)" 
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="receitaPotencial" 
                          stackId="1"
                          stroke={COLORS.dourado} 
                          fill="url(#colorPotencial)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    
                    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.receita }}></div>
                        <span className="text-slate-400 text-xs">Receita Prevista</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.perdas }}></div>
                        <span className="text-slate-400 text-xs">Perdas Projetadas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.dourado }}></div>
                        <span className="text-slate-400 text-xs">Recuperação 50%</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div>
                  <h2 className="text-white mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" style={{ color: COLORS.amarelo }} />
                    <span>Ações Comerciais Recomendadas</span>
                  </h2>
                  <p className="text-slate-500 text-sm mb-4">
                    💡 Sugestões automáticas de ações para aumentar vendas e reduzir cancelamentos
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {acoesComerciais.map((acao, idx) => (
                      <Card 
                        key={idx}
                        className="p-6 border transition-all hover:scale-102 hover:shadow-xl cursor-pointer"
                        style={{ 
                          backgroundColor: '#0c121d',
                          borderColor: `${acao.color}30`
                        }}
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ 
                              backgroundColor: `${acao.color}20`,
                              boxShadow: `0 0 15px ${acao.color}30`
                            }}
                          >
                            <acao.icon 
                              className="w-5 h-5" 
                              style={{ color: acao.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-white text-sm" style={{ fontWeight: 600 }}>
                                {acao.titulo}
                              </h3>
                              <Badge 
                                variant="outline"
                                style={{ 
                                  borderColor: acao.urgencia === 'alta' ? COLORS.perdas : acao.urgencia === 'media' ? COLORS.amarelo : COLORS.ativos,
                                  color: acao.urgencia === 'alta' ? COLORS.perdas : acao.urgencia === 'media' ? COLORS.amarelo : COLORS.ativos,
                                  fontSize: '10px'
                                }}
                              >
                                {acao.urgencia === 'alta' ? 'Alta' : acao.urgencia === 'media' ? 'Média' : 'Baixa'}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-xs mb-4">
                              {acao.descricao}
                            </p>
                            <Button 
                              size="sm"
                              className="w-full text-xs"
                              style={{ 
                                backgroundColor: `${acao.color}20`,
                                color: acao.color,
                                border: `1px solid ${acao.color}40`
                              }}
                            >
                              {acao.acao}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Seção: Relatórios e Exportações */}
            {activeSection === 'relatorios' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-white flex items-center gap-2">
                    <Download className="w-5 h-5" style={{ color: COLORS.ativos }} />
                    <span>Relatórios e Exportações</span>
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Exportação de dados consolidados
                  </p>
                </div>

                {/* Tipos de Exportação */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Download,
                      titulo: 'Exportar Excel (.xlsx)',
                      descricao: 'Planilha completa com todos os dados financeiros do período selecionado',
                      acao: 'Gerar Excel',
                      color: COLORS.receita,
                      badge: 'Completo'
                    },
                    {
                      icon: PieChartIcon,
                      titulo: 'Relatório PDF',
                      descricao: 'Documento formatado com gráficos, KPIs e análises visuais',
                      acao: 'Gerar PDF',
                      color: COLORS.ativos,
                      badge: 'Visual'
                    },
                    {
                      icon: Activity,
                      titulo: 'Exportar JSON',
                      descricao: 'Dados em formato JSON para integrações e APIs externas',
                      acao: 'Gerar JSON',
                      color: COLORS.amarelo,
                      badge: 'API'
                    },
                  ].map((tipo, idx) => (
                    <Card 
                      key={idx}
                      className="p-6 border transition-all hover:scale-102 hover:shadow-xl cursor-pointer"
                      style={{ 
                        backgroundColor: '#0E1321',
                        borderColor: `${tipo.color}30`
                      }}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ 
                            backgroundColor: `${tipo.color}20`,
                            boxShadow: `0 0 20px ${tipo.color}30`
                          }}
                        >
                          <tipo.icon 
                            className="w-6 h-6" 
                            style={{ color: tipo.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white text-sm" style={{ fontWeight: 600 }}>
                              {tipo.titulo}
                            </h3>
                            <Badge 
                              variant="outline"
                              style={{ 
                                borderColor: `${tipo.color}40`,
                                color: tipo.color,
                                fontSize: '9px'
                              }}
                            >
                              {tipo.badge}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-xs mb-4">
                            {tipo.descricao}
                          </p>
                          <Button 
                            size="sm"
                            className="w-full text-xs"
                            style={{ 
                              backgroundColor: `${tipo.color}20`,
                              color: tipo.color,
                              border: `1px solid ${tipo.color}40`
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {tipo.acao}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Configurações de Exportação */}
                <Card 
                  className="p-6 border-[rgba(255,255,255,0.05)]"
                  style={{ backgroundColor: '#0E1321' }}
                >
                  <h3 className="text-white mb-4 text-sm" style={{ fontWeight: 600 }}>
                    ⚙️ Configurações de Exportação
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-xs mb-3">Período dos Dados</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['7 dias', '30 dias', '90 dias', 'Personalizado'].map((periodo) => (
                          <Button
                            key={periodo}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: 'rgba(255,255,255,0.1)',
                              color: '#9BA6BE'
                            }}
                          >
                            {periodo}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-xs mb-3">Dados a Incluir</p>
                      <div className="space-y-2">
                        {['Receitas e Lucros', 'Clientes Ativos', 'Conversões', 'Renovações', 'Perdas Financeiras'].map((item) => (
                          <label key={item} className="flex items-center gap-2 text-sm text-slate-300">
                            <input 
                              type="checkbox" 
                              defaultChecked 
                              className="rounded"
                              style={{ accentColor: COLORS.receitaNeon }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />

                  <div>
                    <p className="text-slate-400 text-xs mb-3">💡 Dica</p>
                    <p className="text-slate-500 text-sm">
                      Os relatórios são gerados automaticamente com base nos dados do período selecionado. 
                      Para análises customizadas, utilize o filtro temporal e selecione os dados específicos que deseja incluir.
                    </p>
                  </div>
                </Card>

                {/* Histórico de Exportações */}
                <Card 
                  className="p-6 border-[rgba(255,255,255,0.05)]"
                  style={{ backgroundColor: '#0E1321' }}
                >
                  <h3 className="text-white mb-4 text-sm" style={{ fontWeight: 600 }}>
                    📋 Últimas Exportações
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { tipo: 'Excel', data: 'Hoje às 14:32', periodo: '30 dias', tamanho: '2.4 MB', status: 'success' },
                      { tipo: 'PDF', data: 'Ontem às 09:15', periodo: '7 dias', tamanho: '1.1 MB', status: 'success' },
                      { tipo: 'JSON', data: '3 dias atrás', periodo: '90 dias', tamanho: '458 KB', status: 'success' },
                    ].map((export_, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg border transition-all hover:border-[rgba(255,255,255,0.2)]"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          borderColor: 'rgba(255,255,255,0.05)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${COLORS.ativos}15`,
                              boxShadow: `0 0 15px ${COLORS.ativos}20`
                            }}
                          >
                            <Download className="w-4 h-4" style={{ color: COLORS.ativos }} />
                          </div>
                          <div>
                            <p className="text-white text-sm" style={{ fontWeight: 600 }}>
                              Relatório {export_.tipo}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {export_.data} • Período: {export_.periodo}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-xs">{export_.tamanho}</span>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: `${COLORS.ativos}40`,
                              color: COLORS.ativos
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
