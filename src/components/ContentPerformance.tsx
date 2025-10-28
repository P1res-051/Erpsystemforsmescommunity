import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Star, TrendingUp, Eye, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const topContent = [
  {
    rank: 1,
    title: 'Stranger Things - Temporada 4',
    category: 'Série',
    views: 2450000,
    hours: 18500000,
    rating: 4.8,
    completion: 87,
    trend: 'up',
  },
  {
    rank: 2,
    title: 'The Witcher - Temporada 3',
    category: 'Série',
    views: 1890000,
    hours: 14200000,
    rating: 4.6,
    completion: 82,
    trend: 'up',
  },
  {
    rank: 3,
    title: 'Planeta Terra III',
    category: 'Documentário',
    views: 1650000,
    hours: 9900000,
    rating: 4.9,
    completion: 91,
    trend: 'stable',
  },
  {
    rank: 4,
    title: 'Avatar: O Caminho da Água',
    category: 'Filme',
    views: 1520000,
    hours: 4560000,
    rating: 4.7,
    completion: 89,
    trend: 'up',
  },
  {
    rank: 5,
    title: 'Breaking Bad',
    category: 'Série',
    views: 1340000,
    hours: 8040000,
    rating: 4.9,
    completion: 94,
    trend: 'stable',
  },
  {
    rank: 6,
    title: 'The Last of Us',
    category: 'Série',
    views: 1280000,
    hours: 7680000,
    rating: 4.8,
    completion: 88,
    trend: 'up',
  },
  {
    rank: 7,
    title: 'Formula 1: Drive to Survive',
    category: 'Documentário',
    views: 980000,
    hours: 4900000,
    rating: 4.5,
    completion: 76,
    trend: 'down',
  },
  {
    rank: 8,
    title: 'Succession - Temporada 4',
    category: 'Série',
    views: 850000,
    hours: 5100000,
    rating: 4.9,
    completion: 92,
    trend: 'up',
  },
];

const categoryData = [
  { category: 'Séries', views: 8500000, hours: 51000000 },
  { category: 'Filmes', views: 4200000, hours: 12600000 },
  { category: 'Documentários', views: 3100000, hours: 15500000 },
  { category: 'Infantil', views: 2800000, hours: 11200000 },
  { category: 'Anime', views: 1900000, hours: 9500000 },
];

export function ContentPerformance() {
  return (
    <div className="space-y-6">
      {/* Category Performance */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Performance por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="category" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="views" fill="#8b5cf6" name="Visualizações" radius={[4, 4, 0, 0]} />
            <Bar dataKey="hours" fill="#ec4899" name="Horas Assistidas" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Content Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">Top Conteúdos - Últimos 30 Dias</h3>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            8 títulos
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Visualizações</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead className="text-right">Avaliação</TableHead>
                <TableHead className="text-right">Conclusão</TableHead>
                <TableHead className="w-24">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topContent.map((content) => (
                <TableRow key={content.rank}>
                  <TableCell>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                      <span className="text-slate-900">#{content.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-900">{content.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {content.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-900">
                    {content.views.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right text-slate-900">
                    {content.hours.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-slate-900">{content.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${content.completion}%` }}
                        />
                      </div>
                      <span className="text-slate-900 text-sm">{content.completion}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {content.trend === 'up' && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Alta
                      </Badge>
                    )}
                    {content.trend === 'down' && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                        Baixa
                      </Badge>
                    )}
                    {content.trend === 'stable' && (
                      <Badge variant="outline" className="bg-slate-50">
                        Estável
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total de Views</p>
              <p className="text-slate-900 text-xl">20,5M</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Horas Totais</p>
              <p className="text-slate-900 text-xl">99,8M</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Avaliação Média</p>
              <p className="text-slate-900 text-xl">4.7</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Taxa de Conclusão</p>
              <p className="text-slate-900 text-xl">86%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
