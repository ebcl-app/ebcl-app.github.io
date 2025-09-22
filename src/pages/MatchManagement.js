import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  createNewMatch, 
  updateMatchDetails, 
  endMatch,
  setCurrentMatch,
  startMatch 
} from '../store/slices/matchSlice';
import '../styles/common.css';
import '../styles/match-management.css';

const MatchManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { upcomingMatches, currentMatch, completedMatches } = useSelector(state => state.match);
  const { teams } = useSelector(state => state.club);
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(null);
  const [isFabOpen, setIsFabOpen] = useState(false);

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

  const handleTabChange = (newTab) => {
    console.log(`Switching from ${activeTab} to ${newTab}`);
    setActiveTab(newTab);
  };

  // Sample data for demonstration
  const sampleUpcomingMatches = [
    {
      id: 1,
      team1: { name: 'Team Soumyak (Black Jersey)', shortName: 'TSB', players: 11 },
      team2: { name: 'Team Sonal (White Jersey)', shortName: 'TSW', players: 11 },
      status: 'upcoming',
      scheduledDate: '2025-09-22T14:00:00Z',
      venue: 'Ground A',
      format: 'T20',
      overs: 20
    },
    {
      id: 2,
      team1: { name: 'Team Alpha', shortName: 'TA', players: 11 },
      team2: { name: 'Team Beta', shortName: 'TB', players: 11 },
      status: 'upcoming',
      scheduledDate: '2025-09-23T16:00:00Z',
      venue: 'Ground B',
      format: 'T10',
      overs: 10
    }
  ];

  const sampleCompletedMatches = [
    {
      id: 3,
      team1: { name: 'Team Soumyak', score: '145/5', overs: '19.3' },
      team2: { name: 'Team Sonal', score: '132/3', overs: '18.5' },
      status: 'completed',
      result: 'Team Soumyak won by 13 runs',
      completedDate: '2025-09-20T18:30:00',
      venue: 'Ground A'
    },
    {
      id: 4,
      team1: { name: 'Team Alpha', score: '156/6', overs: '20.0' },
      team2: { name: 'Team Beta', score: '144/8', overs: '20.0' },
      status: 'completed',
      result: 'Team Alpha won by 12 runs',
      completedDate: '2025-09-19T17:15:00',
      venue: 'Ground B'
    }
  ];

  // Debug Redux data
  console.log('Redux upcomingMatches:', upcomingMatches);
  console.log('Redux completedMatches:', completedMatches);
  console.log('Sample upcoming:', sampleUpcomingMatches);
  console.log('Sample completed:', sampleCompletedMatches);

  // Calculate combined matches for both tabs using useMemo
  const upcomingDisplayMatches = useMemo(() => {
    // For testing, use only sample data to isolate the issue
    return sampleUpcomingMatches;
    // return [...(upcomingMatches || []), ...sampleUpcomingMatches];
  }, []);

  const completedDisplayMatches = useMemo(() => {
    // For testing, use only sample data to isolate the issue  
    return sampleCompletedMatches;
    // return [...(completedMatches || []), ...sampleCompletedMatches];
  }, []);
  
  const displayMatches = useMemo(() => {
    console.log('Recalculating displayMatches for tab:', activeTab);
    const result = activeTab === 'upcoming' 
      ? upcomingDisplayMatches
      : completedDisplayMatches;
    console.log('Returning matches for', activeTab, ':', result);
    return result;
  }, [activeTab, upcomingDisplayMatches, completedDisplayMatches]);

  // Debug logging
  console.log('Active Tab:', activeTab);
  console.log('Upcoming Count:', upcomingDisplayMatches.length);
  console.log('Completed Count:', completedDisplayMatches.length);
  console.log('Display Matches Count:', displayMatches.length);
  console.log('Display Matches:', displayMatches.map(m => ({ id: m.id, status: m.status })));

  const handleCreateMatch = () => {
    navigate('/match-setup');
  };

  const handleStartMatch = (matchId) => {
    dispatch(setCurrentMatch(matchId));
    dispatch(startMatch(matchId));
    navigate('/scoring');
  };

  const handleAbandonMatch = (matchId) => {
    dispatch(endMatch({ matchId, status: 'abandoned' }));
    setShowAbandonConfirm(null);
  };

  const handleScoreMatch = (matchId) => {
    dispatch(setCurrentMatch(matchId));
    navigate('/scoring');
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date TBD';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Date TBD';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="app-title-section">
            <div className="app-logo">
              <span className="logo-icon">📊</span>
            </div>
            <div className="title-content">
              <h1 className="dashboard-title">Match Management</h1>
              <div className="title-subtitle">Organize and track cricket matches</div>
            </div>
          </div>
          <div className="theme-toggle-section">
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        <div className="match-management-container">
          {/* Floating Action Button */}
          <div className={`fab-container ${isFabOpen ? 'fab-open' : ''}`}>
            {/* Overlay to close FAB when clicking outside */}
            {isFabOpen && (
              <div 
                className="fab-overlay" 
                onClick={() => setIsFabOpen(false)}
              />
            )}
            
            {/* FAB Menu Items */}
            <div className="fab-menu">
              <Link 
                to="/" 
                className="fab-menu-item fab-item-1"
                onClick={() => setIsFabOpen(false)}
              >
                <div className="fab-item-icon">🏠</div>
                <span className="fab-item-label">Home Dashboard</span>
              </Link>
              
              <button 
                className="fab-menu-item fab-item-2"
                onClick={() => {
                  handleCreateMatch();
                  setIsFabOpen(false);
                }}
              >
                <div className="fab-item-icon">⚡</div>
                <span className="fab-item-label">Create Match</span>
              </button>
              
              <Link 
                to="/team-management" 
                className="fab-menu-item fab-item-3"
                onClick={() => setIsFabOpen(false)}
              >
                <div className="fab-item-icon">👥</div>
                <span className="fab-item-label">Manage Teams</span>
              </Link>
              
              <Link 
                to="/player-management" 
                className="fab-menu-item fab-item-4"
                onClick={() => setIsFabOpen(false)}
              >
                <div className="fab-item-icon">👤</div>
                <span className="fab-item-label">Manage Players</span>
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

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => handleTabChange('upcoming')}
            >
              📅 Upcoming ({upcomingDisplayMatches.length})
            </button>
            <button 
              className={`filter-tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => handleTabChange('completed')}
            >
              ✅ Completed ({completedDisplayMatches.length})
            </button>
          </div>

          {/* Matches Section - Using Home Page Recent Matches Pattern */}
          <div className="matches-section">
            {/* Section Header - Like Home Page */}
            <div className="section-header">
              <h2 className="section-title">
                {activeTab === 'upcoming' ? 'UPCOMING MATCHES' : 'COMPLETED MATCHES'}
              </h2>
              <div className="section-controls">
                <div className="match-counter">
                  {displayMatches.length} matches
                </div>
              </div>
            </div>
            
            <div className="matches-list" key={activeTab}>
              {displayMatches.length === 0 ? (
                <div className="matches-empty">
                  <div className="matches-empty-icon">
                    {activeTab === 'upcoming' ? '📅' : '🏆'}
                  </div>
                  <h4 className="matches-empty-title">
                    {activeTab === 'upcoming' ? 'No Upcoming Matches' : 'No Completed Matches'}
                  </h4>
                  <p className="matches-empty-description">
                    {activeTab === 'upcoming' 
                      ? 'Create your first match to get started with cricket scoring.'
                      : 'Complete some matches to see them listed here.'
                    }
                  </p>
                  {activeTab === 'upcoming' && (
                    <button className="btn btn-primary" onClick={handleCreateMatch}>
                      ⚡ Create First Match
                    </button>
                  )}
                </div>
              ) : (
                <div className="match-card-container">
                  {/* Show all matches with Home Page styling */}
                  {displayMatches.map((match) => (
                    <div key={match.id} className="match-card">
                      <div className="match-header">
                        <span className="match-status-badge">
                          {match.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="teams-scores-container">
                        {/* Team 1 */}
                        <div className="team-score-section">
                          <div className="team-info">
                            <div className="team-jerseys">
                              {match.team1.name.includes('Soumyak') || match.team1.name.includes('Black') ? (
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
                              {match.team1.name.includes('Soumyak') || match.team1.name.includes('Black') 
                                ? 'TEAM SOUMYAK' 
                                : match.team1.shortName || match.team1.name.toUpperCase()
                              }
                            </div>
                            {match.team1.score ? (
                              <>
                                <div className="team-score">{match.team1.score}</div>
                                <div className="team-overs">({match.team1.overs} ov)</div>
                              </>
                            ) : (
                              <>
                                <div className="team-score">Ready</div>
                                <div className="team-overs">({match.team1.players || 11} players)</div>
                              </>
                            )}
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
                              {match.team2.name.includes('Sonal') || match.team2.name.includes('White') ? (
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
                              {match.team2.name.includes('Sonal') || match.team2.name.includes('White')
                                ? 'TEAM SONAL'
                                : match.team2.shortName || match.team2.name.toUpperCase()
                              }
                            </div>
                            {match.team2.score ? (
                              <>
                                <div className="team-score">{match.team2.score}</div>
                                <div className="team-overs">({match.team2.overs} ov)</div>
                              </>
                            ) : (
                              <>
                                <div className="team-score">Ready</div>
                                <div className="team-overs">({match.team2.players || 11} players)</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Match Result (for completed matches) */}
                      {match.result && (
                        <div className="match-result">
                          {match.result}
                        </div>
                      )}

                      {/* Match Info */}
                      <div className="match-info">
                        <div className="match-date-venue">
                          {formatDate(match.scheduledDate || match.completedDate)}
                          {match.venue && ` • ${match.venue}`}
                          {` • ${match.format || 'T20'} (${match.overs || 20} overs)`}
                        </div>
                      </div>

                      {/* Match Actions */}
                      <div className="match-actions">
                        {activeTab === 'upcoming' ? (
                          <>
                            <button 
                              className="match-action-btn action-start"
                              onClick={() => handleStartMatch(match.id)}
                            >
                              ▶️ Start Match
                            </button>
                            <button 
                              className="match-action-btn action-score"
                              onClick={() => handleScoreMatch(match.id)}
                            >
                              📊 Score
                            </button>
                            <Link 
                              to={`/match-setup/${match.id}`}
                            className="match-action-btn action-edit"
                            >
                              ✏️ Edit
                            </Link>
                            <button 
                              className="match-action-btn action-abandon"
                              onClick={() => setShowAbandonConfirm(match.id)}
                            >
                              🗑️ Abandon
                            </button>
                          </>
                        ) : (
                          <>
                            <Link 
                              to={`/match-details/${match.id}`}
                              className="match-action-btn action-view"
                            >
                              👁️ View Details
                            </Link>
                            <button 
                              className="match-action-btn action-score"
                              onClick={() => handleScoreMatch(match.id)}
                            >
                              📊 Scorecard
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Abandon Confirmation Modal */}
        {showAbandonConfirm && (
          <div className="modal-overlay" onClick={() => setShowAbandonConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Abandon Match</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowAbandonConfirm(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to abandon this match? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAbandonConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleAbandonMatch(showAbandonConfirm)}
                >
                  Abandon Match
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchManagement;