import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../styles/cricket.css';

const BowlingView = () => {
  const { currentMatch } = useSelector(state => state.match);
  const { 
    score, 
    currentBatsmen, 
    currentBowler, 
    battingTeam, 
    bowlingTeam, 
    playerStats,
    ballByBall,
    extras,
    currentRunRate,
    powerPlayOvers
  } = useSelector(state => state.scoring);

  if (!currentMatch || currentMatch.status !== 'live') {
    return (
      <div className="bowling-view-page">
        <div className="back-link-container">
          <Link to="/scoring" className="back-link">
            ← Back to Scoring
          </Link>
        </div>
        <div className="no-match-message">
          <h2>No Active Match</h2>
          <p>Please start scoring to view bowling details.</p>
        </div>
      </div>
    );
  }

  // Get bowling team players with their stats
  const bowlingPlayers = bowlingTeam?.players?.filter(player => 
    player.role === 'Bowler' || player.role === 'All-rounder'
  ).map(player => ({
    ...player,
    stats: playerStats[player.id] || { 
      oversBowled: 0, 
      ballsBowled: 0, 
      runsConceded: 0, 
      wicketsTaken: 0, 
      maidenOvers: 0, 
      economy: 0 
    }
  })) || [];

  const totalOvers = score.overs + (score.balls / 6);
  const totalExtras = Object.values(extras).reduce((sum, extra) => sum + extra, 0);

  return (
    <div className="bowling-view-page">
      {/* Back Button */}
      <div className="back-link-container">
        <Link to="/scoring" className="back-link">
          ← Back to Scoring
        </Link>
      </div>

      {/* Header */}
      <div className="view-header">
        <div className="team-info">
          <h2 className="team-name">{bowlingTeam?.name}</h2>
          <div className="innings-info">
            <span className="innings-label">Bowling vs {battingTeam?.name}</span>
            <span className="match-status">1st Innings</span>
          </div>
        </div>
      </div>

      {/* Opposition Score */}
      <div className="opposition-score-card">
        <h3 className="card-title">Opposition Score</h3>
        <div className="score-display">
          <div className="main-score">
            <span className="total-runs">{score.runs}</span>
            <span className="score-separator">/</span>
            <span className="total-wickets">{score.wickets}</span>
            <span className="overs-info">({totalOvers.toFixed(1)} overs)</span>
          </div>
          
          <div className="bowling-stats">
            <div className="stat-item">
              <span className="stat-label">Run Rate:</span>
              <span className="stat-value">{currentRunRate?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Extras:</span>
              <span className="stat-value">{totalExtras}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Powerplay:</span>
              <span className="stat-value">{powerPlayOvers.completed}/{powerPlayOvers.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Bowler Performance */}
      <div className="current-bowler-card">
        <h3 className="card-title">Current Bowler</h3>
        <div className="bowler-performance">
          <div className="bowler-header">
            <div className="bowler-name">{currentBowler?.name || 'Not Set'}</div>
            <div className="bowler-role">({currentBowler?.role})</div>
          </div>
          
          <div className="bowler-stats-grid">
            <div className="stat-box">
              <span className="stat-number">
                {Math.floor((playerStats[currentBowler?.id]?.ballsBowled || 0) / 6)}.{(playerStats[currentBowler?.id]?.ballsBowled || 0) % 6}
              </span>
              <span className="stat-label">Overs</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{playerStats[currentBowler?.id]?.runsConceded || 0}</span>
              <span className="stat-label">Runs</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{playerStats[currentBowler?.id]?.wicketsTaken || 0}</span>
              <span className="stat-label">Wickets</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{playerStats[currentBowler?.id]?.economy?.toFixed(2) || '0.00'}</span>
              <span className="stat-label">Economy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Batsmen (Opposition) */}
      <div className="opposition-batsmen-card">
        <h3 className="card-title">Current Batsmen</h3>
        <div className="batsmen-info">
          <div className="batsman-item striker">
            <div className="batsman-header">
              <span className="batsman-name">{currentBatsmen.striker?.name || 'Not Set'}</span>
              <span className="striker-indicator">*</span>
            </div>
            <div className="batsman-score">
              {playerStats[currentBatsmen.striker?.id]?.runs || 0} ({playerStats[currentBatsmen.striker?.id]?.balls || 0})
            </div>
            <div className="batsman-strike-rate">
              SR: {playerStats[currentBatsmen.striker?.id]?.strikeRate?.toFixed(2) || '0.00'}
            </div>
          </div>
          
          <div className="batsman-item">
            <div className="batsman-header">
              <span className="batsman-name">{currentBatsmen.nonStriker?.name || 'Not Set'}</span>
            </div>
            <div className="batsman-score">
              {playerStats[currentBatsmen.nonStriker?.id]?.runs || 0} ({playerStats[currentBatsmen.nonStriker?.id]?.balls || 0})
            </div>
            <div className="batsman-strike-rate">
              SR: {playerStats[currentBatsmen.nonStriker?.id]?.strikeRate?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Bowling Figures */}
      <div className="bowling-figures-card">
        <h3 className="card-title">Bowling Figures</h3>
        <div className="bowling-table">
          <div className="bowling-header">
            <span className="col-bowler">Bowler</span>
            <span className="col-overs">Overs</span>
            <span className="col-runs">Runs</span>
            <span className="col-wickets">Wickets</span>
            <span className="col-economy">Economy</span>
          </div>
          
          {bowlingPlayers.map(player => (
            <div key={player.id} className={`bowling-row ${player.id === currentBowler?.id ? 'current' : ''}`}>
              <span className="col-bowler">
                {player.name}
                {player.id === currentBowler?.id && ' *'}
              </span>
              <span className="col-overs">
                {Math.floor(player.stats.ballsBowled / 6)}.{player.stats.ballsBowled % 6}
              </span>
              <span className="col-runs">{player.stats.runsConceded}</span>
              <span className="col-wickets">{player.stats.wicketsTaken}</span>
              <span className="col-economy">{player.stats.economy.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extras Breakdown */}
      <div className="extras-card">
        <h3 className="card-title">Extras Breakdown</h3>
        <div className="extras-grid">
          <div className="extra-item">
            <span className="extra-type">Wides</span>
            <span className="extra-count">{extras.wides}</span>
          </div>
          <div className="extra-item">
            <span className="extra-type">No Balls</span>
            <span className="extra-count">{extras.noBalls}</span>
          </div>
          <div className="extra-item">
            <span className="extra-type">Byes</span>
            <span className="extra-count">{extras.byes}</span>
          </div>
          <div className="extra-item">
            <span className="extra-type">Leg Byes</span>
            <span className="extra-count">{extras.legByes}</span>
          </div>
          <div className="extra-item total">
            <span className="extra-type">Total</span>
            <span className="extra-count">{totalExtras}</span>
          </div>
        </div>
      </div>

      {/* Current Over Analysis */}
      {ballByBall.length > 0 && (
        <div className="current-over-card">
          <h3 className="card-title">Current Over</h3>
          <div className="over-balls">
            {ballByBall
              .filter(ball => ball.over === score.overs)
              .map((ball, index) => (
                <div key={index} className={`over-ball ${ball.isWicket ? 'wicket' : ''} ${ball.extras.wide || ball.extras.noBall ? 'extra' : ''}`}>
                  {ball.isWicket ? 'W' : ball.runs}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/batting-view" className="action-btn batting-view-btn">
          <span className="btn-icon">🏏</span>
          Batting View
        </Link>
        <Link to="/scoring" className="action-btn scoring-btn">
          <span className="btn-icon">📊</span>
          Back to Scoring
        </Link>
      </div>
    </div>
  );
};

export default BowlingView;