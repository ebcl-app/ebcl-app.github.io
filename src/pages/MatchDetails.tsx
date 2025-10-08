import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CricketApiService, type ApiMatch } from '../api/cricketApi';

interface MatchAnalysis {
  matchSummary: string;
  executiveSummary: string;
  teamAnalysis: {
    team1Analysis: string;
    team2Analysis: string;
    teamComparison: string;
  };
  performanceAnalysis: {
    battingAnalysis: string;
    bowlingAnalysis: string;
    fieldingAnalysis: string;
    turningPoints: string;
  };
  tacticalInsights: {
    captaincyDecisions: string;
    matchStrategy: string;
    keyDecisions: string;
  };
  playerPerformances: {
    outstandingPerformances: string;
    disappointingPerformances: string;
    matchWinners: string;
  };
  matchTrends: {
    momentumShifts: string;
    pressureHandling: string;
    adaptationSkills: string;
  };
  finalVerdict: {
    fairResult: string;
    lessonsLearned: string;
    predictability: string;
  };
}

const SummaryScore: React.FC<{ team: string; score: string; sub: string; align?: 'left' | 'right' }>
  = ({ team, score, sub, align = 'left' }) => (
  <Box sx={{ textAlign: align, minWidth: 120 }}>
    <Typography 
      variant="body1" 
      sx={{ 
        fontWeight: 700, 
        mb: 1
      }}
    >
      {team}
    </Typography>
    <Typography 
      variant="h4" 
      sx={{ 
        fontWeight: 900, 
        mb: 0.5
      }}
    >
      {score}
    </Typography>
    <Typography 
      variant="body2"
    >
      {sub}
    </Typography>
  </Box>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }>
  = ({ title, children }) => (
  <Card sx={{ 
    mb: 2
  }}>
    <CardContent sx={{ p: 0 }}>
      <Box sx={{ 
        p: 2,
        borderBottom: '1px solid rgba(0,0,0,0.12)'
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 700
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

const MiniBar: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 64 }}>
    <Box sx={{ width: 8, height: 16, bgcolor: '#BFDBFE', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 40, bgcolor: '#60A5FA', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 28, bgcolor: '#93C5FD', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 52, bgcolor: '#3B82F6', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 24, bgcolor: '#93C5FD', borderRadius: 0.5 }} />
  </Box>
);

// Helper functions for match progression charts
const generateRunProgressionData = (innings: any[]) => {
  if (!innings || innings.length < 2) return [];

  const maxOvers = Math.max(innings[0]?.totalOvers || 0, innings[1]?.totalOvers || 0);
  const data = [];

  for (let over = 1; over <= maxOvers; over++) {
    const dataPoint: any = { over };

    // Add team 1 runs up to this over
    if (innings[0]) {
      const team1Runs = Math.round((innings[0].totalRuns / innings[0].totalOvers) * over);
      dataPoint[innings[0].battingTeam] = Math.min(team1Runs, innings[0].totalRuns);
    }

    // Add team 2 runs up to this over
    if (innings[1]) {
      const team2Runs = Math.round((innings[1].totalRuns / innings[1].totalOvers) * over);
      dataPoint[innings[1].battingTeam] = Math.min(team2Runs, innings[1].totalRuns);
    }

    data.push(dataPoint);
  }

  return data;
};

const getWicketMarkers = (inning: any) => {
  if (!inning || !inning.fallOfWickets) return [];

  return inning.fallOfWickets.map((fow: any, index: number) => ({
    over: fow.overs || 0,
    wickets: index + 1
  }));
};

