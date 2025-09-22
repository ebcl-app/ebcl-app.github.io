// News API service for fetching cricket news
const NEWS_API_BASE_URL = 'https://newsdata.io/api/1/latest';

// Replace with your actual API key from newsdata.io
const API_KEY = 'YOUR_API_KEY';

export const newsService = {
  /**
   * Fetch cricket news from newsdata.io API
   * @param {number} limit - Number of news items to fetch (default: 10)
   * @returns {Promise<Object>} News data response
   */
  async fetchCricketNews(limit = 10) {
    try {
      const params = new URLSearchParams({
        apikey: API_KEY,
        q: 'Cricket,News,English,India',
        category: 'sports',
        language: 'en',
        country: 'in',
        size: limit.toString()
      });

      const response = await fetch(`${NEWS_API_BASE_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'API request failed');
      }
      
      return {
        success: true,
        data: data.results || [],
        totalResults: data.totalResults || 0
      };
      
    } catch (error) {
      console.error('Error fetching cricket news:', error);
      
      // Return mock data as fallback
      return {
        success: false,
        error: error.message,
        data: this.getMockNews(),
        totalResults: this.getMockNews().length
      };
    }
  },

  /**
   * Get mock cricket news data for development/fallback
   * @returns {Array} Mock news data
   */
  getMockNews() {
    return [
      {
        article_id: "mock_1",
        title: "Andy Pycroft to Officiate India vs Pakistan Asia Cup 2025 Match Despite PCB Protest",
        description: "The upcoming India vs Pakistan Super 4s match in the Asia Cup 2025 is set to be officiated by Andy Pycroft, despite recent controversy surrounding his role in the teams' previous encounter.",
        pubDate: "2025-09-20 11:35:23",
        source_name: "Pragativadi",
        link: "#",
        image_url: "https://pragativadi.com/wp-content/uploads/2025/09/andy-640x375.png"
      },
      {
        article_id: "mock_2", 
        title: "Oman Captain Appeals to BCCI for Support After Close Asia Cup Contest Against India",
        description: "Oman captain Jatinder Singh has called on the Board of Control for Cricket in India (BCCI) to extend its support and help Associate nations like Oman get more game time with top-tier teams.",
        pubDate: "2025-09-20 08:49:44",
        source_name: "Pragativadi",
        link: "#",
        image_url: "https://pragativadi.com/wp-content/uploads/2025/09/Oman-Captain-Appeals-to-BCCI-for-Support-After-Close-Asia-Cup-Contest-Against-India-750x375.jpg"
      },
      {
        article_id: "mock_3",
        title: "Sri Lanka vs Bangladesh, Super 4 Asia Cup 2025: Live Streaming, Telecast, Match Timings",
        description: "The Asia Cup 2025 Super 4 stage kicked off with a thrilling clash between Sri Lanka and Bangladesh at the Dubai International Cricket Stadium on Saturday, September 20, 2025.",
        pubDate: "2025-09-20 06:59:00", 
        source_name: "Zee News",
        link: "#",
        image_url: "https://english.cdn.zeenews.com/sites/default/files/2025/09/20/1831865-roko-2025-09-20t115612.533.png"
      },
      {
        article_id: "mock_4",
        title: "Women's ODI World Cup 2025: Suryakumar Hails Jemimah, Men's Stars Back Team",
        description: "India T20I captain Suryakumar Yadav praised Jemimah Rodrigues ahead of the Women's ODI World Cup opener against Sri Lanka. Sanju Samson and Hardik Pandya also lauded team members.",
        pubDate: "2025-09-20 06:38:30",
        source_name: "Asianet Newsable",
        link: "#",
        image_url: "https://static.asianetnews.com/images/w-1280,h-720,format-jpg,imgid-ani20250919172546,imgname-image-44b43adb-b7fe-419f-9465-a01a991d0e20.jpg"
      },
      {
        article_id: "mock_5",
        title: "Hardik Pandya ends 93-run stand with stunning catch at boundary ropes in IND vs OMA Asia Cup 2025 match",
        description: "Hardik Pandya took a stunning catch at the boundary ropes to dismiss Aamir Kaleem in the Asia Cup 2025 match between India and Oman in Abu Dhabi on Friday, September 19.",
        pubDate: "2025-09-19 18:55:22",
        source_name: "Sportskeeda",
        link: "#",
        image_url: "https://staticg.sportskeeda.com/editor/2025/09/4bccb-17583073826338-1920.jpg?w=640"
      },
      {
        article_id: "mock_6",
        title: "IPL 2026 Auction: Franchises Prepare Strategy for Mega Auction",
        description: "IPL franchises are busy finalizing their retention strategies ahead of the mega auction for IPL 2026, with several star players expected to change teams.",
        pubDate: "2025-09-19 12:45:33",
        source_name: "ESPNCricinfo",
        link: "#",
        image_url: "https://staticg.sportskeeda.com/editor/2025/09/b7e2a-17583144342786-1920.jpg?w=640"
      }
    ];
  },

  /**
   * Format date for display
   * @param {string} dateString - Date string from API
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }
};

export default newsService;