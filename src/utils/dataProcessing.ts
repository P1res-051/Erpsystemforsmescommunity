// Utilitários para processamento de dados IPTV

// Mapeamento DDD → UF (completo para Brasil)
export const DDD_TO_UF: Record<string, string> = {
  // São Paulo
  '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP', '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP',
  // Rio de Janeiro
  '21': 'RJ', '22': 'RJ', '24': 'RJ',
  // Espírito Santo
  '27': 'ES', '28': 'ES',
  // Minas Gerais
  '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG', '37': 'MG', '38': 'MG',
  // Paraná
  '41': 'PR', '42': 'PR', '43': 'PR', '44': 'PR', '45': 'PR', '46': 'PR',
  // Santa Catarina
  '47': 'SC', '48': 'SC', '49': 'SC',
  // Rio Grande do Sul
  '51': 'RS', '53': 'RS', '54': 'RS', '55': 'RS',
  // Distrito Federal e Goiás
  '61': 'DF', '62': 'GO', '64': 'GO',
  // Tocantins
  '63': 'TO',
  // Mato Grosso e Mato Grosso do Sul
  '65': 'MT', '66': 'MT', '67': 'MS',
  // Acre
  '68': 'AC',
  // Rondônia
  '69': 'RO',
  // Bahia
  '71': 'BA', '73': 'BA', '74': 'BA', '75': 'BA', '77': 'BA',
  // Sergipe
  '79': 'SE',
  // Pernambuco
  '81': 'PE', '87': 'PE',
  // Alagoas
  '82': 'AL',
  // Paraíba
  '83': 'PB',
  // Rio Grande do Norte
  '84': 'RN',
  // Ceará
  '85': 'CE', '88': 'CE',
  // Piauí
  '86': 'PI', '89': 'PI',
  // Pará
  '91': 'PA', '93': 'PA', '94': 'PA',
  // Amazonas
  '92': 'AM', '97': 'AM',
  // Maranhão
  '98': 'MA', '99': 'MA',
  // Amapá
  '96': 'AP',
  // Roraima
  '95': 'RR',
};

// Mapeamento UF → Região
export const UF_TO_REGION: Record<string, string> = {
  'AC': 'Norte', 'AP': 'Norte', 'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
  'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 
  'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
  'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
  'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
  'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul',
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
 * Constrói Date a partir de partes com offset explícito
 */
export function buildDateFromParts(dateStr?: string, timeStr?: string, offset: string = '-03:00'): Date | null {
  try {
    if (!dateStr) return null;
    const time = timeStr && /\d{2}:\d{2}/.test(timeStr) ? timeStr : '00:00:00';
    const iso = `${dateStr}T${time}${offset}`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Obtém Date de uma linha no novo formato (DATA/HORARIO, *_DT)
 * type: 'criado' | 'expira' | 'log' | 'data'
 */
export function getRowDate(row: any, type: 'criado' | 'expira' | 'log' | 'data' = 'data'): Date | null {
  if (!row) return null;

  // Preferir campos canônicos *_DT
  const dtCandidates: string[] = [];
  if (type === 'criado') dtCandidates.push(row.CRIADO_DT, row.Criado_Em, row.Criado, row.criado_em, row.criado);
  else if (type === 'expira') dtCandidates.push(row.EXPIRA_DT, row.Expira_Em, row.Expira, row.expira_em, row.expira);
  else if (type === 'log') dtCandidates.push(row.LOG_DT, row.Data, row.data);
  else dtCandidates.push(row.DT, row.Data, row.data);

  for (const cand of dtCandidates) {
    const d = parseDate(cand);
    if (d) return d;
  }

  // Combinar DATA/HORARIO específicos
  if (type === 'criado') {
    const d = buildDateFromParts(row.CRIADO_DATA || row.DATA, row.CRIADO_HORARIO || row.HORARIO);
    if (d) return d;
  } else if (type === 'expira') {
    const d = buildDateFromParts(row.EXPIRA_DATA || row.DATA, row.EXPIRA_HORARIO || row.HORARIO);
    if (d) return d;
  } else if (type === 'log') {
    const d = buildDateFromParts(row.LOG_DATA || row.DATA, row.LOG_HORARIO || row.HORARIO);
    if (d) return d;
  } else {
    const d = buildDateFromParts(row.DATA, row.HORARIO);
    if (d) return d;
  }

  // Partes numéricas (ANO/MES/DIA/HORA/MINUTO) – fuso local do navegador
  const ano = row.ANO ?? row.ano;
  const mes = row.MES ?? row.mes;
  const dia = row.DIA ?? row.dia;
  const hora = row.HORA ?? row.hora ?? 0;
  const min = row.MINUTO ?? row.minuto ?? 0;
  if (ano && mes && dia) {
    const d = new Date(ano, mes - 1, dia, hora, min);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Parse de data para ISO-8601 no fuso America/Sao_Paulo
 */
export function parseDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  
  try {
    // Se já é Date válida
    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
      // Verifica se não é epoch 0 (31/12/1969)
      if (dateStr.getTime() === 0 || dateStr.getFullYear() < 1970) return null;
      return dateStr;
    }
    
    // Se é número (Excel serial date)
    if (typeof dateStr === 'number' && dateStr > 0) {
      // Excel serial dates começam em 1900
      if (dateStr < 1) return null;
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
      if (isNaN(date.getTime()) || date.getFullYear() < 1970) return null;
      return date;
    }
    
    // Se é string
    const str = String(dateStr).trim();
    if (!str || str === '0' || str === '-') return null;
    
    // Tenta formatos brasileiros primeiro: DD/MM/YYYY ou DD-MM-YYYY
    const brMatch = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime()) || date.getFullYear() < 1970) return null;
      return date;
    }
    
    // Tenta ISO (YYYY-MM-DD)
    if (str.includes('T') || str.includes('Z') || /^\d{4}-\d{2}-\d{2}/.test(str)) {
      const date = new Date(str);
      if (isNaN(date.getTime()) || date.getFullYear() < 1970) return null;
      return date;
    }

    // Fallback para Date.parse
    const parsed = new Date(str);
    if (isNaN(parsed.getTime()) || parsed.getFullYear() < 1970) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Extrai DDD do campo Usuario (quando é telefone BR com +55)
 */
export function extractDDDFromUsuario(usuario: any): { ddd: string | null; uf: string | null } {
  if (!usuario) return { ddd: null, uf: null };
  
  const digits = String(usuario).replace(/\D/g, '');
  
  // Verifica se começa com 55 (Brasil) e tem pelo menos 4 dígitos
  if (!digits.startsWith('55') || digits.length < 4) {
    return { ddd: null, uf: null };
  }
  
  // Extrai DDD (3º e 4º dígitos)
  const ddd = digits.slice(2, 4);
  
  // Valida DDD (deve ser entre 11 e 99)
  if (!/^[1-9]\d$/.test(ddd)) {
    return { ddd: null, uf: null };
  }
  
  // Mapeia para UF
  const uf = DDD_TO_UF[ddd] || null;
  
  return { ddd, uf };
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
