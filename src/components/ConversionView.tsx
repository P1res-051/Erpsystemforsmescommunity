import { Card } from './ui/card';
import { Target, TrendingUp, Users, CheckCircle, XCircle, Award, Clock, DollarSign, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Funnel, FunnelChart, Cell } from 'recharts';
import { DashboardData } from '../App';
import { Button } from './ui/button';
import * as XLSX from 'xlsx';

interface Props {
  data: DashboardData;
}

export function ConversionView({ data }: Props) {
  const exportConversions = () => {
    const conversionsData = (data.rawData?.conversoes || []).map((conv: any) => ({
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
    XLSX.writeFile(wb, `Conversoes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const conversionMetrics = [
    {
      title: 'Taxa de Conversão',
      value: `${(data.taxaConversao || 0).toFixed(1)}%`,
      subtitle: `${data.conversoes || 0} conversões`,
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total de Testes',
      value: (data.testes || 0).toLocaleString('pt-BR'),
      subtitle: 'Usuários em teste',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Conversões Realizadas',
      value: (data.conversoes || 0).toLocaleString('pt-BR'),
      subtitle: 'De teste para pago',
      icon: CheckCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Conversões Perdidas',
      value: ((data.testes || 0) - (data.conversoes || 0)).toLocaleString('pt-BR'),
      subtitle: `${(100 - (data.taxaConversao || 0)).toFixed(1)}% não converteram`,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Melhor Dia de Conversão',
      value: getMelhorDiaConversao(data),
      subtitle: `${getMelhorDiaConversaoCount(data)} conversões`,
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Taxa de Sucesso',
      value: `${(((data.conversoes || 0) / (data.testes || 1)) * 100).toFixed(1)}%`,
      subtitle: 'Testes → Clientes',
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Tempo Médio até Conversão',
      value: `${(data.tempoMedioAteConversao || 0).toFixed(0)} dias`,
      subtitle: 'Da criação do teste à venda',
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Saldo Médio Pós-Venda',
      value: `${(data.saldoMedioPosVenda || 0).toFixed(1)} créditos`,
      subtitle: 'Média de créditos restantes',
      icon: DollarSign,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  const funnelData = [
    { name: 'Testes Iniciados', value: data.testes, fill: '#8b5cf6' },
    { name: 'Conversões', value: data.conversoes, fill: '#10b981' },
    { name: 'Renovações', value: data.totalRenovadores, fill: '#ec4899' },
    { name: 'Clientes Fiéis', value: data.clientesFieis, fill: '#f59e0b' },
  ];

  const weekdayOrder = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const conversionTrendData = weekdayOrder.map(day => ({
    day: day.substring(0, 3),
    testes: data.testesPorDia[day] || 0,
    conversoes: data.conversoesPorDia[day] || 0,
    taxa: ((data.conversoesPorDia[day] || 0) / (data.testesPorDia[day] || 1)) * 100,
  }));

  const conversionRateData = weekdayOrder.map(day => ({
    day: day.substring(0, 3),
    taxa: ((data.conversoesPorDia[day] || 0) / (data.testesPorDia[day] || 1)) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-white text-2xl mb-1">Análise de Conversão</h2>
          <p className="text-slate-400 text-sm">Acompanhe o funil de conversão e performance</p>
        </div>
        <Button
          onClick={exportConversions}
          variant="outline"
          className="bg-purple-900/30 border-purple-700 text-purple-300 hover:bg-purple-900/50"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Conversões
        </Button>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversionMetrics.map((metric, index) => (
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

      {/* Conversion Funnel */}
      <Card className="p-6 bg-slate-900 border-slate-800">
        <h3 className="text-white mb-4">Funil de Conversão</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={150} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {funnelData.map((stage, index) => {
              const prevValue = index > 0 ? funnelData[index - 1].value : stage.value;
              const dropoff = ((prevValue - stage.value) / prevValue) * 100;
              const retention = (stage.value / prevValue) * 100;
              return (
                <div key={index} className="p-4 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">{stage.name}</span>
                    <span className="text-white text-xl">{stage.value.toLocaleString('pt-BR')}</span>
                  </div>
                  {index > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-400">Retenção: {retention.toFixed(1)}%</span>
                      <span className="text-red-400">Perda: {dropoff.toFixed(1)}%</span>
                    </div>
                  )}
                  <div className="mt-2 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(stage.value / funnelData[0].value) * 100}%`,
                        backgroundColor: stage.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Conversion Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Testes vs Conversões */}
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Testes vs Conversões por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
              <Legend />
              <Bar dataKey="testes" fill="#8b5cf6" name="Testes" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversoes" fill="#10b981" name="Conversões" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Taxa de Conversão */}
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Taxa de Conversão por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="taxa" stroke="#10b981" strokeWidth={3} name="Taxa de Conversão (%)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Análise de Conversão</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 text-sm">
                ✓ Taxa de conversão de {data.taxaConversao.toFixed(1)}% está {data.taxaConversao > 25 ? 'acima' : 'abaixo'} da média de mercado (20-30%)
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-sm">
                → {data.conversoes} conversões geraram R$ {(data.conversoes * data.ticketMedio).toLocaleString('pt-BR')} em receita
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-400 text-sm">
                → {((data.conversoes / data.testes) * 100).toFixed(1)}% dos testes se tornaram clientes pagantes
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">
                ! {getMelhorDiaConversao(data)} apresenta a melhor performance de conversão
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-900 border-slate-800">
          <h3 className="text-white mb-4">Oportunidades de Melhoria</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-red-400 text-sm">
                ! {(data.testes - data.conversoes).toLocaleString('pt-BR')} testes não converteram
              </p>
              <p className="text-red-300 text-xs mt-1">
                Perda potencial: R$ {((data.testes - data.conversoes) * data.ticketMedio).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 text-sm">
                → Aumentar conversão em 5% geraria +R$ {(data.testes * 0.05 * data.ticketMedio).toLocaleString('pt-BR')}/mês
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-purple-400 text-sm">
                → Otimize o funil: apenas {((data.clientesFieis / data.testes) * 100).toFixed(1)}% dos testes viram fiéis
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-sm">
                → Foque esforços em {getMelhorDiaConversao(data)} para maximizar conversões
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function getMelhorDiaConversao(data: DashboardData): string {
  let maxDay = '';
  let maxCount = 0;
  Object.entries(data.conversoesPorDia).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxDay = day;
    }
  });
  return maxDay || '-';
}

function getMelhorDiaConversaoCount(data: DashboardData): number {
  return Math.max(...Object.values(data.conversoesPorDia), 0);
}
