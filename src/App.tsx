import { useState, useEffect } from 'react';
import { Upload, BarChart3, TrendingUp, Users, DollarSign, Activity, Trophy, FileDown, MapPin, Clock, Loader2 } from 'lucide-react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { IPTVDashboard } from './components/IPTVDashboard';
import { FinancialView } from './components/FinancialView';
import { ClientsView } from './components/ClientsView';
import { RetentionView } from './components/RetentionView';
import { ConversionView } from './components/ConversionView';
import { GamesView } from './components/GamesView';
import { GeographicView } from './components/GeographicView';
import { TrafficView } from './components/TrafficView';
import { TickerBar } from './components/TickerBar';
import { CyberButton } from './components/CyberButton';
import { LoginView } from './components/LoginView';
import { painelLogin } from './utils/painelAuth';
import { waitCacheReady } from './utils/painelData';
import type { CacheAllAggregate } from './utils/painelData';
import * as XLSX from 'xlsx';
import logoImage from 'figma:asset/041e4507fc9bd0d9356f7ec31328adbf75294fff.png';
import { 
  normalizeString, 
  safeNumber, 
  safePct, 
  parseDate, 
  enrichRowWithGeo, 
  getDayOfWeek, 
  getMonthYear,
  getTurnoFromDate,
  sortByMesAno,
  mapCustoToPlano,
  extractHourFromDate,
  daysDifference
} from './utils/dataProcessing';

export interface DashboardData {
  // Métricas principais
  testes: number;
  conversoes: number;
  renovacoes: number;
  clientesAtivos: number;
  clientesExpirados: number;
  
  // Taxas calculadas
  taxaConversao: number;
  taxaFidelidade: number;
  churnRate: number;
  taxaRetencao: number;
  
  // Financeiro
  ticketMedio: number;
  receitaMensal: number;
  receitaAnual: number;
  receitaTotal: number; // Soma real de todas as vendas
  ltv: number;
  custoTotalConversoes: number;
  custoTotalRenovacoes: number;
  custoMedioConversao: number;
  custoMedioRenovacao: number;
  cac: number;
  roas: number;
  saldoMedioPosVenda: number;
  
  // Análise por Plano
  conversoesPorPlano: Array<{ plano: string; count: number; receita: number }>;
  renovacoesPorPlano: Array<{ plano: string; count: number; receita: number }>;
  mixPlanos: Array<{ plano: string; value: number; percentual: number }>;
  
  // Temporal
  melhorDia: string;
  melhorDiaCount: number;
  testesPorDia: Record<string, number>;
  conversoesPorDia: Record<string, number>;
  renovacoesPorDia: Record<string, number>;
  testesPorMes: Array<{ mes: string; count: number }>;
  conversoesPorMes: Array<{ mes: string; count: number }>;
  renovacoesPorMes: Array<{ mes: string; count: number }>;
  tempoMedioAteConversao: number; // Em dias
  heatmapHoraDia: Array<{ dia: string; hora: number; count: number }>;
  
  // Turnos
  testesPorTurno: Record<string, number>;
  conversoesPorTurno: Record<string, number>;
  renovacoesPorTurno: Record<string, number>;
  melhorTurno: string;
  melhorTurnoCount: number;
  
  // Geográfico
  porEstado: Array<{ estado: string; testes: number; conversoes: number; ativos: number; expirados: number }>;
  porDDD: Array<{ ddd: string; count: number }>;
  topEstados: Array<{ estado: string; total: number; percentual: number }>;
  estadosCobertos: number;
  
  // Conexões
  conexoesPorTipo: Record<string, number>;
  mediaConexoes: number;
  maxConexoes: number;
  
  // Clientes
  clientesFieis: number;
  totalRenovadores: number;
  clientesData: any[];
  recentClients: any[];
  distribuicaoRenovacoes: Array<{ categoria: string; count: number }>;
  
  // Análise de Status
  statusDistribution: Record<string, number>;
  
  // Revendedores
  topRevendedores: Array<{ revendedor: string; count: number }>;
  
  // Jogos (opcional)
  hasGamesData: boolean;
  jogosAnalisados: number;
  jogosComConversoes: number;
  conversoesDuranteJogos: number;
  conversoesAntesJogos: number;
  conversoesDepoisJogos: number;
  topTimes: Array<{ time: string; conversoes: number }>;
  porCompeticao: Record<string, number>;
  impactoPorPeriodo: Array<{ periodo: string; count: number; percentual: number }>;
  
