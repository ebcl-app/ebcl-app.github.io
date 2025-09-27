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
import '../styles/scoring-figma-exact.css';
import '../styles/scoring-new.css';
import '../styles/scoring-mockup.css';
import '../styles/scoring-enhanced.css';
import '../styles/scoring-responsive.css';

const Scoring = () => {
  const [toast, setToast] = useState(null);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [showEndOverModal, setShowEndOverModal] = useState(false);
  const [showCustomRunModal, setShowCustomRunModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showOverEndModal, setShowOverEndModal] = useState(false);
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
        const runs = parseInt(event.key);
        handleRunScored(runs);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mock handlers (to be implemented)
  const handleRunScored = (runs) => {
    console.log(`Scored ${runs} runs`);
  };
  
  const handleExtra = (type, runs) => {
    console.log(`Extra: ${type}, runs: ${runs}`);
  };
  
  const handleWicketClick = () => {
    setWicketModal(true);
  };
  
  const handlePlayerChange = (type) => {
    if (type === 'bowler') {
      setBowlerModal(true);
    }
  };

  return (
    <div className={`figma-cricket-layout app-theme ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Header with Live Scoring and Dark Mode toggle */}
      <div className="figma-header">
        <div className="figma-header-left">
          <div className="figma-logo-container">
            <span className="figma-logo-icon">🏏</span>
            <div className="figma-title-section">
              <h1 className="figma-title">Live Scoring</h1>
              <div className="figma-subtitle">Track Match Progress</div>
            </div>
          </div>
        </div>
        <div className="figma-header-right">
          <span className="figma-live-badge">● LIVE</span>
          <button onClick={toggleDarkMode} className="figma-theme-toggle">
            🌙
          </button>
        </div>
      </div>

      {/* Match Status Card - Consolidated Info */}
      <div className="figma-match-status-card">
        <div className="figma-status-header">
          <span className="figma-status-icon">🏏</span>
          <span className="figma-status-title">MATCH STATUS</span>
        </div>
        
        {/* Current Batting Team Score */}
        <div className="figma-current-team">
          <div className="figma-team-name-current">TEAM A BATTING</div>
          <div className="figma-current-score">148<span className="figma-wickets">/3</span></div>
          <div className="figma-match-details">
            <span className="figma-detail-item">Overs: 18.1</span>
            <span className="figma-detail-divider">•</span>
            <span className="figma-detail-item">Target: 210</span>
            <span className="figma-detail-divider">•</span>
            <span className="figma-detail-item">Need: 62 runs</span>
          </div>
        </div>

        {/* Current Batsmen */}
        <div className="figma-current-batsmen">
          <div className="figma-batsman-compact">
            <div className="figma-batsman-badge figma-striker-badge">★</div>
            <div className="figma-batsman-info">
              <span className="figma-batsman-name">Virat Kohli</span>
              <span className="figma-batsman-score">78 (45)</span>
              <span className="figma-batsman-sr">SR: 173.3</span>
            </div>
          </div>
          <div className="figma-batsman-compact">
            <div className="figma-batsman-badge figma-non-striker-badge">•</div>
            <div className="figma-batsman-info">
              <span className="figma-batsman-name">Rohit Sharma</span>
              <span className="figma-batsman-score">22 (18)</span>
              <span className="figma-batsman-sr">SR: 122.2</span>
            </div>
          </div>
        </div>

        {/* Current Bowler */}
        <div className="figma-current-bowler">
          <div className="figma-bowler-info">
            <div className="figma-bowler-details">
              <span className="figma-bowler-name">🥎 Jasprit Bumrah</span>
              <span className="figma-bowler-stats">3.1 Overs • 2-27 • Eco: 8.4</span>
            </div>
            <button className="figma-change-bowler-compact" onClick={() => handlePlayerChange('bowler')}>
              CHANGE
            </button>
          </div>
        </div>

        {/* Current Over */}
        <div className="figma-current-over-compact">
          <span className="figma-over-label-compact">Current Over:</span>
          <div className="figma-over-balls-compact">
            <div className="figma-ball-compact figma-ball-dot">0</div>
            <div className="figma-ball-compact figma-ball-runs">1</div>
            <div className="figma-ball-compact figma-ball-runs">2</div>
            <div className="figma-ball-compact figma-ball-runs">6</div>
            <div className="figma-ball-compact figma-ball-empty">•</div>
            <div className="figma-ball-compact figma-ball-empty">•</div>
          </div>
        </div>
      </div>

      {/* All Scoring Controls Card */}
      <div className="figma-scoring-controls-card">
        <div className="figma-controls-header">
          <span className="figma-controls-icon">⚡</span>
          <span className="figma-controls-title">SCORING CONTROLS</span>
        </div>
        
        {/* Main Controls Layout - Runs on Left, Bowling Controls on Right */}
        <div className="figma-controls-main-layout">
          
          {/* Left Side - Run Scoring Buttons (3x3) */}
          <div className="figma-runs-section">
            <div className="figma-section-label">RUNS</div>
            <div className="figma-run-buttons-3x3">
              <button className="figma-run-btn-mobile figma-dot-btn" onClick={() => handleRunScored(0)}>0</button>
              <button className="figma-run-btn-mobile" onClick={() => handleRunScored(1)}>1</button>
              <button className="figma-run-btn-mobile" onClick={() => handleRunScored(2)}>2</button>
              <button className="figma-run-btn-mobile" onClick={() => handleRunScored(3)}>3</button>
              <button className="figma-run-btn-mobile figma-boundary-btn" onClick={() => handleRunScored(4)}>4</button>
              <button className="figma-run-btn-mobile" onClick={() => handleRunScored(5)}>5</button>
              <button className="figma-run-btn-mobile figma-six-btn" onClick={() => handleRunScored(6)}>6</button>
              <button className="figma-run-btn-mobile figma-dot-btn" onClick={() => setShowCustomRunModal(true)}>+</button>
              <button className="figma-run-btn-mobile" onClick={() => handleRunScored(7)}>7+</button>
            </div>
          </div>

          {/* Right Side - Extras Controls */}
          <div className="figma-extras-controls">
            <div className="figma-section-label">EXTRAS</div>
            
            {/* Main Extras Events Grid (3x2) */}
            <div className="figma-extras-buttons-main">
              <button className="figma-extra-btn-mobile figma-wide-btn" onClick={() => handleExtra('wide', 1)}>
                WIDE
              </button>
              <button className="figma-extra-btn-mobile figma-noball-btn" onClick={() => handleExtra('noBall', 1)}>
                NO BALL
              </button>
              <button className="figma-extra-btn-mobile figma-bye-btn" onClick={() => handleExtra('bye', 1)}>
                BYE
              </button>
              
              <button className="figma-extra-btn-mobile figma-legbye-btn" onClick={() => handleExtra('legBye', 1)}>
                LEG BYE
              </button>
              <button className="figma-action-btn-mobile figma-wicket-btn" onClick={handleWicketClick}>
                ⚡ OUT
              </button>
              <button className="figma-action-btn-mobile" style={{background: 'var(--figma-orange)'}} onClick={() => dispatch(swapBatsmen())}>
                ⇄ SWAP
              </button>
            </div>
            
            {/* Generic Over Actions (Horizontal Line) - Final Row */}
            <div className="figma-over-actions-final">
              <button className="figma-action-btn-mobile figma-undo-btn" onClick={() => setShowUndoModal(true)}>
                ↻ UNDO
              </button>
              <button className="figma-action-btn-mobile" style={{background: 'var(--figma-purple)'}} onClick={() => setShowOverEndModal(true)}>
                END OVER
              </button>
              <button className="figma-extra-btn-mobile" style={{background: 'var(--figma-gray)', fontSize: '8px'}} onClick={() => setShowExtraModal(true)}>
                MORE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {batsmanModal.open && (
        <div className="figma-modal-overlay">
          <div className="figma-modal">
            <h3>Select {batsmanModal.type === 'striker' ? 'Striker' : 'Non-Striker'}</h3>
            <button onClick={() => setBatsmanModal({ open: false, type: null })}>Close</button>
          </div>
        </div>
      )}
      
      {bowlerModal && (
        <div className="figma-modal-overlay">
          <div className="figma-modal">
            <h3>Select Bowler</h3>
            <button onClick={() => setBowlerModal(false)}>Close</button>
          </div>
        </div>
      )}
      
      {wicketModal && (
        <div className="figma-modal-overlay">
          <div className="figma-modal">
            <h3>Record Wicket</h3>
            <button onClick={() => setWicketModal(false)}>Close</button>
          </div>
        </div>
      )}
      
      {toast && <div className="figma-toast">{toast}</div>}
    </div>
  );
};

export default Scoring;