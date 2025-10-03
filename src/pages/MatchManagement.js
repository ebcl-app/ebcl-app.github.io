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
import matchService from '../services/matchService';
import teamService from '../services/teamService';
import '../styles/figma-cricket-theme.css';
import '../styles/match-management.css';

const MatchManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentMatch, completedMatches } = useSelector(state => state.match);
  const { teams: reduxTeams } = useSelector(state => state.club);
  
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch matches and teams from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [matchesResponse, teamsResponse] = await Promise.all([
          matchService.getAllMatches(),
          teamService.getAllTeams()
        ]);
        
        if (matchesResponse) {
          setMatches(matchesResponse);
        } else {
          setMatches([]);
        }
        
        if (teamsResponse.success && teamsResponse.data) {
          setTeams(teamsResponse.data);
        } else {
          setTeams([]);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setMatches([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
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

  // Calculate combined matches for both tabs using useMemo
  const upcomingDisplayMatches = useMemo(() => {
    if (!matches || matches.length === 0) {
      return [];
    }
    return matches.filter(match => match.status !== 'completed' && match.status !== 'abandoned');
  }, [matches]);

  const completedDisplayMatches = useMemo(() => {
    if (!matches || matches.length === 0) {
      return [];
    }
    return matches.filter(match => match.status === 'completed' || match.status === 'abandoned');
  }, [matches]);
  
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
    navigate(`/scoring/${matchId}`);
  };

  const handleAbandonMatch = (matchId) => {
    dispatch(endMatch({ matchId, status: 'abandoned' }));
    setShowAbandonConfirm(null);
  };

  const handleScoreMatch = (matchId) => {
    dispatch(setCurrentMatch(matchId));
    navigate(`/scoring/${matchId}`);
  };

  const formatDate = (dateString) => {
    try {
      let date;
      
      // Handle Firestore timestamp format
      if (dateString && typeof dateString === 'object' && dateString._seconds) {
        date = new Date(dateString._seconds * 1000);
      } else if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else {
        return 'Date TBD';
      }
      
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
    <div className={`figma-cricket-app app-theme ${isDarkMode ? 'dark' : 'light'}`} role="main">
      
      {/* Header */}
      <header className="figma-header">
        <div className="figma-header-left">
          <Link to="/" className="figma-back-button" aria-label="Go back to home">
            <span className="figma-back-icon">‹</span>
          </Link>
          <div className="figma-logo-container">
            <span className="figma-logo-icon" role="img" aria-label="Matches">⚡</span>
            <h1 className="figma-title">Match Management</h1>
          </div>
        </div>
        <div className="figma-header-right">
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

      {/* Main Content */}
      <div className="figma-main-layout">

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
                              <div className="jersey jersey-white">T</div>
                              <div className="jersey jersey-white">E</div>
                              <div className="jersey jersey-white">A</div>
                            </div>
                            <div className="team-name-short">
                              {match.team1.shortName || match.team1.name.toUpperCase()}
                            </div>
                            {match.status === 'completed' ? (
                              <>
                                <div className="team-score">
                                  {match.winner === match.team1.id ? 'Won' : 'Lost'}
                                </div>
                                <div className="team-overs">({match.result})</div>
                              </>
                            ) : match.team1.score ? (
                              <>
                                <div className="team-score">{match.team1.score}</div>
                                <div className="team-overs">({match.team1.overs} ov)</div>
                              </>
                            ) : (
                              <>
                                <div className="team-score">Ready</div>
                                <div className="team-overs">({match.lineups[match.team1Id]?.playersDetails?.length || 11} players)</div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* VS Divider */}
                        <div className="vs-divider">
                          <span className="vs-badge">VS</span>
                        </div>

                        {/* Team 2 */}
                        <div className="team-score-section">
                          <div className="team-info">
                            <div className="team-jerseys">
                              <div className="jersey jersey-black">T</div>
                              <div className="jersey jersey-black">E</div>
                              <div className="jersey jersey-black">A</div>
                            </div>
                            <div className="team-name-short">
                              {match.team2.shortName || match.team2.name.toUpperCase()}
                            </div>
                            {match.status === 'completed' ? (
                              <>
                                <div className="team-score">
                                  {match.winner === match.team2.id ? 'Won' : 'Lost'}
                                </div>
                                <div className="team-overs">({match.result})</div>
                              </>
                            ) : match.team2.score ? (
                              <>
                                <div className="team-score">{match.team2.score}</div>
                                <div className="team-overs">({match.team2.overs} ov)</div>
                              </>
                            ) : (
                              <>
                                <div className="team-score">Ready</div>
                                <div className="team-overs">({match.lineups[match.team2Id]?.playersDetails?.length || 11} players)</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Match Result (for completed matches) */}
                      {match.result && (
                        <div className="match-result-section">
                          <div className="match-result-text">{match.result}</div>
                        </div>
                      )}

                      {/* Match Info */}
                      <div className="match-details-row">
                        <div className="match-detail-item">
                          📅 {formatDate(match.scheduledDate || match.completedDate)}
                        </div>
                        {match.venue && (
                          <div className="match-detail-item">
                            📍 {match.venue}
                          </div>
                        )}
                        <div className="match-detail-item">
                          🏏 {match.format || 'T20'} ({match.overs || 20} overs)
                        </div>
                      </div>

                      {/* Match Actions */}
                      <div className="match-actions">
                        {activeTab === 'upcoming' ? (
                          <>
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleStartMatch(match.id)}
                            >
                              ▶️ Start Match
                            </button>
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleScoreMatch(match.id)}
                            >
                              📊 Score
                            </button>
                            <Link 
                              to={`/match-setup/${match.id}`}
                              className="btn btn-secondary"
                            >
                              ✏️ Edit
                            </Link>
                            <button 
                              className="btn btn-danger"
                              onClick={() => setShowAbandonConfirm(match.id)}
                            >
                              🗑️ Abandon
                            </button>
                          </>
                        ) : (
                          <>
                            <Link 
                              to={`/match-details/${match.id}`}
                              className="btn btn-primary"
                            >
                              👁️ View Details
                            </Link>
                            <button 
                              className="btn btn-secondary"
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

      </div> {/* End of figma-main-layout */}

      {/* Bottom Navigation */}
      <nav className="figma-bottom-nav" role="navigation" aria-label="Main navigation">
        <div className="figma-nav-items">
          <Link to="/" className="figma-nav-item">
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
            className="figma-nav-item active"
            aria-current="page"
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
            <button 
              className="figma-fab-option"
              role="menuitem"
              onClick={() => {
                handleCreateMatch();
                setIsFabOpen(false);
              }}
            >
              <span className="figma-fab-option-icon">⚡</span>
              <span className="figma-fab-option-label">Create Match</span>
            </button>
            <Link 
              to="/team-management" 
              className="figma-fab-option"
              role="menuitem"
              onClick={() => setIsFabOpen(false)}
            >
              <span className="figma-fab-option-icon">👥</span>
              <span className="figma-fab-option-label">Manage Teams</span>
            </Link>
            <Link 
              to="/match-setup" 
              className="figma-fab-option"
              role="menuitem"
              onClick={() => setIsFabOpen(false)}
            >
              <span className="figma-fab-option-icon">⚙️</span>
              <span className="figma-fab-option-label">Match Setup</span>
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
    </div>
  );
};

export default MatchManagement;