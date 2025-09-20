import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  initializeInnings, 
  setBatsmen, 
  setBowler, 
  addRuns, 
  changeBatsman, 
  swapBatsmen 
} from '../store/slices/scoringSlice';
import '../styles/cricket.css';

const Scoring = () => {
  const dispatch = useDispatch();
  const { currentMatch } = useSelector(state => state.match);
  const { 
    score, 
    currentBatsmen, 
    currentBowler, 
    battingTeam, 
    bowlingTeam, 
    playerStats
  } = useSelector(state => state.scoring);

  const [showBatsmanModal, setShowBatsmanModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [changingBatsman, setChangingBatsman] = useState(null); // 'striker' or 'nonStriker'

  useEffect(() => {
    if (currentMatch && currentMatch.status === 'live') {
      // Determine batting and bowling teams based on toss
      let battingTeamData, bowlingTeamData;
      
      if (currentMatch.choosenToAction === 'bat') {
        // Toss winner chose to bat
        if (currentMatch.tossWinner === currentMatch.team1.name) {
          battingTeamData = currentMatch.team1;
          bowlingTeamData = currentMatch.team2;
        } else {
          battingTeamData = currentMatch.team2;
          bowlingTeamData = currentMatch.team1;
        }
      } else {
        // Toss winner chose to bowl
        if (currentMatch.tossWinner === currentMatch.team1.name) {
          battingTeamData = currentMatch.team2;
          bowlingTeamData = currentMatch.team1;
        } else {
          battingTeamData = currentMatch.team1;
          bowlingTeamData = currentMatch.team2;
        }
      }

      // Initialize innings
      dispatch(initializeInnings({
        battingTeam: battingTeamData,
        bowlingTeam: bowlingTeamData,
        innings: 1
      }));

      // Set initial batsmen (first two players)
      if (battingTeamData.players.length >= 2) {
        dispatch(setBatsmen({
          striker: battingTeamData.players[0],
          nonStriker: battingTeamData.players[1]
        }));
      }

      // Set initial bowler (first bowler from bowling team)
      const firstBowler = bowlingTeamData.players.find(p => p.role === 'Bowler');
      if (firstBowler) {
        dispatch(setBowler(firstBowler));
      }
    }
  }, [currentMatch, dispatch]);

  const handleRunScored = (runs) => {
    dispatch(addRuns({ runs }));
    
    // Swap batsmen on odd runs
    if (runs % 2 === 1) {
      dispatch(swapBatsmen());
    }
  };

  const handleExtra = (type) => {
    const extraData = { [type]: 1 };
    let runs = 1; // Default extra run
    
    if (type === 'wd' || type === 'nb') {
      dispatch(addRuns({ runs, extras: extraData }));
    } else if (type === 'w') {
      dispatch(addRuns({ 
        runs: 0, 
        isWicket: true, 
        wicketDetails: { 
          howOut: 'Bowled', 
          bowler: currentBowler 
        }
      }));
      setShowBatsmanModal(true);
    }
  };

  const handleBatsmanChange = (newBatsman) => {
    dispatch(changeBatsman({ 
      newBatsman, 
      position: changingBatsman 
    }));
    setShowBatsmanModal(false);
    setChangingBatsman(null);
  };

  const handleBowlerChange = (newBowler) => {
    dispatch(setBowler(newBowler));
    setShowBowlerModal(false);
  };

  const availableBatsmen = battingTeam?.players?.filter(player => 
    !playerStats[player.id]?.isOut && 
    player.id !== currentBatsmen.striker?.id && 
    player.id !== currentBatsmen.nonStriker?.id
  ) || [];

  const availableBowlers = bowlingTeam?.players?.filter(player => 
    player.role === 'Bowler' || player.role === 'All-rounder'
  ) || [];

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

          {/* Header Section */}
          <div className="modern-header">
            <div className="modern-header-left">
              <span className="modern-cricket-icon">🏏</span>
              <span className="modern-title">Live Scoring</span>
            </div>
            <div className="modern-user-badge">
              {battingTeam?.name} vs {bowlingTeam?.name}
            </div>
          </div>

          <h1 className="app-title modern-main-title">
            {score.runs}/{score.wickets} ({score.overs}.{score.balls})
          </h1>
          <p className="app-subtitle modern-subtitle">
            {battingTeam?.name} - Current Score
          </p>

          {/* Cricket Hero Section - Score Display */}
          <div className="cricket-hero-section">
            <div className="modern-score-display">
              <div className="score-card">
                <div className="team-score">
                  <span className="team-name">{battingTeam?.name}</span>
                  <span className="score">{score.runs}/{score.wickets}</span>
                  <span className="overs">({score.overs}.{score.balls} overs)</span>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Match Info Section */}
          <div className="modern-section">
            <div className="modern-match-info">
              <div className="modern-info-grid">
                <div className="modern-info-item">
                  <span className="modern-info-label">On Strike:</span>
                  <span className="modern-info-value">{currentBatsmen.striker?.name || 'Not Set'}</span>
                  <button 
                    className="modern-btn modern-btn-small"
                    onClick={() => {
                      setChangingBatsman('striker');
                      setShowBatsmanModal(true);
                    }}
                  >
                    Change
                  </button>
                </div>
                <div className="modern-info-item">
                  <span className="modern-info-label">Wickets:</span>
                  <span className="modern-info-value">{score.wickets}/10</span>
                </div>
                <div className="modern-info-item">
                  <span className="modern-info-label">Over:</span>
                  <span className="modern-info-value">{score.overs}.{score.balls}/20</span>
                </div>
              </div>
              
              <div className="modern-info-grid">
                <div className="modern-info-item">
                  <span className="modern-info-label">Non Striker:</span>
                  <span className="modern-info-value">{currentBatsmen.nonStriker?.name || 'Not Set'}</span>
                  <button 
                    className="modern-btn modern-btn-small"
                    onClick={() => {
                      setChangingBatsman('nonStriker');
                      setShowBatsmanModal(true);
                    }}
                  >
                    Change
                  </button>
                </div>
                <div className="modern-info-item">
                  <span className="modern-info-label">Bowler:</span>
                  <span className="modern-info-value">{currentBowler?.name || 'Not Set'}</span>
                  <button 
                    className="modern-btn modern-btn-small"
                    onClick={() => setShowBowlerModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

      {/* Scoring Buttons */}
      <div className="scoring-buttons-section">
        <div className="runs-buttons">
          {[0, 1, 2, 3, 4, 6].map(run => (
            <button 
              key={run} 
              className="run-button"
              onClick={() => handleRunScored(run)}
            >
              {run}
            </button>
          ))}
        </div>
        
        <div className="extras-buttons">
          <button className="extra-button wd-button" onClick={() => handleExtra('wd')}>
            Wd
          </button>
          <button className="extra-button nb-button" onClick={() => handleExtra('nb')}>
            Nb
          </button>
          <button className="extra-button w-button" onClick={() => handleExtra('w')}>
            W
          </button>
        </div>
      </div>

      {/* Current Score Display */}
      <div className="current-score-section">
        <div className="score-display">
          <div className="total-score">
            <span className="score-number">{score.runs}</span>
            <span className="score-separator">-</span>
            <span className="wickets-number">{score.wickets}</span>
          </div>
          <div className="batsman-score">
            <span className="batsman-name">{currentBatsmen.striker?.name}</span>
            <span className="batsman-stats">
              {playerStats[currentBatsmen.striker?.id]?.runs || 0} ({playerStats[currentBatsmen.striker?.id]?.balls || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Team Views Navigation */}
      <div className="team-views-section">
        <Link to="/batting-view" className="team-view-btn batting-view-btn">
          <span className="view-icon">🏏</span>
          Batting View
        </Link>
        <Link to="/bowling-view" className="team-view-btn bowling-view-btn">
          <span className="view-icon">⚾</span>
          Bowling View
        </Link>
      </div>

      {/* Save Button */}
      <div className="save-button-section">
        <button className="save-final-score-btn">
          Save Final Score
        </button>
      </div>

      {/* Batsman Change Modal */}
      {showBatsmanModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select New Batsman</h3>
            <div className="player-selection-list">
              {availableBatsmen.map(player => (
                <div 
                  key={player.id}
                  className="player-selection-item"
                  onClick={() => handleBatsmanChange(player)}
                >
                  <span className="player-name">{player.name}</span>
                  <span className="player-role">({player.role})</span>
                </div>
              ))}
            </div>
            <button 
              className="modal-close-btn"
              onClick={() => setShowBatsmanModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bowler Change Modal */}
      {showBowlerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select New Bowler</h3>
            <div className="player-selection-list">
              {availableBowlers.map(player => (
                <div 
                  key={player.id}
                  className="player-selection-item"
                  onClick={() => handleBowlerChange(player)}
                >
                  <span className="player-name">{player.name}</span>
                  <span className="player-role">({player.role})</span>
                </div>
              ))}
            </div>
            <button 
              className="modal-close-btn"
              onClick={() => setShowBowlerModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoring;
