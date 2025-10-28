import { Card } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const monthlyRevenue = [
  { month: 'Jul/24', basic: 85000, standard: 92000, premium: 68000, total: 245000 },
  { month: 'Ago/24', basic: 89000, standard: 98000, premium: 81000, total: 268000 },
  { month: 'Set/24', basic: 92000, standard: 102000, premium: 95000, total: 289000 },
  { month: 'Out/24', basic: 95000, standard: 108000, premium: 109000, total: 312000 },
  { month: 'Nov/24', basic: 91000, standard: 103000, premium: 104000, total: 298000 },
  { month: 'Dez/24', basic: 98000, standard: 115000, premium: 121000, total: 334000 },
];

const conversionData = [
  { week: 'Sem 1', trials: 450, conversions: 234, rate: 52 },
  { week: 'Sem 2', trials: 523, conversions: 289, rate: 55 },
  { week: 'Sem 3', trials: 489, conversions: 267, rate: 55 },
  { week: 'Sem 4', trials: 612, conversions: 379, rate: 62 },
];

const churnData = [
  { month: 'Jan', churn: 8.2, newSubs: 1250 },
  { month: 'Fev', churn: 7.8, newSubs: 1430 },
  { month: 'Mar', churn: 9.1, newSubs: 1380 },
  { month: 'Abr', churn: 8.5, newSubs: 1520 },
  { month: 'Mai', churn: 10.2, newSubs: 1290 },
  { month: 'Jun', churn: 7.4, newSubs: 1650 },
];

export function SalesAnalytics() {
  const salesMetrics = [
    { label: 'MRR (Receita Recorrente Mensal)', value: 'R$ 334.000', change: '+7,2%', positive: true },
    { label: 'ARR (Receita Recorrente Anual)', value: 'R$ 4.008.000', change: '+12,4%', positive: true },
    { label: 'ARPU (Receita por Usuário)', value: 'R$ 20,00', change: '-1,2%', positive: false },
    { label: 'Taxa de Conversão', value: '62%', change: '+5,8%', positive: true },
    { label: 'Churn Rate', value: '7,4%', change: '-2,8%', positive: true },
    { label: 'LTV (Lifetime Value)', value: 'R$ 540', change: '+8,3%', positive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Sales Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salesMetrics.map((metric, index) => (
          <Card key={index} className="p-5">
            <p className="text-slate-600 text-sm mb-1">{metric.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-slate-900 text-2xl">{metric.value}</p>
              <div className={`flex items-center gap-1 ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.positive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm">{metric.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue by Plan */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Receita por Plano - Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="colorBasic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="basic"
              stackId="1"
              stroke="#94a3b8"
              fill="url(#colorBasic)"
              name="Básico (R$)"
            />
            <Area
              type="monotone"
              dataKey="standard"
              stackId="1"
              stroke="#8b5cf6"
              fill="url(#colorStandard)"
              name="Padrão (R$)"
            />
            <Area
              type="monotone"
              dataKey="premium"
              stackId="1"
              stroke="#ec4899"
              fill="url(#colorPremium)"
              name="Premium (R$)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Conversion and Churn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Taxa de Conversão - Últimas 4 Semanas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="trials" fill="#cbd5e1" name="Trials" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" fill="#8b5cf6" name="Conversões" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Churn vs New Subscribers */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Churn vs Novos Assinantes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={churnData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis yAxisId="left" stroke="#64748b" />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="churn"
                stroke="#ef4444"
                strokeWidth={2}
                name="Churn Rate (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="newSubs"
                stroke="#10b981"
                strokeWidth={2}
                name="Novos Assinantes"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
