import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  addTeam, 
  assignPlayerToTeam, 
  setCaptain, 
  removePlayerFromTeam, 
  deleteTeam 
} from '../store/slices/clubSlice';
import '../styles/cricket.css';

function TeamManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Component state
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  
  // Get club data from Redux store
  const { teams, playerPool, clubInfo } = useSelector(state => state.club);
  
  // Get available players (not assigned to any team)
  const availablePlayers = playerPool?.filter(player => 
    !teams?.some(team => team.players?.includes(player.id))
  ) || [];
  
  // Helper function to get player details
  const getPlayerDetails = (playerId) => {
    return playerPool?.find(player => player.id === playerId);
  };
  
  // Create new team
  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      const newTeam = {
        id: Date.now().toString(),
        name: newTeamName.trim(),
        players: [],
        captainId: null,
        createdAt: new Date().toISOString()
      };
      
      dispatch(addTeam(newTeam));
      setNewTeamName('');
      setIsCreateTeamModalOpen(false);
    }
  };

  // Add player to team
  const handleAddPlayer = (playerId) => {
    if (selectedTeamId) {
      dispatch(assignPlayerToTeam({
        teamId: selectedTeamId,
        playerId: playerId
      }));
      
      // Close modal if team is full (11 players)
      const team = teams?.find(t => t.id === selectedTeamId);
      if (team && team.players && team.players.length >= 10) { // Will be 11 after adding
        setIsPlayerModalOpen(false);
        setSelectedTeamId(null);
      }
    }
  };

  // Open player selection modal
  const openPlayerModal = (teamId) => {
    const team = teams?.find(t => t.id === teamId);
    if (team && team.players && team.players.length >= 11) {
      alert('Team is full! Maximum 11 players allowed.');
      return;
    }
    setSelectedTeamId(teamId);
    setIsPlayerModalOpen(true);
  };

  // Remove player from team
  const handleRemovePlayer = (teamId, playerId) => {
    dispatch(removePlayerFromTeam({ teamId, playerId }));
  };

  // Set team captain
  const handleSetCaptain = (teamId, playerId) => {
    dispatch(setCaptain({ teamId, playerId }));
  };

  // Delete team
  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? All players will be returned to the club pool.')) {
      dispatch(deleteTeam(teamId));
    }
  };
  
  console.log('Club data:', { teams, playerPool, clubInfo });
  return (
    <div className="home-page-container">
      <div className="home-container">
        {/* Header */}
        <div className="home-header">
          <div className="header-left">
            <button onClick={() => navigate('/')} className="back-btn">
              🏏
            </button>
            <span className="brand-icon">👥</span>
            <h1 className="app-title">Team Management</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={() => setIsCreateTeamModalOpen(true)}
              className="primary-btn blue"
            >
              ⚡ New Team
            </button>
          </div>
        </div>

        {/* Main Title Section */}
        <div className="main-title-section">
          <h2 className="main-title">Cricket Club Teams</h2>
          <p className="main-subtitle">
            Manage your teams, assign players from the club pool, and organize your cricket club effectively.
          </p>
        </div>

        {/* Club Stats Section */}
        <div className="club-stats-section">
          <div className="club-info-header">
            <h2 className="club-title">{clubInfo?.name || 'Cricket Club'}</h2>
            <p className="club-subtitle">Team management overview</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-number">{playerPool?.length || 0}</div>
                <div className="stat-label">Total Players</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏏</div>
              <div className="stat-content">
                <div className="stat-number">{teams?.length || 0}</div>
                <div className="stat-label">Active Teams</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✨</div>
              <div className="stat-content">
                <div className="stat-number">{availablePlayers.length || 0}</div>
                <div className="stat-label">Available Players</div>
              </div>
            </div>
          </div>
        </div>

        {/* Teams List */}
        {teams && teams.length > 0 ? (
          <div className="teams-container">
            <div className="section-header">
              <h3 className="section-title">🏏 Active Teams</h3>
              <p className="section-subtitle">Manage your team rosters and player assignments</p>
            </div>
            <div className="teams-grid">
              {teams.map(team => (
                <div key={team.id} className="team-card-modern">
                  <div className="team-card-header">
                    <div className="team-badge">
                      <span className="team-icon">🏏</span>
                      <div className="team-info">
                        <h4 className="team-name">{team.name}</h4>
                        <span className="team-size">
                          {team.players?.length || 0}/11 players
                        </span>
                      </div>
                    </div>
                    <div className="team-actions">
                      <button 
                        onClick={() => openPlayerModal(team.id)}
                        className="action-btn primary"
                        disabled={(team.players?.length || 0) >= 11}
                      >
                        + Player
                      </button>
                      <button 
                        onClick={() => handleDeleteTeam(team.id)}
                        className="action-btn danger"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Players List */}
                  {team.players && team.players.length > 0 && (
                    <div className="team-players-section">
                      <div className="players-header">
                        <h5 className="players-title">⭐ Squad Players</h5>
                        <span className="players-count">{team.players.length} players</span>
                      </div>
                      <div className="modern-players-grid">
                        {team.players.map(playerId => {
                          const player = getPlayerDetails(playerId);
                          if (!player) return null;
                          
                          return (
                            <div key={playerId} className="modern-player-card">
                              <div className="player-avatar">
                                {player.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="player-details">
                                <div className="player-name-row">
                                  <span className="player-name">{player.name}</span>
                                  {team.captainId === playerId && <span className="captain-badge">👑</span>}
                                </div>
                                <span className="player-role">{player.role}</span>
                              </div>
                              <div className="player-actions-modern">
                                {team.captainId !== playerId && (
                                  <button 
                                    onClick={() => handleSetCaptain(team.id, playerId)}
                                    className="mini-btn captain"
                                    title="Make Captain"
                                  >
                                    👑
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleRemovePlayer(team.id, playerId)}
                                  className="mini-btn remove"
                                  title="Remove Player"
                                >
                                  ✗
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="modern-empty-state">
            <div className="empty-content">
              <div className="empty-illustration">
                <div className="cricket-icon-large">🏏</div>
                <div className="empty-circles">
                  <div className="circle-1"></div>
                  <div className="circle-2"></div>
                  <div className="circle-3"></div>
                </div>
              </div>
              <h3 className="empty-title">No Teams Created Yet</h3>
              <p className="empty-description">
                Create your first cricket team and start building your squad from the club's player pool.
              </p>
              <button 
                onClick={() => setIsCreateTeamModalOpen(true)}
                className="primary-btn blue"
                style={{ marginTop: '24px' }}
              >
                ⚡ Create Your First Team
              </button>
            </div>
          </div>
        )}

        {/* Available Players Pool */}
        {availablePlayers.length > 0 && (
          <div className="available-players-modern">
            <div className="section-header">
              <h3 className="section-title">✨ Available Players</h3>
              <p className="section-subtitle">Players ready to join a team</p>
            </div>
            <div className="available-players-grid">
              {availablePlayers.map(player => (
                <div key={player.id} className="available-player-modern">
                  <div className="player-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    <span className="player-role">{player.role}</span>
                  </div>
                  <div className="player-meta">
                    <span className="player-age">Age {player.age}</span>
                    <span className="player-date">
                      {new Date(player.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="player-status">
                    <span className="status-badge available">Available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Player Selection Modal */}
      {isPlayerModalOpen && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>Select Player to Add</h3>
              <button 
                onClick={() => {
                  setIsPlayerModalOpen(false);
                  setSelectedTeamId(null);
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {availablePlayers.length > 0 ? (
                <div className="players-selection-grid">
                  {availablePlayers.map(player => (
                    <div key={player.id} className="selectable-player-card">
                      <div className="player-info">
                        <h4 className="player-name">{player.name}</h4>
                        <span className="player-role">{player.role}</span>
                        <span className="player-age">Age: {player.age}</span>
                      </div>
                      <button 
                        onClick={() => handleAddPlayer(player.id)}
                        className="select-btn"
                      >
                        Add to Team
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-players">
                  <p>No available players in the club pool.</p>
                  <button 
                    onClick={() => navigate('/register-player')}
                    className="primary-btn"
                  >
                    Register New Player
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {isCreateTeamModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Team</h3>
              <button 
                onClick={() => setIsCreateTeamModalOpen(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="form-input"
                  maxLength={50}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setIsCreateTeamModalOpen(false)}
                className="secondary-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTeam}
                className="primary-btn"
                disabled={!newTeamName.trim()}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamManagement;
