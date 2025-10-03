import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { createNewMatch } from '../store/slices/matchSlice';
import '../styles/cricket.css';

const StartMatch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teams } = useSelector(state => state.club);
  
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchFormat, setMatchFormat] = useState('');
  
  const matchFormats = [
    'T20 (20 overs)',
    'ODI (50 overs)', 
    'Test Match (5 days)',
    'T10 (10 overs)',
    'Custom'
  ];

  const handleContinue = () => {
    if (teamA && teamB && matchFormat) {
      const newMatch = {
        team1: { id: 1, name: teamA, players: [], captain: null },
        team2: { id: 2, name: teamB, players: [], captain: null },
        format: matchFormat,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        venue: 'TBD',
        umpire: null,
        tossWinner: null,
        choosenToAction: null
      };
      
      dispatch(createNewMatch(newMatch));
      const matchId = Date.now(); // Same ID generation as in the reducer
      navigate(`/scoring/${matchId}`);
    }
  };

  return (
    <div className="start-match-container">
      <div className="start-match-content">
        {/* Header */}
        <div className="start-match-header">
          <h1 className="start-match-title">START MATCH</h1>
        </div>

        {/* Team Selection */}
        <div className="team-selection-section">
          <div className="team-input-group">
            <label className="team-label">TEAM A</label>
            <div className="team-input-container">
              <input
                type="text"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="team-input"
                placeholder="Enter Team A name"
              />
            </div>
          </div>

          <div className="vs-divider">
            <span className="vs-text">VS</span>
          </div>

          <div className="team-input-group">
            <label className="team-label">TEAM B</label>
            <div className="team-input-container">
              <input
                type="text"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="team-input"
                placeholder="Enter Team B name"
              />
            </div>
          </div>
        </div>

        {/* Match Format */}
        <div className="match-format-section">
          <label className="format-label">MATCH FORMAT</label>
          <div className="format-dropdown-container">
            <select
              value={matchFormat}
              onChange={(e) => setMatchFormat(e.target.value)}
              className="format-dropdown"
            >
              <option value="">Select</option>
              {matchFormats.map((format, index) => (
                <option key={index} value={format}>
                  {format}
                </option>
              ))}
            </select>
            <div className="dropdown-arrow">▼</div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="continue-section">
          <button 
            onClick={handleContinue}
            className="continue-btn"
            disabled={!teamA || !teamB || !matchFormat}
          >
            Continue
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <div className="nav-items">
            <Link to="/" className="nav-item">
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
              <div className="nav-label">Settings</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMatch;