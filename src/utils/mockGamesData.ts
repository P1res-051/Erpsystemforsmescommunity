// Dados Mock de Jogos - 28/10/2025
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
  date: "28-10-2025",
  total_games: 15,
  games: [
    {
      id: "Itália_vs_Brasil_",
      time_casa: "Itália",
      time_fora: "Brasil",
      horario: "15:00",
      campeonato: "Amistoso Feminino",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/italia.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/brasil.png",
      estadio: "Ennio Tardini",
      canais: "CazéTV",
      is_big_game: true,
      status_text: "Programado"
    },
    {
      id: "Lecce_vs_Napoli_",
      time_casa: "Lecce",
      time_fora: "Napoli",
      horario: "16:45",
      campeonato: "Italiano",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/lecce.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/napoli.png",
      estadio: "Via Del Mare",
      canais: "SBT | ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Hertha_vs_SV Elversberg _",
      time_casa: "Hertha",
      time_fora: "SV Elversberg",
      horario: "17:00",
      campeonato: "Copa da Alemanha",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/hertha.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/sv-elversberg-.png",
      estadio: "Olímpico de Berlim",
      canais: "ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Wolfsburg_vs_Holstein Kiel_",
      time_casa: "Wolfsburg",
      time_fora: "Holstein Kiel",
      horario: "17:00",
      campeonato: "Copa da Alemanha",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/wolfsburg.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/holstein-kiel.png",
      estadio: "Volkswagen Arena",
      canais: "SBT | ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Heidenheim_vs_Hamburgo_",
      time_casa: "Heidenheim",
      time_fora: "Hamburgo",
      horario: "17:00",
      campeonato: "Copa da Alemanha",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/heidenheim.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/hamburgo.png",
      estadio: "Voith-Arena",
      canais: "SBT | ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Eintracht Frankfurt_vs_Borussia Dortmund_",
      time_casa: "Eintracht Frankfurt",
      time_fora: "Borussia Dortmund",
      horario: "17:00",
      campeonato: "Copa da Alemanha",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/eintracht-frankfurt.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/borussia-dortmund.png",
      estadio: "Deutsche Bank Park",
      canais: "SBT | ESPN",
      is_big_game: true,
      status_text: "Programado"
    },
    {
      id: "Atalanta_vs_Milan_",
      time_casa: "Atalanta",
      time_fora: "Milan",
      horario: "16:45",
      campeonato: "Italiano",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/atalanta.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/milan.png",
      estadio: "Atleti Azzurri",
      canais: "SBT | ESPN",
      is_big_game: true,
      status_text: "Programado"
    },
    {
      id: "St. Pauli_vs_Hoffenheim_",
      time_casa: "St. Pauli",
      time_fora: "Hoffenheim",
      horario: "17:00",
      campeonato: "Copa da Alemanha",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/st-pauli-.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/hoffenheim.png",
      estadio: "Millerntor-Stadion",
      canais: "SBT | ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Borussia M'gladbach_vs_Karlsruher_",
      time_casa: "Borussia M'gladbach",
      time_fora: "Karlsruher",
      horario: "17:00",
      campeonato: "Copa da Alemanha",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/borussia-m'gladbach.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/karlsruher.png",
      estadio: "Borussia Park",
      canais: "ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Energie Cottbus_vs_RB Leipzig _",
      time_casa: "Energie Cottbus",
      time_fora: "RB Leipzig",
      horario: "17:00",
      campeonato: "Copa da Alemanha",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/energie-cottbus.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/rb-leipzig-.png",
      estadio: "Freundschaft",
      canais: "Xsports",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Augsburg_vs_Bochum_",
      time_casa: "Augsburg",
      time_fora: "Bochum",
      horario: "17:00",
      campeonato: "Copa da Alemanha",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/augsburg.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/bochum.png",
      estadio: "WWK Arena",
      canais: "SBT | ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Grimsby Town_vs_Brentford _",
      time_casa: "Grimsby Town",
      time_fora: "Brentford",
      horario: "17:30",
      campeonato: "Copa da Liga Inglesa",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/grimsby-town.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/brentford-.png",
      estadio: "Blundell Park",
      canais: "ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Wycombe_vs_Fulham_",
      time_casa: "Wycombe",
      time_fora: "Fulham",
      horario: "17:30",
      campeonato: "Copa da Liga Inglesa",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/wycombe.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/fulham.png",
      estadio: "Adams Park",
      canais: "ESPN",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Wrexham _vs_Cardiff City  _",
      time_casa: "Wrexham",
      time_fora: "Cardiff City",
      horario: "17:30",
      campeonato: "Copa da Liga Inglesa",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/wrexham-.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/cardiff-city--.png",
      estadio: "The Racecourse Ground",
      canais: "TV Globo",
      is_big_game: false,
      status_text: "Programado"
    },
    {
      id: "Atlético-MG_vs_Independiente del Valle_",
      time_casa: "Atlético-MG",
      time_fora: "Independiente del Valle",
      horario: "19:30",
      campeonato: "Copa Sul-Americana",
      status: "1",
      placar_casa: null,
      placar_fora: null,
      brasao_casa: "https://e.imguol.com/futebol/brasoes/40x40/atletico-mg.png",
      brasao_fora: "https://e.imguol.com/futebol/brasoes/40x40/independiente-del-valle.png",
      estadio: "Arena MRV",
      canais: "SBT | ESPN",
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
