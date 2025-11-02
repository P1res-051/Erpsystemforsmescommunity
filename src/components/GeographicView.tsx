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
import { ImageWithFallback } from './figma/ImageWithFallback';
import * as XLSX from 'xlsx';

interface Props {
  data: DashboardData;
}

// Mapa de bandeiras dos 26 estados + DF
const BANDEIRAS_BR: Record<string, { nome: string; url: string }> = {
  AC: {
    nome: "Acre",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-acre-reta.jpg"
  },
  AL: {
    nome: "Alagoas",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-alagoas-reta.jpg"
  },
  AM: {
    nome: "Amazonas",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-amazonas-reta.jpg"
  },
  AP: {
    nome: "Amapá",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-amapa-reta.jpg"
  },
  BA: {
    nome: "Bahia",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-bahia-reta.jpg"
  },
  CE: {
    nome: "Ceará",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-ceara-reta.jpg"
  },
  DF: {
    nome: "Distrito Federal",
    // OBS: para o DF o site não usa o prefixo "estado"
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-distrito-federal-reta.jpg"
  },
  ES: {
    nome: "Espírito Santo",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-espirito-santo-reta.jpg"
  },
  GO: {
    nome: "Goiás",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-goias-reta.jpg"
  },
  MA: {
    nome: "Maranhão",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-maranhao-reta.jpg"
  },
  MG: {
    nome: "Minas Gerais",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-minas-gerais-reta.jpg"
  },
  MS: {
    nome: "Mato Grosso do Sul",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-mato-grosso-do-sul-reta.jpg"
  },
  MT: {
    nome: "Mato Grosso",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-mato-grosso-reta.jpg"
  },
  PA: {
    nome: "Pará",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-para-reta.jpg"
  },
  PB: {
    nome: "Paraíba",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-paraiba-reta.jpg"
  },
  PE: {
    nome: "Pernambuco",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-pernambuco-reta.jpg"
  },
  PI: {
    nome: "Piauí",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-piaui-reta.jpg"
  },
  PR: {
    nome: "Paraná",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-parana-reta.jpg"
  },
  RJ: {
    nome: "Rio de Janeiro",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-rio-de-janeiro-reta.jpg"
  },
  RN: {
    nome: "Rio Grande do Norte",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-rio-grande-do-norte-reta.jpg"
  },
  RO: {
    nome: "Rondônia",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-rondonia-reta.jpg"
  },
  RR: {
    nome: "Roraima",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-roraima-reta.jpg"
  },
  RS: {
    nome: "Rio Grande do Sul",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-rio-grande-do-sul-reta.jpg"
  },
  SC: {
    nome: "Santa Catarina",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-santa-catarina-reta.jpg"
  },
  SE: {
    nome: "Sergipe",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-sergipe-reta.jpg"
  },
  SP: {
    nome: "São Paulo",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-sao-paulo-reta.jpg"
  },
  TO: {
    nome: "Tocantins",
    url: "https://www.bandeira1.com.br/lojas/00002028/prod/estados/bandeira-estado-tocantins-reta.jpg"
  }
};

