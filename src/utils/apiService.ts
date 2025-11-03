/**
 * Serviço de API Real - AutonomyX Dashboard
 * Gerencia todas as chamadas para a API do backend
 */

const API_BASE_URL = 'https://automatixbest-api.automation.app.br/api/painel';

// ==========================================
// UTILITÁRIOS DE DATA
// ==========================================

/**
 * Parse seguro de datas da API
 * Converte "2024-10-02 09:00:00" → "2024-10-02T09:00:00" → Date
 */
export function parseApiDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  
  // "2024-10-02 09:00:00" -> "2024-10-02T09:00:00"
  const iso = str.replace(' ', 'T');
  const d = new Date(iso);
  
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Verifica se duas datas são do mesmo dia
 */
export function isSameDay(date: Date, year: number, month: number, day: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

/**
 * Retorna a data de ontem
 */
export function getYesterdayBase() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
}

/**
 * Retorna a data de hoje
 */
export function getTodayBase() {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
}

/**
 * Retorna base de uma data específica
 */
export function getDateBase(daysAgo: number = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return { y: date.getFullYear(), m: date.getMonth(), d: date.getDate() };
}

// ==========================================
// API CALLS
// ==========================================

/**
 * Login e obtenção do cache_key
 */
export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) {
    throw new Error('Falha no login');
  }
  
  const data = await response.json();
  return data.cache_key; // Ex: "panel:data:usuarioX"
}

/**
 * Atualiza o cache no Redis (executa todos os processamentos)
 */
export async function executeAll(cacheKey: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/execute-all?cache_key=${cacheKey}`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Falha ao atualizar cache');
  }
}

/**
 * Busca lista de renovações
 */
export async function getRenewals(cacheKey: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/get-renewals?cache_key=${cacheKey}`);
  
  if (!response.ok) {
    throw new Error('Falha ao buscar renovações');
  }
  
  return response.json();
}

/**
 * Busca lista de conversões
 */
export async function getConversions(cacheKey: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/get-conversions?cache_key=${cacheKey}`);
  
  if (!response.ok) {
    throw new Error('Falha ao buscar conversões');
  }
  
  return response.json();
}

/**
 * Busca lista de clientes expirados
 */
export async function getClientsExpired(cacheKey: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/get-clients-expired?cache_key=${cacheKey}`);
  
  if (!response.ok) {
    throw new Error('Falha ao buscar expirados');
  }
  
  return response.json();
}

/**
 * Busca lista de clientes ativos
 */
export async function getClientsActive(cacheKey: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/get-clients-active?cache_key=${cacheKey}`);
  
  if (!response.ok) {
    throw new Error('Falha ao buscar ativos');
  }
  
  return response.json();
}

/**
 * Busca lista de testes
 */
export async function getTests(cacheKey: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/get-tests?cache_key=${cacheKey}`);
  
  if (!response.ok) {
    throw new Error('Falha ao buscar testes');
  }
  
  return response.json();
}

// ==========================================
// FUNÇÕES DE CONTAGEM POR DATA
// ==========================================

/**
 * Conta renovações de um dia específico
 */
export async function contarRenovacoesDia(cacheKey: string, daysAgo: number = 0): Promise<number> {
  const lista = await getRenewals(cacheKey);
  const { y, m, d } = getDateBase(daysAgo);
  
  let count = 0;
  for (const item of lista) {
    const dt = parseApiDate(item.Data);
    if (!dt) continue;
    if (isSameDay(dt, y, m, d)) count++;
  }
  
  return count;
}

/**
 * Conta conversões de um dia específico
 */
export async function contarConversoesDia(cacheKey: string, daysAgo: number = 0): Promise<number> {
  const lista = await getConversions(cacheKey);
  const { y, m, d } = getDateBase(daysAgo);
  
  let count = 0;
  for (const item of lista) {
    const dt = parseApiDate(item.Data);
    if (!dt) continue;
    if (isSameDay(dt, y, m, d)) count++;
  }
  
  return count;
}

/**
 * Conta expirados de um dia específico
 */
export async function contarExpiradosDia(cacheKey: string, daysAgo: number = 0): Promise<number> {
  const lista = await getClientsExpired(cacheKey);
  const { y, m, d } = getDateBase(daysAgo);
  
  let count = 0;
  for (const cli of lista) {
    const dt = parseApiDate(cli.Expira_Em);
    if (!dt) continue;
    if (isSameDay(dt, y, m, d)) count++;
  }
  
  return count;
}

/**
 * Busca dados completos de um dia específico
 */
