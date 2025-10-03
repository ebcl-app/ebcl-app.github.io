const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888';

class PlayerService {
  /**
   * Fetch all players from backend API
   * @returns {Promise<Object>} Players data response
   */
  async getAllPlayers() {
    try {
      console.log('🏏 Fetching players from backend API...');
      const response = await fetch(`${API_BASE_URL}/api/players`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🏏 Players API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🏏 Players API Response:', data);

      return data;

    } catch (error) {
      console.error('❌ Players API failed:', error);
      throw error;
    }
  }

  /**
   * Get player details by ID
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} Player data
   */
  async getPlayerById(playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${playerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Player API failed:', error);
      throw error;
    }
  }

  /**
   * Create a new player
   * @param {Object} playerData - Player data
   * @returns {Promise<Object>} Created player data
   */
  async createPlayer(playerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(playerData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Create player API failed:', error);
      throw error;
    }
  }

  /**
   * Update player details
   * @param {string} playerId - Player ID
   * @param {Object} playerData - Updated player data
   * @returns {Promise<Object>} Updated player data
   */
  async updatePlayer(playerId, playerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(playerData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Update player API failed:', error);
      throw error;
    }
  }

  /**
   * Delete a player
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} Deletion response
   */
  async deletePlayer(playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/players/${playerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Delete player API failed:', error);
      throw error;
    }
  }
}

const playerService = new PlayerService();
export default playerService;