import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentInnings: 1, // 1 or 2
  battingTeam: null,
  bowlingTeam: null,
  score: {
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
  },
  currentBatsmen: {
    striker: null,
    nonStriker: null,
  },
  currentBowler: null,
  ballByBall: [], // Array of ball records
  playerStats: {}, // Player-wise statistics
  overStats: [], // Over-wise statistics
  partnerships: [], // Partnership details
  fallOfWickets: [], // Wicket details
  extras: {
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
    penalties: 0,
  },
  powerPlayOvers: {
    completed: 0,
    total: 6,
  },
  target: null, // For second innings
  requiredRunRate: null,
  currentRunRate: null,
};

const scoringSlice = createSlice({
  name: 'scoring',
  initialState,
  reducers: {
    initializeInnings: (state, action) => {
      const { battingTeam, bowlingTeam, innings } = action.payload;
      state.currentInnings = innings;
      state.battingTeam = battingTeam;
      state.bowlingTeam = bowlingTeam;
      
      // Reset scoring stats for new innings
      if (innings === 1) {
        state.score = { runs: 0, wickets: 0, overs: 0, balls: 0 };
        state.ballByBall = [];
        state.playerStats = {};
        state.overStats = [];
        state.partnerships = [];
        state.fallOfWickets = [];
        state.extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0 };
      }
      
      // Initialize player stats
      battingTeam.players.forEach(player => {
        if (!state.playerStats[player.id]) {
          state.playerStats[player.id] = {
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: 0,
            isOut: false,
            howOut: null,
            ballsFaced: 0,
          };
        }
      });
      
      bowlingTeam.players.forEach(player => {
        if (!state.playerStats[player.id]) {
          state.playerStats[player.id] = {
            oversBowled: 0,
            ballsBowled: 0,
            runsConceded: 0,
            wicketsTaken: 0,
            maidenOvers: 0,
            economy: 0,
          };
        }
      });
    },
    
    setBatsmen: (state, action) => {
      const { striker, nonStriker } = action.payload;
      state.currentBatsmen = { striker, nonStriker };
    },
    
    setBowler: (state, action) => {
      state.currentBowler = action.payload;
    },
    
    addRuns: (state, action) => {
      const { runs, extras = {}, isWicket = false, wicketDetails = null } = action.payload;
      
      // Update main score
      state.score.runs += runs;
      if (isWicket) {
        state.score.wickets += 1;
      }
      
      // Update ball count (only if not a wide or no-ball)
      if (!extras.wide && !extras.noBall) {
        state.score.balls += 1;
        if (state.score.balls === 6) {
          state.score.overs += 1;
          state.score.balls = 0;
        }
      }
      
      // Update striker stats (if runs scored by batsman)
      if (state.currentBatsmen.striker && !extras.bye && !extras.legBye) {
        const strikerId = state.currentBatsmen.striker.id;
        state.playerStats[strikerId].runs += runs;
        state.playerStats[strikerId].balls += 1;
        
        if (runs === 4) state.playerStats[strikerId].fours += 1;
        if (runs === 6) state.playerStats[strikerId].sixes += 1;
        
        // Calculate strike rate
        const stats = state.playerStats[strikerId];
        stats.strikeRate = stats.balls > 0 ? (stats.runs / stats.balls) * 100 : 0;
      }
      
      // Update bowler stats
      if (state.currentBowler) {
        const bowlerId = state.currentBowler.id;
        state.playerStats[bowlerId].runsConceded += runs;
        
        if (!extras.wide && !extras.noBall) {
          state.playerStats[bowlerId].ballsBowled += 1;
        }
        
        if (isWicket) {
          state.playerStats[bowlerId].wicketsTaken += 1;
        }
        
        // Calculate economy
        const bowlerStats = state.playerStats[bowlerId];
        const oversBowled = Math.floor(bowlerStats.ballsBowled / 6) + (bowlerStats.ballsBowled % 6) / 10;
        bowlerStats.economy = oversBowled > 0 ? bowlerStats.runsConceded / oversBowled : 0;
      }
      
      // Update extras
      Object.keys(extras).forEach(extraType => {
        if (extras[extraType] && state.extras[extraType] !== undefined) {
          state.extras[extraType] += extras[extraType];
        }
      });
      
      // Handle wicket
      if (isWicket && wicketDetails) {
        const strikerId = state.currentBatsmen.striker?.id;
        if (strikerId) {
          state.playerStats[strikerId].isOut = true;
          state.playerStats[strikerId].howOut = wicketDetails.howOut;
        }
        
        state.fallOfWickets.push({
          wicketNumber: state.score.wickets,
          runs: state.score.runs,
          overs: `${state.score.overs}.${state.score.balls}`,
          batsman: state.currentBatsmen.striker,
          ...wicketDetails,
        });
      }
      
      // Add to ball-by-ball record
      state.ballByBall.push({
        ballNumber: state.ballByBall.length + 1,
        over: state.score.overs,
        ball: state.score.balls,
        runs,
        extras,
        isWicket,
        wicketDetails,
        batsman: state.currentBatsmen.striker,
        bowler: state.currentBowler,
        timestamp: new Date().toISOString(),
      });
      
      // Calculate current run rate
      const totalOvers = state.score.overs + (state.score.balls / 6);
      state.currentRunRate = totalOvers > 0 ? state.score.runs / totalOvers : 0;
      
      // Calculate required run rate for second innings
      if (state.currentInnings === 2 && state.target) {
        const remainingRuns = state.target - state.score.runs + 1;
        const remainingOvers = 20 - totalOvers;
        state.requiredRunRate = remainingOvers > 0 ? remainingRuns / remainingOvers : 0;
      }
    },
    
    changeBatsman: (state, action) => {
      const { newBatsman, position } = action.payload; // position: 'striker' or 'nonStriker'
      if (position === 'striker') {
        state.currentBatsmen.striker = newBatsman;
      } else {
        state.currentBatsmen.nonStriker = newBatsman;
      }
    },
    
    swapBatsmen: (state) => {
      const temp = state.currentBatsmen.striker;
      state.currentBatsmen.striker = state.currentBatsmen.nonStriker;
      state.currentBatsmen.nonStriker = temp;
    },
    
    setTarget: (state, action) => {
      state.target = action.payload;
    },
    
    resetScoring: (state) => {
      return { ...initialState };
    },
    
    undoLastBall: (state) => {
      if (state.ballByBall.length === 0) return;
      
      const lastBall = state.ballByBall.pop();
      
      // Reverse the score changes
      state.score.runs -= lastBall.runs;
      if (lastBall.isWicket) {
        state.score.wickets -= 1;
      }
      
      // Reverse ball count
      if (!lastBall.extras.wide && !lastBall.extras.noBall) {
        if (state.score.balls === 0) {
          state.score.overs -= 1;
          state.score.balls = 5;
        } else {
          state.score.balls -= 1;
        }
      }
      
      // Note: For simplicity, not reversing all player stats here
      // In a production app, you'd want to recalculate from ballByBall array
    },
  },
});

export const {
  initializeInnings,
  setBatsmen,
  setBowler,
  addRuns,
  changeBatsman,
  swapBatsmen,
  setTarget,
  resetScoring,
  undoLastBall,
} = scoringSlice.actions;

export default scoringSlice.reducer;