import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import SportsCricketOutlined from '@mui/icons-material/SportsCricket';
import SportsBaseballOutlined from '@mui/icons-material/SportsBaseball';
import StarOutlined from '@mui/icons-material/Star';
import { CricketApiService } from '../api/cricketApi';
import type { ApiMatch } from '../api/cricketApi';
import { useNavigate } from 'react-router-dom';
import { calculateBattingImpactScore, calculateBowlingImpactScore, calculateFieldingImpactScore, type PlayerStats } from '../utils/impactCalculation';

interface LeaderboardPlayer extends PlayerStats {
  id: string | number;
  player?: {
    id: string | number;
    name: string;
  };
  battingImpact: number;
  bowlingImpact: number;
  fieldingImpact: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState<ApiMatch[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'batsman' | 'bowler' | 'fielder'>('batsman');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent matches (all statuses)
        const matchesResponse = await CricketApiService.getMatches(undefined, { page: 1, limit: 5 });
        if (matchesResponse.data && matchesResponse.data.length > 0) {
          setRecentMatches(matchesResponse.data);
        }

        // Fetch top player
        const playersResponse = await CricketApiService.getPlayers({ page: 1, limit: 1 });
        if (playersResponse.data && playersResponse.data.length > 0) {
          // Top player data fetched but not currently used in UI
        }

        // Fetch leaderboard data
        const leaderboardResponse = await CricketApiService.getPlayers({ page: 1, limit: 50 });
        if (leaderboardResponse.success && leaderboardResponse.data) {
          // Process leaderboard data similar to Leaderboard.tsx
          const processedPlayers = leaderboardResponse.data.map((player: any) => {
            let totalCatches = 0;
            let totalRunOuts = 0;
            let totalStumpings = 0;
            let totalFours = 0;
            let totalSixes = 0;

            // Aggregate stats from recentMatches
            if (player.recentMatches) {
              player.recentMatches.forEach((match: any) => {
                if (match.fielding) {
                  totalCatches += match.fielding.catches || 0;
                  totalRunOuts += match.fielding.runOuts || 0;
                  totalStumpings += match.fielding.stumpings || 0;
                }
                if (match.batting) {
                  totalFours += match.batting.fours || 0;
                  totalSixes += match.batting.sixes || 0;
                }
              });
            }

            // Also use careerStats if available for more accurate totals
            if (player.careerStats?.fielding) {
              totalCatches = Math.max(totalCatches, player.careerStats.fielding.catches || 0);
              totalRunOuts = Math.max(totalRunOuts, player.careerStats.fielding.runOuts || 0);
              totalStumpings = Math.max(totalStumpings, player.careerStats.fielding.stumpings || 0);
            }

            // Create processed player object with correct field names for impact calculations
            const processedPlayer = {
              ...player,
              totalCatches,
              totalRunOuts,
              totalStumpings,
              totalFours,
              totalSixes,
              // Use V2 API fields with fallbacks to legacy fields
              totalRuns: player.careerStats?.batting?.runs || player.totalRuns || 0,
              totalBalls: player.careerStats?.batting?.balls || player.totalBalls || 0,
              totalNotOuts: player.careerStats?.batting?.notOuts || player.totalNotOuts || 0,
              totalWickets: player.careerStats?.bowling?.wickets || player.totalWickets || 0,
              totalOvers: player.careerStats?.bowling?.overs || player.totalOvers || 0,
              totalRunsConceded: player.careerStats?.bowling?.runs || player.totalRunsConceded || 0,
            };

            return {
              ...processedPlayer,
              battingImpact: calculateBattingImpactScore(processedPlayer),
              bowlingImpact: calculateBowlingImpactScore(processedPlayer),
              fieldingImpact: calculateFieldingImpactScore(processedPlayer),
            };
          });

          setLeaderboardData(processedPlayers);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions for displaying data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    }
  };

