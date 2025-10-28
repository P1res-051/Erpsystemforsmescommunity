import { Card } from './ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, Play, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 245000, subscriptions: 12450 },
  { month: 'Fev', revenue: 268000, subscriptions: 13400 },
  { month: 'Mar', revenue: 289000, subscriptions: 14450 },
  { month: 'Abr', revenue: 312000, subscriptions: 15600 },
  { month: 'Mai', revenue: 298000, subscriptions: 14900 },
  { month: 'Jun', revenue: 334000, subscriptions: 16700 },
];

const planDistribution = [
  { name: 'Básico', value: 45, color: '#94a3b8' },
  { name: 'Padrão', value: 35, color: '#8b5cf6' },
  { name: 'Premium', value: 20, color: '#ec4899' },
];

const regionalData = [
  { region: 'Brasil', users: 45000, revenue: 125000 },
  { region: 'Argentina', users: 23000, revenue: 58000 },
  { region: 'México', users: 31000, revenue: 89000 },
  { region: 'Colômbia', users: 18000, revenue: 42000 },
  { region: 'Chile', users: 15000, revenue: 38000 },
];

export function StreamingDashboard() {
  const metrics = [
    {
      title: 'Receita Total',
      value: 'R$ 334.000',
      change: '+7,2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Assinantes Ativos',
      value: '16.700',
      change: '+12,1%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Horas Assistidas',
      value: '892.450',
      change: '+8,5%',
      trend: 'up',
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Taxa de Retenção',
      value: '89,3%',
      change: '-2,1%',
      trend: 'down',
      icon: Award,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm mb-1">{metric.title}</p>
                <p className="text-slate-900 text-2xl mb-2">{metric.value}</p>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="text-slate-500 text-sm">vs mês anterior</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Receita e Assinaturas - Últimos 6 Meses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
              dataKey="revenue"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Receita (R$)"
            />
            <Line
              type="monotone"
              dataKey="subscriptions"
              stroke="#ec4899"
              strokeWidth={2}
              name="Assinaturas"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribution and Regional Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Distribuição por Plano</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {planDistribution.map((plan, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="text-slate-700 text-sm">{plan.name}</span>
                </div>
                <span className="text-slate-900">{plan.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Regional Performance */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Performance por Região</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={regionalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="region" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="users" fill="#8b5cf6" name="Usuários" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
