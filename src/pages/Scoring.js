import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  addRuns,
  setBatsmen,
  setBowler,
  changeBatsman,
  swapBatsmen,
  undoLastBall
} from '../store/slices/scoringSlice';
import { setCurrentMatch } from '../store/slices/matchSlice';
import scoringService from '../services/scoringService';
import matchService from '../services/matchService';
import '../styles/figma-cricket-theme.css'; // Global Figma Cricket Pro Theme
import '../styles/scoring-improved.css'; // Page-specific scoring styles

const Scoring = () => {
  const { matchId } = useParams();
  console.log('Scoring component rendered with matchId from URL:', matchId);
  const [toast, setToast] = useState(null);
  const [showUndoModal, setShowUndoModal] = useState(false);
  const [showEndOverModal, setShowEndOverModal] = useState(false);
  const [showCustomRunModal, setShowCustomRunModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [showOverEndModal, setShowOverEndModal] = useState(false);
  const dispatch = useDispatch();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentMatch } = useSelector(state => state.match);
  const { score, currentBatsmen, currentBowler, playerStats, currentOver, ballHistory } = useSelector(state => state.scoring);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [matchStartTime] = useState(new Date());
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [batsmanModal, setBatsmanModal] = useState({ open: false, type: null });
  const [bowlerModal, setBowlerModal] = useState(false);
  const [wicketModal, setWicketModal] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');
  const [bowlerSearch, setBowlerSearch] = useState('');
  const [activeView, setActiveView] = useState('live'); // 'live' or 'overview'
  const [currentInnings, setCurrentInnings] = useState('first'); // 'first' or 'second'
  const [currentInningId, setCurrentInningId] = useState(null); // Current inning ID from backend
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls

  // Mock data for demo - using players from both teams
  const availablePlayers = [
    // Team Odia players
    { id: 'puneet', name: 'Puneet', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'rupraj', name: 'Rupraj', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'sowmyak', name: 'Sowmyak', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'saroj', name: 'Saroj', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'malya', name: 'Malya', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'sambeet', name: 'Sambeet', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'puru', name: 'Puru', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'farahshi', name: 'Farahshi', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'abhibash', name: 'Abhibash', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'norace', name: 'Norace', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'ashutosh', name: 'Ashutosh', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'hara', name: 'Hara', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    // Team ROI players
    { id: 'sundar', name: 'Sundar', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'kartic', name: 'Kartic', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'subajit', name: 'Subajit', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'pawan', name: 'Pawan', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'sri', name: 'Sri', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'sonal', name: 'Sonal', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'kumar-g', name: 'Kumar G', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'anil', name: 'Anil', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'arka', name: 'Arka', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'ishaan', name: 'Ishaan', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'shankank', name: 'Shankank', totalRuns: 0, average: '0.0', strikeRate: '0.0' },
    { id: 'akhilesh', name: 'Akhilesh', totalRuns: 0, average: '0.0', strikeRate: '0.0' }
  ];

  const availableBowlers = [
    // Team Odia bowlers
    { id: 'puneet', name: 'Puneet', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'rupraj', name: 'Rupraj', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'sowmyak', name: 'Sowmyak', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'saroj', name: 'Saroj', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'malya', name: 'Malya', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'sambeet', name: 'Sambeet', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'puru', name: 'Puru', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'farahshi', name: 'Farahshi', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'abhibash', name: 'Abhibash', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'norace', name: 'Norace', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'ashutosh', name: 'Ashutosh', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'hara', name: 'Hara', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    // Team ROI bowlers
    { id: 'sundar', name: 'Sundar', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'kartic', name: 'Kartic', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'subajit', name: 'Subajit', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'pawan', name: 'Pawan', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'sri', name: 'Sri', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'sonal', name: 'Sonal', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'kumar-g', name: 'Kumar G', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'anil', name: 'Anil', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'arka', name: 'Arka', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'ishaan', name: 'Ishaan', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'shankank', name: 'Shankank', totalWickets: 0, economy: '0.00', bestFigures: '0/0' },
    { id: 'akhilesh', name: 'Akhilesh', totalWickets: 0, economy: '0.00', bestFigures: '0/0' }
  ];

  const wicketTypes = ['Bowled', 'Caught', 'LBW', 'Stumped', 'Run Out', 'Hit Wicket'];

  // Helper functions for match summary
  const getMatchSummary = () => {
    if (!currentMatch || !currentMatch.innings || currentMatch.innings.length === 0) {
      return null;
    }

    const innings = currentMatch.innings;
    const firstInnings = innings[0];
    const secondInnings = innings[1];

    // Calculate winner
    let winner = null;
    if (secondInnings && secondInnings.totalRuns !== undefined && firstInnings.totalRuns !== undefined) {
      if (secondInnings.totalRuns > firstInnings.totalRuns) {
        winner = currentMatch.teamB?.name || 'Team B';
      } else if (firstInnings.totalRuns > secondInnings.totalRuns) {
        winner = currentMatch.teamA?.name || 'Team A';
      } else {
        winner = 'Match Tied';
      }
    }

    // Find best batsman
    let bestBatsman = null;
    let maxRuns = 0;
    innings.forEach(innings => {
      if (innings.batsmen) {
        innings.batsmen.forEach(batsman => {
          const runs = batsman.runs || 0;
          if (runs > maxRuns) {
            maxRuns = runs;
            bestBatsman = {
              name: batsman.playerDetails?.name || batsman.player || 'Unknown',
              runs: runs,
              balls: batsman.balls || 0
            };
          }
        });
      }
    });

    // Find best bowler
    let bestBowler = null;
    let maxWickets = 0;
    let minRuns = Infinity;
    innings.forEach(innings => {
      if (innings.bowling) {
        innings.bowling.forEach(bowler => {
          const wickets = bowler.wickets || 0;
          const runs = bowler.runs || 0;
          if (wickets > maxWickets || (wickets === maxWickets && runs < minRuns)) {
            maxWickets = wickets;
            minRuns = runs;
            bestBowler = {
              name: bowler.playerDetails?.name || bowler.player || 'Unknown',
              wickets: wickets,
              runs: runs,
              overs: bowler.overs || 0
            };
          }
        });
      }
    });

    return {
      winner,
      bestBatsman,
      bestBowler
    };
  };

  const getMatchStats = () => {
    if (!currentMatch || !currentMatch.innings) {
      return {
        totalOvers: '0.0 / 20',
        wickets: 0,
        runRate: '0.00',
        requiredRunRate: '0.00'
      };
    }

    const currentInningIndex = currentInnings === 'first' ? 0 : 1;
    const innings = currentMatch.innings[currentInningIndex];

    if (!innings) {
      return {
        totalOvers: '0.0 / 20',
        wickets: 0,
        runRate: '0.00',
        requiredRunRate: '0.00'
      };
    }

    const totalRuns = innings.totalRuns || 0;
    const totalWickets = innings.totalWickets || 0;
    const totalOvers = innings.totalOvers || 0;
    const ballsBowled = innings.ballsBowled || 0;

    // Calculate overs in X.Y format
    const oversCompleted = Math.floor(ballsBowled / 6);
    const ballsInCurrentOver = ballsBowled % 6;
    const oversDisplay = `${oversCompleted}.${ballsInCurrentOver} / 20`;

    // Calculate run rate
    const runRate = ballsBowled > 0 ? ((totalRuns / ballsBowled) * 6).toFixed(2) : '0.00';

    // Calculate required run rate (for second innings)
    let requiredRunRate = '0.00';
    if (currentInnings === 'second' && currentMatch.innings[0]) {
      const target = currentMatch.innings[0].totalRuns + 1;
      const remainingRuns = Math.max(0, target - totalRuns);
      const remainingBalls = Math.max(0, 120 - ballsBowled); // Assuming 20 overs
      if (remainingBalls > 0) {
        requiredRunRate = ((remainingRuns / remainingBalls) * 6).toFixed(2);
      }
    }

    return {
      totalOvers: oversDisplay,
      wickets: totalWickets,
      runRate,
      requiredRunRate
    };
  };

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Start inning when innings changes (only for live matches)
  useEffect(() => {
    if (currentMatch?.id && currentMatch?.status === 'live') {
      startNewInning();
    }
  }, [currentInnings, currentMatch?.id, currentMatch?.status]);

  // Load match data from API
  useEffect(() => {
    if (!matchId) {
      return;
    }
    
    const loadMatchData = async () => {
      try {
        setIsLoading(true);
        
        // Load specific match by ID
        const matchToLoad = await matchService.getMatchDetails(matchId);
        dispatch(setCurrentMatch(matchToLoad));
        
        // Automatically set view to overview for completed matches
        if (matchToLoad && matchToLoad.status === 'completed') {
          setActiveView('overview');
        }
        
      } catch (error) {
        console.error('Error loading match data:', error);
        showToast('Error loading match data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatchData();
  }, [dispatch, matchId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key >= '0' && event.key <= '6') {
        const runs = parseInt(event.key);
        handleRunScored(runs);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Improved handlers with API integration
  const handleRunScored = async (runs) => {
    if (!currentInningId || !currentBatsmen.striker || !currentBowler) {
      showToast('Please set batsmen and bowler first');
      return;
    }

    setIsLoading(true);
    try {
      const ballData = {
        inningId: currentInningId,
        runs: runs,
        wicket: null,
        extraType: null,
        bowlerId: currentBowler.id,
        batsmanId: currentBatsmen.striker.id,
        nonStrikerId: currentBatsmen.nonStriker?.id
      };

      const response = await scoringService.recordBall(ballData);
      console.log(`Scored ${runs} runs`, response);
      showToast(`${runs} ${runs === 1 ? 'run' : 'runs'} added to ${currentBatsmen.striker.name}`);
      
      // Update local state
      dispatch(addRuns(runs));
    } catch (error) {
      showToast('Failed to record runs: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExtra = async (type, runs) => {
    if (!currentInningId || !currentBatsmen.striker || !currentBowler) {
      showToast('Please set batsmen and bowler first');
      return;
    }

    setIsLoading(true);
    try {
      const ballData = {
        inningId: currentInningId,
        runs: runs,
        wicket: null,
        extraType: type,
        bowlerId: currentBowler.id,
        batsmanId: currentBatsmen.striker.id,
        nonStrikerId: currentBatsmen.nonStriker?.id
      };

      const response = await scoringService.recordBall(ballData);
      console.log(`Extra: ${type}, runs: ${runs}`, response);
      showToast(`${type} - ${runs} extra${runs > 1 ? 's' : ''} added`);
      
      // Update local state if needed
      dispatch(addRuns(runs));
    } catch (error) {
      showToast('Failed to record extra: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWicketClick = () => {
    setWicketModal(true);
  };
  
  const handleWicket = async (wicketType = 'bowled') => {
    if (!currentInningId || !currentBatsmen.striker || !currentBowler) {
      showToast('Please set batsmen and bowler first');
      return;
    }

    setIsLoading(true);
    try {
      const ballData = {
        inningId: currentInningId,
        runs: 0,
        wicket: wicketType,
        extraType: null,
        bowlerId: currentBowler.id,
        batsmanId: currentBatsmen.striker.id,
        nonStrikerId: currentBatsmen.nonStriker?.id
      };

      const response = await scoringService.recordBall(ballData);
      console.log('Wicket taken', response);
      showToast('Wicket taken!');
      
      // Update local state
      dispatch(changeBatsman({ type: 'wicket', playerId: currentBatsmen.striker.id }));
    } catch (error) {
      showToast('Failed to record wicket: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSwapBatsmen = () => {
    console.log('Swapping batsmen');
    showToast('Batsmen swapped');
    // Add swap logic here
  };
  
  const handleEndOver = () => {
    setShowEndOverModal(true);
  };
  
  const handlePlayerChange = async (type, playerId) => {
    if (!currentInningId) {
      showToast('No active inning found');
      return;
    }

    setIsLoading(true);
    try {
      if (type === 'bowler') {
        await scoringService.setBowler(currentInningId, playerId);
        dispatch(setBowler(playerId));
        showToast('Bowler changed successfully');
      } else if (type === 'batsman') {
        // This would need additional logic for which batsman to change
        showToast('Batsman change functionality to be implemented');
      }
    } catch (error) {
      showToast('Failed to change player: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBatsmen = async (strikerId, nonStrikerId) => {
    if (!currentInningId) {
      showToast('No active inning found');
      return;
    }

    setIsLoading(true);
    try {
      await scoringService.setBatsmen(currentInningId, strikerId, nonStrikerId);
      dispatch(setBatsmen({ striker: strikerId, nonStriker: nonStrikerId }));
      showToast('Batsmen set successfully');
    } catch (error) {
      showToast('Failed to set batsmen: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewInning = async () => {
    if (!currentMatch?.id) {
      showToast('No active match found');
      return;
    }

    setIsLoading(true);
    try {
      // Determine teams based on innings
      const teamA = currentMatch.teamA;
      const teamB = currentMatch.teamB;

      const battingTeamId = currentInnings === 'first' ? teamA.id : teamB.id;
      const bowlingTeamId = currentInnings === 'first' ? teamB.id : teamA.id;

      console.log('Starting inning with:', { matchId: currentMatch.id, battingTeamId, bowlingTeamId });

      const response = await scoringService.startInning(currentMatch.id, battingTeamId, bowlingTeamId);
      console.log('Start inning response:', response);

      setCurrentInningId(response.data.id);
      showToast(`${currentInnings === 'first' ? 'First' : 'Second'} innings started`);
    } catch (error) {
      console.error('Failed to start inning:', error);
      showToast('Failed to start inning: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`figma-cricket-improved app-theme ${isDarkMode ? 'dark' : 'light'}`} role="main">
      {/* Fixed Header */}
      <header className="figma-header-improved">
        <div className="figma-header-left">
          <div className="figma-logo-container">
            <span className="figma-logo-icon" role="img" aria-label="Cricket">🏏</span>
            <h1 className="figma-title">Live Scoring</h1>
          </div>
        </div>
        <div className="figma-header-right">
          <span className="figma-live-badge" aria-live="polite">● LIVE</span>
          <button 
            onClick={toggleDarkMode} 
            className="figma-theme-toggle" 
            aria-label="Toggle dark mode"
            aria-pressed={isDarkMode}
          >
            🌙
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="figma-tab-navigation">
        <button 
          className={`figma-tab-btn ${activeView === 'live' ? 'active' : ''}`}
          onClick={() => setActiveView('live')}
          aria-pressed={activeView === 'live'}
        >
          <span className="figma-tab-icon">⚡</span>
          <span className="figma-tab-label">Live Scoring</span>
        </button>
        <button 
          className={`figma-tab-btn ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
          aria-pressed={activeView === 'overview'}
        >
          <span className="figma-tab-icon">📊</span>
          <span className="figma-tab-label">Match Overview</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="figma-main-layout">
        
        {/* Live Scoring View */}
        {activeView === 'live' && (
          <>
        {/* Combined Team Batting & Players Card */}
        <section className="figma-team-batting-card" aria-labelledby="team-batting">
          <div className="figma-card-header">
            <span className="figma-card-icon" role="img" aria-label="Team Batting">🏏</span>
            <h2 id="team-batting" className="figma-card-title">TEAM A BATTING</h2>
            <div className="figma-match-badges">
              <span className="figma-badge figma-badge-blue">18.1 Ov</span>
              <span className="figma-badge figma-badge-green">RR: 7.91</span>
            </div>
          </div>
          
          {/* Score Display */}
          <div className="figma-score-display">
            <div className="figma-main-score" aria-label="Team A score: 148 for 3 wickets">
              148<span className="figma-wickets-slash">/3</span>
            </div>
            <div className="figma-target-info">
              <span>Target: 210</span>
              <span className="figma-divider">•</span>
              <span>Need: 62 runs (10 balls)</span>
            </div>
          </div>

          {/* Batsmen Section */}
          <div className="figma-batsmen-section">
            <h3 className="figma-section-subtitle">CURRENT BATSMEN</h3>
            
            <div className="figma-batsman-row figma-striker" aria-label="On strike">
              <div className="figma-player-badge figma-striker-badge" aria-label="On strike">★</div>
              <div className="figma-player-details">
                <div className="figma-player-name">{currentBatsmen.striker?.name || 'Select Striker'}</div>
                <div className="figma-player-stats">{currentBatsmen.striker ? `${currentBatsmen.striker.runs || 0}* (${currentBatsmen.striker.balls || 0}b, ${currentBatsmen.striker.fours || 0}×4s, ${currentBatsmen.striker.sixes || 0}×6s)` : 'Not selected'}</div>
              </div>
              <div className="figma-player-sr">{currentBatsmen.striker ? ((currentBatsmen.striker.runs / Math.max(currentBatsmen.striker.balls, 1)) * 100).toFixed(1) : '0.0'}</div>
            </div>
            
            <div className="figma-batsman-row" aria-label="Non striker">
              <div className="figma-player-badge figma-non-striker-badge" aria-label="Non striker">•</div>
              <div className="figma-player-details">
                <div className="figma-player-name">{currentBatsmen.nonStriker?.name || 'Select Non-Striker'}</div>
                <div className="figma-player-stats">{currentBatsmen.nonStriker ? `${currentBatsmen.nonStriker.runs || 0} (${currentBatsmen.nonStriker.balls || 0}b, ${currentBatsmen.nonStriker.fours || 0}×4s, ${currentBatsmen.nonStriker.sixes || 0}×6s)` : 'Not selected'}</div>
              </div>
              <div className="figma-player-sr">{currentBatsmen.nonStriker ? ((currentBatsmen.nonStriker.runs / Math.max(currentBatsmen.nonStriker.balls, 1)) * 100).toFixed(1) : '0.0'}</div>
            </div>
          </div>

          {/* Batting Controls */}
          <div className="figma-batting-controls">
            <h4 className="figma-controls-title">BATTING CONTROLS</h4>
            <div className="figma-batting-buttons" role="group" aria-label="Batting control buttons">
              <button 
                className="figma-control-btn figma-out-btn" 
                onClick={() => handleWicket()} 
                aria-label="Record wicket"
              >
                <span className="figma-btn-icon">🚫</span>
                <span>OUT</span>
              </button>
              <button 
                className="figma-control-btn figma-swap-btn" 
                onClick={() => handleSwapBatsmen()} 
                aria-label="Swap batsmen"
              >
                <span className="figma-btn-icon">🔄</span>
                <span>SWAP</span>
              </button>
              <button 
                className="figma-control-btn figma-change-btn-alt" 
                onClick={() => handlePlayerChange('batsman')} 
                aria-label="Change batsman"
              >
                <span className="figma-btn-icon">👤</span>
                <span>CHANGE</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bowling Information Section */}
        <section className="figma-bowling-section" aria-labelledby="bowling-section">
          <h2 id="bowling-section" className="sr-only">Bowling Information</h2>
          
          {/* Combined Bowler & Over Card */}
          <div className="figma-bowler-over-card">
            <div className="figma-card-header">
              <span className="figma-card-icon" role="img" aria-label="Bowling">⚾</span>
              <h3 className="figma-card-title">BOWLING & OVER</h3>
            </div>
            
            {/* Bowler Info */}
            <div className="figma-bowler-row">
              <div className="figma-bowler-details">
                <div className="figma-player-name">{currentBowler?.name || 'Select Bowler'}</div>
                <div className="figma-bowler-stats">{currentBowler ? `${Math.floor(currentBowler.balls / 6) || 0}.${currentBowler.balls % 6 || 0} Ov • ${currentBowler.wickets || 0}-${currentBowler.runs || 0} • Eco: ${((currentBowler.runs || 0) / Math.max(currentBowler.balls / 6, 1)).toFixed(1)}` : 'Not selected'}</div>
              </div>
              <button 
                className="figma-change-btn" 
                onClick={() => handlePlayerChange('bowler')} 
                aria-label="Change bowler"
              >
                CHANGE
              </button>
            </div>

            {/* Current Over Tracker */}
            <div className="figma-over-section">
              <div className="figma-over-header">
                <h4 className="figma-over-title">Current Over (18.1)</h4>
              </div>
              <div className="figma-over-balls" role="list" aria-label="Balls in current over">
                <div className="figma-ball-tracker figma-ball-dot" role="listitem" title="Dot ball">•</div>
                <div className="figma-ball-tracker figma-ball-single" role="listitem" title="1 run">1</div>
                <div className="figma-ball-tracker figma-ball-double" role="listitem" title="2 runs">2</div>
                <div className="figma-ball-tracker figma-ball-six" role="listitem" title="Six!">6</div>
                <div className="figma-ball-tracker figma-ball-current" role="listitem" title="Current ball" aria-current="true">•</div>
                <div className="figma-ball-tracker figma-ball-empty" role="listitem">•</div>
              </div>
            </div>

            {/* Bowling Controls */}
            <div className="figma-bowling-controls">
              <h4 className="figma-controls-title">BOWLING CONTROLS</h4>
              <div className="figma-bowling-buttons" role="group" aria-label="Bowling control buttons">
                <button 
                  className="figma-control-btn figma-swap-bowler-btn" 
                  onClick={() => handlePlayerChange('bowler')} 
                  aria-label="Change bowler"
                >
                  <span className="figma-btn-icon">🔄</span>
                  <span>SWAP BOWLER</span>
                </button>
                <button 
                  className="figma-control-btn figma-end-over-btn" 
                  onClick={() => handleEndOver()} 
                  aria-label="End current over"
                >
                  <span className="figma-btn-icon">🏁</span>
                  <span>END OVER</span>
                </button>
              </div>
            </div>
          </div>
        </section>
        </>
        )}

        {/* Match Overview View */}
        {activeView === 'overview' && (
        <section className="figma-match-overview-section" aria-labelledby="match-overview">
          <div className="figma-card-header">
            <span className="figma-card-icon" role="img" aria-label="Match Overview">📊</span>
            <h3 id="match-overview" className="figma-card-title">MATCH OVERVIEW</h3>
          </div>
          
          {/* Match Summary */}
          {(() => {
            const summary = getMatchSummary();
            const stats = getMatchStats();
            const isCompleted = currentMatch?.status === 'completed';
            
            return (
              <div className="figma-match-summary">
                {/* Total Overs - Only show for in-progress matches */}
                {!isCompleted && (
                  <div className="figma-summary-item">
                    <div className="figma-summary-label">Total Overs</div>
                    <div className="figma-summary-value">{stats.totalOvers}</div>
                  </div>
                )}
                
                {/* Winner - Only show for completed matches */}
                {isCompleted && summary?.winner && (
                  <div className="figma-summary-item">
                    <div className="figma-summary-label">Winner</div>
                    <div className="figma-summary-value">{summary.winner}</div>
                  </div>
                )}
                
                {/* Best Batsman */}
                {summary?.bestBatsman && (
                  <div className="figma-summary-item">
                    <div className="figma-summary-label">Best Batsman</div>
                    <div className="figma-summary-value">
                      {summary.bestBatsman.name} - {summary.bestBatsman.runs} ({summary.bestBatsman.balls})
                    </div>
                  </div>
                )}
                
                {/* Best Bowler */}
                {summary?.bestBowler && (
                  <div className="figma-summary-item">
                    <div className="figma-summary-label">Best Bowler</div>
                    <div className="figma-summary-value">
                      {summary.bestBowler.name} - {summary.bestBowler.wickets}/{summary.bestBowler.runs} ({summary.bestBowler.overs})
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          
          {/* Innings Tabs */}
          <div className="figma-innings-tabs-container" role="tablist" aria-label="Innings selection">
            <button 
              className={`figma-innings-tab ${currentInnings === 'first' ? 'active' : ''}`}
              onClick={() => setCurrentInnings('first')}
              role="tab"
              aria-selected={currentInnings === 'first'}
              aria-controls="innings-content"
            >
              <span className="figma-innings-tab-label">1st Innings</span>
            </button>
            <button 
              className={`figma-innings-tab ${currentInnings === 'second' ? 'active' : ''}`}
              onClick={() => setCurrentInnings('second')}
              role="tab"
              aria-selected={currentInnings === 'second'}
              aria-controls="innings-content"
            >
              <span className="figma-innings-tab-label">2nd Innings</span>
            </button>
          </div>
          
          <div className="figma-teams-grid" id="innings-content" role="tabpanel">
            {/* First Innings Content */}
            {currentInnings === 'first' && (
              <>
            {/* Team A - Batting */}
            <div className="figma-team-card">
              <div className="figma-team-header-row">
                <span className="figma-team-name">{currentMatch?.teamA?.name || 'TEAM A'}</span>
                <span className="figma-team-status-badge figma-batting-badge">BATTING</span>
              </div>
              <div className="figma-players-list">
                {currentMatch?.status === 'completed' && currentMatch?.innings?.[0]?.batsmen ? (
                  // Show actual innings data for completed matches
                  currentMatch.innings[0].batsmen.map((batsman, index) => (
                    <div key={batsman.player || index} className={`figma-player-row ${batsman.howOut || batsman.dismissal ? 'figma-player-out' : 'figma-player-active'}`}>
                      <span className="figma-player-number">{index + 1}.</span>
                      <span className="figma-player-name">{batsman.playerDetails?.name || batsman.player || `Player ${index + 1}`}</span>
                      <span className={`figma-player-score ${batsman.howOut || batsman.dismissal ? 'figma-out' : 'figma-batting'}`}>
                        {batsman.howOut || batsman.dismissal ? `${batsman.runs || 0} (${batsman.balls || 0}) - ${batsman.howOut || batsman.dismissal}` : `${batsman.runs || 0}* (${batsman.balls || 0})`}
                      </span>
                    </div>
                  ))
                ) : (
                  // Show team lineup for live/upcoming matches
                  currentMatch?.teamA?.players?.map((player, index) => (
                    <div key={player.id} className={`figma-player-row ${player.status === 'not-out' ? 'figma-player-active' : player.status === 'out' ? 'figma-player-out' : ''}`}>
                      <span className="figma-player-number">{index + 1}.</span>
                      <span className="figma-player-name">{player.name}</span>
                      <span className={`figma-player-score ${player.status === 'not-out' ? 'figma-batting' : player.status === 'out' ? 'figma-out' : 'figma-yet-to-bat'}`}>
                        {player.status === 'not-out' ? `${player.runs}* (${player.balls})` : 
                         player.status === 'out' ? `${player.runs} (${player.balls}) - Out` : 
                         'Yet to bat'}
                      </span>
                    </div>
                  )) || (
                    <>
                      <div className="figma-player-row figma-player-active">
                        <span className="figma-player-number">1.</span>
                        <span className="figma-player-name">Player 1</span>
                        <span className="figma-player-score figma-batting">0* (0)</span>
                      </div>
                      <div className="figma-player-row">
                        <span className="figma-player-number">2.</span>
                        <span className="figma-player-name">Player 2</span>
                        <span className="figma-player-score figma-yet-to-bat">Yet to bat</span>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Team B - Bowling */}
            <div className="figma-team-card">
              <div className="figma-team-header-row">
                <span className="figma-team-name">{currentMatch?.teamB?.name || 'TEAM B'}</span>
                <span className="figma-team-status-badge figma-bowling-badge">BOWLING</span>
              </div>
              <div className="figma-players-list">
                {currentMatch?.status === 'completed' && currentMatch?.innings?.[0]?.bowling ? (
                  // Show actual bowling data for completed matches
                  currentMatch.innings[0].bowling.map((bowler, index) => (
                    <div key={bowler.player || index} className="figma-player-row">
                      <span className="figma-player-number">{index + 1}.</span>
                      <span className="figma-player-name">{bowler.playerDetails?.name || bowler.player || `Bowler ${index + 1}`}</span>
                      <span className="figma-player-score figma-bowling">
                        {(bowler.overs || 0)}-{(bowler.maidens || 0)}-{(bowler.runs || 0)}-{(bowler.wickets || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  // Show team lineup for live/upcoming matches
                  currentMatch?.teamB?.players?.map((player, index) => (
                    <div key={player.id} className="figma-player-row">
                      <span className="figma-player-number">{index + 1}.</span>
                      <span className="figma-player-name">{player.name}</span>
                      <span className="figma-player-score figma-bowling">
                        {player.balls ? `${Math.floor(player.balls / 6) || 0}-${Math.floor(player.balls % 6) || 0}-${player.runs || 0}-${player.wickets || 0}` : 'Yet to bowl'}
                      </span>
                    </div>
                  )) || (
                    <>
                      <div className="figma-player-row">
                        <span className="figma-player-number">1.</span>
                        <span className="figma-player-name">Bowler 1</span>
                        <span className="figma-player-score figma-bowling">0-0-0-0</span>
                      </div>
                      <div className="figma-player-row">
                        <span className="figma-player-number">2.</span>
                        <span className="figma-player-name">Bowler 2</span>
                        <span className="figma-player-score figma-yet-to-bowl">Yet to bowl</span>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>
            </>
            )}

            {/* Second Innings Content */}
            {currentInnings === 'second' && (
              <>
            {/* Team B - Batting (Second Innings) */}
            <div className="figma-team-card">
              <div className="figma-team-header-row">
                <span className="figma-team-name">{currentMatch?.teamB?.name || 'TEAM B'}</span>
                <span className="figma-team-status-badge figma-batting-badge">BATTING</span>
              </div>
              <div className="figma-players-list">
                {currentMatch?.status === 'completed' && currentMatch?.innings?.[1]?.batsmen ? (
                  // Show actual innings data for completed matches
                  currentMatch.innings[1].batsmen.map((batsman, index) => (
                    <div key={batsman.player || index} className={`figma-player-row ${batsman.howOut || batsman.dismissal ? 'figma-player-out' : 'figma-player-active'}`}>
                      <span className="figma-player-number">{index + 1}.</span>
                      <span className="figma-player-name">{batsman.playerDetails?.name || batsman.player || `Player ${index + 1}`}</span>
                      <span className={`figma-player-score ${batsman.howOut || batsman.dismissal ? 'figma-out' : 'figma-batting'}`}>
                        {batsman.howOut || batsman.dismissal ? `${batsman.runs || 0} (${batsman.balls || 0}) - ${batsman.howOut || batsman.dismissal}` : `${batsman.runs || 0}* (${batsman.balls || 0})`}
                      </span>
                    </div>
                  ))
                ) : (
                  // Show team lineup for live/upcoming matches
                  currentMatch?.teamB?.players?.map((player, index) => (
                    <div key={player.id} className={`figma-player-row ${player.status === 'not-out' ? 'figma-player-active' : player.status === 'out' ? 'figma-player-out' : ''}`}>
                      <span className="figma-player-number">{index + 1}.</span>
                      <span className="figma-player-name">{player.name}</span>
                      <span className={`figma-player-score ${player.status === 'not-out' ? 'figma-batting' : player.status === 'out' ? 'figma-out' : 'figma-yet-to-bat'}`}>
                        {player.status === 'not-out' ? `${player.runs}* (${player.balls})` : 
                         player.status === 'out' ? `${player.runs} (${player.balls}) - Out` : 
                         'Yet to bat'}
                      </span>
                    </div>
                  )) || (
                    <>
                      <div className="figma-player-row figma-player-active">
                        <span className="figma-player-number">1.</span>
                        <span className="figma-player-name">Player 1</span>
                        <span className="figma-player-score figma-batting">0* (0)</span>
                      </div>
                      <div className="figma-player-row">
                        <span className="figma-player-number">2.</span>
                        <span className="figma-player-name">Player 2</span>
                        <span className="figma-player-score figma-yet-to-bat">Yet to bat</span>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Team A - Bowling (Second Innings) */}
            <div className="figma-team-card">
              <div className="figma-team-header-row">
                <span className="figma-team-name">{currentMatch?.teamA?.name || 'TEAM A'}</span>
                <span className="figma-team-status-badge figma-bowling-badge">BOWLING</span>
              </div>
              <div className="figma-players-list">
                {currentMatch?.status === 'completed' && currentMatch?.innings?.[1]?.bowling ? (
                  // Show actual bowling data for completed matches
                  currentMatch.innings[1].bowling.map((bowler, index) => (
                    <div key={bowler.player} className="figma-player-row">
                      <span className="figma-player-number">{index + 1}.</span>
                      <span className="figma-player-name">{bowler.playerDetails?.name || bowler.player}</span>
                      <span className="figma-player-score figma-bowling">
                        {bowler.overs || 0}-{bowler.maidens || 0}-{bowler.runs || 0}-{bowler.wickets || 0}
                      </span>
                    </div>
                  ))
                ) : (
                  // Show team lineup for live/upcoming matches
                  currentMatch?.teamA?.players?.map((player, index) => (
                    <div key={player.id} className="figma-player-row">
                      <span className="figma-player-number">{index + 1}.</span>
                      <span className="figma-player-name">{player.name}</span>
                      <span className="figma-player-score figma-bowling">
                        {player.balls ? `${Math.floor(player.balls / 6) || 0}-${Math.floor(player.balls % 6) || 0}-${player.runs || 0}-${player.wickets || 0}` : 'Yet to bowl'}
                      </span>
                    </div>
                  )) || (
                    <>
                      <div className="figma-player-row">
                        <span className="figma-player-number">1.</span>
                        <span className="figma-player-name">Bowler 1</span>
                        <span className="figma-player-score figma-bowling">0-0-0-0</span>
                      </div>
                      <div className="figma-player-row">
                        <span className="figma-player-number">2.</span>
                        <span className="figma-player-name">Bowler 2</span>
                        <span className="figma-player-score figma-yet-to-bowl">Yet to bowl</span>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>
            </>
            )}

          </div>

          {/* Match Statistics Summary - Only show for in-progress matches */}
          {currentMatch?.status !== 'completed' && (() => {
            const stats = getMatchStats();
            
            return (
              <div className="figma-match-stats-summary">
                <div className="figma-stat-item">
                  <div className="figma-stat-label">Wickets</div>
                  <div className="figma-stat-value">{stats.wickets}</div>
                </div>
                <div className="figma-stat-item">
                  <div className="figma-stat-label">Run Rate</div>
                  <div className="figma-stat-value">{stats.runRate}</div>
                </div>
                <div className="figma-stat-item">
                  <div className="figma-stat-label">Req. RR</div>
                  <div className="figma-stat-value">{stats.requiredRunRate}</div>
                </div>
              </div>
            );
          })()}
        </section>
        )}
      </div>

      {/* Scoring Controls - Only Visible in Live Scoring View */}
      {activeView === 'live' && (
        <>
        <section className="figma-scoring-section" aria-labelledby="scoring-controls">
          <div className="figma-section-header">
            <span className="figma-section-icon" role="img" aria-label="Scoring">⚡</span>
            <h3 id="scoring-controls" className="figma-section-title">SCORING</h3>
          </div>
          
          <div className="figma-scoring-grid">
            {/* Runs Segmented Control */}
            <div className="figma-runs-control">
              <div className="figma-control-label">RUNS</div>
              <div className="figma-run-buttons" role="group" aria-label="Run scoring buttons">
                {[0, 1, 2, 3, 4, 5, 6].map(runs => (
                  <button 
                    key={runs}
                    className={`figma-run-btn ${runs === 0 ? 'dot' : runs === 4 ? 'boundary' : runs === 6 ? 'six' : 'normal'}`}
                    onClick={() => handleRunScored(runs)}
                    disabled={isLoading}
                    aria-label={`Score ${runs} ${runs === 1 ? 'run' : 'runs'}`}
                  >
                    {runs}
                  </button>
                ))}
                <button 
                  className="figma-run-btn custom" 
                  onClick={() => setShowCustomRunModal(true)}
                  disabled={isLoading}
                  aria-label="Custom runs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Extras with Icons */}
            <div className="figma-extras-control">
              <div className="figma-control-label">EXTRAS</div>
              <div className="figma-extras-grid" role="group" aria-label="Extra scoring buttons">
                <button 
                  className="figma-extra-btn wide" 
                  onClick={() => handleExtra('wide', 1)}
                  disabled={isLoading}
                  aria-label="Wide ball"
                >
                  <span className="figma-btn-icon" role="img" aria-label="Wide">↔</span>
                  WIDE
                </button>
                <button 
                  className="figma-extra-btn noball" 
                  onClick={() => handleExtra('noBall', 1)}
                  disabled={isLoading}
                  aria-label="No ball"
                >
                  <span className="figma-btn-icon" role="img" aria-label="Warning">⚠</span>
                  NO BALL
                </button>
                <button 
                  className="figma-extra-btn bye" 
                  onClick={() => handleExtra('bye', 1)}
                  disabled={isLoading}
                  aria-label="Bye"
                >
                  BYE
                </button>
                <button 
                  className="figma-extra-btn legbye" 
                  onClick={() => handleExtra('legBye', 1)}
                  disabled={isLoading}
                  aria-label="Leg bye"
                >
                  LEG BYE
                </button>
              </div>
            </div>
          </div>
        </section>

      {/* Sticky Footer Actions */}
      <footer className="figma-action-footer" role="toolbar" aria-label="Match actions">
        <button 
          className="figma-footer-btn wicket" 
          onClick={handleWicketClick}
          disabled={isLoading}
          aria-label="Record wicket"
        >
          <span className="figma-btn-icon" role="img" aria-label="Wicket">⚡</span>
          <span className="figma-btn-text">WICKET</span>
        </button>
        
        <button 
          className="figma-footer-btn swap" 
          onClick={() => dispatch(swapBatsmen())}
          disabled={isLoading}
          aria-label="Swap batsmen"
        >
          <span className="figma-btn-icon" role="img" aria-label="Swap">⇄</span>
          <span className="figma-btn-text">SWAP</span>
        </button>
        
        <button 
          className="figma-footer-btn undo" 
          onClick={() => setShowUndoModal(true)}
          disabled={isLoading}
          aria-label="Undo last ball"
        >
          <span className="figma-btn-icon" role="img" aria-label="Undo">↻</span>
          <span className="figma-btn-text">UNDO</span>
        </button>
        
        <button 
          className="figma-footer-btn end-over" 
          onClick={() => setShowOverEndModal(true)}
          disabled={isLoading}
          aria-label="End current over"
        >
          <span className="figma-btn-icon" role="img" aria-label="Cricket">🏏</span>
          <span className="figma-btn-text">END OVER</span>
        </button>
      </footer>
        </>
        )}

      {/* Toast Notification */}
      {toast && (
        <div 
          className="figma-toast" 
          role="alert" 
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      {/* Modals */}
      {batsmanModal.open && (
        <div className="figma-modal-overlay" role="dialog" aria-labelledby="batsman-modal-title">
          <div className="figma-modal">
            <h3 id="batsman-modal-title">Select {batsmanModal.type === 'striker' ? 'Striker' : 'Non-Striker'}</h3>
            <button onClick={() => setBatsmanModal({ open: false, type: null })} aria-label="Close modal">Close</button>
          </div>
        </div>
      )}
      
      {bowlerModal && (
        <div className="figma-modal-overlay" role="dialog" aria-labelledby="bowler-modal-title">
          <div className="figma-modal">
            <h3 id="bowler-modal-title">Select Bowler</h3>
            <button onClick={() => setBowlerModal(false)} aria-label="Close modal">Close</button>
          </div>
        </div>
      )}
      
      {wicketModal && (
        <div className="figma-modal-overlay" role="dialog" aria-labelledby="wicket-modal-title">
          <div className="figma-modal">
            <h3 id="wicket-modal-title">Record Wicket</h3>
            <p>Are you sure you want to record a wicket?</p>
            <div className="figma-modal-actions">
              <button onClick={() => setWicketModal(false)} className="figma-btn-secondary">Cancel</button>
              <button onClick={() => { console.log('Wicket recorded'); setWicketModal(false); }} className="figma-btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}
      
      {showUndoModal && (
        <div className="figma-modal-overlay" role="dialog" aria-labelledby="undo-modal-title">
          <div className="figma-modal">
            <h3 id="undo-modal-title">Undo Last Ball</h3>
            <p>Are you sure you want to undo the last ball?</p>
            <div className="figma-modal-actions">
              <button onClick={() => setShowUndoModal(false)} className="figma-btn-secondary">Cancel</button>
              <button onClick={() => { console.log('Ball undone'); setShowUndoModal(false); }} className="figma-btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="figma-loading-overlay">
          <div className="figma-loading-spinner">
            <div className="figma-spinner"></div>
            <p>Recording ball...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scoring;