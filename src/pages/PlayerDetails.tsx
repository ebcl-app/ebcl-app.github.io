import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareIcon from '@mui/icons-material/Compare';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlagIcon from '@mui/icons-material/Flag';
import { CricketApiService, type ApiPlayer } from '../api/cricketApi';

interface PlayerAnalysis {
  playerDescription: string;
}

interface PlayerTeamData {
  id?: string;
  teamId?: string;
  name?: string;
  teamName?: string;
  shortName?: string;
}

interface PlayerMatchData {
  matchId: string;
  id?: string;
  matchTitle?: string;
  status?: string;
  date: {
    _seconds: number;
    _nanoseconds: number;
  };
  opponent: string;
  team1?: {
    name: string;
    shortName?: string;
    score?: string;
  };
  team2?: {
    name: string;
    shortName?: string;
    score?: string;
  };
  venue?: string;
  batting?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
  };
  bowling?: {
    wickets: number;
    runs: number;
    overs: string;
    maidens: number;
  };
  fielding?: {
    catches: number;
    runOuts: number;
    stumpings?: number;
  };
  impact: {
    batting: number;
    bowling: number;
    fielding: number;
    total: number;
  };
  result: string | {
    winner: string;
    margin: string;
  };
}

interface PlayerAnalysis {
  playerDescription: string;
  executiveSummary: string;
  performanceAnalysis: {
    battingAnalysis: string;
    bowlingAnalysis: string;
    fieldingAnalysis: string;
    consistencyRating: string;
    pressurePerformance: string;
  };
  technicalAssessment: {
    strengths: string[];
    weaknesses: string[];
    techniqueEvolution: string;
  };
  tacticalInsights: {
    roleInTeam: string;
    matchSituations: string;
    partnershipBuilding: string;
    captaincyPotential: string;
  };
  performanceTrends: {
    recentForm: string;
    careerTrajectory: string;
    venuePerformance: string;
    oppositionAnalysis: string;
  };
  comparativeAnalysis: {
    similarPlayers: string;
    benchmarking: string;
    marketValue: string;
  };
  developmentRecommendations: {
    shortTerm: string[];
    longTerm: string[];
    trainingFocus: string;
    skillDevelopment: string;
    performanceTargets: {
      battingTargets: string;
      bowlingTargets: string;
      fieldingTargets: string;
      consistencyTargets: string;
    };
  };
  matchContribution: {
    optimalConditions: string;
    teamImpact: string;
    versatility: string;
    futurePotential: string;
  };
}

// Helper function to get last 10 batting innings
const getLast10BattingInnings = (recentMatches: PlayerMatchData[]): number[] => {
  if (!recentMatches || recentMatches.length === 0) return [];
  
  const battingScores: number[] = [];
  recentMatches.forEach(match => {
    if (match.batting && match.batting.runs !== undefined) {
      battingScores.push(match.batting.runs || 0);
    }
  });
  return battingScores.slice(0, 10); // Get first 10 (most recent)
};

// Helper function to get last 10 bowling figures (wickets)
const getLast10BowlingFigures = (recentMatches: PlayerMatchData[]): number[] => {
  if (!recentMatches || recentMatches.length === 0) return [];
  
  const bowlingFigures: number[] = [];
  recentMatches.forEach(match => {
    if (match.bowling && match.bowling.wickets !== undefined) {
      bowlingFigures.push(match.bowling.wickets || 0);
    }
  });
  return bowlingFigures.slice(0, 10); // Get first 10 (most recent)
};

// Helper function to calculate win percentage
const calculateWinPercentage = (player: ApiPlayer): number => {
  // First check if V2 API careerStats has winPercentage
  if (player.careerStats?.overall?.winPercentage !== undefined) {
    return Math.round(player.careerStats.overall.winPercentage);
  }

  // Fallback to calculating from recentMatches
  const recentMatches = player.recentMatches || [];
  if (recentMatches.length === 0) return 0;

  let wins = 0;
  let totalMatches = 0;

  recentMatches.forEach(match => {
    if (match.result && match.result !== 'N/A' && match.result !== '') {
      totalMatches++;
      // Check if result indicates a win (case-insensitive)
      if (match.result.toLowerCase().includes('won') || match.result.toLowerCase() === 'w') {
        wins++;
      }
    }
  });

  return totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
};

// Helper function to get highest impact score
const getHighestImpactScore = (player: ApiPlayer): number => {
  // Calculate from recentMatches
  const recentMatches = player.recentMatches || [];
  if (recentMatches.length === 0) return 0;

  return Math.max(...recentMatches.map(match => match.impact?.total || 0));
};

