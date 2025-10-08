import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  Button,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
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
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { CricketApiService, type ApiPlayer } from '../api/cricketApi';
import { calculateImpactScore } from '../utils/impactCalculation';

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
const getLast10BattingInnings = (matchHistory: any[]): number[] => {
  const battingScores: number[] = [];
  matchHistory.forEach(match => {
    if (match.contributions) {
      match.contributions.forEach((contribution: any) => {
        if (contribution.type === 'batting') {
          battingScores.push(contribution.runs || 0);
        }
      });
    }
  });
  return battingScores.slice(-10);
};

// Helper function to get last 10 bowling figures (wickets)
const getLast10BowlingFigures = (matchHistory: any[]): number[] => {
  const bowlingFigures: number[] = [];
  matchHistory.forEach(match => {
    if (match.contributions) {
      match.contributions.forEach((contribution: any) => {
        if (contribution.type === 'bowling') {
          bowlingFigures.push(contribution.wickets || 0);
        }
      });
    }
  });
  return bowlingFigures.slice(-10);
};

// Helper function to calculate win percentage
const calculateWinPercentage = (matchHistory: any[]): number => {
  if (!matchHistory || matchHistory.length === 0) return 0;

  let wins = 0;
  let totalMatches = 0;

  matchHistory.forEach(match => {
    if (match.result && match.result.winner && match.result.winner !== 'N/A') {
      totalMatches++;

      // Determine player's team
      let playerTeam = (match.team1 as any)?.name || match.team1;
      const hasBattingInning1 = match.contributions?.some((c: any) => c.type === 'batting' && c.inningNumber === 1);
      const hasBowlingInning1 = match.contributions?.some((c: any) => c.type === 'bowling' && c.inningNumber === 1);

      if (hasBattingInning1) {
        playerTeam = (match.team1 as any)?.name || match.team1;
      } else if (hasBowlingInning1) {
        playerTeam = (match.team2 as any)?.name || match.team2;
      }

      if (match.result.winner === playerTeam) {
        wins++;
      }
    }
  });

  return totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
};

