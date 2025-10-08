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

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = React.useState({
    topBatsmen: [] as any[],
    topBowlers: [] as any[],
    topFielders: [] as any[],
    risingStars: [] as any[],
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
          // Aggregate fielding stats from match history for each player
          const playersWithFieldingStats = playersResponse.data.map((player: any) => {
            let totalCatches = 0;
            let totalRunOuts = 0;
            let totalStumpings = 0;
            let totalFours = 0;
            let totalSixes = 0;

            // Aggregate stats from match history
            if (player.matchHistory) {
              player.matchHistory.forEach((match: any) => {
                if (match.contributions) {
                  match.contributions.forEach((contribution: any) => {
                    if (contribution.type === 'fielding') {
                      if (contribution.action === 'catch') {
                        totalCatches += contribution.count || 0;
                      } else if (contribution.action === 'run out') {
                        totalRunOuts += contribution.count || 0;
                      } else if (contribution.action === 'stumping') {
                        totalStumpings += contribution.count || 0;
                      }
                    } else if (contribution.type === 'batting') {
                      totalFours += contribution.fours || 0;
                      totalSixes += contribution.sixes || 0;
                    }
                  });
                }
              });
            }

            return {
              ...player,
              totalCatches,
              totalRunOuts,
              totalStumpings,
              totalFours,
              totalSixes,
            };
          });

          const players = playersWithFieldingStats;

          // Calculate top batsmen (players with most runs)
          const topBatsmen = players
            .map((player: any) => ({
              ...player,
              impactScore: calculateBattingImpactScore(player)
            }))
            .filter((player: any) => player.totalRuns && player.totalRuns > 0)
            .sort((a: any, b: any) => (b.totalRuns || 0) - (a.totalRuns || 0))
            .slice(0, 5)
            .map((player: any, index: number) => ({
              rank: index + 1,
              name: player.name,
              runs: player.totalRuns?.toLocaleString() || '0',
              average: player.battingAverage ? player.battingAverage.toFixed(2) : '0.00',
              matches: player.matchesPlayed || 0,
              impactScore: player.impactScore,
              avatar: player.name.charAt(0),
            }));

          // Calculate top bowlers (players with most wickets)
          const topBowlers = players
            .map((player: any) => ({
              ...player,
              impactScore: calculateBowlingImpactScore(player)
            }))
            .filter((player: any) => player.totalWickets && player.totalWickets > 0)
            .sort((a: any, b: any) => (b.totalWickets || 0) - (a.totalWickets || 0))
            .slice(0, 5)
            .map((player: any, index: number) => ({
              rank: index + 1,
              name: player.name,
              wickets: player.totalWickets?.toLocaleString() || '0',
              economy: player.bowlingEconomy ? player.bowlingEconomy.toFixed(2) : '0.00',
              matches: player.matchesPlayed || 0,
              impactScore: player.impactScore,
              avatar: player.name.charAt(0),
            }));

          // Calculate top fielders (players with most fielding impact)
          const topFielders = players
            .map((player: any) => ({
              ...player,
              impactScore: calculateFieldingImpactScore(player)
            }))
            .filter((player: any) => player.impactScore > 0)
            .sort((a: any, b: any) => b.impactScore - a.impactScore)
            .slice(0, 5)
            .map((player: any, index: number) => ({
              rank: index + 1,
              name: player.name,
              catches: player.totalCatches || 0,
              runOuts: player.totalRunOuts || 0,
              stumpings: player.totalStumpings || 0,
              totalDismissals: (player.totalCatches || 0) + (player.totalRunOuts || 0) + (player.totalStumpings || 0),
              impactScore: player.impactScore,
              matches: player.matchesPlayed || 0,
              avatar: player.name.charAt(0),
            }));

          // Calculate rising stars (highest impact score)
          const risingStars = players
            .map((player: any) => ({
              ...player,
              impactScore: calculateOverallImpactScore(player)
            }))
            .filter((player: any) => player.impactScore > 0)
            .sort((a: any, b: any) => b.impactScore - a.impactScore)
            .slice(0, 5)
            .map((player: any, index: number) => ({
              rank: index + 1,
              name: player.name,
              impactScore: player.impactScore,
              matches: player.matchesPlayed || 0,
              avatar: player.name.charAt(0),
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header with back navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
          🏆 Cricket Leaderboard
        </Typography>
      </Box>
      
      <Typography variant="h6" sx={{ color: '#666', fontWeight: 400, mb: 4, textAlign: 'center' }}>
        Celebrating the best performers in our cricket community
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
        gap: { xs: 2, sm: 3 }, 
        width: '100%'
      }}>
        {/* Top Batsmen */}
        <Card sx={{ 
          boxShadow: 3, 
          borderRadius: 2, 
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SportsCricketIcon sx={{ color: '#4A90E2', fontSize: { xs: 24, sm: 28 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Top Batsmen
              </Typography>
            </Box>
            {leaderboardData.loading ? (
              <Typography variant="body2">Loading...</Typography>
            ) : leaderboardData.topBatsmen.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {leaderboardData.topBatsmen.map((player: any) => (
                  <Box key={player.rank} sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                    <Box sx={{ 
                      width: { xs: 28, sm: 32 }, 
                      height: { xs: 28, sm: 32 }, 
                      borderRadius: '50%', 
                      backgroundColor: '#4A90E2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 600,
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {player.runs} runs • {player.average} avg • {player.matches} matches • {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No data available</Typography>
            )}
          </CardContent>
        </Card>

        {/* Top Bowlers */}
        <Card sx={{ 
          boxShadow: 3, 
          borderRadius: 2, 
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SportsBaseballIcon sx={{ color: '#EF4444', fontSize: { xs: 24, sm: 28 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Top Bowlers
              </Typography>
            </Box>
            {leaderboardData.loading ? (
              <Typography variant="body2">Loading...</Typography>
            ) : leaderboardData.topBowlers.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {leaderboardData.topBowlers.map((player: any) => (
                  <Box key={player.rank} sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                    <Box sx={{ 
                      width: { xs: 28, sm: 32 }, 
                      height: { xs: 28, sm: 32 }, 
                      borderRadius: '50%', 
                      backgroundColor: '#EF4444', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 600,
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {player.wickets} wickets • {player.economy} economy • {player.matches} matches • {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No data available</Typography>
            )}
          </CardContent>
        </Card>

        {/* Top Fielders */}
        <Card sx={{ 
          boxShadow: 3, 
          borderRadius: 2, 
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <StarIcon sx={{ color: '#F59E0B', fontSize: { xs: 24, sm: 28 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Top Fielders
              </Typography>
            </Box>
            {leaderboardData.loading ? (
              <Typography variant="body2">Loading...</Typography>
            ) : leaderboardData.topFielders.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {leaderboardData.topFielders.map((player: any) => (
                  <Box key={player.rank} sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                    <Box sx={{ 
                      width: { xs: 28, sm: 32 }, 
                      height: { xs: 28, sm: 32 }, 
                      borderRadius: '50%', 
                      backgroundColor: '#F59E0B', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 600,
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {player.catches} ct • {player.runOuts} ro • {player.stumpings} st • {Math.round(player.impactScore || 0)} impact
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No data available</Typography>
            )}
          </CardContent>
        </Card>

        {/* Rising Stars */}
        <Card sx={{ 
          boxShadow: 3, 
          borderRadius: 2, 
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <WhatshotIcon sx={{ color: '#10B981', fontSize: { xs: 24, sm: 28 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Rising Stars
              </Typography>
            </Box>
            {leaderboardData.loading ? (
              <Typography variant="body2">Loading...</Typography>
            ) : leaderboardData.risingStars.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {leaderboardData.risingStars.map((player: any) => (
                  <Box key={player.rank} sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                    <Box sx={{ 
                      width: { xs: 28, sm: 32 }, 
                      height: { xs: 28, sm: 32 }, 
                      borderRadius: '50%', 
                      backgroundColor: '#10B981', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 600,
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {player.rank}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {player.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Impact Score: {Math.round(player.impactScore || 0)} • {player.matches} matches
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">No data available</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Leaderboard;