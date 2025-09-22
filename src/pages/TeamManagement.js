import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { 
  addTeam, 
  updateTeam,
  assignPlayerToTeam, 
  setCaptain, 
  removePlayerFromTeam, 
  deleteTeam 
} from '../store/slices/clubSlice';
import '../styles/common.css';
import '../styles/team-management.css';

function TeamManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  // Component state
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [newTeamForm, setNewTeamForm] = useState({
    name: '',
    jerseyColor: '#3498db',
    description: ''
  });
  const [editTeamForm, setEditTeamForm] = useState({
    name: '',
    jerseyColor: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByReadiness, setFilterByReadiness] = useState('all');
  
  // Get club data from Redux store
  const { teams, playerPool } = useSelector(state => state.club);
  
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
  
  // Get available players (not assigned to any team)
  const availablePlayers = playerPool?.filter(player => 
    !teams?.some(team => team.players?.includes(player.id))
  ) || [];
  
  // Helper function to get player details
  const getPlayerDetails = (playerId) => {
    return playerPool?.find(player => player.id === playerId);
  };

  // Get team performance stats (mock data)
  const getTeamStats = (team) => {
    const mockStats = {
      totalMatches: Math.floor(Math.random() * 20) + 5,
      wins: Math.floor(Math.random() * 15) + 2,
      losses: Math.floor(Math.random() * 10) + 1,
      draws: Math.floor(Math.random() * 3)
    };
    mockStats.winRate = mockStats.totalMatches > 0 
      ? ((mockStats.wins / mockStats.totalMatches) * 100).toFixed(1)
      : 0;
    return mockStats;
  };

  // Get top performers for a team (mock data)
  const getTopPerformers = (team) => {
    if (!team.players || team.players.length === 0) return null;
    const teamPlayers = team.players.map(playerId => getPlayerDetails(playerId)).filter(Boolean);
    if (teamPlayers.length === 0) return null;
    
    const playersWithStats = teamPlayers.map(player => ({
      ...player,
      runs: Math.floor(Math.random() * 500) + 100,
      strikeRate: (Math.random() * 50 + 100).toFixed(1),
      wickets: Math.floor(Math.random() * 20) + 2,
      economy: (Math.random() * 3 + 4).toFixed(1)
    }));
    
    const topBatsman = playersWithStats.reduce((prev, current) => 
      (prev.runs > current.runs) ? prev : current
    );
    const topBowler = playersWithStats.reduce((prev, current) => 
      (prev.wickets > current.wickets) ? prev : current
    );
    
    return { topBatsman, topBowler };
  };

  // Filter teams based on search and readiness
  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    return teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterByReadiness === 'ready') {
        return matchesSearch && (team.players?.length >= 11);
      } else if (filterByReadiness === 'incomplete') {
        return matchesSearch && (team.players?.length < 11);
      }
      return matchesSearch;
    });
  }, [teams, searchTerm, filterByReadiness]);

  // Get team statistics
  const teamStats = useMemo(() => {
    const totalTeams = teams?.length || 0;
    const readyTeams = teams?.filter(team => team.players?.length >= 11).length || 0;
    const totalWins = teams?.reduce((acc, team) => acc + getTeamStats(team).wins, 0) || 0;
    
    return {
      total: totalTeams,
      ready: readyTeams,
      incomplete: totalTeams - readyTeams,
      availablePlayers: availablePlayers.length,
      totalWins
    };
  }, [teams, availablePlayers]);
  
  // Event handlers
  const handleCreateTeam = () => {
    if (newTeamForm.name.trim()) {
      const newTeam = {
        id: Date.now(),
        name: newTeamForm.name.trim(),
        players: [],
        captainId: null,
        jerseyColor: newTeamForm.jerseyColor,
        description: newTeamForm.description,
        createdAt: new Date().toISOString()
      };
      dispatch(addTeam(newTeam));
      setNewTeamForm({ name: '', jerseyColor: '#3498db', description: '' });
      setIsCreateTeamModalOpen(false);
    }
  };
  
  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setEditTeamForm({
      name: team.name,
      jerseyColor: team.jerseyColor || '#3498db',
      description: team.description || ''
    });
    setIsEditTeamModalOpen(true);
  };
  
  const handleUpdateTeam = () => {
    if (selectedTeam && editTeamForm.name.trim()) {
      const updatedTeam = {
        ...selectedTeam,
        name: editTeamForm.name.trim(),
        jerseyColor: editTeamForm.jerseyColor,
        description: editTeamForm.description
      };
      dispatch(updateTeam(updatedTeam));
      setIsEditTeamModalOpen(false);
      setSelectedTeam(null);
      setEditTeamForm({ name: '', jerseyColor: '', description: '' });
    }
  };
  
  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      dispatch(deleteTeam(teamId));
    }
  };
  
  const handleAssignPlayer = (teamId, playerId) => {
    dispatch(assignPlayerToTeam({ teamId, playerId }));
  };
  
  const openPlayerModal = (teamId) => {
    setSelectedTeamId(teamId);
    setIsPlayerModalOpen(true);
  };
  
  return (
    <div className={`dashboard-container app-theme ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="dashboard-content">
        {/* Header Section */}
        <div className="dashboard-header">
                    <div className="app-title-section">
            <div className="app-logo">
              <span className="logo-icon">👥</span>
            </div>
            <div className="title-content">
              <h1 className="dashboard-title">Team Management</h1>
              <div className="title-subtitle">Create and manage your cricket teams</div>
            </div>
          </div>
          <div className="theme-toggle-section">
            <button onClick={toggleDarkMode} className="theme-toggle-btn">
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className={`fab-container ${isFabOpen ? 'fab-open' : ''}`}>
          {/* Overlay to close FAB when clicking outside */}
          {isFabOpen && (
            <div 
              className="fab-overlay" 
              onClick={() => setIsFabOpen(false)}
            />
          )}
          
          {/* FAB Menu Items */}
          <div className="fab-menu">
            <Link 
              to="/" 
              className="fab-menu-item fab-item-1"
              onClick={() => setIsFabOpen(false)}
            >
              <div className="fab-item-icon">🏠</div>
              <span className="fab-item-label">Home Dashboard</span>
            </Link>
            
            <button 
              className="fab-menu-item fab-item-2"
              onClick={() => {
                setIsCreateTeamModalOpen(true);
                setIsFabOpen(false);
              }}
            >
              <div className="fab-item-icon">➕</div>
              <span className="fab-item-label">Create New Team</span>
            </button>
            
            <Link 
              to="/player-management" 
              className="fab-menu-item fab-item-3"
              onClick={() => setIsFabOpen(false)}
            >
              <div className="fab-item-icon">👤</div>
              <span className="fab-item-label">Manage Players</span>
            </Link>
            
            <Link 
              to="/match-management" 
              className="fab-menu-item fab-item-4"
              onClick={() => setIsFabOpen(false)}
            >
              <div className="fab-item-icon">🏆</div>
              <span className="fab-item-label">Match Management</span>
            </Link>
          </div>
          
          {/* Main FAB Button */}
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

        {/* Teams Section */}
        <div className="teams-section">
          <div className="section-header">
            <h2>Your Teams</h2>
            <div className="section-controls">
              <input
                type="text"
                placeholder="Search teams..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="filter-select"
                value={filterByReadiness}
                onChange={(e) => setFilterByReadiness(e.target.value)}
              >
                <option value="all">All Teams</option>
                <option value="ready">Ready (11+ players)</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
      </div>

      {/* Teams Display */}
      <div className="teams-container">
        {filteredTeams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏏</div>
            <h3>No teams found</h3>
            <p>
              {searchTerm || filterByReadiness !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first team to get started'
              }
            </p>
            {!searchTerm && filterByReadiness === 'all' && (
              <button 
                className="btn btn-primary"
                onClick={() => setIsCreateTeamModalOpen(true)}
              >
                Create First Team
              </button>
            )}
          </div>
        ) : (
          <div className="teams-grid">
            {filteredTeams.map(team => {
              const stats = getTeamStats(team);
              const topPerformers = getTopPerformers(team);
              const isReady = (team.players?.length >= 11);
              
              return (
                <div key={team.id} className={`team-card ${isReady ? 'ready' : ''}`}>
                  <div className="team-header">
                    <div className="team-info">
                      <div className="team-name-section">
                        <h3 className="team-name">{team.name.toUpperCase()}</h3>
                        <div 
                          className="team-jersey"
                          style={{ backgroundColor: team.jerseyColor }}
                          title={`Jersey Color: ${team.jerseyColor}`}
                        />
                      </div>
                      <div className="team-meta">
                        <span className="player-count">
                          {team.players?.length || 0}/11 players
                        </span>
                        <span className="win-rate">
                          Win Rate: {stats.winRate}%
                        </span>
                      </div>
                    </div>
                    <div className="team-status">
                      {isReady ? (
                        <span className="status-badge ready">Ready</span>
                      ) : (
                        <span className="status-badge incomplete">
                          Need {11 - (team.players?.length || 0)} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team Performance Stats */}
                  <div className="team-stats">
                    <div className="stats-row">
                      <div className="stat-item">
                        <span className="stat-value">{stats.wins}</span>
                        <span className="stat-label">Wins</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{stats.losses}</span>
                        <span className="stat-label">Losses</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{stats.draws}</span>
                        <span className="stat-label">Draws</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{stats.totalMatches}</span>
                        <span className="stat-label">Total</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Performers */}
                  {topPerformers && (
                    <div className="top-performers">
                      <h4>Top Performers</h4>
                      <div className="performers-grid">
                        <div className="performer-item">
                          <div className="performer-icon">🏏</div>
                          <div className="performer-details">
                            <span className="performer-name">{topPerformers.topBatsman.name}</span>
                            <span className="performer-stat">
                              {topPerformers.topBatsman.runs} runs • SR: {topPerformers.topBatsman.strikeRate}
                            </span>
                          </div>
                        </div>
                        <div className="performer-item">
                          <div className="performer-icon">⚡</div>
                          <div className="performer-details">
                            <span className="performer-name">{topPerformers.topBowler.name}</span>
                            <span className="performer-stat">
                              {topPerformers.topBowler.wickets} wickets • Eco: {topPerformers.topBowler.economy}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {team.description && (
                    <p className="team-description">{team.description}</p>
                  )}

                  {/* Team Actions */}
                  <div className="team-actions">
                    <button
                      className="team-action-btn edit"
                      onClick={() => handleEditTeam(team)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="team-action-btn players"
                      onClick={() => openPlayerModal(team.id)}
                      disabled={availablePlayers.length === 0}
                    >
                      👥 Manage
                    </button>
                    <button
                      className="team-action-btn stats"
                      onClick={() => navigate(`/team-details/${team.id}`)}
                    >
                      📊 Stats
                    </button>
                    <button
                      className="team-action-btn delete"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {isCreateTeamModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateTeamModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Team</h2>
              <button 
                className="modal-close"
                onClick={() => setIsCreateTeamModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={newTeamForm.name}
                  onChange={(e) => setNewTeamForm(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Jersey Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={newTeamForm.jerseyColor}
                    onChange={(e) => setNewTeamForm(prev => ({ ...prev, jerseyColor: e.target.value }))}
                  />
                  <input
                    type="text"
                    value={newTeamForm.jerseyColor}
                    onChange={(e) => setNewTeamForm(prev => ({ ...prev, jerseyColor: e.target.value }))}
                    placeholder="#3498db"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  placeholder="Team description"
                  value={newTeamForm.description}
                  onChange={(e) => setNewTeamForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setIsCreateTeamModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateTeam}
                disabled={!newTeamForm.name.trim()}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {isEditTeamModalOpen && selectedTeam && (
        <div className="modal-overlay" onClick={() => setIsEditTeamModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Team</h2>
              <button 
                className="modal-close"
                onClick={() => setIsEditTeamModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="Enter team name"
                  value={editTeamForm.name}
                  onChange={(e) => setEditTeamForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Jersey Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={editTeamForm.jerseyColor}
                    onChange={(e) => setEditTeamForm(prev => ({ ...prev, jerseyColor: e.target.value }))}
                  />
                  <input
                    type="text"
                    value={editTeamForm.jerseyColor}
                    onChange={(e) => setEditTeamForm(prev => ({ ...prev, jerseyColor: e.target.value }))}
                    placeholder="#3498db"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Team description (optional)"
                  value={editTeamForm.description}
                  onChange={(e) => setEditTeamForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditTeamModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateTeam}
                disabled={!editTeamForm.name.trim()}
              >
                Update Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Assignment Modal */}
      {isPlayerModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPlayerModalOpen(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Team Players</h2>
              <button 
                className="modal-close"
                onClick={() => setIsPlayerModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {availablePlayers.length === 0 ? (
                <div className="empty-state">
                  <p>No available players to assign.</p>
                  <Link to="/player-management" className="btn btn-primary">
                    Add New Players
                  </Link>
                </div>
              ) : (
                <div className="available-players">
                  <h3>Available Players ({availablePlayers.length})</h3>
                  <div className="players-list">
                    {availablePlayers.map(player => (
                      <div key={player.id} className="player-item">
                        <div className="player-info">
                          <h4>{player.name}</h4>
                          <p>{player.position} • {player.battingStyle} • {player.bowlingStyle}</p>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAssignPlayer(selectedTeamId, player.id)}
                        >
                          Add to Team
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setIsPlayerModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default TeamManagement;