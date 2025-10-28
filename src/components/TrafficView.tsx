import { Card } from './ui/card';
import { Clock, Sunrise, Sun, Sunset, Moon, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { DashboardData } from '../App';
import { Badge } from './ui/badge';

interface Props {
  data: DashboardData;
}

const COLORS = ['#6b7280', '#00d4ff', '#ec4899', '#f59e0b'];
const TURNO_ICONS: Record<string, any> = {
  madrugada: Moon,
  manha: Sunrise,
  tarde: Sun,
  noite: Sunset,
};

const TURNO_LABELS: Record<string, string> = {
  madrugada: 'Madrugada (00h-06h)',
  manha: 'Manhã (06h-12h)',
  tarde: 'Tarde (12h-18h)',
  noite: 'Noite (18h-24h)',
};

export function TrafficView({ data }: Props) {
  const turnoMetrics = [
    {
      title: 'Melhor Turno',
      value: TURNO_LABELS[data.melhorTurno] || 'N/A',
      subtitle: `${(data.melhorTurnoCount || 0).toLocaleString('pt-BR')} renovações`,
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total de Testes',
      value: Object.values(data.testesPorTurno || {}).reduce((a, b) => a + b, 0).toLocaleString('pt-BR'),
      subtitle: 'Distribuídos em 4 turnos',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total de Conversões',
      value: Object.values(data.conversoesPorTurno || {}).reduce((a, b) => a + b, 0).toLocaleString('pt-BR'),
      subtitle: 'Por horário do dia',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  const turnosData = ['madrugada', 'manha', 'tarde', 'noite'].map((turno, index) => ({
    turno: TURNO_LABELS[turno] || turno,
    testes: (data.testesPorTurno || {})[turno] || 0,
    conversoes: (data.conversoesPorTurno || {})[turno] || 0,
    renovacoes: (data.renovacoesPorTurno || {})[turno] || 0,
    fill: COLORS[index],
  }));

  const radarData = ['madrugada', 'manha', 'tarde', 'noite'].map(turno => ({
    turno: turno.charAt(0).toUpperCase() + turno.slice(1),
    testes: (data.testesPorTurno || {})[turno] || 0,
    conversoes: (data.conversoesPorTurno || {})[turno] || 0,
    renovacoes: (data.renovacoesPorTurno || {})[turno] || 0,
  }));

  const pieData = turnosData.map((item, index) => ({
    name: item.turno,
    value: item.renovacoes,
    fill: COLORS[index],
  }));

  return (
    <div className="space-y-6">
      {/* Métricas de Turno */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {turnoMetrics.map((metric, index) => (
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barras por Turno */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Atividade por Período do Dia</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">Distribuição de testes e conversões ao longo do dia</p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={turnosData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="turno" type="category" stroke="#94a3b8" width={150} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => value.toLocaleString('pt-BR')}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="testes" fill="#6366f1" name="Testes" radius={[0, 8, 8, 0]} />
              <Bar dataKey="conversoes" fill="#10b981" name="Conversões" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {['madrugada', 'manha', 'tarde', 'noite'].map((turno, idx) => {
              const Icon = TURNO_ICONS[turno];
              const count = (data.conversoesPorTurno || {})[turno] || 0;
              return (
                <div key={turno} className="p-2 bg-slate-800/50 rounded-lg text-center border border-slate-700">
                  <Icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-white text-sm">{count}</p>
                  <p className="text-slate-500 text-xs capitalize">{turno}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Radar Chart */}
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Visão 360° dos Horários</h3>
          <p className="text-slate-400 text-sm mb-4">Compare todos os períodos do dia de uma vez</p>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="turno" stroke="#94a3b8" />
              <PolarRadiusAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => value.toLocaleString('pt-BR')}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Radar name="Testes Grátis" dataKey="testes" stroke="#6b7280" fill="#6b7280" fillOpacity={0.3} />
              <Radar name="Vendas" dataKey="conversoes" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} />
              <Radar name="Renovações" dataKey="renovacoes" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Distribuição de Renovações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Horários das Renovações</h3>
          <p className="text-slate-400 text-sm mb-4">Quando os clientes renovam suas assinaturas</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.split('(')[0].trim()}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Renovações']}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Detalhamento por Turno */}
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Detalhamento por Período</h3>
          <div className="space-y-3">
            {['madrugada', 'manha', 'tarde', 'noite'].map((turno, index) => {
              const Icon = TURNO_ICONS[turno];
              const testes = (data.testesPorTurno || {})[turno] || 0;
              const conversoes = (data.conversoesPorTurno || {})[turno] || 0;
              const renovacoes = (data.renovacoesPorTurno || {})[turno] || 0;
              const taxaConv = testes > 0 ? ((conversoes / testes) * 100).toFixed(1) : '0.0';

              return (
                <div key={turno} className="p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: COLORS[index] + '20' }}>
                        <Icon className="w-5 h-5" style={{ color: COLORS[index] }} />
                      </div>
                      <div>
                        <p className="text-white">{TURNO_LABELS[turno]}</p>
                        <p className="text-slate-400 text-xs">Taxa de conversão: {taxaConv}%</p>
                      </div>
                    </div>
                    {turno === data.melhorTurno && (
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                        🏆 Melhor
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Testes</p>
                      <p className="text-white">{testes.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Conversões</p>
                      <p className="text-green-400">{conversoes.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Renovações</p>
                      <p className="text-pink-400">{renovacoes.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Insights */}
      <Card className="p-6 bg-slate-900 border-slate-800">
        <h3 className="text-white mb-4">Insights de Tráfego</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-400 text-sm">
                🔥 Pico de atividade: <strong>{TURNO_LABELS[data.melhorTurno] || 'N/A'}</strong> com {(data.melhorTurnoCount || 0).toLocaleString('pt-BR')} renovações
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-sm">
                → Otimize campanhas para os horários de maior engajamento
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 text-sm">
                ✓ Total de {Object.values(data.renovacoesPorTurno || {}).reduce((a, b) => a + b, 0).toLocaleString('pt-BR')} renovações monitoradas
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">
                💡 Considere suporte extra nos turnos de maior conversão
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
