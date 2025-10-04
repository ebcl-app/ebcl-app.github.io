import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/figma-cricket-theme.css';

const WaitingList = () => {
  const [waitingPlayers] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      status: 'waiting for placement',
      avatar: '👤',
      joinedDate: '2 days ago'
    },
    {
      id: 2,
      name: 'John Doe',
      status: 'Recently added to Team A',
      avatar: '👤',
      joinedDate: '1 day ago'
    },
    {
      id: 3,
      name: 'Maria Gonzalez',
      status: 'waiting for placement',
      avatar: '👤',
      joinedDate: '3 hours ago'
    }
  ]);

  const [statusUpdates] = useState([
    'John Doe has been added to Team A.',
    'Maria Gonzalez is still waiting for placement.',
    "Sarah Chen's status is unchanged."
  ]);

  const removePlayer = (playerId) => {
    // Remove player logic here
    console.log('Removing player:', playerId);
  };

  const addPlayer = () => {
    // Add new player logic here
    console.log('Adding new player');
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

      {/* Waiting List */}
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="card-header">
            <div className="waiting-list-header">
              <span className="waiting-icon">📋</span>
              <span className="waiting-title">Waiting List</span>
            </div>
            <button className="add-player-btn" onClick={addPlayer}>
              Add Player
            </button>
          </div>

          {/* Players Waiting */}
          <div className="players-waiting-section">
            <h3 className="section-title">Players Waiting</h3>
            
            <div className="waiting-players-list">
              {waitingPlayers.map(player => (
                <div key={player.id} className="waiting-player-item">
                  <div className="player-info">
                    <div className="player-avatar">{player.avatar}</div>
                    <div className="player-details">
                      <div className="player-name">{player.name}</div>
                      <div className="player-status">{player.status}</div>
                    </div>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removePlayer(player.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status Updates */}
          <div className="status-updates-section">
            <h3 className="section-title">Status Updates</h3>
            
            <div className="status-updates-list">
              {statusUpdates.map((update, index) => (
                <div key={index} className="status-update-item">
                  <div className="update-dot"></div>
                  <div className="update-text">{update}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bottom-nav">
            <div className="nav-item">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Home</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">👥</span>
              <span className="nav-label">Team</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">📊</span>
              <span className="nav-label">Matches</span>
            </div>
            <div className="nav-item active">
              <span className="nav-icon">📋</span>
              <span className="nav-label">Waiting list</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingList;