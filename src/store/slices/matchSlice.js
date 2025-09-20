import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentMatch: null,
  upcomingMatches: [
    {
      id: 1,
      team1: { name: 'Team Soumyak (Black Jersey)', players: [], captain: null },
      team2: { name: 'Team Sonal (White Jersey)', players: [], captain: null },
      date: '2025-09-20',
      time: '2:00 PM',
      venue: 'Ground A',
      status: 'upcoming',
      umpire: null,
      tossWinner: null,
      choosenToAction: null, // 'bat' or 'bowl'
    },
    {
      id: 2,
      team1: { name: 'Team Soumyak (Black Jersey)', players: [], captain: null },
      team2: { name: 'Team Sonal (White Jersey)', players: [], captain: null },
      date: '2025-09-20',
      time: '4:30 PM',
      venue: 'Ground B',
      status: 'upcoming',
      umpire: null,
      tossWinner: null,
      choosenToAction: null,
    },
    {
      id: 3,
      team1: { name: 'Team Soumyak (Black Jersey)', players: [], captain: null },
      team2: { name: 'Team Sonal (White Jersey)', players: [], captain: null },
      date: '2025-09-21',
      time: '10:00 AM',
      venue: 'Ground A',
      status: 'upcoming',
      umpire: null,
      tossWinner: null,
      choosenToAction: null,
    }
  ],
  allMatches: [],
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    createNewMatch: (state, action) => {
      const newMatch = {
        id: Date.now(),
        ...action.payload,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      };
      state.upcomingMatches.push(newMatch);
      state.allMatches.push(newMatch);
    },
    
    setCurrentMatch: (state, action) => {
      state.currentMatch = action.payload;
    },
    
    updateMatchDetails: (state, action) => {
      const { matchId, updates } = action.payload;
      const matchIndex = state.upcomingMatches.findIndex(match => match.id === matchId);
      if (matchIndex !== -1) {
        state.upcomingMatches[matchIndex] = { ...state.upcomingMatches[matchIndex], ...updates };
      }
      
      const allMatchIndex = state.allMatches.findIndex(match => match.id === matchId);
      if (allMatchIndex !== -1) {
        state.allMatches[allMatchIndex] = { ...state.allMatches[allMatchIndex], ...updates };
      }
      
      if (state.currentMatch && state.currentMatch.id === matchId) {
        state.currentMatch = { ...state.currentMatch, ...updates };
      }
    },
    
    setMatchSquads: (state, action) => {
      const { matchId, team1Players, team2Players, team1Captain, team2Captain, umpire } = action.payload;
      const updates = {
        team1: { ...state.currentMatch?.team1, players: team1Players, captain: team1Captain },
        team2: { ...state.currentMatch?.team2, players: team2Players, captain: team2Captain },
        umpire,
        status: 'squad_selected'
      };
      
      matchSlice.caseReducers.updateMatchDetails(state, {
        payload: { matchId, updates }
      });
    },
    
    startMatch: (state, action) => {
      const { matchId, tossWinner, choosenToAction } = action.payload;
      const updates = {
        status: 'live',
        tossWinner,
        choosenToAction,
        startTime: new Date().toISOString()
      };
      
      matchSlice.caseReducers.updateMatchDetails(state, {
        payload: { matchId, updates }
      });
    },
    
    endMatch: (state, action) => {
      const { matchId, result } = action.payload;
      const updates = {
        status: 'completed',
        result,
        endTime: new Date().toISOString()
      };
      
      matchSlice.caseReducers.updateMatchDetails(state, {
        payload: { matchId, updates }
      });
      
      // Remove from upcoming matches
      state.upcomingMatches = state.upcomingMatches.filter(match => match.id !== matchId);
    },
  },
});

export const {
  createNewMatch,
  setCurrentMatch,
  updateMatchDetails,
  setMatchSquads,
  startMatch,
  endMatch,
} = matchSlice.actions;

export default matchSlice.reducer;