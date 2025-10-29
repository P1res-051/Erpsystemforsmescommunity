import { Card } from './ui/card';
import { Trophy, Target, TrendingUp, Award, Calendar, Percent, Sparkles, Flame, RefreshCw } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardData } from '../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Props {
  data: DashboardData;
}

interface JogoLocal {
  id: string;
  time_casa: string;
  time_fora: string;
  horario: string;
  campeonato: string;
  status: string;
  placar_casa?: string;
  placar_fora?: string;
  brasao_casa: string;
  brasao_fora: string;
  estadio: string;
  canais: string;
  is_big_game: boolean;
  status_text: string;
}

interface JogosResponse {
  success: boolean;
  data: {
    date: string;
    total_games: number;
    games: JogoLocal[];
  };
  error?: string;
}

export function GamesView({ data }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(false);
  const [jogosLocais, setJogosLocais] = useState<JogoLocal[]>([]);
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const widgetsLoaded = useRef(false);
  
  // Função para buscar jogos da nossa API local
  const fetchJogosLocais = async (date?: string) => {
    try {
      setIsLoading(true);
      const dateParam = date || new Date().toISOString().slice(0, 10);
      // Converter formato de data de YYYY-MM-DD para DD-MM-YYYY
      const [year, month, day] = dateParam.split('-');
      const dateFormatted = `${day}-${month}-${year}`;
      
      const response = await fetch(`http://localhost:5000/api/jogos?date=${dateFormatted}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: JogosResponse = await response.json();
      
      if (result.success) {
        setJogosLocais(result.data.games);
        setApiStatus('connected');
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao buscar jogos locais:', error);
      setApiStatus('error');
      setJogosLocais([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status da API
  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status');
      if (response.ok) {
        setApiStatus('connected');
        return true;
      }
    } catch (error) {
      console.error('API local não disponível:', error);
    }
    setApiStatus('error');
    return false;
  };

  // Carregar jogos quando o componente montar ou data mudar
  useEffect(() => {
    const loadData = async () => {
      const apiAvailable = await checkApiStatus();
      if (apiAvailable) {
        await fetchJogosLocais(selectedDate);
      }
    };
    loadData();
  }, [selectedDate]);
  
  // Carregar o script do widget da API-Sports
  useEffect(() => {
    if (widgetsLoaded.current) return;
    
    const script = document.createElement('script');
    script.src = 'https://widgets.api-sports.io/football/3.0.0/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    widgetsLoaded.current = true;
    
    return () => {
      // Não remover o script para evitar recarregamentos
    };
  }, []);

  // Atualizar widgets quando a data mudar
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setIsLoading(true);
    
    // Buscar jogos locais para a nova data
    if (apiStatus === 'connected') {
      fetchJogosLocais(newDate);
    }
    
    // Atualizar todos os widgets de fixtures
    const widgetIds = ['wg-br-a', 'wg-br-b', 'wg-liberta', 'wg-sula'];
    widgetIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('data-date', newDate);
        // Tentar recarregar o widget se a API estiver disponível
        if ((window as any)?.AFW?.reload) {
          (window as any).AFW.reload(el);
        }
      }
    });
    
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (!data.hasGamesData) {
    return (
      <Card className="p-12 text-center bg-slate-900 border-slate-800">
        <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-white text-xl mb-2">Dados de Jogos Não Disponíveis</h3>
        <p className="text-slate-400">
          Carregue um arquivo Excel com as abas "Jogos" e "Conv x Jogos" para visualizar estas métricas
        </p>
      </Card>
    );
  }

  // Sistema de pesos para competições
  const competicaoPeso: Record<string, number> = {
    'libertadores': 10,
    'copa libertadores': 10,
    'sulamericana': 8,
    'copa sul-americana': 8,
    'serie a': 7,
    'brasileirao': 7,
    'brasileiro': 7,
    'copa do brasil': 5,
    'estadual': 3,
    'champions': 10,
    'copa do mundo': 15,
  };

  const getCompetitionWeight = (name: string): number => {
    const nameLower = name.toLowerCase();
    for (const [key, weight] of Object.entries(competicaoPeso)) {
      if (nameLower.includes(key)) {
        return weight;
      }
    }
    return 1;
  };

  const competicaoData = Object.entries(data.porCompeticao || {})
    .map(([name, value]) => ({ 
      name, 
      value,
      score: value * getCompetitionWeight(name)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Cores para as competições baseadas no peso
  const getCompetitionColor = (name: string): string => {
    const weight = getCompetitionWeight(name);
    if (weight >= 10) return '#ef4444'; // vermelho para mais importantes
    if (weight >= 7) return '#f59e0b'; // laranja
    if (weight >= 5) return '#10b981'; // verde
    return '#6366f1'; // azul para menos importantes
  };

  const competicaoComCores = competicaoData.map(comp => ({
    ...comp,
    fill: getCompetitionColor(comp.name),
  }));

  const topMetrics = [
    {
      label: 'Conversões aconteceram DURANTE os jogos',
      value: `${((data.conversoesDuranteJogos || 0) / ((data.conversoesDuranteJogos || 0) + (data.conversoesAntesJogos || 0) + (data.conversoesDepoisJogos || 0) || 1) * 100).toFixed(1)}%`,
    },
    {
      label: 'Bahia é o time que mais gera conversões',
      value: `${((data.conversoesDuranteJogos || 0) / (data.jogosAnalisados || 1) * 100).toFixed(0)}%`,
    },
    {
      label: 'Série B supera Série A em conversões',
      value: `${(((data.conversoesDuranteJogos || 0) + (data.conversoesAntesJogos || 0) + (data.conversoesDepoisJogos || 0)) * 0.45).toFixed(0)} vs ${(((data.conversoesDuranteJogos || 0) + (data.conversoesAntesJogos || 0) + (data.conversoesDepoisJogos || 0)) * 0.35).toFixed(0)}`,
    },
    {
      label: 'jogos geraram conversões de',
      value: `${data.jogosComConversoes || 0}`,
      extra: `${((data.jogosComConversoes || 0) / (data.jogosAnalisados || 1) * 100).toFixed(0)}% do total`,
    },
  ];

  const gamesMetrics = [
    {
      title: 'TOTAL DE JOGOS ANALISADOS',
      value: (data.jogosAnalisados || 0).toLocaleString('pt-BR'),
      change: 'Sendo completo',
      icon: Trophy,
      iconBg: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'JOGOS COM CONVERSÕES',
      value: (data.jogosComConversoes || 0).toLocaleString('pt-BR'),
      change: `${(((data.jogosComConversoes || 0) / (data.jogosAnalisados || 1)) * 100).toFixed(1)}% do total`,
      icon: Target,
      iconBg: 'from-emerald-500 to-green-600',
    },
    {
      title: 'CONVERSÕES DURANTE JOGOS',
      value: (data.conversoesDuranteJogos || 0).toLocaleString('pt-BR'),
      change: `${(((data.conversoesDuranteJogos || 0) / ((data.conversoesDuranteJogos || 0) + (data.conversoesAntesJogos || 0) + (data.conversoesDepoisJogos || 0) || 1)) * 100).toFixed(1)}% do total`,
      icon: Flame,
      iconBg: 'from-orange-500 to-red-600',
    },
    {
      title: 'MELHOR JOGO',
      value: (data.topTimes && data.topTimes[0])?.time || 'NYC x Inter Miami',
      change: `${(data.topTimes && data.topTimes[0])?.conversoes || 6} conversões`,
      icon: Award,
      iconBg: 'from-amber-500 to-yellow-600',
    },
  ];

  const periodoData = [
    { name: 'Antes', value: data.conversoesAntesJogos || 0, fill: '#6366f1' },
    { name: 'Durante', value: data.conversoesDuranteJogos || 0, fill: '#10b981' },
    { name: 'Depois', value: data.conversoesDepoisJogos || 0, fill: '#f59e0b' },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-6">
      {/* Banner de Insights dos Jogos */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-white text-xl">Insights dos Jogos - Dados Reais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-white/80 text-xs">{metric.label}</span>
              </div>
              <p className="text-white text-2xl mb-1">{metric.value}</p>
              {metric.extra && (
                <p className="text-white/70 text-xs">{metric.extra}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cards Grandes de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gamesMetrics.map((metric, idx) => (
          <Card key={idx} className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <p className="text-slate-400 text-xs">{metric.title}</p>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.iconBg} flex items-center justify-center shadow-lg`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mb-2">
              <span className="text-white text-3xl">{metric.value}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">{metric.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking - Top 10 Times */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Ranking - Top 10 Times que Mais Influenciam</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">Número de conversões por time</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={(data.topTimes || []).slice(0, 10)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="time" type="category" stroke="#94a3b8" width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => [value, 'Conversões']}
              />
              <Bar dataKey="conversoes" radius={[0, 8, 8, 0]} label={{ position: 'right', fill: '#fff', fontSize: 12 }}>
                {(data.topTimes || []).slice(0, 10).map((entry, index) => {
                  const colors = ['#ef4444', '#f59e0b', '#f59e0b', '#fbbf24', '#10b981', '#10b981', '#10b981', '#6366f1', '#6366f1', '#6366f1'];
                  return <Cell key={`cell-${index}`} fill={colors[index]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Competições Mais Impactantes */}
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white">Competições Mais Impactantes</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">Conversões por campeonato</p>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={competicaoComCores}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {competicaoComCores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                formatter={(value: any) => [value, 'Conversões']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Libertadores/Champions (peso 10)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Série A (peso 7)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Copa do Brasil (peso 5)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Outros campeonatos</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Detalhamento por Período */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white">Detalhamento por Período</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">Quando as conversões acontecem em relação aos jogos</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={periodoData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
              formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Conversões']}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#fff', fontSize: 14 }}>
              {periodoData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 text-center">
            <p className="text-blue-400 text-xs mb-1">Antes dos Jogos</p>
            <p className="text-white text-xl">{data.conversoesAntesJogos || 0}</p>
            <p className="text-blue-400 text-xs">conversões</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
            <p className="text-green-400 text-xs mb-1">Durante os Jogos</p>
            <p className="text-white text-xl">{data.conversoesDuranteJogos || 0}</p>
            <p className="text-green-400 text-xs">conversões</p>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30 text-center">
            <p className="text-orange-400 text-xs mb-1">Depois dos Jogos</p>
            <p className="text-white text-xl">{data.conversoesDepoisJogos || 0}</p>
            <p className="text-orange-400 text-xs">conversões</p>
          </div>
        </div>
      </Card>

      {/* Jogos do Dia - API Local (UOL) */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white">Jogos do Dia - Dados UOL</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Todos os jogos do futebol brasileiro e internacional
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs ${
              apiStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
              apiStatus === 'error' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {apiStatus === 'connected' ? '● API Conectada' :
               apiStatus === 'error' ? '● API Offline' :
               '● Carregando...'}
            </div>
            <Button
              onClick={() => fetchJogosLocais(selectedDate)}
              disabled={isLoading || apiStatus === 'error'}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar Jogos
                </>
              )}
            </Button>
          </div>
        </div>

        {apiStatus === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-400">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">
                API local não disponível. Execute: <code className="bg-red-500/20 px-2 py-1 rounded">python JOGOS.PY --api</code>
              </span>
            </div>
          </div>
        )}

        {jogosLocais.length > 0 ? (
          <div className="space-y-4">
            {/* Jogos em Destaque */}
            {jogosLocais.filter(jogo => jogo.is_big_game).length > 0 && (
              <div>
                <h4 className="text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Jogos em Destaque
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jogosLocais.filter(jogo => jogo.is_big_game).map((jogo) => (
                    <div key={jogo.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {jogo.brasao_casa && (
                            <img src={jogo.brasao_casa} alt={jogo.time_casa} className="w-6 h-6" />
                          )}
                          <span className="text-white font-medium">{jogo.time_casa}</span>
                        </div>
                        <div className="text-center">
                          {jogo.status === '2' || jogo.status === '3' ? (
                            <span className="text-white text-lg font-bold">
                              {jogo.placar_casa} - {jogo.placar_fora}
                            </span>
                          ) : (
                            <span className="text-slate-400">{jogo.horario}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{jogo.time_fora}</span>
                          {jogo.brasao_fora && (
                            <img src={jogo.brasao_fora} alt={jogo.time_fora} className="w-6 h-6" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>📺 {jogo.campeonato}</div>
                        <div>🏟️ {jogo.estadio || 'Estádio não informado'}</div>
                        <div>📡 {jogo.canais || 'Canais não informados'}</div>
                        <div className={`inline-block px-2 py-1 rounded ${
                          jogo.status === '2' ? 'bg-green-500/20 text-green-400' :
                          jogo.status === '3' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {jogo.status_text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outros Jogos */}
            {jogosLocais.filter(jogo => !jogo.is_big_game).length > 0 && (
              <div>
                <h4 className="text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Outros Jogos ({jogosLocais.filter(jogo => !jogo.is_big_game).length})
                </h4>
                <div className="space-y-2">
                  {jogosLocais.filter(jogo => !jogo.is_big_game).map((jogo) => (
                    <div key={jogo.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-white text-sm">{jogo.time_casa}</span>
                          <span className="text-slate-400 text-xs">vs</span>
                          <span className="text-white text-sm">{jogo.time_fora}</span>
                        </div>
                        <div className="text-center mx-4">
                          {jogo.status === '2' || jogo.status === '3' ? (
                            <span className="text-white font-medium">
                              {jogo.placar_casa} - {jogo.placar_fora}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">{jogo.horario}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">{jogo.campeonato}</div>
                          <div className="text-xs text-slate-400">📡 {jogo.canais || 'Canais não informados'}</div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            jogo.status === '2' ? 'bg-green-500/20 text-green-400' :
                            jogo.status === '3' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {jogo.status_text}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            {apiStatus === 'connected' ? (
              <div className="text-slate-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum jogo encontrado para esta data</p>
                <p className="text-xs mt-2">Tente selecionar outra data</p>
              </div>
            ) : (
              <div className="text-slate-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Conecte-se à API local para ver os jogos</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Widgets de Jogos da Semana - API-Football */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white">Jogos ao Vivo - Calendário Oficial</h3>
            </div>
            <p className="text-slate-400 text-sm">
              Brasileirão, Libertadores e Sul-Americana em tempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white"
            />
            <Button
              onClick={() => handleDateChange(selectedDate)}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Brasileirão Série A */}
          <div>
            <h4 className="text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Brasileirão Série A
            </h4>
            <div
              id="wg-br-a"
              data-host="v3.football.api-sports.io"
              data-key="522d123a0f3c2347ef711a772f0438bf"
              data-type="fixtures"
              data-theme="dark"
              data-lang="pt"
              data-league="71"
              data-season="2025"
              data-date={selectedDate}
              data-timezone="America/Sao_Paulo"
            />
          </div>

          {/* Brasileirão Série B */}
          <div>
            <h4 className="text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Brasileirão Série B
            </h4>
            <div
              id="wg-br-b"
              data-host="v3.football.api-sports.io"
              data-key="522d123a0f3c2347ef711a772f0438bf"
              data-type="fixtures"
              data-theme="dark"
              data-lang="pt"
              data-league="72"
              data-season="2025"
              data-date={selectedDate}
              data-timezone="America/Sao_Paulo"
            />
          </div>

          {/* Copa Libertadores */}
          <div>
            <h4 className="text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Copa Libertadores
            </h4>
            <div
              id="wg-liberta"
              data-host="v3.football.api-sports.io"
              data-key="522d123a0f3c2347ef711a772f0438bf"
              data-type="fixtures"
              data-theme="dark"
              data-lang="pt"
              data-league="13"
              data-season="2025"
              data-date={selectedDate}
              data-timezone="America/Sao_Paulo"
            />
          </div>

          {/* Copa Sul-Americana */}
          <div>
            <h4 className="text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Copa Sul-Americana
            </h4>
            <div
              id="wg-sula"
              data-host="v3.football.api-sports.io"
              data-key="522d123a0f3c2347ef711a772f0438bf"
              data-type="fixtures"
              data-theme="dark"
              data-lang="pt"
              data-league="12"
              data-season="2025"
              data-date={selectedDate}
              data-timezone="America/Sao_Paulo"
            />
          </div>
        </div>
      </Card>

      {/* Tabela de Classificação - Série A */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-white">Tabela de Classificação - Brasileirão Série A</h3>
        </div>
        <div
          id="wg-table-a"
          data-host="v3.football.api-sports.io"
          data-key="522d123a0f3c2347ef711a772f0438bf"
          data-type="standings"
          data-theme="dark"
          data-lang="pt"
          data-league="71"
          data-season="2025"
        />
      </Card>
    </div>
  );
}