// Helper function to get highest impact score
const getHighestImpactScore = (matchHistory: any[]): number => {
  if (!matchHistory || matchHistory.length === 0) return 0;

  let highestImpact = 0;
  matchHistory.forEach(match => {
    if (match.contributions && match.contributions.length > 0) {
      const impact = calculateImpactScore(match.contributions);
      if (impact > highestImpact) {
        highestImpact = impact;
      }
    }
  });
  return highestImpact;
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

  // State to prevent duplicate API calls
  const [playerDataLoaded, setPlayerDataLoaded] = useState(false);
  const [analysisDataLoaded, setAnalysisDataLoaded] = useState(false);
  const lastFetchedPlayerId = React.useRef<string | null>(null);
  const lastAnalyzedPlayerId = React.useRef<string | null>(null);

  // View mode for recent matches
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
  const calculatePlayerStats = (matchHistory: any[]): {
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
    let matchesPlayed = matchHistory.length;

    matchHistory.forEach(match => {
      if (match.contributions) {
        match.contributions.forEach((contribution: any) => {
          if (contribution.type === 'batting') {
            totalRuns += contribution.runs || 0;
            totalBalls += contribution.balls || 0;
            // Count dismissals (not counting 'not out')
            if (contribution.dismissal && contribution.dismissal !== 'not out') {
              totalDismissals += 1;
            }
          } else if (contribution.type === 'bowling') {
            totalWickets += contribution.wickets || 0;
            totalBowlingRuns += contribution.runs || 0;
            totalOvers += Number(contribution.overs) || 0;
          }
        });
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

      const numericPlayerId = parseInt(playerId, 10);
      if (isNaN(numericPlayerId)) {
        setError('Invalid player ID');
        lastFetchedPlayerId.current = null;
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const playerData = await CricketApiService.getPlayer(numericPlayerId);
        
        if (!playerData) {
          setError('Player not found');
          lastFetchedPlayerId.current = null;
          return;
        }

        // Calculate stats from match history and update player data
        let finalPlayerData: ApiPlayer = playerData;
        if (playerData.matchHistory && playerData.matchHistory.length > 0) {
          const calculatedStats = calculatePlayerStats(playerData.matchHistory);
          
          // Update player data with calculated stats
          finalPlayerData = {
            id: playerData.id,
            numericId: playerData.numericId,
            displayId: playerData.displayId,
            name: playerData.name,
            email: playerData.email,
            role: playerData.role,
            battingStyle: playerData.battingStyle,
            bowlingStyle: playerData.bowlingStyle,
            nationality: playerData.nationality,
            isActive: playerData.isActive,
            matchHistory: playerData.matchHistory,
            createdAt: playerData.createdAt,
            updatedAt: playerData.updatedAt,
            matchesPlayed: calculatedStats.matchesPlayed,
            totalRuns: calculatedStats.totalRuns,
            battingAverage: calculatedStats.battingAverage,
            battingStrikeRate: calculatedStats.battingStrikeRate,
            totalWickets: calculatedStats.totalWickets,
            bowlingAverage: calculatedStats.bowlingAverage,
            bowlingEconomy: calculatedStats.bowlingEconomy,
            totalOvers: calculatedStats.totalOvers,
          };
          
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
        }
        
        setPlayer(finalPlayerData);
        
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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/player-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerData: player }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setAnalysis(result.data);
          setAnalysisDataLoaded(true);
        } else {
          throw new Error(result.error || 'Failed to get analysis');
        }
      } catch (err) {
        console.error('Error fetching player analysis:', err);
        lastAnalyzedPlayerId.current = null;
        // Analysis is optional, so we don't set an error state
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

  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="md" sx={{ pt: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Player Details
          </Typography>
        </Box>

        {/* Summary Card */}
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: analysis ? 1 : 0 }}>
              <Avatar sx={{ 
                width: 64, 
                height: 64, 
                border: '3px solid #4A90E2',
                bgcolor: getPlayerIconColor(player.role)
              }}>
                {getPlayerIcon(player.role)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{player.name}</Typography>
                <Typography variant="body2" color="text.secondary">{player.role}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={player.role} color="primary" variant="outlined" size="small" />
                  {player.battingStyle && <Chip label={player.battingStyle} size="small" variant="outlined" />}
                  {player.bowlingStyle && <Chip label={player.bowlingStyle} size="small" variant="outlined" />}
                </Box>
              </Box>
              <Button variant="contained" startIcon={<SportsCricketIcon />} sx={{ textTransform: 'none' }}>Follow</Button>
            </Box>
            {analysis && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  fontStyle: 'italic',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.3, sm: 1.4 }
                }}
              >
                {analysis.playerDescription}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Key Stats */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Key Statistics
        </Typography>

        {/* Batting Stats */}
        {(player.role === 'batsman' || player.role === 'all-rounder' || player.role === 'wicket-keeper') && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}>
              Batting Statistics
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
                      color: '#1976d2',
                      fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {player.matchesPlayed || 0}
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
                    {player.totalRuns || 0}
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
                    {player.battingAverage?.toFixed(1) || '0.0'}
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
                    {player.battingStrikeRate?.toFixed(1) || '0.0'}
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
        {(player.role === 'bowler' || player.role === 'all-rounder') && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#d32f2f' }}>
              Bowling Statistics
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
                    {player.totalWickets || 0}
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
                    {player.bowlingAverage?.toFixed(1) || '0.0'}
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
                    {player.bowlingEconomy?.toFixed(1) || '0.0'}
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
                    {player.totalOvers?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Total Overs
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* Charts and Additional Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {/* Batting Last 10 Innings */}
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Batting Last 10 Innings</Typography>
                <DynamicBarChart
                  data={getLast10BattingInnings(player.matchHistory || [])}
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
                  data={getLast10BowlingFigures(player.matchHistory || [])}
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
                  {calculateWinPercentage(player.matchHistory || [])}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on {player.matchHistory?.length || 0} matches played
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
                  {getHighestImpactScore(player.matchHistory || [])}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Best match contribution rating
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

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

        {/* Recent Matches */}
        <Accordion sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon />
                Recent Matches
              </Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newViewMode) => {
                  if (newViewMode !== null) {
                    setViewMode(newViewMode);
                  }
                }}
                size="small"
              >
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value="grid">
                  <ViewModuleIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {player.matchHistory && player.matchHistory.length > 0 ? (
              viewMode === 'list' ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Match</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Performance</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Impact</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {player.matchHistory.slice(0, 5).map((match, index) => {
                        // Extract batting, bowling, and fielding contributions from the match
                        const battingContribution = match.contributions?.find(c => c.type === 'batting');
                        const bowlingContribution = match.contributions?.find(c => c.type === 'bowling');
                        const fieldingContributions = match.contributions?.filter(c => c.type === 'fielding') || [];

                        // Format date
                        const matchDate = new Date(match.matchDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short'
                        });

                        // Determine if player was on winning or losing team
                        let playerTeam = (match.team1 as any)?.name || match.team1; // Handle both object and string formats
                        const hasBattingInning1 = match.contributions?.some(c => c.type === 'batting' && c.inningNumber === 1);
                        const hasBowlingInning1 = match.contributions?.some(c => c.type === 'bowling' && c.inningNumber === 1);

                        if (hasBattingInning1) {
                          playerTeam = (match.team1 as any)?.name || match.team1; // Batted in inning 1, so on team1
                        } else if (hasBowlingInning1) {
                          playerTeam = (match.team2 as any)?.name || match.team2; // Bowled in inning 1, so on team2
                        }

                        const winnerName = (match.result?.winner as any)?.name || match.result?.winner;
                        const isWinner = match.result && winnerName === playerTeam;
                        const isLoser = match.result && winnerName !== playerTeam && winnerName !== 'N/A';

                        return (
                          <TableRow key={match.matchId || index} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {((match.team1 as any)?.name || (match.team1 as any)?.shortName || 'T').charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {(match.team1 as any)?.name || match.team1} vs {(match.team2 as any)?.name || match.team2}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {(battingContribution || bowlingContribution || fieldingContributions.length > 0) ? (
                                <Box>
                                  {battingContribution && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      🏏 {battingContribution.runs || 0}{(!battingContribution.dismissal || battingContribution.dismissal === 'not out') ? '*' : ''} ({battingContribution.balls || 0})
                                    </Typography>
                                  )}
                                  {bowlingContribution && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      🎯 {bowlingContribution.wickets || 0}/{bowlingContribution.runs || 0} ({bowlingContribution.overs || 0})
                                    </Typography>
                                  )}
                                  {fieldingContributions.length > 0 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      🏃 {fieldingContributions.map(fc => `${fc.count || 0} ${fc.action || 'action'}${fc.count !== 1 ? 's' : ''}`).join(', ')}
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Did not contribute
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{matchDate}</Typography>
                            </TableCell>
                            <TableCell>
                              {match.result && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Chip
                                    size="small"
                                    label={`${match.result.winner} won${match.result.margin ? ` by ${match.result.margin}` : ''}`}
                                    color={match.result.winner === ((match.team1 as any)?.name || match.team1) ? 'success' : 'error'}
                                    variant="outlined"
                                    clickable={false}
                                    sx={{ fontSize: '0.7rem', height: '20px' }}
                                  />
                                  <Chip
                                    size="small"
                                    label={isWinner ? 'Won' : isLoser ? 'Lost' : 'N/A'}
                                    color={isWinner ? 'success' : isLoser ? 'error' : 'default'}
                                    variant="filled"
                                    clickable={false}
                                    sx={{ fontSize: '0.7rem', height: '20px', fontWeight: 600 }}
                                  />
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              {match.contributions && match.contributions.length > 0 && (
                                <Chip
                                  size="small"
                                  label={`${calculateImpactScore(match.contributions)}`}
                                  color="primary"
                                  variant="filled"
                                  sx={{ fontSize: '0.7rem', height: '20px', fontWeight: 600 }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)'
                    },
                    gap: 2,
                  }}
                >
                  {player.matchHistory.slice(0, 5).map((match, index) => {
                    // Extract batting, bowling, and fielding contributions from the match
                    const battingContribution = match.contributions?.find(c => c.type === 'batting');
                    const bowlingContribution = match.contributions?.find(c => c.type === 'bowling');
                    const fieldingContributions = match.contributions?.filter(c => c.type === 'fielding') || [];

                    // Format date
                    const matchDate = new Date(match.matchDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short'
                    });

                    // Determine if player was on winning or losing team
                    let playerTeam = (match.team1 as any)?.name || match.team1; // Default assumption
                    const hasBattingInning1 = match.contributions?.some(c => c.type === 'batting' && c.inningNumber === 1);
                    const hasBowlingInning1 = match.contributions?.some(c => c.type === 'bowling' && c.inningNumber === 1);

                    if (hasBattingInning1) {
                      playerTeam = (match.team1 as any)?.name || match.team1; // Batted in inning 1, so on team1
                    } else if (hasBowlingInning1) {
                      playerTeam = (match.team2 as any)?.name || match.team2; // Bowled in inning 1, so on team2
                    }

                    const isWinner = match.result && match.result.winner === playerTeam;
                    const isLoser = match.result && match.result.winner !== playerTeam && match.result.winner !== 'N/A';

                    return (
                      <Card key={match.matchId || index} sx={{ boxShadow: 1 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 36, height: 36 }}>
                            {((match.team1 as any)?.name || (match.team1 as any)?.shortName || 'T').charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {(match.team1 as any)?.name || match.team1} vs {(match.team2 as any)?.name || match.team2}
                            </Typography>

                            {/* Performance Details */}
                            {(battingContribution || bowlingContribution || fieldingContributions.length > 0) ? (
                              <Box sx={{ mt: 0.5 }}>
                                {battingContribution && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                                    🏏 Bat: {battingContribution.runs || 0}{(!battingContribution.dismissal || battingContribution.dismissal === 'not out') ? '*' : ''} ({battingContribution.balls || 0})
                                  </Typography>
                                )}
                                {bowlingContribution && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: fieldingContributions.length > 0 ? 0.25 : 0 }}>
                                    🎯 Bowl: {bowlingContribution.wickets || 0}/{bowlingContribution.runs || 0} ({bowlingContribution.overs || 0})
                                  </Typography>
                                )}
                                {fieldingContributions.length > 0 && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    🏃 Field: {fieldingContributions.map(fc => `${fc.count || 0} ${fc.action || 'action'}${fc.count !== 1 ? 's' : ''}`).join(', ')}
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                Did not contribute
                              </Typography>
                            )}

                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {matchDate}
                              </Typography>
                              <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.5,
                                mt: 0.5,
                                alignItems: 'center'
                              }}>
                                {match.result && (
                                  <Chip
                                    size="small"
                                    label={`${match.result.winner} won${match.result.margin ? ` by ${match.result.margin}` : ''}`}
                                    color={match.result.winner === ((match.team1 as any)?.name || match.team1) ? 'success' : 'error'}
                                    variant="outlined"
                                    clickable={false}
                                    sx={{ fontSize: '0.7rem', height: '20px' }}
                                  />
                                )}
                                {/* Player Result Status */}
                                {match.result && (
                                  <Chip
                                    size="small"
                                    label={isWinner ? 'Won' : isLoser ? 'Lost' : 'N/A'}
                                    color={isWinner ? 'success' : isLoser ? 'error' : 'default'}
                                    variant="filled"
                                    clickable={false}
                                    sx={{ fontSize: '0.7rem', height: '20px', fontWeight: 600 }}
                                  />
                                )}
                                {/* Impact Score */}
                                {match.contributions && match.contributions.length > 0 && (
                                  <Chip
                                    size="small"
                                    label={`Impact: ${calculateImpactScore(match.contributions)}`}
                                    color="primary"
                                    variant="filled"
                                    clickable={false}
                                    sx={{ fontSize: '0.7rem', height: '20px', fontWeight: 600 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )
            ) : (
              <Card sx={{ boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    No recent matches available
                  </Typography>
                </CardContent>
              </Card>
            )}
          </AccordionDetails>
        </Accordion>
      </Container>

      {/* Floating Action */}
      <Paper sx={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 72, px: 2, py: 1, borderRadius: 999, boxShadow: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: '#4A90E2', width: 44, height: 44 }}>+</Avatar>
        <Typography sx={{ fontWeight: 700 }}>Add to Favorites</Typography>
      </Paper>
    </Box>
  );
};

export default PlayerDetails;


