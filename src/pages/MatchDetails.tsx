import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { CricketApiService, type ApiMatch } from '../api/cricketApi';

const MatchDetails: React.FC = () => {
  const { matchId } = useParams();
  const [tab, setTab] = React.useState('summary');
  const [match, setMatch] = React.useState<ApiMatch | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      
      try {
        setLoading(true);
        const matchData = await CricketApiService.getMatch(matchId);
        if (!matchData) {
          setError('Match not found');
          return;
        }
        setMatch(matchData);
      } catch (err) {
        setError('Failed to load match details');
        console.error('Error fetching match:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !match) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error || 'Match not found'}</Alert>
      </Box>
    );
  }

  const getBattingData = (team: any) => {
    const innings = team?.innings;
    const players = team?.players || team?.squad?.players || [];
    
    let battingData = [];
    if (innings && Array.isArray(innings)) {
      battingData = innings;
    } else if (innings && innings.batting && Array.isArray(innings.batting)) {
      battingData = innings.batting;
    } else if (players.length > 0) {
      battingData = players.filter((p: any) => p.batting && (p.batting.runs > 0 || p.batting.balls > 0));
    }
    
    return battingData;
  };

  const getBowlingData = (team: any) => {
    const innings = team?.innings;
    const players = team?.players || team?.squad?.players || [];
    
    let bowlingData = [];
    if (innings && Array.isArray(innings)) {
      bowlingData = innings;
    } else if (innings && innings.bowling && Array.isArray(innings.bowling)) {
      bowlingData = innings.bowling;
    } else if (players.length > 0) {
      bowlingData = players.filter((p: any) => {
        if (!p.bowling) return false;
        const overs = typeof p.bowling.overs === 'string' ? parseFloat(p.bowling.overs) : p.bowling.overs;
        return p.bowling.wickets > 0 || overs > 0;
      });
    }
    
    return bowlingData;
  };

  return (
    <Box sx={{ bgcolor: '#e8eef5', minHeight: '100vh', pb: { xs: 10, md: 4 }, maxWidth: { xs: '100%', md: 1280 }, mx: { xs: 0, md: 'auto' }, width: '100%' }}>

      {/* Match Info Card */}
      <Box sx={{ p: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'visible', backgroundColor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5, pb: 2 }}>
            {/* Teams with Scores */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              {/* Team 1 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <Avatar 
                  src="/landingpage-256x256.png"
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    border: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>
                    {match.team1?.shortName || 'T1'}
                  </Typography>
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.3 }}>
                    {match.team1?.name || 'Team Malay'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    {match.status === 'live' && (
                      <Box 
                        sx={{ 
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 0.5,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}
                      >
                        LIVE
                      </Box>
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>
                      {match.team1?.score 
                        ? `${match.team1.score.runs}/${match.team1.score.wickets}` 
                        : '158/5'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                      ({(match as any).team1?.overs || '18 ov'})
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* VS */}
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', mx: 1.5 }}>
                VS
              </Typography>

              {/* Team 2 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, justifyContent: 'flex-end' }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.3 }}>
                    {match.team2?.name || 'Team Rupraj'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, justifyContent: 'flex-end' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>
                      {match.team2?.score 
                        ? `${match.team2.score.runs}/${match.team2.score.wickets}` 
                        : '442'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                      (all out {(match as any).team2?.overs || '17.3 ov'})
                    </Typography>
                  </Box>
                </Box>
                <Avatar 
                  src="/landingpage-512x512.png"
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    border: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>
                    {match.team2?.shortName || 'T2'}
                  </Typography>
                </Avatar>
              </Box>
            </Box>

            {/* Winner Banner */}
            {(match.status === 'completed' || match.result) && (
              <Box sx={{ 
                background: 'linear-gradient(135deg, #334d7a 0%, #4a6fa5 100%)',
                borderRadius: 1.5,
                px: 2,
                py: 1,
                textAlign: 'center',
                mb: 2
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#ffffff' }}>
                  {match.result && typeof match.result === 'object' && match.result.winner 
                    ? (typeof match.result.winner === 'string' 
                        ? `${match.result.winner} won by ${match.result.margin || '16 runs'}`
                        : `${match.result.winner.name || match.result.winner.shortName} won by ${match.result.margin || '16 runs'}`
                      )
                    : 'Team Malay won by 16 runs'
                  }
                </Typography>
              </Box>
            )}

            {/* Tab Buttons */}
            <Box sx={{ display: 'flex', gap: 0, backgroundColor: '#f1f5f9', borderRadius: 1, p: 0.5 }}>
              <Button
                variant="text"
                onClick={() => setTab('summary')}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.8,
                  borderRadius: 0.8,
                  backgroundColor: tab === 'summary' ? '#2c3e5f' : 'transparent',
                  color: tab === 'summary' ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: tab === 'summary' ? '#253451' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Summary
              </Button>
              <Button
                variant="text"
                onClick={() => setTab('scorecard')}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.8,
                  borderRadius: 0.8,
                  backgroundColor: tab === 'scorecard' ? '#2c3e5f' : 'transparent',
                  color: tab === 'scorecard' ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: tab === 'scorecard' ? '#253451' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Scorecard
              </Button>
              <Button
                variant="text"
                onClick={() => setTab('commentary')}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.8,
                  borderRadius: 0.8,
                  backgroundColor: tab === 'commentary' ? '#2c3e5f' : 'transparent',
                  color: tab === 'commentary' ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: tab === 'commentary' ? '#253451' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Commentary
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Summary Content */}
      {tab === 'summary' && (
        <Box sx={{ px: 2 }}>
          {/* Match Summary */}
          <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2, color: '#1e293b' }}>
                Match Summary
              </Typography>

              {/* Match Result */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                  Result: {match.result && typeof match.result === 'object' && match.result.winner
                    ? (typeof match.result.winner === 'string'
                        ? `${match.result.winner} won by ${match.result.margin || '16 runs'}`
                        : `${match.result.winner.name || match.result.winner.shortName} won by ${match.result.margin || '16 runs'}`
                      )
                    : 'Team Malay won by 16 runs'
                  }
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {match.venue} • {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString() : 'Recent Match'}
                </Typography>
              </Box>

              {/* Best Players */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2, color: '#1e293b' }}>
                Best Players
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Team 1 Best Player */}
                <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                    {match.team1?.name || 'Team Malay'}
                  </Typography>
                  {(() => {
                    const battingData = getBattingData(match.team1);
                    const bestBatter = battingData.reduce((best: any, player: any) => {
                      const runs = player.runs || player.batting?.runs || 0;
                      return runs > (best.runs || best.batting?.runs || 0) ? player : best;
                    }, {});

                    const bowlingData = getBowlingData(match.team1);
                    const bestBowler = bowlingData.reduce((best: any, player: any) => {
                      const wickets = player.wickets || player.bowling?.wickets || 0;
                      return wickets > (best.wickets || best.bowling?.wickets || 0) ? player : best;
                    }, {});

                    return (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Best Batter
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {bestBatter.name || bestBatter.playerName || 'Player'} - {bestBatter.runs || bestBatter.batting?.runs || 0} runs
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Best Bowler
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {bestBowler.name || bestBowler.playerName || 'Player'} - {bestBowler.wickets || bestBowler.bowling?.wickets || 0} wickets
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })()}
                </Box>

                {/* Team 2 Best Player */}
                <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                    {match.team2?.name || 'Team Rupraj'}
                  </Typography>
                  {(() => {
                    const battingData = getBattingData(match.team2);
                    const bestBatter = battingData.reduce((best: any, player: any) => {
                      const runs = player.runs || player.batting?.runs || 0;
                      return runs > (best.runs || best.batting?.runs || 0) ? player : best;
                    }, {});

                    const bowlingData = getBowlingData(match.team2);
                    const bestBowler = bowlingData.reduce((best: any, player: any) => {
                      const wickets = player.wickets || player.bowling?.wickets || 0;
                      return wickets > (best.wickets || best.bowling?.wickets || 0) ? player : best;
                    }, {});

                    return (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Best Batter
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {bestBatter.name || bestBatter.playerName || 'Player'} - {bestBatter.runs || bestBatter.batting?.runs || 0} runs
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Best Bowler
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {bestBowler.name || bestBowler.playerName || 'Player'} - {bestBowler.wickets || bestBowler.bowling?.wickets || 0} wickets
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })()}
                </Box>
              </Box>

              {/* AI Analysis */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 2, mt: 3, color: '#1e293b' }}>
                AI Match Analysis
              </Typography>
              <Box sx={{ p: 2, backgroundColor: '#f0f9ff', borderRadius: 1, border: '1px solid #bae6fd' }}>
                <Typography variant="body2" sx={{ color: '#0369a1', lineHeight: 1.6 }}>
                  This was a competitive match where {match.team1?.name || 'Team Malay'} dominated the bowling attack while {match.team2?.name || 'Team Rupraj'} showed strong batting resilience. The key moments came in the middle overs where the chasing team lost crucial wickets. The pitch appeared to assist spinners in the second innings, making run-scoring challenging. Overall, a well-contested game that showcased good cricket from both sides.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Scorecard Content */}
      {tab === 'scorecard' && (
        <Box sx={{ px: 2 }}>
          {/* Team 1 Batting */}
          <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', backgroundColor: '#ffffff', border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2, py: 1.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                  {match.team1?.name || 'Team Malay'} Batting
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, px: 2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Player Name</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Dismissal</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Runs</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Balls</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, px: 2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Strike Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getBattingData(match.team1).length > 0 ? getBattingData(match.team1).map((player: any, idx: number) => (
                      <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                        <TableCell sx={{ fontSize: '0.8rem', py: 1.5, px: 2, borderBottom: idx === getBattingData(match.team1).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.name || player.playerName || 'Player ' + (idx + 1)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, borderBottom: idx === getBattingData(match.team1).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.dismissal || player.batting?.dismissal || 'not out'}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, borderBottom: idx === getBattingData(match.team1).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.runs || player.batting?.runs || 150}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, borderBottom: idx === getBattingData(match.team1).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.balls || player.batting?.balls || 700}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, px: 2, borderBottom: idx === getBattingData(match.team1).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.strikeRate || player.batting?.strikeRate || 
                            (() => {
                              const runs = player.runs || player.batting?.runs || 0;
                              const balls = player.balls || player.batting?.balls || 0;
                              return balls > 0 ? ((runs / balls) * 100).toFixed(0) : '80';
                            })()}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.8rem', py: 1.5, px: 2, color: '#1e293b' }}>No batting data available</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, color: '#1e293b' }}>-</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, color: '#1e293b' }}>-</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, color: '#1e293b' }}>-</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, px: 2, color: '#1e293b' }}>-</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Team 1 Bowling */}
          <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {match.team1?.name || 'Team Malay'} Bowling
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}>O</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}>M</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}>W</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}>Econ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getBowlingData(match.team1).map((player: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.name || player.playerName || 'Player ' + (idx + 1)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.overs || player.bowling?.overs || 0}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.maidens || player.bowling?.maidens || 0}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.wickets || player.bowling?.wickets || 0}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.economy || player.bowling?.economy || 
                            (() => {
                              const overs = player.overs || player.bowling?.overs;
                              const runs = player.runs || player.bowling?.runs;
                              if (!overs || overs === 0) return '0.00';
                              const oversNum = typeof overs === 'string' ? parseFloat(overs) : overs;
                              return (runs / oversNum).toFixed(2);
                            })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Team 2 Batting */}
          <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', backgroundColor: '#ffffff', border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2, py: 1.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                  {match.team2?.name || 'Team Rupraj'} Batting
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, px: 2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Player Name</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Dismissal</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Runs</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Balls</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.2, px: 2, borderBottom: '1px solid #e5e7eb', color: '#475569' }}>Strike Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getBattingData(match.team2).length > 0 ? getBattingData(match.team2).map((player: any, idx: number) => (
                      <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                        <TableCell sx={{ fontSize: '0.8rem', py: 1.5, px: 2, borderBottom: idx === getBattingData(match.team2).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.name || player.playerName || 'Player ' + (idx + 1)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, borderBottom: idx === getBattingData(match.team2).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.dismissal || player.batting?.dismissal || 'not out'}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, borderBottom: idx === getBattingData(match.team2).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.runs || player.batting?.runs || 0}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, borderBottom: idx === getBattingData(match.team2).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.balls || player.batting?.balls || 0}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, px: 2, borderBottom: idx === getBattingData(match.team2).length - 1 ? 'none' : '1px solid #f1f5f9', color: '#1e293b' }}>
                          {player.strikeRate || player.batting?.strikeRate || 
                            (() => {
                              const runs = player.runs || player.batting?.runs || 0;
                              const balls = player.balls || player.batting?.balls || 0;
                              return balls > 0 ? ((runs / balls) * 100).toFixed(0) : '0';
                            })()}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.8rem', py: 1.5, px: 2, color: '#1e293b' }}>No batting data available</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, color: '#1e293b' }}>-</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, color: '#1e293b' }}>-</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, color: '#1e293b' }}>-</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8rem', py: 1.5, px: 2, color: '#1e293b' }}>-</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
          <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {match.team2?.name || 'Team Rupraj'} Bowling
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}>O</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}>M</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}>W</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', py: 1, borderBottom: '1px solid #e2e8f0' }}>Econ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getBowlingData(match.team2).map((player: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.name || player.playerName || 'Player ' + (idx + 1)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.overs || player.bowling?.overs || 0}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.maidens || player.bowling?.maidens || 0}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.wickets || player.bowling?.wickets || 0}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          {player.economy || player.bowling?.economy || 
                            (() => {
                              const overs = player.overs || player.bowling?.overs;
                              const runs = player.runs || player.bowling?.runs;
                              if (!overs || overs === 0) return '0.00';
                              const oversNum = typeof overs === 'string' ? parseFloat(overs) : overs;
                              return (runs / oversNum).toFixed(2);
                            })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Fall of Wickets */}
          <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 2 }}>
                Fall of Wickets
              </Typography>

              {/* Team 1 Innings */}
              <Accordion
                defaultExpanded
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: '1px solid #e2e8f0',
                  '&.Mui-expanded': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<Typography variant="body2" sx={{ fontSize: '1.2rem', color: '#64748b' }}>▼</Typography>}
                  sx={{
                    minHeight: 48,
                    '&.Mui-expanded': { minHeight: 48 },
                    backgroundColor: '#f8fafc',
                    borderRadius: 1,
                    px: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {match.team1?.name || 'Team Malay'} Innings
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 600 }}>
                        Player Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 600 }}>
                        Score (Over)
                      </Typography>
                    </Box>
                    {/* Sample wicket data for Team 1 - would come from API */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Player A
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        25 (4.2)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Player B
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        45 (7.5)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Player C
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        78 (12.1)
                      </Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Team 2 Innings */}
              <Accordion
                sx={{
                  borderRadius: 1,
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: '1px solid #e2e8f0',
                  '&.Mui-expanded': {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<Typography variant="body2" sx={{ fontSize: '1.2rem', color: '#64748b' }}>▶</Typography>}
                  sx={{
                    minHeight: 48,
                    '&.Mui-expanded': { minHeight: 48 },
                    backgroundColor: '#f8fafc',
                    borderRadius: 1,
                    px: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {match.team2?.name || 'Team Rupraj'} Innings
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f1f5f9' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 600 }}>
                        Player Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 600 }}>
                        Score (Over)
                      </Typography>
                    </Box>
                    {/* Sample wicket data for Team 2 - would come from API */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Player X
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        15 (2.3)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Player Y
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        35 (5.4)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Player Z
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        55 (8.2)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Player W
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        75 (11.5)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Player V
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                        95 (15.1)
                      </Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* Performance Graph */}
          <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 2 }}>
                Run Rate & Performance
              </Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center' }}>
                  Performance graph visualization<br/>
                  <span style={{ fontSize: '0.8rem' }}>
                    Current Run Rate: 8.2 | Required: 7.8<br/>
                    Partnership: 45 runs (5.2 overs)
                  </span>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Commentary Content */}
      {tab === 'commentary' && (
        <Box sx={{ px: 2 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Commentary not available
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default MatchDetails;
