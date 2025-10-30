// Sistema robusto de carregamento de jogos
// Pipeline: UOL Service → Sheet → Scrape → Mock

export interface GameData {
  comp: string;
  stadium: string;
  date: string;
  time: string;
  home: {
    name: string;
    abbr: string;
    badge: string;
  };
  away: {
    name: string;
    abbr: string;
    badge: string;
  };
  score: string;
  status: 'prog' | 'live' | 'final';
  channels: string[];
  is_big_game?: boolean;
}

// Utilitários
const norm = (s: any): string => String(s || '').trim();

const normDate = (s: any): string => {
  const str = String(s || '');
  // Aceita "28/10/2025 19:30" ou ISO
  const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : str.slice(0, 10);
};

const todayISO = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Verificar se time é brasileiro
const isBrazilian = (name: string): boolean => {
  const br = /brasil|atl[eéê]tico|gr[eéê]mio|palmeiras|corinthians|bahia|flamengo|vasco|s[aã]o paulo|botafogo|cruzeiro|santos|internacional|fluminense|fortaleza|cuiab[aá]|goi[aá]s|cear[aá]|ava[ií]|chapecoense|sport|n[aá]utico|vit[oó]ria|ponte preta|red bull|bragantino|atl[eéê]tico-mg|atl[eéê]tico-pr|atl[eéê]tico-go/i;
  return br.test(name || '');
};

// Mapear dados do UOL Service
function mapUol(m: any): GameData {
  return {
    comp: m.competicao || '',
    stadium: m.estadio || m.local || '',
    date: m.data || '',
    time: m.horario || m.hora || '',
    home: {
      name: m.time1?.['nome-comum'] || m.time1?.nome || '',
      abbr: m.time1?.sigla || '',
      badge: m.time1?.brasao || m.time1?.escudo || '',
    },
    away: {
      name: m.time2?.['nome-comum'] || m.time2?.nome || '',
      abbr: m.time2?.sigla || '',
      badge: m.time2?.brasao || m.time2?.escudo || '',
    },
    score: (m['ao-vivo'] || m.encerrado) ? `${m.placar1 || 0} - ${m.placar2 || 0}` : '—',
    status: m.encerrado ? 'final' : (m['ao-vivo'] ? 'live' : 'prog'),
    channels: (m.transmissions || m.transmissoes || [])
      .map((t: any) => t.channel || t.canal)
      .filter(Boolean),
  };
}

// Mapear dados da planilha
function mapSheet(r: any): GameData {
  const channels = String(r.Canais || r.canais || '')
    .split('|')
    .map(x => x.trim())
    .filter(Boolean);

  return {
    comp: norm(r.Competicao || r.competicao),
    stadium: norm(r.Estadio || r.estadio || r.Local || r.local),
    date: normDate(r.DataHora || r.Data || r.data),
    time: String(r.DataHora || r.Hora || r.hora || '').slice(11, 16) || norm(r.Hora || r.hora),
    home: {
      name: norm(r.Casa || r.casa || r.Time_Casa || r.time_casa),
      abbr: norm(r.CasaSigla || r.casa_sigla),
      badge: norm(r.CasaEscudo || r.casa_escudo || r.CasaBrasao || r.casa_brasao),
    },
    away: {
      name: norm(r.Fora || r.fora || r.Time_Fora || r.time_fora),
      abbr: norm(r.ForaSigla || r.fora_sigla),
      badge: norm(r.ForaEscudo || r.fora_escudo || r.ForaBrasao || r.fora_brasao),
    },
    score: norm(r.Placar || r.placar) || '—',
    status: (norm(r.Status || r.status || 'prog').toLowerCase() as any),
    channels,
  };
}

// Enriquecer canais vazios com dados de HTML/scraping
async function enrichChannels(list: GameData[]): Promise<GameData[]> {
  const need = list.filter(g => !g.channels || g.channels.length === 0);
  if (need.length === 0) return list;

  // Aqui você poderia fazer scraping real ou consultar cache
  // Por enquanto, retorna sem modificação
  return list;
}

