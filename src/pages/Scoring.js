import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  addRuns,
  setBatsmen,
  setBowler,
  changeBatsman,
  swapBatsmen
} from '../store/slices/scoringSlice';

const Scoring = () => {
  const dispatch = useDispatch();
  const { currentMatch } = useSelector(state => state.match);
  const { score, currentBatsmen, currentBowler, playerStats } = useSelector(state => state.scoring);
  const { teams } = useSelector(state => state.team);

  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [changingBatsman, setChangingBatsman] = useState(null);

  // Get current teams
  const battingTeam = teams.find(team => team.id === currentMatch?.battingTeamId);
  const bowlingTeam = teams.find(team => team.id === currentMatch?.bowlingTeamId);

  // Get available players
  const availableBatsmen = battingTeam?.players?.filter(p => 
    p.role === 'Batsman' || p.role === 'All-Rounder'
  ) || [];

  const availableBowlers = bowlingTeam?.players?.filter(p => 
    p.role === 'Bowler' || p.role === 'All-Rounder'
  ) || [];

  const handleRunScored = (runs) => {
    // Use the addRuns action which handles score updates and player stats
    dispatch(addRuns({
      runs,
      isExtra: false,
      extraType: null
    }));

    // Rotate strike for odd runs
    if (runs % 2 === 1) {
      dispatch(swapBatsmen());
    }
  };

  const handleExtra = (type) => {
    switch (type) {
      case 'wd':
        dispatch(addRuns({
          runs: 1,
          isExtra: true,
          extraType: 'wide'
        }));
        break;
      case 'nb':
        dispatch(addRuns({
          runs: 1,
          isExtra: true,
          extraType: 'noBall'
        }));
        break;
      case 'w':
        // For wickets, we need to change the batsman
        setChangingBatsman('striker');
        setShowBatsmanModal(true);
        break;
      default:
        break;
    }
  };

  const handleBatsmanChange = (newBatsman) => {
    if (changingBatsman === 'striker') {
      dispatch(changeBatsman({
        position: 'striker',
        newBatsman: newBatsman
      }));
    } else {
      dispatch(changeBatsman({
        position: 'nonStriker',
        newBatsman: newBatsman
      }));
    }
    setShowBatsmanModal(false);
    setChangingBatsman(null);
  };

  const handleBowlerChange = (newBowler) => {
    dispatch(setBowler(newBowler));
    setShowBowlerModal(false);
  };

  if (!currentMatch || currentMatch.status !== 'live') {
    return (
      <div className="home-page-container modern-bg">
        <div className="dashboard-container full-screen modern-dashboard">
          <div className="dashboard-card home-card full-width modern-card">
            <div className="modern-header">
              <div className="modern-header-left">
                <span className="modern-cricket-icon">🏏</span>
                <span className="modern-title">Live Scoring</span>
              </div>
            </div>
            <div className="loading-state">
              <h2 className="modern-main-title">No Active Match</h2>
              <p className="modern-subtitle">Please select a match from the home page to start scoring.</p>
              <Link to="/" className="modern-btn modern-btn-primary">
                <span className="modern-btn-icon">🏠</span>
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page-container modern-bg">
      {/* Cricket Equipment Background */}
      <div className="cricket-background">
        <div className="cricket-bat cricket-bat-1">🏏</div>
        <div className="cricket-ball cricket-ball-1">🏏</div>
        <div className="cricket-bat cricket-bat-2">🏏</div>
        <div className="cricket-ball cricket-ball-2">⚾</div>
        <div className="cricket-wickets cricket-wickets-1">🏏</div>
        <div className="cricket-ball cricket-ball-3">🏏</div>
      </div>

      <div className="dashboard-container full-screen modern-dashboard">
        <div className="dashboard-card home-card full-width modern-card">
          {/* Back Button */}
          <div className="modern-back-button">
            <Link to="/" className="modern-btn-back">
              <span className="modern-btn-icon">←</span>
              Back to Home
            </Link>
          </div>

          {/* Enhanced Header Section */}
          <div className="modern-header">
            <div className="modern-header-left">
              <span className="modern-cricket-icon">🏏</span>
              <span className="modern-title">Live Scoring</span>
            </div>
            <div className="modern-header-right">
              <div className="match-status-badge live">
                <span className="status-icon">🔴</span>
                <span className="status-text">LIVE</span>
              </div>
            </div>
          </div>

          {/* Enhanced Match Header */}
          <div className="match-header-section">
            <div className="teams-display">
              <div className="team-info batting">
                <span className="team-jersey">🔵</span>
                <span className="team-name">{battingTeam?.name}</span>
                <span className="team-status">Batting</span>
              </div>
              <div className="vs-divider">
                <span className="vs-text">VS</span>
              </div>
              <div className="team-info bowling">
                <span className="team-jersey">🔴</span>
                <span className="team-name">{bowlingTeam?.name}</span>
                <span className="team-status">Bowling</span>
              </div>
            </div>
          </div>

          {/* Enhanced Live Score Display */}
          <div className="live-scoreboard">
            <div className="scoreboard-card">
              <div className="main-score">
                <div className="score-display">
                  <span className="runs">{score.runs}</span>
                  <span className="separator">/</span>
                  <span className="wickets">{score.wickets}</span>
                </div>
                <div className="overs-display">
                  <span className="overs-label">Overs:</span>
                  <span className="overs-value">{score.overs}.{score.balls}</span>
                  <span className="overs-total">/ 20.0</span>
                </div>
              </div>
              
              <div className="score-details">
                <div className="detail-item">
                  <span className="detail-label">Run Rate</span>
                  <span className="detail-value">
                    {score.overs > 0 ? (score.runs / (score.overs + score.balls/6)).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Required RR</span>
                  <span className="detail-value">-</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Balls Remaining</span>
                  <span className="detail-value">{120 - (score.overs * 6 + score.balls)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Current Players Section */}
          <div className="current-players-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">👥</span>
                Current Players
              </h3>
            </div>
            
            <div className="players-grid">
              {/* Batsmen Cards */}
              <div className="player-cards-row">
                <div className="enhanced-player-card striker">
                  <div className="player-header">
                    <div className="player-info">
                      <span className="player-name">{currentBatsmen.striker?.name || 'Not Set'}</span>
                      <span className="player-position striker-badge">
                        <span className="badge-icon">🏏</span>
                        <span className="badge-text">On Strike</span>
                      </span>
                    </div>
                    <button 
                      className="change-player-btn"
                      onClick={() => {
                        setChangingBatsman('striker');
                        setShowBatsmanModal(true);
                      }}
                      aria-label="Change striker batsman"
                    >
                      <span className="btn-icon">🔄</span>
                    </button>
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-value">{playerStats[currentBatsmen.striker?.id]?.runs || 0}</span>
                      <span className="stat-label">Runs</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{playerStats[currentBatsmen.striker?.id]?.balls || 0}</span>
                      <span className="stat-label">Balls</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {playerStats[currentBatsmen.striker?.id]?.balls > 0 
                          ? ((playerStats[currentBatsmen.striker?.id]?.runs || 0) / (playerStats[currentBatsmen.striker?.id]?.balls || 1) * 100).toFixed(1)
                          : '0.0'}
                      </span>
                      <span className="stat-label">S/R</span>
                    </div>
                  </div>
                </div>

                <div className="enhanced-player-card non-striker">
                  <div className="player-header">
                    <div className="player-info">
                      <span className="player-name">{currentBatsmen.nonStriker?.name || 'Not Set'}</span>
                      <span className="player-position non-striker-badge">
                        <span className="badge-icon">🚶</span>
                        <span className="badge-text">Non Striker</span>
                      </span>
                    </div>
                    <button 
                      className="change-player-btn"
                      onClick={() => {
                        setChangingBatsman('nonStriker');
                        setShowBatsmanModal(true);
                      }}
                      aria-label="Change non-striker batsman"
                    >
                      <span className="btn-icon">🔄</span>
                    </button>
                  </div>
                  <div className="player-stats">
                    <div className="stat-item">
                      <span className="stat-value">{playerStats[currentBatsmen.nonStriker?.id]?.runs || 0}</span>
                      <span className="stat-label">Runs</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{playerStats[currentBatsmen.nonStriker?.id]?.balls || 0}</span>
                      <span className="stat-label">Balls</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {playerStats[currentBatsmen.nonStriker?.id]?.balls > 0 
                          ? ((playerStats[currentBatsmen.nonStriker?.id]?.runs || 0) / (playerStats[currentBatsmen.nonStriker?.id]?.balls || 1) * 100).toFixed(1)
                          : '0.0'}
                      </span>
                      <span className="stat-label">S/R</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bowler Card */}
              <div className="enhanced-player-card bowler">
                <div className="player-header">
                  <div className="player-info">
                    <span className="player-name">{currentBowler?.name || 'Not Set'}</span>
                    <span className="player-position bowler-badge">
                      <span className="badge-icon">⚾</span>
                      <span className="badge-text">Bowling</span>
                    </span>
                  </div>
                  <button 
                    className="change-player-btn"
                    onClick={() => setShowBowlerModal(true)}
                    aria-label="Change bowler"
                  >
                    <span className="btn-icon">🔄</span>
                  </button>
                </div>
                <div className="player-stats">
                  <div className="stat-item">
                    <span className="stat-value">{score.overs}.{score.balls}</span>
                    <span className="stat-label">Overs</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Maidens</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{score.runs}</span>
                    <span className="stat-label">Runs</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{score.wickets}</span>
                    <span className="stat-label">Wickets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Scoring Controls */}
          <div className="scoring-controls-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">🎯</span>
                Scoring Controls
              </h3>
            </div>
            
            <div className="scoring-layout">
              {/* Runs Section */}
              <div className="runs-section">
                <div className="subsection-header">
                  <h4 className="subsection-title">
                    <span className="subsection-icon">🏃</span>
                    Runs Scored
                  </h4>
                </div>
                <div className="runs-grid">
                  {[0, 1, 2, 3, 4, 6].map(run => (
                    <button 
                      key={run} 
                      className={`scoring-btn run-btn ${
                        run === 0 ? 'dot-ball' : 
                        run >= 4 ? 'boundary' : 
                        'single'
                      }`}
                      onClick={() => handleRunScored(run)}
                      aria-label={`Score ${run} run${run !== 1 ? 's' : ''}`}
                    >
                      <span className="btn-value">{run}</span>
                      <span className="btn-label">
                        {run === 0 ? 'Dot' : 
                         run === 1 ? 'Single' :
                         run === 2 ? 'Double' :
                         run === 3 ? 'Triple' :
                         run === 4 ? 'Four' : 'Six'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Extras & Events Section */}
              <div className="extras-section">
                <div className="subsection-header">
                  <h4 className="subsection-title">
                    <span className="subsection-icon">⚠️</span>
                    Extras & Events
                  </h4>
                </div>
                <div className="extras-grid">
                  <button 
                    className="scoring-btn extra-btn wide"
                    onClick={() => handleExtra('wd')}
                    aria-label="Score a wide ball"
                  >
                    <span className="btn-icon">📏</span>
                    <span className="btn-text">Wide</span>
                    <span className="btn-desc">+1 Run</span>
                  </button>
                  <button 
                    className="scoring-btn extra-btn no-ball"
                    onClick={() => handleExtra('nb')}
                    aria-label="Score a no ball"
                  >
                    <span className="btn-icon">🚫</span>
                    <span className="btn-text">No Ball</span>
                    <span className="btn-desc">+1 Run</span>
                  </button>
                  <button 
                    className="scoring-btn extra-btn wicket"
                    onClick={() => handleExtra('w')}
                    aria-label="Record a wicket"
                  >
                    <span className="btn-icon">🏏</span>
                    <span className="btn-text">Wicket</span>
                    <span className="btn-desc">Out</span>
                  </button>
                  <button 
                    className="scoring-btn utility-btn swap"
                    onClick={() => dispatch(swapBatsmen())}
                    aria-label="Swap batsmen positions"
                  >
                    <span className="btn-icon">🔄</span>
                    <span className="btn-text">Swap</span>
                    <span className="btn-desc">Strike</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Match Summary */}
          <div className="match-summary-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">📊</span>
                Match Summary
              </h3>
            </div>
            
            <div className="summary-grid">
              <div className="summary-card innings">
                <div className="card-header">
                  <span className="card-icon">🏏</span>
                  <span className="card-title">Current Innings</span>
                </div>
                <div className="card-content">
                  <div className="stat-row">
                    <span className="stat-label">Team:</span>
                    <span className="stat-value">{battingTeam?.name}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Score:</span>
                    <span className="stat-value">{score.runs}/{score.wickets}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Overs:</span>
                    <span className="stat-value">{score.overs}.{score.balls} / 20.0</span>
                  </div>
                </div>
              </div>

              <div className="summary-card partnership">
                <div className="card-header">
                  <span className="card-icon">🤝</span>
                  <span className="card-title">Current Partnership</span>
                </div>
                <div className="card-content">
                  <div className="stat-row">
                    <span className="stat-label">Runs:</span>
                    <span className="stat-value">
                      {(playerStats[currentBatsmen.striker?.id]?.runs || 0) + (playerStats[currentBatsmen.nonStriker?.id]?.runs || 0)}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Balls:</span>
                    <span className="stat-value">
                      {(playerStats[currentBatsmen.striker?.id]?.balls || 0) + (playerStats[currentBatsmen.nonStriker?.id]?.balls || 0)}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Wicket:</span>
                    <span className="stat-value">{score.wickets + 1}th</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation & Actions */}
          <div className="match-actions-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">⚙️</span>
                Match Actions
              </h3>
            </div>
            
            <div className="actions-grid">
              <Link to="/batting-view" className="action-card navigation">
                <div className="action-icon-wrapper">
                  <span className="action-icon">🏏</span>
                </div>
                <div className="action-content">
                  <h4 className="action-title">Batting View</h4>
                  <p className="action-description">Detailed batting statistics</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>
              
              <Link to="/bowling-view" className="action-card navigation">
                <div className="action-icon-wrapper">
                  <span className="action-icon">⚾</span>
                </div>
                <div className="action-content">
                  <h4 className="action-title">Bowling View</h4>
                  <p className="action-description">Detailed bowling statistics</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>
              
              <button className="action-card save primary">
                <div className="action-icon-wrapper">
                  <span className="action-icon">💾</span>
                </div>
                <div className="action-content">
                  <h4 className="action-title">Save Match</h4>
                  <p className="action-description">Save current match progress</p>
                </div>
                <div className="action-arrow">→</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Batsman Selection Modal */}
      {showBatsmanModal && (
        <div className="modal-overlay" role="dialog" aria-labelledby="batsmanModalTitle" aria-modal="true">
          <div className="enhanced-modal-content">
            <div className="modal-header">
              <h3 id="batsmanModalTitle" className="modal-title">
                <span className="modal-icon">🏏</span>
                Select New Batsman
              </h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowBatsmanModal(false)}
                aria-label="Close modal"
              >
                <span className="close-icon">✗</span>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="player-selection-grid">
                {availableBatsmen.map(player => (
                  <div 
                    key={player.id}
                    className="player-selection-card"
                    onClick={() => handleBatsmanChange(player)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${player.name} as batsman`}
                  >
                    <div className="player-avatar">
                      <span className="avatar-icon">🏏</span>
                    </div>
                    <div className="player-details">
                      <span className="player-name">{player.name}</span>
                      <span className="player-role-badge">
                        <span className="role-icon">
                          {player.role === 'Batsman' ? '🏏' :
                           player.role === 'All-rounder' ? '🌟' : '🥅'}
                        </span>
                        <span className="role-text">{player.role}</span>
                      </span>
                    </div>
                    <div className="selection-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-action-btn secondary"
                onClick={() => setShowBatsmanModal(false)}
                aria-label="Cancel selection"
              >
                <span className="btn-icon">✗</span>
                <span className="btn-text">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Bowler Selection Modal */}
      {showBowlerModal && (
        <div className="modal-overlay" role="dialog" aria-labelledby="bowlerModalTitle" aria-modal="true">
          <div className="enhanced-modal-content">
            <div className="modal-header">
              <h3 id="bowlerModalTitle" className="modal-title">
                <span className="modal-icon">⚾</span>
                Select New Bowler
              </h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowBowlerModal(false)}
                aria-label="Close modal"
              >
                <span className="close-icon">✗</span>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="player-selection-grid">
                {availableBowlers.map(player => (
                  <div 
                    key={player.id}
                    className="player-selection-card"
                    onClick={() => handleBowlerChange(player)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${player.name} as bowler`}
                  >
                    <div className="player-avatar">
                      <span className="avatar-icon">⚾</span>
                    </div>
                    <div className="player-details">
                      <span className="player-name">{player.name}</span>
                      <span className="player-role-badge">
                        <span className="role-icon">
                          {player.role === 'Bowler' ? '⚾' :
                           player.role === 'All-rounder' ? '🌟' : '🏏'}
                        </span>
                        <span className="role-text">{player.role}</span>
                      </span>
                    </div>
                    <div className="selection-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-action-btn secondary"
                onClick={() => setShowBowlerModal(false)}
                aria-label="Cancel selection"
              >
                <span className="btn-icon">✗</span>
                <span className="btn-text">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoring;