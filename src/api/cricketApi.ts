const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    totalPages: number; // API returns this
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Match history entry for team backreferences
export interface ApiMatchHistoryEntry {
  id: string;
  numericId: number;
  displayId: string;
  title: string;
  status: 'scheduled' | 'live' | 'completed';
  matchType?: string;
  scheduledDate: string;
  venue: string;
  opponent?: {
    name: string;
    shortName?: string;
  };
  winner?: string;
  result?: {
    winner: string;
    margin: string;
  };
  team1Score?: number;
  team2Score?: number;
  toss?: {
    winner: string;
    decision: 'bat' | 'bowl';
  };
  bestBatsman?: {
    player: {
      id: string;
      name: string;
    };
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
  };
  bestBowler?: {
    player: {
      id: string;
      name: string;
    };
    wickets: number;
    runs: number;
    overs: number;
    economy: number;
  };
}
export interface ApiPlayerPerformance {
  player: {
    id: string | number;
    name: string;
    teamName?: string;
  };
  netImpact: number;
  batting: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: string;
  };
  bowling: {
    wickets: number;
    runs: number;
    overs: string;
    economy: string;
  };
  fielding: {
    catches: number;
    runOuts: number;
    stumpings: number;
  };
}

export interface ApiTournament {
  id: string;
  numericId: number;
  displayId: string;
  name: string;
  shortName: string;
  season: string;
  status: string;
}
export interface ApiPlayer {
  player: {
    id: string | number;
    name: string;
  };
  impactScore: number;
  batting: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    notOuts: number;
    strikeRate: string;
  };
  bowling: {
    wickets: number;
    runs: number;
    overs: string;
    maidens: number;
    dots: number;
    fours: number;
    sixes: number;
    economy: string;
  };
  fielding: {
    catches: number;
    runOuts: number;
    stumpings: number;
  };
}
export interface ApiMatch {
  id: string;
  numericId: number;
  displayId: string;
  title: string;
  status: 'scheduled' | 'live' | 'completed';
  matchType: string;
  venue: string;
  scheduledDate: string;
  createdAt: string;
  updatedAt: string;
  // V2 structure with nested teams
  team1: {
    id?: string;
    teamId?: string; // Legacy support
    displayId?: string | number; // Display ID for API calls
    name: string;
    shortName: string;
    captainName?: string;
    color?: string; // Legacy support
    score?: {
      runs: number;
      wickets: number;
    };
    players?: Array<{ // Legacy support - may be removed in future
      playerId: string;
      name: string;
      role: string;
      batting?: {
        runs: number;
        balls: number;
        fours: number;
        sixes: number;
        notOuts?: number;
        strikeRate?: string;
        impact?: number;
      };
      bowling?: {
        wickets: number;
        runs: number;
        overs: number;
        economy?: string;
        impact?: number;
      };
      fielding?: {
        catches: number;
        runOuts: number;
        stumpings?: number;
        impact?: number;
      };
      overall?: {
        impact: number;
      };
    }>;
    squad?: {
      players?: Array<{
        playerId: string;
        name: string;
        role: string;
        batting?: {
          runs: number;
          balls: number;
          fours: number;
          sixes: number;
          notOuts: number;
          strikeRate: string;
          impactScore?: number;
        };
        bowling?: {
          wickets: number;
          runs: number;
          overs: string;
          economy: string;
          impactScore?: number;
        };
        fielding?: {
          catches: number;
          runOuts: number;
          stumpings: number;
          impactScore?: number;
        };
        finalImpactScore?: number;
      }>;
    };
  };
  team2: {
    id?: string;
    teamId?: string; // Legacy support
    displayId?: string | number; // Display ID for API calls
    name: string;
    shortName: string;
    captainName?: string;
    color?: string; // Legacy support
    score?: {
      runs: number;
      wickets: number;
    };
    players?: Array<{ // Legacy support - may be removed in future
      playerId: string;
      name: string;
      role: string;
      batting?: {
        runs: number;
        balls: number;
        fours: number;
        sixes: number;
        notOuts?: number;
        strikeRate?: string;
        impact?: number;
      };
      bowling?: {
        wickets: number;
        runs: number;
        overs: number;
        economy?: string;
        impact?: number;
      };
      fielding?: {
        catches: number;
        runOuts: number;
        stumpings?: number;
        impact?: number;
      };
      overall?: {
        impact: number;
      };
    }>;
    squad?: {
      players?: Array<{
        playerId: string;
        name: string;
        role: string;
        batting?: {
          runs: number;
          balls: number;
          fours: number;
          sixes: number;
          notOuts: number;
          strikeRate: string;
          impactScore?: number;
        };
        bowling?: {
          wickets: number;
          runs: number;
          overs: string;
          economy: string;
          impactScore?: number;
        };
        fielding?: {
          catches: number;
          runOuts: number;
          stumpings: number;
          impactScore?: number;
        };
        finalImpactScore?: number;
      }>;
    };
  };
  // Tournament info
  tournament?: {
    tournamentId: string;
    name: string;
    shortName: string;
    season: string;
  };
  // Match result
  winner?: string | { id?: string; name?: string; shortName?: string };
  result?: {
    winner: string | { id?: string; name?: string; shortName?: string };
    margin: string;
    playerOfMatch?: {
      id: string;
      name: string;
      teamId: string;
      teamName: string;
      impact: number;
    };
  };
  // Legacy score properties for backward compatibility
  team1Score?: number;
  team2Score?: number;
  // Squads (v2 structure)
  squads?: {
    [teamId: string]: {
      teamId: string;
      players: Array<{
        playerId: string;
        name: string;
        role: string;
        impactScore?: number;
        batting?: any;
        bowling?: any;
        fielding?: any;
      }>;
      captain?: any;
      wicketKeeper?: any;
    };
  };
  // Player performances (v2 structure)
  playerStats?: Array<{
    playerId: string;
    player?: {
      id: string;
      name: string;
      role: string;
    };
    batting: {
      runs: number;
      balls: number;
      fours: number;
      sixes: number;
      notOuts: number;
    };
    bowling: {
      wickets: number;
      runs: number;
      overs: number;
    };
    fielding: {
      catches: number;
      runOuts: number;
      stumpings: number;
    };
    impactScore?: number;
  }>;
  // Innings data
  innings?: ApiInning[];
  // Fall of wickets data
  fallOfWickets?: {
    team1: Array<{
      score: number;
      wicket: number;
      over: string;
      inningsNumber: number;
      player: {
        name: string;
        playerId: string | null;
      };
      dismissal: {
        type: string;
        bowler?: {
          name: string;
          playerId: string | null;
        } | null;
        fielder?: {
          name: string;
          playerId: string | null;
        } | null;
        fielders: Array<{
          name: string;
          playerId: string | null;
        }>;
        text: string;
      };
    }>;
    team2: Array<{
      score: number;
      wicket: number;
      over: string;
      inningsNumber: number;
      player: {
        name: string;
        playerId: string | null;
      };
      dismissal: {
        type: string;
        bowler?: {
          name: string;
          playerId: string | null;
        } | null;
        fielder?: {
          name: string;
          playerId: string | null;
        } | null;
        fielders: Array<{
          name: string;
          playerId: string | null;
        }>;
        text: string;
      };
    }>;
  };
  // Player of the match (calculated in backend)
  playerOfMatch?: {
    id: string;
    name: string;
    teamId: string;
    teamName: string;
    impactScore: number;
  };
  // Legacy fields for backward compatibility
  toss?: {
    winner: string;
    decision: 'bat' | 'bowl';
  };
  totalOvers?: number;
  currentInnings?: number;
  manOfTheMatch?: {
    player: {
      id: string | number;
      name: string;
      teamName?: string;
    };
    netImpact: number;
    batting: {
      runs: number;
      balls: number;
      fours: number;
      sixes: number;
      strikeRate: string;
    };
    bowling: {
      wickets: number;
      runs: number;
      overs: string;
      economy: string;
    };
    fielding: {
      catches: number;
      runOuts: number;
      stumpings: number;
    };
  };
  playerPerformances?: ApiPlayerPerformance[]; // Legacy field
  // AI Commentary (v2 structure)
  commentary?: {
    matchOverview: string;
    currentSituation: string;
    keyHighlights: string[];
    playerSpotlight: string;
    tacticalAnalysis: string;
    matchPrediction: string;
    excitingCommentary: string[];
  };
}

