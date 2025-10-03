import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import playerService from '../services/playerService';
import '../styles/figma-cricket-theme.css';
import '../styles/player-management.css';

const PlayerManagementImproved = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { playerPool } = useSelector((state) => state.club);
  
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFabOpen, setIsFabOpen] = useState(false);

  // CRUD operation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Form data for create/edit
  const [playerForm, setPlayerForm] = useState({
    name: '',
    age: '',
    role: 'all-rounder',
    battingStyle: '',
    bowlingStyle: '',
    nationality: '',
    email: ''
  });

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await playerService.getAllPlayers();
        
        if (response && response.data) {
          // Transform API data to match component expectations
          const transformedPlayers = response.data.map(player => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            role: player.role || 'Unknown',
            email: player.email || '',
            isAvailable: player.isAvailable !== false, // Default to available if not specified
            matches: player.matchesPlayed || 0,
            runs: player.totalRuns || 0,
            wickets: player.totalWickets || 0,
            battingAverage: player.battingAverage || 0,
            bowlingAverage: player.bowlingAverage || 0
          }));
          
          setPlayers(transformedPlayers);
        } else {
          setPlayers([]);
        }
      } catch (err) {
        console.error('Failed to fetch players:', err);
        setError('Failed to load players. Please try again.');
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Use API data as primary, fallback to Redux store if needed
  const displayPlayers = players.length > 0 ? players : 
    (playerPool && playerPool.length > 0 ? 
      playerPool.map(player => ({
        ...player,
        matches: Math.floor(Math.random() * 20) + 5,
        runs: Math.floor(Math.random() * 1000) + 100,
        wickets: Math.floor(Math.random() * 15)
      })) : []);

  // Filter players
  const filteredPlayers = displayPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || player.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && player.isAvailable) ||
                         (filterStatus === 'assigned' && !player.isAvailable);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // CRUD Operations
  const handleCreatePlayer = async () => {
    try {
      setOperationLoading(true);
      const playerData = {
        name: playerForm.name,
        age: playerForm.age ? parseInt(playerForm.age) : null,
        role: playerForm.role,
        battingStyle: playerForm.battingStyle || null,
        bowlingStyle: playerForm.bowlingStyle || null,
        nationality: playerForm.nationality || null,
        email: playerForm.email || null
      };

      const response = await playerService.createPlayer(playerData);

      if (response && response.data) {
        // Refresh players list
        const updatedResponse = await playerService.getAllPlayers();
        if (updatedResponse && updatedResponse.data) {
          const transformedPlayers = updatedResponse.data.map(player => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            role: player.role || 'Unknown',
            email: player.email || '',
            isAvailable: player.isAvailable !== false,
            matches: player.matchesPlayed || 0,
            runs: player.totalRuns || 0,
            wickets: player.totalWickets || 0,
            battingAverage: player.battingAverage || 0,
            bowlingAverage: player.bowlingAverage || 0
          }));
          setPlayers(transformedPlayers);
        }

        // Reset form and close modal
        setPlayerForm({
          name: '',
          age: '',
          role: 'all-rounder',
          battingStyle: '',
          bowlingStyle: '',
          nationality: '',
          email: ''
        });
        setShowCreateModal(false);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to create player:', err);
      setError('Failed to create player. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditPlayer = async () => {
    if (!selectedPlayer) return;

    try {
      setOperationLoading(true);
      const playerData = {
        name: playerForm.name,
        age: playerForm.age ? parseInt(playerForm.age) : null,
        role: playerForm.role,
        battingStyle: playerForm.battingStyle || null,
        bowlingStyle: playerForm.bowlingStyle || null,
        nationality: playerForm.nationality || null,
        email: playerForm.email || null
      };

      const response = await playerService.updatePlayer(selectedPlayer.id, playerData);

      if (response && response.data) {
        // Refresh players list
        const updatedResponse = await playerService.getAllPlayers();
        if (updatedResponse && updatedResponse.data) {
          const transformedPlayers = updatedResponse.data.map(player => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            role: player.role || 'Unknown',
            email: player.email || '',
            isAvailable: player.isAvailable !== false,
            matches: player.matchesPlayed || 0,
            runs: player.totalRuns || 0,
            wickets: player.totalWickets || 0,
            battingAverage: player.battingAverage || 0,
            bowlingAverage: player.bowlingAverage || 0
          }));
          setPlayers(transformedPlayers);
        }

        // Reset form and close modal
        setPlayerForm({
          name: '',
          age: '',
          role: 'all-rounder',
          battingStyle: '',
          bowlingStyle: '',
          nationality: '',
          email: ''
        });
        setShowEditModal(false);
        setSelectedPlayer(null);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to update player:', err);
      setError('Failed to update player. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      setOperationLoading(true);
      await playerService.deletePlayer(selectedPlayer.id);

      // Refresh players list
      const updatedResponse = await playerService.getAllPlayers();
      if (updatedResponse && updatedResponse.data) {
        const transformedPlayers = updatedResponse.data.map(player => ({
          id: player.id,
          name: player.name || 'Unknown Player',
          role: player.role || 'Unknown',
          email: player.email || '',
          isAvailable: player.isAvailable !== false,
          matches: player.matchesPlayed || 0,
          runs: player.totalRuns || 0,
          wickets: player.totalWickets || 0,
          battingAverage: player.battingAverage || 0,
          bowlingAverage: player.bowlingAverage || 0
        }));
        setPlayers(transformedPlayers);
      }

      setShowDeleteModal(false);
      setSelectedPlayer(null);
      setError(null);
    } catch (err) {
      console.error('Failed to delete player:', err);
      setError('Failed to delete player. Please try again.');
    } finally {
      setOperationLoading(false);
    }
  };

  const openEditModal = (player) => {
    setSelectedPlayer(player);
    setPlayerForm({
      name: player.name || '',
      age: player.age || '',
      role: player.role || 'all-rounder',
      battingStyle: player.battingStyle || '',
      bowlingStyle: player.bowlingStyle || '',
      nationality: player.nationality || '',
      email: player.email || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (player) => {
    setSelectedPlayer(player);
    setShowDeleteModal(true);
  };

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
    <div className={`figma-cricket-app app-theme ${isDarkMode ? 'dark' : 'light'}`} role="main">
      
      {/* Header */}
      <header className="figma-header">
        <div className="figma-header-left">
          <button onClick={() => navigate('/')} className="figma-back-button" aria-label="Go back to home">
            <span className="figma-back-icon">‹</span>
          </button>
          <div className="figma-logo-container">
            <span className="figma-logo-icon" role="img" aria-label="Players">👥</span>
            <h1 className="figma-title">Player Management</h1>
          </div>
        </div>
        <div className="figma-header-right">
          <button 
            className="figma-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDarkMode}
          >
            <div className="figma-toggle-icon">
              {isDarkMode ? '☀️' : '🌙'}
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="figma-main-layout">

        {/* Search and Filter Section */}
        <section className="figma-search-section">
          <div className="figma-search-container">
            <span className="figma-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search players by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="figma-search-input"
              aria-label="Search players"
            />
          </div>
          
          <div className="figma-filter-row">
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)} 
              className="figma-filter-select"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
              <option value="Wicket-keeper">Wicket Keeper</option>
            </select>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="figma-filter-select"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
            </select>
          </div>
        </section>

        {/* Players List */}
        <section className="figma-players-section" aria-labelledby="players-heading">
          <div className="figma-card-header">
            <span className="figma-card-icon" role="img" aria-label="Players">👥</span>
            <h3 id="players-heading" className="figma-card-title">
              Players ({loading ? '...' : filteredPlayers.length})
            </h3>
          </div>
          
          {loading && (
            <div className="figma-loading-state">
              <div className="figma-loading-spinner">⏳</div>
              <p>Loading players...</p>
            </div>
          )}
          
          {error && (
            <div className="figma-error-state">
              <div className="figma-error-icon">❌</div>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="figma-retry-button"
              >
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <>
              <div className="figma-stats-summary">
                <div className="figma-summary-item">
                  <span className="figma-summary-label">Available:</span>
                  <span className="figma-summary-value">{filteredPlayers.filter(p => p.isAvailable).length}</span>
                </div>
                <div className="figma-summary-item">
                  <span className="figma-summary-label">Assigned:</span>
                  <span className="figma-summary-value">{filteredPlayers.filter(p => !p.isAvailable).length}</span>
                </div>
              </div>

              {filteredPlayers.length > 0 ? (
            <div className="figma-players-list">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="figma-player-card">
                  <div className="figma-player-header">
                    <div className="figma-player-avatar">
                      <span className="figma-avatar-icon">👤</span>
                    </div>
                    <div className="figma-player-info">
                      <h4 className="figma-player-name">{player.name}</h4>
                      <p className="figma-player-role">{player.role}</p>
                      <p className="figma-player-email">{player.email}</p>
                    </div>
                    <div className="figma-player-status">
                      <span className={`figma-status-badge ${player.isAvailable ? 'available' : 'assigned'}`}>
                        {player.isAvailable ? 'Available' : 'Assigned'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="figma-player-stats">
                    <div className="figma-player-stat">
                      <div className="figma-stat-value">{player.matches}</div>
                      <div className="figma-stat-label">Matches</div>
                    </div>
                    <div className="figma-player-stat">
                      <div className="figma-stat-value">{player.runs}</div>
                      <div className="figma-stat-label">Runs</div>
                    </div>
                    <div className="figma-player-stat">
                      <div className="figma-stat-value">{player.wickets}</div>
                      <div className="figma-stat-label">Wickets</div>
                    </div>
                    <div className="figma-player-stat">
                      <div className="figma-stat-value">{player.runs > 0 ? (player.runs / player.matches).toFixed(1) : '0.0'}</div>
                      <div className="figma-stat-label">Avg</div>
                    </div>
                  </div>

                  <div className="figma-player-actions">
                    <Link
                      to={`/player/${player.id}`}
                      className="figma-player-action-btn"
                      aria-label={`View ${player.name}'s profile`}
                    >
                      <span>👁️</span>
                      <span>View</span>
                    </Link>
                    <button
                      className="figma-player-action-btn edit"
                      onClick={() => openEditModal(player)}
                      aria-label={`Edit ${player.name}'s details`}
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                    <button
                      className="figma-player-action-btn delete"
                      onClick={() => openDeleteModal(player)}
                      aria-label={`Delete ${player.name}`}
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="figma-empty-state">
              <div className="figma-empty-icon">👥</div>
              <div className="figma-empty-text">
                <h4>No players found</h4>
                <p>Try adjusting your search or filters</p>
              </div>
            </div>
          )}
            </>
          )}
        </section>

      </div>

      {/* Bottom Navigation */}
      <nav className="figma-bottom-nav" role="navigation" aria-label="Main navigation">
        <div className="figma-nav-items">
          <Link to="/" className="figma-nav-item">
            <div className="figma-nav-icon" role="img" aria-hidden="true">🏠</div>
            <div className="figma-nav-label">Home</div>
          </Link>
          <Link to="/news" className="figma-nav-item">
            <div className="figma-nav-icon" role="img" aria-hidden="true">📰</div>
            <div className="figma-nav-label">News</div>
          </Link>
          <Link to="/match-management" className="figma-nav-item">
            <div className="figma-nav-icon" role="img" aria-hidden="true">📊</div>
            <div className="figma-nav-label">Matches</div>
          </Link>
          <Link to="/player-management" className="figma-nav-item active" aria-current="page">
            <div className="figma-nav-icon" role="img" aria-hidden="true">👤</div>
            <div className="figma-nav-label">Players</div>
          </Link>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className={`figma-fab-container ${isFabOpen ? 'open' : ''}`}>
        <button 
          className="figma-fab-main"
          onClick={() => setIsFabOpen(!isFabOpen)}
          aria-expanded={isFabOpen}
          aria-label="Quick actions menu"
        >
          <span className="figma-fab-icon">
            {isFabOpen ? '✕' : '⚡'}
          </span>
        </button>
        
        {isFabOpen && (
          <div className="figma-fab-menu" role="menu">
            <button
              className="figma-fab-option"
              role="menuitem"
              onClick={() => {
                setShowCreateModal(true);
                setIsFabOpen(false);
              }}
            >
              <span className="figma-fab-option-icon">👤</span>
              <span className="figma-fab-option-label">Add Player</span>
            </button>
            <Link
              to="/waiting-list"
              className="figma-fab-option"
              role="menuitem"
              onClick={() => setIsFabOpen(false)}
            >
              <span className="figma-fab-option-icon">📋</span>
              <span className="figma-fab-option-label">Waiting List</span>
            </Link>
          </div>
        )}
      </div>
      
      {isFabOpen && (
        <div 
          className="figma-fab-overlay" 
          onClick={() => setIsFabOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Create Player Modal */}
      {showCreateModal && (
        <div className="figma-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="figma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="figma-modal-header">
              <h3>Add New Player</h3>
              <button
                className="figma-modal-close"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="figma-modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleCreatePlayer(); }}>
                <div className="figma-form-group">
                  <label htmlFor="player-name">Name *</label>
                  <input
                    id="player-name"
                    type="text"
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({...playerForm, name: e.target.value})}
                    required
                    placeholder="Enter player name"
                  />
                </div>
                <div className="figma-form-group">
                  <label htmlFor="player-age">Age</label>
                  <input
                    id="player-age"
                    type="number"
                    value={playerForm.age}
                    onChange={(e) => setPlayerForm({...playerForm, age: e.target.value})}
                    placeholder="Enter age"
                  />
                </div>
                <div className="figma-form-group">
                  <label htmlFor="player-role">Role</label>
                  <select
                    id="player-role"
                    value={playerForm.role}
                    onChange={(e) => setPlayerForm({...playerForm, role: e.target.value})}
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="all-rounder">All-rounder</option>
                    <option value="wicket-keeper">Wicket Keeper</option>
                  </select>
                </div>
                <div className="figma-form-group">
                  <label htmlFor="player-email">Email</label>
                  <input
                    id="player-email"
                    type="email"
                    value={playerForm.email}
                    onChange={(e) => setPlayerForm({...playerForm, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="figma-form-group">
                  <label htmlFor="player-nationality">Nationality</label>
                  <input
                    id="player-nationality"
                    type="text"
                    value={playerForm.nationality}
                    onChange={(e) => setPlayerForm({...playerForm, nationality: e.target.value})}
                    placeholder="Enter nationality"
                  />
                </div>
                <div className="figma-modal-actions">
                  <button
                    type="button"
                    className="figma-btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={operationLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="figma-btn-primary"
                    disabled={operationLoading || !playerForm.name.trim()}
                  >
                    {operationLoading ? 'Creating...' : 'Create Player'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {showEditModal && selectedPlayer && (
        <div className="figma-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="figma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="figma-modal-header">
              <h3>Edit Player</h3>
              <button
                className="figma-modal-close"
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="figma-modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleEditPlayer(); }}>
                <div className="figma-form-group">
                  <label htmlFor="edit-player-name">Name *</label>
                  <input
                    id="edit-player-name"
                    type="text"
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({...playerForm, name: e.target.value})}
                    required
                    placeholder="Enter player name"
                  />
                </div>
                <div className="figma-form-group">
                  <label htmlFor="edit-player-age">Age</label>
                  <input
                    id="edit-player-age"
                    type="number"
                    value={playerForm.age}
                    onChange={(e) => setPlayerForm({...playerForm, age: e.target.value})}
                    placeholder="Enter age"
                  />
                </div>
                <div className="figma-form-group">
                  <label htmlFor="edit-player-role">Role</label>
                  <select
                    id="edit-player-role"
                    value={playerForm.role}
                    onChange={(e) => setPlayerForm({...playerForm, role: e.target.value})}
                  >
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="all-rounder">All-rounder</option>
                    <option value="wicket-keeper">Wicket Keeper</option>
                  </select>
                </div>
                <div className="figma-form-group">
                  <label htmlFor="edit-player-email">Email</label>
                  <input
                    id="edit-player-email"
                    type="email"
                    value={playerForm.email}
                    onChange={(e) => setPlayerForm({...playerForm, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="figma-form-group">
                  <label htmlFor="edit-player-nationality">Nationality</label>
                  <input
                    id="edit-player-nationality"
                    type="text"
                    value={playerForm.nationality}
                    onChange={(e) => setPlayerForm({...playerForm, nationality: e.target.value})}
                    placeholder="Enter nationality"
                  />
                </div>
                <div className="figma-modal-actions">
                  <button
                    type="button"
                    className="figma-btn-secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={operationLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="figma-btn-primary"
                    disabled={operationLoading || !playerForm.name.trim()}
                  >
                    {operationLoading ? 'Updating...' : 'Update Player'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Player Modal */}
      {showDeleteModal && selectedPlayer && (
        <div className="figma-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="figma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="figma-modal-header">
              <h3>Delete Player</h3>
              <button
                className="figma-modal-close"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="figma-modal-body">
              <div className="figma-delete-confirmation">
                <div className="figma-delete-icon">⚠️</div>
                <p>Are you sure you want to delete <strong>{selectedPlayer.name}</strong>?</p>
                <p className="figma-delete-warning">This action cannot be undone. The player will be deactivated but their match history will be preserved.</p>
              </div>
              <div className="figma-modal-actions">
                <button
                  type="button"
                  className="figma-btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={operationLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="figma-btn-danger"
                  onClick={handleDeletePlayer}
                  disabled={operationLoading}
                >
                  {operationLoading ? 'Deleting...' : 'Delete Player'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManagementImproved;
