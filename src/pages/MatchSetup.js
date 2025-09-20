import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/cricket.css';

const MatchSetup = () => {
  const [matchData, setMatchData] = useState({
    matchDate: '',
    teamA: '',
    teamB: '',
    location: ''
  });

  const handleInputChange = (field, value) => {
    setMatchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = () => {
    console.log('Match registered:', matchData);
    // Add match registration logic here
  };

  return (
    <div>
      {/* Back Button */}
      <div className="back-button-container">
        <Link to="/" className="back-button">
          <span className="back-arrow">‹</span>
          Back to Home
        </Link>
      </div>

      {/* Match Registration */}
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">CricketScoreMaster</h2>
            <div className="menu-icon">☰</div>
          </div>

          <h3 className="section-title">Register Match</h3>

          <div className="registration-form">
            <div className="form-group">
              <label className="form-label">Match Date</label>
              <input
                type="date"
                className="form-input"
                value={matchData.matchDate}
                onChange={(e) => handleInputChange('matchDate', e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Team A</label>
              <input
                type="text"
                className="form-input"
                value={matchData.teamA}
                onChange={(e) => handleInputChange('teamA', e.target.value)}
                placeholder="Enter Team A Name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Team B</label>
              <input
                type="text"
                className="form-input"
                value={matchData.teamB}
                onChange={(e) => handleInputChange('teamB', e.target.value)}
                placeholder="Enter Team B Name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={matchData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter Location"
              />
            </div>

            <button 
              className="confirm-registration-btn"
              onClick={handleRegister}
            >
              Confirm Registration
            </button>
          </div>

          <div className="footer-text">© 2023 CricketScoreMaster</div>
        </div>
      </div>
    </div>
  );
};

export default MatchSetup;
