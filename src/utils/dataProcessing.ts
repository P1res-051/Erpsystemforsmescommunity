// Utilitários para processamento de dados IPTV

// Mapeamento completo DDD → UF → Região
export const DDD_MAP: Record<string, { uf: string; regiao: string }> = {
  // Sudeste
  '11': { uf: 'SP', regiao: 'SE' }, '12': { uf: 'SP', regiao: 'SE' }, '13': { uf: 'SP', regiao: 'SE' },
  '14': { uf: 'SP', regiao: 'SE' }, '15': { uf: 'SP', regiao: 'SE' }, '16': { uf: 'SP', regiao: 'SE' },
  '17': { uf: 'SP', regiao: 'SE' }, '18': { uf: 'SP', regiao: 'SE' }, '19': { uf: 'SP', regiao: 'SE' },
  '21': { uf: 'RJ', regiao: 'SE' }, '22': { uf: 'RJ', regiao: 'SE' }, '24': { uf: 'RJ', regiao: 'SE' },
  '27': { uf: 'ES', regiao: 'SE' }, '28': { uf: 'ES', regiao: 'SE' },
  '31': { uf: 'MG', regiao: 'SE' }, '32': { uf: 'MG', regiao: 'SE' }, '33': { uf: 'MG', regiao: 'SE' },
  '34': { uf: 'MG', regiao: 'SE' }, '35': { uf: 'MG', regiao: 'SE' }, '37': { uf: 'MG', regiao: 'SE' },
  '38': { uf: 'MG', regiao: 'SE' },
  
  // Sul
  '41': { uf: 'PR', regiao: 'S' }, '42': { uf: 'PR', regiao: 'S' }, '43': { uf: 'PR', regiao: 'S' },
  '44': { uf: 'PR', regiao: 'S' }, '45': { uf: 'PR', regiao: 'S' }, '46': { uf: 'PR', regiao: 'S' },
  '47': { uf: 'SC', regiao: 'S' }, '48': { uf: 'SC', regiao: 'S' }, '49': { uf: 'SC', regiao: 'S' },
  '51': { uf: 'RS', regiao: 'S' }, '53': { uf: 'RS', regiao: 'S' }, '54': { uf: 'RS', regiao: 'S' },
  '55': { uf: 'RS', regiao: 'S' },
  
  // Centro-Oeste
  '61': { uf: 'DF', regiao: 'CO' }, '62': { uf: 'GO', regiao: 'CO' }, '64': { uf: 'GO', regiao: 'CO' },
  '63': { uf: 'TO', regiao: 'N' }, // TO é Norte administrativamente
  '65': { uf: 'MT', regiao: 'CO' }, '66': { uf: 'MT', regiao: 'CO' }, '67': { uf: 'MS', regiao: 'CO' },
  
  // Norte
  '68': { uf: 'AC', regiao: 'N' }, '69': { uf: 'RO', regiao: 'N' },
  '91': { uf: 'PA', regiao: 'N' }, '93': { uf: 'PA', regiao: 'N' }, '94': { uf: 'PA', regiao: 'N' },
  '92': { uf: 'AM', regiao: 'N' }, '97': { uf: 'AM', regiao: 'N' },
  '95': { uf: 'RR', regiao: 'N' }, '96': { uf: 'AP', regiao: 'N' },
  
  // Nordeste
  '71': { uf: 'BA', regiao: 'NE' }, '73': { uf: 'BA', regiao: 'NE' }, '74': { uf: 'BA', regiao: 'NE' },
  '75': { uf: 'BA', regiao: 'NE' }, '77': { uf: 'BA', regiao: 'NE' },
  '79': { uf: 'SE', regiao: 'NE' }, '82': { uf: 'AL', regiao: 'NE' },
  '81': { uf: 'PE', regiao: 'NE' }, '87': { uf: 'PE', regiao: 'NE' },
  '83': { uf: 'PB', regiao: 'NE' }, '84': { uf: 'RN', regiao: 'NE' },
  '85': { uf: 'CE', regiao: 'NE' }, '88': { uf: 'CE', regiao: 'NE' },
  '86': { uf: 'PI', regiao: 'NE' }, '89': { uf: 'PI', regiao: 'NE' },
  '98': { uf: 'MA', regiao: 'NE' }, '99': { uf: 'MA', regiao: 'NE' },
};

// Mapeamento reverso para compatibilidade
export const DDD_TO_UF: Record<string, string> = Object.fromEntries(
  Object.entries(DDD_MAP).map(([ddd, { uf }]) => [ddd, uf])
);

// Nomes completos das regiões
export const REGION_NAMES: Record<string, string> = {
  'SE': 'Sudeste',
  'S': 'Sul',
  'CO': 'Centro-Oeste',
  'N': 'Norte',
  'NE': 'Nordeste',
};

// Mapeamento UF → Região (formato longo)
export const UF_TO_REGION: Record<string, string> = {
  'AC': 'Norte', 'AP': 'Norte', 'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
  'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 
  'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
  'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
  'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
  'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul',
};

// Nomes completos dos estados
export const STATE_NAMES: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
  'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
  'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
  'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
  'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins',
};

// Configuração de turnos
export const TURNOS = {
  madrugada: { start: '00:00', end: '05:59', label: 'Madrugada' },
  manha: { start: '06:00', end: '11:59', label: 'Manhã' },
  tarde: { start: '12:00', end: '17:59', label: 'Tarde' },
  noite: { start: '18:00', end: '23:59', label: 'Noite' },
};

/**
 * Normaliza string: lowercase, sem acentos, sem espaços extras
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim()
    .replace(/\s+/g, ' '); // Normaliza espaços
}

/**
 * Parse seguro de número com fallback para 0
 */
export function safeNumber(value: any): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Calcula percentual de forma segura
 */
export function safePct(numerator: number, denominator: number): number {
  if (denominator === 0 || !denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10; // 1 casa decimal
}

/**
 * 🔧 MAPEAMENTO DE CAMPOS CASE-INSENSITIVE
 * Permite ler diferentes variações de nomes de colunas
 */
export const FIELD_MAPPINGS = {
  usuario: ['Usuario', 'USUARIO', 'user', 'User', 'usuario', 'login', 'Login'],
  criado: ['Criado_Em', 'CriadoEm', 'Criado', 'CRIADO_EM', 'criado_em', 'created_at', 'createdAt', 'Data_Criacao', 'data_criacao'],
  data: ['Data', 'DATA', 'date', 'Date', 'data_evento', 'DataEvento', 'data'],
  creditos: ['Creditos_Apos', 'Creditos', 'CREDITOS_APOS', 'creditos', 'saldo', 'saldo_pos', 'SaldoPos', 'Saldo'],
  custo: ['Custo', 'CUSTO', 'custo', 'valor', 'Valor', 'price', 'Price'],
  renovacao: ['Renovacao', 'RENOVACAO', 'renovacao', 'Renovação', 'renewal'],
};

/**
 * 🔍 PICK - Lê campo de objeto com múltiplos nomes possíveis
 * @param obj Objeto a ser lido
 * @param keys Array de nomes possíveis do campo
 * @returns Valor do primeiro campo encontrado ou null
 */
export function pick(obj: any, keys: string[]): any {
  if (!obj) return null;
  
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return obj[key];
    }
  }
  
  return null;
}

/**
 * 📅 PARSER DE DATA ROBUSTO COM TIMEZONE
 * Suporta múltiplos formatos e aplica timezone BR (-3h)
 * @param value Valor a ser parseado (string, Date, number)
 * @param tzOffsetMinutes Offset de timezone em minutos (padrão: -180 = -3h BR)
 * @returns Date ou null se inválido
 */
