import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
import { CricketApiService } from '../api/cricketApi';
import { calculateBattingImpactScore, calculateBowlingImpactScore, calculateFieldingImpactScore, calculateOverallImpactScore } from '../utils/impactCalculation';
import type { ApiPlayer } from '../api/cricketApi';

interface LeaderboardItem {
  rank: number;
  name: string;
  impactScore: number;
  matches: number;
  avatar: string;
  // Optional properties for different leaderboard types
  runs?: string | number;
  average?: string | number;
  wickets?: string | number;
  economy?: string | number;
  catches?: string | number;
  runOuts?: string | number;
  stumpings?: string | number;
  totalDismissals?: string | number;
}

interface PlayerMatch {
  fielding?: {
    catches?: number;
    runOuts?: number;
    stumpings?: number;
  };
  batting?: {
    fours?: number;
    sixes?: number;
  };
}

interface ProcessedPlayer extends ApiPlayer {
  totalCatches: number;
  totalRunOuts: number;
  totalStumpings: number;
  totalFours: number;
  totalSixes: number;
  totalRuns: number;
  battingAverage: number;
  battingStrikeRate: number;
  bowlingEconomy: number;
  matchesPlayed: number;
}

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = React.useState({
    topBatsmen: [] as LeaderboardItem[],
    topBowlers: [] as LeaderboardItem[],
    topFielders: [] as LeaderboardItem[],
    risingStars: [] as LeaderboardItem[],
    loading: true,
  });

  // Fetch leaderboard data
  React.useEffect(() => {
    let isMounted = true;

    const fetchLeaderboardData = async () => {
      try {
        setLeaderboardData(prev => ({ ...prev, loading: true }));
        const playersResponse = await CricketApiService.getPlayers({ page: 1, limit: 1000 });

        if (playersResponse.success && isMounted) {
          // Aggregate fielding stats from recentMatches for each player
          const playersWithFieldingStats = playersResponse.data.map((player: ApiPlayer) => {
            let totalCatches = 0;
            let totalRunOuts = 0;
            let totalStumpings = 0;
            let totalFours = 0;
            let totalSixes = 0;

            // Aggregate stats from recentMatches
            if (player.recentMatches) {
              (player.recentMatches as PlayerMatch[]).forEach((match: PlayerMatch) => {
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

            return {
              ...player,
              totalCatches,
              totalRunOuts,
              totalStumpings,
              totalFours,
              totalSixes,
              // Use V2 API fields with fallbacks to legacy fields
              totalRuns: player.careerStats?.batting?.runs || player.totalRuns || 0,
              totalWickets: player.careerStats?.bowling?.wickets || player.totalWickets || 0,
              battingAverage: player.careerStats?.batting?.average || player.battingAverage || 0,
              battingStrikeRate: player.careerStats?.batting?.strikeRate || player.battingStrikeRate || 0,
              bowlingEconomy: player.careerStats?.bowling?.economyRate || player.bowlingEconomy || 0,
              matchesPlayed: player.careerStats?.overall?.matchesPlayed || player.matchesPlayed || 0,
            } as ProcessedPlayer;
          });

          const players: ProcessedPlayer[] = playersWithFieldingStats;

          // Calculate top batsmen (players with most runs)
          const topBatsmen = players
            .map((player: ProcessedPlayer) => ({
              ...player,
              impactScore: calculateBattingImpactScore(player)
            }))
            .filter((player: ProcessedPlayer) => player.totalRuns && player.totalRuns > 0)
            .sort((a: ProcessedPlayer, b: ProcessedPlayer) => (b.totalRuns || 0) - (a.totalRuns || 0))
            .slice(0, 3)
            .map((player: ProcessedPlayer, index: number) => ({
              rank: index + 1,
              name: player.player?.name || player.name || 'Unknown',
              runs: player.totalRuns?.toLocaleString() || '0',
              average: player.battingAverage ? player.battingAverage.toFixed(2) : '0.00',
              matches: player.matchesPlayed || 0,
              impactScore: player.impactScore,
              avatar: (player.player?.name || player.name || 'U').charAt(0),
            }));

          // Calculate top bowlers (players with most wickets)
          const topBowlers = players
            .map((player: ProcessedPlayer) => ({
              ...player,
              impactScore: calculateBowlingImpactScore(player)
            }))
            .filter((player: ProcessedPlayer) => player.totalWickets && player.totalWickets > 0)
            .sort((a: ProcessedPlayer, b: ProcessedPlayer) => (b.totalWickets || 0) - (a.totalWickets || 0))
            .slice(0, 3)
            .map((player: ProcessedPlayer, index: number) => ({
              rank: index + 1,
              name: player.player?.name || player.name || 'Unknown',
              wickets: player.totalWickets?.toLocaleString() || '0',
              economy: player.bowlingEconomy ? player.bowlingEconomy.toFixed(2) : '0.00',
              matches: player.matchesPlayed || 0,
              impactScore: player.impactScore,
              avatar: (player.player?.name || player.name || 'U').charAt(0),
            }));

          // Calculate top fielders (players with most fielding impact)
          const topFielders = players
            .map((player: ProcessedPlayer) => ({
              ...player,
              impactScore: calculateFieldingImpactScore(player)
            }))
            .filter((player: ProcessedPlayer) => player.impactScore > 0)
            .sort((a: ProcessedPlayer, b: ProcessedPlayer) => b.impactScore - a.impactScore)
            .slice(0, 3)
            .map((player: ProcessedPlayer, index: number) => ({
              rank: index + 1,
              name: player.player?.name || player.name || 'Unknown',
              catches: player.totalCatches || 0,
              runOuts: player.totalRunOuts || 0,
              stumpings: player.totalStumpings || 0,
              totalDismissals: (player.totalCatches || 0) + (player.totalRunOuts || 0) + (player.totalStumpings || 0),
              impactScore: player.impactScore,
              matches: player.matchesPlayed || 0,
              avatar: (player.player?.name || player.name || 'U').charAt(0),
            }));
          // Calculate rising stars (highest impact score)
          const risingStars = players
            .map((player: ProcessedPlayer) => ({
              ...player,
              impactScore: calculateOverallImpactScore(player)
            }))
            .filter((player: ProcessedPlayer) => player.impactScore > 0)
            .sort((a: ProcessedPlayer, b: ProcessedPlayer) => b.impactScore - a.impactScore)
            .slice(0, 3)
            .map((player: ProcessedPlayer, index: number) => ({
              rank: index + 1,
              name: player.player?.name || player.name || 'Unknown',
              impactScore: player.impactScore,
              matches: player.matchesPlayed || 0,
              avatar: (player.player?.name || player.name || 'U').charAt(0),
            }));

          setLeaderboardData({
            topBatsmen,
            topBowlers,
            topFielders,
            risingStars,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        if (isMounted) {
          setLeaderboardData(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchLeaderboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Header with back navigation */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: { xs: 2, sm: 3, md: 4 },
        gap: 1
      }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          size="small" 
          sx={{ 
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'grey.100' }
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#333',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          🏆 Cricket Leaderboard
        </Typography>
      </Box>
      
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#666', 
          fontWeight: 400, 
          mb: { xs: 3, sm: 4 }, 
          textAlign: 'center',
          fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
        }}
      >
        Celebrating the best performers in our cricket community
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
        gap: { xs: 2, sm: 2.5, md: 3 }, 
        width: '100%'
      }}>
        {/* Top Batsmen */}
        <Card sx={{ 
          boxShadow: { xs: 2, sm: 3 }, 
          borderRadius: { xs: 2, sm: 2.5 }, 
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: { sm: 'translateY(-4px)' },
            boxShadow: { sm: 4 }
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              mb: { xs: 2, sm: 2.5, md: 3 },
              pb: 1.5,
              borderBottom: '2px solid',
              borderColor: '#4A90E2'
            }}>
              <SportsCricketIcon sx={{ color: '#4A90E2', fontSize: { xs: 26, sm: 30, md: 32 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Top Batsmen
              </Typography>
            </Box>
            {leaderboardData.loading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              </Box>
            ) : leaderboardData.topBatsmen.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                {leaderboardData.topBatsmen.map((player: any) => (
                  <Box 
                    key={player.rank} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 1.5, sm: 2 }, 
                      minWidth: 0,
                      p: { xs: 1, sm: 1.5 },
                      borderRadius: 1.5,
                      bgcolor: player.rank <= 3 ? 'rgba(74, 144, 226, 0.05)' : 'transparent',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(74, 144, 226, 0.08)'
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: { xs: 32, sm: 36, md: 40 }, 
                      height: { xs: 32, sm: 36, md: 40 }, 
                      borderRadius: '50%', 
                      background: player.rank === 1 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                                  player.rank === 2 ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' :
                                  player.rank === 3 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' :
                                  '#4A90E2',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                      fontWeight: 700,
                      color: 'white',
                      flexShrink: 0,
                      boxShadow: player.rank <= 3 ? 2 : 0
                    }}>
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#1a1a1a'
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                          display: 'block',
                          mt: 0.25
                        }}
                      >
                        <strong>{player.runs}</strong> runs • <strong>{player.average}</strong> avg
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          display: { xs: 'block', sm: 'none' }
                        }}
                      >
                        {player.matches} matches • {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: { xs: 'none', sm: 'flex' }, 
                      flexDirection: 'column', 
                      alignItems: 'flex-end',
                      flexShrink: 0,
                      gap: 0.25
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
                        {player.matches} matches
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#4A90E2' }}>
                        {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">No data available</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Top Bowlers */}
        <Card sx={{ 
          boxShadow: { xs: 2, sm: 3 }, 
          borderRadius: { xs: 2, sm: 2.5 }, 
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: { sm: 'translateY(-4px)' },
            boxShadow: { sm: 4 }
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              mb: { xs: 2, sm: 2.5, md: 3 },
              pb: 1.5,
              borderBottom: '2px solid',
              borderColor: '#EF4444'
            }}>
              <SportsBaseballIcon sx={{ color: '#EF4444', fontSize: { xs: 26, sm: 30, md: 32 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Top Bowlers
              </Typography>
            </Box>
            {leaderboardData.loading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              </Box>
            ) : leaderboardData.topBowlers.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                {leaderboardData.topBowlers.map((player: any) => (
                  <Box 
                    key={player.rank} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 1.5, sm: 2 }, 
                      minWidth: 0,
                      p: { xs: 1, sm: 1.5 },
                      borderRadius: 1.5,
                      bgcolor: player.rank <= 3 ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(239, 68, 68, 0.08)'
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: { xs: 32, sm: 36, md: 40 }, 
                      height: { xs: 32, sm: 36, md: 40 }, 
                      borderRadius: '50%', 
                      background: player.rank === 1 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                                  player.rank === 2 ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' :
                                  player.rank === 3 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' :
                                  '#EF4444',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                      fontWeight: 700,
                      color: 'white',
                      flexShrink: 0,
                      boxShadow: player.rank <= 3 ? 2 : 0
                    }}>
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#1a1a1a'
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                          display: 'block',
                          mt: 0.25
                        }}
                      >
                        <strong>{player.wickets}</strong> wickets • <strong>{player.economy}</strong> eco
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          display: { xs: 'block', sm: 'none' }
                        }}
                      >
                        {player.matches} matches • {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: { xs: 'none', sm: 'flex' }, 
                      flexDirection: 'column', 
                      alignItems: 'flex-end',
                      flexShrink: 0,
                      gap: 0.25
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
                        {player.matches} matches
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#EF4444' }}>
                        {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">No data available</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Top Fielders */}
        <Card sx={{ 
          boxShadow: { xs: 2, sm: 3 }, 
          borderRadius: { xs: 2, sm: 2.5 }, 
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: { sm: 'translateY(-4px)' },
            boxShadow: { sm: 4 }
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              mb: { xs: 2, sm: 2.5, md: 3 },
              pb: 1.5,
              borderBottom: '2px solid',
              borderColor: '#F59E0B'
            }}>
              <StarIcon sx={{ color: '#F59E0B', fontSize: { xs: 26, sm: 30, md: 32 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Top Fielders
              </Typography>
            </Box>
            {leaderboardData.loading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              </Box>
            ) : leaderboardData.topFielders.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                {leaderboardData.topFielders.map((player: any) => (
                  <Box 
                    key={player.rank} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 1.5, sm: 2 }, 
                      minWidth: 0,
                      p: { xs: 1, sm: 1.5 },
                      borderRadius: 1.5,
                      bgcolor: player.rank <= 3 ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(245, 158, 11, 0.08)'
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: { xs: 32, sm: 36, md: 40 }, 
                      height: { xs: 32, sm: 36, md: 40 }, 
                      borderRadius: '50%', 
                      background: player.rank === 1 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                                  player.rank === 2 ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' :
                                  player.rank === 3 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' :
                                  '#F59E0B',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                      fontWeight: 700,
                      color: 'white',
                      flexShrink: 0,
                      boxShadow: player.rank <= 3 ? 2 : 0
                    }}>
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#1a1a1a'
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                          display: 'block',
                          mt: 0.25
                        }}
                      >
                        <strong>{player.catches}</strong> ct • <strong>{player.runOuts}</strong> ro • <strong>{player.stumpings}</strong> st
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          display: { xs: 'block', sm: 'none' }
                        }}
                      >
                        {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: { xs: 'none', sm: 'flex' }, 
                      flexDirection: 'column', 
                      alignItems: 'flex-end',
                      flexShrink: 0,
                      gap: 0.25
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#F59E0B' }}>
                        {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">No data available</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Rising Stars */}
        <Card sx={{ 
          boxShadow: { xs: 2, sm: 3 }, 
          borderRadius: { xs: 2, sm: 2.5 }, 
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: { sm: 'translateY(-4px)' },
            boxShadow: { sm: 4 }
          }
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, flex: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              mb: { xs: 2, sm: 2.5, md: 3 },
              pb: 1.5,
              borderBottom: '2px solid',
              borderColor: '#10B981'
            }}>
              <WhatshotIcon sx={{ color: '#10B981', fontSize: { xs: 26, sm: 30, md: 32 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Rising Stars
              </Typography>
            </Box>
            {leaderboardData.loading ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              </Box>
            ) : leaderboardData.risingStars.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                {leaderboardData.risingStars.map((player: any) => (
                  <Box 
                    key={player.rank} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 1.5, sm: 2 }, 
                      minWidth: 0,
                      p: { xs: 1, sm: 1.5 },
                      borderRadius: 1.5,
                      bgcolor: player.rank <= 3 ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(16, 185, 129, 0.08)'
                      }
                    }}
                  >
                    <Box sx={{ 
                      width: { xs: 32, sm: 36, md: 40 }, 
                      height: { xs: 32, sm: 36, md: 40 }, 
                      borderRadius: '50%', 
                      background: player.rank === 1 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                                  player.rank === 2 ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' :
                                  player.rank === 3 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' :
                                  '#10B981',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                      fontWeight: 700,
                      color: 'white',
                      flexShrink: 0,
                      boxShadow: player.rank <= 3 ? 2 : 0
                    }}>
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#1a1a1a'
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                          display: 'block',
                          mt: 0.25
                        }}
                      >
                        Impact Score: <strong>{Math.round(player.impactScore || 0)}</strong>
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          display: { xs: 'block', sm: 'none' }
                        }}
                      >
                        {player.matches} matches
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: { xs: 'none', sm: 'flex' }, 
                      flexDirection: 'column', 
                      alignItems: 'flex-end',
                      flexShrink: 0,
                      gap: 0.25
                    }}>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
                        {player.matches} matches
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">No data available</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Leaderboard;