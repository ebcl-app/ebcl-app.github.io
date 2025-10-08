const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
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
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  totalCounts?: {
    live: number;
    scheduled: number;
    completed: number;
    all: number;
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
  team1: ApiTeam | null;
  team2: ApiTeam | null;
  toss?: {
    winner: string;
    decision: 'bat' | 'bowl';
  };
  currentInnings?: number;
  team1Score?: number;
  team2Score?: number;
  winner?: string | { id: number; name: string; shortName?: string };
  result?: {
    winner: string | { id: number; name: string; shortName?: string };
    margin: string;
  };
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
  };
  innings?: ApiInning[];
}

// Player interfaces matching API spec
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
  matchesPlayed?: number;
  totalRuns?: number;
  totalWickets?: number;
  battingAverage?: number;
  bowlingAverage?: number;
  battingStrikeRate?: number;
  bowlingEconomy?: number;
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
      type: 'batting' | 'bowling';
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
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Team interfaces matching API spec
export interface ApiTeam {
  id: string;
  numericId: number;
  displayId: string;
  name: string;
  shortName: string;
  captainId?: string;
  captain?: {
    id: string;
    name: string;
    role?: string;
  };
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

// API service functions
export class CricketApiService {
  private static async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Matches API
  static async getMatches(status?: string, pagination?: PaginationParams): Promise<PaginatedResponse<ApiMatch>> {
    let queryParams = '';
    const params: string[] = [];

    if (status) params.push(`status=${status}`);
    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<ApiMatch[]>(`/matches${queryParams}`) as unknown as PaginatedResponse<ApiMatch>;
  }

  static async getMatch(numericId: number): Promise<ApiMatch | null> {
    const response = await this.request<ApiMatch>(`/matches/${numericId}`);
    return response.success ? response.data : null;
  }

  static async getInnings(matchNumericId: number): Promise<ApiInning[]> {
    const response = await this.request<ApiInning[]>(`/matches/${matchNumericId}/innings`);
    return response.success ? response.data : [];
  }

  // Players API
  static async getPlayers(pagination?: PaginationParams): Promise<ApiResponse<ApiPlayer[]>> {
    let queryParams = '';
    const params: string[] = [];

    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<ApiPlayer[]>(`/players${queryParams}`);
  }

  static async getPlayer(numericId: number): Promise<ApiPlayer | null> {
    const response = await this.request<ApiPlayer>(`/players/${numericId}`);
    return response.success ? response.data : null;
  }

  // Teams API
  static async getTeams(pagination?: PaginationParams): Promise<ApiResponse<ApiTeam[]>> {
    let queryParams = '';
    const params: string[] = [];

    if (pagination?.page) params.push(`page=${pagination.page}`);
    if (pagination?.limit) params.push(`limit=${pagination.limit}`);

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return await this.request<ApiTeam[]>(`/teams${queryParams}`);
  }

  static async getTeam(numericId: number): Promise<ApiTeam | null> {
    const response = await this.request<ApiTeam>(`/teams/${numericId}`);
    return response.success ? response.data : null;
  }

  static async getTeamMatches(teamNumericId: number): Promise<ApiResponse<ApiMatch[]>> {
    return await this.request<ApiMatch[]>(`/teams/${teamNumericId}/matches`);
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
}