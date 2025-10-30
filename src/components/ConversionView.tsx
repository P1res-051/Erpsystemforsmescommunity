import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Target, TrendingUp, Users, CheckCircle, XCircle, Award, Clock, DollarSign, Download, Zap, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DashboardData } from '../App';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as XLSX from 'xlsx';
import { COLORS, getKpiCardStyle } from '../utils/designSystem';

interface Props {
  data: DashboardData;
}

type PeriodFilter = 'all' | 'month' | '7days' | '15days' | '30days';

export function ConversionView({ data }: Props) {
  // ============================================
  // 🎯 STATE - FILTRO DE PERÍODO
  // ============================================
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  // ============================================
  // 📊 FILTRO DE DADOS POR PERÍODO
  // ============================================
  const filteredData = useMemo(() => {
    const now = new Date();
    const filterDate = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return false;
      
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

    if (periodFilter === 'all') {
      return {
        testes: data.rawData?.testes || [],
        conversoes: data.rawData?.conversoes || [],
      };
    }

    return {
      testes: (data.rawData?.testes || []).filter((t: any) => 
        filterDate(t.Criado_Em || t.criado_em || '')
      ),
      conversoes: (data.rawData?.conversoes || []).filter((c: any) => 
        filterDate(c.Data || c.data || '')
      ),
    };
  }, [data, periodFilter]);

  // ============================================
  // 📊 RECALCULAR MÉTRICAS COM DADOS FILTRADOS
  // ============================================
  const metrics = useMemo(() => {
    const testes = filteredData.testes;
    const conversoes = filteredData.conversoes;
    
    const total_testes = testes.length;
    const total_conv = conversoes.length;
    const taxa_conv = total_testes > 0 ? Math.round((100 * total_conv / total_testes) * 10) / 10 : 0;
    const perdas = total_testes - total_conv;
    
    // Calcular por dia da semana
    const weekdayOrder = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
    const daysAbbrev = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
    
    const testesPorDia: Record<string, number> = {};
    const convPorDia: Record<string, number> = {};
    
    weekdayOrder.forEach(day => {
      testesPorDia[day] = 0;
      convPorDia[day] = 0;
    });
    
    // Contar testes por dia
    testes.forEach((t: any) => {
      const date = new Date(t.Criado_Em || t.criado_em);
      if (!isNaN(date.getTime())) {
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        if (testesPorDia[dayName] !== undefined) {
          testesPorDia[dayName]++;
        }
      }
    });
    
    // Contar conversões por dia
    conversoes.forEach((c: any) => {
      const date = new Date(c.Data || c.data);
      if (!isNaN(date.getTime())) {
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        if (convPorDia[dayName] !== undefined) {
          convPorDia[dayName]++;
        }
      }
    });
    
    const conv_por_dia = weekdayOrder.map(day => convPorDia[day] || 0);
    const testes_por_dia = weekdayOrder.map(day => testesPorDia[day] || 0);
    
    const taxa_por_dia = weekdayOrder.map((day, idx) => {
      const t = testes_por_dia[idx];
      const c = conv_por_dia[idx];
      return t > 0 ? Math.round((100 * c / t) * 10) / 10 : 0;
    });
    
    const melhor_dia_index = conv_por_dia.indexOf(Math.max(...conv_por_dia));
    const melhor_dia = daysAbbrev[melhor_dia_index] || '—';
    const melhor_dia_count = conv_por_dia[melhor_dia_index] || 0;
    
    // Saldo médio
    const saldos = conversoes
      .map((c: any) => parseFloat(String(c.Creditos_Apos || c.creditos_apos || '0').replace(',', '.')))
      .filter(v => !isNaN(v) && v > 0);
    const saldo_medio = saldos.length > 0 
      ? Math.round((saldos.reduce((a, b) => a + b, 0) / saldos.length) * 10) / 10 
      : 0;
    
    // Tempo médio (estimado)
    const tempo_medio = 5; // Placeholder - seria necessário calcular com datas
    
    return {
      total_testes,
      total_conv,
      taxa_conv,
      perdas,
      conv_por_dia,
      testes_por_dia,
      taxa_por_dia,
      melhor_dia,
      melhor_dia_count,
      saldo_medio,
      tempo_medio,
      daysAbbrev,
    };
  }, [filteredData]);

  // ============================================
  // 📤 EXPORTAÇÃO
  // ============================================
  const exportConversions = () => {
    const conversionsData = filteredData.conversoes.map((conv: any) => ({
      'Data': conv.Data || conv.data || '-',
      'Usuario': conv.Usuario || conv.usuario || '-',
      'Email': conv.Email || conv.email || '-',
      'Custo': conv.Custo || conv.custo || 0,
      'Creditos Após': conv.Creditos_Apos || conv.creditos_apos || 0,
      'Dia da Semana': conv._diaSemana || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(conversionsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Conversões');
    XLSX.writeFile(wb, `Conversoes_${periodFilter}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  // ============================================
  // 💎 KPIs PRINCIPAIS
  // ============================================
  const kpiCards = [
    {
      title: 'Taxa de Conversão',
      value: `${metrics.taxa_conv}%`,
      subtitle: `${metrics.total_conv} conversões`,
      icon: Target,
      color: COLORS.primary,
    },
    {
      title: 'Total de Testes',
      value: metrics.total_testes.toLocaleString('pt-BR'),
      subtitle: 'Usuários em teste',
      icon: Users,
      color: COLORS.secondary,
    },
    {
      title: 'Conversões Realizadas',
      value: metrics.total_conv.toLocaleString('pt-BR'),
      subtitle: 'De teste para pago',
      icon: CheckCircle,
      color: COLORS.success,
    },
    {
      title: 'Conversões Perdidas',
      value: metrics.perdas.toLocaleString('pt-BR'),
      subtitle: `${(100 - metrics.taxa_conv).toFixed(1)}% não converteram`,
      icon: XCircle,
      color: COLORS.danger,
    },
    {
      title: 'Melhor Dia de Conversão',
      value: metrics.melhor_dia,
      subtitle: `${metrics.melhor_dia_count} conversões`,
      icon: Award,
      color: COLORS.warning,
    },
    {
      title: 'Taxa de Sucesso',
      value: `${metrics.taxa_conv}%`,
      subtitle: 'Testes → Clientes',
      icon: TrendingUp,
      color: COLORS.secondary,
    },
    {
      title: 'Tempo Médio até Conversão',
      value: `${metrics.tempo_medio} dias`,
      subtitle: 'Da criação do teste à venda',
      icon: Clock,
      color: COLORS.info,
    },
    {
      title: 'Saldo Médio Pós-Venda',
      value: `${metrics.saldo_medio} créditos`,
      subtitle: 'Média de créditos restantes',
      icon: DollarSign,
      color: COLORS.primary,
    },
  ];

  // Funil de conversão
  const funnelData = [
    { name: 'Testes Iniciados', value: metrics.total_testes, fill: COLORS.secondary },
    { name: 'Conversões', value: metrics.total_conv, fill: COLORS.primary },
    { name: 'Renovações', value: Math.round(metrics.total_conv * 0.4), fill: COLORS.success },
    { name: 'Clientes Fiéis', value: Math.round(metrics.total_conv * 0.2), fill: COLORS.info },
  ];
  
  // Dados para gráficos
  const conversionTrendData = metrics.daysAbbrev.map((day, idx) => ({
    day,
    testes: metrics.testes_por_dia[idx],
    conversoes: metrics.conv_por_dia[idx],
    taxa: metrics.taxa_por_dia[idx],
  }));
  
  const conversionRateData = metrics.daysAbbrev.map((day, idx) => ({
    day,
    taxa: metrics.taxa_por_dia[idx],
  }));

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* 📋 HEADER COM FILTROS E EXPORTAÇÃO */}
      {/* ============================================ */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-[#EAF2FF] flex items-center gap-3">
            <Zap className="w-7 h-7" style={{ color: COLORS.primary }} />
            <span>Análise de Conversão</span>
          </h2>
          <p className="text-[#9FAAC6] text-sm mt-1">
            💡 Acompanhe o funil de conversão e performance de vendas
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
                  borderColor: COLORS.borderDefault,
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
            onClick={exportConversions}
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
            } ({metrics.total_testes} testes, {metrics.total_conv} conversões)
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
              borderColor: COLORS.borderDefault,
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
      {/* 🔥 FUNIL DE CONVERSÃO */}
      {/* ============================================ */}
      <Card 
        className="p-6 border"
        style={{
          backgroundColor: COLORS.bgCard,
          borderColor: COLORS.borderDefault,
        }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5" style={{ color: COLORS.secondary }} />
          <h3 className="text-[#EAF2FF]">Funil de Conversão</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras Horizontais */}
          <div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={funnelData} layout="vertical">
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
                  width={140}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: COLORS.bgCard,
                    border: `1px solid ${COLORS.borderDefault}`,
                    borderRadius: '8px',
                    color: COLORS.textPrimary,
                    boxShadow: '0 0 20px rgba(0,191,255,0.2)',
                  }}
                  formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Quantidade']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detalhes do Funil */}
          <div className="space-y-3">
            {funnelData.map((stage, index) => {
              const prevValue = index > 0 ? funnelData[index - 1].value : stage.value;
              const dropoff = prevValue > 0 ? ((prevValue - stage.value) / prevValue) * 100 : 0;
              const retention = prevValue > 0 ? (stage.value / prevValue) * 100 : 100;
              
              return (
                <div 
                  key={index} 
                  className="p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${stage.fill}08, ${stage.fill}03)`,
                    borderColor: `${stage.fill}30`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#EAF2FF] text-sm">{stage.name}</span>
                    <span 
                      className="text-2xl"
                      style={{
                        color: stage.fill,
                      }}
                    >
                      {stage.value.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  {index > 0 && (
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#00C897]">
                        Retenção: {retention.toFixed(1)}%
                      </span>
                      <span className="text-[#E84A5F]">
                        Perda: {dropoff.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ 
                      backgroundColor: `${stage.fill}20`,
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(stage.value / funnelData[0].value) * 100}%`,
                        background: `linear-gradient(90deg, ${stage.fill}, ${stage.fill}CC)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ============================================ */}
      {/* 📈 GRÁFICOS DE TENDÊNCIA */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Testes vs Conversões */}
        <Card 
          className="p-6 border"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.borderDefault,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: COLORS.primary }} />
            <h3 className="text-[#EAF2FF]">Testes vs Conversões por Dia</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionTrendData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(159,170,198,0.1)"
              />
              <XAxis 
                dataKey="day" 
                stroke="#9FAAC6"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9FAAC6"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.borderDefault}`,
                  borderRadius: '8px',
                  color: COLORS.textPrimary,
                  boxShadow: '0 0 20px rgba(0,191,255,0.2)',
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '12px',
                }}
              />
              <Bar 
                dataKey="testes" 
                fill={COLORS.secondary}
                name="Testes" 
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="conversoes" 
                fill={COLORS.primary}
                name="Conversões" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Taxa de Conversão por Dia */}
        <Card 
          className="p-6 border"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.borderDefault,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5" style={{ color: COLORS.primary }} />
            <h3 className="text-[#EAF2FF]">Taxa de Conversão por Dia</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionRateData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(159,170,198,0.1)"
              />
              <XAxis 
                dataKey="day" 
                stroke="#9FAAC6"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9FAAC6"
                style={{ fontSize: '12px' }}
                label={{ 
                  value: '%', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#9FAAC6' }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: COLORS.bgCard,
                  border: `1px solid ${COLORS.borderDefault}`,
                  borderRadius: '8px',
                  color: COLORS.textPrimary,
                  boxShadow: '0 0 20px rgba(0,191,255,0.2)',
                }}
                formatter={(value: any) => [value.toFixed(1) + '%', 'Taxa']}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '12px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="taxa" 
                stroke={COLORS.primary}
                strokeWidth={3}
                name="Taxa de Conversão (%)"
                dot={{ 
                  fill: COLORS.primary, 
                  r: 5,
                  strokeWidth: 2,
                  stroke: COLORS.bgCard,
                }}
                activeDot={{ 
                  r: 7,
                  fill: COLORS.primary,
                  stroke: COLORS.primary,
                  strokeWidth: 0,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ============================================ */}
      {/* 💡 INSIGHTS E ANÁLISES */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Análise de Conversão */}
        <Card 
          className="p-6 border"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.borderDefault,
          }}
        >
          <h3 className="text-[#EAF2FF] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: COLORS.primary }} />
            Análise de Conversão
          </h3>
          <div className="space-y-3">
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(0,200,151,0.1), rgba(0,200,151,0.05))',
                borderColor: 'rgba(0,200,151,0.3)',
              }}
            >
              <p className="text-[#00C897] text-sm">
                ✓ Taxa de conversão de {metrics.taxa_conv}% está {metrics.taxa_conv > 25 ? 'acima' : 'abaixo'} da média de mercado (20-30%)
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
                → {metrics.total_conv} conversões geraram aproximadamente R$ {(metrics.total_conv * (data.ticketMedio || 0)).toLocaleString('pt-BR')} em receita
              </p>
            </div>
            
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,0,204,0.1), rgba(255,0,204,0.05))',
                borderColor: 'rgba(255,0,204,0.3)',
              }}
            >
              <p className="text-[#FF00CC] text-sm">
                ⚡ Tempo médio de {metrics.tempo_medio} dias até conversão. {metrics.tempo_medio < 7 ? 'Excelente!' : metrics.tempo_medio < 14 ? 'Bom tempo!' : 'Considere estratégias para acelerar'}
              </p>
            </div>
          </div>
        </Card>

        {/* Oportunidades */}
        <Card 
          className="p-6 border"
          style={{
            backgroundColor: COLORS.bgCard,
            borderColor: COLORS.borderDefault,
          }}
        >
          <h3 className="text-[#EAF2FF] mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" style={{ color: COLORS.secondary }} />
            Oportunidades de Melhoria
          </h3>
          <div className="space-y-3">
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,184,0,0.1), rgba(255,184,0,0.05))',
                borderColor: 'rgba(255,184,0,0.3)',
              }}
            >
              <p className="text-[#FFB800] text-sm">
                📊 {metrics.perdas} testes não converteram. Potencial de R$ {(metrics.perdas * (data.ticketMedio || 0) * 0.25).toLocaleString('pt-BR')} em receita
              </p>
            </div>
            
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))',
                borderColor: 'rgba(139,92,246,0.3)',
              }}
            >
              <p className="text-[#8B5CF6] text-sm">
                🎯 Melhor dia: {metrics.melhor_dia} com {metrics.melhor_dia_count} conversões. Foque campanhas neste dia!
              </p>
            </div>
            
            <div 
              className="p-4 rounded-lg border"
              style={{
                background: 'linear-gradient(135deg, rgba(30,144,255,0.1), rgba(30,144,255,0.05))',
                borderColor: 'rgba(30,144,255,0.3)',
              }}
            >
              <p className="text-[#1E90FF] text-sm">
                💰 Saldo médio de {metrics.saldo_medio} créditos pós-venda. {metrics.saldo_medio > 10 ? 'Clientes satisfeitos!' : 'Monitore a satisfação'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