// Marcar jogos importantes
function markBigGames(games: GameData[]): GameData[] {
  return games.map(g => {
    const isBigMatch = 
      (isBrazilian(g.home.name) && isBrazilian(g.away.name)) ||
      (g.channels && g.channels.length >= 2) ||
      /libertadores|champions|copa do mundo|mundial|final/i.test(g.comp);
    
    return {
      ...g,
      is_big_game: isBigMatch,
    };
  });
}

// Ordenar: brasileiros primeiro, depois por horário
function sortGames(games: GameData[]): GameData[] {
  return [...games].sort((a, b) => {
    const aBR = isBrazilian(a.home.name) || isBrazilian(a.away.name);
    const bBR = isBrazilian(b.home.name) || isBrazilian(b.away.name);
    
    if (aBR !== bBR) return bBR ? 1 : -1;
    
    return (a.time > b.time) ? 1 : -1;
  });
}

// 1️⃣ Tentar UOL Service (DESABILITADO - CORS issue)
async function fetchUOLService(dateISO: string): Promise<GameData[]> {
  // UOL Service desabilitado devido a restrições CORS
  // Em produção, usar proxy backend ou API própria
  return [];
}

// 2️⃣ Tentar dados da planilha
function fetchSheet(dateISO: string, sheetData?: any[]): GameData[] {
  if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
    return [];
  }

  try {
    const filtered = sheetData
      .filter(x => normDate(x.DataHora || x.Data || x.data) === dateISO)
      .map(mapSheet);
    
    return filtered;
  } catch (error) {
    console.warn('Sheet parsing failed:', error);
    return [];
  }
}