// Cores modernas e vibrantes por região - conforme especificação
const REGION_COLORS: Record<string, string> = {
  'SE': '#E91E63',      // Rosa - Sudeste
  'NE': '#F59E0B',      // Amarelo - Nordeste
  'S': '#00D4FF',       // Ciano - Sul
  'CO': '#8B5CF6',      // Lilás - Centro-Oeste
  'N': '#10B981',       // Verde - Norte
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
  const [selectedMetric, setSelectedMetric] = useState<'Retenção' | 'Receita' | 'Fidelização'>('Retenção');

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
        <Card className="card-saas p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Estados Cobertos</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#E2E8F0' }}>
                {geoAnalysis.statesCovered}<span className="text-xl" style={{ color: '#64748B' }}>/27</span>
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#10B981' }}>
                {geoAnalysis.nationalCoverage.toFixed(1)}% cobertura
              </p>
            </div>
            <Map className="w-12 h-12" style={{ color: '#00D4FF' }} />
          </div>
        </Card>

        <Card className="card-saas p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Estado Líder</p>
              <p className="text-2xl font-bold mt-2" style={{ color: '#E2E8F0' }}>
                {geoAnalysis.topState?.uf || '-'}
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#00D4FF' }}>
                {geoAnalysis.topState?.clients || 0} ({geoAnalysis.topState?.percentage.toFixed(1)}%)
              </p>
            </div>
            <Target className="w-12 h-12" style={{ color: '#00D4FF' }} />
          </div>
        </Card>

        <Card className="card-saas p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>DDDs Ativos</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#E2E8F0' }}>
                {geoAnalysis.activeDDDs}
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#9945FF' }}>
                Top-5 = {geoAnalysis.top5Concentration.toFixed(0)}%
              </p>
            </div>
            <Phone className="w-12 h-12" style={{ color: '#00D4FF' }} />
          </div>
        </Card>

        <Card className="card-saas p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Telefones Processados</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#E2E8F0' }}>
                {geoAnalysis.validPhones}
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#F59E0B' }}>
                {geoAnalysis.invalidPhones} inválidos
              </p>
            </div>
            <Activity className="w-12 h-12" style={{ color: '#F59E0B' }} />
          </div>
        </Card>

        <Card className="card-saas p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Região Líder</p>
              <p className="text-2xl font-bold mt-2" style={{ color: '#E2E8F0' }}>
                {geoAnalysis.regionMetrics[0]?.regionName || '-'}
              </p>
              <p className="text-sm font-semibold mt-1" style={{ color: '#00D4FF' }}>
                {((geoAnalysis.regionMetrics[0]?.clients / geoAnalysis.validPhones) * 100).toFixed(1)}% da base
              </p>
            </div>
            <Globe className="w-12 h-12" style={{ color: '#00D4FF' }} />
          </div>
        </Card>
      </div>

      {/* Estatísticas de Processamento */}
      <Card className="card-saas p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E2E8F0' }}>
          <Activity className="w-5 h-5" style={{ color: '#00D4FF' }} />
          Estatísticas de Processamento
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Total Processado</p>
            <p className="text-2xl font-bold" style={{ color: '#E2E8F0' }}>{geoAnalysis.totalProcessed}</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>registros no Excel</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Telefones Válidos</p>
            <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{geoAnalysis.validPhones}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: '#10B981' }}>
              {((geoAnalysis.validPhones / geoAnalysis.totalProcessed) * 100).toFixed(1)}% da base
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>DDDs Diferentes</p>
            <p className="text-2xl font-bold" style={{ color: '#9945FF' }}>{geoAnalysis.activeDDDs}</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>códigos únicos</p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>Telefones Inválidos</p>
            <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{geoAnalysis.invalidPhones}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: '#F59E0B' }}>
              {((geoAnalysis.invalidPhones / geoAnalysis.totalProcessed) * 100).toFixed(1)}% rejeitados
            </p>
          </div>
        </div>
      </Card>

      {/* Insights Automáticos */}
      {geoAnalysis.insights.length > 0 && (
        <Card className="card-saas p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E2E8F0' }}>
            <Zap className="w-5 h-5 text-yellow-400" />
            Insights Automáticos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {geoAnalysis.insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg"
                  style={{ backgroundColor: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <Icon className={`w-5 h-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                  <p className="text-sm font-medium" style={{ color: '#E2E8F0' }}>{insight.text}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-[#0f141a] border border-gray-800" data-slot="tabs-list">
            <TabsTrigger value="mapa" className="data-[state=active]:bg-[#1a2028] data-[state=active]:text-[#e5e5e5]" data-slot="tabs-trigger">
              <Map className="w-4 h-4 mr-2" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="graficos" className="data-[state=active]:bg-[#1a2028] data-[state=active]:text-[#e5e5e5]" data-slot="tabs-trigger">
              <BarChart3 className="w-4 h-4 mr-2" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="tabelas" className="data-[state=active]:bg-[#1a2028] data-[state=active]:text-[#e5e5e5]" data-slot="tabs-trigger">
              <Users className="w-4 h-4 mr-2" />
              Tabelas
            </TabsTrigger>
          </TabsList>

          <button 
            onClick={exportToExcel} 
            className="exportar-btn"
          >
            <div className="folderContainer">
              <svg className="fileBack" width="146" height="113" viewBox="0 0 146 113" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 4C0 1.79086 1.79086 0 4 0H50.3802C51.8285 0 53.2056 0.627965 54.1553 1.72142L64.3303 13.4371C65.2799 14.5306 66.657 15.1585 68.1053 15.1585H141.509C143.718 15.1585 145.509 16.9494 145.509 19.1585V109C145.509 111.209 143.718 113 141.509 113H3.99999C1.79085 113 0 111.209 0 109V4Z"/>
              </svg>
              <svg className="filePage" width="88" height="99" viewBox="0 0 88 99" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="88" height="99" rx="4"/>
              </svg>
              <svg className="fileFront" width="160" height="79" viewBox="0 0 160 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 4C0 1.79086 1.79086 0 4 0H81.5092C82.7843 0 83.9903 0.550339 84.7945 1.49139L98.7945 18.3914C99.5987 19.3324 100.805 19.8828 102.08 19.8828H156C158.209 19.8828 160 21.6737 160 23.8828V75C160 77.2091 158.209 79 156 79H4C1.79086 79 0 77.2091 0 75V4Z"/>
              </svg>
            </div>
            <span className="exportar-text">Exportar Excel</span>
          </button>
        </div>

        {/* Aba: Mapa */}
        <TabsContent value="mapa" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mapa Choropleth */}
            <Card className="card-saas p-6">
              <h3 className="flex items-center gap-2 mb-4" style={{ color: '#E2E8F0', fontWeight: 600 }}>
                <Map className="w-5 h-5" style={{ color: '#00D4FF' }} />
                Distribuição por Estado
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {geoAnalysis.stateMetrics.map(state => {
                  const intensity = state.percentage / 100;
                  const baseColor = REGION_COLORS[state.region] || '#888';
                  const bandeira = BANDEIRAS_BR[state.uf];
                  
                  return (
                    <div
                      key={state.uf}
                      className="p-3 rounded-lg border hover:scale-105 transition-all cursor-pointer relative overflow-hidden"
                      style={{
                        backgroundColor: `${baseColor}${Math.round(intensity * 80).toString(16).padStart(2, '0')}`,
                        borderColor: `${baseColor}66`,
                      }}
                    >
                      {/* Bandeira no fundo */}
                      {bandeira && (
                        <div className="absolute inset-0 opacity-20">
                          <ImageWithFallback
                            src={bandeira.url}
                            alt={`Bandeira de ${bandeira.nome}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Conteúdo */}
                      <div className="relative z-10">
                        <div className="font-mono font-bold text-base mb-1" style={{ color: '#E2E8F0' }}>
                          {state.uf}
                        </div>
                        <div className="font-semibold" style={{ color: '#E2E8F0', fontSize: '0.875rem' }}>
                          {state.clients}
                        </div>
                        <div className="font-medium" style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                          {state.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Pizza por Região - LAYOUT REFERÊNCIA */}
            <Card 
              className="p-6 overflow-hidden"
              style={{
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.02)',
                borderRadius: '18px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Título */}
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5" style={{ color: '#00D4FF' }} />
                <h3 style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '1.125rem' }}>
                  Distribuição por Região
                </h3>
              </div>

              {/* Gráfico Donut Grande */}
              <div className="relative mb-6">
                <ResponsiveContainer width="100%" height={420}>
                  <PieChart>
                    <Pie
                      data={regionPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => {
                        return (
                          <text
                            x={entry.x}
                            y={entry.y}
                            fill="#E2E8F0"
                            textAnchor={entry.x > entry.cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            style={{ 
                              fontSize: '1.25rem', 
                              fontWeight: 700,
                              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))'
                            }}
                          >
                            {entry.percentage}%
                          </text>
                        );
                      }}
                      outerRadius={140}
                      innerRadius={90}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {regionPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          stroke={entry.fill}
                          strokeWidth={3}
                          style={{
                            filter: `drop-shadow(0 0 12px ${entry.fill}50)`
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#E2E8F0'
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value} clientes (${props.payload.percentage}%)`,
                        props.payload.name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centro do Donut - Total */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '6px' }}>
                    TOTAL
                  </div>
                  <div style={{ color: '#E2E8F0', fontSize: '2.5rem', fontWeight: 700, lineHeight: '1' }}>
                    {geoAnalysis.validPhones}
                  </div>
                  <div style={{ color: '#00D4FF', fontSize: '0.875rem', fontWeight: 600, marginTop: '6px' }}>
                    clientes ativos
                  </div>
                </div>
              </div>

              {/* Cards Regionais - 5 em linha */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {geoAnalysis.regionMetrics.map((reg, idx) => {
                  const percentage = ((reg.clients / geoAnalysis.validPhones) * 100).toFixed(1);
                  const color = REGION_COLORS[reg.region];
                  
                  return (
                    <div
                      key={reg.region}
                      className="p-4 rounded-xl transition-all hover:scale-105 cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${color}10 0%, ${color}20 100%)`,
                        border: `1.5px solid ${color}40`,
                        boxShadow: `0 4px 16px ${color}20`
                      }}
                    >
                      {/* Ícone circular colorido + Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: color,
                            boxShadow: `0 0 12px ${color}90`
                          }}
                        />
                        <div
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${color}25`,
                            color: color
                          }}
                        >
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Nome da Região */}
                      <div className="font-semibold text-sm mb-2" style={{ color: '#E2E8F0' }}>
                        {reg.regionName}
                      </div>

                      {/* Porcentagem grande */}
                      <div className="font-bold text-2xl mb-2" style={{ color: color }}>
                        {percentage}%
                      </div>

                      {/* Detalhes pequenos */}
                      <div className="space-y-0.5 text-xs" style={{ color: '#94A3B8' }}>
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{reg.clients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ativos:</span>
                          <span style={{ color: '#10B981', fontWeight: 600 }}>{reg.active}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DDDs:</span>
                          <span style={{ color: '#00D4FF', fontWeight: 600 }}>{reg.ddds.size}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insight Automático - Abaixo dos cards */}
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 212, 255, 0.15)'
                }}
              >
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00D4FF' }} />
                  <div className="text-sm" style={{ color: '#E2E8F0', lineHeight: '1.7' }}>
                    {geoAnalysis.regionMetrics[0] && (
                      <>
                        <strong style={{ color: REGION_COLORS[geoAnalysis.regionMetrics[0].region] }}>
                          {geoAnalysis.regionMetrics[0].regionName}
                        </strong> lidera com{' '}
                        <strong style={{ color: '#00D4FF' }}>
                          {((geoAnalysis.regionMetrics[0].clients / geoAnalysis.validPhones) * 100).toFixed(1)}%
                        </strong> da base nacional ({geoAnalysis.regionMetrics[0].clients} clientes).
                        {geoAnalysis.regionMetrics[1] && geoAnalysis.regionMetrics[2] && (
                          <> Em seguida,{' '}
                            <strong style={{ color: REGION_COLORS[geoAnalysis.regionMetrics[1].region] }}>
                              {geoAnalysis.regionMetrics[1].regionName}
                            </strong> ({((geoAnalysis.regionMetrics[1].clients / geoAnalysis.validPhones) * 100).toFixed(1)}%) e{' '}
                            <strong style={{ color: REGION_COLORS[geoAnalysis.regionMetrics[2].region] }}>
                              {geoAnalysis.regionMetrics[2].regionName}
                            </strong> ({((geoAnalysis.regionMetrics[2].clients / geoAnalysis.validPhones) * 100).toFixed(1)}%).
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
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

            {/* Radar Performance - REFATORADO PREMIUM */}
            <Card 
              className="p-6 overflow-hidden"
              style={{
                background: 'rgba(15, 20, 26, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Cabeçalho */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5" style={{ color: '#00D4FF' }} />
                  <h3 style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '1.125rem' }}>
                    Performance por Região
                  </h3>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                  Comparação relativa entre regiões (0–60). Clique para trocar indicador.
                </p>
              </div>

              {/* Seletor de Métrica */}
              <div className="flex gap-2 mb-6">
                {(['Retenção', 'Receita', 'Fidelização'] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className="px-4 py-2 rounded-lg transition-all duration-300 flex-1"
                    style={{
                      background: selectedMetric === metric 
                        ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2))'
                        : 'rgba(17, 24, 39, 0.4)',
                      border: selectedMetric === metric 
                        ? '1px solid rgba(0, 212, 255, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      color: selectedMetric === metric ? '#00D4FF' : '#94A3B8',
                      fontWeight: selectedMetric === metric ? 600 : 500,
                      fontSize: '0.875rem',
                      boxShadow: selectedMetric === metric 
                        ? '0 0 12px rgba(0, 212, 255, 0.25)'
                        : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {metric}
                  </button>
                ))}
              </div>

              {/* Radar Chart */}
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  {/* Grid com 4 círculos (0, 20, 40, 60) */}
                  <PolarGrid 
                    stroke="rgba(0, 212, 255, 0.35)" 
                    strokeWidth={1}
                  />
                  
                  {/* Labels externos com Região · valor */}
                  <PolarAngleAxis 
                    dataKey="region" 
                    stroke="#94A3B8"
                    tick={(props: any) => {
                      const { x, y, payload } = props;
                      const regionData = radarData.find(d => d.region === payload.value);
                      const value = regionData ? regionData[selectedMetric] : 0;
                      
                      return (
                        <text
                          x={x}
                          y={y}
                          textAnchor={x > 250 ? 'start' : 'end'}
                          fill="#E2E8F0"
                          style={{ fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          {`${payload.value} · ${value}`}
                        </text>
                      );
                    }}
                  />
                  
                  {/* Escala radial: 0, 20, 40, 60 */}
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 60]} 
                    tick={{ fill: '#64748B', fontSize: '0.75rem' }}
                    stroke="#374151"
                    tickCount={4}
                  />
                  
                  {/* Radar único - cor dinâmica por métrica */}
                  <Radar
                    name={selectedMetric}
                    dataKey={selectedMetric}
                    stroke={
                      selectedMetric === 'Retenção' ? '#00D4FF' :
                      selectedMetric === 'Receita' ? '#10B981' :
                      '#FF00CC'
                    }
                    fill={
                      selectedMetric === 'Retenção' ? '#00D4FF' :
                      selectedMetric === 'Receita' ? '#10B981' :
                      '#FF00CC'
                    }
                    fillOpacity={0.25}
                    strokeWidth={2}
                    dot={{ 
                      r: 6, 
                      fill: selectedMetric === 'Retenção' ? '#00D4FF' :
                            selectedMetric === 'Receita' ? '#10B981' :
                            '#FF00CC',
                      strokeWidth: 2,
                      stroke: '#0B0F1A'
                    }}
                    animationBegin={0}
                    animationDuration={600}
                    animationEasing="ease-out"
                  />
                  
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#E2E8F0'
                    }}
                    formatter={(value: any) => [value, selectedMetric]}
                  />
                </RadarChart>
              </ResponsiveContainer>

              {/* Painel Numérico - 2 colunas */}
              <div 
                className="mt-6 p-4 rounded-xl"
                style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  {radarData.map((reg, idx) => {
                    const maxValue = Math.max(...radarData.map(r => r[selectedMetric]));
                    const isMax = reg[selectedMetric] === maxValue;
                    const regionColor = REGION_COLORS[geoAnalysis.regionMetrics[idx]?.region] || '#888';
                    
                    return (
                      <div
                        key={reg.region}
                        className="p-3 rounded-lg transition-all hover:scale-105"
                        style={{
                          background: isMax 
                            ? `linear-gradient(135deg, ${regionColor}15, ${regionColor}25)`
                            : 'transparent',
                          border: isMax 
                            ? `1px solid ${regionColor}60`
                            : '1px solid rgba(255, 255, 255, 0.03)',
                          boxShadow: isMax 
                            ? `0 0 16px ${regionColor}30`
                            : 'none'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ 
                                  backgroundColor: regionColor,
                                  boxShadow: `0 0 8px ${regionColor}`
                                }}
                              />
                              <span style={{ color: '#E2E8F0', fontSize: '0.875rem', fontWeight: 600 }}>
                                {reg.region}
                              </span>
                            </div>
                            <div className="text-xs space-y-0.5 mt-2" style={{ color: '#94A3B8' }}>
                              <div className="flex justify-between gap-4">
                                <span>Retenção:</span>
                                <span style={{ color: '#00D4FF', fontWeight: 600 }}>{reg['Retenção']}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>Receita:</span>
                                <span style={{ color: '#10B981', fontWeight: 600 }}>{reg['Receita']}k</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>Fidelização:</span>
                                <span style={{ color: '#FF00CC', fontWeight: 600 }}>{reg['Fidelização']}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Valor destacado da métrica selecionada */}
                          <div className="text-right">
                            <div 
                              className="text-2xl font-bold"
                              style={{ 
                                color: isMax ? regionColor : '#E2E8F0',
                                textShadow: isMax ? `0 0 12px ${regionColor}80` : 'none'
                              }}
                            >
                              {reg[selectedMetric]}
                              {selectedMetric === 'Receita' && 'k'}
                            </div>
                            {isMax && (
                              <div 
                                className="text-xs font-semibold mt-1"
                                style={{ color: regionColor }}
                              >
                                LÍDER
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legenda no rodapé */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs" style={{ color: '#94A3B8' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#00D4FF' }} />
                  <span>Retenção (%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }} />
                  <span>Receita (k)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF00CC' }} />
                  <span>Fidelização (%)</span>
                </div>
              </div>
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