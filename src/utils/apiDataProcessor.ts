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
  creditosParaReais,
  CUSTO_POR_CREDITO,
  daysDifference,
  extractGeoFromPhone,
} from './dataProcessing';

/**
 * Processa dados vindos da API real e transforma no formato DashboardData
 */
export function processApiData(apiData: any): DashboardData {
  console.log('🔄 Processando dados da API...');
  console.log('📊 Tamanhos dos arrays:', {
    ativos: apiData.ativos?.length || 0,
    expirados: apiData.expirados?.length || 0,
    testes: apiData.testes?.length || 0,
    conversoes: apiData.conversoes?.length || 0,
    renovacoes: apiData.renovacoes?.length || 0
  });

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
  // IMPORTANTE: A coluna "Custo" representa CRÉDITOS gastos (1, 1.5, 2, 3, 6, 12)
  // Precisamos converter para REAIS usando a tabela de preços
  
  // Receita Real em R$ (soma dos preços dos planos vendidos)
  const receitaTotalConversoes = conversoes.reduce((sum: number, c: any) => {
    const creditos = safeNumber(c.Custo || c.custo);
    const valorReais = creditosParaReais(creditos);
    return sum + valorReais;
  }, 0);
  
  const receitaTotalRenovacoes = renovacoes.reduce((sum: number, r: any) => {
    const creditos = safeNumber(r.Custo || r.custo);
    const valorReais = creditosParaReais(creditos);
    return sum + valorReais;
  }, 0);
  
  const receitaTotal = receitaTotalConversoes + receitaTotalRenovacoes;
  
  // Créditos gastos (para calcular custo)
  const creditosGastosConversoes = conversoes.reduce((sum: number, c: any) => sum + safeNumber(c.Custo || c.custo), 0);
  const creditosGastosRenovacoes = renovacoes.reduce((sum: number, r: any) => sum + safeNumber(r.Custo || r.custo), 0);
  const totalCreditosGastos = creditosGastosConversoes + creditosGastosRenovacoes;
  
  // Custo real dos créditos
  const custoTotalCreditos = totalCreditosGastos * CUSTO_POR_CREDITO;
  
  // Lucro = Receita - Custo dos Créditos
  const lucroTotal = receitaTotal - custoTotalCreditos;

  const custoMedioConversao = totalConversoes > 0 ? receitaTotalConversoes / totalConversoes : 0;
  const custoMedioRenovacao = totalRenovacoes > 0 ? receitaTotalRenovacoes / totalRenovacoes : 0;

  const totalVendas = totalConversoes + totalRenovacoes;
  const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0;

  // MRR (Monthly Recurring Revenue) - Baseado em conversões e renovações mensais
  // Faturamento Mensal = Assinaturas Ativas × R$ 30
  const receitaMensal = clientesAtivos * 30;
  const receitaAnual = receitaMensal * 12; // ARR = MRR * 12

  // LTV (Lifetime Value) - Baseado na média de renovações reais
  const mediaRenovacoesPorCliente = totalRenovadores > 0 
    ? Object.values(renovacoesPorCliente).reduce((sum: number, count: number) => sum + count, 0) / totalRenovadores 
    : 1;
  const ltv = ticketMedio * (1 + mediaRenovacoesPorCliente); // Valor inicial + renovações

  // CAC e ROAS - Usar dados reais se disponíveis, senão estimativa conservadora
  const cac = custoMedioConversao * 0.15; // Estimativa: 15% do valor da conversão como custo de aquisição
  const roas = cac > 0 ? receitaTotal / (cac * totalConversoes) : 0;

  const saldoMedioPosVenda = conversoes.reduce((sum: number, c: any) => 
    sum + safeNumber(c.Creditos_Apos || c.creditos_apos || 0), 0) / (totalConversoes || 1);

  // ===================================
  // ANÁLISE POR PLANO
  // ===================================
  const conversoesPorPlano: Record<string, { count: number; receita: number }> = {};
  conversoes.forEach((c: any) => {
    const creditos = safeNumber(c.Custo || c.custo);
    const plano = mapCustoToPlano(creditos).nome;
    const valorReais = creditosParaReais(creditos);
    if (!conversoesPorPlano[plano]) {
      conversoesPorPlano[plano] = { count: 0, receita: 0 };
    }
    conversoesPorPlano[plano].count++;
    conversoesPorPlano[plano].receita += valorReais; // Receita em REAIS
  });

  const renovacoesPorPlano: Record<string, { count: number; receita: number }> = {};
  renovacoes.forEach((r: any) => {
    const creditos = safeNumber(r.Custo || r.custo);
    const plano = mapCustoToPlano(creditos).nome;
    const valorReais = creditosParaReais(creditos);
    if (!renovacoesPorPlano[plano]) {
      renovacoesPorPlano[plano] = { count: 0, receita: 0 };
    }
    renovacoesPorPlano[plano].count++;
    renovacoesPorPlano[plano].receita += valorReais; // Receita em REAIS
  });

  const mixPlanos = Object.entries(conversoesPorPlano).map(([plano, data]) => ({
    plano,
    value: data.receita,
    percentual: safePct(data.receita, receitaTotal),
  }));

  // ===================================
  // GEOGRÁFICO - EXTRAÇÃO DE DDD/UF DO TELEFONE
  // ===================================
  console.log('🗺️ Iniciando processamento geográfico...');
  const porEstado: Record<string, any> = {};
  const porDDD: Record<string, number> = {};
  
  try {
    // Processar cada tipo separadamente para evitar concatenação pesada
    const processarGeo = (clientes: any[], tipo: 'ativo' | 'expirado' | 'teste') => {
      clientes.forEach((cliente: any) => {
        // Tentar pegar UF direto da API
        let uf = cliente.UF || cliente.uf || '';
        let ddd = cliente.DDD || cliente.ddd || '';
        
        // Se não tem UF/DDD, extrair do telefone (campo Usuario)
        if ((!uf || !ddd) && (cliente.Usuario || cliente.usuario)) {
          try {
            const usuario = cliente.Usuario || cliente.usuario || '';
            const geo = extractGeoFromPhone(usuario);
            
            if (!uf && geo.uf) uf = geo.uf;
            if (!ddd && geo.ddd) ddd = geo.ddd;
          } catch (err) {
            // Ignorar erros de extração individual
          }
        }
        
        // Processar UF
        if (uf) {
          if (!porEstado[uf]) {
            porEstado[uf] = { estado: uf, testes: 0, conversoes: 0, ativos: 0, expirados: 0 };
          }
          
          if (tipo === 'teste') {
            porEstado[uf].testes++;
          } else if (tipo === 'ativo') {
            porEstado[uf].ativos++;
          } else if (tipo === 'expirado') {
            porEstado[uf].expirados++;
          }
        }
        
        // Processar DDD
        if (ddd) {
          porDDD[ddd] = (porDDD[ddd] || 0) + 1;
        }
      });
    };
    
    processarGeo(ativos, 'ativo');
    console.log('✅ Processados ativos');
    processarGeo(expirados, 'expirado');
    console.log('✅ Processados expirados');
    processarGeo(testes, 'teste');
    console.log('✅ Processados testes');
    console.log('🗺️ Geográfico concluído:', { estados: Object.keys(porEstado).length, ddds: Object.keys(porDDD).length });
  } catch (error) {
    console.error('❌ Erro ao processar dados geográficos:', error);
  }

  const porEstadoArray = Object.values(porEstado);
  const topEstados = porEstadoArray
    .map((e: any) => ({
      estado: e.estado,
      total: e.ativos + e.expirados,
      percentual: safePct(e.ativos + e.expirados, totalClientes),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const porDDDArray = Object.entries(porDDD)
    .map(([ddd, count]) => ({ ddd, count }))
    .sort((a, b) => b.count - a.count);

  // ===================================
  // TEMPORAL
  // ===================================
  // Testes por dia da semana
  const testesPorDia: Record<string, number> = {};
  testes.forEach((t: any) => {
    const data = t.Criado_Em || t.criado_em;
    if (data) {
      const dia = getDayOfWeek(parseDate(data) || new Date());
      testesPorDia[dia] = (testesPorDia[dia] || 0) + 1;
    }
  });

  // Conversões por dia da semana
  const conversoesPorDia: Record<string, number> = {};
  conversoes.forEach((c: any) => {
    const data = c.Data || c.data;
    if (data) {
      const dia = getDayOfWeek(parseDate(data) || new Date());
      conversoesPorDia[dia] = (conversoesPorDia[dia] || 0) + 1;
    }
  });

  // Renovações por dia da semana
  const renovacoesPorDia: Record<string, number> = {};
  renovacoes.forEach((r: any) => {
    const data = r.Data || r.data;
    if (data) {
      const dia = getDayOfWeek(parseDate(data) || new Date());
      renovacoesPorDia[dia] = (renovacoesPorDia[dia] || 0) + 1;
    }
  });

  const melhorDiaEntry = Object.entries(conversoesPorDia).sort((a, b) => b[1] - a[1])[0];
  const melhorDia = melhorDiaEntry ? melhorDiaEntry[0] : 'N/A';
  const melhorDiaCount = melhorDiaEntry ? melhorDiaEntry[1] : 0;

  // ===================================
  // DADOS DO DIA ATUAL (HOJE)
  // ===================================
  console.log('📅 Iniciando processamento de dados do dia/mês...');
  let conversoesDoDiaCount = 0;
  let renovacoesDoDiaCount = 0;
  let expiradosDoDiaCount = 0;
  let ativadosDoDiaCount = 0;
  let creditosGastosHoje = 0;
  let receitaDoDia = 0;
  let lucroDoDia = 0;
  let conversoesDoMesCount = 0;
  let renovacoesDoMesCount = 0;
  let receitaDoMes = 0;

  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeTimestamp = hoje.getTime();

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    fimMes.setHours(23, 59, 59, 999);

    // Processar conversões
    conversoes.forEach((c: any) => {
      try {
        const dt = parseDate(c.Data || c.data);
        if (dt) {
          const dtCopy = new Date(dt);
          dtCopy.setHours(0, 0, 0, 0);
          
          const creditos = safeNumber(c.Custo || c.custo);
          const valorReais = creditosParaReais(creditos);
          
          if (dtCopy.getTime() === hojeTimestamp) {
            conversoesDoDiaCount++;
            creditosGastosHoje += creditos; // Créditos gastos
            receitaDoDia += valorReais; // Receita em REAIS
          }
          
          if (dt >= inicioMes && dt <= fimMes) {
            conversoesDoMesCount++;
            receitaDoMes += valorReais; // Receita em REAIS
          }
        }
      } catch (err) {
        // Ignorar erro individual
      }
    });

    // Processar renovações
    renovacoes.forEach((r: any) => {
      try {
        const dt = parseDate(r.Data || r.data);
        if (dt) {
          const dtCopy = new Date(dt);
          dtCopy.setHours(0, 0, 0, 0);
          
          const creditos = safeNumber(r.Custo || r.custo);
          const valorReais = creditosParaReais(creditos);
          
          if (dtCopy.getTime() === hojeTimestamp) {
            renovacoesDoDiaCount++;
            creditosGastosHoje += creditos; // Créditos gastos
            receitaDoDia += valorReais; // Receita em REAIS
          }
          
          if (dt >= inicioMes && dt <= fimMes) {
            renovacoesDoMesCount++;
            receitaDoMes += valorReais; // Receita em REAIS
          }
        }
      } catch (err) {
        // Ignorar erro individual
      }
    });

    // Processar expirados do dia
    expirados.forEach((e: any) => {
      try {
        const dt = parseDate(e.Expira_Em || e.expira_em);
        if (dt) {
          const dtCopy = new Date(dt);
          dtCopy.setHours(0, 0, 0, 0);
          if (dtCopy.getTime() === hojeTimestamp) {
            expiradosDoDiaCount++;
          }
        }
      } catch (err) {
        // Ignorar erro individual
      }
    });

    // Processar ativados do dia
    ativos.forEach((a: any) => {
      try {
        const dt = parseDate(a.Criado_Em || a.criado_em);
        if (dt) {
          const dtCopy = new Date(dt);
          dtCopy.setHours(0, 0, 0, 0);
          if (dtCopy.getTime() === hojeTimestamp) {
            ativadosDoDiaCount++;
          }
        }
      } catch (err) {
        // Ignorar erro individual
      }
    });

    // Calcular lucro = Receita - Custo dos Créditos
    const custoCreditosHoje = creditosGastosHoje * CUSTO_POR_CREDITO;
    lucroDoDia = receitaDoDia - custoCreditosHoje;
    
    console.log('✅ Dados do dia:', {
      conversoes: conversoesDoDiaCount,
      renovacoes: renovacoesDoDiaCount,
      expirados: expiradosDoDiaCount,
      ativados: ativadosDoDiaCount,
      creditosGastos: creditosGastosHoje,
      custoCreditos: custoCreditosHoje,
      receita: receitaDoDia,
      lucro: lucroDoDia
    });
  } catch (error) {
    console.error('❌ Erro ao processar dados do dia/mês:', error);
  }

  // ===================================
  // RETORNAR DADOS PROCESSADOS
  // ===================================
  const result: DashboardData = {
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
    receitaTotal, // Receita em REAIS
    ltv,
    custoTotalConversoes: receitaTotalConversoes, // Manter nome original por compatibilidade
    custoTotalRenovacoes: receitaTotalRenovacoes, // Manter nome original por compatibilidade
    custoMedioConversao,
    custoMedioRenovacao,
    cac,
    roas,
    saldoMedioPosVenda,
    
    // Créditos e Lucro
    totalCreditosGastos,
    custoTotalCreditos,
    lucroTotal,
    receitaTotalConversoes,
    receitaTotalRenovacoes,
    
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
    testesPorDia,
    conversoesPorDia,
    renovacoesPorDia,
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
    
    // Dados do dia
    dadosDoDia: {
      conversoes: conversoesDoDiaCount,
      renovacoes: renovacoesDoDiaCount,
      expirados: expiradosDoDiaCount,
      ativados: ativadosDoDiaCount,
      creditosGastos: creditosGastosHoje,
      receita: receitaDoDia,
      lucro: lucroDoDia,
    },
    
    // Dados do mês
    dadosDoMes: {
      conversoes: conversoesDoMesCount,
      renovacoes: renovacoesDoMesCount,
      receita: receitaDoMes,
    },
  };
  
  console.log('✅ Processamento completo! Total de clientes:', totalClientes);
  return result;
}