export function parseDateSmart(value: any, tzOffsetMinutes: number = -180): Date | null {
  if (value == null || value === '') return null;
  
  // Se já é Date válida
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  
  // Se é número (Excel serial date)
  if (typeof value === 'number' && value > 0) {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Se é string
  const str = String(value).trim();
  if (!str || str === '0' || str === '-') return null;
  
  try {
    // Formato: 2025-10-28 21:30:00 ou 2025-10-28T21:30:00
    let match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, y, mo, d, h = '12', mi = '0', se = '0'] = match;
      // Cria em UTC e aplica offset de timezone
      const dt = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +se));
      return new Date(dt.getTime() - tzOffsetMinutes * 60000);
    }
    
    // Formato: 28/10/2025 21:30 ou 28-10-2025 21:30
    match = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, d, mo, y, h = '12', mi = '0', se = '0'] = match;
      // Cria no timezone local (assumindo BR)
      return new Date(+y, +mo - 1, +d, +h, +mi, +se);
    }
    
    // Fallback: tenta ISO padrão
    const fallbackDate = new Date(str);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  } catch {
    return null;
  }
}

/**
 * Parse de data para ISO-8601 no fuso America/Sao_Paulo
 * @deprecated Use parseDateSmart() para melhor robustez
 */
export function parseDate(dateStr: any): Date | null {
  return parseDateSmart(dateStr);
}

/**
 * Extrai DDD de telefone seguindo as regras:
 * - Remove caracteres não numéricos
 * - Se começa com 55, DDD = dígitos 2-3 (índice [2:4])
 * - Caso contrário, DDD = primeiros 2 dígitos
 * - Valida se DDD está entre 11-99
 */
export function extractDDD(phone: any): string | null {
  if (!phone) return null;
  
  // Remover caracteres não numéricos
  const num = String(phone).replace(/\D/g, '');
  
  if (!num || num.length < 2) return null;
  
  let ddd = '';
  
  // Se começa com 55 (código do Brasil)
  if (num.startsWith('55') && num.length >= 4) {
    ddd = num.slice(2, 4);
  } else {
    // Caso contrário, pega os 2 primeiros dígitos
    ddd = num.slice(0, 2);
  }
  
  // Valida se DDD está entre 11-99
  const dddNum = parseInt(ddd);
  if (ddd.length === 2 && dddNum >= 11 && dddNum <= 99 && DDD_MAP[ddd]) {
    return ddd;
  }
  
  return null;
}

/**
 * Extrai informações completas de geolocalização do telefone
 */
export function extractGeoFromPhone(phone: any): {
  ddd: string | null;
  uf: string | null;
  regiao: string | null;
  regiaoNome: string | null;
  isValid: boolean;
  original: string;
} {
  const original = String(phone || '');
  const ddd = extractDDD(phone);
  
  if (!ddd) {
    return { ddd: null, uf: null, regiao: null, regiaoNome: null, isValid: false, original };
  }
  
  const mapping = DDD_MAP[ddd];
  if (!mapping) {
    return { ddd, uf: null, regiao: null, regiaoNome: null, isValid: false, original };
  }
  
  return {
    ddd,
    uf: mapping.uf,
    regiao: mapping.regiao,
    regiaoNome: REGION_NAMES[mapping.regiao] || null,
    isValid: true,
    original,
  };
}

/**
 * Compatibilidade: Extrai DDD do campo Usuario (antigo)
 */
export function extractDDDFromUsuario(usuario: any): { ddd: string | null; uf: string | null } {
  const result = extractGeoFromPhone(usuario);
  return { ddd: result.ddd, uf: result.uf };
}

/**
 * Deriva turno a partir de hora (HH:mm)
 */
export function getTurnoFromTime(timeStr: string): string {
  if (!timeStr) return 'desconhecido';
  
  try {
    const [hours] = timeStr.split(':').map(Number);
    
    if (hours >= 0 && hours < 6) return 'madrugada';
    if (hours >= 6 && hours < 12) return 'manha';
    if (hours >= 12 && hours < 18) return 'tarde';
    if (hours >= 18 && hours <= 23) return 'noite';
    
    return 'desconhecido';
  } catch {
    return 'desconhecido';
  }
}

/**
 * Deriva turno de um objeto Date
 */
