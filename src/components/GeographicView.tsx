import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { 
  MapPin, Map, Globe, TrendingUp, Users, Target, 
  AlertTriangle, Zap, Activity, Phone, XCircle, Download, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { DashboardData } from '../App';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { extractGeoFromPhone, DDD_MAP, STATE_NAMES, parseDate } from '../utils/dataProcessing';
import * as XLSX from 'xlsx';

interface Props {
  data: DashboardData;
}

// Cores modernas e vibrantes por região - conforme especificação
const REGION_COLORS: Record<string, string> = {
  'SE': '#ff4fa3',      // Rosa - Sudeste
  'S': '#29b9d6',       // Ciano - Sul
  'NE': '#f1b93b',      // Amarelo - Nordeste
  'CO': '#8b6aff',      // Lilás - Centro-Oeste
  'N': '#00c896',       // Verde - Norte
};

const REGION_NAMES_MAP: Record<string, string> = {
  'SE': 'Sudeste',
  'S': 'Sul',
  'NE': 'Nordeste',
  'CO': 'Centro-Oeste',
  'N': 'Norte',
};

interface StateMetric {
  uf: string;
  stateName: string;
  region: string;
  regionName: string;
  clients: number;
  active: number;
  expired: number;
  expiring7d: number;
  expiring15d: number;
  loyal: number;
  revenue: number;
  avgTicket: number;
  churn: number;
  ddds: Set<string>;
  percentage: number;
  retention: number;
  growth: number;
}

export function GeographicView({ data }: Props) {
  const [activeTab, setActiveTab] = useState<'mapa' | 'graficos' | 'tabelas'>('mapa');

  // Processar dados geográficos
  const geoAnalysis = useMemo(() => {
    const stateMetrics: Record<string, StateMetric> = {};
    const regionMetrics: Record<string, any> = {};
    const dddMetrics: Record<string, any> = {};
    
    let totalProcessed = 0;
    let validPhones = 0;
    let invalidPhones = 0;

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    // Processar todos os clientes
    const allClients = [
      ...(data.rawData?.ativos || []).map((c: any) => ({ ...c, status: 'Ativo' })),
      ...(data.rawData?.expirados || []).map((c: any) => ({ ...c, status: 'Expirado' })),
    ];

    allClients.forEach((client: any) => {
      totalProcessed++;
      
      const phone = client.Telefone || client.telefone || client.Usuario || client.usuario || '';
      const geo = extractGeoFromPhone(phone);

      if (!geo.isValid || !geo.uf) {
        invalidPhones++;
        return;
      }

      validPhones++;
      const { ddd, uf, regiao } = geo;

      // Inicializar métricas do estado
      if (!stateMetrics[uf!]) {
        stateMetrics[uf!] = {
          uf: uf!,
          stateName: STATE_NAMES[uf!] || uf!,
          region: regiao!,
          regionName: REGION_NAMES_MAP[regiao!] || regiao!,
          clients: 0,
          active: 0,
          expired: 0,
          expiring7d: 0,
          expiring15d: 0,
          loyal: 0,
          revenue: 0,
          avgTicket: 0,
          churn: 0,
          ddds: new Set(),
          percentage: 0,
          retention: 0,
          growth: 0,
        };
      }

      const state = stateMetrics[uf!];
      state.clients++;
      state.ddds.add(ddd!);

      // Status
      if (client.status === 'Ativo') {
        state.active++;
      } else {
        state.expired++;
      }

      // Vencimentos
      const expDate = parseDate(client.Vencimento || client.vencimento || client.Data_Vencimento);
      if (expDate) {
        if (expDate >= now && expDate <= in7Days) {
          state.expiring7d++;
        }
        if (expDate >= now && expDate <= in15Days) {
          state.expiring15d++;
        }
      }

      // Receita
      const planoValue = parseFloat(client.Plano || client.plano || '0');
      let valor = 0;
      if (planoValue === 1) valor = 32.50;
      else if (planoValue >= 1.5 && planoValue <= 2) valor = 55;
      else if (planoValue === 3) valor = 87.50;
      else if (planoValue === 6) valor = 165;
      else if (planoValue === 12) valor = 290;
      
      state.revenue += valor;

      // Métricas de DDD
      if (ddd) {
        if (!dddMetrics[ddd]) {
          dddMetrics[ddd] = {
            ddd,
            uf: uf!,
            region: regiao!,
            clients: 0,
            active: 0,
            expired: 0,
            expiring7d: 0,
            expiring15d: 0,
          };
        }
        dddMetrics[ddd].clients++;
        if (client.status === 'Ativo') dddMetrics[ddd].active++;
        else dddMetrics[ddd].expired++;
        
        if (expDate) {
          if (expDate >= now && expDate <= in7Days) dddMetrics[ddd].expiring7d++;
          if (expDate >= now && expDate <= in15Days) dddMetrics[ddd].expiring15d++;
        }
      }
    });

    // Calcular métricas derivadas por estado
    Object.values(stateMetrics).forEach(state => {
      state.avgTicket = state.clients > 0 ? state.revenue / state.clients : 0;
      state.percentage = validPhones > 0 ? (state.clients / validPhones) * 100 : 0;
      state.churn = state.clients > 0 ? (state.expired / state.clients) * 100 : 0;
      state.retention = state.clients > 0 ? (state.active / state.clients) * 100 : 0;
      state.growth = state.active - state.expired; // Crescimento líquido
      
      // Clientes fiéis (2+ renovações)
      const renewals = (data.rawData?.renovacoes || []).filter((r: any) => {
        const phone = r.Usuario || r.usuario || r.Telefone || r.telefone;
        const geo = extractGeoFromPhone(phone);
        return geo.uf === state.uf;
      });
      
      const renewalCounts: Record<string, number> = {};
      renewals.forEach((r: any) => {
        const phone = r.Usuario || r.usuario;
        if (phone) {
          renewalCounts[phone] = (renewalCounts[phone] || 0) + 1;
        }
      });
      
      state.loyal = Object.values(renewalCounts).filter(count => count >= 2).length;

      // Agregar por região
      if (!regionMetrics[state.region]) {
        regionMetrics[state.region] = {
          region: state.region,
          regionName: state.regionName,
          clients: 0,
          active: 0,
          expired: 0,
          revenue: 0,
          retention: 0,
          growth: 0,
          fidelity: 0,
          churn: 0,
          ddds: new Set(),
        };
      }
      
      const reg = regionMetrics[state.region];
      reg.clients += state.clients;
      reg.active += state.active;
      reg.expired += state.expired;
      reg.revenue += state.revenue;
      state.ddds.forEach(ddd => reg.ddds.add(ddd));
    });

    // Calcular métricas regionais
    Object.values(regionMetrics).forEach(reg => {
      reg.retention = reg.clients > 0 ? (reg.active / reg.clients) * 100 : 0;
      reg.growth = ((reg.active - reg.expired) / reg.clients) * 100;
      reg.churn = reg.clients > 0 ? (reg.expired / reg.clients) * 100 : 0;
      
      // Fidelidade regional
      const statesInRegion = Object.values(stateMetrics).filter(s => s.region === reg.region);
      const totalLoyal = statesInRegion.reduce((sum, s) => sum + s.loyal, 0);
      reg.fidelity = reg.clients > 0 ? (totalLoyal / reg.clients) * 100 : 0;
    });

    // Arrays ordenados
    const statesArray = Object.values(stateMetrics).sort((a, b) => b.clients - a.clients);
    const regionsArray = Object.values(regionMetrics).sort((a, b) => b.clients - a.clients);
    const dddsArray = Object.values(dddMetrics).sort((a, b) => b.clients - a.clients);

    // KPIs
    const statesCovered = statesArray.length;
    const nationalCoverage = (statesCovered / 27) * 100;
    const topState = statesArray[0];
    const top5States = statesArray.slice(0, 5);
    const top5Concentration = top5States.reduce((sum, s) => sum + s.percentage, 0);
    const activeDDDs = dddsArray.length;

    // Insights automáticos
    const insights: Array<{ icon: any; text: string; color: string }> = [];
    
    if (topState) {
      insights.push({
        icon: Zap,
        text: `${topState.stateName} concentra ${topState.percentage.toFixed(1)}% da base total.`,
        color: 'text-yellow-400'
      });
    }

    const topRegion = regionsArray[0];
    if (topRegion) {
      insights.push({
        icon: TrendingUp,
        text: `${topRegion.regionName} representa ${((topRegion.clients / validPhones) * 100).toFixed(1)}% da base nacional.`,
        color: 'text-green-400'
      });
    }

    // Região com maior crescimento
    const growingRegion = regionsArray.find(r => r.growth > 5);
    if (growingRegion) {
      insights.push({
        icon: Activity,
        text: `Região ${growingRegion.regionName} cresceu ${growingRegion.growth.toFixed(0)}% no mês.`,
        color: 'text-cyan-400'
      });
    }

    if (invalidPhones > 0) {
      insights.push({
        icon: AlertTriangle,
        text: `${invalidPhones} números inválidos detectados e ignorados.`,
        color: 'text-orange-400'
      });
    }

    return {
      stateMetrics: statesArray,
      regionMetrics: regionsArray,
      dddMetrics: dddsArray,
      totalProcessed,
      validPhones,
      invalidPhones,
      statesCovered,
      nationalCoverage,
      topState,
      top5Concentration,
      activeDDDs,
      insights,
    };
  }, [data]);

  // Preparar dados para visualizações
  const top10States = geoAnalysis.stateMetrics.slice(0, 10);

  const regionPieData = geoAnalysis.regionMetrics.map(r => ({
    name: r.regionName,
    value: r.clients,
    percentage: ((r.clients / geoAnalysis.validPhones) * 100).toFixed(1),
    fill: REGION_COLORS[r.region] || '#888',
  }));

  const radarData = geoAnalysis.regionMetrics.map(r => ({
    region: r.regionName,
    'Receita': Math.round(r.revenue / 1000), // Em milhares
    'Retenção': Math.round(r.retention),
    'Crescimento': Math.round(Math.abs(r.growth)),
    'Fidelização': Math.round(r.fidelity),
    'Churn': Math.round(r.churn),
  }));

  const top10DDDs = geoAnalysis.dddMetrics.slice(0, 10);

  // Exportar Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Aba: Ranking UF
    const statesData = geoAnalysis.stateMetrics.map(s => ({
      'UF': s.uf,
      'Estado': s.stateName,
      'Região': s.regionName,
      'Total': s.clients,
      '%': s.percentage.toFixed(2),
      'Ativos': s.active,
      'Expirados': s.expired,
      'Vencem 7d': s.expiring7d,
      'Vencem 15d': s.expiring15d,
      'Fiéis': s.loyal,
      'Receita': s.revenue.toFixed(2),
      'Ticket Médio': s.avgTicket.toFixed(2),
      'Churn %': s.churn.toFixed(2),
      'DDDs': s.ddds.size,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(statesData), 'Ranking UF');

    // Aba: Por Região
    const regionsData = geoAnalysis.regionMetrics.map(r => ({
      'Região': r.regionName,
      'Total': r.clients,
      '%': ((r.clients / geoAnalysis.validPhones) * 100).toFixed(2),
      'Ativos': r.active,
      'Expirados': r.expired,
      'Receita': r.revenue.toFixed(2),
      'Retenção %': r.retention.toFixed(2),
      'Crescimento %': r.growth.toFixed(2),
      'Fidelização %': r.fidelity.toFixed(2),
      'Churn %': r.churn.toFixed(2),
      'DDDs': r.ddds.size,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(regionsData), 'Por Região');

    // Aba: DDDs
    const dddsData = geoAnalysis.dddMetrics.map(d => ({
      'DDD': d.ddd,
      'UF': d.uf,
      'Região': REGION_NAMES_MAP[d.region] || d.region,
      'Total': d.clients,
      'Ativos': d.active,
      'Expirados': d.expired,
      'Vencem 7d': d.expiring7d,
      'Vencem 15d': d.expiring15d,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dddsData), 'DDDs');

    XLSX.writeFile(wb, `analise_geografica_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6 bg-[#0f141a] border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Estados Cobertos</p>
              <p className="text-3xl mt-2 text-[#e5e5e5]">
                {geoAnalysis.statesCovered}<span className="text-xl text-gray-500">/27</span>
              </p>
              <p className="text-sm text-[#00c896] mt-1">
                {geoAnalysis.nationalCoverage.toFixed(1)}% cobertura
              </p>
            </div>
            <Map className="w-12 h-12 text-[#00c896]" />
          </div>
        </Card>

        <Card className="p-6 bg-[#0f141a] border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Estado Líder</p>
              <p className="text-2xl mt-2 text-[#e5e5e5]">
                {geoAnalysis.topState?.uf || '-'}
              </p>
              <p className="text-sm text-[#29b9d6] mt-1">
                {geoAnalysis.topState?.clients || 0} ({geoAnalysis.topState?.percentage.toFixed(1)}%)
              </p>
            </div>
            <Target className="w-12 h-12 text-[#29b9d6]" />
          </div>
        </Card>

        <Card className="p-6 bg-[#0f141a] border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">DDDs Ativos</p>
              <p className="text-3xl mt-2 text-[#e5e5e5]">
                {geoAnalysis.activeDDDs}
              </p>
              <p className="text-sm text-[#8b6aff] mt-1">
                Top-5 = {geoAnalysis.top5Concentration.toFixed(0)}%
              </p>
            </div>
            <Phone className="w-12 h-12 text-[#8b6aff]" />
          </div>
        </Card>

        <Card className="p-6 bg-[#0f141a] border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Telefones Processados</p>
              <p className="text-3xl mt-2 text-[#e5e5e5]">
                {geoAnalysis.validPhones}
              </p>
              <p className="text-sm text-[#f1b93b] mt-1">
                {geoAnalysis.invalidPhones} inválidos
              </p>
            </div>
            <Activity className="w-12 h-12 text-[#f1b93b]" />
          </div>
        </Card>

        <Card className="p-6 bg-[#0f141a] border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Região Líder</p>
              <p className="text-2xl mt-2 text-[#e5e5e5]">
                {geoAnalysis.regionMetrics[0]?.regionName || '-'}
              </p>
              <p className="text-sm text-[#ff4fa3] mt-1">
                {((geoAnalysis.regionMetrics[0]?.clients / geoAnalysis.validPhones) * 100).toFixed(1)}% da base
              </p>
            </div>
            <Globe className="w-12 h-12 text-[#ff4fa3]" />
          </div>
        </Card>
      </div>

      {/* Estatísticas de Processamento */}
      <Card className="p-6 bg-[#0f141a] border-gray-800">
        <h3 className="text-lg mb-4 text-[#e5e5e5] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#29b9d6]" />
          Estatísticas de Processamento
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-[#1a2028] border border-gray-800">
            <p className="text-xs text-gray-400 mb-1">Total Processado</p>
            <p className="text-2xl text-[#e5e5e5]">{geoAnalysis.totalProcessed}</p>
            <p className="text-xs text-gray-500 mt-1">registros no Excel</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a2028] border border-gray-800">
            <p className="text-xs text-gray-400 mb-1">Telefones Válidos</p>
            <p className="text-2xl text-[#00c896]">{geoAnalysis.validPhones}</p>
            <p className="text-xs text-[#00c896] mt-1">
              {((geoAnalysis.validPhones / geoAnalysis.totalProcessed) * 100).toFixed(1)}% da base
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a2028] border border-gray-800">
            <p className="text-xs text-gray-400 mb-1">DDDs Diferentes</p>
            <p className="text-2xl text-[#8b6aff]">{geoAnalysis.activeDDDs}</p>
            <p className="text-xs text-gray-500 mt-1">códigos únicos</p>
          </div>
          <div className="p-3 rounded-lg bg-[#1a2028] border border-gray-800">
            <p className="text-xs text-gray-400 mb-1">Telefones Inválidos</p>
            <p className="text-2xl text-[#f1b93b]">{geoAnalysis.invalidPhones}</p>
            <p className="text-xs text-[#f1b93b] mt-1">
              {((geoAnalysis.invalidPhones / geoAnalysis.totalProcessed) * 100).toFixed(1)}% rejeitados
            </p>
          </div>
        </div>
      </Card>

      {/* Insights Automáticos */}
      {geoAnalysis.insights.length > 0 && (
        <Card className="p-6 bg-[#0f141a] border-gray-800">
          <h3 className="text-lg mb-4 text-[#e5e5e5] flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Insights Automáticos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {geoAnalysis.insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-[#1a2028] border border-gray-800"
                >
                  <Icon className={`w-5 h-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                  <p className="text-sm text-[#e5e5e5]">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-[#0f141a] border border-gray-800">
            <TabsTrigger value="mapa" className="data-[state=active]:bg-[#1a2028] data-[state=active]:text-[#e5e5e5]">
              <Map className="w-4 h-4 mr-2" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="graficos" className="data-[state=active]:bg-[#1a2028] data-[state=active]:text-[#e5e5e5]">
              <BarChart3 className="w-4 h-4 mr-2" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="tabelas" className="data-[state=active]:bg-[#1a2028] data-[state=active]:text-[#e5e5e5]">
              <Users className="w-4 h-4 mr-2" />
              Tabelas
            </TabsTrigger>
          </TabsList>

          <Button 
            onClick={exportToExcel} 
            className="gap-2 bg-[#00c896] hover:bg-[#00b586] text-white border-0"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Aba: Mapa */}
        <TabsContent value="mapa" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mapa Choropleth */}
            <Card className="p-6 bg-[#0f141a] border-gray-800">
              <h3 className="flex items-center gap-2 mb-4 text-[#e5e5e5]">
                <Map className="w-5 h-5 text-[#00c896]" />
                Distribuição por Estado
              </h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {geoAnalysis.stateMetrics.map(state => {
                  const intensity = state.percentage / 100;
                  const baseColor = REGION_COLORS[state.region] || '#888';
                  
                  return (
                    <div
                      key={state.uf}
                      className="p-3 rounded-lg border border-gray-800 hover:border-gray-600 transition-all cursor-pointer"
                      style={{
                        backgroundColor: `${baseColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                      }}
                    >
                      <div className="font-mono text-[#e5e5e5]">{state.uf}</div>
                      <div className="text-gray-300">{state.clients}</div>
                      <div className="text-gray-400">{state.percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Pizza por Região */}
            <Card className="p-6 bg-[#0f141a] border-gray-800">
              <h3 className="flex items-center gap-2 mb-4 text-[#e5e5e5]">
                <Globe className="w-5 h-5 text-[#ff4fa3]" />
                Distribuição por Região
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={regionPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.percentage}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {regionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f141a', 
                      border: '1px solid #374151',
                      color: '#e5e5e5'
                    }}
                    formatter={(value: any) => [value, 'Clientes']}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legenda personalizada */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {geoAnalysis.regionMetrics.map(reg => (
                  <div key={reg.region} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: REGION_COLORS[reg.region] }}
                    />
                    <span className="text-sm text-[#e5e5e5]">
                      {reg.regionName}: {reg.clients}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Aba: Gráficos */}
        <TabsContent value="graficos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Estados */}
            <Card className="p-6 bg-[#0f141a] border-gray-800">
              <h3 className="flex items-center gap-2 mb-4 text-[#e5e5e5]">
                <TrendingUp className="w-5 h-5 text-[#00c896]" />
                Top 10 Estados
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={top10States} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="uf" type="category" stroke="#9ca3af" width={40} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f141a', 
                      border: '1px solid #374151',
                      color: '#e5e5e5'
                    }}
                    formatter={(value: any) => [value, 'Clientes']}
                  />
                  <Bar dataKey="clients" radius={[0, 4, 4, 0]} label={{ fill: '#e5e5e5', position: 'right' }}>
                    {top10States.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={REGION_COLORS[entry.region] || '#888'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Radar Performance */}
            <Card className="p-6 bg-[#0f141a] border-gray-800">
              <h3 className="flex items-center gap-2 mb-4 text-[#e5e5e5]">
                <Activity className="w-5 h-5 text-[#8b6aff]" />
                Performance por Região
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="region" stroke="#9ca3af" />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  <Radar name="Receita" dataKey="Receita" stroke="#00c896" fill="#00c896" fillOpacity={0.3} />
                  <Radar name="Retenção" dataKey="Retenção" stroke="#29b9d6" fill="#29b9d6" fillOpacity={0.3} />
                  <Radar name="Fidelização" dataKey="Fidelização" stroke="#ff4fa3" fill="#ff4fa3" fillOpacity={0.3} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f141a', 
                      border: '1px solid #374151',
                      color: '#e5e5e5'
                    }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Top DDDs */}
          <Card className="p-6 bg-[#0f141a] border-gray-800">
            <h3 className="flex items-center gap-2 mb-4 text-[#e5e5e5]">
              <Phone className="w-5 h-5 text-[#f1b93b]" />
              Top 10 DDDs por Status
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">DDD</TableHead>
                    <TableHead className="text-gray-400">UF</TableHead>
                    <TableHead className="text-right text-gray-400">Total</TableHead>
                    <TableHead className="text-right text-gray-400">Ativos</TableHead>
                    <TableHead className="text-right text-gray-400">Expirados</TableHead>
                    <TableHead className="text-right text-gray-400">Vencem 7d</TableHead>
                    <TableHead className="text-right text-gray-400">Vencem 15d</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top10DDDs.map((ddd) => (
                    <TableRow key={ddd.ddd} className="border-gray-800">
                      <TableCell className="font-mono text-[#e5e5e5]">({ddd.ddd})</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="border-gray-700 text-[#e5e5e5]"
                        >
                          {ddd.uf}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[#e5e5e5]">{ddd.clients}</TableCell>
                      <TableCell className="text-right text-[#00c896]">{ddd.active}</TableCell>
                      <TableCell className="text-right text-[#ef4444]">{ddd.expired}</TableCell>
                      <TableCell className="text-right text-[#f1b93b]">{ddd.expiring7d}</TableCell>
                      <TableCell className="text-right text-[#ff4fa3]">{ddd.expiring15d}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 w-full">
                          <div
                            className="h-2 bg-[#00c896] rounded"
                            style={{ width: `${(ddd.active / ddd.clients) * 100}%` }}
                          />
                          <div
                            className="h-2 bg-[#ef4444] rounded"
                            style={{ width: `${(ddd.expired / ddd.clients) * 100}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Aba: Tabelas */}
        <TabsContent value="tabelas" className="space-y-6">
          <Card className="p-6 bg-[#0f141a] border-gray-800">
            <h3 className="flex items-center gap-2 mb-4 text-[#e5e5e5]">
              <Users className="w-5 h-5 text-[#00c896]" />
              Ranking Completo por Estado
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">UF</TableHead>
                    <TableHead className="text-gray-400">Estado</TableHead>
                    <TableHead className="text-gray-400">Região</TableHead>
                    <TableHead className="text-right text-gray-400">Total</TableHead>
                    <TableHead className="text-right text-gray-400">%</TableHead>
                    <TableHead className="text-gray-400">Distribuição</TableHead>
                    <TableHead className="text-right text-gray-400">Vencem 7d</TableHead>
                    <TableHead className="text-right text-gray-400">Vencem 15d</TableHead>
                    <TableHead className="text-right text-gray-400">Fiéis</TableHead>
                    <TableHead className="text-right text-gray-400">Churn %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {geoAnalysis.stateMetrics.map((state) => (
                    <TableRow key={state.uf} className="border-gray-800">
                      <TableCell className="font-mono text-[#e5e5e5]">{state.uf}</TableCell>
                      <TableCell className="text-[#e5e5e5]">{state.stateName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-gray-700"
                          style={{
                            backgroundColor: `${REGION_COLORS[state.region]}20`,
                            borderColor: REGION_COLORS[state.region],
                            color: REGION_COLORS[state.region],
                          }}
                        >
                          {state.regionName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[#e5e5e5]">{state.clients}</TableCell>
                      <TableCell className="text-right text-[#e5e5e5]">{state.percentage.toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="flex gap-1 w-24">
                          <div
                            className="h-2 bg-[#00c896] rounded"
                            style={{ width: `${(state.active / state.clients) * 100}%` }}
                            title={`Ativos: ${state.active}`}
                          />
                          <div
                            className="h-2 bg-[#ef4444] rounded"
                            style={{ width: `${(state.expired / state.clients) * 100}%` }}
                            title={`Expirados: ${state.expired}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {state.expiring7d > 0 && (
                          <Badge variant="outline" className="bg-[#f1b93b]/10 text-[#f1b93b] border-[#f1b93b]/20">
                            {state.expiring7d}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {state.expiring15d > 0 && (
                          <Badge variant="outline" className="bg-[#ff4fa3]/10 text-[#ff4fa3] border-[#ff4fa3]/20">
                            {state.expiring15d}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-[#e5e5e5]">{state.loyal}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            state.churn > 50
                              ? 'text-[#ef4444]'
                              : state.churn > 30
                              ? 'text-[#f1b93b]'
                              : 'text-[#00c896]'
                          }
                        >
                          {state.churn.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Telefones Inválidos */}
          {geoAnalysis.invalidPhones > 0 && (
            <Card className="p-6 bg-[#0f141a] border-gray-800">
              <h3 className="flex items-center gap-2 mb-4 text-[#e5e5e5]">
                <XCircle className="w-5 h-5 text-[#ef4444]" />
                Telefones Inválidos ({geoAnalysis.invalidPhones})
              </h3>
              <div className="bg-[#f1b93b]/10 border border-[#f1b93b]/20 rounded-lg p-4">
                <p className="text-sm text-[#f1b93b]">
                  ⚠️ {geoAnalysis.invalidPhones} telefones não puderam ser processados. 
                  Verifique se estão no formato correto com DDD válido (11-99).
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
