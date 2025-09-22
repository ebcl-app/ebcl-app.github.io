import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import NewsTicker from '../components/NewsTicker';
import LiveScoreTicker from '../components/LiveScoreTicker';
import '../styles/common.css';
import '../styles/cricket.css';

const Home = () => {
  const { upcomingMatches } = useSelector(state => state.match);
  const { teams, playerPool, clubInfo } = useSelector(state => state.club);
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Sample matches data with team names from your app
  const recentMatches = [
    {
      id: 1,
      team1: { name: 'Team Soumyak (Black Jersey)', score: '145/5', overs: '19.3' },
      team2: { name: 'Team Sonal (White Jersey)', score: '132/3', overs: '18.5' },
      status: 'completed',
      result: 'Team Soumyak won by 13 runs'
    },
    {
      id: 2,
      team1: { name: 'Team Soumyak (Black Jersey)', score: '178/4', overs: '20.0' },
      team2: { name: 'Team Sonal (White Jersey)', score: '165/7', overs: '20.0' },
      status: 'completed',
      result: 'Team Soumyak won by 13 runs'
    },
    {
      id: 3,
      team1: { name: 'Team Sonal (White Jersey)', score: '156/6', overs: '20.0' },
      team2: { name: 'Team Soumyak (Black Jersey)', score: '144/8', overs: '20.0' },
      status: 'completed',
      result: 'Team Sonal won by 12 runs'
    }
  ];

  const handlePrevMatch = () => {
    setCurrentMatchIndex(prev => prev === 0 ? recentMatches.length - 1 : prev - 1);
  };

  const handleNextMatch = () => {
    setCurrentMatchIndex(prev => prev === recentMatches.length - 1 ? 0 : prev + 1);
  };

  // Close FAB on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFabOpen) {
        setIsFabOpen(false);
      }
    };

    if (isFabOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFabOpen]);

  const currentMatch = recentMatches[currentMatchIndex];

  return (
    <div className={`dashboard-container app-theme ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="dashboard-content">
        {/* Header with Theme Toggle and App Title */}
        <div className="dashboard-header">
          <div className="app-title-section">
            <div className="app-logo">
              <span className="logo-icon">🏏</span>
            </div>
            <div className="title-content">
              <h1 className="dashboard-title">Ecolife Box Cricket</h1>
              <div className="title-subtitle">Cricket Management System</div>
            </div>
          </div>
          <div className="theme-toggle-section">
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        {/* Live Scores Ticker Section */}
        <LiveScoreTicker />

        {/* News Ticker Section */}
        <NewsTicker />

        {/* Floating Action Button */}
        <div className={`fab-container ${isFabOpen ? 'fab-open' : ''}`}>
          {/* Overlay to close FAB when clicking outside */}
          {isFabOpen && (
            <div 
              className="fab-overlay" 
              onClick={() => setIsFabOpen(false)}
            />
          )}
          
          {/* Radial Menu Items */}
          <div className="fab-menu">
            <Link 
              to="/player-management" 
              className="fab-menu-item fab-item-1"
              onClick={() => setIsFabOpen(false)}
            >
              <div className="fab-item-icon">👤</div>
              <span className="fab-item-label">Manage Players</span>
            </Link>
            
            <Link 
              to="/match-management" 
              className="fab-menu-item fab-item-3"
              onClick={() => setIsFabOpen(false)}
            >
              <div className="fab-item-icon">🏏</div>
              <span className="fab-item-label">Manage Matches</span>
            </Link>
            
            <Link 
              to="/team-management" 
              className="fab-menu-item fab-item-4"
              onClick={() => setIsFabOpen(false)}
            >
              <div className="fab-item-icon">👥</div>
              <span className="fab-item-label">Manage Teams</span>
            </Link>
          </div>
          
          {/* Main FAB Button */}
          <button 
            className="fab-button"
            onClick={() => setIsFabOpen(!isFabOpen)}
            aria-label="Quick Actions"
          >
            <span className={`fab-icon ${isFabOpen ? 'fab-icon-close' : ''}`}>
              {isFabOpen ? '✕' : '⚙️'}
            </span>
          </button>
        </div>

        {/* Recent Matches Section */}
        <div className="recent-matches-section">
          <div className="section-header">
            <h2 className="section-title">RECENT MATCHES</h2>
            <div className="section-controls">
              <div className="match-counter">
                {currentMatchIndex + 1} / {recentMatches.length}
              </div>
              <div className="match-navigation-controls">
                <button className="match-nav-btn" onClick={handlePrevMatch} title="Previous match">
                  ‹
                </button>
                <button className="match-nav-btn" onClick={handleNextMatch} title="Next match">
                  ›
                </button>
              </div>
            </div>
          </div>
          
          <div className="match-card-container">
            <div className="match-card">
              <div className="match-header">
                <span className="match-status-badge">{currentMatch.status.toUpperCase()}</span>
              </div>

              <div className="teams-scores-container">
                {/* Team 1 */}
                <div className="team-score-section">
                  <div className="team-info">
                    <div className="team-jerseys">
                      {currentMatch.team1.name.includes('Soumyak') ? (
                        <>
                          <div className="jersey jersey-black">S</div>
                          <div className="jersey jersey-black">O</div>
                          <div className="jersey jersey-black">U</div>
                        </>
                      ) : (
                        <>
                          <div className="jersey jersey-white">S</div>
                          <div className="jersey jersey-white">O</div>
                          <div className="jersey jersey-white">N</div>
                        </>
                      )}
                    </div>
                    <div className="team-name-short">
                      {currentMatch.team1.name.includes('Soumyak') ? 'TEAM SOUMYAK' : 'TEAM SONAL'}
                    </div>
                    <div className="team-score">{currentMatch.team1.score}</div>
                    <div className="team-overs">({currentMatch.team1.overs} ov)</div>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="vs-divider-match">
                  <span className="vs-text">VS</span>
                </div>

                {/* Team 2 */}
                <div className="team-score-section">
                  <div className="team-info">
                    <div className="team-jerseys">
                      {currentMatch.team2.name.includes('Sonal') ? (
                        <>
                          <div className="jersey jersey-white">S</div>
                          <div className="jersey jersey-white">O</div>
                          <div className="jersey jersey-white">N</div>
                        </>
                      ) : (
                        <>
                          <div className="jersey jersey-black">S</div>
                          <div className="jersey jersey-black">O</div>
                          <div className="jersey jersey-black">U</div>
                        </>
                      )}
                    </div>
                    <div className="team-name-short">
                      {currentMatch.team2.name.includes('Sonal') ? 'TEAM SONAL' : 'TEAM SOUMYAK'}
                    </div>
                    <div className="team-score">{currentMatch.team2.score}</div>
                    <div className="team-overs">({currentMatch.team2.overs} ov)</div>
                  </div>
                </div>
              </div>

              {/* Match Result */}
              <div className="match-result">
                {currentMatch.result}
              </div>
            </div>
          </div>

          {/* Match Indicators */}
          <div className="match-indicators">
            {recentMatches.map((_, index) => (
              <button
                key={index}
                className={`match-dot ${index === currentMatchIndex ? 'active' : ''}`}
                onClick={() => setCurrentMatchIndex(index)}
                title={`Go to match ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-items">
            <Link to="/" className="nav-item active">
              <div className="nav-icon">🏠</div>
              <div className="nav-label">Home</div>
            </Link>
            <Link to="/scoring" className="nav-item">
              <div className="nav-icon">$</div>
              <div className="nav-label">Scoring</div>
            </Link>
            <Link to="/match-management" className="nav-item">
              <div className="nav-icon">📊</div>
              <div className="nav-label">Stats</div>
            </Link>
            <Link to="/player-management" className="nav-item">
              <div className="nav-icon">📋</div>
              <div className="nav-label">Teams</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;