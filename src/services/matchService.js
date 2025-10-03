const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888';

class MatchService {
  async getMatchDetails(matchId) {
    try {
      console.log('getMatchDetails called with matchId:', matchId);
      console.log('API_BASE_URL:', API_BASE_URL);
      const url = `${API_BASE_URL}/api/matches/${matchId}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('API response status:', response.status);
      
      const result = await response.json();
      console.log('API response data:', result);

      if (!response.ok) {
        console.error('API call failed with status:', response.status, 'result:', result);
        throw new Error(result.message || 'Failed to get match details');
      }

      const match = result.data || result;
      console.log('Processed match data:', match);
      
      // Fetch team details
      const [team1Data, team2Data] = await Promise.all([
        this.getTeamDetails(match.team1Id),
        this.getTeamDetails(match.team2Id)
      ]);

      // Use lineups from the API response instead of fetching separately
      const team1Lineup = match.lineups?.[match.team1Id] || { players: [] };
      const team2Lineup = match.lineups?.[match.team2Id] || { players: [] };

      // Transform lineup players to match frontend format
      const transformPlayers = (lineup) => {
        if (!lineup.playersDetails || !Array.isArray(lineup.playersDetails)) {
          return [];
        }
        return lineup.playersDetails.map(player => ({
          id: player.id,
          name: player.name,
          role: player.role,
          battingStyle: player.battingStyle,
          bowlingStyle: player.bowlingStyle,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          status: 'not-out'
        }));
      };

      // Transform data to match frontend expectations
      return {
        id: match.id,
        title: match.title,
        venue: match.venue,
        date: match.date,
        format: match.format,
        overs: match.overs,
        status: match.status,
        currentInnings: match.currentInnings,
        tossWinner: match.tossWinner,
        tossDecision: match.tossDecision,
        winner: match.winner,
        result: match.result,
        innings: match.innings || [], // Include innings data from API
        teamA: {
          id: team1Data.id,
          name: team1Data.name,
          shortName: team1Data.shortName,
          captainId: team1Data.captainId,
          players: transformPlayers(team1Lineup)
        },
        teamB: {
          id: team2Data.id,
          name: team2Data.name,
          shortName: team2Data.shortName,
          captainId: team2Data.captainId,
          players: transformPlayers(team2Lineup)
        },
        score: { teamA: 0, teamB: 0 },
        wickets: { teamA: 0, teamB: 0 },
        overs: { teamA: 0, teamB: 0 },
        balls: { teamA: 0, teamB: 0 }
      };
    } catch (error) {
      console.error('Error getting match details:', error);
      throw error;
    }
  }

  async getTeamDetails(teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get team details');
      }

      return result.data || result;
    } catch (error) {
      console.error('Error getting team details:', error);
      throw error;
    }
  }

  async getTeamLineup(lineupId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teamLineups/${lineupId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get team lineup');
      }
      
      const lineup = result.data || result;
      
      // Fetch player details for the lineup
      const playerPromises = lineup.playerIds.map(playerId => 
        this.getPlayerDetails(playerId)
      );
      
      const players = await Promise.all(playerPromises);
      
      // Transform players to match frontend format
      const transformedPlayers = players.map(player => ({
        id: player.id,
        name: player.name,
        role: player.role,
        battingStyle: player.battingStyle,
        bowlingStyle: player.bowlingStyle,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        status: 'not-out'
      }));

      return {
        ...lineup,
        players: transformedPlayers
      };
    } catch (error) {
      console.error('Error getting team lineup:', error);
      throw error;
    }
  }

  async getPlayerDetails(playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${playerId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get player details');
      }

      return result.data || result;
    } catch (error) {
      console.error('Error getting player details:', error);
      throw error;
    }
  }

  async getAllMatches() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get matches');
      }

      const matchesData = result.data || result;
      
      // Transform each match to match frontend expectations
      const transformedMatches = matchesData.map(match => ({
        id: match.id,
        title: match.title,
        venue: match.venue,
        date: match.date,
        format: match.format,
        overs: match.overs,
        status: match.status,
        currentInnings: match.currentInnings,
        tossWinner: match.tossWinner,
        tossDecision: match.tossDecision,
        scheduledDate: match.date, // Use date as scheduledDate
        completedDate: match.endTime,
        result: match.result,
        winner: match.winner,
        team1: {
          id: match.team1?.id,
          name: match.team1?.name || 'Unknown Team',
          shortName: match.team1?.shortName || match.team1?.name?.substring(0, 3).toUpperCase() || 'UNK',
          players: match.lineups?.[match.team1?.id]?.playingXI?.length || 11,
          captainId: match.team1?.captainId
        },
        team2: {
          id: match.team2?.id,
          name: match.team2?.name || 'Unknown Team',
          shortName: match.team2?.shortName || match.team2?.name?.substring(0, 3).toUpperCase() || 'UNK',
          players: match.lineups?.[match.team2?.id]?.playingXI?.length || 11,
          captainId: match.team2?.captainId
        },
        score: { teamA: 0, teamB: 0 },
        wickets: { teamA: 0, teamB: 0 },
        lineups: match.lineups
      }));

      return transformedMatches;
    } catch (error) {
      console.error('Error getting matches:', error);
      throw error;
    }
  }

  async createMatch(matchData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create match');
      }

      return data;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }
}

export default new MatchService();