// Calculate player impacts using the same formula as Man of the Match
const calculatePlayerImpacts = (innings: any[]) => {
  const playerPerformances = new Map();

  // Collect all player performances from all innings
  for (const inning of innings) {
    // Process batsmen
    if (inning.batsmen && Array.isArray(inning.batsmen)) {
      for (const batsman of inning.batsmen) {
        if (batsman.player && batsman.runs !== undefined) {
          const playerId = typeof batsman.player === 'object' ? batsman.player.id : batsman.player;

          if (!playerPerformances.has(playerId)) {
            playerPerformances.set(playerId, {
              player: batsman.player,
              batting: { runs: 0, balls: 0, fours: 0, sixes: 0 },
              bowling: { wickets: 0, runs: 0, overs: 0 }
            });
          }

          const perf = playerPerformances.get(playerId);
          perf.batting.runs += batsman.runs || 0;
          perf.batting.balls += batsman.balls || 0;
          perf.batting.fours += batsman.fours || 0;
          perf.batting.sixes += batsman.sixes || 0;
        }
      }
    }

    // Process bowlers
    if (inning.bowling && Array.isArray(inning.bowling)) {
      for (const bowler of inning.bowling) {
        if (bowler.player) {
          const playerId = typeof bowler.player === 'object' ? bowler.player.id : bowler.player;

          if (!playerPerformances.has(playerId)) {
            playerPerformances.set(playerId, {
              player: bowler.player,
              batting: { runs: 0, balls: 0, fours: 0, sixes: 0 },
              bowling: { wickets: 0, runs: 0, overs: 0 }
            });
          }

          const perf = playerPerformances.get(playerId);
          perf.bowling.wickets += bowler.wickets || 0;
          perf.bowling.runs += bowler.runs || 0;
          perf.bowling.overs += parseFloat(bowler.overs) || 0;
        }
      }
    }
  }

  // Calculate net impact for each player
  const impacts = [];
  for (const [_playerId, perf] of playerPerformances) {
    // Calculate batting impact
    const battingRuns = perf.batting.runs;
    const battingBalls = perf.batting.balls;
    const strikeRate = battingBalls > 0 ? (battingRuns / battingBalls) * 100 : 0;
    const boundaries = perf.batting.fours + (perf.batting.sixes * 2); // 6s worth double

    const battingImpact = battingRuns + (strikeRate - 100) * 0.1 + boundaries;

    // Calculate bowling impact
    const bowlingWickets = perf.bowling.wickets;
    const bowlingOvers = perf.bowling.overs;
    const economy = bowlingOvers > 0 ? perf.bowling.runs / bowlingOvers : 0;

    const bowlingImpact = (bowlingWickets * 25) - (economy - 6) * 2;

    // Net impact
    const netImpact = battingImpact + bowlingImpact;

    impacts.push({
      player: perf.player,
      netImpact: parseFloat(netImpact.toFixed(2)),
      batting: {
        runs: battingRuns,
        balls: battingBalls,
        fours: perf.batting.fours,
        sixes: perf.batting.sixes,
        strikeRate: strikeRate.toFixed(2)
      },
      bowling: {
        wickets: bowlingWickets,
        runs: perf.bowling.runs,
        overs: bowlingOvers.toFixed(1),
        economy: economy.toFixed(2)
      }
    });
  }

  // Sort by net impact (highest first) and return top 3
  return impacts
    .sort((a, b) => b.netImpact - a.netImpact)
    .slice(0, 3);
};

