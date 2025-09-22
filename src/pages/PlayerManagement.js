import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/common.css';
import '../styles/cricket.css';
import '../styles/player.css';

const PlayerManagement = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { playerPool } = useSelector((state) => state.club);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Sample players data with stats
  const samplePlayers = [
    { id: 1, name: 'Virat Kohli', role: 'Batsman', email: 'virat@cricket.com', isAvailable: true, matches: 15, runs: 850, wickets: 2 },
    { id: 2, name: 'Jasprit Bumrah', role: 'Bowler', email: 'bumrah@cricket.com', isAvailable: false, matches: 12, runs: 45, wickets: 28 },
    { id: 3, name: 'MS Dhoni', role: 'Wicket-keeper', email: 'dhoni@cricket.com', isAvailable: true, matches: 20, runs: 1200, wickets: 0 },
    { id: 4, name: 'Hardik Pandya', role: 'All-Rounder', email: 'hardik@cricket.com', isAvailable: true, matches: 18, runs: 750, wickets: 15 },
    { id: 5, name: 'Rohit Sharma', role: 'Batsman', email: 'rohit@cricket.com', isAvailable: false, matches: 22, runs: 1450, wickets: 1 }
  ];

  // Use existing playerPool data, or fallback to sample data
  const displayPlayers = playerPool && playerPool.length > 0 ? 
    playerPool.map(player => ({
      ...player,
      matches: Math.floor(Math.random() * 20) + 5, // Random stats for demo
      runs: Math.floor(Math.random() * 1000) + 100,
      wickets: Math.floor(Math.random() * 15)
    })) : samplePlayers;

  // Filter players based on search and filters
  const filteredPlayers = displayPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || player.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && player.isAvailable) ||
                         (filterStatus === 'assigned' && !player.isAvailable);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Close FAB on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFabOpen) {
        setIsFabOpen(false);
      }
    };

    if (isFabOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFabOpen]);

  return (
    <div className={`dashboard-container app-theme ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="dashboard-content">
        {/* Header with Theme Toggle and Back Navigation */}
        <div className="dashboard-header">
          <div className="app-title-section">
            <div className="app-logo">
              <button onClick={() => navigate('/')} className="logo-button">
                <span className="logo-icon">🏏</span>
              </button>
            </div>
            <div className="title-content">
              <h1 className="dashboard-title">Player Management</h1>
              <div className="title-subtitle">Manage Cricket Players</div>
            </div>
          </div>
          <div className="theme-toggle-section">
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-wrapper">
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)} 
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Wicket Keeper">Wicket Keeper</option>
            </select>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
            </select>
          </div>
        </div>

        {/* Players Section */}
        <div className="recent-matches-section">
          <div className="section-header">
            <h2 className="section-title">PLAYERS ({filteredPlayers.length})</h2>
            <div className="section-controls">
              <div className="match-counter">
                Available: {filteredPlayers.filter(p => p.isAvailable).length}
              </div>
              <button className="refresh-btn">
                <span>🔄</span>
              </button>
            </div>
          </div>
          
          <div className="players-list">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="player-card-simple">
                <div className="player-main-info">
                  <div className="player-avatar-section">
                    <div className="player-avatar">
                      <span className="avatar-icon">👤</span>
                    </div>
                    <div className="player-basic-info">
                      <h3 className="player-name">{player.name}</h3>
                      <p className="player-role">{player.role}</p>
                      <p className="player-email">{player.email}</p>
                    </div>
                  </div>
                  
                  <div className="player-status-section">
                    <div className={`status-pill ${player.isAvailable ? 'available' : 'assigned'}`}>
                      {player.isAvailable ? 'AVAILABLE' : 'ASSIGNED'}
                    </div>
                  </div>
                </div>
                
                <div className="player-stats-row">
                  <div className="stat-box">
                    <span className="stat-number">{player.matches || 0}</span>
                    <span className="stat-label">Matches</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number">{player.runs || 0}</span>
                    <span className="stat-label">Runs</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-number">{player.wickets || 0}</span>
                    <span className="stat-label">Wickets</span>
                  </div>
                </div>
                
                <div className="player-actions-row">
                  <button className="action-btn-simple edit">
                    <span>✏️</span> Edit
                  </button>
                  <button className="action-btn-simple delete">
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        <div className={`fab-container ${isFabOpen ? 'fab-open' : ''}`}>
          {isFabOpen && (
            <div 
              className="fab-overlay" 
              onClick={() => setIsFabOpen(false)}
            />
          )}
          
          <div className="fab-menu">
            <button 
              className="fab-menu-item fab-item-1"
              onClick={() => {
                setIsFabOpen(false);
                // Add player logic here
              }}
            >
              <div className="fab-item-icon">👤</div>
              <span className="fab-item-label">Add Player</span>
            </button>
            
            <Link 
              to="/team-management" 
              className="fab-menu-item fab-item-2"
              onClick={() => setIsFabOpen(false)}
            >
              <div className="fab-item-icon">👥</div>
              <span className="fab-item-label">Manage Teams</span>
            </Link>
            
            <Link 
              to="/match-management" 
              className="fab-menu-item fab-item-3"
              onClick={() => setIsFabOpen(false)}
            >
              <div className="fab-item-icon">🏏</div>
              <span className="fab-item-label">Manage Matches</span>
            </Link>
          </div>
          
          <button 
            className="fab-button"
            onClick={() => setIsFabOpen(!isFabOpen)}
            aria-label="Quick Actions"
          >
            <span className={`fab-icon ${isFabOpen ? 'fab-icon-close' : ''}`}>
              {isFabOpen ? '✕' : '⚙️'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerManagement;
