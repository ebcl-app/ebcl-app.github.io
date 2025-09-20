import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../styles/cricket.css';

const BattingView = () => {
  const { currentMatch } = useSelector(state => state.match);
  const { 
    score, 
    currentBatsmen, 
    currentBowler, 
    battingTeam, 
    bowlingTeam, 
    playerStats,
    ballByBall,
    fallOfWickets,
    currentRunRate,
    requiredRunRate,
    target
  } = useSelector(state => state.scoring);

  if (!currentMatch || currentMatch.status !== 'live') {
    return (
      <div className="batting-view-page">
        <div className="back-link-container">
          <Link to="/scoring" className="back-link">
            ← Back to Scoring
          </Link>
        </div>
        <div className="no-match-message">
          <h2>No Active Match</h2>
          <p>Please start scoring to view batting details.</p>
        </div>
      </div>
    );
  }

  // Get batting team players with their stats
  const battingPlayers = battingTeam?.players?.map(player => ({
    ...player,
    stats: playerStats[player.id] || { runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }
  })) || [];

  const totalOvers = score.overs + (score.balls / 6);

  return (
    <div className="batting-view-page">
      {/* Back Button */}
      <div className="back-link-container">
        <Link to="/scoring" className="back-link">
          ← Back to Scoring
        </Link>
      </div>

      {/* Header */}
      <div className="view-header">
        <div className="team-info">
          <h2 className="team-name">{battingTeam?.name}</h2>
          <div className="innings-info">
            <span className="innings-label">1st Innings</span>
            <span className="vs-text">vs {bowlingTeam?.name}</span>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="score-summary-card">
        <div className="main-score">
          <span className="total-runs">{score.runs}</span>
          <span className="score-separator">/</span>
          <span className="total-wickets">{score.wickets}</span>
          <span className="overs-info">({totalOvers.toFixed(1)} overs)</span>
        </div>
        
        <div className="run-rate-info">
          <div className="rate-item">
            <span className="rate-label">Current RR:</span>
            <span className="rate-value">{currentRunRate?.toFixed(2) || '0.00'}</span>
          </div>
          {target && (
            <div className="rate-item">
              <span className="rate-label">Required RR:</span>
              <span className="rate-value">{requiredRunRate?.toFixed(2) || '0.00'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Partnership */}
      <div className="current-partnership-card">
        <h3 className="card-title">Current Partnership</h3>
        <div className="partnership-details">
          <div className="batsman-info">
            <div className="batsman-card striker">
              <div className="batsman-name">{currentBatsmen.striker?.name || 'Not Set'}</div>
              <div className="batsman-score">
                {playerStats[currentBatsmen.striker?.id]?.runs || 0}* ({playerStats[currentBatsmen.striker?.id]?.balls || 0})
              </div>
              <div className="batsman-details">
                <span>4s: {playerStats[currentBatsmen.striker?.id]?.fours || 0}</span>
                <span>6s: {playerStats[currentBatsmen.striker?.id]?.sixes || 0}</span>
                <span>SR: {playerStats[currentBatsmen.striker?.id]?.strikeRate?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            
            <div className="batsman-card non-striker">
              <div className="batsman-name">{currentBatsmen.nonStriker?.name || 'Not Set'}</div>
              <div className="batsman-score">
                {playerStats[currentBatsmen.nonStriker?.id]?.runs || 0} ({playerStats[currentBatsmen.nonStriker?.id]?.balls || 0})
              </div>
              <div className="batsman-details">
                <span>4s: {playerStats[currentBatsmen.nonStriker?.id]?.fours || 0}</span>
                <span>6s: {playerStats[currentBatsmen.nonStriker?.id]?.sixes || 0}</span>
                <span>SR: {playerStats[currentBatsmen.nonStriker?.id]?.strikeRate?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
          
          <div className="bowler-info">
            <h4>Current Bowler</h4>
            <div className="bowler-stats">
              <div className="bowler-name">{currentBowler?.name || 'Not Set'}</div>
              <div className="bowler-figures">
                {Math.floor((playerStats[currentBowler?.id]?.ballsBowled || 0) / 6)}.{(playerStats[currentBowler?.id]?.ballsBowled || 0) % 6} - 
                {playerStats[currentBowler?.id]?.runsConceded || 0} - 
                {playerStats[currentBowler?.id]?.wicketsTaken || 0}
              </div>
              <div className="bowler-economy">
                Economy: {playerStats[currentBowler?.id]?.economy?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batting Scorecard */}
      <div className="scorecard-card">
        <h3 className="card-title">Batting Scorecard</h3>
        <div className="scorecard-table">
          <div className="scorecard-header">
            <span className="col-batsman">Batsman</span>
            <span className="col-runs">Runs</span>
            <span className="col-balls">Balls</span>
            <span className="col-fours">4s</span>
            <span className="col-sixes">6s</span>
            <span className="col-sr">SR</span>
          </div>
          
          {battingPlayers.map(player => (
            <div key={player.id} className={`scorecard-row ${player.stats.isOut ? 'out' : ''}`}>
              <span className="col-batsman">
                {player.name}
                {player.id === currentBatsmen.striker?.id && '*'}
                {player.stats.isOut && (
                  <div className="dismissal-info">{player.stats.howOut}</div>
                )}
              </span>
              <span className="col-runs">{player.stats.runs}</span>
              <span className="col-balls">{player.stats.balls}</span>
              <span className="col-fours">{player.stats.fours}</span>
              <span className="col-sixes">{player.stats.sixes}</span>
              <span className="col-sr">{player.stats.strikeRate.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fall of Wickets */}
      {fallOfWickets.length > 0 && (
        <div className="fall-of-wickets-card">
          <h3 className="card-title">Fall of Wickets</h3>
          <div className="wickets-list">
            {fallOfWickets.map((wicket, index) => (
              <div key={index} className="wicket-item">
                <span className="wicket-score">{wicket.runs}/{wicket.wicketNumber}</span>
                <span className="wicket-batsman">({wicket.batsman?.name})</span>
                <span className="wicket-over">{wicket.overs} ov</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Overs */}
      {ballByBall.length > 0 && (
        <div className="recent-overs-card">
          <h3 className="card-title">Recent Balls</h3>
          <div className="balls-sequence">
            {ballByBall.slice(-12).map((ball, index) => (
              <div key={index} className={`ball-item ${ball.isWicket ? 'wicket' : ''}`}>
                {ball.isWicket ? 'W' : ball.runs}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/bowling-view" className="action-btn bowling-view-btn">
          <span className="btn-icon">⚾</span>
          Bowling View
        </Link>
        <Link to="/scoring" className="action-btn scoring-btn">
          <span className="btn-icon">🏏</span>
          Back to Scoring
        </Link>
      </div>
    </div>
  );
};

export default BattingView;