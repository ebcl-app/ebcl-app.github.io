import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { newsService } from '../services/newsService';
import { liveScoresService } from '../services/liveScoresService';
import { scheduleService } from '../services/scheduleService';
import '../styles/figma-cricket-theme.css';
import '../styles/news-page.css'; // Renamed to news-page.css for page-specific layouts only

const News = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('news'); // 'news', 'live', 'schedule'
  const [news, setNews] = useState([]);
  const [liveScores, setLiveScores] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState({ news: 'loading', scores: 'loading', schedule: 'loading' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [newsData, scoresData, scheduleData] = await Promise.all([
        newsService.fetchCricketNews(20),
        liveScoresService.fetchLiveScores(),
        scheduleService.fetchCricketSchedule()
      ]);

      console.log('News Data:', newsData);
      console.log('Scores Data:', scoresData);
      console.log('Schedule Data:', scheduleData);

      const newsArray = newsData.data || [];
      const scoresArray = scoresData.data || [];
      const scheduleArray = scheduleData.data || [];

      console.log(`📰 News items: ${newsArray.length}`);
      console.log(`🏏 Live scores: ${scoresArray.length}`);
      console.log(`📅 Scheduled matches: ${scheduleArray.length}`);

      setNews(newsArray);
      setLiveScores(scoresArray);
      setSchedule(scheduleArray);
      
      // Track data source (API or mock)
      setDataSource({
        news: newsData.source || (newsData.fallback ? 'mock' : 'api'),
        scores: scoresData.source || (scoresData.fallback ? 'mock' : 'api'),
        schedule: scheduleData.source || (scheduleData.fallback ? 'mock' : 'api')
      });
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadAllData();
  };

  return (
    <div className={`figma-cricket-app app-theme ${isDarkMode ? 'dark' : 'light'}`} role="main">
      {/* Header */}
      <header className="figma-header">
        <div className="figma-header-left">
          <div className="figma-logo-container">
            <span className="figma-logo-icon" role="img" aria-label="Cricket News">📰</span>
            <h1 className="figma-title">Cricket News</h1>
          </div>
        </div>
        <div className="figma-header-right">
          <button 
            onClick={refreshData}
            className="figma-refresh-button"
            aria-label="Refresh data"
            disabled={loading}
          >
            <span className={loading ? 'spinning' : ''}>🔄</span>
          </button>
          <button 
            className="figma-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDarkMode}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="figma-main-layout">
        
        {/* Tab Navigation */}
        <section className="figma-card">
          <div className="figma-tab-navigation">
            <button 
              className={`figma-tab-button ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
              aria-pressed={activeTab === 'news'}
            >
              <span className="figma-tab-icon">📰</span>
              <span className="figma-tab-label">News</span>
              <span className="figma-tab-count">{news.length}</span>
              {dataSource.news === 'mock' && <span className="figma-mock-indicator" title="Using sample data">📋</span>}
            </button>
            <button 
              className={`figma-tab-button ${activeTab === 'live' ? 'active' : ''}`}
              onClick={() => setActiveTab('live')}
              aria-pressed={activeTab === 'live'}
            >
              <span className="figma-tab-icon">🏏</span>
              <span className="figma-tab-label">Live Scores</span>
              <span className="figma-tab-count">{liveScores.length}</span>
              {dataSource.scores === 'mock' && <span className="figma-mock-indicator" title="Using sample data">📋</span>}
            </button>
            <button 
              className={`figma-tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
              aria-pressed={activeTab === 'schedule'}
            >
              <span className="figma-tab-icon">📅</span>
              <span className="figma-tab-label">Schedule</span>
              <span className="figma-tab-count">{schedule.length}</span>
              {dataSource.schedule === 'mock' && <span className="figma-mock-indicator" title="Using sample data">📋</span>}
            </button>
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <section className="figma-card">
            <div className="figma-loading-state">
              <div className="figma-spinner"></div>
              <p>Loading cricket updates...</p>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && !loading && (
          <section className="figma-card">
            <div className="figma-error-state">
              <span className="figma-error-icon">⚠️</span>
              <p>{error}</p>
              <button className="figma-btn figma-btn-orange" onClick={refreshData}>
                Try Again
              </button>
            </div>
          </section>
        )}

        {/* News Tab Content */}
        {activeTab === 'news' && !loading && (
          <div className="figma-news-grid">
            {news.length > 0 ? news.map((item, index) => (
              <article key={item.article_id || index} className="figma-news-card">
                {item.image_url && (
                  <div className="figma-news-image">
                    <img src={item.image_url} alt={item.title} loading="lazy" />
                  </div>
                )}
                <div className="figma-news-content">
                  <h3 className="figma-news-title">{item.title}</h3>
                  <p className="figma-news-description">
                    {item.description || 'No description available'}
                  </p>
                  <div className="figma-news-meta">
                    <span className="figma-news-source">{item.source_name || item.source_id}</span>
                    <span className="figma-news-date">
                      {new Date(item.pubDate).toLocaleDateString()}
                    </span>
                  </div>
                  {item.link && item.link !== '#' && (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="figma-news-link"
                    >
                      Read More →
                    </a>
                  )}
                </div>
              </article>
            )) : (
              <div className="figma-empty-state">
                <div className="figma-empty-icon">📰</div>
                <div className="figma-empty-text">
                  <h4>No News Available</h4>
                  <p>Check back later for cricket news updates</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Scores Tab Content */}
        {activeTab === 'live' && !loading && (
          <div className="figma-scores-grid">
            {liveScores.length > 0 ? liveScores.map((match, index) => (
              <article key={match.matchId || index} className="figma-score-card">
                <div className="figma-score-header">
                  <span className="figma-badge figma-badge-red">● LIVE</span>
                  <span className="figma-score-format">{match.matchFormat}</span>
                </div>
                <div className="figma-score-series">{match.seriesName}</div>
                <div className="figma-score-teams">
                  <div className="figma-score-team">
                    <span className="figma-team-name">{match.teamOne?.name}</span>
                    <span className="figma-team-score">{match.teamOne?.score || '-'}</span>
                  </div>
                  <div className="figma-score-vs">vs</div>
                  <div className="figma-score-team">
                    <span className="figma-team-name">{match.teamTwo?.name}</span>
                    <span className="figma-team-score">{match.teamTwo?.score || '-'}</span>
                  </div>
                </div>
                {match.result && (
                  <div className="figma-score-result">{match.result}</div>
                )}
                <div className="figma-score-venue">
                  📍 {match.matchVenue}
                </div>
              </article>
            )) : (
              <div className="figma-empty-state">
                <div className="figma-empty-icon">🏏</div>
                <div className="figma-empty-text">
                  <h4>No Live Matches</h4>
                  <p>There are no live cricket matches at the moment</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab Content - Calendar View */}
        {activeTab === 'schedule' && !loading && (
          <div className="figma-calendar-view">
            {schedule.length > 0 ? (() => {
              // Group matches by date
              const matchesByDate = schedule.reduce((acc, match) => {
                const dateKey = new Date(match.matchDate).toDateString();
                if (!acc[dateKey]) {
                  acc[dateKey] = [];
                }
                acc[dateKey].push(match);
                return acc;
              }, {});

              // Sort dates
              const sortedDates = Object.keys(matchesByDate).sort((a, b) => 
                new Date(a) - new Date(b)
              );

              return sortedDates.map((dateKey, dateIndex) => {
                const matchDate = new Date(dateKey);
                const matches = matchesByDate[dateKey];
                const isToday = dateKey === new Date().toDateString();
                const isTomorrow = dateKey === new Date(Date.now() + 86400000).toDateString();

                return (
                  <div key={dateKey} className="figma-calendar-day">
                    {/* Date Header */}
                    <div className={`figma-calendar-date-header ${isToday ? 'today' : ''} ${isTomorrow ? 'tomorrow' : ''}`}>
                      <div className="figma-calendar-date-main">
                        <span className="figma-calendar-day-number">
                          {matchDate.getDate()}
                        </span>
                        <div className="figma-calendar-date-info">
                          <span className="figma-calendar-day-name">
                            {matchDate.toLocaleDateString('en-US', { weekday: 'long' })}
                          </span>
                          <span className="figma-calendar-month-year">
                            {matchDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <span className="figma-calendar-match-count">
                        {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                      </span>
                      {isToday && <span className="figma-calendar-today-badge">Today</span>}
                      {isTomorrow && <span className="figma-calendar-tomorrow-badge">Tomorrow</span>}
                    </div>

                    {/* Matches for this date */}
                    <div className="figma-calendar-matches">
                      {matches.map((match, matchIndex) => (
                        <article key={match.matchId || matchIndex} className="figma-calendar-match-card">
                          <div className="figma-calendar-match-time">
                            <span className="figma-time-icon">🕐</span>
                            <span className="figma-time-text">{match.matchTime || 'TBD'}</span>
                          </div>
                          <div className="figma-calendar-match-info">
                            <div className="figma-calendar-match-series">
                              {match.seriesName}
                            </div>
                            <div className="figma-calendar-match-title">
                              {match.matchTitle}
                            </div>
                            <div className="figma-calendar-match-meta">
                              <span className="figma-badge figma-badge-blue">{match.matchFormat}</span>
                              <span className="figma-calendar-venue">
                                <span className="figma-venue-icon">📍</span>
                                {match.matchVenue}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              });
            })() : (
              <div className="figma-empty-state">
                <div className="figma-empty-icon">📅</div>
                <div className="figma-empty-text">
                  <h4>No Scheduled Matches</h4>
                  <p>Check back later for upcoming cricket matches</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <nav className="figma-bottom-nav" role="navigation" aria-label="Main navigation">
        <div className="figma-nav-items">
          <a href="/" className="figma-nav-item">
            <div className="figma-nav-icon">🏠</div>
            <div className="figma-nav-label">Home</div>
          </a>
          <a href="/news" className="figma-nav-item active" aria-current="page">
            <div className="figma-nav-icon">📰</div>
            <div className="figma-nav-label">News</div>
          </a>
          <a href="/match-management" className="figma-nav-item">
            <div className="figma-nav-icon">📊</div>
            <div className="figma-nav-label">Matches</div>
          </a>
          <a href="/player-management" className="figma-nav-item">
            <div className="figma-nav-icon">👤</div>
            <div className="figma-nav-label">Players</div>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default News;