const MatchDetails: React.FC = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [tab, setTab] = React.useState(0);
  const [match, setMatch] = React.useState<ApiMatch | null>(null);
  const [innings, setInnings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [analysis, setAnalysis] = React.useState<MatchAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = React.useState(false);
  const [playerImpacts, setPlayerImpacts] = React.useState<any[]>([]);
  
  // Refs to prevent duplicate API calls
  const dataLoadedRef = React.useRef(false);

  // Reset refs when matchId changes
  React.useEffect(() => {
    dataLoadedRef.current = false;
    setMatch(null);
    setInnings([]);
    setAnalysis(null);
    setAnalysisLoading(false);
    setLoading(true);
    setError(null);
  }, [matchId]);

  // Single useEffect to handle all data fetching
  React.useEffect(() => {
    const fetchAllData = async () => {
      if (!matchId || dataLoadedRef.current) return;

      try {
        dataLoadedRef.current = true; // Mark as loading immediately

        const numericMatchId = parseInt(matchId, 10);
        if (isNaN(numericMatchId)) {
          setError('Invalid match ID');
          dataLoadedRef.current = false;
          return;
        }

        // Fetch match data
        const matchData = await CricketApiService.getMatch(numericMatchId);
        if (!matchData) {
          setError('Match not found');
          dataLoadedRef.current = false;
          return;
        }

        setMatch(matchData);
        setInnings(matchData.innings || []);
        setLoading(false);

        // Calculate player impacts
        if (matchData.innings && matchData.innings.length > 0) {
          const impacts = calculatePlayerImpacts(matchData.innings);
          setPlayerImpacts(impacts);
        }

        // Fetch analysis data
        try {
          setAnalysisLoading(true);
          
          // Preprocess matchData for analysis - convert winner objects to strings
          const analysisMatchData = {
            ...matchData,
            winner: typeof matchData.winner === 'object' && matchData.winner?.name 
              ? matchData.winner.name 
              : matchData.winner,
            result: matchData.result ? {
              ...matchData.result,
              winner: typeof matchData.result.winner === 'object' && matchData.result.winner?.name
                ? matchData.result.winner.name
                : matchData.result.winner
            } : matchData.result,
            toss: matchData.toss ? {
              ...matchData.toss,
              winner: matchData.toss.winner && typeof matchData.toss.winner === 'object' && (matchData.toss.winner as any)?.name
                ? (matchData.toss.winner as any).name
                : matchData.toss.winner
            } : matchData.toss
          };
          
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/match-analysis`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matchData: analysisMatchData }),
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
        } catch (analysisErr) {
          console.error('Error fetching match analysis:', analysisErr);
          // Analysis is optional, so we don't set an error state
        } finally {
          setAnalysisLoading(false);
        }

      } catch (err) {
        setError('Failed to load match details. Please try again later.');
        console.error('Error fetching match details:', err);
        dataLoadedRef.current = false;
        setLoading(false);
      }
    };

    fetchAllData();
  }, [matchId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!match) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Match not found</Alert>
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
            Match Details
          </Typography>
        </Box>

        {/* Tabs for Summary/Scorecards/Commentary */}
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            centered
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                minHeight: 48,
                borderRadius: '8px 8px 0 0',
                mx: 1,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab label="Summary" />
            <Tab label="Scorecards" />
            <Tab label="Commentary" />
          </Tabs>
        </Box>

        {/* Summary Tab */}
        {tab === 0 && (
          <>
            {/* Summary Card */}
            <Card sx={{ mb: 2, boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: analysis ? 1 : 0 }}>
                  <SportsCricketIcon sx={{ fontSize: 48, color: '#4A90E2' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {match.venue} • {match.matchType}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={match.matchType} color="primary" variant="outlined" size="small" />
                      <Chip label={match.venue} size="small" variant="outlined" />
                    </Box>
                  </Box>
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
                    {analysis.matchSummary}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Key Stats */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Key Statistics
            </Typography>

            {/* Match Stats */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr 1fr', // 2 columns on mobile
                  sm: 'repeat(4, 1fr)', // 4 columns on small screens and up
                },
                gap: { xs: 1.5, sm: 2 },
                mb: 2,
              }}
            >
              <Card sx={{
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
                    {innings.length > 0 ? `${innings[0].totalRuns}/${innings[0].totalWickets}` : (match.team1Score ? `${match.team1Score}` : '0/0')}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    {match.team1?.name || 'Team 1'}
                  </Typography>
                  {innings.length > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, mt: 0.5 }}
                    >
                      ({innings[0].totalOvers} overs)
                    </Typography>
                  )}
                </CardContent>
              </Card>
              <Card sx={{
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
                    {innings.length > 1 ? `${innings[1].totalRuns}/${innings[1].totalWickets}` : (match.team2Score ? `${match.team2Score}` : '0/0')}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    {match.team2?.name || 'Team 2'}
                  </Typography>
                  {innings.length > 1 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' }, mt: 0.5 }}
                    >
                      ({innings[1].totalOvers} overs)
                    </Typography>
                  )}
                </CardContent>
              </Card>
              <Card sx={{
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gridColumn: { xs: 'span 2', sm: 'span 1' }, // Span 2 columns on mobile, 1 on larger screens
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
                    {typeof match.winner === 'object' && match.winner?.name ? match.winner.name : match.winner || 'N/A'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Winner
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{
                minHeight: { xs: 80, sm: 100 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gridColumn: { xs: 'span 2', sm: 'span 1' }, // Span 2 columns on mobile, 1 on larger screens
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
                    {match.result?.margin || 'N/A'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Margin
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Charts */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {match.team1?.name || 'Team 1'} Performance
                    </Typography>
                    <MiniBar />
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {match.team2?.name || 'Team 2'} Performance
                    </Typography>
                    <MiniBar />
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Player Impact Rankings */}
            {playerImpacts.length > 0 && (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, mt: 3 }}>
                  Player Impact Rankings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  {playerImpacts.map((impact, index) => {
                    const rank = index + 1;
                    const hasBatting = impact.batting.runs > 0 || impact.batting.balls > 0;
                    const hasBowling = impact.bowling.wickets > 0 || parseFloat(impact.bowling.overs) > 0;

                    let performance = '';
                    let bgColor = '#e3f2fd';

                    if (hasBatting && hasBowling) {
                      performance = `${impact.batting.runs} runs & ${impact.bowling.wickets} wickets`;
                      bgColor = '#f3e5f5';
                    } else if (hasBatting) {
                      performance = `${impact.batting.runs} runs (${impact.batting.strikeRate} SR)`;
                      bgColor = '#e3f2fd';
                    } else if (hasBowling) {
                      performance = `${impact.bowling.wickets} wickets (${impact.bowling.economy} econ)`;
                      bgColor = '#ffebee';
                    }

                    return (
                      <Card key={typeof impact.player === 'object' ? impact.player.id : impact.player} sx={{ 
                        border: rank === 1 ? '2px solid #FFD700' : rank === 2 ? '2px solid #C0C0C0' : '2px solid #CD7F32',
                        bgcolor: bgColor
                      }}>
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              bgcolor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1.1rem'
                            }}>
                              {rank}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                {typeof impact.player === 'object' ? impact.player.name : impact.player}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                {performance}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                {impact.netImpact}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Impact Score
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </>
            )}

            {/* AI Match Analysis Section */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              AI Match Analysis
            </Typography>
            <Card sx={{ mb: 2, boxShadow: 1 }}>
              <CardContent>
                {analysisLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <PsychologyIcon sx={{ color: '#4A90E2' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Analyzing match performance...
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Using AI to provide comprehensive match insights based on scores and statistics
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

                    {/* Team Analysis */}
                    <Accordion sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GroupIcon fontSize="small" />
                          Team Analysis
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          <Box sx={{ flex: 1, minWidth: '250px' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                              {match.team1?.name || 'Team 1'} Analysis
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {analysis.teamAnalysis.team1Analysis}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: '250px' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                              {match.team2?.name || 'Team 2'} Analysis
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {analysis.teamAnalysis.team2Analysis}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Team Comparison
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {analysis.teamAnalysis.teamComparison}
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    {/* Performance Analysis */}
                    <Accordion sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
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
                            Turning Points
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {analysis.performanceAnalysis.turningPoints}
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
                          Captaincy Decisions
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.tacticalInsights.captaincyDecisions}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Match Strategy
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.tacticalInsights.matchStrategy}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Key Decisions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysis.tacticalInsights.keyDecisions}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    {/* Player Performances */}
                    <Accordion sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#f57c00', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarIcon fontSize="small" />
                          Player Performances
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Outstanding Performances
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.playerPerformances.outstandingPerformances}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Disappointing Performances
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.playerPerformances.disappointingPerformances}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Match Winners
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysis.playerPerformances.matchWinners}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    {/* Match Trends */}
                    <Accordion sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#388e3c', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimelineIcon fontSize="small" />
                          Match Trends
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Momentum Shifts
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.matchTrends.momentumShifts}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Pressure Handling
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.matchTrends.pressureHandling}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Adaptation Skills
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysis.matchTrends.adaptationSkills}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>

                    {/* Final Verdict */}
                    <Accordion sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SchoolIcon fontSize="small" />
                          Final Verdict
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Fair Result
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.finalVerdict.fairResult}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Lessons Learned
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {analysis.finalVerdict.lessonsLearned}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Predictability
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {analysis.finalVerdict.predictability}
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

            {/* Match Progression Charts */}
            {innings.length >= 2 && (
              <Card sx={{ mb: 1.5 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon />
                    Match Progression
                  </Typography>

                  {/* Run Accumulation Chart */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Run Accumulation Over Overs
                    </Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <LineChart
                          data={generateRunProgressionData(innings)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="over"
                            label={{ value: 'Overs', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            label={{ value: 'Runs', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            formatter={(value, name) => [value, name]}
                            labelFormatter={(label) => `Over ${label}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey={innings[0]?.battingTeam || 'Team 1'}
                            stroke="#1976d2"
                            strokeWidth={2}
                            dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey={innings[1]?.battingTeam || 'Team 2'}
                            stroke="#d32f2f"
                            strokeWidth={2}
                            dot={{ fill: '#d32f2f', strokeWidth: 2, r: 4 }}
                          />
                          {/* Wicket markers for Team 1 */}
                          {getWicketMarkers(innings[0]).map((wicket: any, index: number) => (
                            <ReferenceLine
                              key={`wicket-team1-${index}`}
                              x={wicket.over}
                              stroke="#1976d2"
                              strokeDasharray="5 5"
                              label={{ value: `W${wicket.wickets}`, position: 'top' }}
                            />
                          ))}
                          {/* Wicket markers for Team 2 */}
                          {getWicketMarkers(innings[1]).map((wicket: any, index: number) => (
                            <ReferenceLine
                              key={`wicket-team2-${index}`}
                              x={wicket.over}
                              stroke="#d32f2f"
                              strokeDasharray="5 5"
                              label={{ value: `W${wicket.wickets}`, position: 'top' }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>

                  {/* Run Rate Comparison */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Run Rate Comparison
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={`Team 1 RR: ${innings[0] ? (innings[0].totalRuns / innings[0].totalOvers).toFixed(2) : '0.00'}`}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Team 2 RR: ${innings[1] ? (innings[1].totalRuns / innings[1].totalOvers).toFixed(2) : '0.00'}`}
                        color="error"
                        variant="outlined"
                      />
                      <Chip
                        label={`Required RR: ${innings[1] && innings[0] ? ((innings[0].totalRuns + 1) / innings[1].totalOvers).toFixed(2) : 'N/A'}`}
                        color="warning"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Scorecards Tab */}
        {tab === 1 && (
          <>
            {/* Summary */}
            <Card sx={{ 
              mb: 1.5
            }}>
              <CardContent sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                py: 3
              }}>
                <SummaryScore
                  team={match.team1?.name || 'Team 1'}
                  score={innings.length > 0 ? `${innings[0].totalRuns}/${innings[0].totalWickets}` : (match.team1Score ? `${match.team1Score}` : '0/0')}
                  sub={innings.length > 0 ? `(${innings[0].totalOvers} overs)` : ''}
                  align="left"
                />
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  mx: 2
                }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: 1
                    }}
                  >
                    VS
                  </Typography>
                  <Typography variant="caption">
                    {match.venue}
                  </Typography>
                </Box>
                <SummaryScore
                  team={match.team2?.name || 'Team 2'}
                  score={innings.length > 1 ? `${innings[1].totalRuns}/${innings[1].totalWickets}` : (match.team2Score ? `${match.team2Score}` : '0/0')}
                  sub={innings.length > 1 ? `(${innings[1].totalOvers} overs)` : ''}
                  align="right"
                />
              </CardContent>
            </Card>

            {/* Result */}
            {(match.winner || match.result?.winner) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Chip 
                  label={`${typeof match.winner === 'object' && match.winner?.name ? match.winner.name : match.winner || match.result?.winner} won${match.result?.margin ? ` by ${match.result.margin}` : ''}`} 
                  color="success" 
                  variant="filled" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    px: 3,
                    py: 1
                  }} 
                />
              </Box>
            )}

            {/* Innings Accordions */}
            {innings.map((inning, index) => (
              <Accordion key={index} defaultExpanded={index === 0} sx={{ mb: 1 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: index === 0 ? '#e3f2fd' : '#f3e5f5',
                    '&:hover': { bgcolor: index === 0 ? '#bbdefb' : '#e1bee7' },
                    borderRadius: 1,
                    mb: 0.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="h6" sx={{
                      fontWeight: 700,
                      color: index === 0 ? '#1976d2' : '#7b1fa2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      {index === 0 ? '🏏' : '🎯'} {index === 0 ? 'First' : 'Second'} Innings
                    </Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {inning.battingTeam?.name || inning.battingTeam || 'Unknown Team'}
                      </Typography>
                      <Chip
                        label={`${inning.totalRuns}/${inning.totalWickets} (${inning.totalOvers} overs)`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: index === 0 ? '#e8f5e8' : '#fce4ec',
                          color: index === 0 ? '#2e7d32' : '#c2185b'
                        }}
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Batting Section */}
                    <Box>
                      <Typography variant="subtitle2" sx={{
                        fontWeight: 700,
                        color: '#1976d2',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.9rem'
                      }}>
                        <SportsCricketIcon fontSize="small" />
                        {inning.battingTeam?.name || inning.battingTeam || 'Unknown Team'} Batting
                      </Typography>
                      <Box sx={{
                        bgcolor: '#f8f9fa',
                        borderRadius: 1,
                        p: 1.5,
                        border: '1px solid #e9ecef'
                      }}>
                        {/* Batting Table Header */}
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: '3fr 1fr 1fr 1fr 1.5fr',
                          gap: 0.5,
                          mb: 1,
                          pb: 0.5,
                          borderBottom: '1px solid #dee2e6'
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976d2', fontSize: '0.75rem' }}>BATSMAN</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976d2', textAlign: 'center', fontSize: '0.75rem' }}>R</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976d2', textAlign: 'center', fontSize: '0.75rem' }}>B</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976d2', textAlign: 'center', fontSize: '0.75rem' }}>SR</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976d2', fontSize: '0.75rem' }}>STATUS</Typography>
                        </Box>

                        {/* Batting Table Rows */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          {inning.batsmen?.map((batsman: any, batsmanIndex: number) => {
                            const strikeRate = batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(2) : '0.00';
                            return (
                              <Box
                                key={batsmanIndex}
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: '3fr 1fr 1fr 1fr 1.5fr',
                                  gap: 0.5,
                                  py: 0.5,
                                  px: 0.5,
                                  alignItems: 'center',
                                  bgcolor: batsmanIndex % 2 === 0 ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                                  borderRadius: 0.5,
                                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' }
                                }}
                              >
                                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', textAlign: 'left' }}>
                                  {batsman.player?.name || batsman.playerName || `Player ${batsmanIndex + 1}`}
                                </Typography>
                                <Typography sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#1976d2' }}>{batsman.runs || 0}</Typography>
                                <Typography sx={{ textAlign: 'center', fontSize: '0.8rem' }}>{batsman.balls || 0}</Typography>
                                <Typography sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{strikeRate}</Typography>
                                <Typography sx={{
                                  fontSize: '0.7rem',
                                  color: batsman.status === 'not out' || (typeof batsman.status === 'object' && batsman.status?.text === 'not out') ? 'success.main' : 'error.main',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.25,
                                  justifyContent: 'flex-start'
                                }}>
                                  {batsman.status === 'not out' || (typeof batsman.status === 'object' && batsman.status?.text === 'not out') ? '🏏' : '❌'} {typeof batsman.status === 'object' ? batsman.status?.text || 'out' : batsman.status || 'not out'}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>

                        {/* Batting Total */}
                        <Box sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: '#e8f5e8',
                          borderRadius: 0.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#2e7d32', fontSize: '0.8rem' }}>
                            Total: {inning.totalRuns}/{inning.totalWickets} ({inning.totalOvers} overs)
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.75rem' }}>
                            RR: {inning.totalOvers > 0 ? (inning.totalRuns / inning.totalOvers).toFixed(2) : '0.00'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Bowling Section */}
                    <Box>
                      <Typography variant="subtitle2" sx={{
                        fontWeight: 700,
                        color: '#f57c00',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.9rem'
                      }}>
                        <SportsBaseballIcon fontSize="small" />
                        {inning.bowlingTeam?.name || inning.bowlingTeam || 'Unknown Team'} Bowling
                      </Typography>
                      <Box sx={{
                        bgcolor: '#f8f9fa',
                        borderRadius: 1,
                        p: 1.5,
                        border: '1px solid #e9ecef'
                      }}>
                        {/* Bowling Table Header */}
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr',
                          gap: 0.5,
                          mb: 1,
                          pb: 0.5,
                          borderBottom: '1px solid #dee2e6'
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57c00', fontSize: '0.75rem' }}>BOWLER</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57c00', textAlign: 'center', fontSize: '0.75rem' }}>O</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57c00', textAlign: 'center', fontSize: '0.75rem' }}>R</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57c00', textAlign: 'center', fontSize: '0.75rem' }}>W</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57c00', textAlign: 'center', fontSize: '0.75rem' }}>ECON</Typography>
                        </Box>

                        {/* Bowling Table Rows */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          {inning.bowling?.map((bowler: any, bowlerIndex: number) => {
                            const economy = bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(2) : '0.00';
                            return (
                              <Box
                                key={bowlerIndex}
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr',
                                  gap: 0.5,
                                  py: 0.5,
                                  px: 0.5,
                                  alignItems: 'center',
                                  bgcolor: bowlerIndex % 2 === 0 ? 'rgba(245, 124, 0, 0.04)' : 'transparent',
                                  borderRadius: 0.5,
                                  '&:hover': { bgcolor: 'rgba(245, 124, 0, 0.08)' }
                                }}
                              >
                                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', textAlign: 'left' }}>
                                  {bowler.player?.name || bowler.playerName || `Bowler ${bowlerIndex + 1}`}
                                </Typography>
                                <Typography sx={{ textAlign: 'center', fontSize: '0.8rem' }}>{bowler.overs || 0}</Typography>
                                <Typography sx={{ textAlign: 'center', fontSize: '0.8rem' }}>{bowler.runs || 0}</Typography>
                                <Typography sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#d32f2f' }}>{bowler.wickets || 0}</Typography>
                                <Typography sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{economy}</Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Box>

                    {/* Fall of Wickets Section */}
                    {inning.fallOfWickets && inning.fallOfWickets.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{
                          fontWeight: 700,
                          color: '#c2185b',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: '0.9rem'
                        }}>
                          <TimelineIcon fontSize="small" />
                          Fall of Wickets
                        </Typography>
                        <Box sx={{
                          bgcolor: '#f8f9fa',
                          borderRadius: 1,
                          p: 1.5,
                          border: '1px solid #e9ecef'
                        }}>
                          {inning.fallOfWickets.map((fow: any, fowIndex: number) => (
                            <Box
                              key={fowIndex}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 0.75,
                                px: 1,
                                borderBottom: fowIndex < inning.fallOfWickets.length - 1 ? '1px solid #e9ecef' : 'none',
                                '&:hover': { bgcolor: 'rgba(194, 24, 91, 0.04)' }
                              }}
                            >
                              <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: '#c2185b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                fontWeight: 700,
                                color: 'white',
                                fontSize: '0.75rem',
                                flexShrink: 0
                              }}>
                                {fow.wicketNumber || fow.wicket}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                  <Box component="span" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#c2185b' }}>
                                    {fow.score}-{fow.wicketNumber || fow.wicket}
                                  </Box>
                                  {' - '}
                                  <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    {fow.player || fow.playerName || fow.batsmanName}
                                  </Box>
                                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8rem', ml: 1 }}>
                                    ({fow.overs || fow.over} overs)
                                  </Box>
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        )}

        {/* Commentary Tab */}
        {tab === 2 && (
          <SectionCard title="MATCH COMMENTARY">
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
              mx: -3,
              mb: -3
            }}>
              <SportsCricketIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Live Commentary Coming Soon
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ball-by-ball updates and expert analysis will be available here during live matches.
              </Typography>
            </Box>
          </SectionCard>
        )}
      </Container>
    </Box>
  );
};

export default MatchDetails;


