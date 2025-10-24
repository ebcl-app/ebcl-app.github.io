import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { CricketApiService, type ApiTeam, type ApiMatchHistoryEntry } from '../api/cricketApi';

interface TeamPlayerData {
  displayId?: string | number;
  playerId?: string | number;
  numericId?: number;
  id?: string | number;
  player?: {
    name?: string;
    role?: string;
    displayId?: string | number;
    playerId?: string | number;
    numericId?: number;
    id?: string | number;
  };
  name?: string;
  role?: string;
}

const TeamDetails: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [team, setTeam] = React.useState<ApiTeam | null>(null);
  const [teamMatches, setTeamMatches] = React.useState<ApiMatchHistoryEntry[]>([]);
  const [teamDataLoaded, setTeamDataLoaded] = React.useState(false);
  const [tab, setTab] = React.useState<'overview' | 'matches' | 'players'>('overview');

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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const lastFetchedTeamId = React.useRef<string | null>(null);

  React.useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!teamId) {
        setError('Team ID not provided');
        setLoading(false);
        return;
      }

      if (teamDataLoaded && lastFetchedTeamId.current === teamId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch team details (now includes match history)
        const teamResponse = await CricketApiService.getTeam(teamId);
        
        if (!teamResponse) {
          setError('Team not found');
          lastFetchedTeamId.current = null;
          return;
        }

        setTeam(teamResponse);
        // Use matchHistory from team data instead of separate API call
        setTeamMatches(teamResponse.matchHistory || []);
        setTeamDataLoaded(true);
        lastFetchedTeamId.current = teamId;
      } catch (err) {
        setError('Failed to load team details. Please try again later.');
        console.error('Error fetching team details:', err);
        lastFetchedTeamId.current = null;
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId, teamDataLoaded]);

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

  if (!team) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Team not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#e8eef5', minHeight: '100vh', pb: { xs: 10, md: 4 }, maxWidth: { xs: '100%', md: 1280 }, mx: { xs: 0, md: 'auto' }, width: '100%' }}>
      <Box sx={{ pt: { xs: 2, md: 3 }, px: { xs: 2, md: 3 } }}>
        {/* Team Summary Card */}
        <Card sx={{ 
          mb: 3, 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #93c5fd',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: team.color || '#4A90E2', 
                width: 70, 
                height: 70, 
                fontWeight: 700,
                fontSize: '1.5rem',
                border: '3px solid #e3f2fd'
              }}>
                {team.shortName}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a5f', mb: 0.5 }}>
                  Team {team.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Captain: {team.captain?.name || 'Sunder'}
                </Typography>
              </Box>
            </Stack>

            {/* Tab Buttons */}
            <Box sx={{ display: 'flex', gap: 0, backgroundColor: '#f1f5f9', borderRadius: 1, p: 0.5, mb: 2 }}>
              <Button
                variant="text"
                onClick={() => setTab('overview')}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.8,
                  borderRadius: 0.8,
                  backgroundColor: tab === 'overview' ? '#2c3e5f' : 'transparent',
                  color: tab === 'overview' ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: tab === 'overview' ? '#253451' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Overview
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
                onClick={() => setTab('players')}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  py: 0.8,
                  borderRadius: 0.8,
                  backgroundColor: tab === 'players' ? '#2c3e5f' : 'transparent',
                  color: tab === 'players' ? '#ffffff' : '#64748b',
                  '&:hover': {
                    backgroundColor: tab === 'players' ? '#253451' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Players
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Overview Tab Content */}
        {tab === 'overview' && team.teamStats && (
          <Box>
            <Card sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 2, border: '1px solid #93c5fd' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2, color: '#1e293b' }}>
                  Overview
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2 
                }}>
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a5f', mb: 0.5 }}>
                      {team.teamStats.matchesPlayed || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Matches Played
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32', mb: 0.5 }}>
                      {team.teamStats.wins || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Wins
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#D32F2F', mb: 0.5 }}>
                      {team.teamStats.losses || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Losses
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976D2', mb: 0.5 }}>
                      {team.teamStats.winPercentage?.toFixed(0) || 0}%
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Win Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Matches Tab Content */}
        {tab === 'matches' && (
          <Box>
            <Card sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 2, border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                Recent Matches
              </Typography>
              {teamMatches && teamMatches.length > 0 ? (
                teamMatches.slice(0, 5).map((match, index) => (
                  <Box
                    key={match.id || match.numericId || `match-${index}`}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: '#f8fafc',
                      borderRadius: 1,
                      borderLeft: '4px solid #3b82f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                    onClick={() => navigate(`/matches/${match.numericId}`)}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                      {match.title || 'Match'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Date not available'}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 2 }}>
                  No recent matches available
                </Typography>
              )}
            </CardContent>
          </Card>
          </Box>
        )}

        {/* Players Tab Content */}
        {tab === 'players' && (
          <Box>
            <Card sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', borderRadius: 2, border: '1px solid #93c5fd' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                Team Players
              </Typography>
              {((team.players && team.players.length > 0) || (team.teamPlayers && team.teamPlayers.length > 0)) ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                  {(team.teamPlayers || team.players || []).map((playerData: TeamPlayerData, index: number) => {
                    const player = playerData.player || playerData;
                    const playerName = player.name || '';
                    const playerRole = player.role || 'Player';
                    const displayId = playerData.displayId || player.displayId || playerData.playerId || player.playerId || player.numericId || player.id;

                    return (
                      <Card key={displayId || `player-${index}`} sx={{ border: '1px solid #e2e8f0', borderRadius: 1, cursor: 'pointer', transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)' } }} onClick={() => navigate(`/players/${displayId}`)}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: getPlayerIconColor(playerRole) }}>
                              {getPlayerIcon(playerRole)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {playerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {playerRole}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 2 }}>
                  No players information available
                </Typography>
              )}
            </CardContent>
          </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TeamDetails;