// Dynamic bar chart component
const DynamicBarChart: React.FC<{ data: number[]; color: string; maxHeight?: number }> = ({
  data,
  color,
  maxHeight = 64
}) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: maxHeight }}>
        <Typography variant="caption" color="text.secondary">No data</Typography>
      </Box>
    );
  }

  const maxValue = Math.max(...data, 1); // Avoid division by zero
  const barWidth = Math.max(8, Math.min(20, 200 / data.length)); // Responsive bar width

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: maxHeight, overflow: 'hidden' }}>
      {data.map((value, index) => {
        const height = maxValue > 0 ? (value / maxValue) * maxHeight : 0;
        return (
          <Box
            key={index}
            sx={{
              width: barWidth,
              height: Math.max(4, height), // Minimum height for visibility
              bgcolor: color,
              borderRadius: 0.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 0.8,
                transform: 'scaleY(1.1)',
              }
            }}
            title={`${value}`}
          />
        );
      })}
    </Box>
  );
};



const PlayerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const [player, setPlayer] = useState<ApiPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PlayerAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState(0); // For mobile view tabs

  // State to prevent duplicate API calls
  const [playerDataLoaded, setPlayerDataLoaded] = useState(false);
  const [analysisDataLoaded, setAnalysisDataLoaded] = useState(false);
  const lastFetchedPlayerId = React.useRef<string | null>(null);
  const lastAnalyzedPlayerId = React.useRef<string | null>(null);

  // Reset state when playerId changes
  React.useEffect(() => {
    if (lastFetchedPlayerId.current !== playerId) {
      setPlayerDataLoaded(false);
      setAnalysisDataLoaded(false);
      lastFetchedPlayerId.current = null;
      lastAnalyzedPlayerId.current = null;
      setPlayer(null);
      setAnalysis(null);
      setAnalysisLoading(false);
      setLoading(true);
      setError(null);
    }
  }, [playerId]);

  // Helper function to get player icon based on role
  const getPlayerIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'batsman':
        return <SportsCricketIcon />;
      case 'bowler':
        return <SportsBaseballIcon />;
      case 'all-rounder':
        return <ShuffleIcon />;
      default:
        return <SportsCricketIcon />;
    }
  };

  // Helper function to calculate player stats from match history
  const calculatePlayerStats = (matchHistory: PlayerMatchData[]): {
    matchesPlayed: number;
    totalRuns: number;
    battingAverage: number;
    battingStrikeRate: number;
    totalWickets: number;
    bowlingAverage: number;
    bowlingEconomy: number;
    totalOvers: number;
  } => {
    let totalRuns = 0;
    let totalBalls = 0;
    let totalDismissals = 0;
    let totalWickets = 0;
    let totalBowlingRuns = 0;
    let totalOvers = 0;
    const matchesPlayed = matchHistory.length;

    matchHistory.forEach(match => {
      // Use direct batting/bowling data from PlayerMatchData
      if (match.batting) {
        totalRuns += match.batting.runs || 0;
        totalBalls += match.batting.balls || 0;
        // Assume dismissal if runs > 0 (simplified logic)
        if (match.batting.runs > 0) {
          totalDismissals += 1;
        }
      }
      if (match.bowling) {
        totalWickets += match.bowling.wickets || 0;
        totalBowlingRuns += match.bowling.runs || 0;
        // Convert overs string to number (e.g., "4.2" -> 4.2)
        const oversNum = parseFloat(match.bowling.overs || '0');
        totalOvers += oversNum;
      }
    });

    // Calculate averages and rates
    const battingAverage = totalDismissals > 0 ? totalRuns / totalDismissals : totalRuns;
    const battingStrikeRate = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;
    const bowlingAverage = totalWickets > 0 ? totalBowlingRuns / totalWickets : 0;
    const bowlingEconomy = totalOvers > 0 ? totalBowlingRuns / totalOvers : 0;

    return {
      matchesPlayed,
      totalRuns,
      battingAverage,
      battingStrikeRate,
      totalWickets,
      bowlingAverage,
      bowlingEconomy,
      totalOvers,
    };
  };

  // Helper function to get player icon color based on role
  const getPlayerIconColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'batsman':
        return '#2E7D32'; // Green for batsman
      case 'bowler':
        return '#1976D2'; // Blue for bowler
      case 'all-rounder':
        return '#ED6C02'; // Orange for all-rounder
      default:
        return '#757575'; // Grey for unknown
    }
  };

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId || playerDataLoaded || lastFetchedPlayerId.current === playerId) {
        return;
      }

      lastFetchedPlayerId.current = playerId;

      try {
        setLoading(true);
        setError(null);
        const playerData = await CricketApiService.getPlayer(playerId);
        
        if (!playerData) {
          setError('Player not found');
          lastFetchedPlayerId.current = null;
          return;
        }

        // Use career stats from v2 API directly, fallback to match history calculation
        let finalPlayerData: ApiPlayer = playerData;
        if (playerData.careerStats) {
          // Use v2 career stats structure
          finalPlayerData = {
            ...playerData,
            matchesPlayed: playerData.careerStats.batting.matchesPlayed,
            totalRuns: playerData.careerStats.batting.runs,
            battingAverage: playerData.careerStats.batting.average,
            battingStrikeRate: playerData.careerStats.batting.strikeRate,
            totalWickets: playerData.careerStats.bowling.wickets,
            bowlingAverage: playerData.careerStats.bowling.average,
            bowlingEconomy: playerData.careerStats.bowling.economyRate,
            totalOvers: playerData.careerStats.bowling.matchesPlayed * 4, // Approximate
          };
        } else if (playerData.matchHistory && playerData.matchHistory.length > 0) {
          // Fallback to calculating from match history for v1 compatibility
          const calculatedStats = calculatePlayerStats(playerData.matchHistory as any);
          
          // Update player data with calculated stats
          finalPlayerData = {
            ...playerData,
            matchesPlayed: calculatedStats.matchesPlayed,
            totalRuns: calculatedStats.totalRuns,
            battingAverage: calculatedStats.battingAverage,
            battingStrikeRate: calculatedStats.battingStrikeRate,
            totalWickets: calculatedStats.totalWickets,
            bowlingAverage: calculatedStats.bowlingAverage,
            bowlingEconomy: calculatedStats.bowlingEconomy,
            totalOvers: calculatedStats.totalOvers,
          };
        }
          
        // Sort match history by date and time
        if (finalPlayerData.matchHistory) {
          finalPlayerData.matchHistory.sort((a, b) => {
            const dateA = new Date(a.matchDate);
            const dateB = new Date(b.matchDate);
            
            // First compare dates (year, month, day)
            const dateComparison = dateB.getFullYear() - dateA.getFullYear() ||
                                  dateB.getMonth() - dateA.getMonth() ||
                                  dateB.getDate() - dateA.getDate();
            
            // If dates are the same, compare times
            if (dateComparison === 0) {
              return dateB.getTime() - dateA.getTime();
            }
            
            return dateComparison;
          });
        }
        
        setPlayer(finalPlayerData);
        
        setPlayerDataLoaded(true);
      } catch (err) {
        setError('Failed to load player details. Please try again later.');
        console.error('Error fetching player details:', err);
        lastFetchedPlayerId.current = null;
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId, playerDataLoaded]);

  // Fetch player analysis when player data is loaded
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!player || analysisDataLoaded || lastAnalyzedPlayerId.current === playerId) {
        return;
      }

      lastAnalyzedPlayerId.current = playerId || null;

      try {
        setAnalysisLoading(true);
        
        // Prepare player data for analysis - cast to satisfy type requirements
        const playerAnalysisData = {
          playerId: player.id || player.displayId,
          name: player.name,
          role: player.role,
          matchHistory: (player.matchHistory || []) as any // Type cast due to structure mismatch
        };

        console.log('Fetching player analysis for:', playerAnalysisData.name);
        const result = await CricketApiService.analyzePlayer(playerAnalysisData);
        console.log('Analysis API result:', result);
        
        if (result.success && result.data) {
          console.log('Analysis data received:', result.data);
          // Map the API response to our PlayerAnalysis interface
          setAnalysis({
            playerDescription: result.data.analysis.playerDescription || '',
            executiveSummary: result.data.analysis.playerDescription || '',
            performanceAnalysis: {
              battingAnalysis: result.data.analysis.strengths.join(', ') || '',
              bowlingAnalysis: '',
              fieldingAnalysis: '',
              consistencyRating: '',
              pressurePerformance: ''
            },
            technicalAssessment: {
              strengths: result.data.analysis.strengths || [],
              weaknesses: result.data.analysis.weaknesses || [],
              techniqueEvolution: ''
            },
            tacticalInsights: {
              roleInTeam: '',
              matchSituations: '',
              partnershipBuilding: '',
              captaincyPotential: ''
            },
            performanceTrends: {
              recentForm: '',
              careerTrajectory: '',
              venuePerformance: '',
              oppositionAnalysis: ''
            },
            comparativeAnalysis: {
              similarPlayers: '',
              benchmarking: '',
              marketValue: `Potential Rating: ${result.data.analysis.potentialRating || 0}`
            },
            developmentRecommendations: {
              shortTerm: result.data.analysis.recommendations || [],
              longTerm: [],
              trainingFocus: '',
              skillDevelopment: '',
              performanceTargets: {
                battingTargets: '',
                bowlingTargets: '',
                fieldingTargets: '',
                consistencyTargets: ''
              }
            },
            matchContribution: {
              optimalConditions: '',
              teamImpact: '',
              versatility: '',
              futurePotential: ''
            }
          });
          setAnalysisDataLoaded(true);
        } else {
          // If API fails, set null
          setAnalysis(null);
          setAnalysisDataLoaded(true);
        }
      } catch (err) {
        console.error('Error fetching player analysis:', err);
        lastAnalyzedPlayerId.current = null;
        // Set null on error - analysis is optional
        setAnalysis(null);
        setAnalysisDataLoaded(true);
      } finally {
        setAnalysisLoading(false);
      }
    };

    fetchAnalysis();
  }, [player, playerId, analysisDataLoaded]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !player) {
    return (
      <Container maxWidth="md" sx={{ pt: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Player not found'}
        </Alert>
        <Button onClick={() => navigate(-1)} variant="outlined">
          Go Back
        </Button>
      </Container>
    );
  }

  // Mobile View Component matching mockup
  const renderMobileView = () => (
    <Box sx={{ minHeight: '100vh', bgcolor: '#e8eef5', pb: 10 }}>
      {/* Player Header Section */}
      <Box sx={{ pt: 2, px: 2 }}>
        <Card sx={{
          mb: 3,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #93c5fd',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{
                bgcolor: getPlayerIconColor(player.role),
                width: 70,
                height: 70,
                fontWeight: 700,
                fontSize: '2rem',
                border: '3px solid #e3f2fd'
              }}>
                {getPlayerIcon(player.role)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a5f', mb: 0.5 }}>
                  {player.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {player.role}
                </Typography>
              </Box>
            </Stack>

            {/* Tab Buttons */}
            <Box sx={{ display: 'flex', gap: 0, backgroundColor: '#f1f5f9', borderRadius: 1, p: 0.5, mb: 0 }}>
              <Button
                variant="text"
                onClick={() => setMobileTab(0)}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.8,
                  borderRadius: 0.8,
                  backgroundColor: mobileTab === 0 ? '#2c3e5f' : 'transparent',
                  color: mobileTab === 0 ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: mobileTab === 0 ? '#253451' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Stats
              </Button>
              <Button
                variant="text"
                onClick={() => setMobileTab(1)}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.8,
                  borderRadius: 0.8,
                  backgroundColor: mobileTab === 1 ? '#2c3e5f' : 'transparent',
                  color: mobileTab === 1 ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: mobileTab === 1 ? '#253451' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Matches
              </Button>
              <Button
                variant="text"
                onClick={() => setMobileTab(2)}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.8,
                  borderRadius: 0.8,
                  backgroundColor: mobileTab === 2 ? '#2c3e5f' : 'transparent',
                  color: mobileTab === 2 ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: mobileTab === 2 ? '#253451' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Teams
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Tab Content */}
        {mobileTab === 0 && (
        <Box>
          <Card sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 2, border: '1px solid #93c5fd' }}>
          <CardContent sx={{ p: 3 }}>
            {/* AI-Generated Bio */}
            {analysis?.playerDescription && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2, color: '#1e293b' }}>
                  AI Player Analysis
                </Typography>
                <Box sx={{ p: 2, backgroundColor: '#f0f9ff', borderRadius: 1, border: '1px solid #bae6fd', mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#0369a1', lineHeight: 1.6, fontSize: '0.875rem' }}>
                    {analysis.playerDescription}
                  </Typography>
                </Box>
              </>
            )}

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon />
              Career Statistics
            </Typography>

            {/* Batting Stats */}
            {player.careerStats?.batting && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2, color: '#1e293b' }}>
                  🏏 Batting Statistics
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.batting.matchesPlayed || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Matches
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.batting.runs || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Runs
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.batting.average || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Average
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ed6c02', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.batting.strikeRate || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Strike Rate
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Bowling Stats */}
            {player.careerStats?.bowling && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2, color: '#1e293b' }}>
                  🎯 Bowling Statistics
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ed6c02', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.bowling.wickets || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Wickets
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.bowling.bestBowling || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Best Figures
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.bowling.economyRate?.toFixed(1) || '0.0'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Economy
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.bowling.average || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Average
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Fielding Stats */}
            {player.careerStats?.fielding && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2, color: '#1e293b' }}>
                  🧤 Fielding Statistics
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c27b0', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.fielding.catches || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Catches
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ed6c02', fontSize: '1.1rem', mb: 0.5 }}>
                      {player.careerStats?.fielding.runOuts || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Run Outs
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
            </CardContent>
          </Card>
        </Box>
        )}

        {/* Matches Card */}
        {mobileTab === 1 && (
        <Box>
          <Card sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 2, border: '1px solid #93c5fd' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon />
              Recent Matches
            </Typography>
              {player.recentMatches && player.recentMatches.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(player.recentMatches as PlayerMatchData[]).slice(0, 3).map((match: PlayerMatchData, index: number) => {
                    let formattedDate = 'Date not available';
                    if (match.date && match.date._seconds) {
                      formattedDate = new Date(match.date._seconds * 1000).toLocaleDateString();
                    }

                    const isCompleted = match.result === 'Won' || match.result === 'Lost';
                    const isLive = false; // Based on the data structure, this doesn't seem to have live status

                    return (
                      <Box
                        key={`match-mobile-${index}-${match.matchId}`}
                        sx={{
                          p: 2,
                          backgroundColor: '#f8fafc',
                          borderRadius: 1,
                          borderLeft: `4px solid ${isLive ? '#ef4444' : isCompleted ? '#10b981' : '#3b82f6'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f1f5f9',
                            transform: 'translateX(2px)'
                          }
                        }}
                        onClick={() => navigate(`/matches/${match.matchId}`)}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                          vs {match.opponent}
                        </Typography>
                        
                        {/* Match Result and Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: (typeof match.result === 'string' && match.result === 'Won') ? '#10b981' : (typeof match.result === 'string' && match.result === 'Lost') ? '#ef4444' : '#64748b', fontWeight: 500 }}>
                            {typeof match.result === 'string' ? match.result : (match.result?.winner ? `${match.result.winner} won` : 'Unknown')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formattedDate}
                          </Typography>
                        </Box>
                        
                        {/* Match Stats */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            {match.batting && match.batting.runs > 0 && (
                              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 500 }}>
                                {match.batting.runs} runs
                              </Typography>
                            )}
                            {match.bowling && match.bowling.wickets > 0 && (
                              <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 500 }}>
                                {match.bowling.wickets} wickets
                              </Typography>
                            )}
                            {match.fielding && match.fielding.catches > 0 && (
                              <Typography variant="caption" sx={{ color: '#7c3aed', fontWeight: 500 }}>
                                {match.fielding.catches} catches
                              </Typography>
                            )}
                          </Box>
                          
                          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            Impact: {match.impact.total > 0 ? '+' : ''}{match.impact.total.toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 2 }}>
                  No recent matches available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
        )}

        {/* Teams Card */}
        {mobileTab === 2 && player.recentTeams && player.recentTeams.length > 0 && (
        <Box>
          <Card sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 2, border: '1px solid #93c5fd' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon />
              Teams Played For
            </Typography>
              {player.recentTeams && player.recentTeams.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(player.recentTeams as PlayerTeamData[]).slice(0, 3).map((team: PlayerTeamData, index: number) => (
                    <Box
                      key={`team-mobile-${index}-${team.id || team.teamId}`}
                      sx={{
                        p: 1.5,
                        backgroundColor: '#f8fafc',
                        borderRadius: 1,
                        borderLeft: '3px solid #10b981'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {team.teamName || 'Team'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 2 }}>
                  No team information available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
        )}

      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile View */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {renderMobileView()}
      </Box>

      {/* Desktop View */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, bgcolor: '#F5F7FA', minHeight: '100vh', pb: { xs: 8, sm: 10, md: 12 } }}>
        <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 2.5, md: 3 }, px: { xs: 2, sm: 3 } }}>
        {/* Player Summary Card */}
        <Card sx={{ 
          mb: 3, 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #93c5fd',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: getPlayerIconColor(player.role), 
                width: 70, 
                height: 70, 
                fontWeight: 700,
                fontSize: '2rem',
                border: '3px solid #e3f2fd'
              }}>
                {getPlayerIcon(player.role)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a5f', mb: 0.5 }}>
                  {player.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {player.role}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<SportsCricketIcon />} 
                sx={{ 
                  textTransform: 'none',
                  bgcolor: '#1e3a5f',
                  '&:hover': { bgcolor: '#152a47' }
                }}
              >
                Follow
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Career Statistics Card */}
        <Card sx={{ 
          mb: 3, 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          border: '1px solid #93c5fd'
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* AI-Generated Bio */}
            {analysis?.playerDescription && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 2, color: '#1e293b' }}>
                  AI Player Analysis
                </Typography>
                <Box sx={{ p: 2.5, backgroundColor: '#f0f9ff', borderRadius: 1, border: '1px solid #bae6fd', mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#0369a1', lineHeight: 1.6 }}>
                    {analysis.playerDescription}
                  </Typography>
                </Box>
              </>
            )}

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon />
              Career Statistics
            </Typography>
        {player.careerStats?.batting && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: { xs: 1, sm: 1.5 }, color: '#1976d2', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              🏏 Batting Statistics
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)', // 2 columns on mobile
                  sm: 'repeat(4, 1fr)', // 4 columns on small screens and up
                },
                gap: { xs: 1.5, sm: 2 },
                mb: { xs: 2, sm: 2.5 },
              }}
            >
              <Card sx={{
                boxShadow: 2,
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                borderLeft: '4px solid #1976d2',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderLeftWidth: '6px',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#1976d2',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.careerStats?.batting.matchesPlayed || 0}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Matches
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{
                boxShadow: 2,
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                borderLeft: '4px solid #2e7d32',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderLeftWidth: '6px',
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#2e7d32',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.careerStats?.batting.runs || 0}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Runs
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{
                boxShadow: 1,
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#ed6c02',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.careerStats?.batting.average?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Average
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{
                boxShadow: 1,
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#d32f2f',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.careerStats?.batting.strikeRate?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Strike Rate
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* Bowling Stats */}
        {player.careerStats?.bowling && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: { xs: 1, sm: 1.5 }, color: '#d32f2f', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              🎯 Bowling Statistics
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)', // 2 columns on mobile
                  sm: 'repeat(4, 1fr)', // 4 columns on small screens and up
                },
                gap: { xs: 1.5, sm: 2 },
                mb: 2,
              }}
            >
              <Card sx={{
                boxShadow: 1,
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#d32f2f',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.careerStats?.bowling.wickets || 0}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Wickets
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{
                boxShadow: 1,
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#ed6c02',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.careerStats?.bowling.average?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Average
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.6rem', sm: '0.65rem' },
                      display: 'block',
                      mt: -0.5
                    }}
                  >
                    (Runs/Wicket)
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{
                boxShadow: 1,
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#2e7d32',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.careerStats?.bowling.economyRate?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Economy
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{
                boxShadow: 1,
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#9c27b0',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.careerStats?.bowling.matchesPlayed || 0}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Matches Bowled
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* Fielding Stats */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: { xs: 1, sm: 1.5 }, color: '#9c27b0', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            🧤 Fielding Statistics
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)', // 2 columns on mobile
                sm: 'repeat(3, 1fr)', // 3 columns on small screens and up
              },
              gap: { xs: 1.5, sm: 2 },
              mb: { xs: 2, sm: 2.5 },
            }}
          >
            <Card sx={{
              boxShadow: 1,
              minHeight: { xs: 80, sm: 100 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#9c27b0',
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {player.careerStats?.fielding.catches || 0}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Catches
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{
              boxShadow: 1,
              minHeight: { xs: 80, sm: 100 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#ed6c02',
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {player.careerStats?.fielding.runOuts || 0}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Run Outs
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{
              boxShadow: 1,
              minHeight: { xs: 80, sm: 100 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#2e7d32',
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {player.careerStats?.fielding.stumpings || 0}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Stumpings
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Impact Stats */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: { xs: 1, sm: 1.5 }, color: '#9c27b0', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            📊 Impact Statistics
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)', // 2 columns on mobile
                sm: 'repeat(4, 1fr)', // 4 columns on small screens and up
              },
              gap: { xs: 1.5, sm: 2 },
              mb: { xs: 2, sm: 2.5 },
            }}
          >
            <Card sx={{
              boxShadow: 1,
              minHeight: { xs: 80, sm: 100 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#1976d2',
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {player.careerStats?.impact.batting?.toFixed(1) || '0.0'}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Batting Impact
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{
              boxShadow: 1,
              minHeight: { xs: 80, sm: 100 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#d32f2f',
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {player.careerStats?.impact.bowling?.toFixed(1) || '0.0'}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Bowling Impact
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{
              boxShadow: 1,
              minHeight: { xs: 80, sm: 100 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#2e7d32',
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {player.careerStats?.impact.fielding?.toFixed(1) || '0.0'}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Fielding Impact
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{
              boxShadow: 1,
              minHeight: { xs: 80, sm: 100 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, px: { xs: 1, sm: 2 } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#9c27b0',
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                  }}
                >
                  {player.careerStats?.impact.total?.toFixed(1) || '0.0'}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Total Impact
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Charts and Additional Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {/* Batting Last 10 Innings */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Batting Last 10 Innings</Typography>
                <DynamicBarChart
                  data={getLast10BattingInnings(player.recentMatches || [])}
                  color="#1976d2"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Recent batting scores (runs per innings)
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Bowling Last 10 Innings */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Bowling Last 10 Innings</Typography>
                <DynamicBarChart
                  data={getLast10BowlingFigures(player.recentMatches || [])}
                  color="#d32f2f"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Recent bowling figures (wickets per match)
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Win Percentage */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Win Percentage</Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#2e7d32',
                    mb: 1
                  }}
                >
                  {calculateWinPercentage(player)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on {player.careerStats?.overall?.matchesPlayed || 0} matches played
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Highest Impact Score */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Highest Impact Score</Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#ed6c02',
                    mb: 1
                  }}
                >
                  {getHighestImpactScore(player)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Best match contribution rating
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

          </CardContent>
        </Card>

        {/* AI Analysis Section */}
        <Accordion sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon />
              AI Performance Analysis
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Card sx={{ boxShadow: 'none', border: 'none' }}>
              <CardContent sx={{ p: 0 }}>
                {analysisLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <PsychologyIcon sx={{ color: '#4A90E2' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Analyzing player performance...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Using AI to provide comprehensive insights based on stats and match history
                      </Typography>
                    </Box>
                    <CircularProgress size={20} sx={{ ml: 'auto' }} />
                  </Box>
                ) : analysis ? (
                  <Box>
                {/* Executive Summary */}
                <Accordion defaultExpanded sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssessmentIcon fontSize="small" />
                      Executive Summary
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {analysis.executiveSummary}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Performance Analysis */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon fontSize="small" />
                      Performance Analysis
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: '250px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Batting Analysis
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysis.performanceAnalysis.battingAnalysis}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: '250px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Bowling Analysis
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysis.performanceAnalysis.bowlingAnalysis}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Fielding Analysis
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {analysis.performanceAnalysis.fieldingAnalysis}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Consistency Rating: {analysis.performanceAnalysis.consistencyRating}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 1 }}>
                        Pressure Performance:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.performanceAnalysis.pressurePerformance}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Technical Assessment */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SportsCricketIcon fontSize="small" />
                      Technical Assessment
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: '250px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#2e7d32' }}>
                          Technical Strengths
                        </Typography>
                        <List dense>
                          {analysis.technicalAssessment.strengths.map((strength: string, index: number) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <StarIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={strength}
                                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: '250px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#ed6c02' }}>
                          Technical Weaknesses
                        </Typography>
                        <List dense>
                          {analysis.technicalAssessment.weaknesses.map((weakness: string, index: number) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <WarningIcon sx={{ fontSize: 16, color: '#ed6c02' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={weakness}
                                primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Technique Evolution
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.technicalAssessment.techniqueEvolution}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Tactical Insights */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#7b1fa2', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PsychologyIcon fontSize="small" />
                      Tactical Insights
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Role in Team:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.tacticalInsights.roleInTeam}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Match Situations:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.tacticalInsights.matchSituations}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Partnership Building:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.tacticalInsights.partnershipBuilding}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Captaincy Potential:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analysis.tacticalInsights.captaincyPotential}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Performance Trends */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#f57c00', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon fontSize="small" />
                      Performance Trends
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Recent Form:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.performanceTrends.recentForm}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Career Trajectory:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.performanceTrends.careerTrajectory}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Venue Performance:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.performanceTrends.venuePerformance}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Opposition Analysis:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analysis.performanceTrends.oppositionAnalysis}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Comparative Analysis */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#388e3c', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CompareIcon fontSize="small" />
                      Comparative Analysis
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Similar Players:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.comparativeAnalysis.similarPlayers}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Benchmarking:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.comparativeAnalysis.benchmarking}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Market Value:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analysis.comparativeAnalysis.marketValue}
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                {/* Development Recommendations */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SchoolIcon fontSize="small" />
                      Development Recommendations
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Short-term Focus:
                    </Typography>
                    <List dense>
                      {analysis.developmentRecommendations.shortTerm.map((rec, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <ArrowForwardIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={rec}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                      Long-term Goals:
                    </Typography>
                    <List dense>
                      {analysis.developmentRecommendations.longTerm.map((goal: string, index: number) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <FlagIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={goal}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                      Training Focus:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.developmentRecommendations.trainingFocus}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Skill Development:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.developmentRecommendations.skillDevelopment}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}>
                      Performance Targets:
                    </Typography>
                    <Box sx={{ mt: 1, p: 2, bgcolor: '#f5f7fa', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#2e7d32' }}>
                        Batting Targets:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {analysis.developmentRecommendations.performanceTargets.battingTargets}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#ed6c02' }}>
                        Bowling Targets:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {analysis.developmentRecommendations.performanceTargets.bowlingTargets}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#9c27b0' }}>
                        Fielding Targets:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {analysis.developmentRecommendations.performanceTargets.fieldingTargets}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#ff9800' }}>
                        Consistency Targets:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analysis.developmentRecommendations.performanceTargets.consistencyTargets}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                {/* Match Contribution */}
                <Accordion sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon fontSize="small" />
                      Match Contribution
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Optimal Conditions:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.matchContribution.optimalConditions}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Team Impact:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.matchContribution.teamImpact}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Versatility:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {analysis.matchContribution.versatility}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Future Potential:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analysis.matchContribution.futurePotential}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <PsychologyIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  AI analysis not available at the moment
                </Typography>
              </Box>
            )}
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>

        {/* Matches Card */}
        <Card sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon />
              Recent Matches
            </Typography>
            {player.recentMatches && player.recentMatches.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2, mt: 2 }}>
                {(player.recentMatches as PlayerMatchData[]).slice(0, 10).map((match: PlayerMatchData, index: number) => {
                  let formattedDate = 'Date not available';
                  if (match.date && match.date._seconds) {
                    formattedDate = new Date(match.date._seconds * 1000).toLocaleDateString();
                  }

                  return (
                    <Box
                      key={`match-${index}-${match.matchId}`}
                      sx={{
                        p: 2,
                        backgroundColor: '#f8fafc',
                        borderRadius: 1,
                        borderLeft: `4px solid #10b981`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f1f5f9',
                          transform: 'translateX(2px)'
                        }
                      }}
                      onClick={() => navigate(`/matches/${match.matchId}`)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                        vs {match.opponent}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                          {typeof match.result === 'string' ? match.result : (match.result?.winner ? `${match.result.winner} won` : 'Unknown')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formattedDate}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {match.batting && match.batting.runs > 0 && (
                            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 500 }}>
                              {match.batting.runs} runs
                            </Typography>
                          )}
                          {match.bowling && match.bowling.wickets > 0 && (
                            <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 500 }}>
                              {match.bowling.wickets} wickets
                            </Typography>
                          )}
                        </Box>
                        
                        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                          Impact: {match.impact.total.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
                No recent matches available
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Matches Card - Card View */}
        <Card sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon />
              Recent Matches (Card View)
            </Typography>
              {player.recentMatches && player.recentMatches.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(player.recentMatches as PlayerMatchData[]).map((match: PlayerMatchData, index: number) => {
                    // Format date if it's a Firestore timestamp
                    let formattedDate = 'Date not available';
                    if (match.date) {
                      if (match.date._seconds) {
                        formattedDate = new Date(match.date._seconds * 1000).toLocaleDateString();
                      } else if (typeof match.date === 'string') {
                        formattedDate = match.date;
                      }
                    }

                    const isLive = match.status === 'live' || match.status === 'Live';
                    const isCompleted = match.status === 'completed' || match.status === 'Completed';
                    
                    return (
                      <Box
                        key={`match-desktop-${index}-${match.id || match.matchId}`}
                        sx={{
                          p: 3,
                          backgroundColor: '#f8fafc',
                          borderRadius: 2,
                          borderLeft: `4px solid ${isLive ? '#ef4444' : isCompleted ? '#10b981' : '#3b82f6'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f1f5f9',
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                        onClick={() => match.id && navigate(`/matches/${match.id}`)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {match.matchTitle || 'Match'}
                          </Typography>
                          <Chip
                            label={match.status || 'Unknown'}
                            size="small"
                            sx={{
                              fontSize: '0.75rem',
                              backgroundColor: isLive ? '#fef2f2' : isCompleted ? '#f0fdf4' : '#eff6ff',
                              color: isLive ? '#dc2626' : isCompleted ? '#16a34a' : '#2563eb',
                              border: `1px solid ${isLive ? '#fecaca' : isCompleted ? '#bbf7d0' : '#bfdbfe'}`
                            }}
                          />
                        </Box>
                        
                        {/* Teams and Scores */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#1e3a8a', fontSize: '0.875rem', fontWeight: 700 }}>
                              {match.team1?.shortName || match.team1?.name?.substring(0, 2).toUpperCase() || 'T1'}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {match.team1?.name || 'Team 1'}
                              </Typography>
                              {match.team1?.score && (
                                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                  {match.team1.score}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#6b7280' }}>
                            VS
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {match.team2?.name || 'Team 2'}
                              </Typography>
                              {match.team2?.score && (
                                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>
                                  {match.team2.score}
                                </Typography>
                              )}
                            </Box>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: '#f97316', fontSize: '0.875rem', fontWeight: 700 }}>
                              {match.team2?.shortName || match.team2?.name?.substring(0, 2).toUpperCase() || 'T2'}
                            </Avatar>
                          </Box>
                        </Box>
                        
                        {/* Match Details */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                              {formattedDate}
                            </Typography>
                            {match.venue && (
                              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                {match.venue}
                              </Typography>
                            )}
                            {typeof match.result === 'object' && match.result?.winner && (
                              <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600, mt: 0.5 }}>
                                {match.result.winner} won{match.result.margin ? ` by ${match.result.margin}` : ''}
                              </Typography>
                            )}
                            {typeof match.result === 'string' && match.result && match.result !== 'N/A' && (
                              <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600, mt: 0.5 }}>
                                {match.result}
                              </Typography>
                            )}
                          </Box>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              navigate(`/matches/${match.matchId}`); 
                            }}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              borderColor: '#d1d5db',
                              color: '#6b7280',
                              '&:hover': {
                                borderColor: '#9ca3af',
                                backgroundColor: '#f9fafb'
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
                  No recent matches available
                </Typography>
              )}
            </CardContent>
          </Card>

        {/* Teams Card */}
        {player.recentTeams && player.recentTeams.length > 0 && (
          <Card sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon />
                Teams Played For
              </Typography>
              {player.recentTeams && player.recentTeams.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(player.recentTeams as PlayerTeamData[]).map((team: PlayerTeamData, index: number) => (
                    <Box
                      key={`team-desktop-${index}-${team.id || team.teamId}`}
                      sx={{
                        p: 2,
                        backgroundColor: '#f8fafc',
                        borderRadius: 1,
                        borderLeft: '4px solid #10b981',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f1f5f9',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {team.teamName || 'Team'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
                  No team information available
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

      </Container>
      </Box>
    </>
  );
};

export default PlayerDetails;


