import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addPlayerToPool, selectCurrentClub, selectPlayerPool } from '../store/slices/clubSlice';
import '../styles/cricket.css';

const PlayerRegistration = () => {
  const dispatch = useDispatch();
  const currentClub = useSelector(selectCurrentClub);
  const playerPool = useSelector(selectPlayerPool);
  
  const [playerData, setPlayerData] = useState({
    name: '',
    role: 'Batsman',
    experience: 'Beginner',
    contactNumber: '',
    email: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlayerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (playerData.name.trim() && playerData.contactNumber.trim()) {
      dispatch(addPlayerToPool(playerData));
      
      // Reset form
      setPlayerData({
        name: '',
        role: 'Batsman',
        experience: 'Beginner',
        contactNumber: '',
        email: ''
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="home-page-container">
      <div className="home-container">
        {/* Header */}
        <div className="home-header">
          <div className="header-left">
            <span className="brand-icon">🏏</span>
            <h1 className="app-title">Ecolife Box Cricket</h1>
          </div>
          <div className="header-right">
            <span className="user-id">User ID: a1b2c3d4e5f6</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="page-navigation">
          <Link to="/" className="nav-link">
            ← Back to Home
          </Link>
          <div className="breadcrumb">
            <span className="breadcrumb-item">🏏 {currentClub.name}</span>
            <span className="breadcrumb-item active">Player Registration</span>
          </div>
        </div>

        {/* Main Title Section */}
        <div className="main-title-section">
          <h2 className="main-title">👥 Player Registration</h2>
          <p className="main-subtitle">Join {currentClub.name} and become part of our cricket community</p>
        </div>

        {/* Club Info */}
        <div className="club-info-section">
          <div className="club-card">
            <div className="club-header">
              <span className="club-icon">🏏</span>
              <div className="club-details">
                <h3 className="club-name">{currentClub.name}</h3>
                <p className="club-location">📍 {currentClub.location}</p>
                <p className="club-established">🗓️ Established {currentClub.established}</p>
              </div>
            </div>
            <div className="club-stats">
              <div className="stat-item">
                <span className="stat-number">{playerPool.length}</span>
                <span className="stat-label">Registered Players</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{playerPool.filter(p => p.isAvailable).length}</span>
                <span className="stat-label">Available Players</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <span className="success-text">Player registered successfully! Welcome to {currentClub.name}!</span>
          </div>
        )}

        {/* Registration Form */}
        <div className="form-section">
          <div className="form-card">
            <h3 className="form-title">👤 Player Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    value={playerData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactNumber" className="form-label">Contact Number *</label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    className="form-input"
                    value={playerData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+91-9876543210"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={playerData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="experience" className="form-label">Experience Level</label>
                  <select
                    id="experience"
                    name="experience"
                    className="form-select"
                    value={playerData.experience}
                    onChange={handleInputChange}
                  >
                    <option value="Beginner">🌱 Beginner</option>
                    <option value="Intermediate">⚡ Intermediate</option>
                    <option value="Advanced">🏆 Advanced</option>
                    <option value="Professional">👑 Professional</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Preferred Playing Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={playerData.role}
                  onChange={handleInputChange}
                >
                  <option value="Batsman">🏏 Batsman</option>
                  <option value="Bowler">⚾ Bowler</option>
                  <option value="All-rounder">🌟 All-rounder</option>
                  <option value="Wicket Keeper">🥅 Wicket Keeper</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="form-btn primary">
                  ✓ Register Player
                </button>
                <Link to="/team-management" className="form-btn secondary">
                  👥 View Player Pool
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Recent Registrations */}
        {playerPool.length > 0 && (
          <div className="recent-players-section">
            <h3 className="section-title">🆕 Recent Registrations</h3>
            <div className="recent-players-list">
              {playerPool
                .sort((a, b) => new Date(b.dateJoined) - new Date(a.dateJoined))
                .slice(0, 5)
                .map(player => (
                  <div key={player.id} className="recent-player-card">
                    <div className="player-avatar">
                      <span className="avatar-text">{player.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="player-info">
                      <h4 className="player-name">{player.name}</h4>
                      <span className="player-role">{player.role}</span>
                      <span className="player-experience">{player.experience}</span>
                    </div>
                    <div className="player-status">
                      {player.isAvailable ? (
                        <span className="status-badge available">Available</span>
                      ) : (
                        <span className="status-badge assigned">In Team</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerRegistration;