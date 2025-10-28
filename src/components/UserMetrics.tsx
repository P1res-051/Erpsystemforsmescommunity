import { Card } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Smartphone, Monitor, Clock, MapPin } from 'lucide-react';

const activeUsersData = [
  { day: 'Seg', users: 12450, sessions: 18670 },
  { day: 'Ter', users: 13200, sessions: 19800 },
  { day: 'Qua', users: 12890, sessions: 19340 },
  { day: 'Qui', users: 14100, sessions: 21150 },
  { day: 'Sex', users: 15800, sessions: 23700 },
  { day: 'Sáb', users: 16700, sessions: 25050 },
  { day: 'Dom', users: 15450, sessions: 23180 },
];

const deviceData = [
  { name: 'Mobile', value: 48, color: '#8b5cf6' },
  { name: 'Desktop', value: 32, color: '#ec4899' },
  { name: 'Tablet', value: 12, color: '#06b6d4' },
  { name: 'Smart TV', value: 8, color: '#94a3b8' },
];

const peakHoursData = [
  { hour: '00h', users: 3200 },
  { hour: '04h', users: 1800 },
  { hour: '08h', users: 5600 },
  { hour: '12h', users: 8900 },
  { hour: '16h', users: 9800 },
  { hour: '20h', users: 14500 },
  { hour: '23h', users: 7200 },
];

const demographicsData = [
  { age: '18-24', users: 4200 },
  { age: '25-34', users: 5800 },
  { age: '35-44', users: 3900 },
  { age: '45-54', users: 1900 },
  { age: '55+', users: 900 },
];

const topCountries = [
  { country: 'Brasil', users: 8900, percentage: 53 },
  { country: 'Argentina', users: 2800, percentage: 17 },
  { country: 'México', users: 2100, percentage: 13 },
  { country: 'Colômbia', users: 1600, percentage: 10 },
  { country: 'Chile', users: 1200, percentage: 7 },
];

export function UserMetrics() {
  return (
    <div className="space-y-6">
      {/* User Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-slate-600 text-sm">Usuários Ativos</p>
          <p className="text-slate-900 text-2xl">16.700</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <p className="text-slate-600 text-sm">Tempo Médio/Dia</p>
          <p className="text-slate-900 text-2xl">3.2h</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-600 text-sm">Usuários Mobile</p>
          <p className="text-slate-900 text-2xl">48%</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-slate-600 text-sm">Usuários Desktop</p>
          <p className="text-slate-900 text-2xl">32%</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-slate-600 text-sm">Países Ativos</p>
          <p className="text-slate-900 text-2xl">45</p>
        </Card>
      </div>

      {/* Active Users Over Week */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Usuários Ativos - Última Semana</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activeUsersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Usuários Únicos"
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#ec4899"
              strokeWidth={2}
              name="Sessões"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Device Distribution and Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Distribuição por Dispositivo</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {deviceData.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                  <span className="text-slate-700 text-sm">{device.name}</span>
                </div>
                <span className="text-slate-900">{device.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak Hours */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Horários de Pico</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="users" fill="#8b5cf6" name="Usuários Ativos" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Demographics and Top Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Demografia por Idade</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={demographicsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="age" type="category" stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="users" fill="#ec4899" name="Usuários" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Countries */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Top 5 Países</h3>
          <div className="space-y-4 mt-6">
            {topCountries.map((country, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-slate-900 text-sm">{index + 1}</span>
                    </div>
                    <span className="text-slate-900">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 text-sm">
                      {country.users.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-slate-900 min-w-[3rem] text-right">
                      {country.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
