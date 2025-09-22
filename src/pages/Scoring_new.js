import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  addRuns,
  setBatsmen,
  setBowler,
  changeBatsman,
  swapBatsmen,
  undoLastBall
} from '../store/slices/scoringSlice';
import '../styles/common.css';
import '../styles/cricket.css';
import '../styles/scoring.css';
import '../styles/scoring-new.css';

const Scoring = () => {
  const dispatch = useDispatch();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentMatch } = useSelector(state => state.match);
  const { score, currentBatsmen, currentBowler, playerStats, currentOver, ballHistory } = useSelector(state => state.scoring);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [matchStartTime] = useState(new Date());
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [batsmanModal, setBatsmanModal] = useState({ open: false, type: null });
  const [bowlerModal, setBowlerModal] = useState(false);
  const [wicketModal, setWicketModal] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [bowlerSearch, setBowlerSearch] = useState('');

  // Mock data for demo
  const availablePlayers = [
    { id: 1, name: 'Virat Kohli', totalRuns: 12000, average: '55.4', strikeRate: '92.5' },
    { id: 2, name: 'Rohit Sharma', totalRuns: 9000, average: '48.2', strikeRate: '95.8' },
    { id: 3, name: 'KL Rahul', totalRuns: 6000, average: '42.1', strikeRate: '88.2' }
  ];

  const availableBowlers = [
    { id: 4, name: 'Jasprit Bumrah', totalWickets: 120, economy: '4.50', bestFigures: '6/19' },
    { id: 5, name: 'Mohammed Shami', totalWickets: 180, economy: '5.20', bestFigures: '5/28' },
    { id: 6, name: 'Yuzvendra Chahal', totalWickets: 150, economy: '5.80', bestFigures: '6/25' }
  ];

  const wicketTypes = ['Bowled', 'Caught', 'LBW', 'Stumped', 'Run Out', 'Hit Wicket'];

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key >= '0' && event.key <= '6') {
        handleRunScored(parseInt(event.key));
      } else if (event.key === 'w' || event.key === 'W') {
        handleWicketClick();
      } else if (event.key === 'u' || event.key === 'U') {
        dispatch(undoLastBall());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate stats
  const { striker, nonStriker } = currentBatsmen || {};
  const bowler = currentBowler;
  
  const strikerStats = striker ? playerStats[striker.id] || {} : {};
  const nonStrikerStats = nonStriker ? playerStats[nonStriker.id] || {} : {};
  const bowlerStats = bowler ? playerStats[bowler.id] || {} : {};

  const stats = {
    striker: {
      runs: strikerStats.runs || 78,
      balls: strikerStats.balls || 45,
      strikeRate: strikerStats.balls > 0 ? ((strikerStats.runs / strikerStats.balls) * 100).toFixed(1) : '173.3',
      battingTime: strikerStats.battingTime || '45:32'
    },
    nonStriker: {
      runs: nonStrikerStats.runs || 22,
      balls: nonStrikerStats.balls || 18,
      strikeRate: nonStrikerStats.balls > 0 ? ((nonStrikerStats.runs / nonStrikerStats.balls) * 100).toFixed(1) : '122.2',
      battingTime: nonStrikerStats.battingTime || '18:15'
    },
    bowler: {
      wickets: bowlerStats.wickets || 0,
      runsConceded: bowlerStats.runsConceded || 23,
      overs: bowlerStats.overs || '3.2',
      economy: bowlerStats.economy || '4.50',
      bowlingAverage: bowlerStats.bowlingAverage || '28.5'
    }
  };

  const handleRunScored = (runs) => {
    dispatch(addRuns({ runs, isExtra: false }));
  };

  const handleExtra = (type, runs) => {
    dispatch(addRuns({ runs, isExtra: true, extraType: type }));
  };

  const handlePlayerChange = (playerType) => {
    if (playerType === 'striker' || playerType === 'nonStriker') {
      setBatsmanModal({ open: true, type: playerType });
      setPlayerSearch('');
    } else if (playerType === 'bowler') {
      setBowlerModal(true);
      setBowlerSearch('');
    }
  };

  const handlePlayerSelection = (playerType, position, player) => {
    if (playerType === 'batsman') {
      dispatch(changeBatsman({ position, player }));
      setBatsmanModal({ open: false, type: null });
    } else if (playerType === 'bowler') {
      dispatch(setBowler(player));
      setBowlerModal(false);
    }
    setPlayerSearch('');
    setBowlerSearch('');
  };

  const handleWicketClick = () => {
    setWicketModal(true);
  };

  const handleWicketType = (wicketType) => {
    console.log('Wicket recorded:', wicketType);
    setWicketModal(false);
  };

  return (
    <div className={`dashboard-container app-theme ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="dashboard-content">
        {/* Header with Theme Toggle and Back Navigation */}
        <div className="dashboard-header">
          <div className="app-title-section">
            <div className="app-logo">
              <Link to="/" className="logo-button">
                <span className="logo-icon">🏏</span>
              </Link>
            </div>
            <div className="title-content">
              <h1 className="dashboard-title">Live Scoring</h1>
              <div className="title-subtitle">Track Match Progress</div>
            </div>
          </div>
          <div className="theme-toggle-section">
            <div className="live-badge">Live</div>
            <button onClick={toggleDarkMode} className="theme-toggle-btn">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Main Scoring Interface */}
        <div className="scoring-main-container">
          {/* Match Scorecard */}
          <div className="match-scorecard">
            <div className="teams-display">
              {/* Team A (Batting) */}
              <div className="team-display team-batting">
                <div className="team-navigation">
                  <button className="nav-arrow">‹</button>
                </div>
                <div className="team-content">
                  <div className="team-name">{currentMatch?.team1?.name || 'TEAM A'}</div>
                  <div className="team-score-large">
                    <span className="runs-large">{score?.total || 145}</span>
                    <span className="wickets-large">/{score?.wickets || 3}</span>
                  </div>
                  <div className="team-stats">
                    <div className="overs-display">
                      {Math.floor((score?.balls || 109) / 6)}.{(score?.balls || 109) % 6} Overs
                    </div>
                    <div className="run-rate">
                      RR: {score?.balls > 0 ? ((score?.total / score?.balls) * 6).toFixed(2) : '7.91'}
                    </div>
                    <div className="target-info">
                      Target: 250 (105 needed from 54 balls)
                    </div>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="vs-divider">
                <span className="vs-text">VS</span>
              </div>

              {/* Team B (Bowling) */}
              <div className="team-display team-bowling">
                <div className="team-content">
                  <div className="team-name">{currentMatch?.team2?.name || 'TEAM B'}</div>
                  <div className="team-score-large bowling-score">
                    <span className="runs-large">135</span>
                    <span className="wickets-large">/3</span>
                  </div>
                  <div className="team-stats bowling-stats">
                    <div className="last-wicket">
                      <span className="label">LAST WICKET:</span>
                    </div>
                    <div className="projected-score">
                      <span className="label">Proj. Score:</span> 200
                    </div>
                    <div className="last-et">
                      <span className="label">LAST ET:</span> 135/2000
                    </div>
                  </div>
                </div>
                <div className="team-navigation">
                  <button className="nav-arrow">›</button>
                </div>
              </div>
            </div>

            {/* Current Over Display */}
            <div className="current-over-section">
              <div className="over-header">
                <span className="over-label">CURRENT OVER</span>
                <button className="change-bowler-btn" onClick={() => handlePlayerChange('bowler')}>
                  Change Bowler
                </button>
              </div>
              <div className="over-balls-display">
                {(ballHistory || []).slice(-6).map((ball, index) => (
                  <div key={index} className={`ball-indicator ${ball.type || 'runs'}`}>
                    {ball.display || ball.runs || '•'}
                  </div>
                ))}
                {Array.from({ length: 6 - ((ballHistory || []).slice(-6).length) }, (_, index) => (
                  <div key={`empty-${index}`} className="ball-indicator empty">•</div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Players Section */}
          <div className="players-section">
            <div className="section-title">CURRENT PLAYERS</div>
            
            <div className="players-row">
              {/* Current Batsmen */}
              <div className="players-group batsmen-group">
                <div className="group-header">NON'S PLAYERS</div>
                <div className="player-cards">
                  {/* Striker */}
                  <div className="player-card striker-card">
                    <div className="player-role striker">Striker</div>
                    <div className="player-avatar">
                      <img src="/api/placeholder/48/48" alt="Player" className="player-photo" />
                    </div>
                    <div className="player-info">
                      <div className="player-name">{currentBatsmen?.striker?.name || 'Virat Kohli'}</div>
                      <div className="player-stats-row">
                        <span className="runs">{stats.striker.runs} ({stats.striker.balls} balls)</span>
                      </div>
                      <div className="player-detailed-stats">
                        <span className="stat">SR: {stats.striker.strikeRate}</span>
                        <span className="stat">SR: 178.52</span>
                        <span className="stat">43.5 | 65.6</span>
                      </div>
                    </div>
                    <button className="swap-button" onClick={() => dispatch(swapBatsmen())}>
                      Swap Strikers
                    </button>
                  </div>

                  {/* Non-Striker */}
                  <div className="player-card non-striker-card">
                    <div className="player-role striker">Striker</div>
                    <div className="player-avatar">
                      <img src="/api/placeholder/48/48" alt="Player" className="player-photo" />
                    </div>
                    <div className="player-info">
                      <div className="player-name">{currentBatsmen?.nonStriker?.name || 'Rohit Sharma'}</div>
                      <div className="player-stats-row">
                        <span className="runs">{stats.nonStriker.runs} ({stats.nonStriker.balls} balls)</span>
                      </div>
                      <div className="player-detailed-stats">
                        <span className="stat">SR: {stats.nonStriker.strikeRate}</span>
                        <span className="stat">SR: 122.22</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Bowler */}
              <div className="players-group bowler-group">
                <div className="group-header">NON'S PLAYERS</div>
                <div className="player-cards">
                  <div className="player-card bowler-card">
                    <div className="player-role bowler">Bowler</div>
                    <div className="player-avatar">
                      <img src="/api/placeholder/48/48" alt="Player" className="player-photo" />
                    </div>
                    <div className="player-info">
                      <div className="player-name">{currentBowler?.name || 'Jasprit Bumrah'}</div>
                      <div className="player-stats-row">
                        <span className="bowling-figures">0.3 Overs</span>
                      </div>
                      <div className="player-detailed-stats">
                        <span className="stat">W: 7</span>
                        <span className="stat">Econ: 4.50</span>
                        <span className="stat">R: 77</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Controls Section */}
          <div className="scoring-controls-section">
            <div className="controls-row">
              {/* Extras */}
              <div className="controls-group extras-group">
                <div className="group-title">EXTRAS</div>
                <div className="extras-buttons">
                  <button className="extra-btn wide-btn" onClick={() => handleExtra('wide', 1)}>
                    Wide
                  </button>
                  <button className="extra-btn noball-btn" onClick={() => handleExtra('noBall', 1)}>
                    No Ball
                  </button>
                  <button className="extra-btn bye-btn" onClick={() => handleExtra('bye', 1)}>
                    Bye
                  </button>
                  <button className="extra-btn legbye-btn" onClick={() => handleExtra('legBye', 1)}>
                    Leg Bye
                  </button>
                </div>
                <div className="extras-counters">
                  <div className="extra-count">0</div>
                  <div className="extra-label">Ball</div>
                </div>
              </div>

              {/* Run Scoring */}
              <div className="controls-group scoring-group">
                <div className="group-title">SCORING CONTROLS</div>
                <div className="run-buttons">
                  {[0, 4, 3, 5, 6].map(runs => (
                    <button
                      key={runs}
                      className={`run-btn ${runs === 0 ? 'dot-btn' : runs >= 4 ? 'boundary-btn' : 'run-btn'}`}
                      onClick={() => handleRunScored(runs)}
                    >
                      {runs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="controls-group actions-group">
                <button className="action-btn wicket-btn" onClick={handleWicketClick}>
                  WICKET
                </button>
                <button className="action-btn undo-btn" onClick={() => dispatch(undoLastBall())}>
                  UNDO Last Ball
                </button>
                <button className="action-btn end-over-btn">
                  End Over
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batsman Selection Modal */}
      {batsmanModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select {batsmanModal.type === 'striker' ? 'Striker' : 'Non-Striker'}</h3>
              <button className="modal-close" onClick={() => setBatsmanModal({ open: false, type: null })}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search players..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="player-list">
                {availablePlayers
                  .filter(player => player.name.toLowerCase().includes(playerSearch.toLowerCase()))
                  .map(player => (
                    <div 
                      key={player.id} 
                      className="player-item"
                      onClick={() => handlePlayerSelection('batsman', batsmanModal.type, player)}
                    >
                      <div className="player-info">
                        <div className="player-name">{player.name}</div>
                        <div className="player-stats">
                          Runs: {player.totalRuns} | Avg: {player.average} | SR: {player.strikeRate}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bowler Selection Modal */}
      {bowlerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Bowler</h3>
              <button className="modal-close" onClick={() => setBowlerModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search bowlers..."
                  value={bowlerSearch}
                  onChange={(e) => setBowlerSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="player-list">
                {availableBowlers
                  .filter(bowler => bowler.name.toLowerCase().includes(bowlerSearch.toLowerCase()))
                  .map(bowler => (
                    <div 
                      key={bowler.id} 
                      className="player-item"
                      onClick={() => handlePlayerSelection('bowler', null, bowler)}
                    >
                      <div className="player-info">
                        <div className="player-name">{bowler.name}</div>
                        <div className="player-stats">
                          Wickets: {bowler.totalWickets} | Economy: {bowler.economy} | Best: {bowler.bestFigures}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wicket Modal */}
      {wicketModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Record Wicket</h3>
              <button className="modal-close" onClick={() => setWicketModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="wicket-options">
                <div className="wicket-type-grid">
                  {wicketTypes.map(type => (
                    <button 
                      key={type}
                      className="wicket-btn"
                      onClick={() => handleWicketType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoring;