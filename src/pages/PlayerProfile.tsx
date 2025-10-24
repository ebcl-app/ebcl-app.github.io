import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { CricketApiService, type ApiPlayer } from '../api/cricketApi';

interface PlayerProfileProps {
  playerId?: number;
  onBack?: () => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ playerId = 6, onBack }) => {
  const [player, setPlayer] = React.useState<ApiPlayer | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState('summary');

  React.useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) {
        setError('Player ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const playerData = await CricketApiService.getPlayer(playerId);
        
        if (!playerData) {
          setError('Player not found');
          return;
        }

        setPlayer(playerData);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError('Failed to load player data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  // Sort match history by matchDate in descending order (newest first)
  // First sort by date, then by time within the same date
  const sortedMatchHistory = React.useMemo(() => {
    if (!player?.matchHistory) return [];
    return [...player.matchHistory].sort((a, b) => {
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
  }, [player?.matchHistory]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman':
        return '#4A90E2';
      case 'bowler':
        return '#EF4444';
      case 'all-rounder':
        return '#10B981';
      case 'wicket-keeper':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!player) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info">Player not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button */}
      {onBack && (
        <IconButton onClick={onBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
      )}

      {/* Header Card */}
      <Card sx={{ mb: 3, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 4,
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'white',
                color: getRoleColor(player.role),
                fontSize: '3rem',
                fontWeight: 700,
                border: '4px solid white',
              }}
            >
              {player.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {player.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={player.role.charAt(0).toUpperCase() + player.role.slice(1)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={player.isActive ? 'Active' : 'Inactive'}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {player.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">{player.email}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Tab Buttons */}
      <Box sx={{ display: 'flex', gap: 0, backgroundColor: '#f1f5f9', borderRadius: 1, p: 0.5, mb: 3 }}>
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
          onClick={() => setTab('matches')}
          sx={{
            flex: 1,
            textTransform: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            py: 0.8,
            borderRadius: 0.8,
            backgroundColor: tab === 'matches' ? '#2c3e5f' : 'transparent',
            color: tab === 'matches' ? '#ffffff' : '#64748b',
            '&:hover': {
              backgroundColor: tab === 'matches' ? '#253451' : 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Matches
        </Button>
        <Button
          variant="text"
          onClick={() => setTab('teams')}
          sx={{
            flex: 1,
            textTransform: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            py: 0.8,
            borderRadius: 0.8,
            backgroundColor: tab === 'teams' ? '#2c3e5f' : 'transparent',
            color: tab === 'teams' ? '#ffffff' : '#64748b',
            '&:hover': {
              backgroundColor: tab === 'teams' ? '#253451' : 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Teams
        </Button>
      </Box>

      {/* Summary Tab Content */}
      {tab === 'summary' && (
        <>
          {/* Stats Overview */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Matches Played
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4A90E2' }}>
              {player.matchesPlayed || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Runs
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
              {player.totalRuns || 0}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Batting Average
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
              {player.battingAverage?.toFixed(2) || '0.00'}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Strike Rate
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>
              {player.battingStrikeRate?.toFixed(2) || '0.00'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Left Column - Career Statistics */}
        <Box sx={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Career Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Wickets
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.totalWickets || 0}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bowling Average
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.bowlingAverage?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Economy
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.bowlingEconomy?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Batting Style
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.battingStyle === 'RHB' ? 'Right-handed' : player.battingStyle === 'LHB' ? 'Left-handed' : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bowling Style
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.bowlingStyle || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Matches */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUpIcon sx={{ color: '#4A90E2' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Matches
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sortedMatchHistory.slice(0, 5).map((match, index) => {
                  // Determine opponent team
                  const opponent = match.team1 === player.name ? match.team2 : match.team1;
                  // Determine result
                  const isWinner = match.result.winner === player.name;
                  
                  return (
                    <Paper
                      key={`${match.matchId}-${index}`}
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: '#F9FAFB',
                        borderLeft: `4px solid ${
                          isWinner ? '#10B981' : '#EF4444'
                        }`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          vs {opponent}
                        </Typography>
                        <Chip
                          label={isWinner ? 'Won' : 'Lost'}
                          size="small"
                          color={isWinner ? 'success' : 'error'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {new Date(match.matchDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Show batting contribution */}
                        {match.contributions
                          .filter(c => c.type === 'batting')
                          .map((contrib, contribIndex) => (
                            <Box key={contribIndex}>
                              <Typography variant="caption" color="text.secondary">
                                Runs
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A90E2' }}>
                                {contrib.runs || 0}
                              </Typography>
                            </Box>
                          ))}
                        {/* Show bowling contribution */}
                        {match.contributions
                          .filter(c => c.type === 'bowling')
                          .map((contrib, contribIndex) => (
                            <Box key={contribIndex}>
                              <Typography variant="caption" color="text.secondary">
                                Wickets
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444' }}>
                                {contrib.wickets || 0}
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Consistency</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      85%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#E5E7EB',
                      '& .MuiLinearProgress-bar': { bgcolor: '#10B981' },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Big Match Player</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      78%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={78}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#E5E7EB',
                      '& .MuiLinearProgress-bar': { bgcolor: '#4A90E2' },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Form</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      92%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={92}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#E5E7EB',
                      '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
        </>
      )}

      {/* Matches Tab Content */}
      {tab === 'matches' && (
        <Box sx={{ mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
                Match History
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sortedMatchHistory.length > 0 ? (
                  sortedMatchHistory.map((match, index) => {
                    // Determine opponent team
                    const opponent = match.team1 === player.name ? match.team2 : match.team1;
                    // Determine result
                    const isWinner = match.result.winner === player.name;
                    
                    return (
                      <Paper
                        key={`${match.matchId}-${index}`}
                        elevation={0}
                        sx={{
                          p: 3,
                          bgcolor: '#F9FAFB',
                          borderLeft: `4px solid ${
                            isWinner ? '#10B981' : '#EF4444'
                          }`,
                          borderRadius: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                              vs {opponent}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {new Date(match.matchDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Typography>
                            <Chip
                              label={isWinner ? 'Won' : 'Lost'}
                              size="small"
                              color={isWinner ? 'success' : 'error'}
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {match.venue || 'Venue TBA'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {/* Show batting contribution */}
                          {match.contributions
                            .filter(c => c.type === 'batting')
                            .map((contrib, contribIndex) => (
                              <Box key={contribIndex} sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Runs
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4A90E2' }}>
                                  {contrib.runs || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {contrib.balls || 0} balls
                                </Typography>
                              </Box>
                            ))}
                          
                          {/* Show bowling contribution */}
                          {match.contributions
                            .filter(c => c.type === 'bowling')
                            .map((contrib, contribIndex) => (
                              <Box key={contribIndex} sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Wickets
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#EF4444' }}>
                                  {contrib.wickets || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {contrib.overs || '0'} overs
                                </Typography>
                              </Box>
                            ))}
                          
                          {/* Show fielding contribution */}
                          {match.contributions
                            .filter(c => c.type === 'fielding')
                            .map((contrib, contribIndex) => (
                              <Box key={contribIndex} sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Fielding
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981' }}>
                                  {contrib.count || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {contrib.action || 'catches'}
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      </Paper>
                    );
                  })
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No match history available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Teams Tab Content */}
      {tab === 'teams' && (
        <Box sx={{ mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
                Teams Played For
              </Typography>
              
              {player.recentTeams && player.recentTeams.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {player.recentTeams.map((team, index) => (
                    <Paper
                      key={`${team.teamId}-${index}`}
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor: '#F9FAFB',
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: '#4A90E2', 
                            width: 48, 
                            height: 48,
                            fontWeight: 700,
                            fontSize: '1.2rem'
                          }}>
                            {team.teamName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                              {team.teamName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Last played: {team.lastPlayed && typeof team.lastPlayed === 'object' && '_seconds' in team.lastPlayed
                                ? new Date((team.lastPlayed as any)._seconds * 1000).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : team.lastPlayed
                                  ? new Date(team.lastPlayed).toLocaleDateString('en-US', {
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'N/A'
                              }
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A90E2', mb: 0.5 }}>
                            {team.matchesPlayed}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Matches Played
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No team information available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default PlayerProfile;
