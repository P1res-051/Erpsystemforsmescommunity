// Sistema de carregamento de jogos usando API AutonomyX

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

// Converter data de DD-MM-YYYY para YYYY-MM-DD
const convertDateFormat = (ddmmyyyy: string): string => {
  const parts = ddmmyyyy.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
  }
  return ddmmyyyy;
};

// Converter data de YYYY-MM-DD para DD-MM-YYYY
const convertToAPIFormat = (yyyymmdd: string): string => {
  const parts = yyyymmdd.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
  }
  return yyyymmdd;
};

const todayISO = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayAPIFormat = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`; // DD-MM-YYYY
};

// Verificar se time é brasileiro
const isBrazilian = (name: string): boolean => {
  const br = /brasil|atlético|grêmio|palmeiras|corinthians|bahia|flamengo|vasco|são paulo|botafogo|cruzeiro|santos|internacional|fluminense|fortaleza|cuiabá|goiás|ceará|avaí|chapecoense|sport|náutico|vitória|ponte preta|red bull|bragantino|coritiba|crb|paysandu|ferroviária|criciúma/i;
  return br.test(name || '');
};

// 🎯 Buscar jogos da API AutonomyX
async function fetchAutonomyXAPI(dateStr: string = ""): Promise<GameData[]> {
  const base = "https://automatixbest-api.automation.app.br/api/jogos";
  const url = dateStr ? `${base}?date=${encodeURIComponent(dateStr)}` : base;

  try {
    console.log(`🔄 Buscando jogos da API: ${url}`);
    const res = await fetch(url, {
      headers: { "accept": "application/json" }
    });
    
    if (!res.ok) {
      throw new Error(`API retornou status ${res.status}`);
    }

    const json = await res.json();
    console.log("✅ Jogos recebidos:", json);

    if (!json.success || !json.data?.games) {
      console.warn("⚠️ API não retornou jogos válidos");
      return [];
    }

    // Mapear resposta da API para formato GameData
    const games: GameData[] = json.data.games.map((g: any) => {
      const channels = g.canais 
        ? String(g.canais).split('|').map((c: string) => c.trim()).filter(Boolean)
        : [];

      return {
        comp: g.campeonato || '',
        stadium: g.estadio || '',
        date: json.data.date ? convertDateFormat(json.data.date) : todayISO(),
        time: g.horario || '',
        home: {
          name: g.time_casa?.nome || '',
          abbr: '',
          badge: g.time_casa?.brasao || 'https://via.placeholder.com/64/1e2a44/8ea9d9?text=?',
        },
        away: {
          name: g.time_fora?.nome || '',
          abbr: '',
          badge: g.time_fora?.brasao || 'https://via.placeholder.com/64/1e2a44/8ea9d9?text=?',
        },
        score: (g.placar_casa !== null && g.placar_fora !== null) 
          ? `${g.placar_casa} - ${g.placar_fora}` 
          : '—',
        status: g.status_text === 'Ao Vivo' ? 'live' 
               : g.status_text === 'Encerrado' ? 'final' 
               : 'prog',
        channels,
        is_big_game: g.is_big_game || false,
      };
    });

    console.log(`✅ ${games.length} jogos processados`);
    return sortGames(markBigGames(games));

  } catch (error) {
    console.error("❌ Erro ao buscar jogos da API:", error);
    return [];
  }
}

// Marcar jogos importantes
function markBigGames(games: GameData[]): GameData[] {
  return games.map(g => {
    const isBigMatch = 
      g.is_big_game ||
      (isBrazilian(g.home.name) && isBrazilian(g.away.name)) ||
      (g.channels && g.channels.length >= 2) ||
      /libertadores|champions|copa do mundo|mundial|final|série a|brasileirão/i.test(g.comp);
    
    return {
      ...g,
      is_big_game: isBigMatch,
    };
  });
}

// Ordenar: jogos importantes primeiro, depois brasileiros, depois por horário
function sortGames(games: GameData[]): GameData[] {
  return [...games].sort((a, b) => {
    // Jogos importantes primeiro
    if (a.is_big_game !== b.is_big_game) {
      return b.is_big_game ? 1 : -1;
    }

    // Brasileiros depois
    const aBR = isBrazilian(a.home.name) || isBrazilian(a.away.name);
    const bBR = isBrazilian(b.home.name) || isBrazilian(b.away.name);
    
    if (aBR !== bBR) return bBR ? -1 : 1;
    
    // Por horário
    if (a.time && b.time) {
      return (a.time > b.time) ? 1 : -1;
    }
    
    return 0;
  });
}

// Fallback para dados Mock (caso a API falhe)
function fetchMock(dateISO: string): GameData[] {
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
  ];

  return mockGames;
}

// 🎯 Função Principal - Buscar jogos
export async function getGames(dateISO?: string, sheetData?: any[]): Promise<GameData[]> {
  const targetDate = dateISO || todayISO();
  
  // Converter para formato DD-MM-YYYY para a API
  const apiDate = dateISO ? convertToAPIFormat(dateISO) : "";

  try {
    // Buscar da API
    const apiGames = await fetchAutonomyXAPI(apiDate);
    
    if (apiGames.length > 0) {
      console.log('✅ Jogos carregados da API AutonomyX');
      return apiGames;
    }

    // Fallback para Mock
    console.log('📊 API não retornou jogos, usando dados Mock');
    return sortGames(markBigGames(fetchMock(targetDate)));

  } catch (error) {
    console.error('❌ Erro ao buscar jogos:', error);
    // Fallback para Mock em caso de erro
    return sortGames(markBigGames(fetchMock(targetDate)));
  }
}

// Buscar jogos por data específica (formato DD-MM-YYYY)
export async function getGamesByDate(ddmmyyyy: string): Promise<GameData[]> {
  try {
    const games = await fetchAutonomyXAPI(ddmmyyyy);
    return games.length > 0 ? games : sortGames(markBigGames(fetchMock(convertDateFormat(ddmmyyyy))));
  } catch (error) {
    console.error('❌ Erro ao buscar jogos por data:', error);
    return sortGames(markBigGames(fetchMock(convertDateFormat(ddmmyyyy))));
  }
}

// Helper para renderização
export function todayDate(): string {
  return todayISO();
}

export function todayDateAPI(): string {
  return todayAPIFormat();
}
