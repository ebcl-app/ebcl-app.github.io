const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888';

class TeamService {
  /**
   * Fetch all teams from backend API
   * @returns {Promise<Object>} Teams data response
   */
  async getAllTeams() {
    try {
      console.log('🏏 Fetching teams from backend API...');
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🏏 Teams API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🏏 Teams API Response:', data);

      return data;

    } catch (error) {
      console.error('❌ Teams API failed:', error);
      throw error;
    }
  }

  /**
   * Get team details by ID
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Team data
   */
  async getTeamById(teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;

    } catch (error) {
      console.error('Error getting team details:', error);
      throw error;
    }
  }

  /**
   * Create a new team
   * @param {Object} teamData - Team data
   * @returns {Promise<Object>} Created team data
   */
  async createTeam(teamData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create team');
      }

      return data;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Update a team
   * @param {string} teamId - Team ID
   * @param {Object} teamData - Updated team data
   * @returns {Promise<Object>} Updated team data
   */
  async updateTeam(teamId, teamData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update team');
      }

      return data;
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }

  /**
   * Delete a team
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTeam(teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete team');
      }

      return data;
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }
}

export default new TeamService();