// Player interfaces matching v2 API spec
export interface ApiPlayer {
  id: string;
  numericId: number;
  displayId: string;
  name: string;
  email?: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingStyle?: 'RHB' | 'LHB';
  bowlingStyle?: string;
  nationality?: string;
  isActive: boolean;
  // V2 career stats structure
  careerStats?: {
    batting: {
      matchesPlayed: number;
      runs: number;
      highestScore: number;
      average: number;
      strikeRate: number;
      centuries: number;
      fifties: number;
      ducks: number;
      notOuts: number;
    };
    bowling: {
      matchesPlayed: number;
      wickets: number;
      average: number;
      economyRate: number;
      strikeRate: number;
      bestBowling: string;
      fiveWicketHauls: number;
      hatTricks: number;
    };
    fielding: {
      catches: number;
      runOuts: number;
      stumpings: number;
    };
    overall: {
      matchesPlayed: number;
      wins: number;
      losses: number;
      winPercentage: number;
    };
  };
  // Recent matches and teams
  recentMatches?: Array<{
    matchId: string;
    date: string;
    opponent: string;
    result: string;
    batting?: any;
    bowling?: any;
    fielding?: any;
  }>;
  recentTeams?: Array<{
    teamId: string;
    teamName: string;
    lastPlayed: string;
    matchesPlayed: number;
  }>;
  // Preferred team
  preferredTeamId?: string;
  preferredTeam?: {
    id: string;
    name: string;
    shortName: string;
  };
  // Legacy fields for backward compatibility
  matchesPlayed?: number;
  totalRuns?: number;
  totalWickets?: number;
  battingAverage?: number;
  bowlingAverage?: number;
  battingStrikeRate?: number;
  bowlingEconomy?: number;
  totalOvers?: number;
  matchHistory?: Array<{
    matchId: string;
    matchDate: string;
    team1: string;
    team2: string;
    venue: string;
    result: {
      winner: string;
      margin: string;
    };
    contributions: Array<{
      type: 'batting' | 'bowling' | 'fielding';
      inningNumber: number;
      // Batting fields
      runs?: number;
      balls?: number;
      fours?: number;
      sixes?: number;
      dismissal?: string;
      strikeRate?: string;
      // Bowling fields
      overs?: string;
      maidens?: number;
      wickets?: number;
      economy?: string;
      // Fielding fields
      action?: string;
      count?: number;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

// News interfaces
export interface ApiNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  author?: string;
  category: 'match' | 'player' | 'tournament' | 'general';
  tags?: string[];
  imageUrl?: string;
  publishedAt: string;
  updatedAt: string;
  isPublished: boolean;
  viewCount?: number;
  featured?: boolean;
}

export interface ApiScore {
  id: string;
  matchId: string;
  team1: {
    name: string;
    score: number;
    wickets: number;
    overs: string;
  };
  team2: {
    name: string;
    score: number;
    wickets: number;
    overs: string;
  };
  status: 'live' | 'completed' | 'scheduled';
  venue: string;
  currentBatsman?: {
    name: string;
    runs: number;
    balls: number;
  };
  currentBowler?: {
    name: string;
    wickets: number;
    runs: number;
    overs: string;
  };
  result?: string;
  updatedAt: string;
}

// Team interfaces matching API spec
export interface ApiTeam {
  id: string;
  numericId?: number;
  displayId?: string;
  name: string;
  shortName: string;
  captainId?: string;
  captain?: {
    id: string;
    name: string;
    role?: string;
  };
  // Nested squad information (v2 API structure)
  squad?: {
    teamId: string;
    name: string;
    shortName: string;
    captainName?: string;
  };
  squadId?: string;
  score?: number;
  playerIds?: string[];
  players?: Array<{
    id: string;
    numericId: number;
    name: string;
    role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
    battingStyle?: 'RHB' | 'LHB';
    bowlingStyle?: string;
    matchesPlayed?: number;
    totalRuns?: number;
    totalWickets?: number;
    battingAverage?: number;
    bowlingAverage?: number;
  }>;
  playersCount?: number;
  statistics?: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winPercentage: number;
    currentStreak: { type: string; count: number };
    longestWinStreak: number;
    longestLossStreak: number;
    recentMatches: Array<{
      matchId: number;
      date: string;
      opponent: string;
      result: string;
      winner: string;
      venue: string;
      status: string;
    }>;
    form: string[];
  };
  bestPlayers?: {
    batsman?: {
      id: string;
      name: string;
      average: number;
      totalRuns: number;
    };
    bowler?: {
      id: string;
      name: string;
      wickets: number;
      economy: number;
    };
    allRounder?: any;
    wicketKeeper?: any;
  };
  teamPlayers?: Array<{
    id: string;
    numericId: number;
    name: string;
    role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
    battingStyle?: 'RHB' | 'LHB';
    bowlingStyle?: string;
    teamStats: {
      matchesPlayed: number;
      batting: {
        totalRuns: number;
        totalBalls: number;
        totalFours: number;
        totalSixes: number;
        battingInnings: number;
        notOuts: number;
        highestScore: number;
        battingAverage: string;
        strikeRate: string;
      };
      bowling: {
        bowlingInnings: number;
        totalWickets: number;
        bowlingRuns: number;
        bowlingBalls: number;
        maidens: number;
        bowlingAverage: string;
        economy: string;
      };
    };
  }>;
  matchHistory?: ApiMatchHistoryEntry[];
  logo?: string;
  color?: string;
  homeGround?: string;
  foundedYear?: number;
  teamStats?: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winPercentage: number;
    totalRunsScored?: number;
    totalRunsAgainst?: number;
    totalWickets?: number;
    totalWicketsLost?: number;
    netRunRate?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Innings interfaces matching API spec
export interface ApiInning {
  id: string;
  inningNumber: number;
  battingTeam: string;
  bowlingTeam: string;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  batsmen: Array<{
    player: {
      id: string;
      name: string;
    };
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    status: string;
  }>;
  bowling: Array<{
    player?: {
      id: string;
      name: string;
    };
    playerName?: string;
    wickets: number;
    runs: number;
    balls: number;
    maidens: number;
    overs: number;
  }>;
  fallOfWickets?: Array<{
    wicketNumber: number;
    wicket?: number;
    player?: string;
    playerName?: string;
    batsmanName: string;
    score: number;
    overs: string;
    over?: string;
  }>;
}

// Auction interfaces
export interface AuctionConfig {
  totalBudgetPerTeam: number;
  maxPlayersPerTeam: number;
  minPlayersPerTeam: number;
  basePricePerPlayer: number;
  minBidIncrement: number;
  totalPlayersAuctioned?: number;
  totalSoldPlayers?: number;
  totalUnsoldPlayers?: number;
}

export interface AuctionTeam {
  teamId: string;
  team: {
    teamId: string;
    name: string;
    shortName: string;
  };
  totalBudget: number;
  remainingBudget: number;
  spentBudget: number;
  playersCount: number;
  players: Array<{
    playerId: string;
    name: string;
    role: string;
    basePrice: number;
    finalPrice: number;
    purchasedAt: string;
  }>;
}

export interface AuctionPlayer {
  playerId: string;
  player: {
    playerId: string;
    name: string;
    role: string;
  };
  basePrice: number;
  currentBid: number;
  biddingTeam?: string;
  biddingTeamName?: string;
  timeRemaining: number;
  bidStartTime: string;
}

export interface AuctionBid {
  teamId: string;
  amount: number;
}

export interface AuctionSummary {
  totalPlayers: number;
  soldPlayers: number;
  unsoldPlayers: number;
  totalAuctionValue: number;
  averagePlayerPrice: number;
  highestBid: number;
  lowestBid: number;
  mostExpensivePlayer: {
    playerId: string;
    name: string;
    finalPrice: number;
    soldTo: string;
  } | null;
  teamSpending: Array<{
    teamId: string;
    teamName: string;
    totalSpent: number;
    averageSpentPerPlayer: number;
    playersCount: number;
  }>;
}

export interface ApiAuction {
  auctionId: string;
  tournamentId: string;
  status: 'scheduled' | 'active' | 'paused' | 'completed';
  auctionConfig: AuctionConfig;
  teams: AuctionTeam[];
  currentPlayer?: AuctionPlayer;
  availablePlayers: Array<{
    playerId: string;
    name: string;
    role: string;
  }>;
  soldPlayers: Array<{
    playerId: string;
    name: string;
    role: string;
    basePrice: number;
    finalPrice: number;
    soldTo: string;
    soldToTeamName: string;
    soldAt: string;
    bidHistory: Array<{
      teamId: string;
      teamName: string;
      amount: number;
      timestamp: string;
    }>;
  }>;
  unsoldPlayers: Array<{
    playerId: string;
    name: string;
    role: string;
    basePrice: number;
    status: 'unsold';
    unsoldAt: string;
  }>;
  auctionSummary: AuctionSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuctionRequest {
  tournamentId: string;
  title: string;
  auctionConfig: AuctionConfig;
  teams: Array<{
    teamId: string;
    team: {
      teamId: string;
      name: string;
      shortName: string;
    };
  }>;
}

export interface UpdateAuctionRequest {
  status?: 'scheduled' | 'active' | 'paused' | 'completed';
  auctionConfig?: Partial<AuctionConfig>;
}

// API service functions
export class CricketApiService {
  private static async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Matches API - V2
  static async getMatches(
    status?: string, 
    pagination?: PaginationParams,
    includePlayers?: boolean,
    includeImpactScores?: boolean,
    includeDismissals?: boolean,
    includePerformance?: boolean
  ): Promise<PaginatedResponse<ApiMatch>> {
    let queryParams = '';
    const params: string[] = [];

    if (status) params.push(`status=${status}`);
    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);
    if (includePlayers !== undefined) params.push(`includePlayers=${includePlayers}`);
    if (includePerformance !== undefined) params.push(`includePerformance=${includePerformance}`);
    if (includeImpactScores !== undefined) params.push(`includeImpactScores=${includeImpactScores}`);
    if (includeDismissals !== undefined) params.push(`includeDismissals=${includeDismissals}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<ApiMatch[]>(`/v2/matches${queryParams}`) as unknown as PaginatedResponse<ApiMatch>;
  }

  static async getMatch(displayId: string | number): Promise<ApiMatch | null> {
    // Include all necessary query parameters for complete match data
    const response = await this.request<ApiMatch>(`/v2/matches/${displayId}?includePlayers=true&includeImpactScores=true&includeDismissals=true&includeCommentary=true`);
    return response.success ? response.data : null;
  }

  static async createMatch(matchData: Partial<ApiMatch>): Promise<ApiResponse<ApiMatch>> {
    const response = await fetch(`${API_BASE_URL}/v2/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async updateMatch(displayId: string | number, matchData: Partial<ApiMatch>): Promise<ApiResponse<ApiMatch>> {
    const response = await fetch(`${API_BASE_URL}/v2/matches/${displayId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  static async deleteMatch(displayId: string | number): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/matches/${displayId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async getInnings(matchNumericId: number): Promise<ApiInning[]> {
    const response = await this.request<ApiInning[]>(`/matches/${matchNumericId}/innings`);
    return response.success ? response.data : [];
  }

  // Players API - V2
  static async getPlayers(pagination?: PaginationParams, filters?: { role?: string; teamId?: string; isActive?: boolean }): Promise<PaginatedResponse<ApiPlayer>> {
    let queryParams = '';
    const params: string[] = [];

    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);
    if (filters?.role) params.push(`role=${filters.role}`);
    if (filters?.teamId) params.push(`teamId=${filters.teamId}`);
    if (filters?.isActive !== undefined) params.push(`isActive=${filters.isActive}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<ApiPlayer[]>(`/v2/players${queryParams}`) as unknown as PaginatedResponse<ApiPlayer>;
  }

  static async getPlayer(displayId: string | number): Promise<ApiPlayer | null> {
    const response = await this.request<ApiPlayer>(`/v2/players/${displayId}`);
    return response.success ? response.data : null;
  }

  static async createPlayer(playerData: Partial<ApiPlayer>): Promise<ApiResponse<ApiPlayer>> {
    const response = await fetch(`${API_BASE_URL}/v2/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async updatePlayer(displayId: string | number, playerData: Partial<ApiPlayer>): Promise<ApiResponse<ApiPlayer>> {
    const response = await fetch(`${API_BASE_URL}/v2/players/${displayId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async deletePlayer(displayId: string | number): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/players/${displayId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // Teams API - V2
  static async getTeams(pagination?: PaginationParams): Promise<PaginatedResponse<ApiTeam>> {
    let queryParams = '';
    const params: string[] = [];

    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<ApiTeam[]>(`/v2/teams${queryParams}`) as unknown as PaginatedResponse<ApiTeam>;
  }

  static async getTeam(displayId: string | number): Promise<ApiTeam | null> {
    const response = await this.request<ApiTeam>(`/v2/teams/${displayId}`);
    return response.success ? response.data : null;
  }

  static async createTeam(teamData: Partial<ApiTeam>): Promise<ApiResponse<ApiTeam>> {
    const response = await fetch(`${API_BASE_URL}/v2/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async updateTeam(displayId: string | number, teamData: Partial<ApiTeam>): Promise<ApiResponse<ApiTeam>> {
    const response = await fetch(`${API_BASE_URL}/v2/teams/${displayId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async deleteTeam(displayId: string | number): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/teams/${displayId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async getTeamMatches(teamDisplayId: number): Promise<ApiResponse<ApiMatch[]>> {
    return await this.request<ApiMatch[]>(`/v2/teams/${teamDisplayId}/matches`);
  }

  // Tournaments API - V2
  static async getTournaments(): Promise<ApiResponse<ApiTournament[]>> {
    return await this.request<ApiTournament[]>(`/v2/matches/tournaments`);
  }

  // Live Scores API
  static async getLiveScores(pagination?: PaginationParams): Promise<ApiResponse<any[]>> {
    let queryParams = '';
    const params: string[] = [];

    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<any[]>(`/live-scores${queryParams}`);
  }

  // Analysis APIs
  static async analyzeMatch(matchData: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/match-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ matchData }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  static async analyzePlayer(playerData: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/player-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerData }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // News API
  static async getNews(pagination?: PaginationParams, category?: string): Promise<ApiResponse<ApiNews[]>> {
    let queryParams = '';
    const params: string[] = [];

    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);
    if (category) params.push(`category=${category}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<ApiNews[]>(`/v2/news${queryParams}`);
  }

  static async getNewsById(id: string): Promise<ApiResponse<ApiNews>> {
    return await this.request<ApiNews>(`/v2/news/${id}`);
  }

  static async getFeaturedNews(limit?: number): Promise<ApiResponse<ApiNews[]>> {
    const queryParams = limit ? `?limit=${limit}` : '';
    return await this.request<ApiNews[]>(`/v2/news/featured${queryParams}`);
  }

  static async getScores(limit?: number): Promise<ApiResponse<ApiScore[]>> {
    const queryParams = limit ? `?limit=${limit}` : '';
    return await this.request<ApiScore[]>(`/v2/news/scores${queryParams}`);
  }

  static async getTeamPlayers(teamId: string | number): Promise<ApiResponse<ApiPlayer[]>> {
    console.log('getTeamPlayers called with teamId:', teamId, 'type:', typeof teamId);
    const endpoint = `/v2/teams/${teamId}/players`;
    console.log('getTeamPlayers endpoint:', endpoint);
    return await this.request<ApiPlayer[]>(endpoint);
  }

  // Auction API - V2
  static async createAuction(auctionData: CreateAuctionRequest): Promise<ApiResponse<ApiAuction>> {
    const response = await fetch(`${API_BASE_URL}/v2/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auctionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  static async getAuctions(pagination?: PaginationParams): Promise<PaginatedResponse<ApiAuction>> {
    let queryParams = '';
    const params: string[] = [];

    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<ApiAuction[]>(`/v2/auctions${queryParams}`) as unknown as PaginatedResponse<ApiAuction>;
  }

  static async getAuction(auctionId: string): Promise<ApiResponse<ApiAuction>> {
    return await this.request<ApiAuction>(`/v2/auctions/${auctionId}`);
  }

  static async updateAuction(auctionId: string, updateData: UpdateAuctionRequest): Promise<ApiResponse<ApiAuction>> {
    const response = await fetch(`${API_BASE_URL}/v2/auctions/${auctionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  static async deleteAuction(auctionId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/auctions/${auctionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Auction Control
  static async startAuction(auctionId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/auctions/${auctionId}/start`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  static async getAuctionStatus(auctionId: string): Promise<ApiResponse<{ status: string; currentPlayer?: AuctionPlayer }>> {
    return await this.request<{ status: string; currentPlayer?: AuctionPlayer }>(`/v2/auctions/${auctionId}/status`);
  }

  static async pauseAuction(auctionId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/auctions/${auctionId}/pause`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  static async resumeAuction(auctionId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/auctions/${auctionId}/resume`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  static async moveToNextPlayer(auctionId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/auctions/${auctionId}/next`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Bidding
  static async placeBid(auctionId: string, bidData: AuctionBid): Promise<ApiResponse<{ message: string; currentBid: number; biddingTeam: string }>> {
    const response = await fetch(`${API_BASE_URL}/v2/auctions/${auctionId}/bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bidData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}