export function getTurnoFromDate(date: Date | null): string {
  if (!date) return 'desconhecido';
  const hours = date.getHours();
  
  if (hours >= 0 && hours < 6) return 'madrugada';
  if (hours >= 6 && hours < 12) return 'manha';
  if (hours >= 12 && hours < 18) return 'tarde';
  if (hours >= 18 && hours <= 23) return 'noite';
  
  return 'desconhecido';
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date | null): string {
  if (!date) return '-';
  try {
    return date.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Enriquece linha com dados geográficos
 */
export function enrichRowWithGeo(row: any): { ddd: string | null; uf: string | null; regiao: string | null } {
  // Prioriza DDD/UF explícitos no Excel
  if (row.DDD || row.ddd) {
    const ddd = String(row.DDD || row.ddd);
    const uf = row.UF || row.uf || DDD_TO_UF[ddd] || null;
    const regiao = uf ? UF_TO_REGION[uf] || null : null;
    return { ddd, uf, regiao };
  }
  
  // Deriva do Usuario
  const { ddd, uf } = extractDDDFromUsuario(row.Usuario || row.usuario);
  const regiao = uf ? UF_TO_REGION[uf] || null : null;
  
  return { ddd, uf, regiao };
}

/**
 * Obtém nome do dia da semana
 */
export function getDayOfWeek(date: Date | null): string {
  if (!date) return 'desconhecido';
  const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  return days[date.getDay()];
}

/**
 * Obtém mês/ano formatado
 */
export function getMonthYear(date: Date | null): string {
  if (!date) return 'desconhecido';
  try {
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  } catch {
    return 'desconhecido';
  }
}

/**
 * Converte string do formato "mar/24" para Date (usado para ordenação)
 */
export function parseMesAno(mesAno: string): Date {
  if (!mesAno || mesAno === 'desconhecido') return new Date(0);
  
  try {
    // Mapeia meses abreviados PT-BR para números
    const meses: Record<string, number> = {
      'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
      'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
    };
    
    // Remove pontos e divide (ex: "mar./24" -> ["mar", "24"])
    const [mesStr, anoStr] = mesAno.toLowerCase().replace('.', '').split('/');
    const mes = meses[mesStr.trim()];
    const ano = 2000 + parseInt(anoStr.trim()); // "24" -> 2024
    
    if (mes === undefined || isNaN(ano)) return new Date(0);
    
    return new Date(ano, mes, 1);
  } catch {
    return new Date(0);
  }
}

/**
 * Ordena array de objetos com campo 'mes' (formato "mar/24") cronologicamente
 */
export function sortByMesAno<T extends { mes: string }>(data: T[]): T[] {
  return [...data].sort((a, b) => {
    const dateA = parseMesAno(a.mes);
    const dateB = parseMesAno(b.mes);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Mapeamento Custo → Plano e Preço Médio
 * Baseado na tabela de interpretação de custos
 */
export interface PlanoInfo {
  nome: string;
  precoMin: number;
  precoMax: number;
  precoMedio: number;
}

export const PLANOS_MAP: Record<number, PlanoInfo> = {
  1: { nome: 'Mensal', precoMin: 30, precoMax: 30, precoMedio: 30 },
  1.5: { nome: '2 Telas', precoMin: 50, precoMax: 50, precoMedio: 50 },
  2: { nome: '2 Telas', precoMin: 50, precoMax: 50, precoMedio: 50 },
  3: { nome: 'Trimestral', precoMin: 75, precoMax: 75, precoMedio: 75 },
  6: { nome: 'Semestral', precoMin: 150, precoMax: 150, precoMedio: 150 },
  12: { nome: 'Anual', precoMin: 280, precoMax: 280, precoMedio: 280 },
};

/**
 * Mapeia custo para informações do plano
 */
export function mapCustoToPlano(custo: any): PlanoInfo {
  const custoNum = safeNumber(custo);
  
  // Busca exata primeiro
  if (PLANOS_MAP[custoNum]) {
    return PLANOS_MAP[custoNum];
  }
  
  // Busca por faixa (1.5-2 → 2 telas)
  if (custoNum >= 1.5 && custoNum <= 2) {
    return PLANOS_MAP[2];
  }
  
  // Fallback: plano mensal
  return PLANOS_MAP[1];
}

/**
 * Extrai hora da string ISO 8601
 */
export function extractHourFromDate(date: Date | null): number {
  if (!date) return -1;
  return date.getHours();
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysDifference(date1: Date | null, date2: Date | null): number {
  if (!date1 || !date2) return 0;
  const diff = date2.getTime() - date1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
