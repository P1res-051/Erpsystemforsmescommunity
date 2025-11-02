// Dados Mock de Jogos - 30/10/2025
// Este arquivo contém dados fixos para exibição no frontend
// Sem necessidade de chamada de API

export interface MockGame {
  id: string;
  time_casa: string;
  time_fora: string;
  horario: string;
  campeonato: string;
  status: string;
  placar_casa: number | null;
  placar_fora: number | null;
  brasao_casa: string;
  brasao_fora: string;
  estadio: string;
  canais: string;
  is_big_game: boolean;
  status_text: string;
}

export const MOCK_GAMES_DATA = {
  date: "30-10-2025",
  total_games: 4,
  games: [
    {
      id: "Cagliari _vs_Sassuolo_",
      time_casa: "Cagliari",
      time_fora: "Sassuolo",
      horario: "14:00",
      campeonato: "Italiano",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/cagliari-.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/sassuolo.png",
      estadio: "Unipol Domus",
      canais: "Xsports",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Pisa _vs_Lazio_",
      time_casa: "Pisa",
      time_fora: "Lazio",
      horario: "16:00",
      campeonato: "Italiano",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/pisa-.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/lazio.png",
      estadio: "Stadio Romeo Anconetani",
      canais: "Xsports",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Lanús_vs_Universidad de Chile_",
      time_casa: "Lanús",
      time_fora: "Universidad de Chile",
      horario: "19:30",
      campeonato: "Copa Sul-Americana",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/lanus.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/universidad-de-chile.png",
      estadio: "Ciudad de Lanús",
      canais: "sportv",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Palmeiras_vs_LDU_",
      time_casa: "Palmeiras",
      time_fora: "LDU",
      horario: "21:30",
      campeonato: "Libertadores",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/palmeiras.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/ldu.png",
      estadio: "Allianz Parque",
      canais: "ESPN | sportv | XSports | OneFootball",
      is_big_game: true,
      status_text: "Programado"
    }
  ] as MockGame[]
};

// Função helper para obter os jogos
export const getMockGames = (): MockGame[] => {
  return MOCK_GAMES_DATA.games;
};

// Função para obter jogos da semana (primeiros 10)
export const getMockGamesWeek = (): MockGame[] => {
  return MOCK_GAMES_DATA.games.slice(0, 10);
};

// Função para obter apenas jogos importantes
export const getMockBigGames = (): MockGame[] => {
  return MOCK_GAMES_DATA.games.filter(game => game.is_big_game);
};

// Função para obter jogos brasileiros ou importantes (para Overview)
export const getMockBrazilianOrImportantGames = (): MockGame[] => {
  const timesBrasileiros = [
    'Brasil', 'Atlético-MG', 'Flamengo', 'Palmeiras', 'São Paulo', 
    'Corinthians', 'Santos', 'Grêmio', 'Internacional', 'Fluminense',
    'Botafogo', 'Cruzeiro', 'Vasco', 'Athletico-PR', 'Fortaleza'
  ];
  
  return MOCK_GAMES_DATA.games.filter(game => {
    const temTimeBrasileiro = 
      timesBrasileiros.some(time => 
        game.time_casa.includes(time) || game.time_fora.includes(time)
      );
    
    return temTimeBrasileiro || game.is_big_game;
  });
};
