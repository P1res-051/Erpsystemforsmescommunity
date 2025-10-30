import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { 
  Heart, TrendingUp, TrendingDown, Users, Award, RefreshCcw, UserCheck, 
  Sparkles, ArrowDownRight, Calendar, Target, AlertTriangle, Download,
  BarChart3, Activity, Zap
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { DashboardData } from '../App';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { parseDate } from '../utils/dataProcessing';
import * as XLSX from 'xlsx';
import { 
  COLORS, 
  CARD_CLASSES, 
  TEXT_CLASSES, 
  GRID_LAYOUTS, 
  CHART_TOOLTIP_STYLE,
  getChartAxisConfig,
  GradientDefs 
} from '../utils/designSystem';

interface Props {
  data: DashboardData;
}

export function RetentionView({ data }: Props) {
  const [period, setPeriod] = useState<'30' | '60' | '90'>('30');
  const [activeTab, setActiveTab] = useState<'performance' | 'analises' | 'insights'>('performance');

  // Análise completa de retenção
  const retentionAnalysis = useMemo(() => {
    const now = new Date();
    const periodDays = parseInt(period);
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Processar renovações
    const renewals = data.rawData?.renovacoes || [];
    const clients = [
      ...(data.rawData?.ativos || []),
      ...(data.rawData?.expirados || []),
    ];

    // Contar renovações por cliente
    const renewalCounts: Record<string, number> = {};
    const renewalDates: Record<string, Date[]> = {};
    const renewalsByWeekday: Record<string, number> = {
      'Domingo': 0,
      'Segunda': 0,
      'Terça': 0,
      'Quarta': 0,
      'Quinta': 0,
      'Sexta': 0,
      'Sábado': 0,
    };

    renewals.forEach((r: any) => {
      const user = r.Usuario || r.usuario || '';
      if (!user) return;

      renewalCounts[user] = (renewalCounts[user] || 0) + 1;

      const date = parseDate(r.Data || r.data || r.DataRenovacao);
      if (date) {
        if (!renewalDates[user]) renewalDates[user] = [];
        renewalDates[user].push(date);

        // Contar por dia da semana
        const weekday = date.getDay();
        const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        renewalsByWeekday[weekdayNames[weekday]]++;
      }
    });

    // Clientes fiéis (2+ renovações)
    const loyalClients = Object.entries(renewalCounts).filter(([_, count]) => count >= 2);
    const totalLoyalClients = loyalClients.length;

    // Nível de fidelidade
    const fidelityLevels = {
      '1 renovação': 0,
      '2-3 renovações': 0,
      '4-5 renovações': 0,
      '6+ renovações': 0,
    };

    Object.values(renewalCounts).forEach(count => {
      if (count === 1) fidelityLevels['1 renovação']++;
      else if (count >= 2 && count <= 3) fidelityLevels['2-3 renovações']++;
      else if (count >= 4 && count <= 5) fidelityLevels['4-5 renovações']++;
      else fidelityLevels['6+ renovações']++;
    });

    // Base de referência
    const totalClients = data.clientesAtivos + data.clientesExpirados;
    const retained = data.clientesAtivos;
    const lost = data.clientesExpirados;

    // Taxa de retenção
    const retentionRate = totalClients > 0 ? (retained / totalClients) * 100 : 0;
    
    // Churn mensal
    const churnRate = 100 - retentionRate;

    // Taxa de fidelidade (clientes com 2+ renovações / total que renovou)
    const totalRenewed = Object.keys(renewalCounts).length;
    const fidelityRate = totalRenewed > 0 ? (totalLoyalClients / totalRenewed) * 100 : 0;

    // Tempo médio de vida (LTV em meses)
    const totalRenewalCount = Object.values(renewalCounts).reduce((sum, count) => sum + count, 0);
    const avgLifetimeMonths = totalRenewed > 0 ? totalRenewalCount / totalRenewed : 0;

    // Melhor dia da semana
    const bestWeekday = Object.entries(renewalsByWeekday).sort((a, b) => b[1] - a[1])[0];

    // Curva de retenção ao longo do tempo
    const retentionCurve: Array<{ mes: number; retencao: number; clientes: number }> = [];
    
    // Agrupar clientes por data de primeira compra
    const firstPurchases: Record<string, Date> = {};
    
    [...(data.rawData?.conversoes || [])].forEach((conv: any) => {
      const user = conv.Usuario || conv.usuario || '';
      const date = parseDate(conv.Data || conv.data);
      
      if (user && date) {
        if (!firstPurchases[user] || date < firstPurchases[user]) {
          firstPurchases[user] = date;
        }
      }
    });

    // Calcular retenção por mês desde a primeira compra
    for (let month = 1; month <= 12; month++) {
      const clientsAtMonth: Record<string, boolean> = {};
      let totalOriginal = 0;

      Object.entries(firstPurchases).forEach(([user, firstDate]) => {
        const monthsSinceFirst = (now.getTime() - firstDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
        
        if (monthsSinceFirst >= month) {
          totalOriginal++;
          
          // Verificar se ainda está ativo no mês N
          const userRenewals = renewalDates[user] || [];
          const hasRenewalAfterMonth = userRenewals.some(rd => {
            const monthsFromFirst = (rd.getTime() - firstDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
            return monthsFromFirst >= month - 1 && monthsFromFirst <= month + 1;
          });

          if (hasRenewalAfterMonth || month === 1) {
            clientsAtMonth[user] = true;
          }
        }
      });

      const activeAtMonth = Object.keys(clientsAtMonth).length;
      const retention = totalOriginal > 0 ? (activeAtMonth / totalOriginal) * 100 : 0;

      if (totalOriginal > 0) {
        retentionCurve.push({
          mes: month,
          retencao: Math.round(retention),
          clientes: activeAtMonth,
        });
      }
    }

    // Comparação com período anterior
    const prevPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
    
    const currentRenewals = renewals.filter((r: any) => {
      const date = parseDate(r.Data || r.data);
      return date && date >= periodStart && date <= now;
    }).length;

    const prevRenewals = renewals.filter((r: any) => {
      const date = parseDate(r.Data || r.data);
      return date && date >= prevPeriodStart && date < periodStart;
    }).length;

    const retentionChange = prevRenewals > 0 ? ((currentRenewals - prevRenewals) / prevRenewals) * 100 : 0;

    // Insights automáticos com categorização (✅ Bom, ⚠️ Atenção, ❌ Crítico)
    const insights: Array<{ icon: any; text: string; color: string; status: 'good' | 'warning' | 'critical'; emoji: string }> = [];

    if (retentionRate > 50) {
      insights.push({
        icon: TrendingUp,
        text: `Taxa de retenção de ${retentionRate.toFixed(1)}% está acima da média do mercado (45-50%).`,
        color: 'text-[#00C897]',
        status: 'good',
        emoji: '✅'
      });
    } else if (retentionRate > 40) {
      insights.push({
        icon: AlertTriangle,
        text: `Taxa de retenção de ${retentionRate.toFixed(1)}% está na média. Há espaço para melhorias.`,
        color: 'text-[#F59E0B]',
        status: 'warning',
        emoji: '⚠️'
      });
    } else {
      insights.push({
        icon: AlertTriangle,
        text: `Taxa de retenção de ${retentionRate.toFixed(1)}% está crítica. Ação urgente necessária.`,
        color: 'text-[#E84A5F]',
        status: 'critical',
        emoji: '❌'
      });
    }

    if (bestWeekday && bestWeekday[1] > 0) {
      insights.push({
        icon: Calendar,
        text: `${bestWeekday[0]} é o melhor dia para renovações com ${bestWeekday[1]} registros.`,
        color: 'text-[#2D9CDB]',
        status: 'good',
        emoji: '✅'
      });
    }

    if (fidelityRate > 60) {
      insights.push({
        icon: Heart,
        text: `${fidelityRate.toFixed(1)}% dos renovadores são fiéis (2+ renovações). Excelente!`,
        color: 'text-[#E43F6F]',
        status: 'good',
        emoji: '✅'
      });
    } else if (fidelityRate > 40) {
      insights.push({
        icon: Heart,
        text: `${fidelityRate.toFixed(1)}% de fidelidade. Considere programa de benefícios.`,
        color: 'text-[#F59E0B]',
        status: 'warning',
        emoji: '⚠️'
      });
    }

    if (avgLifetimeMonths > 6) {
      insights.push({
        icon: Award,
        text: `Tempo médio de vida de ${avgLifetimeMonths.toFixed(1)} meses está ótimo.`,
        color: 'text-[#2D9CDB]',
        status: 'good',
        emoji: '✅'
      });
    } else if (avgLifetimeMonths < 3) {
      insights.push({
        icon: Award,
        text: `Tempo médio de ${avgLifetimeMonths.toFixed(1)} meses é baixo. Focar em engajamento.`,
        color: 'text-[#E84A5F]',
        status: 'critical',
        emoji: '❌'
      });
    }

    // Oportunidades
    const opportunities: Array<{ icon: any; text: string; impact: string; color: string }> = [];

    // Oportunidade 1: Reduzir churn
    if (churnRate > 40) {
      const targetChurn = 35;
      const clientsToSave = Math.round((churnRate - targetChurn) / 100 * totalClients);
      const monthlyRevenue = clientsToSave * 35; // Assumindo ticket médio R$35
      
      opportunities.push({
        icon: Target,
        text: `Reduzir churn de ${churnRate.toFixed(1)}% para ${targetChurn}%`,
        impact: `+R$ ${(monthlyRevenue / 1000).toFixed(1)}K/mês (${clientsToSave} clientes salvos)`,
        color: 'text-red-400'
      });
    }

    // Oportunidade 2: Reativar expirados
    if (lost > 100) {
      const viableReactivation = Math.round(lost * 0.3); // 30% viáveis
      const reactivationRevenue = viableReactivation * 35;
      
      opportunities.push({
        icon: RefreshCcw,
        text: `Focar em reativar ${lost} clientes expirados`,
        impact: `${viableReactivation} potencialmente viáveis (30%) = +R$ ${(reactivationRevenue / 1000).toFixed(1)}K`,
        color: 'text-orange-400'
      });
    }

    // Oportunidade 3: Programa de fidelização
    if (fidelityRate < 60) {
      opportunities.push({
        icon: Sparkles,
        text: 'Implementar programa de fidelização para clientes 1-2 renovações',
        impact: 'Aumentar retenção em 15-20% no médio prazo',
        color: 'text-purple-400'
      });
    }

    // Oportunidade 4: Campanhas no melhor dia
    if (bestWeekday && bestWeekday[1] > 0) {
      opportunities.push({
        icon: Zap,
        text: `Usar ${bestWeekday[0]} para campanhas de reengajamento`,
        impact: 'Aproveitar dia de maior engajamento para conversões',
        color: 'text-cyan-400'
      });
    }

    return {
      retentionRate,
      churnRate,
      totalLoyalClients,
      avgLifetimeMonths,
      retained,
      lost,
      fidelityRate,
      bestWeekday,
      retentionCurve,
      fidelityLevels,
      renewalsByWeekday,
      retentionChange,
      insights,
      opportunities,
      totalClients,
      totalRenewed,
    };
  }, [data, period]);

  // Preparar dados para gráficos
  const retentionVsLostData = [
    { 
      name: 'Retidos', 
      value: retentionAnalysis.retained, 
      percentage: retentionAnalysis.retentionRate.toFixed(1),
      fill: 'url(#retentionGradient)'
    },
    { 
      name: 'Perdidos', 
      value: retentionAnalysis.lost, 
      percentage: retentionAnalysis.churnRate.toFixed(1),
      fill: 'url(#churnGradient)'
    },
  ];

  const fidelityLevelData = Object.entries(retentionAnalysis.fidelityLevels).map(([level, count], idx) => ({
    level,
    count,
    fill: level.includes('2-3') || level.includes('4-5') || level.includes('6+') 
      ? 'url(#fidelityGradient)' 
      : '#6b7280',
  }));

  const weekdayData = Object.entries(retentionAnalysis.renewalsByWeekday).map(([day, count]) => ({
    day: day.substring(0, 3),
    count,
    fill: day === retentionAnalysis.bestWeekday?.[0] ? 'url(#highlightGradient)' : 'url(#normalGradient)',
  }));

  // Exportar relatório completo
  const exportReport = () => {
    const wb = XLSX.utils.book_new();

    // Aba: Resumo Executivo
    const summary = [
      { '': 'RESUMO EXECUTIVO' },
      { '': '' },
      { Métrica: 'Período Analisado', Valor: `Últimos ${period} dias` },
      { Métrica: 'Total de Clientes', Valor: retentionAnalysis.totalClients },
      { '': '' },
      { '': 'MÉTRICAS PRINCIPAIS' },
      { Métrica: 'Taxa de Retenção', Valor: `${retentionAnalysis.retentionRate.toFixed(1)}%` },
      { Métrica: 'Churn Mensal', Valor: `${retentionAnalysis.churnRate.toFixed(1)}%` },
      { Métrica: 'Clientes Fiéis (2+ renovações)', Valor: retentionAnalysis.totalLoyalClients },
      { Métrica: 'Tempo Médio de Vida', Valor: `${retentionAnalysis.avgLifetimeMonths.toFixed(1)} meses` },
      { Métrica: 'Taxa de Fidelidade', Valor: `${retentionAnalysis.fidelityRate.toFixed(1)}%` },
      { '': '' },
      { '': 'DISTRIBUIÇÃO' },
      { Métrica: 'Clientes Retidos', Valor: retentionAnalysis.retained },
      { Métrica: 'Clientes Perdidos', Valor: retentionAnalysis.lost },
      { Métrica: 'Melhor Dia para Renovações', Valor: retentionAnalysis.bestWeekday?.[0] || '-' },
      { Métrica: 'Renovações no Melhor Dia', Valor: retentionAnalysis.bestWeekday?.[1] || 0 },
      { '': '' },
      { '': `Dados baseados em ${retentionAnalysis.totalClients.toLocaleString('pt-BR')} clientes` },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Resumo Executivo');

    // Aba: Curva de Retenção
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(retentionAnalysis.retentionCurve), 'Curva Retenção');

    // Aba: Fidelidade
    const fidelityData = Object.entries(retentionAnalysis.fidelityLevels).map(([nivel, clientes]) => ({
      Nível: nivel,
      Clientes: clientes,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fidelityData), 'Níveis Fidelidade');

    // Aba: Insights
    const insightsData = retentionAnalysis.insights.map(i => ({ Insight: i.text }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(insightsData), 'Insights');

    // Aba: Oportunidades
    const oppData = retentionAnalysis.opportunities.map(o => ({
      Oportunidade: o.text,
      Impacto: o.impact,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(oppData), 'Oportunidades');

    XLSX.writeFile(wb, `relatorio_retencao_${period}d_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Header com Filtros */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl text-[#EEEEEE] font-semibold" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
            Análise de Retenção
          </h2>
          <p className="text-sm text-[#DDDDDD] mt-1">
            Comportamento, fidelidade e tempo de vida dos clientes
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-32 bg-[#1A1D21] border-gray-700 text-[#EEEEEE] hover:bg-[#22262B] transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1D21] border-gray-700">
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={exportReport} 
            className="gap-2 bg-[#00C897] hover:bg-[#00B587] text-white border-0 transition-all hover:scale-105 hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPIs Principais - Com sombra e hover melhorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Taxa de Retenção - CIANO */}
        <Card className="p-5 bg-[#121726] border transition-all hover:scale-[1.02] cursor-pointer" style={{ 
          borderColor: 'rgba(0, 191, 255, 0.3)',
          boxShadow: '0 0 15px rgba(0, 191, 255, 0.3)'
        }}>
          <div className="flex items-start justify-between h-full">
            <div className="flex flex-col justify-between h-full">
              <p className="text-[11px] text-[#9FAAC6] uppercase tracking-wider mb-2">
                TAXA DE RETENÇÃO
              </p>
              <p className="text-[32px] font-bold text-white mt-1">
                {retentionAnalysis.retentionRate.toFixed(1)}<span className="text-lg">%</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                {retentionAnalysis.retentionChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-[#00BFFF]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-[#FF3DAE]" />
                )}
                <span className={`text-[13px] font-medium ${retentionAnalysis.retentionChange >= 0 ? 'text-[#00BFFF]' : 'text-[#FF3DAE]'}`}>
                  {retentionAnalysis.retentionChange >= 0 ? '+' : ''}{retentionAnalysis.retentionChange.toFixed(1)}%
                </span>
              </div>
            </div>
            <UserCheck className="w-12 h-12 text-[#00BFFF]" style={{ filter: 'drop-shadow(0 0 6px #00BFFF)' }} />
          </div>
        </Card>

        {/* Churn Mensal - ROSA */}
        <Card className="p-5 bg-[#121726] border transition-all hover:scale-[1.02] cursor-pointer" style={{ 
          borderColor: 'rgba(255, 61, 174, 0.3)',
          boxShadow: '0 0 15px rgba(255, 61, 174, 0.3)'
        }}>
          <div className="flex items-start justify-between h-full">
            <div className="flex flex-col justify-between h-full">
              <p className="text-[11px] text-[#9FAAC6] uppercase tracking-wider mb-2">
                CHURN MENSAL
              </p>
              <p className="text-[32px] font-bold text-white mt-1">
                {retentionAnalysis.churnRate.toFixed(1)}<span className="text-lg">%</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                {retentionAnalysis.retentionChange >= 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-[#00BFFF]" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-[#FF3DAE]" />
                )}
                <span className={`text-[13px] font-medium ${retentionAnalysis.retentionChange >= 0 ? 'text-[#00BFFF]' : 'text-[#FF3DAE]'}`}>
                  {retentionAnalysis.retentionChange >= 0 ? 'Melhor' : 'Pior'}
                </span>
              </div>
            </div>
            <ArrowDownRight className="w-12 h-12 text-[#FF3DAE]" style={{ filter: 'drop-shadow(0 0 6px #FF3DAE)' }} />
          </div>
        </Card>

        {/* Clientes Fiéis - MAGENTA */}
        <Card className="p-5 bg-[#121726] border transition-all hover:scale-[1.02] cursor-pointer" style={{ 
          borderColor: 'rgba(255, 0, 204, 0.3)',
          boxShadow: '0 0 15px rgba(255, 0, 204, 0.3)'
        }}>
          <div className="flex items-start justify-between h-full">
            <div className="flex flex-col justify-between h-full">
              <p className="text-[11px] text-[#9FAAC6] uppercase tracking-wider mb-2">
                CLIENTES FIÉIS (2+)
              </p>
              <p className="text-[32px] font-bold text-white mt-1">
                {retentionAnalysis.totalLoyalClients.toLocaleString('pt-BR')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Heart className="w-3.5 h-3.5 text-[#7B5CFF]" />
                <span className="text-[13px] font-medium text-[#7B5CFF]">
                  {retentionAnalysis.fidelityRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <Heart className="w-12 h-12 text-[#7B5CFF]" style={{ filter: 'drop-shadow(0 0 6px #7B5CFF)' }} />
          </div>
        </Card>

        {/* Tempo Médio de Vida - AZUL */}
        <Card className="p-5 bg-[#121726] border transition-all hover:scale-[1.02] cursor-pointer" style={{ 
          borderColor: 'rgba(30, 144, 255, 0.3)',
          boxShadow: '0 0 15px rgba(30, 144, 255, 0.3)'
        }}>
          <div className="flex items-start justify-between h-full">
            <div className="flex flex-col justify-between h-full">
              <p className="text-[11px] text-[#9FAAC6] uppercase tracking-wider mb-2">
                TEMPO MÉDIO DE VIDA
              </p>
              <p className="text-[32px] font-bold text-white mt-1">
                {retentionAnalysis.avgLifetimeMonths.toFixed(0)}<span className="text-lg"> m</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Award className="w-3.5 h-3.5 text-[#1E90FF]" />
                <span className="text-[13px] font-medium text-[#1E90FF]">
                  {retentionAnalysis.totalRenewed} renovaram
                </span>
              </div>
            </div>
            <Award className="w-12 h-12 text-[#1E90FF]" style={{ filter: 'drop-shadow(0 0 6px #1E90FF)' }} />
          </div>
        </Card>
      </div>

      {/* Divisor com título */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-700/50"></div>
        </div>
      </div>

      {/* Tabs - Design profissional melhorado */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="bg-transparent border-b border-[#2C323B] p-0 h-auto rounded-none w-full justify-start">
          <TabsTrigger 
            value="performance" 
            className="
              relative px-6 py-3 rounded-none border-b-2 border-transparent
              data-[state=active]:border-[#00C897] data-[state=active]:text-[#00C897]
              data-[state=inactive]:text-[#A3A9B5] 
              hover:text-[#E9EDF1] hover:bg-[#1A1E23]
              transition-all duration-200
              uppercase tracking-wider text-xs font-medium
            "
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="analises" 
            className="
              relative px-6 py-3 rounded-none border-b-2 border-transparent
              data-[state=active]:border-[#2D9CDB] data-[state=active]:text-[#2D9CDB]
              data-[state=inactive]:text-[#A3A9B5]
              hover:text-[#E9EDF1] hover:bg-[#1A1E23]
              transition-all duration-200
              uppercase tracking-wider text-xs font-medium
            "
          >
            <Activity className="w-4 h-4 mr-2" />
            Análises
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="
              relative px-6 py-3 rounded-none border-b-2 border-transparent
              data-[state=active]:border-[#8B5CF6] data-[state=active]:text-[#8B5CF6]
              data-[state=inactive]:text-[#A3A9B5]
              hover:text-[#E9EDF1] hover:bg-[#1A1E23]
              transition-all duration-200
              uppercase tracking-wider text-xs font-medium
            "
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Aba: Performance */}
        <TabsContent value="performance" className="space-y-8 mt-8">
          {/* Título da Seção */}
          <div>
            <h3 className="text-lg uppercase tracking-wider text-[#EEEEEE] mb-2" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
              PERFORMANCE
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-[#00C897] to-transparent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Clientes Ativos vs Perdidos */}
            <Card className="p-8 bg-[#1A1D21] border-gray-700 transition-all hover:scale-102 hover:border-gray-600">
              <h3 className="flex items-center gap-2 mb-6 text-[#EEEEEE] uppercase tracking-wide text-sm" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                <Users className="w-5 h-5 text-[#00C897]" />
                Clientes Ativos vs Perdidos
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={retentionVsLostData} layout="vertical">
                  <defs>
                    <linearGradient id="retentionGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00C897" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#2D9CDB" stopOpacity={0.9} />
                    </linearGradient>
                    <linearGradient id="churnGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#E84A5F" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number" 
                    stroke="#E9EDF1" 
                    tick={{ fill: '#E9EDF1', fontSize: 12 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#E9EDF1" 
                    width={80}
                    tick={{ fill: '#E9EDF1', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1A1D21', 
                      border: '1px solid #374151',
                      color: '#EEEEEE',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} (${props.payload.percentage}%)`,
                      'Clientes'
                    ]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {retentionVsLostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-[#00C897]/10 border border-[#00C897]/30 transition-all hover:bg-[#00C897]/15">
                  <p className="text-xs text-[#DDDDDD] uppercase tracking-wide">Retidos</p>
                  <p className="text-3xl text-[#EEEEEE] mt-2" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>{retentionAnalysis.retained}</p>
                  <p className="text-sm text-[#00C897] mt-1">{retentionAnalysis.retentionRate.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-[#E84A5F]/10 border border-[#E84A5F]/30 transition-all hover:bg-[#E84A5F]/15">
                  <p className="text-xs text-[#DDDDDD] uppercase tracking-wide">Perdidos</p>
                  <p className="text-3xl text-[#EEEEEE] mt-2" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>{retentionAnalysis.lost}</p>
                  <p className="text-sm text-[#E84A5F] mt-1">{retentionAnalysis.churnRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>

            {/* Nível de Fidelidade */}
            <Card className="p-8 bg-[#1A1D21] border-gray-700 transition-all hover:scale-102 hover:border-gray-600">
              <h3 className="flex items-center gap-2 mb-6 text-[#EEEEEE] uppercase tracking-wide text-sm" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                <Heart className="w-5 h-5 text-[#E43F6F]" />
                Nível de Fidelidade
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fidelityLevelData}>
                  <defs>
                    <linearGradient id="fidelityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E43F6F" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#E43F6F" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="level" 
                    stroke="#E9EDF1" 
                    angle={-15} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fill: '#E9EDF1', fontSize: 11 }}
                  />
                  <YAxis 
                    stroke="#E9EDF1"
                    tick={{ fill: '#E9EDF1', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1A1D21', 
                      border: '1px solid #374151',
                      color: '#EEEEEE',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [value, 'Clientes']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {fidelityLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 p-4 rounded-lg bg-[#E43F6F]/10 border border-[#E43F6F]/30">
                <p className="text-sm text-[#DDDDDD]">Destaque para 2+ renovações</p>
                <p className="text-2xl text-[#E43F6F] mt-2" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                  {retentionAnalysis.totalLoyalClients} clientes fiéis
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Aba: Análises */}
        <TabsContent value="analises" className="space-y-8 mt-8">
          {/* Título da Seção */}
          <div>
            <h3 className="text-lg uppercase tracking-wider text-[#EEEEEE] mb-2" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
              ANÁLISES
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-[#2D9CDB] to-transparent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Renovações por Dia da Semana */}
            <Card className="p-8 bg-[#1A1D21] border-gray-700 transition-all hover:scale-102 hover:border-gray-600">
              <h3 className="flex items-center gap-2 mb-6 text-[#EEEEEE] uppercase tracking-wide text-sm" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                <Calendar className="w-5 h-5 text-[#2D9CDB]" />
                Renovações por Dia da Semana
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekdayData}>
                  <defs>
                    <linearGradient id="highlightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E43F6F" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#FF6B9D" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="normalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D9CDB" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#2D9CDB" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#E9EDF1"
                    tick={{ fill: '#E9EDF1', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#E9EDF1"
                    tick={{ fill: '#E9EDF1', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1A1D21', 
                      border: '1px solid #374151',
                      color: '#EEEEEE',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [value, 'Renovações']}
                    labelFormatter={(label) => `📅 ${label}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {weekdayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {retentionAnalysis.bestWeekday && (
                <div className="mt-6 p-4 rounded-lg bg-[#E43F6F]/10 border border-[#E43F6F]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-[#E43F6F]" />
                    <p className="text-sm text-[#DDDDDD] uppercase tracking-wide">Melhor dia</p>
                  </div>
                  <p className="text-2xl text-[#EEEEEE] mt-2" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                    {retentionAnalysis.bestWeekday[0]}
                  </p>
                  <p className="text-sm text-[#E43F6F] mt-1">
                    🗓️ {retentionAnalysis.bestWeekday[1]} renovações
                  </p>
                </div>
              )}
            </Card>

            {/* Curva de Retenção */}
            <Card className="p-8 bg-[#1A1D21] border-gray-700 transition-all hover:scale-102 hover:border-gray-600">
              <h3 className="flex items-center gap-2 mb-6 text-[#EEEEEE] uppercase tracking-wide text-sm" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                <Activity className="w-5 h-5 text-[#2D9CDB]" />
                Curva de Retenção ao Longo do Tempo
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionAnalysis.retentionCurve}>
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D9CDB" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2D9CDB" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#E9EDF1"
                    tick={{ fill: '#E9EDF1', fontSize: 12 }}
                    label={{ 
                      value: 'Meses desde 1ª compra', 
                      position: 'insideBottom', 
                      offset: -5, 
                      fill: '#E9EDF1',
                      style: { fontSize: 12 }
                    }}
                  />
                  <YAxis 
                    stroke="#E9EDF1"
                    tick={{ fill: '#E9EDF1', fontSize: 12 }}
                    label={{ 
                      value: '% Clientes Ativos', 
                      angle: -90, 
                      position: 'insideLeft', 
                      fill: '#E9EDF1',
                      style: { fontSize: 12 }
                    }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1A1D21', 
                      border: '1px solid #374151',
                      color: '#EEEEEE',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'retencao' ? `${value}%` : value,
                      name === 'retencao' ? 'Retenção' : 'Clientes'
                    ]}
                    labelFormatter={(label) => `Mês ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="retencao" 
                    stroke="#2D9CDB"
                    strokeWidth={3}
                    dot={{ fill: '#2D9CDB', r: 5, strokeWidth: 2, stroke: '#1A1D21' }}
                    activeDot={{ r: 7, strokeWidth: 2 }}
                    fill="url(#curveGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 p-4 rounded-lg bg-[#2D9CDB]/10 border border-[#2D9CDB]/30">
                <p className="text-sm text-[#DDDDDD]">Linha azul mostra perda gradual de clientes ao longo do tempo</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Aba: Insights */}
        <TabsContent value="insights" className="space-y-8 mt-8">
          {/* Título da Seção */}
          <div>
            <h3 className="text-lg uppercase tracking-wider text-[#EEEEEE] mb-2" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
              INSIGHTS
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-[#E43F6F] to-transparent rounded-full"></div>
          </div>

          {/* Insights de Retenção - Com cores categorizadas */}
          <Card className="p-8 bg-[#1A1D21] border-gray-700">
            <h3 className="text-lg mb-6 text-[#EEEEEE] flex items-center gap-2 uppercase tracking-wide" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              Insights de Retenção
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {retentionAnalysis.insights.map((insight, idx) => {
                const Icon = insight.icon;
                const borderColor = 
                  insight.status === 'good' ? 'border-[#00C897]/40' : 
                  insight.status === 'warning' ? 'border-[#F59E0B]/40' : 
                  'border-[#E84A5F]/40';
                const bgColor = 
                  insight.status === 'good' ? 'bg-[#00C897]/10' : 
                  insight.status === 'warning' ? 'bg-[#F59E0B]/10' : 
                  'bg-[#E84A5F]/10';
                
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-5 rounded-lg ${bgColor} border ${borderColor} transition-all hover:scale-102 hover:brightness-110 cursor-pointer`}
                  >
                    <div className="flex-shrink-0">
                      <span className="text-xl">{insight.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#EEEEEE]" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                        {insight.text}
                      </p>
                    </div>
                    <Icon className={`w-5 h-5 ${insight.color} flex-shrink-0`} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Oportunidades de Melhoria */}
          <Card className="p-8 bg-[#1A1D21] border-gray-700">
            <h3 className="text-lg mb-6 text-[#EEEEEE] flex items-center gap-2 uppercase tracking-wide" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
              <Target className="w-5 h-5 text-[#E43F6F]" />
              Oportunidades de Melhoria
            </h3>
            <div className="space-y-4">
              {retentionAnalysis.opportunities.map((opp, idx) => {
                const Icon = opp.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 rounded-lg bg-[#22262B] border border-gray-700 hover:border-gray-600 hover:scale-102 transition-all cursor-pointer"
                  >
                    <Icon className={`w-6 h-6 ${opp.color} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1">
                      <p className="text-sm text-[#EEEEEE] mb-2" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                        {opp.text}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-[#2D9CDB]/10 text-[#2D9CDB] border-[#2D9CDB]/30">
                          💡 {opp.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Resumo Executivo */}
          <Card className="p-8 bg-gradient-to-br from-[#E43F6F]/10 to-[#2D9CDB]/10 border-[#E43F6F]/30">
            <h3 className="text-lg mb-4 text-[#EEEEEE] uppercase tracking-wide" style={{ textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
              📊 Resumo Executivo
            </h3>
            <p className="text-sm text-[#DDDDDD] leading-relaxed">
              Dados baseados em <strong className="text-[#EEEEEE]">{retentionAnalysis.totalClients.toLocaleString('pt-BR')} clientes</strong> analisados 
              nos últimos <strong className="text-[#EEEEEE]">{period} dias</strong>. 
              Taxa de retenção atual: <strong className="text-[#00C897]">{retentionAnalysis.retentionRate.toFixed(1)}%</strong>, 
              com <strong className="text-[#E43F6F]">{retentionAnalysis.totalLoyalClients.toLocaleString('pt-BR')} clientes fiéis</strong> (2+ renovações) 
              representando <strong className="text-[#E43F6F]">{retentionAnalysis.fidelityRate.toFixed(1)}%</strong> da base renovadora.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
