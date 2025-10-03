import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import teamService from '../services/teamService';
import matchService from '../services/matchService';
import liveScoresService from '../services/liveScoresService';
import '../styles/figma-cricket-theme.css'; // Global Figma Cricket Pro Theme
import '../styles/home-improved.css'; // Page-specific styles

const HomeImproved = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [matchesView, setMatchesView] = useState('upcoming'); // Toggle between 'upcoming' and 'completed'
  const [newsScoresView, setNewsScoresView] = useState('news'); // Toggle between 'news' and 'scores'

  // API data state
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [liveScores, setLiveScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from APIs on component mount
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [teamsResponse, matchesResponse, liveScoresResponse] = await Promise.all([
          teamService.getAllTeams().catch(() => ({ success: false, data: [] })),
          matchService.getAllMatches().catch(() => []),
          liveScoresService.fetchLiveScores().catch(() => ({ success: false, data: [] }))
        ]);

        if (teamsResponse.success && teamsResponse.data) {
          setTeams(teamsResponse.data);
        }

        if (Array.isArray(matchesResponse)) {
          setMatches(matchesResponse);
        }

        if (liveScoresResponse.success && liveScoresResponse.data) {
          setLiveScores(liveScoresResponse.data);
        }

      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Filter matches based on view
  const displayMatches = matchesView === 'upcoming'
    ? matches.filter(match => match.status !== 'completed' && match.status !== 'abandoned')
    : matches.filter(match => match.status === 'completed' || match.status === 'abandoned');

  // Define upcoming matches for the upcoming matches section
  const upcomingMatches = matches.filter(match => match.status !== 'completed' && match.status !== 'abandoned');

  // Use API data instead of hardcoded data
  const recentMatches = displayMatches.slice(0, 5); // Show latest 5 matches

  const handlePrevMatch = () => {
    setCurrentMatchIndex(prev => prev === 0 ? recentMatches.length - 1 : prev - 1);
  };

  const handleNextMatch = () => {
    setCurrentMatchIndex(prev => prev === recentMatches.length - 1 ? 0 : prev + 1);
  };

  // Show toast notifications
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Close FAB on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsFabOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const currentMatch = recentMatches[currentMatchIndex];

  return (
    <div className={`figma-cricket-app app-theme ${isDarkMode ? 'dark' : 'light'}`} role="main">
      
      {/* Header */}
      <header className="figma-header">
        <div className="figma-header-left">
          <div className="figma-logo-container">
            <span className="figma-logo-icon" role="img" aria-label="Cricket">🏏</span>
            <h1 className="figma-title">Box Cricket Club</h1>
          </div>
        </div>
        <div className="figma-header-right">
          <span className="figma-live-badge" aria-live="polite">● LIVE</span>
          <button 
            className="figma-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDarkMode}
          >
            <div className="figma-toggle-icon">
              {isDarkMode ? '☀️' : '🌙'}
            </div>
          </button>
        </div>
      </header>

      {/* Cricket Ground Hero Section */}
      <section className="cricket-ground-hero" aria-label="Cricket ground welcome">
        <div className="hero-overlay">
          <div className="hero-content">
            <h2 className="hero-title">Welcome to Box Cricket Club</h2>
            <p className="hero-subtitle">Experience the thrill of cricket in the heart of the city</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">{matches.length}</span>
                <span className="hero-stat-label">Active Matches</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{teams.length}</span>
                <span className="hero-stat-label">Teams</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{liveScores.length}</span>
                <span className="hero-stat-label">Live Scores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="figma-loading-state">
          <div className="figma-loading-spinner">⏳</div>
          <p>Loading cricket data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="figma-error-state">
          <span className="figma-error-icon">⚠️</span>
          <p>{error}</p>
          <button 
            className="figma-btn figma-btn-orange" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      {!loading && !error && (
        <div className="figma-main-layout">

        {/* 1. Quick Actions - First Section */}
        <section className="figma-quick-actions" aria-labelledby="quick-actions-heading">
          <div className="figma-card-header">
            <span className="figma-card-icon" role="img" aria-label="Quick Actions">⚡</span>
            <h3 id="quick-actions-heading" className="figma-card-title">Quick Actions</h3>
          </div>
          <div className="figma-action-grid" role="group" aria-label="Quick action buttons">
            <Link 
              to="/start-match" 
              className="figma-action-button"
              aria-label="Start a new match and begin scoring"
            >
              <div className="figma-action-icon" role="img" aria-hidden="true">🏁</div>
              <div className="figma-action-text">
                <div className="figma-action-label">Start Match</div>
                <div className="figma-action-desc">Begin scoring</div>
              </div>
            </Link>
            <Link 
              to="/match-registration" 
              className="figma-action-button"
              aria-label="Register a new match for upcoming games"
            >
              <div className="figma-action-icon" role="img" aria-hidden="true">➕</div>
              <div className="figma-action-text">
                <div className="figma-action-label">New Match</div>
                <div className="figma-action-desc">Register match</div>
              </div>
            </Link>
            <Link 
              to="/player-registration" 
              className="figma-action-button"
              aria-label="Register a new player to the club"
            >
              <div className="figma-action-icon" role="img" aria-hidden="true">👤</div>
              <div className="figma-action-text">
                <div className="figma-action-label">Add Player</div>
                <div className="figma-action-desc">Register player</div>
              </div>
            </Link>
            <Link 
              to="/dashboard" 
              className="figma-action-button"
              aria-label="View match statistics and analytics"
            >
              <div className="figma-action-icon" role="img" aria-hidden="true">📊</div>
              <div className="figma-action-text">
                <div className="figma-action-label">View Stats</div>
                <div className="figma-action-desc">Match analytics</div>
              </div>
            </Link>
          </div>
        </section>

        {/* 2. Welcome Stats Card */}
        <section className="figma-profile-stats-card" aria-labelledby="profile-stats-heading">
          <div className="figma-card-header">
            <span className="figma-card-icon" role="img" aria-label="Profile Stats">👤</span>
            <h3 id="profile-stats-heading" className="figma-card-title">Your Cricket Profile</h3>
          </div>
          <div className="figma-profile-content">
            <div className="figma-welcome-text">
              <h4 className="figma-welcome-title">Welcome Back!</h4>
              <p className="figma-welcome-subtitle">Ready for another exciting match?</p>
            </div>
            <div className="figma-stats-grid">
              <div className="figma-stat-item">
                <div className="figma-stat-value">{matches.length}</div>
                <div className="figma-stat-label">Matches</div>
              </div>
              <div className="figma-stat-item">
                <div className="figma-stat-value">{matches.filter(m => m.status === 'completed').length}</div>
                <div className="figma-stat-label">Completed</div>
              </div>
              <div className="figma-stat-item">
                <div className="figma-stat-value">{teams.length}</div>
                <div className="figma-stat-label">Teams</div>
              </div>
              <div className="figma-stat-item">
                <div className="figma-stat-value">{liveScores.length}</div>
                <div className="figma-stat-label">Live Matches</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Recent Matches - Standardized Card */}
        <section className="figma-recent-matches" aria-labelledby="recent-matches-heading">
          <div className="figma-card-header">
            <div className="figma-card-header-left">
              <span className="figma-card-icon" role="img" aria-label="Recent Matches">🏏</span>
              <h3 id="recent-matches-heading" className="figma-card-title">Recent Matches</h3>
            </div>
            <div className="figma-card-navigation" role="group" aria-label="Match navigation">
              <button 
                onClick={handlePrevMatch}
                className="figma-nav-arrow-btn"
                aria-label="Previous match"
                type="button"
              >
                ‹
              </button>
              <span className="figma-nav-indicator" aria-live="polite">
                {currentMatchIndex + 1} / {recentMatches.length}
              </span>
              <button 
                onClick={handleNextMatch}
                className="figma-nav-arrow-btn"
                aria-label="Next match"
                type="button"
              >
                ›
              </button>
            </div>
          </div>
          
          <div className="figma-match-content">
            <div className="figma-match-status-row">
              <span className="figma-status-badge completed">Completed</span>
            </div>
            
            <div className="figma-match-teams">
              <div className="figma-team-score">
                <div className="figma-team-name">{currentMatch.team1.name}</div>
                <div className="figma-score-display">
                  <span className="figma-score">{currentMatch.team1.score}</span>
                  <span className="figma-overs">({currentMatch.team1.overs} overs)</span>
                </div>
              </div>
              
              <div className="figma-vs-divider">VS</div>
              
              <div className="figma-team-score">
                <div className="figma-team-name">{currentMatch.team2.name}</div>
                <div className="figma-score-display">
                  <span className="figma-score">{currentMatch.team2.score}</span>
                  <span className="figma-overs">({currentMatch.team2.overs} overs)</span>
                </div>
              </div>
            </div>
            
            <div className="figma-match-result">
              <span className="figma-result-text">{currentMatch.result}</span>
            </div>
          </div>
        </section>

      {/* 4. Upcoming Matches - Standardized Card */}
      <section className="figma-upcoming-matches" aria-labelledby="upcoming-matches-heading">
        <div className="figma-card-header">
          <span className="figma-card-icon" role="img" aria-label="Upcoming Matches">📅</span>
          <h3 id="upcoming-matches-heading" className="figma-card-title">Upcoming Matches</h3>
        </div>
        {upcomingMatches && upcomingMatches.length > 0 ? (
          <div className="figma-upcoming-list">
            {upcomingMatches.slice(0, 3).map((match, index) => (
              <div key={match.id || index} className="figma-upcoming-item">
                <div className="figma-upcoming-date">
                  <div className="figma-date-day">15</div>
                  <div className="figma-date-month">JAN</div>
                </div>
                <div className="figma-upcoming-details">
                  <div className="figma-upcoming-title">Box Cricket Championship</div>
                  <div className="figma-upcoming-info">
                    <span className="figma-upcoming-time">3:00 PM</span>
                    <span className="figma-upcoming-venue">Main Ground</span>
                  </div>
                </div>
                <div className="figma-upcoming-action">
                  <Link to={`/match-setup/${match.id || 'new'}`} className="figma-setup-button">
                    Setup
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="figma-empty-state">
            <div className="figma-empty-icon">📅</div>
            <div className="figma-empty-text">
              <h4>No upcoming matches</h4>
              <p>Schedule a new match to get started</p>
            </div>
            <Link to="/match-registration" className="figma-empty-action">
              Schedule Match
            </Link>
          </div>
        )}
      </section>

      {/* 5. Player Pool - Standardized Card */}
      <section className="figma-player-pool" aria-labelledby="player-pool-heading">
        <div className="figma-card-header">
          <span className="figma-card-icon" role="img" aria-label="Player Pool">👥</span>
          <h3 id="player-pool-heading" className="figma-card-title">Player Pool</h3>
        </div>
        <div className="figma-stats-grid">
          <div className="figma-stat-item">
            <div className="figma-stat-value">{teams?.length || 24}</div>
            <div className="figma-stat-label">Total</div>
          </div>
          <div className="figma-stat-item">
            <div className="figma-stat-value">16</div>
            <div className="figma-stat-label">Available</div>
          </div>
          <div className="figma-stat-item">
            <div className="figma-stat-value">8</div>
            <div className="figma-stat-label">Active</div>
          </div>
          <div className="figma-stat-item">
            <div className="figma-stat-value">0</div>
            <div className="figma-stat-label">Waiting</div>
          </div>
        </div>
        <div className="figma-card-actions">
          <Link to="/player-management" className="figma-action-link">
            <span className="figma-action-link-icon">⚙️</span>
            <span className="figma-action-link-text">Manage Players</span>
          </Link>
          <Link to="/waiting-list" className="figma-action-link">
            <span className="figma-action-link-icon">📋</span>
            <span className="figma-action-link-text">Waiting List</span>
          </Link>
        </div>
      </section>

        </div>
      )}

      {/* Bottom Navigation - Original working 3-item version */}
      <nav className="figma-bottom-nav" role="navigation" aria-label="Main navigation">
        <div className="figma-nav-items">
          <Link to="/" className="figma-nav-item active" aria-current="page">
            <div className="figma-nav-icon" role="img" aria-hidden="true">🏠</div>
            <div className="figma-nav-label">Home</div>
          </Link>
          <Link 
            to="/news" 
            className="figma-nav-item"
            aria-label="View cricket news and live scores"
          >
            <div className="figma-nav-icon" role="img" aria-hidden="true">📰</div>
            <div className="figma-nav-label">News</div>
          </Link>
          <Link 
            to="/match-management" 
            className="figma-nav-item"
            aria-label="View and manage cricket matches"
          >
            <div className="figma-nav-icon" role="img" aria-hidden="true">📊</div>
            <div className="figma-nav-label">Matches</div>
          </Link>
          <Link 
            to="/player-management" 
            className="figma-nav-item"
            aria-label="View and manage cricket players"
          >
            <div className="figma-nav-icon" role="img" aria-hidden="true">👤</div>
            <div className="figma-nav-label">Players</div>
          </Link>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className={`figma-fab-container ${isFabOpen ? 'open' : ''}`}>
        <button 
          className="figma-fab-main"
          onClick={() => setIsFabOpen(!isFabOpen)}
          aria-expanded={isFabOpen}
          aria-label="Quick actions menu"
        >
          <span className="figma-fab-icon">
            {isFabOpen ? '✕' : '⚡'}
          </span>
        </button>
        
        {isFabOpen && (
          <div className="figma-fab-menu" role="menu">
            <Link 
              to="/start-match" 
              className="figma-fab-option"
              role="menuitem"
              onClick={() => setIsFabOpen(false)}
            >
              <span className="figma-fab-option-icon">🏁</span>
              <span className="figma-fab-option-label">Start Match</span>
            </Link>
            <Link 
              to="/match-registration" 
              className="figma-fab-option"
              role="menuitem"
              onClick={() => setIsFabOpen(false)}
            >
              <span className="figma-fab-option-icon">➕</span>
              <span className="figma-fab-option-label">New Match</span>
            </Link>
            <Link 
              to="/player-registration" 
              className="figma-fab-option"
              role="menuitem"
              onClick={() => setIsFabOpen(false)}
            >
              <span className="figma-fab-option-icon">👤</span>
              <span className="figma-fab-option-label">Add Player</span>
            </Link>
          </div>
        )}
      </div>
      
      {/* Click overlay to close FAB */}
      {isFabOpen && (
        <div 
          className="figma-fab-overlay" 
          onClick={() => setIsFabOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div 
          className="figma-toast" 
          role="alert" 
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default HomeImproved;