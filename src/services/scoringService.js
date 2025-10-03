const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

class ScoringService {
  async startInning(matchId, battingTeamId, bowlingTeamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scoring/innings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          battingTeamId,
          bowlingTeamId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start inning');
      }

      return data;
    } catch (error) {
      console.error('Error starting inning:', error);
      throw error;
    }
  }

  async recordBall(ballData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scoring/balls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ballData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to record ball');
      }

      return data;
    } catch (error) {
      console.error('Error recording ball:', error);
      throw error;
    }
  }

  async setBatsmen(inningId, strikerId, nonStrikerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scoring/innings/${inningId}/batsmen`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strikerId,
          nonStrikerId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set batsmen');
      }

      return data;
    } catch (error) {
      console.error('Error setting batsmen:', error);
      throw error;
    }
  }

  async setBowler(inningId, bowlerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scoring/innings/${inningId}/bowler`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bowlerId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set bowler');
      }

      return data;
    } catch (error) {
      console.error('Error setting bowler:', error);
      throw error;
    }
  }

  async getInningDetails(inningId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scoring/innings/${inningId}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get inning details');
      }

      return data;
    } catch (error) {
      console.error('Error getting inning details:', error);
      throw error;
    }
  }
}

export default new ScoringService();