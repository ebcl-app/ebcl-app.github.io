// News API service - Now calls backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8888/api';

export const newsService = {
  /**
   * Fetch cricket news from backend API
   * @param {number} limit - Number of news items to fetch (default: 10)
   * @returns {Promise<Object>} News data response
   */
  async fetchCricketNews(limit = 10) {
    try {
      console.log('📰 Fetching cricket news from backend API...');

      const params = new URLSearchParams({
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE_URL}/api/external/news?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📰 Backend News API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📰 Backend News API Response:', data);

      return data;

    } catch (error) {
      console.warn('📰 Backend news API failed, using mock data:', error.message);

      // Return mock data as fallback
      return {
        success: true,
        data: this.getMockNews(),
        totalResults: this.getMockNews().length,
        source: 'mock',
        fallback: true
      };
    }
  },

  /**
   * Get mock cricket news data for development/fallback
   * @returns {Array} Mock news data
   */
  getMockNews() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    return [
      {
        article_id: "mock_1",
        title: "India Dominates Australia in Test Series Opener at Perth",
        description: "India secured a commanding victory over Australia in the first Test match at Perth, with outstanding performances from both batting and bowling units.",
        pubDate: today.toISOString(),
        source_name: "Cricbuzz",
        link: "#",
        image_url: "https://static.cricbuzz.com/a/img/v1/595x396/i1/c384729/india-celebration.jpg"
      },
      {
        article_id: "mock_2", 
        title: "Virat Kohli Reaches Milestone with 50th ODI Century",
        description: "Virat Kohli has etched his name further in cricket history by scoring his 50th ODI century, matching Sachin Tendulkar's incredible record.",
        pubDate: today.toISOString(),
        source_name: "ESPNCricinfo",
        link: "#",
        image_url: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_wide_w_1200/lsci/db/PICTURES/CMS/319900/319946.jpg"
      },
      {
        article_id: "mock_3",
        title: "ICC Announces Changes to World Test Championship Format",
        description: "The International Cricket Council has announced significant changes to the World Test Championship format for the 2025-2027 cycle.",
        pubDate: yesterday.toISOString(), 
        source_name: "ICC Cricket",
        link: "#",
        image_url: "https://resources.platform.iplt20.com/photo-resources/2023/07/20/8c8a8b8a-8b8a-4b8a-8b8a-8b8a8b8a8b8a/icc.jpg"
      },
      {
        article_id: "mock_4",
        title: "Women's T20 World Cup 2025: India Eyes Historic Title",
        description: "The Indian women's cricket team is gearing up for the T20 World Cup 2025, with high hopes of clinching their first-ever T20 World Cup title.",
        pubDate: yesterday.toISOString(),
        source_name: "BCCI",
        link: "#",
        image_url: "https://static.toiimg.com/thumb/msid-94345678,width-1200,height-900/94345678.jpg"
      },
      {
        article_id: "mock_5",
        title: "IPL 2026 Mega Auction: Franchises Gear Up for Biggest Sale",
        description: "IPL franchises are finalizing their retention strategies ahead of the IPL 2026 mega auction, with several star players expected to go under the hammer.",
        pubDate: twoDaysAgo.toISOString(),
        source_name: "IPL Official",
        link: "#",
        image_url: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_wide_w_1200/lsci/db/PICTURES/CMS/323400/323456.jpg"
      },
      {
        article_id: "mock_6",
        title: "Pakistan Cricket Board Appoints New Head Coach",
        description: "The Pakistan Cricket Board has announced the appointment of a new head coach for the national team, signaling a fresh start for Pakistani cricket.",
        pubDate: twoDaysAgo.toISOString(),
        source_name: "PCB Official",
        link: "#",
        image_url: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_wide_w_1200/lsci/db/PICTURES/CMS/323500/323567.jpg"
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