  const getFilteredLeaderboard = () => {
    if (!leaderboardData.length) return [];

    const sortedData = [...leaderboardData];

    switch (leaderboardFilter) {
      case 'batsman':
        sortedData.sort((a, b) => (b.battingImpact || 0) - (a.battingImpact || 0));
        break;
      case 'bowler':
        sortedData.sort((a, b) => (b.bowlingImpact || 0) - (a.bowlingImpact || 0));
        break;
      case 'fielder':
        sortedData.sort((a, b) => (b.fieldingImpact || 0) - (a.fieldingImpact || 0));
        break;
    }

    return sortedData.slice(0, 3); // Top 3 players
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CircularProgress size={40} sx={{ color: '#2563eb' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: { xs: '100%', md: 1280 },
        mx: { xs: 0, md: 'auto' },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        minHeight: { xs: 'auto', md: 'calc(100vh - 80px)' },
        width: '100%',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Stack spacing={{ xs: 2.5, md: 4 }} sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 4 }, pb: { xs: 3, md: 4 } }}>
          {/* CRICKET UNLEASHED Title */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#1e293b',
                letterSpacing: -0.5,
                lineHeight: 1.2,
                mb: 0.5,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              CRICKET
              <br />
              UNLEASHED
            </Typography>
          </Box>

          {/* Recent Matches */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 600, mb: 1.5, fontSize: { xs: '0.9rem', md: '1rem' } }}>
              Recent Matches
            </Typography>
            {recentMatches.length > 0 ? (
              <Box
                sx={{
                  display: { xs: 'flex', md: 'grid' },
                  gridTemplateColumns: { md: 'repeat(auto-fill, minmax(380px, 1fr))' },
                  gap: 2,
                  overflowX: { xs: 'auto', md: 'visible' },
                  pb: { xs: 1, md: 0 },
                  scrollSnapType: { xs: 'x mandatory', md: 'none' },
                  '&::-webkit-scrollbar': {
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f5f9',
                    borderRadius: '2px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#cbd5e1',
                    borderRadius: '2px',
                    '&:hover': {
                      backgroundColor: '#94a3b8',
                    },
                  },
                }}
              >
                {recentMatches.slice(0, 5).map((match) => (
                  <Card
                    key={match.displayId}
                    onClick={() => navigate(`/matches/${match.displayId}`)}
                    sx={{
                      width: { xs: 'calc(100vw - 32px)', md: 'auto' }, // Full width on mobile minus padding, auto on desktop
                      maxWidth: { xs: 'none', md: 'none' },
                      flexShrink: { xs: 0, md: 'initial' },
                      scrollSnapAlign: { xs: 'start', md: 'initial' },
                      backgroundColor: '#ffffff',
                      color: '#1e293b',
                      borderRadius: 2.5,
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.1)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Status Badge */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: match.status === 'completed'
                              ? '#dcfce7'
                              : match.status === 'live'
                              ? '#fef2f2'
                              : '#eff6ff',
                            color: match.status === 'completed'
                              ? '#166534'
                              : match.status === 'live'
                              ? '#dc2626'
                              : '#2563eb',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            border: `1px solid ${match.status === 'completed'
                              ? '#bbf7d0'
                              : match.status === 'live'
                              ? '#fecaca'
                              : '#bfdbfe'}`
                          }}
                        >
                          {match.status === 'completed' ? 'Completed' : match.status === 'live' ? 'Live' : 'Upcoming'}
                        </Typography>
                        {match.status === 'completed' && match.result?.winner && (
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {typeof match.result.winner === 'string' ? match.result.winner : (match.result.winner.name || match.result.winner.shortName || 'Unknown')} won
                          </Typography>
                        )}
                      </Box>

                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                          <Avatar
                            src="/landingpage-256x256.png"
                            variant="rounded"
                            sx={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#f1f5f9',
                              border: '2px solid #e2e8f0',
                            }}
                          >
                            <SportsCricketOutlined sx={{ color: '#64748b' }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                            {match.team1?.name || 'TBD'}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" sx={{ fontWeight: 600, px: 1, color: '#64748b' }}>
                          VS
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'right', color: '#1e293b' }}>
                            {match.team2?.name || 'TBD'}
                          </Typography>
                          <Avatar
                            src="/landingpage-512x512.png"
                            variant="rounded"
                            sx={{
                              width: 36,
                              height: 36,
                              backgroundColor: '#f1f5f9',
                              border: '2px solid #e2e8f0',
                            }}
                          >
                            <SportsCricketOutlined sx={{ color: '#64748b' }} />
                          </Avatar>
                        </Stack>
                      </Stack>

                      {/* Match Details */}
                      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {formatDate(match.scheduledDate)}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {match.venue || 'Venue TBD'}
                        </Typography>
                      </Box>

                      {/* Score for completed matches */}
                      {match.status === 'completed' && match.team1?.score && match.team2?.score && (
                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e2e8f0' }}>
                          {/* Team Scores */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              {match.team1?.shortName || 'T1'}: {match.team1.score.runs}/{match.team1.score.wickets}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              {match.team2?.shortName || 'T2'}: {match.team2.score.runs}/{match.team2.score.wickets}
                            </Typography>
                          </Box>
                          {/* Winner Result */}
                          {match.result?.winner && (
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textAlign: 'center', display: 'block', backgroundColor: '#dcfce7', px: 1, py: 0.5, borderRadius: 1 }}>
                              🏆 {typeof match.result.winner === 'string' ? match.result.winner : (match.result.winner.name || match.result.winner.shortName || 'Unknown')} won
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Card sx={{ borderRadius: 2.5, backgroundColor: '#f8fafc', boxShadow: 'none', border: '1px dashed #cbd5e1' }}>
                <CardContent sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    No recent matches available
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Leaderboard */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 600, mb: 1.5, fontSize: { xs: '0.9rem', md: '1rem' } }}>
              Leaderboard
            </Typography>

            {/* Filter Buttons */}
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.5 }, mb: { xs: 2, md: 2.5 } }}>
              <Button
                variant={leaderboardFilter === 'batsman' ? 'contained' : 'outlined'}
                onClick={() => setLeaderboardFilter('batsman')}
                startIcon={<SportsCricketOutlined />}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  py: { xs: 0.5, md: 1 },
                  borderRadius: 2,
                  backgroundColor: leaderboardFilter === 'batsman' ? '#2563eb' : 'transparent',
                  borderColor: '#cbd5e1',
                  color: leaderboardFilter === 'batsman' ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: leaderboardFilter === 'batsman' ? '#1d4ed8' : '#f8fafc',
                    borderColor: '#cbd5e1',
                  },
                }}
              >
                Batsman
              </Button>
              <Button
                variant={leaderboardFilter === 'bowler' ? 'contained' : 'outlined'}
                onClick={() => setLeaderboardFilter('bowler')}
                startIcon={<SportsBaseballOutlined />}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  py: { xs: 0.5, md: 1 },
                  borderRadius: 2,
                  backgroundColor: leaderboardFilter === 'bowler' ? '#2563eb' : 'transparent',
                  borderColor: '#cbd5e1',
                  color: leaderboardFilter === 'bowler' ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: leaderboardFilter === 'bowler' ? '#1d4ed8' : '#f8fafc',
                    borderColor: '#cbd5e1',
                  },
                }}
              >
                Bowler
              </Button>
              <Button
                variant={leaderboardFilter === 'fielder' ? 'contained' : 'outlined'}
                onClick={() => setLeaderboardFilter('fielder')}
                startIcon={<StarOutlined />}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  py: { xs: 0.5, md: 1 },
                  borderRadius: 2,
                  backgroundColor: leaderboardFilter === 'fielder' ? '#2563eb' : 'transparent',
                  borderColor: '#cbd5e1',
                  color: leaderboardFilter === 'fielder' ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: leaderboardFilter === 'fielder' ? '#1d4ed8' : '#f8fafc',
                    borderColor: '#cbd5e1',
                  },
                }}
              >
                Fielder
              </Button>
            </Box>

            {/* Leaderboard List */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'grid' },
                flexDirection: { xs: 'column', md: 'initial' },
                gridTemplateColumns: { md: 'repeat(auto-fill, minmax(300px, 1fr))' },
                gap: { xs: 1, md: 2 },
              }}
            >
              {getFilteredLeaderboard().length > 0 ? getFilteredLeaderboard().map((player, index) => (
                <Card
                  key={player.player?.id || index}
                  onClick={() => navigate(`/players/${player.id}`)}
                  sx={{
                    borderRadius: 2.5,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ py: 2, px: 2.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: index < 3 ? '#ffffff' : '#64748b',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Avatar 
                        src={leaderboardFilter === 'batsman' ? '/batsman.png' : leaderboardFilter === 'bowler' ? '/bowler.png' : '/fielder.png'} 
                        variant="rounded" 
                        sx={{ width: 40, height: 40, backgroundColor: '#e2e8f0' }}
                      >
                        <SportsCricketOutlined sx={{ color: '#64748b' }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>
                          {player.name || 'Unknown Player'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {leaderboardFilter === 'batsman' && (
                            <>
                              {player.totalRuns || 0} runs • {player.battingImpact?.toFixed(1) || '0.0'} pts
                            </>
                          )}
                          {leaderboardFilter === 'bowler' && (
                            <>
                              {player.totalWickets || 0} wickets • {player.bowlingImpact?.toFixed(1) || '0.0'} pts
                            </>
                          )}
                          {leaderboardFilter === 'fielder' && (
                            <>
                              {player.totalCatches || 0} catches • {player.fieldingImpact?.toFixed(1) || '0.0'} pts
                            </>
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )) : (
                <Card sx={{ borderRadius: 2.5, backgroundColor: '#f8fafc', boxShadow: 'none', border: '1px dashed #cbd5e1' }}>
                  <CardContent sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      No leaderboard data available
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>

        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;