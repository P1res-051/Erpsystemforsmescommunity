import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Clock, Sunrise, Sun, Sunset, Moon, TrendingUp, Activity, Zap, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { DashboardData } from '../App';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as XLSX from 'xlsx';
import { COLORS } from '../utils/designSystem';
import { pick, FIELD_MAPPINGS, parseDateSmart, safePct } from '../utils/dataProcessing';

interface Props {
  data: DashboardData;
}

type PeriodFilter = 'all' | 'month' | '7days' | '15days' | '30days';

// Estrutura de turnos
const TURNOS = {
  madrugada: [0, 6],
  manha: [6, 12],
  tarde: [12, 18],
  noite: [18, 24],
} as const;

const TURNO_ICONS: Record<string, any> = {
  madrugada: Moon,
  manha: Sunrise,
  tarde: Sun,
  noite: Sunset,
};

const TURNO_LABELS: Record<string, string> = {
  madrugada: 'Madrugada',
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

const TURNO_COLORS = {
  madrugada: '#6B7280',  // Cinza
  manha: '#00BFFF',      // Ciano
  tarde: '#FF00CC',      // Magenta
  noite: '#1E90FF',      // Azul
};

export function TrafficView({ data }: Props) {
  // ============================================
  // 🎯 STATE - FILTRO DE PERÍODO
  // ============================================
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // ============================================
  // 📊 FUNÇÃO: DETERMINAR TURNO DO HORÁRIO
  // ============================================
  function turnoDoHorario(date: Date): keyof typeof TURNOS | 'indef' {
    const h = date.getHours();
    for (const [k, [ini, fim]] of Object.entries(TURNOS)) {
      if (h >= ini && h < fim) return k as keyof typeof TURNOS;
    }
    return 'indef';
  }

  // ============================================
  // 🔄 FILTRO DE DADOS POR PERÍODO (COM PARSER ROBUSTO)
  // ============================================
  const filteredData = useMemo(() => {
    const now = new Date();
    
    const filterDate = (dateValue: any) => {
      const date = parseDateSmart(dateValue);
      if (!date) return false;
      
      switch (periodFilter) {
        case 'month':
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case '7days':
          return (now.getTime() - date.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        case '15days':
          return (now.getTime() - date.getTime()) <= 15 * 24 * 60 * 60 * 1000;
        case '30days':
          return (now.getTime() - date.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    };

    // Usa pick() para leitura case-insensitive
    const rawTestes = data.rawData?.Testes || data.rawData?.testes || [];
    const rawConversoes = data.rawData?.Conversoes || data.rawData?.conversoes || [];
    const rawRenovacoes = data.rawData?.Renovacoes || data.rawData?.renovacoes || [];

    if (periodFilter === 'all') {
      return {
        testes: rawTestes,
        conversoes: rawConversoes,
        renovacoes: rawRenovacoes,
      };
    }

    return {
      testes: rawTestes.filter((t: any) => 
        filterDate(pick(t, FIELD_MAPPINGS.criado))
      ),
      conversoes: rawConversoes.filter((c: any) => 
        filterDate(pick(c, FIELD_MAPPINGS.data))
      ),
      renovacoes: rawRenovacoes.filter((r: any) => 
        filterDate(pick(r, FIELD_MAPPINGS.data))
      ),
    };
  }, [data, periodFilter]);

  // ============================================
  // 📊 CÁLCULOS POR TURNO (COM PARSER ROBUSTO)
  // ============================================
  const turnoStats = useMemo(() => {
    const testes = filteredData.testes;
    const convs = filteredData.conversoes;
    const ren = filteredData.renovacoes;

    const stats = {
      madrugada: { testes: 0, convs: 0, ren: 0, taxa: 0 },
      manha: { testes: 0, convs: 0, ren: 0, taxa: 0 },
      tarde: { testes: 0, convs: 0, ren: 0, taxa: 0 },
      noite: { testes: 0, convs: 0, ren: 0, taxa: 0 },
    };

    // Contagem por período - TESTES
    testes.forEach((t: any) => {
      const dateValue = pick(t, FIELD_MAPPINGS.criado);
      const date = parseDateSmart(dateValue);
      
      if (date) {
        const turno = turnoDoHorario(date);
        if (stats[turno as keyof typeof stats]) {
          stats[turno as keyof typeof stats].testes++;
        }
      }
    });

    // Contagem por período - CONVERSÕES
    convs.forEach((c: any) => {
      const dateValue = pick(c, FIELD_MAPPINGS.data);
      const date = parseDateSmart(dateValue);
      
      if (date) {
        const turno = turnoDoHorario(date);
        if (stats[turno as keyof typeof stats]) {
          stats[turno as keyof typeof stats].convs++;
        }
      }
    });

    // Contagem por período - RENOVAÇÕES
    ren.forEach((r: any) => {
      const dateValue = pick(r, FIELD_MAPPINGS.data);
      const date = parseDateSmart(dateValue);
      
      if (date) {
        const turno = turnoDoHorario(date);
        if (stats[turno as keyof typeof stats]) {
          stats[turno as keyof typeof stats].ren++;
        }
      }
    });

    // Calcular taxas (com safePct)
    for (const k of Object.keys(stats) as Array<keyof typeof stats>) {
      const s = stats[k];
      s.taxa = safePct(s.convs, s.testes);
    }

    // Melhor turno (baseado em renovações)
    const melhor = Object.entries(stats).reduce((a, b) => 
      b[1].ren > a[1].ren ? b : a
    );

    return {
      stats,
      melhorTurno: melhor[0] as keyof typeof stats,
      melhorTurnoCount: melhor[1].ren,
      totalTestes: Object.values(stats).reduce((a, b) => a + b.testes, 0),
      totalConvs: Object.values(stats).reduce((a, b) => a + b.convs, 0),
      totalRen: Object.values(stats).reduce((a, b) => a + b.ren, 0),
    };
  }, [filteredData]);

  // ============================================
  // 📤 EXPORTAÇÃO
  // ============================================
  const exportTraffic = () => {
    const trafficData = Object.entries(turnoStats.stats).map(([turno, data]) => ({
      'Turno': TURNO_LABELS[turno as keyof typeof TURNO_LABELS],
      'Horário': `${TURNOS[turno as keyof typeof TURNOS][0]}h - ${TURNOS[turno as keyof typeof TURNOS][1]}h`,
      'Testes': data.testes,
      'Conversões': data.convs,
      'Renovações': data.ren,
      'Taxa de Conversão (%)': data.taxa,
    }));

    const ws = XLSX.utils.json_to_sheet(trafficData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tráfego por Turno');
    XLSX.writeFile(wb, `Trafego_${periodFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ============================================
  // 💎 KPIs PRINCIPAIS
  // ============================================
  const kpiCards = [
    {
      title: 'Melhor Turno',
      value: TURNO_LABELS[turnoStats.melhorTurno],
      subtitle: `${TURNOS[turnoStats.melhorTurno][0]}h-${TURNOS[turnoStats.melhorTurno][1]}h (${turnoStats.melhorTurnoCount} renovações)`,
      icon: TURNO_ICONS[turnoStats.melhorTurno],
      color: TURNO_COLORS[turnoStats.melhorTurno],
    },
    {
      title: 'Total de Testes',
      value: turnoStats.totalTestes.toLocaleString('pt-BR'),
      subtitle: 'Distribuídos em 4 turnos',
      icon: Activity,
      color: COLORS.primary,
    },
    {
      title: 'Total de Conversões',
      value: turnoStats.totalConvs.toLocaleString('pt-BR'),
      subtitle: 'Por horário do dia',
      icon: TrendingUp,
      color: '#00C897',
    },
    {
      title: 'Total de Renovações',
      value: turnoStats.totalRen.toLocaleString('pt-BR'),
      subtitle: 'Monitoradas por período',
      icon: Clock,
      color: COLORS.secondary,
    },
  ];

  // ============================================
  // 📊 DADOS PARA GRÁFICOS (NORMALIZADOS)
  // ============================================
  const labels = ['Madrugada', 'Manhã', 'Tarde', 'Noite'];
  const turnoKeys = ['madrugada', 'manha', 'tarde', 'noite'] as const;

  // Arrays de valores brutos
  const T = turnoKeys.map(k => turnoStats.stats[k].testes);
  const C = turnoKeys.map(k => turnoStats.stats[k].convs);
  const R = turnoKeys.map(k => turnoStats.stats[k].ren);
  
  // Taxas de conversão por turno
  const taxasPorTurno = turnoKeys.map((k, i) => safePct(C[i], T[i]));

  // Barras: 100% empilhado (mostra taxa de conversão)
  const barChartData = labels.map((label, idx) => {
    const key = turnoKeys[idx];
    return {
      turno: `${label}\n(${TURNOS[key][0]}h-${TURNOS[key][1]}h)`,
      testes: T[idx],
      conversoes: C[idx],
      base: 100,
      taxa: taxasPorTurno[idx],
    };
  });

  // Radar: Normalizado 0-100 (para comparação justa)
  const maxT = Math.max(...T, 1);
  const maxC = Math.max(...C, 1);
  const maxR = Math.max(...R, 1);
  
  const nT = T.map(v => +(100 * v / maxT).toFixed(1));
  const nC = C.map(v => +(100 * v / maxC).toFixed(1));
  const nR = R.map(v => +(100 * v / maxR).toFixed(1));

  const radarData = labels.map((label, idx) => ({
    turno: label,
    'Renovações': nR[idx],
    'Testes Grátis': nT[idx],
    'Vendas': nC[idx],
  }));

  // Pizza: Proteção contra fatias zero/dominantes
  const totalR = R.reduce((a, b) => a + b, 0);
  const pieShare = labels.map((label, idx) => ({
    name: `${label} (${TURNOS[turnoKeys[idx]][0]}h-${TURNOS[turnoKeys[idx]][1]}h)`,
    value: R[idx],
    fill: TURNO_COLORS[turnoKeys[idx]],
  }));
  
  const nonZero = pieShare.filter(s => s.value > 0);
  const maxShare = totalR > 0 ? Math.max(...R) / totalR : 0;
  const usePieChart = totalR > 0 && nonZero.length > 1 && maxShare < 0.95;
  
  // Fallback: Barras horizontais quando pizza não faz sentido
  const pieData = usePieChart ? pieShare : pieShare;

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* 📋 HEADER COM FILTROS E EXPORTAÇÃO */}
      {/* ============================================ */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-[#EAF2FF] flex items-center gap-3">
            <Zap className="w-7 h-7" style={{ color: COLORS.primary }} />
            <span>Análise de Tráfego por Horário</span>
          </h2>
          <p className="text-[#9FAAC6] text-sm mt-1">
            ⏰ Monitore a atividade por turnos e otimize suas campanhas
          </p>
        </div>
        
        {/* Filtros e Exportação */}
        <div className="flex items-center gap-3">
          {/* Filtro de Período */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00BFFF]" />
            <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
              <SelectTrigger 
                className="w-[180px] border text-[#EAF2FF]"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,191,255,0.05), rgba(30,144,255,0.02))',
                  borderColor: 'rgba(0,191,255,0.3)',
                }}
              >
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderColor: COLORS.border,
                }}
              >
                <SelectItem value="all">Todos os Dados</SelectItem>
                <SelectItem value="month">Mês Atual</SelectItem>
                <SelectItem value="7days">Últimos 7 Dias</SelectItem>
                <SelectItem value="15days">Últimos 15 Dias</SelectItem>
                <SelectItem value="30days">Últimos 30 Dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão Exportar */}
          <Button
            onClick={exportTraffic}
            className="border text-[#00BFFF] hover:bg-[#00BFFF]/10"
            style={{
              background: 'linear-gradient(135deg, rgba(0,191,255,0.1), rgba(30,144,255,0.05))',
              borderColor: 'rgba(0,191,255,0.3)',
              boxShadow: '0 0 20px rgba(0,191,255,0.15)',
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Indicador de Período Ativo */}
      {periodFilter !== 'all' && (
        <div 
          className="p-3 rounded-lg border flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(0,191,255,0.1), rgba(0,191,255,0.05))',
            borderColor: 'rgba(0,191,255,0.3)',
          }}
        >
          <Calendar className="w-4 h-4 text-[#00BFFF]" />
          <span className="text-[#00BFFF] text-sm">
            Visualizando: {
              periodFilter === 'month' ? 'Mês Atual' :
              periodFilter === '7days' ? 'Últimos 7 Dias' :
              periodFilter === '15days' ? 'Últimos 15 Dias' :
              'Últimos 30 Dias'
            } ({turnoStats.totalTestes} testes, {turnoStats.totalConvs} conversões, {turnoStats.totalRen} renovações)
          </span>
        </div>
      )}

      {/* ============================================ */}
      {/* 📊 GRID DE KPIs */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card
            key={index}
            className="p-5 border relative overflow-hidden group cursor-pointer transition-all duration-300"
            style={{
              backgroundColor: COLORS.bgCard,
              borderColor: COLORS.border,
            }}
          >
            {/* Fundo com efeito glow */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at top right, ${kpi.color}15, transparent 60%)`,
              }}
            />
            
            {/* Conteúdo */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[#9FAAC6] text-xs mb-2 uppercase tracking-wide">
                  {kpi.title}
                </p>
                <p 
                  className="text-3xl mb-1 transition-all duration-300 group-hover:scale-105"
                  style={{
                    color: kpi.color,
                    textShadow: `0 0 20px ${kpi.color}60`,
                  }}
                >
                  {kpi.value}
                </p>
                <p className="text-[#6B7694] text-xs">
                  {kpi.subtitle}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                style={{
                  background: `linear-gradient(135deg, ${kpi.color}20, ${kpi.color}10)`,
                  boxShadow: `0 0 20px ${kpi.color}40`,
                }}
              >
                <kpi.icon 
                  className="w-6 h-6" 
                  style={{ 
                    color: kpi.color,
                    filter: `drop-shadow(0 0 4px ${kpi.color})`,
                  }} 
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ============================================ */}
      {/* 📊 GRÁFICOS PRINCIPAIS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barras: Atividade por Período do Dia */}
        <Card 
          className="p-6 border"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.border,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" style={{ color: COLORS.primary }} />
            <div>
              <h3 className="text-[#EAF2FF]">Atividade por Período do Dia</h3>
              <p className="text-[#9FAAC6] text-xs">Distribuição de testes e conversões ao longo do dia</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(159,170,198,0.1)"
              />
              <XAxis 
                dataKey="turno" 
                stroke="#9FAAC6"
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                stroke="#9FAAC6"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  color: COLORS.textPrimary,
                  boxShadow: '0 0 20px rgba(0,191,255,0.2)',
                }}
                formatter={(value: any, name: any, props: any) => {
                  const idx = props.payload?.testes !== undefined ? 
                    barChartData.findIndex(d => d.turno === props.payload.turno) : -1;
                  if (idx >= 0) {
                    return [
                      `Testes: ${T[idx]} | Conversões: ${C[idx]} | Taxa: ${taxasPorTurno[idx]}%`,
                      ''
                    ];
                  }
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '12px',
                }}
              />
              {/* Barra base 100% (fundo) */}
              <Bar 
                dataKey="base" 
                stackId="stack"
                fill="rgba(106,90,205,0.35)"
                name="Testes (100%)" 
                radius={[0, 0, 0, 0]}
              />
              {/* Barra de conversão (%) sobreposta */}
              <Bar 
                dataKey="taxa" 
                stackId="stack"
                fill="#00C897"
                name="Taxa de Conversão (%)" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Mini cards dos turnos */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {turnoKeys.map((turno, idx) => {
              const Icon = TURNO_ICONS[turno];
              const count = turnoStats.stats[turno].convs;
              return (
                <div 
                  key={turno} 
                  className="p-2 rounded-lg text-center border transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${TURNO_COLORS[turno]}10, ${TURNO_COLORS[turno]}05)`,
                    borderColor: `${TURNO_COLORS[turno]}30`,
                  }}
                >
                  <Icon 
                    className="w-4 h-4 mx-auto mb-1" 
                    style={{ color: TURNO_COLORS[turno] }}
                  />
                  <p className="text-[#EAF2FF] text-sm">{count}</p>
                  <p className="text-[#6B7694] text-xs capitalize">{turno}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Radar: Visão 360° dos Horários */}
        <Card 
          className="p-6 border"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.border,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" style={{ color: COLORS.secondary }} />
            <div>
              <h3 className="text-[#EAF2FF]">Visão 360° dos Horários</h3>
              <p className="text-[#9FAAC6] text-xs">Compare todos os períodos do dia de uma vez</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={330}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(159,170,198,0.2)" />
              <PolarAngleAxis 
                dataKey="turno" 
                stroke="#9FAAC6"
                style={{ fontSize: '12px' }}
              />
              <PolarRadiusAxis 
                stroke="#9FAAC6"
                style={{ fontSize: '10px' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  color: COLORS.textPrimary,
                  boxShadow: '0 0 20px rgba(0,191,255,0.2)',
                }}
                formatter={(value: any, name: any, props: any) => {
                  const idx = labels.indexOf(props.payload?.turno || '');
                  if (idx >= 0) {
                    const originalValues: Record<string, number> = {
                      'Renovações': R[idx],
                      'Testes Grátis': T[idx],
                      'Vendas': C[idx],
                    };
                    return [
                      `${originalValues[name] || 0} (${value}% do máximo)`,
                      name
                    ];
                  }
                  return [value + '%', name];
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '12px',
                }}
              />
              <Radar 
                name="Renovações" 
                dataKey="Renovações" 
                stroke="#FF00CC" 
                fill="#FF00CC" 
                fillOpacity={0.25} 
              />
              <Radar 
                name="Testes Grátis" 
                dataKey="Testes Grátis" 
                stroke="#6B7280" 
                fill="#6B7280" 
                fillOpacity={0.2} 
              />
              <Radar 
                name="Vendas" 
                dataKey="Vendas" 
                stroke="#00BFFF" 
                fill="#00BFFF" 
                fillOpacity={0.25} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ============================================ */}
      {/* 🍕 PIZZA E DETALHAMENTO */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizza: Horários das Renovações (ou Fallback) */}
        <Card 
          className="p-6 border"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.border,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" style={{ color: COLORS.danger }} />
            <div>
              <h3 className="text-[#EAF2FF]">Horários das Renovações</h3>
              <p className="text-[#9FAAC6] text-xs">
                {usePieChart 
                  ? 'Quando os clientes renovam suas assinaturas'
                  : totalR === 0 
                    ? 'Nenhuma renovação registrada neste período'
                    : 'Distribuição concentrada (view linear)'}
              </p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            {usePieChart ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    percent > 0.05 ? `${name.split('(')[0].trim()}: ${(percent * 100).toFixed(1)}%` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  minAngle={5}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.textPrimary,
                    boxShadow: '0 0 20px rgba(0,191,255,0.2)',
                  }}
                  formatter={(value: any, name: any, props: any) => {
                    const pct = totalR > 0 ? ((value as number) / totalR * 100).toFixed(1) : '0';
                    return [`${value.toLocaleString('pt-BR')} (${pct}%)`, 'Renovações'];
                  }}
                />
              </PieChart>
            ) : (
              // Fallback: Barras horizontais quando pizza não faz sentido
              <BarChart data={pieData} layout="vertical">
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(159,170,198,0.1)"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  type="number" 
                  stroke="#9FAAC6"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9FAAC6" 
                  width={120}
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => value.split('(')[0].trim()}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: COLORS.bgCard,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    color: COLORS.textPrimary,
                    boxShadow: '0 0 20px rgba(0,191,255,0.2)',
                  }}
                  formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Renovações']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={22}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </Card>

        {/* Detalhamento por Período */}
        <Card 
          className="p-6 border"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.border,
          }}
        >
          <h3 className="text-[#EAF2FF] mb-4">Detalhamento por Período</h3>
          <div className="space-y-3">
            {turnoKeys.map((turno, index) => {
              const Icon = TURNO_ICONS[turno];
              const stats = turnoStats.stats[turno];
              const isMelhor = turno === turnoStats.melhorTurno;
              const taxaSegura = safePct(stats.convs, stats.testes);

              return (
                <div 
                  key={turno} 
                  className="p-4 rounded-lg border transition-all hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${TURNO_COLORS[turno]}10, ${TURNO_COLORS[turno]}05)`,
                    borderColor: `${TURNO_COLORS[turno]}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ 
                          background: `${TURNO_COLORS[turno]}20`,
                        }}
                      >
                        <Icon 
                          className="w-5 h-5" 
                          style={{ color: TURNO_COLORS[turno] }}
                        />
                      </div>
                      <div>
                        <p className="text-[#EAF2FF]">
                          {TURNO_LABELS[turno]} ({TURNOS[turno][0]}h-{TURNOS[turno][1]}h)
                        </p>
                        <p className="text-[#9FAAC6] text-xs">
                          Taxa de conversão: {taxaSegura}%
                        </p>
                      </div>
                    </div>
                    {isMelhor && (
                      <Badge 
                        className="border"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,184,0,0.1))',
                          color: '#FFB800',
                          borderColor: 'rgba(255,184,0,0.5)',
                        }}
                      >
                        🏆 Melhor
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[#9FAAC6] text-xs">Testes</p>
                      <p className="text-[#EAF2FF]">{stats.testes.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#9FAAC6] text-xs">Conversões</p>
                      <p className="text-[#00C897]">{stats.convs.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#9FAAC6] text-xs">Renovações</p>
                      <p className="text-[#FF00CC]">{stats.ren.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ============================================ */}
      {/* 💡 INSIGHTS DE TRÁFEGO */}
      {/* ============================================ */}
      <Card 
        className="p-6 border bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44]"
      >
        <h3 className="text-[#EAF2FF] mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: COLORS.primary }} />
          Insights de Tráfego
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,0,204,0.1), rgba(255,0,204,0.05))',
                borderColor: 'rgba(255,0,204,0.3)',
              }}
            >
              <p className="text-[#FF00CC] text-sm">
                🔥 Pico de atividade: <strong>{TURNO_LABELS[turnoStats.melhorTurno]} ({TURNOS[turnoStats.melhorTurno][0]}h-{TURNOS[turnoStats.melhorTurno][1]}h)</strong> com {turnoStats.melhorTurnoCount.toLocaleString('pt-BR')} renovações
              </p>
            </div>
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(0,191,255,0.1), rgba(0,191,255,0.05))',
                borderColor: 'rgba(0,191,255,0.3)',
              }}
            >
              <p className="text-[#00BFFF] text-sm">
                {turnoStats.totalRen > 0 
                  ? `→ ${((turnoStats.melhorTurnoCount / turnoStats.totalRen) * 100).toFixed(1)}% das renovações ocorrem no melhor período`
                  : '→ Otimize campanhas para os horários de maior engajamento'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(0,200,151,0.1), rgba(0,200,151,0.05))',
                borderColor: 'rgba(0,200,151,0.3)',
              }}
            >
              <p className="text-[#00C897] text-sm">
                ✓ Total monitorado: {turnoStats.totalRen.toLocaleString('pt-BR')} renovações
                {turnoStats.totalRen === 0 && ' (nenhuma neste período)'}
              </p>
            </div>
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,184,0,0.1), rgba(255,184,0,0.05))',
                borderColor: 'rgba(255,184,0,0.3)',
              }}
            >
              <p className="text-[#FFB800] text-sm">
                {turnoStats.totalConvs > 0 
                  ? `💡 Taxa média de conversão: ${safePct(turnoStats.totalConvs, turnoStats.totalTestes)}%`
                  : '💡 Considere suporte extra nos turnos de maior conversão'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
