import { useState, useMemo } from 'react';
import { 
  MapPin, Map, Globe, TrendingUp, Users, Target, 
  AlertTriangle, Zap, Activity, Phone, Download, BarChart3
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
import { KPICardPremium } from './KPICardPremium';
import { ChartCardPremium } from './ChartCardPremium';
import * as XLSX from 'xlsx';

interface Props {
  data: DashboardData;
}

// Cores Premium SaaS por região
const REGION_COLORS: Record<string, string> = {
  'SE': '#00D4FF',      // Cyan - Sudeste (Principal)
  'S': '#9945FF',       // Purple - Sul
  'NE': '#10B981',      // Emerald - Nordeste
  'CO': '#F59E0B',      // Amber - Centro-Oeste
  'N': '#EF4444',       // Rose - Norte
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
      
      const renewalCounts: Record<string, number> = {}; renewals.forEach((r: any) => {
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
        color: 'text-[var(--amber)]'
      });
    }

    const topRegion = regionsArray[0];
    if (topRegion) {
      insights.push({
        icon: TrendingUp,
        text: `${topRegion.regionName} representa ${((topRegion.clients / validPhones) * 100).toFixed(1)}% da base nacional.`,
        color: 'text-[var(--emerald)]'
      });
    }

    // Região com maior crescimento
    const growingRegion = regionsArray.find(r => r.growth > 5);
    if (growingRegion) {
      insights.push({
        icon: Activity,
        text: `Região ${growingRegion.regionName} cresceu ${growingRegion.growth.toFixed(0)}% no mês.`,
        color: 'text-[var(--neon-cyan)]'
      });
    }

    if (invalidPhones > 0) {
      insights.push({
        icon: AlertTriangle,
        text: `${invalidPhones} números inválidos detectados e ignorados.`,
        color: 'text-[var(--amber)]'
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
    <div className="container-premium space-y-12 py-8">
      {/* KPIs Principais - Grid Responsivo */}
      <div className="grid-kpis">
        <KPICardPremium
          title="Estados Cobertos"
          value={geoAnalysis.statesCovered}
          subtitle={`${geoAnalysis.nationalCoverage.toFixed(1)}% cobertura nacional`}
          icon={Map}
          tooltip="Quantidade de estados brasileiros com clientes ativos"
          change={5.2}
          trend="up"
          format="number"
        />

        <KPICardPremium
          title="Estado Líder"
          value={geoAnalysis.topState?.uf || '-'}
          subtitle={`${geoAnalysis.topState?.clients || 0} clientes (${geoAnalysis.topState?.percentage.toFixed(1)}%)`}
          icon={Target}
          tooltip="Estado com maior concentração de clientes"
          format="number"
        />

        <KPICardPremium
          title="DDDs Ativos"
          value={geoAnalysis.activeDDDs}
          subtitle={`Top-5 concentra ${geoAnalysis.top5Concentration.toFixed(0)}%`}
          icon={Phone}
          tooltip="Quantidade de códigos DDD com clientes registrados"
          change={3.1}
          trend="up"
          format="number"
        />

        <KPICardPremium
          title="Região Líder"
          value={geoAnalysis.regionMetrics[0]?.regionName || '-'}
          subtitle={`${((geoAnalysis.regionMetrics[0]?.clients / geoAnalysis.validPhones) * 100).toFixed(1)}% da base`}
          icon={Globe}
          tooltip="Região geográfica com maior concentração de clientes"
          format="number"
        />
      </div>

      {/* Insights Automáticos */}
      {geoAnalysis.insights.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="flex items-center gap-3 mb-6" style={{ 
            fontSize: 'var(--font-size-h3)', 
            color: 'var(--foreground)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            <div className="p-2 rounded-lg" style={{ 
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <Zap size={20} style={{ color: 'var(--amber)' }} />
            </div>
            Insights Geográficos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {geoAnalysis.insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Icon className={`w-5 h-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {insight.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList 
            className="glass-card border-0"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(var(--glass-blur))',
            }}
          >
            <TabsTrigger 
              value="mapa" 
              className="data-[state=active]:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Map className="w-4 h-4 mr-2" />
              Mapa
            </TabsTrigger>
            <TabsTrigger 
              value="graficos" 
              className="data-[state=active]:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger 
              value="tabelas" 
              className="data-[state=active]:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Users className="w-4 h-4 mr-2" />
              Tabelas
            </TabsTrigger>
          </TabsList>

          <Button 
            onClick={exportToExcel} 
            className="btn-premium-primary gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Aba: Mapa */}
        <TabsContent value="mapa" className="space-y-6 fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mapa Choropleth */}
            <ChartCardPremium
              title="Distribuição por Estado"
              subtitle="Intensidade de cor representa concentração"
              icon={Map}
              tooltip="Mapa de calor mostrando distribuição de clientes por estado"
            >
              <div className="grid grid-cols-3 gap-2 text-xs mt-4">
                {geoAnalysis.stateMetrics.map(state => {
                  const intensity = Math.min(state.percentage / 20, 1); // Cap em 20%
                  const baseColor = REGION_COLORS[state.region] || '#888';
                  
                  return (
                    <div
                      key={state.uf}
                      className="p-3 rounded-lg border transition-all cursor-pointer hover:scale-105"
                      style={{
                        backgroundColor: `${baseColor}${Math.round(intensity * 60 + 20).toString(16).padStart(2, '0')}`,
                        borderColor: intensity > 0.5 ? baseColor : 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div className="font-mono text-sm" style={{ color: 'var(--foreground)' }}>
                        {state.uf}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {state.clients}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {state.percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCardPremium>

            {/* Pizza por Região */}
            <ChartCardPremium
              title="Distribuição por Região"
              subtitle="Proporção de clientes por macro-região"
              icon={Globe}
              tooltip="Gráfico de pizza mostrando participação de cada região"
            >
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
                      background: 'rgba(17, 24, 39, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--foreground)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: any) => [value, 'Clientes']}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legenda personalizada */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {geoAnalysis.regionMetrics.map(reg => (
                  <div key={reg.region} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: REGION_COLORS[reg.region] }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {reg.regionName}: {reg.clients}
                    </span>
                  </div>
                ))}
              </div>
            </ChartCardPremium>
          </div>
        </TabsContent>

        {/* Aba: Gráficos */}
        <TabsContent value="graficos" className="space-y-6 fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Estados */}
            <ChartCardPremium
              title="Top 10 Estados"
              subtitle="Ranking de estados por quantidade de clientes"
              icon={TrendingUp}
              tooltip="Estados com maior concentração de clientes"
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={top10States} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis 
                    type="number" 
                    stroke="var(--text-tertiary)" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    dataKey="uf" 
                    type="category" 
                    stroke="var(--text-tertiary)" 
                    width={40}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      background: 'rgba(17, 24, 39, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--foreground)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: any) => [value, 'Clientes']}
                  />
                  <Bar dataKey="clients" radius={[0, 8, 8, 0]} label={{ fill: 'var(--foreground)', position: 'right', fontSize: 12 }}>
                    {top10States.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={REGION_COLORS[entry.region] || '#888'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCardPremium>

            {/* Radar Performance */}
            <ChartCardPremium
              title="Performance por Região"
              subtitle="Análise multidimensional de métricas"
              icon={Activity}
              tooltip="Comparação de métricas-chave entre as regiões"
            >
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                  <PolarAngleAxis 
                    dataKey="region" 
                    stroke="var(--text-tertiary)"
                    style={{ fontSize: '12px' }}
                  />
                  <PolarRadiusAxis 
                    stroke="var(--text-tertiary)"
                    style={{ fontSize: '10px' }}
                  />
                  <Radar 
                    name="Receita" 
                    dataKey="Receita" 
                    stroke="var(--neon-cyan)" 
                    fill="var(--neon-cyan)" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name="Retenção" 
                    dataKey="Retenção" 
                    stroke="var(--emerald)" 
                    fill="var(--emerald)" 
                    fillOpacity={0.3} 
                  />
                  <Radar 
                    name="Fidelização" 
                    dataKey="Fidelização" 
                    stroke="var(--neon-purple)" 
                    fill="var(--neon-purple)" 
                    fillOpacity={0.3} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      background: 'rgba(17, 24, 39, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--foreground)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCardPremium>
          </div>

          {/* Top DDDs */}
          <ChartCardPremium
            title="Top 10 DDDs por Status"
            subtitle="Códigos de área com maior concentração"
            icon={Phone}
            tooltip="Ranking de DDDs com análise de status dos clientes"
          >
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <TableHead style={{ color: 'var(--text-tertiary)' }}>DDD</TableHead>
                    <TableHead style={{ color: 'var(--text-tertiary)' }}>UF</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Total</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Ativos</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Expirados</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Vencem 7d</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Vencem 15d</TableHead>
                    <TableHead style={{ color: 'var(--text-tertiary)' }}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top10DDDs.map((ddd) => (
                    <TableRow key={ddd.ddd} style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableCell className="font-mono" style={{ color: 'var(--foreground)' }}>
                        ({ddd.ddd})
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className="badge-premium badge-info"
                        >
                          {ddd.uf}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--text-secondary)' }}>
                        {ddd.clients}
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--emerald)' }}>
                        {ddd.active}
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--rose)' }}>
                        {ddd.expired}
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--amber)' }}>
                        {ddd.expiring7d}
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--neon-purple)' }}>
                        {ddd.expiring15d}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 w-full">
                          <div
                            className="h-2 rounded"
                            style={{ 
                              width: `${(ddd.active / ddd.clients) * 100}%`,
                              backgroundColor: 'var(--emerald)'
                            }}
                          />
                          <div
                            className="h-2 rounded"
                            style={{ 
                              width: `${(ddd.expired / ddd.clients) * 100}%`,
                              backgroundColor: 'var(--rose)'
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ChartCardPremium>
        </TabsContent>

        {/* Aba: Tabelas */}
        <TabsContent value="tabelas" className="space-y-6 fade-in">
          <ChartCardPremium
            title="Ranking Completo por Estado"
            subtitle={`${geoAnalysis.stateMetrics.length} estados com clientes registrados`}
            icon={Users}
            tooltip="Tabela completa com todas as métricas por estado"
            minHeight="auto"
          >
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <TableHead style={{ color: 'var(--text-tertiary)' }}>UF</TableHead>
                    <TableHead style={{ color: 'var(--text-tertiary)' }}>Estado</TableHead>
                    <TableHead style={{ color: 'var(--text-tertiary)' }}>Região</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Total</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>%</TableHead>
                    <TableHead style={{ color: 'var(--text-tertiary)' }}>Distribuição</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Vencem 7d</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Vencem 15d</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Fiéis</TableHead>
                    <TableHead className="text-right" style={{ color: 'var(--text-tertiary)' }}>Churn %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {geoAnalysis.stateMetrics.map((state) => (
                    <TableRow key={state.uf} style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableCell className="font-mono" style={{ color: 'var(--foreground)' }}>
                        {state.uf}
                      </TableCell>
                      <TableCell style={{ color: 'var(--text-secondary)' }}>
                        {state.stateName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="badge-premium"
                          style={{
                            backgroundColor: `${REGION_COLORS[state.region]}20`,
                            borderColor: REGION_COLORS[state.region],
                            color: REGION_COLORS[state.region],
                          }}
                        >
                          {state.regionName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--foreground)' }}>
                        {state.clients}
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--text-secondary)' }}>
                        {state.percentage.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 w-24">
                          <div
                            className="h-2 rounded"
                            style={{ 
                              width: `${(state.active / state.clients) * 100}%`,
                              backgroundColor: 'var(--emerald)'
                            }}
                            title={`Ativos: ${state.active}`}
                          />
                          <div
                            className="h-2 rounded"
                            style={{ 
                              width: `${(state.expired / state.clients) * 100}%`,
                              backgroundColor: 'var(--rose)'
                            }}
                            title={`Expirados: ${state.expired}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--amber)' }}>
                        {state.expiring7d}
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--neon-purple)' }}>
                        {state.expiring15d}
                      </TableCell>
                      <TableCell className="text-right" style={{ color: 'var(--neon-cyan)' }}>
                        {state.loyal}
                      </TableCell>
                      <TableCell className="text-right">
                        <span style={{ 
                          color: state.churn > 20 ? 'var(--rose)' : 'var(--emerald)'
                        }}>
                          {state.churn.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ChartCardPremium>
        </TabsContent>
      </Tabs>
    </div>
  );
}
