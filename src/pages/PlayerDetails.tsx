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
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
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

const MiniBar: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 64 }}>
    <Box sx={{ width: 8, height: 16, bgcolor: '#BFDBFE', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 40, bgcolor: '#60A5FA', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 28, bgcolor: '#93C5FD', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 52, bgcolor: '#3B82F6', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 24, bgcolor: '#93C5FD', borderRadius: 0.5 }} />
  </Box>
);

const PlayerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const [player, setPlayer] = useState<ApiPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PlayerAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) {
        setError('Player ID not provided');
        setLoading(false);
        return;
      }

      const numericPlayerId = parseInt(playerId, 10);
      if (isNaN(numericPlayerId)) {
        setError('Invalid player ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const playerData = await CricketApiService.getPlayer(numericPlayerId);
        
        if (!playerData) {
          setError('Player not found');
          return;
        }

        setPlayer(playerData);
      } catch (err) {
        setError('Failed to load player details. Please try again later.');
        console.error('Error fetching player details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  // Fetch player analysis when player data is loaded
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!player) return;

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
        } else {
          throw new Error(result.error || 'Failed to get analysis');
        }
      } catch (err) {
        console.error('Error fetching player analysis:', err);
        // Analysis is optional, so we don't set an error state
      } finally {
        setAnalysisLoading(false);
      }
    };

    fetchAnalysis();
  }, [player]);

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
              <Avatar sx={{ width: 64, height: 64, border: '3px solid #4A90E2' }}>A</Avatar>
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
                  sm: 'repeat(3, 1fr)', // 3 columns on small screens and up (since there are only 3 stats)
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
            </Box>
          </>
        )}

        {/* Charts */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Batting Last 10 Innings</Typography>
                <MiniBar />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Bowling Last 10 Innings</Typography>
                <MiniBar />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* AI Analysis Section */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          AI Performance Analysis
        </Typography>
        <Card sx={{ mb: 2, boxShadow: 1 }}>
          <CardContent>
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

        {/* Recent Matches */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Matches</Typography>
        {player.matchHistory && player.matchHistory.length > 0 ? (
          player.matchHistory.slice(0, 5).map((match, index) => {
            // Extract batting and bowling contributions from the match
            const battingContribution = match.contributions?.find(c => c.type === 'batting');
            const bowlingContribution = match.contributions?.find(c => c.type === 'bowling');
            
            // Format date
            const matchDate = new Date(match.matchDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short'
            });
            
            return (
              <Card key={match.matchId || index} sx={{ boxShadow: 1, mb: 1 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 36, height: 36 }}>
                    {match.team1?.charAt(0) || 'T'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {match.team1} vs {match.team2}
                    </Typography>
                    
                    {/* Performance Details */}
                    {(battingContribution || bowlingContribution) ? (
                      <Box sx={{ mt: 0.5 }}>
                        {battingContribution && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                            🏏 Bat: {battingContribution.runs || 0}{(!battingContribution.dismissal || battingContribution.dismissal === 'not out') ? '*' : ''} ({battingContribution.balls || 0})
                          </Typography>
                        )}
                        {bowlingContribution && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            🎯 Bowl: {bowlingContribution.wickets || 0}/{bowlingContribution.runs || 0} ({bowlingContribution.overs || 0})
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        Did not bat/bowl
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {matchDate}
                      </Typography>
                      {match.result && (
                        <Chip 
                          size="small" 
                          label={`${match.result.winner} won${match.result.margin ? ` by ${match.result.margin}` : ''}`}
                          color={match.result.winner === match.team1 ? 'success' : 'error'}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card sx={{ boxShadow: 1 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                No recent matches available
              </Typography>
            </CardContent>
          </Card>
        )}
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