export async function getDadosDia(cacheKey: string, daysAgo: number = 0) {
  const [renovacoes, conversoes, expirados] = await Promise.all([
    contarRenovacoesDia(cacheKey, daysAgo),
    contarConversoesDia(cacheKey, daysAgo),
    contarExpiradosDia(cacheKey, daysAgo)
  ]);
  
  return {
    renovacoes,
    conversoes,
    expirados
  };
}

/**
 * Busca dados de ontem
 */
export async function getDadosOntem(cacheKey: string) {
  return getDadosDia(cacheKey, 1);
}

/**
 * Busca dados de hoje
 */
export async function getDadosHoje(cacheKey: string) {
  return getDadosDia(cacheKey, 0);
}

// ==========================================
// AGRUPAMENTO POR DATA (para calendário)
// ==========================================

export interface DadosPorData {
  conversoes: number;
  receitaConversoes: number;
  renovacoes: number;
  receitaRenovacoes: number;
}

/**
 * Agrupa renovações por data
 */
export async function agruparRenovacoesPorData(cacheKey: string): Promise<Record<string, DadosPorData>> {
  const lista = await getRenewals(cacheKey);
  const resultado: Record<string, DadosPorData> = {};
  
  for (const item of lista) {
    const dt = parseApiDate(item.Data);
    if (!dt) continue;
    
    dt.setHours(0, 0, 0, 0);
    const dateKey = dt.toISOString().split('T')[0];
    
    if (!resultado[dateKey]) {
      resultado[dateKey] = { conversoes: 0, receitaConversoes: 0, renovacoes: 0, receitaRenovacoes: 0 };
    }
    
    resultado[dateKey].renovacoes++;
    resultado[dateKey].receitaRenovacoes += (item.Custo || item.custo || 0);
  }
  
  return resultado;
}

/**
 * Agrupa conversões por data
 */
export async function agruparConversoesPorData(cacheKey: string): Promise<Record<string, DadosPorData>> {
  const lista = await getConversions(cacheKey);
  const resultado: Record<string, DadosPorData> = {};
  
  for (const item of lista) {
    const dt = parseApiDate(item.Data);
    if (!dt) continue;
    
    dt.setHours(0, 0, 0, 0);
    const dateKey = dt.toISOString().split('T')[0];
    
    if (!resultado[dateKey]) {
      resultado[dateKey] = { conversoes: 0, receitaConversoes: 0, renovacoes: 0, receitaRenovacoes: 0 };
    }
    
    resultado[dateKey].conversoes++;
    resultado[dateKey].receitaConversoes += (item.Custo || item.custo || 0);
  }
  
  return resultado;
}

/**
 * Agrupa todos os dados por data (conversões + renovações)
 */
export async function agruparTodosDadosPorData(cacheKey: string): Promise<Record<string, DadosPorData>> {
  const [conversoes, renovacoes] = await Promise.all([
    agruparConversoesPorData(cacheKey),
    agruparRenovacoesPorData(cacheKey)
  ]);
  
  // Mesclar os dois objetos
  const resultado: Record<string, DadosPorData> = {};
  
  // Adicionar conversões
  Object.keys(conversoes).forEach(dateKey => {
    resultado[dateKey] = { ...conversoes[dateKey] };
  });
  
  // Adicionar renovações
  Object.keys(renovacoes).forEach(dateKey => {
    if (!resultado[dateKey]) {
      resultado[dateKey] = { conversoes: 0, receitaConversoes: 0, renovacoes: 0, receitaRenovacoes: 0 };
    }
    resultado[dateKey].renovacoes += renovacoes[dateKey].renovacoes;
    resultado[dateKey].receitaRenovacoes += renovacoes[dateKey].receitaRenovacoes;
  });
  
  return resultado;
}

/**
 * Agrupa perdas (expirados) por data
 */
export async function agruparPerdasPorData(cacheKey: string): Promise<Record<string, number>> {
  const lista = await getClientsExpired(cacheKey);
  const resultado: Record<string, number> = {};
  
  for (const item of lista) {
    const dt = parseApiDate(item.Expira_Em);
    if (!dt) continue;
    
    dt.setHours(0, 0, 0, 0);
    const dateKey = dt.toISOString().split('T')[0];
    
    resultado[dateKey] = (resultado[dateKey] || 0) + 1;
  }
  
  return resultado;
}

// ==========================================
// FLUXO COMPLETO
// ==========================================

/**
 * Executa o fluxo completo: atualiza cache e retorna dados agrupados
 */
export async function atualizarEBuscarDados(cacheKey: string) {
  // 1. Atualizar cache
  await executeAll(cacheKey);
  
  // 2. Buscar todos os dados em paralelo
  const [dadosPorData, perdasPorData] = await Promise.all([
    agruparTodosDadosPorData(cacheKey),
    agruparPerdasPorData(cacheKey)
  ]);
  
  return {
    dadosPorData,
    perdasPorData
  };
}
