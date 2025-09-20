import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentClub: {
    id: 1,
    name: 'Ecolife Cricket Club',
    location: 'Mumbai',
    established: '2020',
    description: 'Premier cricket club for box cricket enthusiasts'
  },
  playerPool: [
    // Sample players in the club pool
    {
      id: 1,
      name: 'Soumyak',
      role: 'All-rounder',
      experience: 'Intermediate',
      contactNumber: '+91-9876543210',
      email: 'soumyak@example.com',
      dateJoined: '2024-01-15',
      isAvailable: true,
      currentTeam: null // null means not assigned to any team
    },
    {
      id: 2,
      name: 'Sonal',
      role: 'Batsman',
      experience: 'Beginner',
      contactNumber: '+91-9876543211',
      email: 'sonal@example.com',
      dateJoined: '2024-02-20',
      isAvailable: true,
      currentTeam: null
    },
    {
      id: 3,
      name: 'Sheetal',
      role: 'Bowler',
      experience: 'Advanced',
      contactNumber: '+91-9876543212',
      email: 'sheetal@example.com',
      dateJoined: '2024-01-30',
      isAvailable: true,
      currentTeam: null
    },
    {
      id: 4,
      name: 'Puneet',
      role: 'Wicket Keeper',
      experience: 'Intermediate',
      contactNumber: '+91-9876543213',
      email: 'puneet@example.com',
      dateJoined: '2024-03-10',
      isAvailable: true,
      currentTeam: null
    },
    {
      id: 5,
      name: 'Mithun',
      role: 'Batsman',
      experience: 'Advanced',
      contactNumber: '+91-9876543214',
      email: 'mithun@example.com',
      dateJoined: '2024-02-05',
      isAvailable: true,
      currentTeam: null
    }
  ],
  teams: [
    // Sample teams with players selected from pool
    {
      id: 1,
      name: 'Team Soumyak',
      clubId: 1,
      captainId: 1, // Player ID from pool
      players: [1, 2, 3], // Array of player IDs from pool
      jerseyColor: 'Black',
      createdDate: '2024-09-01'
    },
    {
      id: 2,
      name: 'Team Sonal',
      clubId: 1,
      captainId: 2, // Player ID from pool
      players: [2, 4, 5], // Array of player IDs from pool
      jerseyColor: 'White',
      createdDate: '2024-09-15'
    }
  ]
};

const clubSlice = createSlice({
  name: 'club',
  initialState,
  reducers: {
    // Club Management
    updateClub: (state, action) => {
      state.currentClub = { ...state.currentClub, ...action.payload };
    },

    // Player Pool Management
    addPlayerToPool: (state, action) => {
      const newPlayer = {
        id: Date.now(),
        ...action.payload,
        dateJoined: new Date().toISOString().split('T')[0],
        isAvailable: true,
        currentTeam: null
      };
      state.playerPool.push(newPlayer);
    },

    updatePlayer: (state, action) => {
      const { id, updates } = action.payload;
      const playerIndex = state.playerPool.findIndex(player => player.id === id);
      if (playerIndex !== -1) {
        state.playerPool[playerIndex] = { ...state.playerPool[playerIndex], ...updates };
      }
    },

    removePlayerFromPool: (state, action) => {
      const playerId = action.payload;
      // Remove from pool
      state.playerPool = state.playerPool.filter(player => player.id !== playerId);
      // Remove from all teams
      state.teams.forEach(team => {
        team.players = team.players.filter(pid => pid !== playerId);
        if (team.captainId === playerId) {
          team.captainId = null;
        }
      });
    },

    // Team Management
    addTeam: (state, action) => {
      const newTeam = {
        id: Date.now(),
        clubId: state.currentClub.id,
        players: [],
        captainId: null,
        createdDate: new Date().toISOString().split('T')[0],
        ...action.payload
      };
      state.teams.push(newTeam);
    },

    updateTeam: (state, action) => {
      const { id, updates } = action.payload;
      const teamIndex = state.teams.findIndex(team => team.id === id);
      if (teamIndex !== -1) {
        state.teams[teamIndex] = { ...state.teams[teamIndex], ...updates };
      }
    },

    deleteTeam: (state, action) => {
      const teamId = action.payload;
      // Free up players from the deleted team
      const team = state.teams.find(t => t.id === teamId);
      if (team) {
        team.players.forEach(playerId => {
          const player = state.playerPool.find(p => p.id === playerId);
          if (player) {
            player.currentTeam = null;
            player.isAvailable = true;
          }
        });
      }
      state.teams = state.teams.filter(team => team.id !== teamId);
    },

    // Player-Team Assignment
    assignPlayerToTeam: (state, action) => {
      const { teamId, playerId } = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      const player = state.playerPool.find(p => p.id === playerId);
      
      if (team && player && player.isAvailable) {
        // Add player to team if not already there
        if (!team.players.includes(playerId)) {
          team.players.push(playerId);
        }
        // Update player status
        player.currentTeam = teamId;
        player.isAvailable = false;
      }
    },

    removePlayerFromTeam: (state, action) => {
      const { teamId, playerId } = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      const player = state.playerPool.find(p => p.id === playerId);
      
      if (team && player) {
        // Remove from team
        team.players = team.players.filter(pid => pid !== playerId);
        // If player was captain, remove captaincy
        if (team.captainId === playerId) {
          team.captainId = null;
        }
        // Update player status
        player.currentTeam = null;
        player.isAvailable = true;
      }
    },

    setCaptain: (state, action) => {
      const { teamId, playerId } = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      
      if (team && team.players.includes(playerId)) {
        team.captainId = playerId;
      }
    },

    // Utility functions
    getAvailablePlayers: (state) => {
      return state.playerPool.filter(player => player.isAvailable);
    },

    getTeamPlayers: (state, action) => {
      const teamId = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      if (team) {
        return state.playerPool.filter(player => team.players.includes(player.id));
      }
      return [];
    }
  }
});

export const {
  updateClub,
  addPlayerToPool,
  updatePlayer,
  removePlayerFromPool,
  addTeam,
  updateTeam,
  deleteTeam,
  assignPlayerToTeam,
  removePlayerFromTeam,
  setCaptain
} = clubSlice.actions;

export default clubSlice.reducer;

// Selectors
export const selectCurrentClub = (state) => state.club.currentClub;
export const selectPlayerPool = (state) => state.club.playerPool;
export const selectAvailablePlayers = (state) => 
  state.club.playerPool.filter(player => player.isAvailable);
export const selectTeams = (state) => state.club.teams;
export const selectTeamById = (state, teamId) => 
  state.club.teams.find(team => team.id === teamId);
export const selectTeamPlayers = (state, teamId) => {
  const team = state.club.teams.find(t => t.id === teamId);
  if (team) {
    return state.club.playerPool.filter(player => team.players.includes(player.id));
  }
  return [];
};
export const selectPlayerById = (state, playerId) => 
  state.club.playerPool.find(player => player.id === playerId);