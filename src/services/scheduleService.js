// Cricket Schedule Service - Now calls backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888/api';

export const scheduleService = {
  /**
   * Fetch cricket schedule from backend API
   * @returns {Promise<Object>} Schedule data response
   */
  async fetchCricketSchedule() {
    try {
      console.log('� Fetching cricket schedule from backend API...');
      const response = await fetch(`${API_BASE_URL}/api/external/schedules`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📅 Backend Schedule API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📅 Backend Schedule API Response:', data);

      return data;

    } catch (error) {
      console.error('❌ Backend schedule API failed:', error);
      console.warn('📋 Using mock data as fallback');

      // Return mock data as fallback
      return {
        success: true,
        data: this.getMockSchedule(),
        totalMatches: this.getMockSchedule().length,
        source: 'mock',
        fallback: true
      };
    }
  },

  /**
   * Format schedule data from API response
   * @param {Object} data - Raw API response
   * @returns {Array} Formatted schedule array
   */
  formatScheduleData(data) {
    console.log('🔄 Formatting schedule data...');

    // Handle the backend API structure: { success: true, data: [...], totalMatches: N, source: 'external-api' }
    if (data && data.success && Array.isArray(data.data)) {
      console.log(`📅 Found ${data.data.length} scheduled matches from backend API`);

      return data.data.map((match, index) => {
        console.log(`  Scheduled Match ${index + 1}:`, match.matchTitle);

        // Parse the date if it's in a specific format
        let matchDate = match.matchDate;
        if (match.matchDate && typeof match.matchDate === 'string') {
          try {
            // Try to parse various date formats
            const parsedDate = new Date(match.matchDate);
            if (!isNaN(parsedDate.getTime())) {
              matchDate = parsedDate.toISOString().split('T')[0];
            }
          } catch (e) {
            matchDate = new Date().toISOString().split('T')[0];
          }
        }

        return {
          matchId: match.matchId || `sched_${index}`,
          seriesId: match.seriesId,
          seriesName: match.seriesName || 'Unknown Series',
          matchTitle: match.matchTitle || 'Unknown Match',
          matchDesc: match.matchDesc,
          matchFormat: match.matchFormat || 'T20',
          matchVenue: match.venue || match.matchVenue || 'Unknown Venue',
          matchDate: matchDate,
          matchTime: match.matchTime || match.startDate || 'TBD',
          date: match.matchDate, // Keep original date format
          status: match.status || 'Scheduled',
          teamOne: match.team1 || match.teamOne || { name: 'Team 1' },
          teamTwo: match.team2 || match.teamTwo || { name: 'Team 2' }
        };
      });
    } else {
      console.warn('⚠️ Unexpected API response structure:', data);
      return [];
    }
  },

  /**
   * Get mock cricket schedule data for development/fallback
   * @returns {Array} Mock schedule data
   */
  getMockSchedule() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const twoWeeks = new Date(today);
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    const threeWeeks = new Date(today);
    threeWeeks.setDate(threeWeeks.getDate() + 21);

    return [
      {
        matchId: "sched_1",
        seriesName: "INDIA VS AUSTRALIA TEST SERIES 2025",
        matchTitle: "India vs Australia - 2nd Test",
        matchFormat: "Test",
        matchVenue: "Adelaide Oval, Adelaide",
        matchDate: nextWeek.toISOString().split('T')[0],
        matchTime: "09:30",
        teamOne: {
          name: "India",
          flag: "🇮🇳"
        },
        teamTwo: {
          name: "Australia",
          flag: "��"
        },
        status: "Scheduled"
      },
      {
        matchId: "sched_2",
        seriesName: "ICC WORLD TEST CHAMPIONSHIP 2025",
        matchTitle: "England vs South Africa - 3rd Test",
        matchFormat: "Test",
        matchVenue: "The Oval, London",
        matchDate: nextWeek.toISOString().split('T')[0],
        matchTime: "11:00",
        teamOne: {
          name: "England",
          flag: "�"
        },
        teamTwo: {
          name: "South Africa",
          flag: "��"
        },
        status: "Scheduled"
      },
      {
        matchId: "sched_3",
        seriesName: "PAKISTAN VS NEW ZEALAND ODI SERIES 2025",
        matchTitle: "Pakistan vs New Zealand - 4th ODI",
        matchFormat: "ODI",
        matchVenue: "Gaddafi Stadium, Lahore",
        matchDate: tomorrow.toISOString().split('T')[0],
        matchTime: "14:30",
        teamOne: {
          name: "Pakistan",
          flag: "��"
        },
        teamTwo: {
          name: "New Zealand",
          flag: "🇳�"
        },
        status: "Scheduled"
      },
      {
        matchId: "sched_4",
        seriesName: "WOMEN'S T20 WORLD CUP 2025",
        matchTitle: "Final - TBD vs TBD",
        matchFormat: "T20",
        matchVenue: "Dubai International Stadium",
        matchDate: twoWeeks.toISOString().split('T')[0],
        matchTime: "18:00",
        teamOne: {
          name: "TBD",
          flag: "�"
        },
        teamTwo: {
          name: "TBD",
          flag: "�"
        },
        status: "Scheduled"
      },
      {
        matchId: "sched_5",
        seriesName: "BIG BASH LEAGUE 2025",
        matchTitle: "Perth Scorchers vs Sydney Sixers",
        matchFormat: "T20",
        matchVenue: "Perth Stadium, Perth",
        matchDate: threeWeeks.toISOString().split('T')[0],
        matchTime: "19:15",
        teamOne: {
          name: "Perth Scorchers",
          flag: "�"
        },
        teamTwo: {
          name: "Sydney Sixers",
          flag: "�"
        },
        status: "Scheduled"
      }
    ];
  }
};

export default scheduleService;
