import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  teams: [
    {
      id: 1,
      name: 'Team Soumyak (Black Jersey)',
      players: [
        { id: 1, name: 'Soumyak', role: 'All-rounder', isCaptain: true },
        { id: 2, name: 'Sheetal', role: 'All-rounder', isCaptain: false },
        { id: 3, name: 'Puneet', role: 'Batsman', isCaptain: false },
        { id: 4, name: 'Mithun', role: 'Wicket Keeper', isCaptain: false },
        { id: 5, name: 'Gaurav', role: 'Batsman', isCaptain: false },
        { id: 6, name: 'Farashi', role: 'Bowler', isCaptain: false },
        { id: 7, name: 'Norace', role: 'All-rounder', isCaptain: false },
        { id: 8, name: 'Amit J', role: 'Bowler', isCaptain: false },
        { id: 9, name: 'Subhajit', role: 'Batsman', isCaptain: false },
        { id: 10, name: 'Kartic', role: 'Bowler', isCaptain: false },
      ],
      createdAt: '2025-09-15',
    },
    {
      id: 2,
      name: 'Team Sonal (White Jersey)',
      players: [
        { id: 11, name: 'Sonal', role: 'All-rounder', isCaptain: true },
        { id: 12, name: 'Rupraj', role: 'All-rounder', isCaptain: false },
        { id: 13, name: 'Sundar', role: 'Batsman', isCaptain: false },
        { id: 14, name: 'Pawan', role: 'Wicket Keeper', isCaptain: false },
        { id: 15, name: 'Ishan', role: 'Batsman', isCaptain: false },
        { id: 16, name: 'Sambeet', role: 'Bowler', isCaptain: false },
        { id: 17, name: 'Anil', role: 'All-rounder', isCaptain: false },
        { id: 18, name: 'Abinash', role: 'Bowler', isCaptain: false },
        { id: 19, name: 'Sridhar', role: 'Batsman', isCaptain: false },
        { id: 20, name: 'Ashutosh', role: 'Bowler', isCaptain: false },
      ],
      createdAt: '2025-09-16',
    },
  ],
  selectedTeams: [],
  availableUmpires: [
    { id: 1, name: 'Umpire John', experience: '5 years' },
    { id: 2, name: 'Umpire Smith', experience: '3 years' },
    { id: 3, name: 'Umpire Ahmed', experience: '7 years' },
  ],
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    addTeam: (state, action) => {
      const newTeam = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      state.teams.push(newTeam);
    },
    
    updateTeam: (state, action) => {
      const { teamId, updates } = action.payload;
      const teamIndex = state.teams.findIndex(team => team.id === teamId);
      if (teamIndex !== -1) {
        state.teams[teamIndex] = { ...state.teams[teamIndex], ...updates };
      }
    },
    
    addPlayerToTeam: (state, action) => {
      const { teamId, player } = action.payload;
      const teamIndex = state.teams.findIndex(team => team.id === teamId);
      if (teamIndex !== -1) {
        const newPlayer = {
          id: Date.now(),
          ...player,
          isCaptain: false,
        };
        state.teams[teamIndex].players.push(newPlayer);
      }
    },
    
    removePlayerFromTeam: (state, action) => {
      const { teamId, playerId } = action.payload;
      const teamIndex = state.teams.findIndex(team => team.id === teamId);
      if (teamIndex !== -1) {
        state.teams[teamIndex].players = state.teams[teamIndex].players.filter(
          player => player.id !== playerId
        );
      }
    },
    
    setCaptain: (state, action) => {
      const { teamId, playerId } = action.payload;
      const teamIndex = state.teams.findIndex(team => team.id === teamId);
      if (teamIndex !== -1) {
        // Remove captain status from all players
        state.teams[teamIndex].players.forEach(player => {
          player.isCaptain = false;
        });
        // Set new captain
        const playerIndex = state.teams[teamIndex].players.findIndex(
          player => player.id === playerId
        );
        if (playerIndex !== -1) {
          state.teams[teamIndex].players[playerIndex].isCaptain = true;
        }
      }
    },
    
    deleteTeam: (state, action) => {
      const teamId = action.payload;
      state.teams = state.teams.filter(team => team.id !== teamId);
    },
    
    setSelectedTeams: (state, action) => {
      state.selectedTeams = action.payload;
    },
  },
});

export const {
  addTeam,
  updateTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
  setCaptain,
  deleteTeam,
  setSelectedTeams,
} = teamSlice.actions;

export default teamSlice.reducer;