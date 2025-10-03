// Cricket Scoring Backend Service - Netlify Functions
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-netlify-app.netlify.app'
  : 'http://localhost:8888'; // Netlify dev server

class CricketScoringService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}/.netlify/functions${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Match Management
  async getMatches(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/matches${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getMatchById(matchId) {
    return this.makeRequest(`/matches/${matchId}`);
  }

  async createMatch(matchData) {
    return this.makeRequest('/matches', {
      method: 'POST',
      body: JSON.stringify(matchData)
    });
  }

  async updateMatch(matchId, updateData) {
    return this.makeRequest(`/matches/${matchId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deleteMatch(matchId) {
    return this.makeRequest(`/matches/${matchId}`, {
      method: 'DELETE'
    });
  }

  // Team Management
  async getTeams() {
    return this.makeRequest('/teams');
  }

  async getTeamById(teamId) {
    return this.makeRequest(`/teams/${teamId}`);
  }

  async createTeam(teamData) {
    return this.makeRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  }

  async updateTeam(teamId, updateData) {
    return this.makeRequest(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deleteTeam(teamId) {
    return this.makeRequest(`/teams/${teamId}`, {
      method: 'DELETE'
    });
  }

  // Player Management
  async getPlayers() {
    return this.makeRequest('/players');
  }

  async getPlayerById(playerId) {
    return this.makeRequest(`/players/${playerId}`);
  }

  async createPlayer(playerData) {
    return this.makeRequest('/players', {
      method: 'POST',
      body: JSON.stringify(playerData)
    });
  }

  async updatePlayer(playerId, updateData) {
    return this.makeRequest(`/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deletePlayer(playerId) {
    return this.makeRequest(`/players/${playerId}`, {
      method: 'DELETE'
    });
  }

  // Scoring Operations
  async startInning(inningData) {
    return this.makeRequest('/scoring/start-inning', {
      method: 'POST',
      body: JSON.stringify(inningData)
    });
  }

  async recordBall(ballData) {
    return this.makeRequest('/scoring/ball', {
      method: 'POST',
      body: JSON.stringify(ballData)
    });
  }

  async updateCurrentBatsmen(inningId, batsmen) {
    return this.makeRequest('/scoring/current-batsmen', {
      method: 'PUT',
      body: JSON.stringify({ inningId, batsmen })
    });
  }

  async updateCurrentBowler(inningId, bowlerId) {
    return this.makeRequest('/scoring/current-bowler', {
      method: 'PUT',
      body: JSON.stringify({ inningId, bowlerId })
    });
  }

  async endInning(inningId) {
    return this.makeRequest('/scoring/end-inning', {
      method: 'POST',
      body: JSON.stringify({ inningId })
    });
  }

  // Live Scores
  async getLiveScores() {
    return this.makeRequest('/live-scores');
  }

  async getLiveScoreByMatchId(matchId) {
    return this.makeRequest(`/live-scores/${matchId}`);
  }
}

export const cricketScoringService = new CricketScoringService();