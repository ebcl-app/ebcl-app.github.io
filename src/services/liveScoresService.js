// Live Cricket Scores Service
export const liveScoresService = {
  /**
   * Fetch live cricket scores from Score.json
   * @returns {Promise<Object>} Live scores data response
   */
  async fetchLiveScores() {
    try {
      // In a real app, this would be an API call
      // For now, we'll load the Score.json file
      const response = await fetch('/Score.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error('API request failed');
      }
      
      // Extract matches from the response structure
      const matches = [];
      if (data.response && data.response.length > 0) {
        data.response.forEach(series => {
          if (series.matchList && series.matchList.length > 0) {
            series.matchList.forEach(match => {
              matches.push({
                ...match,
                seriesName: series.seriesName
              });
            });
          }
        });
      }
      
      return {
        success: true,
        data: matches,
        totalMatches: matches.length
      };
      
    } catch (error) {
      console.error('Error fetching live scores:', error);
      
      // Return mock data as fallback
      return {
        success: false,
        error: error.message,
        data: this.getMockLiveScores(),
        totalMatches: this.getMockLiveScores().length
      };
    }
  },

  /**
   * Get mock live cricket scores data for development/fallback
   * @returns {Array} Mock live scores data
   */
  getMockLiveScores() {
    return [
      {
        seriesId: "8802",
        matchId: "105858", 
        seriesName: "ENGLAND TOUR OF IRELAND, 2025",
        matchTitle: "Ireland vs England",
        matchFormat: "3rd T20I",
        matchVenue: "Dublin, The Village",
        matchDate: "Sep 21",
        matchTime: "01:30 PM LOCAL",
        teamOne: {
          name: "ENG",
          score: "",
          status: "bowl"
        },
        teamTwo: {
          name: "IRE", 
          score: "44-1 (5.1 Ovs)",
          status: "bat"
        },
        matchStatus: "England opt to bowl",
        currentStatus: "live"
      },
      {
        seriesId: "8803",
        matchId: "105859",
        seriesName: "ASIA CUP 2025",
        matchTitle: "India vs Pakistan", 
        matchFormat: "Super 4",
        matchVenue: "Dubai International Stadium",
        matchDate: "Sep 21",
        matchTime: "07:30 PM LOCAL",
        teamOne: {
          name: "IND",
          score: "185-4 (20.0 Ovs)",
          status: "bat"
        },
        teamTwo: {
          name: "PAK",
          score: "156-8 (20.0 Ovs)", 
          status: "bowl"
        },
        matchStatus: "India won by 29 runs",
        currentStatus: "completed"
      },
      {
        seriesId: "8804", 
        matchId: "105860",
        seriesName: "AUSTRALIA TOUR OF ENGLAND, 2025",
        matchTitle: "Australia vs England",
        matchFormat: "1st Test",
        matchVenue: "Lord's, London",
        matchDate: "Sep 22",
        matchTime: "11:00 AM LOCAL",
        teamOne: {
          name: "AUS",
          score: "267 & 45-1 (12.0 Ovs)",
          status: "bat"
        },
        teamTwo: {
          name: "ENG",
          score: "298 (98.4 Ovs)",
          status: "bowl"
        },
        matchStatus: "Australia trail by 31 runs",
        currentStatus: "live"
      },
      {
        seriesId: "8805",
        matchId: "105861", 
        seriesName: "WOMEN'S ODI WORLD CUP 2025",
        matchTitle: "India Women vs Sri Lanka Women",
        matchFormat: "Match 1",
        matchVenue: "Dubai International Stadium", 
        matchDate: "Sep 22",
        matchTime: "02:00 PM LOCAL",
        teamOne: {
          name: "IND-W",
          score: "278-5 (50.0 Ovs)",
          status: "bat"
        },
        teamTwo: {
          name: "SL-W",
          score: "134-7 (32.0 Ovs)",
          status: "bowl"
        },
        matchStatus: "Sri Lanka need 145 runs in 108 balls",
        currentStatus: "live"
      },
      {
        seriesId: "8806",
        matchId: "105862",
        seriesName: "IPL 2026 AUCTION",
        matchTitle: "Mega Auction Day 1", 
        matchFormat: "Auction",
        matchVenue: "Bengaluru",
        matchDate: "Sep 22",
        matchTime: "10:00 AM IST",
        teamOne: {
          name: "Players",
          score: "567 Sold",
          status: "sold"
        },
        teamTwo: {
          name: "Unsold",
          score: "234 Unsold", 
          status: "unsold"
        },
        matchStatus: "Record breaking auction continues",
        currentStatus: "live"
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