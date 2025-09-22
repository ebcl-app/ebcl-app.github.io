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
    <div className="dashboard-container page-fade-in">
      <div className="dashboard-content">
        {/* Enhanced Header with consistent styling */}
        <div className="dashboard-header">
          <div className="app-title-section">
            <Link to="/" className="back-btn enhanced-back-btn">
              🏏
            </Link>
            <div className="title-content">
              <h1 className="dashboard-title">Match Setup</h1>
              <div className="title-subtitle">Create New Match</div>
            </div>
          </div>
        </div>

        {/* Enhanced Match Registration Form */}
        <div className="enhanced-card-grid">
          <div className="enhanced-card">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <h3 className="card-title">Match Details</h3>
              
              <div className="enhanced-form-grid">
                <div className="form-group">
                  <label className="enhanced-form-label">
                    <span className="label-icon">📅</span>
                    <span className="label-text">Match Date</span>
                  </label>
                  <input
                    type="date"
                    className="enhanced-form-input"
                    value={matchData.matchDate}
                    onChange={(e) => handleInputChange('matchDate', e.target.value)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                <div className="form-group">
                  <label className="enhanced-form-label">
                    <span className="label-icon">👕</span>
                    <span className="label-text">Team A</span>
                  </label>
                  <input
                    type="text"
                    className="enhanced-form-input"
                    value={matchData.teamA}
                    onChange={(e) => handleInputChange('teamA', e.target.value)}
                    placeholder="Enter Team A Name"
                  />
                </div>

                <div className="form-group">
                  <label className="enhanced-form-label">
                    <span className="label-icon">👔</span>
                    <span className="label-text">Team B</span>
                  </label>
                  <input
                    type="text"
                    className="enhanced-form-input"
                    value={matchData.teamB}
                    onChange={(e) => handleInputChange('teamB', e.target.value)}
                    placeholder="Enter Team B Name"
                  />
                </div>

                <div className="form-group">
                  <label className="enhanced-form-label">
                    <span className="label-icon">🏟️</span>
                    <span className="label-text">Location</span>
                  </label>
                  <input
                    type="text"
                    className="enhanced-form-input"
                    value={matchData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter Location"
                  />
                </div>

                <button 
                  className="enhanced-cta-btn"
                  onClick={handleRegister}
                >
                  <span className="cta-icon">✅</span>
                  <span className="cta-text">Confirm Registration</span>
                  <span className="cta-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchSetup;
