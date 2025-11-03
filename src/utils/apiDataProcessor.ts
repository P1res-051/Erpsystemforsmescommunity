import { DashboardData } from '../App';
import {
  safeNumber,
  safePct,
  parseDate,
  enrichRowWithGeo,
  getDayOfWeek,
  getMonthYear,
  getTurnoFromDate,
  sortByMesAno,
  mapCustoToPlano,
  daysDifference,
} from './dataProcessing';

/**
 * Processa dados vindos da API real e transforma no formato DashboardData
 */
export function processApiData(apiData: any): DashboardData {
  console.log('🔄 Processando dados da API...', apiData);

  // Extrair arrays da API
  const ativos = apiData.ativos || [];
  const expirados = apiData.expirados || [];
  const testes = apiData.testes || [];
  const conversoes = apiData.conversoes || [];
  const renovacoes = apiData.renovacoes || [];

  // ===================================
  // MÉTRICAS PRINCIPAIS
  // ===================================
  const clientesAtivos = ativos.length;
  const clientesExpirados = expirados.length;
  const totalTestes = testes.length;
  const totalConversoes = conversoes.length;
  const totalRenovacoes = renovacoes.length;

  // ===================================
  // TAXAS CALCULADAS
  // ===================================
  const taxaConversao = safePct(totalConversoes, totalTestes);
  
  const totalClientes = clientesAtivos + clientesExpirados;
  const churnRate = safePct(clientesExpirados, totalClientes);
  const taxaRetencao = 100 - churnRate;

  // Fidelidade (clientes com 2+ renovações)
  const renovacoesPorCliente: Record<string, number> = {};
  renovacoes.forEach((ren: any) => {
    const usuario = ren.Usuario || ren.usuario;
    renovacoesPorCliente[usuario] = (renovacoesPorCliente[usuario] || 0) + 1;
  });
  
  const clientesFieis = Object.values(renovacoesPorCliente).filter(count => count >= 2).length;
  const totalRenovadores = Object.keys(renovacoesPorCliente).length;
  const taxaFidelidade = safePct(clientesFieis, totalRenovadores);

  // ===================================
  // FINANCEIRO
  // ===================================
  const custoTotalConversoes = conversoes.reduce((sum: number, c: any) => sum + safeNumber(c.Custo || c.custo), 0);
  const custoTotalRenovacoes = renovacoes.reduce((sum: number, r: any) => sum + safeNumber(r.Custo || r.custo), 0);
  const receitaTotal = custoTotalConversoes + custoTotalRenovacoes;

  const custoMedioConversao = totalConversoes > 0 ? custoTotalConversoes / totalConversoes : 0;
  const custoMedioRenovacao = totalRenovacoes > 0 ? custoTotalRenovacoes / totalRenovacoes : 0;

  const totalVendas = totalConversoes + totalRenovacoes;
  const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;

  const receitaMensal = clientesAtivos * ticketMedio;
  const receitaAnual = receitaMensal * 12;

  // LTV (assumindo 6 meses de vida média)
  const ltv = ticketMedio * 6;

  // CAC e ROAS (simplificados - ajustar conforme dados reais de marketing)
  const cac = custoMedioConversao * 0.3; // Estimativa: 30% do valor da conversão
  const roas = cac > 0 ? receitaTotal / (cac * totalConversoes) : 0;

  const saldoMedioPosVenda = conversoes.reduce((sum: number, c: any) => 
    sum + safeNumber(c.Creditos_Apos || c.creditos_apos || 0), 0) / (totalConversoes || 1);

  // ===================================
  // ANÁLISE POR PLANO
  // ===================================
  const conversoesPorPlano: Record<string, { count: number; receita: number }> = {};
  conversoes.forEach((c: any) => {
    const custo = safeNumber(c.Custo || c.custo);
    const plano = mapCustoToPlano(custo).nome;
    if (!conversoesPorPlano[plano]) {
      conversoesPorPlano[plano] = { count: 0, receita: 0 };
    }
    conversoesPorPlano[plano].count++;
    conversoesPorPlano[plano].receita += custo;
  });

  const renovacoesPorPlano: Record<string, { count: number; receita: number }> = {};
  renovacoes.forEach((r: any) => {
    const custo = safeNumber(r.Custo || r.custo);
    const plano = mapCustoToPlano(custo).nome;
    if (!renovacoesPorPlano[plano]) {
      renovacoesPorPlano[plano] = { count: 0, receita: 0 };
    }
    renovacoesPorPlano[plano].count++;
    renovacoesPorPlano[plano].receita += custo;
  });

  const mixPlanos = Object.entries(conversoesPorPlano).map(([plano, data]) => ({
    plano,
    value: data.receita,
    percentual: safePct(data.receita, receitaTotal),
  }));

  // ===================================
  // GEOGRÁFICO
  // ===================================
  const porEstado: Record<string, any> = {};
  
  [...ativos, ...expirados, ...testes].forEach((cliente: any) => {
    const uf = cliente.UF || cliente.uf || '';
    if (!uf) return;
    
    if (!porEstado[uf]) {
      porEstado[uf] = { estado: uf, testes: 0, conversoes: 0, ativos: 0, expirados: 0 };
    }
    
    const status = (cliente.Status || cliente.status || '').toLowerCase();
    if (status === 'trial' || status === 'teste') {
      porEstado[uf].testes++;
    } else if (status === 'enabled' || status === 'ativo') {
      porEstado[uf].ativos++;
    } else if (status === 'disabled' || status === 'expirado') {
      porEstado[uf].expirados++;
    }
  });

  const porEstadoArray = Object.values(porEstado);
  const topEstados = porEstadoArray
    .map((e: any) => ({
      estado: e.estado,
      total: e.ativos + e.expirados,
      percentual: safePct(e.ativos + e.expirados, totalClientes),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const porDDD: Record<string, number> = {};
  [...ativos, ...expirados, ...testes].forEach((cliente: any) => {
    const ddd = cliente.DDD || cliente.ddd || '';
    if (ddd) {
      porDDD[ddd] = (porDDD[ddd] || 0) + 1;
    }
  });

  const porDDDArray = Object.entries(porDDD)
    .map(([ddd, count]) => ({ ddd, count }))
    .sort((a, b) => b.count - a.count);

  // ===================================
  // TEMPORAL
  // ===================================
  const conversoesPorDia: Record<string, number> = {};
  conversoes.forEach((c: any) => {
    const data = c.Data || c.data;
    if (data) {
      const dia = getDayOfWeek(parseDate(data) || new Date());
      conversoesPorDia[dia] = (conversoesPorDia[dia] || 0) + 1;
    }
  });

  const melhorDiaEntry = Object.entries(conversoesPorDia).sort((a, b) => b[1] - a[1])[0];
  const melhorDia = melhorDiaEntry ? melhorDiaEntry[0] : 'N/A';
  const melhorDiaCount = melhorDiaEntry ? melhorDiaEntry[1] : 0;

  // ===================================
  // RETORNAR DADOS PROCESSADOS
  // ===================================
  return {
    // Métricas principais
    testes: totalTestes,
    conversoes: totalConversoes,
    renovacoes: totalRenovacoes,
    clientesAtivos,
    clientesExpirados,
    
    // Taxas
    taxaConversao,
    taxaFidelidade,
    churnRate,
    taxaRetencao,
    
    // Financeiro
    ticketMedio,
    receitaMensal,
    receitaAnual,
    receitaTotal,
    ltv,
    custoTotalConversoes,
    custoTotalRenovacoes,
    custoMedioConversao,
    custoMedioRenovacao,
    cac,
    roas,
    saldoMedioPosVenda,
    
    // Por plano
    conversoesPorPlano: Object.entries(conversoesPorPlano).map(([plano, data]) => ({
      plano,
      count: data.count,
      receita: data.receita,
    })),
    renovacoesPorPlano: Object.entries(renovacoesPorPlano).map(([plano, data]) => ({
      plano,
      count: data.count,
      receita: data.receita,
    })),
    mixPlanos,
    
    // Temporal
    melhorDia,
    melhorDiaCount,
    testesPorDia: {},
    conversoesPorDia,
    renovacoesPorDia: {},
    testesPorMes: [],
    conversoesPorMes: [],
    renovacoesPorMes: [],
    tempoMedioAteConversao: 0,
    heatmapHoraDia: [],
    
    // Turnos
    testesPorTurno: {},
    conversoesPorTurno: {},
    renovacoesPorTurno: {},
    melhorTurno: 'Noite',
    melhorTurnoCount: 0,
    
    // Geográfico
    porEstado: porEstadoArray,
    porDDD: porDDDArray,
    topEstados,
    estadosCobertos: Object.keys(porEstado).length,
    
    // Conexões
    conexoesPorTipo: {},
    mediaConexoes: 0,
    maxConexoes: 0,
    
    // Clientes
    clientesFieis,
    totalRenovadores,
    clientesData: ativos,
    recentClients: ativos.slice(0, 10),
    distribuicaoRenovacoes: [],
    
    // Status
    statusDistribution: {
      ativos: clientesAtivos,
      expirados: clientesExpirados,
      testes: totalTestes,
    },
    
    // Revendedores
    topRevendedores: [],
    
    // Jogos
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
      conversoes,
      renovacoes,
      ativos,
      expirados,
      jogos: [],
      convJogos: [],
    },
  };
}