  // Raw data
  rawData: {
    testes: any[];
    conversoes: any[];
    renovacoes: any[];
    ativos: any[];
    expirados: any[];
    jogos: any[];
    convJogos: any[];
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Atualizar relógio a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada 60 segundos
    
    return () => clearInterval(timer);
  }, []);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Token existe, usuário está autenticado
      setIsAuthenticated(true);
      // Opcionalmente, validar o token com a API aqui
    }
  }, []);

  // Handler de login bem-sucedido
  const handleLoginSuccess = (token: string, user: any) => {
    setIsAuthenticated(true);
    setUserData(user);
    // Abrir ClientsView após login
    setActiveTab('clients');
  };

  /**
   * Constrói a estrutura DashboardData a partir do agregado do painel.
   *
   * - Preenche `rawData` com `ativos`, `expirados`, `testes`, `conversoes`, `renovacoes`.
   * - Calcula contadores básicos (testes, conversões, renovacoes, ativos, expirados).
   * - Demais métricas são inicializadas com valores neutros para futura evolução.
   *
   * @param agg Agregado retornado por `/api/painel/cache-all`
   * @returns Estrutura `DashboardData` pronta para consumo nas views
   */
  function buildDashboardDataFromPanel(agg: CacheAllAggregate): DashboardData {
    const ativos = agg.ativos || [];
    const expirados = agg.expirados || [];
    const testes = agg.testes || [];
    const convLogs = (agg as any).conversoes || [];
    const renLogs = (agg as any).renovacoes || [];

    const clientesAtivos = ativos.length;
    const clientesExpirados = expirados.length;
    const testesCount = testes.length;
    const conversoesCount = Array.isArray(convLogs) ? convLogs.length : 0;
    const renovacoesCount = Array.isArray(renLogs) ? renLogs.length : 0;

    /**
     * Calcula estatísticas de fidelidade a partir dos logs de renovação.
     * Conta clientes com 2+ renovações e total de renovadores únicos.
     */
    const calcRenewalStats = (logs: any[]) => {
      const counts: Record<string, number> = {};
      logs.forEach((r) => {
        const usuario = r.Usuario || r.usuario;
        if (!usuario) return;
        counts[usuario] = (counts[usuario] || 0) + 1;
      });
      const clientesFieis = Object.values(counts).filter((c) => c >= 2).length;
      const totalRenovadores = Object.keys(counts).length;
      return { clientesFieis, totalRenovadores };
    };

    /**
     * Calcula o saldo médio pós-venda com base em `Creditos_Apos` dos logs de conversão.
     */
    const calcSaldoMedioPosVenda = (logs: any[]) => {
      const valores = logs
        .map((c) => parseFloat(String(c.Creditos_Apos || c.creditos_apos || '0').replace(',', '.')))
        .filter((v) => !isNaN(v) && v > 0);
      if (valores.length === 0) return 0;
      const soma = valores.reduce((a, b) => a + b, 0);
      return Math.round((soma / valores.length) * 10) / 10;
    };

    /**
     * Estima o ticket médio a partir dos logs de conversão usando campos comuns (`Custo`/`Valor`).
     * Fallback para 30 quando não há dados ou campos ausentes.
     */
    const calcTicketMedio = (logs: any[]) => {
      const valores = logs
        .map((c) => parseFloat(String(c.Custo || c.custo || c.Valor || c.valor || '0').replace(',', '.')))
        .filter((v) => !isNaN(v) && v > 0);
      if (valores.length === 0) return 30;
      const soma = valores.reduce((a, b) => a + b, 0);
      return Math.round((soma / valores.length) * 100) / 100;
    };

    const { clientesFieis, totalRenovadores } = calcRenewalStats(renLogs);
    const saldoMedioPosVenda = calcSaldoMedioPosVenda(convLogs);
    const ticketMedioEstimado = calcTicketMedio(convLogs);

    // =============================
    // Agregações temporais e turnos
    // =============================
    const countByWeekday = (items: any[], dateKeyCandidates: string[]) => {
      const map: Record<string, number> = {};
      items.forEach((row) => {
        const dateStr = dateKeyCandidates.find(k => row[k]) ? row[dateKeyCandidates.find(k => row[k]) as string] : undefined;
        const date = parseDate(dateStr);
        if (date) {
          const dayName = getDayOfWeek(date);
          map[dayName] = (map[dayName] || 0) + 1;
        }
      });
      return map;
    };

    const countByMonth = (items: any[], dateKeyCandidates: string[]) => {
      const monthMap: Record<string, number> = {};
      items.forEach((row) => {
        const dateStr = dateKeyCandidates.find(k => row[k]) ? row[dateKeyCandidates.find(k => row[k]) as string] : undefined;
        const date = parseDate(dateStr);
        if (date) {
          const mesAno = getMonthYear(date);
          monthMap[mesAno] = (monthMap[mesAno] || 0) + 1;
        }
      });
      return Object.entries(monthMap).map(([mes, count]) => ({ mes, count })).sort((a, b) => sortByMesAno(a.mes, b.mes));
    };

    const countByTurno = (items: any[], dateKeyCandidates: string[]) => {
      const turnoMap: Record<string, number> = {};
      items.forEach((row) => {
        const dateStr = dateKeyCandidates.find(k => row[k]) ? row[dateKeyCandidates.find(k => row[k]) as string] : undefined;
        const date = parseDate(dateStr);
        if (date) {
          const turno = getTurnoFromDate(date);
          turnoMap[turno] = (turnoMap[turno] || 0) + 1;
        }
      });
      return turnoMap;
    };

    const buildHeatmapHoraDia = (items: any[], dateKeyCandidates: string[]) => {
      const heat: Record<string, number> = {};
      items.forEach((row) => {
        const dateStr = dateKeyCandidates.find(k => row[k]) ? row[dateKeyCandidates.find(k => row[k]) as string] : undefined;
        const date = parseDate(dateStr);
        if (date) {
          const dia = getDayOfWeek(date);
          const hora = extractHourFromDate(date);
          const key = `${dia}|${hora}`;
          heat[key] = (heat[key] || 0) + 1;
        }
      });
      return Object.entries(heat).map(([key, count]) => {
        const [dia, horaStr] = key.split('|');
        return { dia, hora: Number(horaStr), count };
      });
    };

    const testesPorDia = countByWeekday(testes, ['Criado_Em', 'criado_em', 'Criacao', 'criacao']);
    const conversoesPorDia = countByWeekday(convLogs, ['Data', 'data', 'DataConversao']);
    const renovacoesPorDia = countByWeekday(renLogs, ['Data', 'data', 'DataRenovacao']);

    const testesPorMes = countByMonth(testes, ['Criado_Em', 'criado_em', 'Criacao', 'criacao']);
    const conversoesPorMes = countByMonth(convLogs, ['Data', 'data', 'DataConversao']);
    const renovacoesPorMes = countByMonth(renLogs, ['Data', 'data', 'DataRenovacao']);

    const testesPorTurno = countByTurno(testes, ['Criado_Em', 'criado_em', 'Criacao', 'criacao']);
    const conversoesPorTurno = countByTurno(convLogs, ['Data', 'data', 'DataConversao']);
    const renovacoesPorTurno = countByTurno(renLogs, ['Data', 'data', 'DataRenovacao']);

    // Melhor dia baseado em conversões
    let melhorDia = '-';
    let melhorDiaCount = 0;
    Object.entries(conversoesPorDia).forEach(([dia, count]) => {
      if (count > melhorDiaCount) {
        melhorDia = dia;
        melhorDiaCount = count as number;
      }
    });

    // Melhor turno baseado em conversões
    let melhorTurno = '-';
    let melhorTurnoCount = 0;
    Object.entries(conversoesPorTurno).forEach(([turno, count]) => {
      if (count > melhorTurnoCount) {
        melhorTurno = turno;
        melhorTurnoCount = count as number;
      }
    });

    // Tempo médio até conversão (dias) por usuário
    const tempoMedioAteConversao = (() => {
      const testesPorUsuario: Record<string, Date> = {};
      testes.forEach((t: any) => {
        const user = t.Usuario || t.usuario;
        const d = parseDate(t.Criado_Em || t.criado_em || t.Criacao || t.criacao);
        if (user && d && (!testesPorUsuario[user] || d < testesPorUsuario[user])) {
          testesPorUsuario[user] = d;
        }
      });
      const diffs: number[] = [];
      convLogs.forEach((c: any) => {
        const user = c.Usuario || c.usuario;
        const d = parseDate(c.Data || c.data || c.DataConversao);
        if (user && d && testesPorUsuario[user]) {
          const diff = daysDifference(testesPorUsuario[user], d);
          if (diff >= 0) diffs.push(diff);
        }
      });
      if (diffs.length === 0) return 0;
      const soma = diffs.reduce((a, b) => a + b, 0);
      return Math.round((soma / diffs.length) * 10) / 10;
    })();

    const heatmapHoraDia = buildHeatmapHoraDia(convLogs, ['Data', 'data', 'DataConversao']);

    // Distribuição de status
    const statusDistribution: Record<string, number> = {
      Ativo: clientesAtivos,
      Expirado: clientesExpirados,
    };

    return {
      // Métricas principais
      testes: testesCount,
      conversoes: conversoesCount,
      renovacoes: renovacoesCount,
      clientesAtivos,
      clientesExpirados,

      // Taxas calculadas
      taxaConversao: testesCount > 0 ? (conversoesCount / testesCount) * 100 : 0,
      taxaFidelidade: totalRenovadores > 0 ? (clientesFieis / totalRenovadores) * 100 : 0,
      churnRate: clientesAtivos + clientesExpirados > 0 ? (clientesExpirados / (clientesAtivos + clientesExpirados)) * 100 : 0,
      taxaRetencao: clientesAtivos + clientesExpirados > 0 ? (clientesAtivos / (clientesAtivos + clientesExpirados)) * 100 : 0,

      // Financeiro (placeholder)
      ticketMedio: ticketMedioEstimado,
      receitaMensal: clientesAtivos * ticketMedioEstimado,
      receitaAnual: clientesAtivos * ticketMedioEstimado * 12,
      receitaTotal: 0,
      ltv: 0,
      custoTotalConversoes: 0,
      custoTotalRenovacoes: 0,
      custoMedioConversao: 0,
      custoMedioRenovacao: 0,
      cac: 0,
      roas: 0,
      saldoMedioPosVenda,

      // Análise por Plano (placeholder)
      conversoesPorPlano: [],
      renovacoesPorPlano: [],
      mixPlanos: [],

      // Temporal
      melhorDia,
      melhorDiaCount,
      testesPorDia,
      conversoesPorDia,
      renovacoesPorDia,
      testesPorMes,
      conversoesPorMes,
      renovacoesPorMes,
      tempoMedioAteConversao,
      heatmapHoraDia,

      // Turnos
      testesPorTurno,
      conversoesPorTurno,
      renovacoesPorTurno,
      melhorTurno,
      melhorTurnoCount,

      // Geográfico (placeholder)
      porEstado: [],
      porDDD: [],
      topEstados: [],
      estadosCobertos: 0,

      // Conexões (placeholder)
      conexoesPorTipo: {},
      mediaConexoes: 0,
      maxConexoes: 0,

      // Clientes (placeholder)
      clientesFieis,
      totalRenovadores,
      clientesData: ativos,
      recentClients: ativos.slice(0, 10),
      distribuicaoRenovacoes: [],

      // Análise de Status
      statusDistribution,

      // Revendedores (placeholder)
      topRevendedores: [],

      // Jogos (não aplicável no painel diretamente)
      hasGamesData: false,
      jogosAnalisados: 0,
      jogosComConversoes: 0,
      conversoesDuranteJogos: 0,
      conversoesAntesJogos: 0,
      conversoesDepoisJogos: 0,
      topTimes: [],
      porCompeticao: {},
      impactoPorPeriodo: [],

      // Raw data
      rawData: {
        testes,
        conversoes: convLogs,
        renovacoes: renLogs,
        ativos,
        expirados,
        jogos: [],
        convJogos: [],
      },
    };
  }

  // Handler de logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('panel_cache_key');
    localStorage.removeItem('panel_reseller_id');
    localStorage.removeItem('panel_phpsessid');
    setIsAuthenticated(false);
    setUserData(null);
    setDashboardData(null);
  };

  /**
   * Inicializa o fluxo de login do painel após autenticação do app.
   *
   * - NÃO chama `execute-all`; o backend já o executa em background após login.
   * - Usa credenciais persistidas em `localStorage['gestorCredentials']` se presentes.
   * - Persiste `panel_cache_key` e armazena o agregado em `localStorage['panel_cache_all']` quando pronto.
   */
  const bootstrapPainelAfterLogin = async () => {
    try {
      // Se já existe cache_key (definido pelo LoginView via /api/painel/login), apenas aguarda o cache
      let cacheKey = localStorage.getItem('panel_cache_key') || undefined;

      if (!cacheKey) {
        // Tentar obter credenciais armazenadas na aba Clientes
        const raw = localStorage.getItem('gestorCredentials');
        if (raw) {
          const creds = JSON.parse(raw);
          const panelUsername: string | undefined = creds?.panelUsername;
          const panelPassword: string | undefined = creds?.panelPassword;
          if (panelUsername && panelPassword) {
            // Login no painel (backend executa agregação em background)
            const loginRes = await painelLogin({ username: panelUsername, password: panelPassword });
            cacheKey = loginRes?.cache_key || localStorage.getItem('panel_cache_key') || undefined;
          }
        }
      }

      if (!cacheKey) return;

      // Aguarda o cache agregado ficar pronto e persiste para consumo posterior
      const agg = await waitCacheReady(cacheKey, 10, 1500);
      if (agg) {
        try { localStorage.setItem('panel_cache_all', JSON.stringify(agg)); } catch {}
        // Atualiza o estado do dashboard com os dados do painel
        try { setDashboardData(buildDashboardDataFromPanel(agg)); } catch (e) { console.warn('Falha ao mapear dados do painel:', e); }
      }
    } catch (err) {
      console.warn('Falha ao inicializar painel após login:', err);
    }
  };

  // Quando autenticado, tenta carregar `panel_cache_all` existente e popular o dashboard
  useEffect(() => {
    if (!isAuthenticated) return;
    if (dashboardData) return;
    try {
      const raw = localStorage.getItem('panel_cache_all');
      if (raw) {
        const agg = JSON.parse(raw) as CacheAllAggregate;
        setDashboardData(buildDashboardDataFromPanel(agg));
      }
    } catch (e) {
      console.warn('Falha ao ler panel_cache_all do localStorage:', e);
    }
  }, [isAuthenticated, dashboardData]);

  useEffect(() => {
    // Tentar carregar dados do localStorage
    try {
      const savedData = localStorage.getItem('iptvDashboardData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Garantir que rawData existe mesmo que vazio
        if (!parsed.rawData) {
          parsed.rawData = {
            testes: [],
            conversoes: [],
            renovacoes: [],
            ativos: [],
            expirados: [],
            jogos: [],
            convJogos: [],
          };
        }
        setDashboardData(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
      localStorage.removeItem('iptvDashboardData');
    }
  }, []);

  // Dispara bootstrap do painel após autenticação
  useEffect(() => {
    if (isAuthenticated) {
      bootstrapPainelAfterLogin();
    }
  }, [isAuthenticated]);

  // Quando autenticado, tenta carregar `panel_cache_all` existente e popular o dashboard
  useEffect(() => {
    if (!isAuthenticated) return;
    if (dashboardData) return;
    try {
      const raw = localStorage.getItem('panel_cache_all');
      if (raw) {
        const agg = JSON.parse(raw) as CacheAllAggregate;
        setDashboardData(buildDashboardDataFromPanel(agg));
      }
    } catch (e) {
      console.warn('Falha ao ler panel_cache_all do localStorage:', e);
    }
  }, [isAuthenticated, dashboardData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const processedData = processExcelData(workbook);
      setDashboardData(processedData);
      
      // Salvar no localStorage (com TODA a base para análise geográfica completa)
      try {
        // Calcular tamanho aproximado dos dados
        const estimatedSize = JSON.stringify(processedData).length;
        const maxSize = 4 * 1024 * 1024; // 4MB (seguro para localStorage)
        
        if (estimatedSize > maxSize) {
          // Dados muito grandes - salvar apenas métricas essenciais (silenciosamente)
          const essentialData = {
            testes: processedData.testes,
            conversoes: processedData.conversoes,
            renovacoes: processedData.renovacoes,
            clientesAtivos: processedData.clientesAtivos,
            clientesExpirados: processedData.clientesExpirados,
            taxaConversao: processedData.taxaConversao,
            taxaFidelidade: processedData.taxaFidelidade,
            churnRate: processedData.churnRate,
            taxaRetencao: processedData.taxaRetencao,
            ticketMedio: processedData.ticketMedio,
            receitaMensal: processedData.receitaMensal,
            receitaAnual: processedData.receitaAnual,
            // Salvar apenas primeiros 50 registros de cada array para preview
            rawData: {
              testes: processedData.rawData.testes.slice(0, 20),
              conversoes: processedData.rawData.conversoes.slice(0, 20),
              renovacoes: processedData.rawData.renovacoes.slice(0, 50),
              ativos: processedData.rawData.ativos.slice(0, 50),
              expirados: processedData.rawData.expirados.slice(0, 30),
              jogos: processedData.rawData.jogos.slice(0, 10),
              convJogos: processedData.rawData.convJogos.slice(0, 10),
            },
            clientesData: processedData.clientesData.slice(0, 30),
            recentClients: processedData.recentClients.slice(0, 10),
          };
          localStorage.setItem('iptvDashboardData', JSON.stringify(essentialData));
        } else {
          // Dados são pequenos o suficiente, salvar com limites reduzidos
          const dataToSave = {
            ...processedData,
            rawData: {
              testes: processedData.rawData.testes.slice(0, 50),
              conversoes: processedData.rawData.conversoes.slice(0, 50),
              renovacoes: processedData.rawData.renovacoes.slice(0, 200),
              ativos: processedData.rawData.ativos.slice(0, 300),
              expirados: processedData.rawData.expirados.slice(0, 150),
              jogos: processedData.rawData.jogos.slice(0, 30),
              convJogos: processedData.rawData.convJogos.slice(0, 30),
            },
            clientesData: processedData.clientesData.slice(0, 50),
            recentClients: processedData.recentClients.slice(0, 20),
          };
          localStorage.setItem('iptvDashboardData', JSON.stringify(dataToSave));
        }
      } catch (storageError) {
        // Erro silencioso - não mostrar para o usuário
        // Limpar localStorage se estiver cheio
        try {
          localStorage.removeItem('iptvDashboardData');
        } catch (e) {
          // Silenciosamente falhar
        }
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar arquivo. Verifique o formato do Excel.');
    } finally {
      setIsLoading(false);
    }
  };

  const processExcelData = (workbook: XLSX.WorkBook): DashboardData => {
    const data: DashboardData = {
      testes: 0,
      conversoes: 0,
      renovacoes: 0,
      clientesAtivos: 0,
      clientesExpirados: 0,
      taxaConversao: 0,
      taxaFidelidade: 0,
      churnRate: 0,
      taxaRetencao: 0,
      ticketMedio: 30,
      receitaMensal: 0,
      receitaAnual: 0,
      receitaTotal: 0,
      ltv: 180,
      custoTotalConversoes: 0,
      custoTotalRenovacoes: 0,
      custoMedioConversao: 0,
      custoMedioRenovacao: 0,
      cac: 15,
      roas: 0,
      saldoMedioPosVenda: 0,
      conversoesPorPlano: [],
      renovacoesPorPlano: [],
      mixPlanos: [],
      melhorDia: '',
      melhorDiaCount: 0,
      testesPorDia: {},
      conversoesPorDia: {},
      renovacoesPorDia: {},
      testesPorMes: [],
      conversoesPorMes: [],
      renovacoesPorMes: [],
      tempoMedioAteConversao: 0,
      heatmapHoraDia: [],
      testesPorTurno: {},
      conversoesPorTurno: {},
      renovacoesPorTurno: {},
      melhorTurno: '',
      melhorTurnoCount: 0,
      porEstado: [],
      porDDD: [],
      topEstados: [],
      estadosCobertos: 0,
      conexoesPorTipo: {},
      mediaConexoes: 0,
      maxConexoes: 0,
      clientesFieis: 0,
      totalRenovadores: 0,
      clientesData: [],
      recentClients: [],
      distribuicaoRenovacoes: [],
      statusDistribution: {},
      topRevendedores: [],
      hasGamesData: false,
      jogosAnalisados: 0,
      jogosComConversoes: 0,
      conversoesDuranteJogos: 0,
      conversoesAntesJogos: 0,
      conversoesDepoisJogos: 0,
      topTimes: [],
      porCompeticao: {},
      impactoPorPeriodo: [],
      rawData: {
        testes: [],
        conversoes: [],
        renovacoes: [],
        ativos: [],
        expirados: [],
        jogos: [],
        convJogos: [],
      },
    };

    // Processar cada aba
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      switch (sheetName.toLowerCase()) {
        case 'testes':
          data.rawData.testes = jsonData;
          data.testes = jsonData.length;
          processTestesPorDia(jsonData, data);
          processTestesGeo(jsonData, data);
          processTestesStatus(jsonData, data);
          processTestesConexoes(jsonData, data);
          processTestesRevendedor(jsonData, data);
          break;
        case 'conversões':
        case 'conversoes':
          data.rawData.conversoes = jsonData;
          data.conversoes = jsonData.length;
          processConversoesPorDia(jsonData, data);
          processConversoesCustos(jsonData, data);
          break;
        case 'renovações':
        case 'renovacoes':
          data.rawData.renovacoes = jsonData;
          data.renovacoes = jsonData.length;
          processRenovacoes(jsonData, data);
          processRenovacoesCustos(jsonData, data);
          break;
        case 'clientes ativos':
          data.rawData.ativos = jsonData;
          data.clientesAtivos = jsonData.length;
          data.clientesData = [...data.clientesData, ...jsonData.map(c => ({ ...c, status: 'Ativo' }))];
          break;
        case 'clientes expirados':
          data.rawData.expirados = jsonData;
          data.clientesExpirados = jsonData.length;
          data.clientesData = [...data.clientesData, ...jsonData.map(c => ({ ...c, status: 'Expirado' }))];
          break;
        case 'jogos':
          data.rawData.jogos = jsonData;
          data.hasGamesData = true;
          data.jogosAnalisados = jsonData.length;
          break;
        case 'conv x jogos':
          data.rawData.convJogos = jsonData;
          processConvJogos(jsonData, data);
          break;
      }
    });

    // Calcular métricas derivadas
    calculateDerivedMetrics(data);
    
    // Clientes recentes
    data.recentClients = [...data.rawData.ativos, ...data.rawData.expirados]
      .sort((a, b) => {
        const dateA = new Date(a.Criado_Em || a.Criacao || '').getTime();
        const dateB = new Date(b.Criado_Em || b.Criacao || '').getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    return data;
  };

  const processTestesPorDia = (data: any[], dashData: DashboardData) => {
    const dayCount: Record<string, number> = {};
    const turnoCount: Record<string, number> = {};
    
    data.forEach(row => {
      const date = parseDate(row.Criado_Em || row.criado_em);
      if (date) {
        const dayName = getDayOfWeek(date);
        dayCount[dayName] = (dayCount[dayName] || 0) + 1;
        
        const turno = getTurnoFromDate(date);
        turnoCount[turno] = (turnoCount[turno] || 0) + 1;
      }
    });
    
    dashData.testesPorDia = dayCount;
    dashData.testesPorTurno = turnoCount;
  };

  const processConversoesPorDia = (data: any[], dashData: DashboardData) => {
    const dayCount: Record<string, number> = {};
    const turnoCount: Record<string, number> = {};
    
    data.forEach(row => {
      const date = parseDate(row.Data || row.data);
      if (date) {
        const dayName = getDayOfWeek(date);
        dayCount[dayName] = (dayCount[dayName] || 0) + 1;
        
        const turno = getTurnoFromDate(date);
        turnoCount[turno] = (turnoCount[turno] || 0) + 1;
      }
    });
    
    dashData.conversoesPorDia = dayCount;
    dashData.conversoesPorTurno = turnoCount;
  };

  const processRenovacoes = (data: any[], dashData: DashboardData) => {
    const customerRenewals: Record<string, number> = {};
    const dayCount: Record<string, number> = {};
    const turnoCount: Record<string, number> = {};
    
    data.forEach(row => {
      if (row.Usuario || row.usuario) {
        const usuario = row.Usuario || row.usuario;
        customerRenewals[usuario] = (customerRenewals[usuario] || 0) + 1;
      }
      
      const date = parseDate(row.Data || row.data);
      if (date) {
        const dayName = getDayOfWeek(date);
        dayCount[dayName] = (dayCount[dayName] || 0) + 1;
        
        const turno = getTurnoFromDate(date);
        turnoCount[turno] = (turnoCount[turno] || 0) + 1;
      }
    });

    dashData.renovacoesPorDia = dayCount;
    dashData.renovacoesPorTurno = turnoCount;
    dashData.clientesFieis = Object.values(customerRenewals).filter(count => count >= 2).length;
    dashData.totalRenovadores = Object.keys(customerRenewals).length;

    // Encontrar melhor dia
    let maxDay = '';
    let maxCount = 0;
    Object.entries(dayCount).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    });
    dashData.melhorDia = maxDay;
    dashData.melhorDiaCount = maxCount;
    
    // Encontrar melhor turno
    let maxTurno = '';
    let maxTurnoCount = 0;
    Object.entries(turnoCount).forEach(([turno, count]) => {
      if (count > maxTurnoCount) {
        maxTurnoCount = count;
        maxTurno = turno;
      }
    });
    dashData.melhorTurno = maxTurno;
    dashData.melhorTurnoCount = maxTurnoCount;
  };

  const processConvJogos = (data: any[], dashData: DashboardData) => {
    const timesCount: Record<string, number> = {};
    const competicaoCount: Record<string, number> = {};
    const periodoCounts: Record<string, number> = {
      'Antes': 0,
      'Durante': 0,
      'Depois': 0
    };

    data.forEach(row => {
      const periodo = String(row.Periodo || '').trim();
      const periodoNorm = periodo.charAt(0).toUpperCase() + periodo.slice(1).toLowerCase();
      
      if (periodoCounts[periodoNorm] !== undefined) {
        periodoCounts[periodoNorm]++;
      }

      if (row.Casa) {
        timesCount[row.Casa] = (timesCount[row.Casa] || 0) + 1;
      }
      if (row.Fora) {
        timesCount[row.Fora] = (timesCount[row.Fora] || 0) + 1;
      }
      if (row.Competicao) {
        competicaoCount[row.Competicao] = (competicaoCount[row.Competicao] || 0) + 1;
      }
    });

    dashData.conversoesAntesJogos = periodoCounts['Antes'];
    dashData.conversoesDuranteJogos = periodoCounts['Durante'];
    dashData.conversoesDepoisJogos = periodoCounts['Depois'];
    dashData.jogosComConversoes = new Set(data.map(r => r.Jogo)).size;
    
    // Impacto por período
    const total = periodoCounts['Antes'] + periodoCounts['Durante'] + periodoCounts['Depois'];
    dashData.impactoPorPeriodo = Object.entries(periodoCounts)
      .map(([periodo, count]) => ({
        periodo,
        count,
        percentual: total > 0 ? (count / total) * 100 : 0
      }));
    
    dashData.topTimes = Object.entries(timesCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([time, conversoes]) => ({ time, conversoes }));
    
    dashData.porCompeticao = competicaoCount;
  };

  const processTestesGeo = (jsonData: any[], data: DashboardData) => {
    const estadosMap: Record<string, any> = {};
    const dddMap: Record<string, number> = {};
    
    jsonData.forEach(row => {
      // Enriquecer com dados geográficos (prioriza UF/DDD explícitos, depois deriva do Usuario)
      const { ddd, uf } = enrichRowWithGeo(row);
      
      if (uf) {
        if (!estadosMap[uf]) {
          estadosMap[uf] = { estado: uf, testes: 0, conversoes: 0, ativos: 0, expirados: 0 };
        }
        estadosMap[uf].testes++;
      }
      
      if (ddd) {
        dddMap[ddd] = (dddMap[ddd] || 0) + 1;
      }
    });
    
    data.porEstado = Object.values(estadosMap);
    data.porDDD = Object.entries(dddMap)
      .map(([ddd, count]) => ({ ddd, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    data.estadosCobertos = Object.keys(estadosMap).length;
  };

  const processTestesStatus = (jsonData: any[], data: DashboardData) => {
    const statusMap: Record<string, number> = {};
    jsonData.forEach(row => {
      const status = row.Status || row.status || 'Indefinido';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    data.statusDistribution = statusMap;
  };

  const processTestesConexoes = (jsonData: any[], data: DashboardData) => {
    const conexoesMap: Record<string, number> = {};
    let totalConexoes = 0;
    let maxConexoes = 0;
    
    jsonData.forEach(row => {
      const conexoes = row.Max_Conexoes || row.max_conexoes || row.conexoes || 1;
      const key = `${conexoes} conexão${conexoes > 1 ? 'ões' : ''}`;
      conexoesMap[key] = (conexoesMap[key] || 0) + 1;
      totalConexoes += parseInt(conexoes);
      maxConexoes = Math.max(maxConexoes, parseInt(conexoes));
    });
    
    data.conexoesPorTipo = conexoesMap;
    data.mediaConexoes = jsonData.length > 0 ? totalConexoes / jsonData.length : 0;
    data.maxConexoes = maxConexoes;
  };

  const processTestesRevendedor = (jsonData: any[], data: DashboardData) => {
    const revendedorMap: Record<string, number> = {};
    jsonData.forEach(row => {
      const rev = row.Revendedor || row.revendedor || 'Direto';
      revendedorMap[rev] = (revendedorMap[rev] || 0) + 1;
    });
    data.topRevendedores = Object.entries(revendedorMap)
      .map(([revendedor, count]) => ({ revendedor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processConversoesCustos = (jsonData: any[], data: DashboardData) => {
    let custoTotal = 0;
    let receitaTotalConversoes = 0;
    let saldoTotal = 0;
    let saldoCount = 0;
    const porMes: Record<string, number> = {};
    const porPlano: Record<string, { count: number; receita: number }> = {};
    const hoje = new Date();
    
    jsonData.forEach(row => {
      const custo = safeNumber(row.Custo || row.custo);
      const planoInfo = mapCustoToPlano(custo);
      const preco = planoInfo.precoMedio;
      
      custoTotal += custo;
      receitaTotalConversoes += preco;
      
      // Saldo pós-venda
      const saldo = safeNumber(row.Creditos_Apos || row.creditos_apos);
      if (saldo > 0) {
        saldoTotal += saldo;
        saldoCount++;
      }
      
      // Análise por plano
      if (!porPlano[planoInfo.nome]) {
        porPlano[planoInfo.nome] = { count: 0, receita: 0 };
      }
      porPlano[planoInfo.nome].count++;
      porPlano[planoInfo.nome].receita += preco;
      
      const date = parseDate(row.Data || row.data);
      // Filtrar apenas datas válidas e até o mês atual
      if (date && date <= hoje && date.getFullYear() >= hoje.getFullYear() - 1) {
        const mesAno = getMonthYear(date);
        porMes[mesAno] = (porMes[mesAno] || 0) + 1;
      }
    });
    
    data.custoTotalConversoes = custoTotal;
    data.custoMedioConversao = jsonData.length > 0 ? custoTotal / jsonData.length : 0;
    data.saldoMedioPosVenda = saldoCount > 0 ? saldoTotal / saldoCount : 0;
    data.conversoesPorMes = sortByMesAno(
      Object.entries(porMes).map(([mes, count]) => ({ mes, count }))
    );
    data.conversoesPorPlano = Object.entries(porPlano)
      .map(([plano, info]) => ({ plano, count: info.count, receita: info.receita }))
      .sort((a, b) => b.count - a.count);
    
    // Guardar receita de conversões
    (data as any)._receitaConversoes = receitaTotalConversoes;
  };

  const processRenovacoesCustos = (jsonData: any[], data: DashboardData) => {
    let custoTotal = 0;
    let receitaTotalRenovacoes = 0;
    const porMes: Record<string, number> = {};
    const porPlano: Record<string, { count: number; receita: number }> = {};
    const hoje = new Date();
    
    jsonData.forEach(row => {
      const custo = safeNumber(row.Custo || row.custo);
      const planoInfo = mapCustoToPlano(custo);
      const preco = planoInfo.precoMedio;
      
      custoTotal += custo;
      receitaTotalRenovacoes += preco;
      
      // Análise por plano
      if (!porPlano[planoInfo.nome]) {
        porPlano[planoInfo.nome] = { count: 0, receita: 0 };
      }
      porPlano[planoInfo.nome].count++;
      porPlano[planoInfo.nome].receita += preco;
      
      const date = parseDate(row.Data || row.data);
      // Filtrar apenas datas válidas e até o mês atual
      if (date && date <= hoje && date.getFullYear() >= hoje.getFullYear() - 1) {
        const mesAno = getMonthYear(date);
        porMes[mesAno] = (porMes[mesAno] || 0) + 1;
      }
    });
    
    data.custoTotalRenovacoes = custoTotal;
    data.custoMedioRenovacao = jsonData.length > 0 ? custoTotal / jsonData.length : 0;
    data.renovacoesPorMes = sortByMesAno(
      Object.entries(porMes).map(([mes, count]) => ({ mes, count }))
    );
    data.renovacoesPorPlano = Object.entries(porPlano)
      .map(([plano, info]) => ({ plano, count: info.count, receita: info.receita }))
      .sort((a, b) => b.count - a.count);
    
    // Guardar receita de renovações
    (data as any)._receitaRenovacoes = receitaTotalRenovacoes;
  };

  const calculateDerivedMetrics = (data: DashboardData) => {
    // Taxa de conversão
    if (data.testes > 0) {
      data.taxaConversao = (data.conversoes / data.testes) * 100;
    }

    // Taxa de fidelidade
    if (data.totalRenovadores > 0) {
      data.taxaFidelidade = (data.clientesFieis / data.totalRenovadores) * 100;
    }

    // Churn rate e retenção
    const total = data.clientesAtivos + data.clientesExpirados;
    if (total > 0) {
      data.churnRate = (data.clientesExpirados / total) * 100;
      data.taxaRetencao = (data.clientesAtivos / total) * 100;
    }

    // Receita REAL baseada em vendas
    const receitaConversoes = (data as any)._receitaConversoes || 0;
    const receitaRenovacoes = (data as any)._receitaRenovacoes || 0;
    data.receitaTotal = receitaConversoes + receitaRenovacoes;
    
    // Ticket médio real
    const totalVendas = data.conversoes + data.renovacoes;
    if (totalVendas > 0) {
      data.ticketMedio = data.receitaTotal / totalVendas;
    }
    
    // MRR e ARR (estimativa baseada em clientes ativos × ticket médio)
    data.receitaMensal = data.clientesAtivos * data.ticketMedio;
    data.receitaAnual = data.receitaMensal * 12;
    
    // LTV (ticket médio × 6 meses)
    data.ltv = data.ticketMedio * 6;
    
    // CAC e ROAS
    const custoTotal = data.custoTotalConversoes + data.custoTotalRenovacoes;
    if (data.conversoes > 0) {
      data.cac = data.custoTotalConversoes / data.conversoes;
    }
    if (custoTotal > 0) {
      data.roas = data.receitaTotal / custoTotal;
    }
    
    // Mix de planos (combinando conversões e renovações)
    const mixMap: Record<string, number> = {};
    data.conversoesPorPlano.forEach(p => {
      mixMap[p.plano] = (mixMap[p.plano] || 0) + p.count;
    });
    data.renovacoesPorPlano.forEach(p => {
      mixMap[p.plano] = (mixMap[p.plano] || 0) + p.count;
    });
    
    const totalMix = Object.values(mixMap).reduce((a, b) => a + b, 0);
    data.mixPlanos = Object.entries(mixMap)
      .map(([plano, value]) => ({
        plano,
        value,
        percentual: totalMix > 0 ? (value / totalMix) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
    
    // Análise geográfica consolidada
    const estadoTotals: Record<string, number> = {};
    data.porEstado.forEach(e => {
      estadoTotals[e.estado] = e.testes + e.ativos + e.expirados;
    });
    
    const totalClientes = Object.values(estadoTotals).reduce((a, b) => a + b, 0);
    data.topEstados = Object.entries(estadoTotals)
      .map(([estado, total]) => ({
        estado,
        total,
        percentual: totalClientes > 0 ? (total / totalClientes) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    
    // Distribuição de renovações
    const renewalsCount: Record<string, number> = {};
    data.rawData.renovacoes.forEach(row => {
      const usuario = row.Usuario || row.usuario;
      if (usuario) {
        renewalsCount[usuario] = (renewalsCount[usuario] || 0) + 1;
      }
    });
    
    const dist = { '1 renovação': 0, '2-3 renovações': 0, '4-5 renovações': 0, '6+ renovações': 0 };
    Object.values(renewalsCount).forEach(count => {
      if (count === 1) dist['1 renovação']++;
      else if (count <= 3) dist['2-3 renovações']++;
      else if (count <= 5) dist['4-5 renovações']++;
      else dist['6+ renovações']++;
    });
    
    data.distribuicaoRenovacoes = Object.entries(dist).map(([categoria, count]) => ({ categoria, count }));
    
    // Tempo médio até conversão
    const tempos: number[] = [];
    data.rawData.conversoes.forEach(conv => {
      const usuario = conv.Usuario || conv.usuario;
      const dataConv = parseDate(conv.Data || conv.data);
      
      if (usuario && dataConv) {
        // Buscar teste do mesmo usuário
        const teste = data.rawData.testes.find(t => 
          (t.Usuario || t.usuario) === usuario
        );
        
        if (teste) {
          const dataTeste = parseDate(teste.Criado_Em || teste.criado_em);
          if (dataTeste) {
            const dias = daysDifference(dataTeste, dataConv);
            if (dias >= 0 && dias <= 365) { // Filtrar valores absurdos
              tempos.push(dias);
            }
          }
        }
      }
    });
    
    if (tempos.length > 0) {
      // Mediana
      tempos.sort((a, b) => a - b);
      const mid = Math.floor(tempos.length / 2);
      data.tempoMedioAteConversao = tempos.length % 2 === 0
        ? (tempos[mid - 1] + tempos[mid]) / 2
        : tempos[mid];
    }
    
    // Heatmap Hora × Dia da Semana
    const heatmap: Record<string, Record<number, number>> = {};
    const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    
    data.rawData.conversoes.forEach(row => {
      const date = parseDate(row.Data || row.data);
      if (date) {
        const dia = getDayOfWeek(date);
        const hora = date.getHours();
        
        if (!heatmap[dia]) heatmap[dia] = {};
        heatmap[dia][hora] = (heatmap[dia]?.[hora] || 0) + 1;
      }
    });
    
    data.heatmapHoraDia = [];
    dias.forEach(dia => {
      for (let hora = 0; hora < 24; hora++) {
        data.heatmapHoraDia.push({
          dia,
          hora,
          count: heatmap[dia]?.[hora] || 0
        });
      }
    });
  };

  const exportToExcel = () => {
    if (!dashboardData) return;

    const wb = XLSX.utils.book_new();
    
    // Resumo Geral
    const resumo = [[
      'Métrica', 'Valor'
    ], [
      'Total de Testes', dashboardData.testes
    ], [
      'Total de Conversões', dashboardData.conversoes
    ], [
      'Taxa de Conversão', `${(dashboardData.taxaConversao || 0).toFixed(2)}%`
    ], [
      'Clientes Ativos', dashboardData.clientesAtivos
    ], [
      'Clientes Expirados', dashboardData.clientesExpirados
    ], [
      'Churn Rate', `${(dashboardData.churnRate || 0).toFixed(2)}%`
    ], [
      'Taxa de Retenção', `${(dashboardData.taxaRetencao || 0).toFixed(2)}%`
    ], [
      'Taxa de Fidelidade', `${(dashboardData.taxaFidelidade || 0).toFixed(2)}%`
    ], [
      'Clientes Fiéis', dashboardData.clientesFieis
    ], [
      'Total de Renovações', dashboardData.renovacoes
    ], [
      'Receita Total', `R$ ${(dashboardData.receitaTotal || 0).toLocaleString('pt-BR')}`
    ], [
      'Receita Mensal (MRR)', `R$ ${(dashboardData.receitaMensal || 0).toLocaleString('pt-BR')}`
    ], [
      'Receita Anual (ARR)', `R$ ${(dashboardData.receitaAnual || 0).toLocaleString('pt-BR')}`
    ], [
      'Ticket Médio', `R$ ${(dashboardData.ticketMedio || 0).toFixed(2)}`
    ], [
      'LTV', `R$ ${(dashboardData.ltv || 0).toLocaleString('pt-BR')}`
    ], [
      'Tempo Médio até Conversão', `${(dashboardData.tempoMedioAteConversao || 0).toFixed(0)} dias`
    ], [
      'Saldo Médio Pós-Venda', `${(dashboardData.saldoMedioPosVenda || 0).toFixed(1)} créditos`
    ], [
      'Melhor Dia', dashboardData.melhorDia
    ]];
    
    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    // Dados por Dia da Semana
    const weekdayOrder = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
    const porDia = [['Dia da Semana', 'Testes', 'Conversões', 'Renovações']];
    weekdayOrder.forEach(day => {
      porDia.push([
        day,
        dashboardData.testesPorDia[day] || 0,
        dashboardData.conversoesPorDia[day] || 0,
        dashboardData.renovacoesPorDia[day] || 0
      ]);
    });
    const wsDia = XLSX.utils.aoa_to_sheet(porDia);
    XLSX.utils.book_append_sheet(wb, wsDia, 'Por Dia da Semana');

    // Top Times (se houver dados de jogos)
    if (dashboardData.hasGamesData && dashboardData.topTimes.length > 0) {
      const topTimes = [['Ranking', 'Time', 'Conversões']];
      dashboardData.topTimes.forEach((time, index) => {
        topTimes.push([index + 1, time.time, time.conversoes]);
      });
      const wsTimes = XLSX.utils.aoa_to_sheet(topTimes);
      XLSX.utils.book_append_sheet(wb, wsTimes, 'Top Times');
    }

    XLSX.writeFile(wb, 'relatorio-iptv-analytics.xlsx');
  };

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'retention', label: 'Retenção', icon: Activity },
    { id: 'conversion', label: 'Conversão', icon: TrendingUp },
  ];

  if (dashboardData && dashboardData.estadosCobertos > 0) {
    tabs.push({ id: 'geographic', label: 'Geográfico', icon: MapPin });
  }

  if (dashboardData && Object.keys(dashboardData.testesPorTurno || {}).length > 0) {
    tabs.push({ id: 'traffic', label: 'Tráfego', icon: Clock });
  }

  if (dashboardData?.hasGamesData) {
    tabs.push({ id: 'games', label: 'Jogos', icon: Trophy });
  }

  // Adicionar aba de Rastreamento (Em Breve)
  tabs.push({ id: 'tracking', label: 'Pixel', icon: Activity });

  // Extrair nome da revenda
  const nomeRevenda = dashboardData?.rawData?.ativos?.[0]?.Revenda || 
                      dashboardData?.rawData?.ativos?.[0]?.revenda || 
                      dashboardData?.rawData?.ativos?.[0]?.Revendedor || 
                      dashboardData?.rawData?.ativos?.[0]?.revendedor ||
                      dashboardData?.topRevendedores?.[0]?.revendedor || '';

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }


  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - CONGELADO NO TOPO */}
      <header className="bg-gradient-to-r from-[#0B0F18] via-[#121726] to-[#0B0F18] fixed top-0 left-0 right-0 z-50 shadow-2xl backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Título + Nome Revenda + Horário */}
            <div className="flex items-center gap-5">
              {/* Logo Aumentada */}
              <img src={logoImage} alt="AutonomyX Logo" className="w-16 h-16 object-contain" />
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-[#EAF2FF] font-semibold text-xl">AutonomyX - Dashboard</h1>
                  {localStorage.getItem('is_admin') === 'true' && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#000] text-[10px] font-bold rounded uppercase tracking-wider">
                      Admin Mode
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {nomeRevenda && (
                    <>
                      <span className="text-[#00BFFF] text-xs font-medium">{nomeRevenda}</span>
                      <span className="text-[#9FAAC6] text-xs">•</span>
                    </>
                  )}
                  <p className="text-[#9FAAC6] text-xs">✨ Gestão Inteligente de Clientes</p>
                </div>
              </div>
              
              {/* Horário Atual - Atualiza a cada minuto */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#1A2035]/50 rounded-lg border border-[#1E2840]">
                <Clock className="w-4 h-4 text-[#00BFFF]" />
                <div className="text-right">
                  <p className="text-[#EAF2FF] text-sm font-medium">
                    {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[#9FAAC6] text-xs">
                    {currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex items-center gap-3">
              {dashboardData && (
                <>
                  <div className="hidden md:block px-4 py-2 bg-[#1A2035]/50 rounded-lg border border-[#1E2840]">
                    <p className="text-[#9FAAC6] text-xs">127 usuários</p>
                  </div>
                  <Button onClick={exportToExcel} variant="outline" className="bg-[#121726] border-[#1E2840] text-[#EAF2FF] hover:bg-[#1A2035] hover:border-[#00BFFF] transition-all">
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar Relatório
                  </Button>
                </>
              )}
              <label htmlFor="file-upload">
                <Button asChild className="bg-gradient-to-r from-[#00BFFF] to-[#1E90FF] hover:from-[#1E90FF] hover:to-[#00BFFF] shadow-lg hover:shadow-[#00BFFF]/50 transition-all text-[#0B0F18] font-semibold">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {dashboardData ? 'Atualizar' : 'Carregar Excel'}
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="bg-[#121726] border-[#1E2840] text-[#ff4a9a] hover:bg-[#1A2035] hover:border-[#ff4a9a] transition-all"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Ticker Bar - Faixa Dinâmica FIXO (logo abaixo do header) */}
      {!isLoading && dashboardData && (
        <div className="fixed top-20 left-0 right-0 z-40">
          <TickerBar data={dashboardData} />
        </div>
      )}

      {/* Navigation Tabs - FIXO no topo abaixo do ticker (parte do header fixo) */}
      {!isLoading && dashboardData && (
        <div className="fixed top-[116px] left-0 right-0 z-30 bg-[#0B0F18] shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex gap-2 overflow-x-auto py-1.5">
              {tabs.map((tab) => (
                <CyberButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Espaçamento para compensar header fixo + ticker bar + menu fixo */}
      <div className={!isLoading && dashboardData ? "h-[168px]" : "h-20"}></div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#9FAAC6]">Processando dados...</p>
          </div>
        </div>
      )}

      {!isLoading && !dashboardData && (
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="p-12 text-center max-w-md bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-[#EAF2FF] text-2xl mb-3">Carregue seu arquivo Excel</h2>
            <p className="text-[#9FAAC6] mb-8">
              Faça upload do arquivo contendo as abas: Testes, Conversões, Renovações, Clientes Ativos e Clientes Expirados
            </p>
            <label htmlFor="file-upload-center">
              <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/50 transition-all">
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </span>
              </Button>
            </label>
            <input
              id="file-upload-center"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </Card>
        </div>
      )}

      {!isLoading && dashboardData && (
        <>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-6">
            {activeTab === 'dashboard' && <IPTVDashboard data={dashboardData} onNavigateToGames={() => setActiveTab('games')} />}
            {activeTab === 'financial' && <FinancialView data={dashboardData} />}
        {activeTab === 'clients' && (
          dashboardData ? (
            <ClientsView data={dashboardData} />
          ) : (
            <div className="p-10">
              <Card className="max-w-xl mx-auto p-8 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] text-center">
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="w-6 h-6 text-[#7B5CFF] animate-spin" />
                </div>
                <h3 className="text-[#EAF2FF] font-semibold">Carregando dados do painel</h3>
                <p className="text-[#8ea9d9] text-sm mt-2">
                  Aguarde alguns instantes enquanto sincronizamos seus clientes ativos e expirados.
                </p>
              </Card>
            </div>
          )
        )}
            {activeTab === 'retention' && <RetentionView data={dashboardData} />}
            {activeTab === 'conversion' && <ConversionView data={dashboardData} />}
            {activeTab === 'geographic' && <GeographicView data={dashboardData} />}
            {activeTab === 'traffic' && <TrafficView data={dashboardData} />}
            {activeTab === 'games' && <GamesView data={dashboardData} />}
            {activeTab === 'tracking' && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-12 text-center max-w-md bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#00BFFF] to-[#1E90FF] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Activity className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-[#EAF2FF] text-2xl mb-3">Pixel de Rastreamento</h2>
                  <p className="text-[#8ea9d9] mb-4">
                    Em breve você poderá rastrear suas campanhas de marketing via N8N integrado ao sistema.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00BFFF]/10 rounded-lg border border-[#00BFFF]/30">
                    <Clock className="w-4 h-4 text-[#00BFFF]" />
                    <span className="text-[#00BFFF] text-sm">Funcionalidade em Desenvolvimento</span>
                  </div>
                </Card>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}