// 3️⃣ Fallback para dados Mock
function fetchMock(dateISO: string): GameData[] {
  // Dados mock com jogos brasileiros e internacionais
  const mockGames: GameData[] = [
    {
      comp: 'Brasileirão Série A',
      stadium: 'Maracanã',
      date: dateISO,
      time: '16:00',
      home: {
        name: 'Flamengo',
        abbr: 'FLA',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/I7iHXkLThH6K4hmlohnFdA_96x96.png',
      },
      away: {
        name: 'Palmeiras',
        abbr: 'PAL',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/7spurne-xEoTuRJ7dHkn_A_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['Premiere', 'Globo'],
      is_big_game: true,
    },
    {
      comp: 'Copa Libertadores',
      stadium: 'Arena MRV',
      date: dateISO,
      time: '19:00',
      home: {
        name: 'Atlético-MG',
        abbr: 'CAM',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/ChoNCqsT8aNhGw37RY7-4Q_96x96.png',
      },
      away: {
        name: 'Fluminense',
        abbr: 'FLU',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/KLDWYp-H8CAOT9H_JgizRg_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['SBT', 'ESPN'],
      is_big_game: true,
    },
    {
      comp: 'Brasileirão Série A',
      stadium: 'Neo Química Arena',
      date: dateISO,
      time: '21:30',
      home: {
        name: 'Corinthians',
        abbr: 'COR',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/OaiROGSDF8xSWE9ERdUA-w_96x96.png',
      },
      away: {
        name: 'São Paulo',
        abbr: 'SAO',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/jSgw5z0FMeWv_5vp3nJdXA_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['Premiere'],
      is_big_game: true,
    },
    {
      comp: 'Copa Sul-Americana',
      stadium: 'Morumbis',
      date: dateISO,
      time: '18:00',
      home: {
        name: 'São Paulo',
        abbr: 'SAO',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/jSgw5z0FMeWv_5vp3nJdXA_96x96.png',
      },
      away: {
        name: 'Botafogo',
        abbr: 'BOT',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/w5IFqWqZv3rOMv2sI_F_zQ_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['ESPN', 'Disney+'],
      is_big_game: true,
    },
    {
      comp: 'Brasileirão Série A',
      stadium: 'Arena Fonte Nova',
      date: dateISO,
      time: '20:00',
      home: {
        name: 'Bahia',
        abbr: 'BAH',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/Th4fAVAZeCJWRcKoLW7koA_96x96.png',
      },
      away: {
        name: 'Grêmio',
        abbr: 'GRE',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/-_cmntP5q_pHL7g5LfkRiw_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['Premiere'],
      is_big_game: true,
    },
    {
      comp: 'Brasileirão Série A',
      stadium: 'Beira-Rio',
      date: dateISO,
      time: '19:00',
      home: {
        name: 'Internacional',
        abbr: 'INT',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/CVV0dBulRu1dR1TO-hrt-Q_96x96.png',
      },
      away: {
        name: 'Vasco',
        abbr: 'VAS',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/FIMt3GnQv9SIpKcJRYU5jg_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['Premiere'],
      is_big_game: true,
    },
    {
      comp: 'Copa do Brasil',
      stadium: 'Castelão',
      date: dateISO,
      time: '21:45',
      home: {
        name: 'Fortaleza',
        abbr: 'FOR',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/EKq8h-V3bdRN3ziHmjUoNA_96x96.png',
      },
      away: {
        name: 'Cruzeiro',
        abbr: 'CRU',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/Ju9GeMj8xG93Y0Xz-apM4Q_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['Globo', 'SporTV'],
      is_big_game: true,
    },
    {
      comp: 'Brasileirão Série B',
      stadium: 'Vila Belmiro',
      date: dateISO,
      time: '18:30',
      home: {
        name: 'Santos',
        abbr: 'SAN',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/f71uV14vGZb1Spy-J9_pJw_96x96.png',
      },
      away: {
        name: 'Sport',
        abbr: 'SPO',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/8piLd0vJvz7A9lQE3e2DzA_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['Premiere'],
      is_big_game: false,
    },
    {
      comp: 'Champions League',
      stadium: 'Santiago Bernabéu',
      date: dateISO,
      time: '17:00',
      home: {
        name: 'Real Madrid',
        abbr: 'RMA',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/Th4fAVAZeCJWRcKoLW7koA_96x96.png',
      },
      away: {
        name: 'Barcelona',
        abbr: 'BAR',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/paYnEE8hcrP96neHRNofhQ_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['TNT Sports', 'HBO Max'],
      is_big_game: true,
    },
    {
      comp: 'Premier League',
      stadium: 'Old Trafford',
      date: dateISO,
      time: '14:30',
      home: {
        name: 'Manchester United',
        abbr: 'MUN',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/-_vAPFlXM4q6k1aox2LQAQ_96x96.png',
      },
      away: {
        name: 'Liverpool',
        abbr: 'LIV',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/0iShHhASMDYVk-jtjy4cQA_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['ESPN', 'Star+'],
      is_big_game: true,
    },
    {
      comp: 'Brasileirão Série A',
      stadium: 'Allianz Parque',
      date: dateISO,
      time: '11:00',
      home: {
        name: 'Palmeiras',
        abbr: 'PAL',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/7spurne-xEoTuRJ7dHkn_A_96x96.png',
      },
      away: {
        name: 'Atlético-MG',
        abbr: 'CAM',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/ChoNCqsT8aNhGw37RY7-4Q_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['Premiere'],
      is_big_game: true,
    },
    {
      comp: 'Copa Libertadores',
      stadium: 'La Bombonera',
      date: dateISO,
      time: '21:30',
      home: {
        name: 'Boca Juniors',
        abbr: 'BOC',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/w5IFqWqZv3rOMv2sI_F_zQ_96x96.png',
      },
      away: {
        name: 'River Plate',
        abbr: 'RIV',
        badge: 'https://ssl.gstatic.com/onebox/media/sports/logos/FIMt3GnQv9SIpKcJRYU5jg_96x96.png',
      },
      score: '—',
      status: 'prog',
      channels: ['ESPN', 'Conmebol TV'],
      is_big_game: true,
    },
  ];

  return mockGames;
}

// 🎯 Função Principal - Pipeline Completo
export async function getGames(dateISO?: string, sheetData?: any[]): Promise<GameData[]> {
  const targetDate = dateISO || todayISO();

  // 1️⃣ Tentar planilha primeiro (dados reais do Excel)
  const sheetGames = fetchSheet(targetDate, sheetData);
  if (sheetGames.length > 0) {
    console.log('✅ Jogos carregados da Planilha Excel');
    return sortGames(markBigGames(sheetGames));
  }

  // 2️⃣ Fallback para Mock (demonstração)
  console.log('📊 Usando dados Mock de demonstração');
  const mockGames = fetchMock(targetDate);
  return sortGames(markBigGames(mockGames));
}

// Helper para renderização
export function todayDate(): string {
  return todayISO();
}
