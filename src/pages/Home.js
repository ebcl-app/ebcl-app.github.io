import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../styles/cricket.css';

const Home = () => {
  const { upcomingMatches } = useSelector(state => state.match);
  const { teams, playerPool, clubInfo } = useSelector(state => state.club);
  const [filterType, setFilterType] = useState('upcoming');

  const handleStatClick = (statType) => {
    // Make stats clickable and interactive
    console.log(`Navigating to ${statType} section`);
  };

  return (
    <div className="home-page-container">
      <div className="home-container">
        {/* Header */}
        <div className="home-header">
          <div className="header-left">
            <span className="brand-icon">🏏</span>
            <h1 className="app-title">Ecolife Box Cricket</h1>
          </div>
          <div className="header-right">
            <span className="user-id">User ID: a1b2c3d4e5f6</span>
          </div>
        </div>

        {/* Main Title Section */}
        <div className="main-title-section">
          <h2 className="main-title">🏏 Home Cricket</h2>
          <p className="main-subtitle">Manage your teams, register new players, and keep track of scores in real-time.</p>
        </div>

        {/* Club Stats Section */}
        <div className="club-stats-section">
          <div className="club-info-header">
            <h2 className="club-title">{clubInfo?.name || 'Cricket Club'}</h2>
            <p className="club-subtitle">Your club management overview</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card" onClick={() => handleStatClick('players')}>
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">{playerPool?.length || 0}</div>
                <div className="stat-label">Total Players</div>
              </div>
            </div>
            <div className="stat-card" onClick={() => handleStatClick('teams')}>
              <div className="stat-icon">🏏</div>
              <div className="stat-content">
                <div className="stat-number">{teams?.length || 0}</div>
                <div className="stat-label">Active Teams</div>
              </div>
            </div>
            <div className="stat-card" onClick={() => handleStatClick('available')}>
              <div className="stat-icon">✨</div>
              <div className="stat-content">
                <div className="stat-number">
                  {playerPool?.filter(player => 
                    !teams?.some(team => team.players?.includes(player.id))
                  ).length || 0}
                </div>
                <div className="stat-label">Available Players</div>
              </div>
            </div>
            <div className="stat-card" onClick={() => handleStatClick('matches')}>
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-number">{upcomingMatches?.length || 0}</div>
                <div className="stat-label">Upcoming Matches</div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="primary-actions">
          <Link to="/match-registration" className="primary-btn blue">
            ⚡ New Match
          </Link>
          <Link to="/player-registration" className="primary-btn green">
            👤 Register Player
          </Link>
          <Link to="/team-management" className="primary-btn green">
            👥 Manage Teams
          </Link>
        </div>

        {/* Secondary Action Buttons */}
        <div className="secondary-actions">
          <Link to="/match-setup" className="secondary-btn">
            📊 Match Setup
          </Link>
          <Link to="/waiting-list" className="secondary-btn">
            🏆 Waiting List
          </Link>
        </div>

        {/* Central Illustration - Ready for Cricket Action */}
        <div className="cricket-hero-section">
          <div className="cricket-hero-content">
            <div className="cricket-stadium-illustration">
              <svg viewBox="0 0 400 200" className="stadium-svg">
                {/* Cricket Ground */}
                <ellipse cx="200" cy="150" rx="180" ry="40" fill="#4CAF50" opacity="0.3"/>
                <ellipse cx="200" cy="150" rx="160" ry="35" fill="#4CAF50" opacity="0.4"/>
                <ellipse cx="200" cy="150" rx="140" ry="30" fill="#4CAF50" opacity="0.5"/>
                
                {/* Pitch */}
                <rect x="180" y="130" width="40" height="40" fill="#8BC34A" opacity="0.7" rx="2"/>
                
                {/* Wickets */}
                <rect x="185" y="135" width="2" height="8" fill="#795548"/>
                <rect x="188" y="135" width="2" height="8" fill="#795548"/>
                <rect x="191" y="135" width="2" height="8" fill="#795548"/>
                <rect x="185" y="157" width="2" height="8" fill="#795548"/>
                <rect x="188" y="157" width="2" height="8" fill="#795548"/>
                <rect x="191" y="157" width="2" height="8" fill="#795548"/>
                
                {/* Cricket Ball */}
                <circle cx="200" cy="150" r="3" fill="#DC2626"/>
                
                {/* Stadium Background */}
                <path d="M50 100 Q200 50 350 100 L350 180 Q200 200 50 180 Z" fill="#E3F2FD" opacity="0.6"/>
                
                {/* Crowd */}
                <rect x="60" y="90" width="280" height="20" fill="#90CAF9" opacity="0.4" rx="10"/>
                <rect x="70" y="75" width="260" height="15" fill="#64B5F6" opacity="0.4" rx="8"/>
                
                {/* Floodlights */}
                <circle cx="100" cy="60" r="8" fill="#FFC107" opacity="0.7"/>
                <rect x="98" y="60" width="4" height="30" fill="#666"/>
                <circle cx="300" cy="60" r="8" fill="#FFC107" opacity="0.7"/>
                <rect x="298" y="60" width="4" height="30" fill="#666"/>
              </svg>
            </div>
            <h3 className="hero-title">Ready for Cricket Action!</h3>
            <p className="hero-subtitle">Create matches, manage teams, and score live games</p>
          </div>
        </div>

        {/* Upcoming Matches Section */}
        {upcomingMatches.length > 0 && (
          <div className="upcoming-matches-section">
            <div className="section-header">
              <h3 className="section-title">📅 Upcoming Matches</h3>
            </div>

            <div className="matches-list">
              {upcomingMatches.map(match => (
                <div key={match.id} className="match-card">
                  <div className="match-teams">
                    <div className="team-info">
                      <span className="team-name">{match.team1.name} (Black Jersey)</span>
                      <span className="vs-text">vs</span>
                      <span className="team-name">{match.team2.name} (White Jersey)</span>
                    </div>
                  </div>
                  
                  <div className="match-details">
                    <div className="match-detail">
                      <span className="detail-icon">📅</span>
                      <span className="detail-text">{match.date}</span>
                    </div>
                    <div className="match-detail">
                      <span className="detail-icon">⏰</span>
                      <span className="detail-text">{match.time}</span>
                    </div>
                    <div className="match-detail">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{match.venue}</span>
                    </div>
                  </div>
                  
                  <div className="match-actions">
                    <Link 
                      to={`/scoring?matchId=${match.id}`} 
                      className="start-scoring-btn"
                    >
                      🏏 Start Scoring
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;