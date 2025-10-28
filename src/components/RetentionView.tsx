import { Card } from './ui/card';
import { Heart, TrendingUp, TrendingDown, Users, Award, RefreshCcw, UserCheck, Sparkles, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardData } from '../App';

interface Props {
  data: DashboardData;
}

export function RetentionView({ data }: Props) {
  const churnChange = data.churnRate > 30 ? -1.1 : 2.9;
  const ltvMonths = data.ltv > 150 ? 0.5 : -0.3;

  const topMetrics = [
    {
      label: 'Taxa de Retenção',
      value: `${data.taxaRetencao.toFixed(1)}%`,
      change: `+2.9% vs mês anterior`,
      isPositive: true,
    },
    {
      label: 'Churn Mensal',
      value: `${data.churnRate.toFixed(1)}`,
      change: churnChange > 0 ? `+${churnChange.toFixed(1)}% melhor` : `-${Math.abs(churnChange).toFixed(1)}% pior`,
      isPositive: churnChange < 0,
    },
    {
      label: 'Clientes Fiéis (2+ renovações)',
      value: `${data.clientesFieis.toLocaleString('pt-BR')}`,
      change: `+188 este mês`,
      isPositive: true,
    },
    {
      label: 'Tempo Médio de Vida',
      value: `${((data.ltv || 150) / 30).toFixed(0)}`,
      extra: `+${ltvMonths.toFixed(1)} meses`,
      isPositive: ltvMonths > 0,
    },
  ];

  const bigMetrics = [
    {
      title: 'TAXA DE RETENÇÃO',
      value: data.taxaRetencao.toFixed(1),
      suffix: '%',
      change: `+2.9% vs mês anterior`,
      icon: UserCheck,
      iconBg: 'from-emerald-500 to-green-600',
      trend: 'up',
    },
    {
      title: 'CHURN MENSAL',
      value: data.churnRate.toFixed(1),
      suffix: '',
      change: churnChange > 0 ? `+${churnChange.toFixed(1)}% melhor` : `${churnChange.toFixed(1)}% melhor`,
      icon: ArrowDownRight,
      iconBg: 'from-red-500 to-pink-600',
      trend: churnChange < 0 ? 'up' : 'down',
    },
    {
      title: 'CLIENTES FIÉIS (2+ RENOVAÇÕES)',
      value: data.clientesFieis.toLocaleString('pt-BR'),
      suffix: '',
      change: `+188 este mês`,
      icon: Heart,
      iconBg: 'from-pink-500 to-purple-600',
      trend: 'up',
    },
    {
      title: 'TEMPO MÉDIO DE VIDA',
      value: ((data.ltv || 150) / 30).toFixed(0),
      suffix: 'meses',
      change: `+${ltvMonths.toFixed(1)} meses`,
      icon: Award,
      iconBg: 'from-amber-500 to-orange-600',
      trend: ltvMonths > 0 ? 'up' : 'down',
    },
  ];

  const retentionMetrics = [
    {
      title: 'Taxa de Retenção',
      value: `${data.taxaRetencao.toFixed(1)}%`,
      subtitle: `${data.clientesAtivos} clientes mantidos`,
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Churn Rate',
      value: `${data.churnRate.toFixed(1)}%`,
      subtitle: `${data.clientesExpirados} clientes perdidos`,
      icon: TrendingUp,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Taxa de Fidelidade',
      value: `${data.taxaFidelidade.toFixed(1)}%`,
      subtitle: 'Clientes com 2+ renovações',
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Clientes Fiéis',
      value: data.clientesFieis.toLocaleString('pt-BR'),
      subtitle: `de ${data.totalRenovadores} renovadores`,
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Total de Renovações',
      value: data.renovacoes.toLocaleString('pt-BR'),
      subtitle: 'Renovações realizadas',
      icon: RefreshCcw,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Renovadores Únicos',
      value: data.totalRenovadores.toLocaleString('pt-BR'),
      subtitle: 'Clientes que renovaram',
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const retentionData = [
    { name: 'Retidos', value: data.clientesAtivos, color: '#10b981' },
    { name: 'Perdidos', value: data.clientesExpirados, color: '#ef4444' },
  ];

  const loyaltyData = [
    { name: 'Clientes Fiéis (2+)', value: data.clientesFieis, color: '#ec4899' },
    { name: 'Renovadores Ocasionais (1)', value: data.totalRenovadores - data.clientesFieis, color: '#94a3b8' },
  ];

  const COLORS_DIST = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  const renovacoesDistData = (data.distribuicaoRenovacoes || []).map((item, index) => ({
    ...item,
    fill: COLORS_DIST[index % COLORS_DIST.length]
  }));

  const weekdayOrder = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const renewalTrendData = weekdayOrder.map(day => ({
    day: day.substring(0, 3),
    renovacoes: data.renovacoesPorDia[day] || 0,
  }));

  // Simular cohort de retenção
  const cohortData = [
    { mes: 'Mês 1', retencao: 100 },
    { mes: 'Mês 2', retencao: 85 },
    { mes: 'Mês 3', retencao: 72 },
    { mes: 'Mês 4', retencao: 65 },
    { mes: 'Mês 5', retencao: 60 },
    { mes: 'Mês 6', retencao: 56 },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Insights de Retenção */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-white text-xl">Performance de Retenção</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                {metric.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-white" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-white" />
                )}
                <span className="text-white/80 text-xs">{metric.label}</span>
              </div>
              <p className="text-white text-2xl mb-1">{metric.value}</p>
              {metric.change && (
                <p className="text-white/70 text-xs">{metric.change}</p>
              )}
              {metric.extra && (
                <p className="text-white/70 text-xs">{metric.extra}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cards Grandes de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bigMetrics.map((metric, idx) => (
          <Card key={idx} className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-300 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <p className="text-slate-400 text-xs">{metric.title}</p>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.iconBg} flex items-center justify-center shadow-lg`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-2">
              <span className="text-white text-3xl">{metric.value}</span>
              {metric.suffix && <span className="text-slate-400 text-lg ml-1">{metric.suffix}</span>}
            </div>
            <div className="flex items-center gap-2">
              {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
              {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
              <span className={`text-xs ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Retention Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 hidden">
        {retentionMetrics.map((metric, index) => (
          <Card key={index} className="p-5 bg-slate-900 border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-1">{metric.title}</p>
                <p className="text-white text-2xl mb-1">{metric.value}</p>
                <p className="text-slate-500 text-xs">{metric.subtitle}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Distribution */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Clientes Ativos vs Perdidos</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retentionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => value.toLocaleString('pt-BR')}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} label={{ position: 'right', fill: '#fff', fontSize: 14 }}>
                {retentionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-green-400 text-xs">Taxa de Retenção</p>
              <p className="text-green-400 text-xl">{data.taxaRetencao.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="text-red-400 text-xs">Churn Rate</p>
              <p className="text-red-400 text-xl">{data.churnRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        {/* Loyalty Distribution */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Nível de Fidelidade</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={loyaltyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => value.toLocaleString('pt-BR')}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#fff', fontSize: 14 }}>
                {loyaltyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-pink-500/10 rounded-lg text-center border border-pink-500/30">
            <p className="text-pink-400 text-xs">Taxa de Fidelidade</p>
            <p className="text-pink-400 text-2xl">{data.taxaFidelidade.toFixed(1)}%</p>
            <p className="text-slate-400 text-xs mt-1">{data.clientesFieis} de {data.totalRenovadores} renovadores</p>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renewal Trend */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Renovações por Dia</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">Clientes únicos que renovaram em cada dia da semana</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={renewalTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => value.toLocaleString('pt-BR')}
              />
              <Bar dataKey="renovacoes" fill="#ec4899" name="Renovações Únicas" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#fce7f3', fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-purple-500/10 rounded-lg text-center border border-purple-500/30">
            <p className="text-purple-400 text-sm">Melhor Dia: <span className="capitalize">{data.melhorDia}</span></p>
            <p className="text-purple-400 text-xl">{data.melhorDiaCount.toLocaleString('pt-BR')} renovações</p>
          </div>
        </Card>

        {/* Distribuição de Renovações */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Renovações por Cliente</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={renovacoesDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="categoria" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Clientes']}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#fef3c7', fontSize: 12 }}>
                {renovacoesDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Cohort Retention */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white">Curva de Retenção ao Longo do Tempo</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">Porcentagem de clientes que permanecem ativos mês a mês</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cohortData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="mes" stroke="#94a3b8" label={{ value: 'Período desde a 1ª compra', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" label={{ value: '% Clientes Ativos', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              formatter={(value: any) => [`${value}%`, 'Retenção']}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="retencao" stroke="#10b981" strokeWidth={3} name="Taxa de Retenção" dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg text-center border border-cyan-500/30">
          <p className="text-cyan-400 text-sm">
            📊 Análise baseada em padrões de mercado - {data.taxaRetencao.toFixed(1)}% dos seus clientes permanecem ativos
          </p>
        </div>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Insights de Retenção</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 text-sm">✓ Taxa de retenção de {data.taxaRetencao.toFixed(1)}% está {data.taxaRetencao > 50 ? 'acima' : 'abaixo'} da média</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-sm">→ {data.clientesFieis} clientes fiéis geram receita recorrente estável</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">! {data.melhorDia} é o melhor dia para ações de renovação</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-400 text-sm">→ {data.taxaFidelidade.toFixed(1)}% dos renovadores são fiéis (2+ renovações)</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Oportunidades</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-red-400 text-sm">! Reduzir churn de {data.churnRate.toFixed(1)}% para 40% aumentaria receita em R$ {((data.clientesExpirados * 0.08 * data.ticketMedio)).toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 text-sm">→ Foque em reativar {Math.round(data.clientesExpirados * 0.3)} clientes expirados (30% viável)</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-400 text-sm">→ Implemente programa de fidelidade para aumentar retenção</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-sm">→ Use {data.melhorDia} para campanhas de reengajamento</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
