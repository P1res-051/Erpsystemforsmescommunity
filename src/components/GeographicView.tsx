import { Card } from './ui/card';
import { MapPin, Map, Globe, TrendingUp, Users, Percent } from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { DashboardData } from '../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

interface Props {
  data: DashboardData;
}

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#84cc16', '#a855f7', '#14b8a6', '#f97316'];

export function GeographicView({ data }: Props) {
  // Mapear UF → Macroregião para agregação
  const UF_TO_REGION: Record<string, string> = {
    AC: 'Norte', AL: 'Nordeste', AM: 'Norte', AP: 'Norte', BA: 'Nordeste', CE: 'Nordeste', DF: 'Centro-Oeste', ES: 'Sudeste',
    GO: 'Centro-Oeste', MA: 'Nordeste', MG: 'Sudeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste', PA: 'Norte', PB: 'Nordeste',
    PE: 'Nordeste', PI: 'Nordeste', PR: 'Sul', RJ: 'Sudeste', RN: 'Nordeste', RO: 'Norte', RR: 'Norte', RS: 'Sul', SC: 'Sul',
    SE: 'Nordeste', SP: 'Sudeste', TO: 'Norte'
  };

  const geoMetrics = [
    {
      title: 'Estados Cobertos',
      value: (data.estadosCobertos || 0).toString(),
      subtitle: 'De 27 estados brasileiros',
      icon: Map,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Cobertura Nacional',
      value: `${(((data.estadosCobertos || 0) / 27) * 100).toFixed(1)}%`,
      subtitle: 'Penetração no mercado',
      icon: Globe,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Estado Líder',
      value: data.topEstados?.[0]?.estado || '-',
      subtitle: `${data.topEstados?.[0]?.total.toLocaleString('pt-BR') || 0} clientes`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Top 5 Estados',
      value: `${(data.topEstados || []).slice(0, 5).reduce((sum, e) => sum + (e.percentual || 0), 0).toFixed(1)}%`,
      subtitle: 'Concentração de mercado',
      icon: Percent,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Total de Clientes',
      value: (data.topEstados || []).reduce((sum, e) => sum + (e.total || 0), 0).toLocaleString('pt-BR'),
      subtitle: 'Distribuídos geograficamente',
      icon: Users,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'DDDs Ativos',
      value: (data.porDDD || []).length.toString(),
      subtitle: 'Regiões telefônicas',
      icon: MapPin,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  const topEstadosChart = (data.topEstados || []).slice(0, 10).map((e, index) => ({
    ...e,
    fill: COLORS[index % COLORS.length]
  }));

  // Detalhes por estado para stacked bar (Ativos vs Expirados)
  const porEstadoMap: Record<string, { ativos: number; expirados: number; testes: number; conversoes: number }> = {};
  (data.porEstado || []).forEach(e => {
    porEstadoMap[e.estado] = {
      ativos: e.ativos || 0,
      expirados: e.expirados || 0,
      testes: e.testes || 0,
      conversoes: e.conversoes || 0
    };
  });
  const topEstadosDetalhados = topEstadosChart.map(e => ({
    estado: e.estado,
    total: e.total,
    percentual: e.percentual,
    ativos: porEstadoMap[e.estado]?.ativos || 0,
    expirados: porEstadoMap[e.estado]?.expirados || 0,
  }));

  // Agregação por Macroregião
  const regionTotals: Record<string, number> = { Norte: 0, Nordeste: 0, 'Centro-Oeste': 0, Sudeste: 0, Sul: 0 };
  (data.porEstado || []).forEach(e => {
    const reg = UF_TO_REGION[e.estado as keyof typeof UF_TO_REGION];
    if (reg) {
      regionTotals[reg] += (e.testes || 0) + (e.ativos || 0) + (e.expirados || 0);
    }
  });
  const totalReg = Object.values(regionTotals).reduce((a, b) => a + b, 0) || 1;
  const regionChartData = Object.entries(regionTotals).map(([reg, total]) => ({
    regiao: reg,
    total,
    percentual: (total / totalReg) * 100
  }));

  const renderPieLabel = ({ estado, percentual }: { estado: string; percentual: number }) =>
    `${estado}: ${percentual.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Geographic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {geoMetrics.map((metric, index) => (
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
        {/* Top Estados Bar Chart */}
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Top 10 Estados por Volume de Clientes</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topEstadosChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="estado" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Clientes']}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#94a3b8' }}>
                {topEstadosChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Estados Pie Chart */}
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Distribuição Percentual - Top 10 Estados</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={topEstadosChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderPieLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="percentual"
              >
                {topEstadosChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => [`${value.toFixed(2)}%`, 'Percentual']}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Stacked: Ativos vs Expirados por Estado (Top 10) */}
      <Card className="p-6 bg-slate-900 border-slate-800">
        <h3 className="text-white mb-4">Ativos vs Expirados — Top 10 Estados</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={topEstadosDetalhados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="estado" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
            <Legend />
            <Bar dataKey="ativos" stackId="a" fill="#10b981" name="Ativos" radius={[4,4,0,0]} />
            <Bar dataKey="expirados" stackId="a" fill="#ef4444" name="Expirados" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Radar por Macroregião */}
      <Card className="p-6 bg-slate-900 border-slate-800">
        <h3 className="text-white mb-4">Distribuição por Macroregião</h3>
        <ResponsiveContainer width="100%" height={360}>
          <RadarChart data={regionChartData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="regiao" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis stroke="#94a3b8" angle={30} domain={[0, Math.max(...regionChartData.map(d => d.total)) || 1]} />
            <Radar name="Total" dataKey="total" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Table */}
      <Card className="p-6 bg-slate-900 border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Análise Detalhada por Estado</h3>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {(data.topEstados || []).length} estados
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400 w-16">Ranking</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
                <TableHead className="text-slate-400 text-right">Total Clientes</TableHead>
                <TableHead className="text-slate-400 text-right">Percentual</TableHead>
                <TableHead className="text-slate-400">Distribuição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.topEstados || []).map((estado, index) => (
                <TableRow key={index} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-yellow-500/20' :
                      index === 1 ? 'bg-slate-400/20' :
                      index === 2 ? 'bg-orange-500/20' : 'bg-slate-800'
                    }`}>
                      <span className={`${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-slate-400' :
                        index === 2 ? 'text-orange-500' : 'text-white'
                      }`}>#{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{estado.estado}</TableCell>
                  <TableCell className="text-white text-right">{estado.total.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-slate-400 text-right">{estado.percentual.toFixed(2)}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(estado.percentual || 0)}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Top DDDs: gráfico de barras */}
      <Card className="p-6 bg-slate-900 border-slate-800">
        <h3 className="text-white mb-4">Top 10 DDDs Mais Ativos</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={(data.porDDD || []).slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="ddd" stroke="#94a3b8" tickFormatter={(v) => `(${v})`} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
            <Bar dataKey="count" fill="#a855f7" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Análise Geográfica</h3>
          <div className="space-y-3">
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-400 text-sm">
                ✓ Cobertura em {data.estadosCobertos || 0} estados ({(((data.estadosCobertos || 0) / 27) * 100).toFixed(1)}% do Brasil)
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 text-sm">
                → {data.topEstados?.[0]?.estado || '-'} lidera com {data.topEstados?.[0]?.total.toLocaleString('pt-BR') || 0} clientes ({data.topEstados?.[0]?.percentual.toFixed(1) || 0}%)
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-sm">
                → Top 5 estados concentram {(data.topEstados || []).slice(0, 5).reduce((sum, e) => sum + (e.percentual || 0), 0).toFixed(1)}% dos clientes
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">
                ! Presença em {(data.porDDD || []).length} diferentes DDDs
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Oportunidades de Expansão</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 text-sm">
                → Potencial de crescimento em {27 - (data.estadosCobertos || 0)} estados não cobertos
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-400 text-sm">
                → Diversificar base em estados com baixa penetração
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-sm">
                → Reforçar presença em {data.topEstados?.[0]?.estado || '-'} (estado líder)
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">
                → Explorar regiões adjacentes aos DDDs mais ativos
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}





