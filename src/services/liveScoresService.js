// Live Cricket Scores Service - Now calls backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888/api';

export const liveScoresService = {
  /**
   * Fetch live cricket scores from backend API
   * @returns {Promise<Object>} Live scores data response
   */
  async fetchLiveScores() {
    try {
      console.log('🔄 Fetching live scores from backend API...');
      const response = await fetch(`${API_BASE_URL}/api/external/live-scores`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Backend Live Scores Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Backend Live Scores API Response:', data);

      return data;

    } catch (error) {
      console.error('❌ Backend live scores API failed:', error);
      console.warn('📋 Using mock data as fallback');

      // Return mock data as fallback
      return {
        success: true,
        data: this.getMockLiveScores(),
        totalMatches: this.getMockLiveScores().length,
        source: 'mock',
        fallback: true
      };
    }
  },

  /**
   * Format live scores data from API response
   * @param {Object} data - Raw API response
   * @returns {Array} Formatted matches array
   */
  formatLiveScoresData(data) {
    console.log('🔄 Formatting live scores data...');
    
    // Handle the specific API structure: { status: "success", response: [...] }
    let allMatches = [];
    
    if (data && data.status === 'success' && data.response && Array.isArray(data.response)) {
      // Extract all matches from all series
      data.response.forEach(series => {
        if (series.matchList && Array.isArray(series.matchList)) {
          series.matchList.forEach(match => {
            allMatches.push({
              ...match,
              seriesName: series.seriesName || match.seriesName
            });
          });
        }
      });
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return [];
    }

    console.log(`📊 Found ${allMatches.length} live matches to format`);

    return allMatches.map((match, index) => {
      console.log(`  Match ${index + 1}:`, match.matchTitle);
      
      return {
        matchId: match.matchId || `match_${index}`,
        seriesId: match.seriesId,
        seriesName: match.seriesName || 'Unknown Series',
        matchTitle: match.matchTitle || 'Unknown Match',
        matchFormat: match.matchFormat?.trim() || 'T20',
        matchVenue: match.matchVenue || 'Unknown Venue',
        matchDate: match.matchDate || new Date().toLocaleDateString(),
        matchTime: match.matchTime?.trim() || 'TBD',
        matchStatus: match.matchStatus || 'In Progress',
        currentStatus: match.currentStatus || 'live',
        teamOne: {
          name: match.teamOne?.name || 'Team 1',
          score: match.teamOne?.score || '',
          status: match.teamOne?.status || 'bat'
        },
        teamTwo: {
          name: match.teamTwo?.name || 'Team 2',
          score: match.teamTwo?.score || '',
          status: match.teamTwo?.status || 'bowl'
        },
        result: match.result || null
      };
    });
  },

  /**
   * Get mock live cricket scores data for development/fallback
   * @returns {Array} Mock live scores data
   */
  getMockLiveScores() {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return [
      {
        seriesId: "8802",
        matchId: "105858", 
        seriesName: "INDIA VS AUSTRALIA TEST SERIES 2025",
        matchTitle: "India vs Australia",
        matchFormat: "1st Test",
        matchVenue: "Perth Stadium, Perth",
        matchDate: dateStr,
        matchTime: "10:20 AM LOCAL",
        teamOne: {
          name: "IND",
          score: "280-6 (75.3 Ovs)",
          status: "bat"
        },
        teamTwo: {
          name: "AUS",
          score: "",
          status: "bowl"
        },
        matchStatus: "India 280/6",
        currentStatus: "live",
        result: null
      },
      {
        seriesId: "8803",
        matchId: "105859",
        seriesName: "ICC WORLD TEST CHAMPIONSHIP 2025",
        matchTitle: "England vs South Africa", 
        matchFormat: "2nd Test",
        matchVenue: "Lord's, London",
        matchDate: dateStr,
        matchTime: "11:00 AM LOCAL",
        teamOne: {
          name: "ENG",
          score: "345 & 120-3 (32.0 Ovs)",
          status: "bat"
        },
        teamTwo: {
          name: "SA",
          score: "298 (95.4 Ovs)", 
          status: "bowl"
        },
        matchStatus: "England lead by 167 runs",
        currentStatus: "live",
        result: null
      },
      {
        seriesId: "8804", 
        matchId: "105860",
        seriesName: "PAKISTAN VS NEW ZEALAND ODI SERIES 2025",
        matchTitle: "Pakistan vs New Zealand",
        matchFormat: "3rd ODI",
        matchVenue: "National Stadium, Karachi",
        matchDate: dateStr,
        matchTime: "02:30 PM LOCAL",
        teamOne: {
          name: "PAK",
          score: "285-7 (50.0 Ovs)",
          status: "bat"
        },
        teamTwo: {
          name: "NZ",
          score: "178-5 (35.2 Ovs)",
          status: "bowl"
        },
        matchStatus: "New Zealand need 108 runs in 88 balls",
        currentStatus: "live",
        result: null
      },
      {
        seriesId: "8805",
        matchId: "105861", 
        seriesName: "WOMEN'S T20 WORLD CUP 2025",
        matchTitle: "India Women vs Australia Women",
        matchFormat: "Semi-Final",
        matchVenue: "Dubai International Stadium", 
        matchDate: dateStr,
        matchTime: "06:00 PM LOCAL",
        teamOne: {
          name: "IND-W",
          score: "156-6 (20.0 Ovs)",
          status: "bat"
        },
        teamTwo: {
          name: "AUS-W",
          score: "89-3 (12.4 Ovs)",
          status: "bowl"
        },
        matchStatus: "Australia need 68 runs in 44 balls",
        currentStatus: "live",
        result: null
      },
      {
        seriesId: "8806",
        matchId: "105862",
        seriesName: "BIG BASH LEAGUE 2025",
        matchTitle: "Sydney Thunder vs Melbourne Stars", 
        matchFormat: "T20",
        matchVenue: "Sydney Showground Stadium",
        matchDate: dateStr,
        matchTime: "07:15 PM LOCAL",
        teamOne: {
          name: "SYT",
          score: "178-5 (20.0 Ovs)",
          status: "bat"
        },
        teamTwo: {
          name: "MLS",
          score: "145-7 (17.3 Ovs)", 
          status: "bowl"
        },
        matchStatus: "Melbourne Stars need 34 runs in 15 balls",
        currentStatus: "live",
        result: null
      }
    ];
  },

  /**
   * Format match status for display
   * @param {Object} match - Match object
   * @returns {Object} Formatted status with text and class
   */
  getDisplayStatus(match) {
    if (match.currentStatus === 'live') {
      return {
        text: 'LIVE',
        icon: '🔴',
        class: 'status-live',
        fullText: 'Live Now'
      };
    } else if (match.currentStatus === 'completed') {
      return {
        text: 'COMPLETED',
        icon: '✅',
        class: 'status-completed',
        fullText: 'Match Finished'
      };
    } else if (match.currentStatus === 'upcoming') {
      return {
        text: 'UPCOMING',
        icon: '⏰',
        class: 'status-upcoming',
        fullText: 'Starting Soon'
      };
    }
    return {
      text: match.currentStatus.toUpperCase(),
      icon: '📍',
      class: 'status-default',
      fullText: match.currentStatus
    };
  },

  /**
   * Get team display score  
   * @param {Object} team - Team object
   * @returns {string} Formatted score
   */
  getTeamDisplayScore(team) {
    if (!team.score || team.score === '') {
      return 'Yet to bat';
    }
    return team.score;
  },

  /**
   * Format date and time for display
   * @param {string} date - Date string
   * @param {string} time - Time string  
   * @returns {string} Formatted date time
   */
  formatDateTime(date, time) {
    try {
      if (time && time.trim() !== '') {
        return `${date} • ${time}`;
      }
      return date;
    } catch (error) {
      return date || 'TBD';
    }
  }
};

export default liveScoresService;