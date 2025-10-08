import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  IconButton,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { CricketApiService, type ApiTeam, type ApiMatchHistoryEntry } from '../api/cricketApi';
import { useAuth } from '../contexts/AuthContext';

const TeamDetails: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { isAuthenticated } = useAuth();
  const [team, setTeam] = React.useState<ApiTeam | null>(null);
  const [teamMatches, setTeamMatches] = React.useState<ApiMatchHistoryEntry[]>([]);
  const [teamDataLoaded, setTeamDataLoaded] = React.useState(false);

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

      const numericTeamId = parseInt(teamId, 10);
      if (isNaN(numericTeamId)) {
        setError('Invalid team ID');
        setLoading(false);
        return;
      }

      lastFetchedTeamId.current = teamId;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch team details (now includes match history)
        const teamResponse = await CricketApiService.getTeam(numericTeamId);
        
        if (!teamResponse) {
          setError('Team not found');
          lastFetchedTeamId.current = null;
          return;
        }

        setTeam(teamResponse);
        // Use matchHistory from team data instead of separate API call
        setTeamMatches(teamResponse.matchHistory || []);
        setTeamDataLoaded(true);
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
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="md" sx={{ pt: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Team Details
          </Typography>
        </Box>

        {/* Team Summary Card */}
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: team.color || '#4A90E2', width: 56, height: 56, fontWeight: 800 }}>
                {team.shortName}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {team.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Captain: {team.captain?.name || 'Not assigned'}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<GroupIcon />} label={`${team.playersCount || 0} Players`} size="small" variant="outlined" />
                </Box>
              </Box>
              {isAuthenticated && (
                <Button variant="contained" startIcon={<EditIcon />} sx={{ textTransform: 'none' }}>
                  Edit Team
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Secondary chips row */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`Created: ${new Date(team.createdAt).toLocaleDateString()}`} size="small" />
          <Chip label={`Last Updated: ${new Date(team.updatedAt).toLocaleDateString()}`} size="small" />
        </Box>

        {/* Team Statistics */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Team Statistics
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
                {team.statistics?.totalMatches || 0}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Total Matches
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
                {team.statistics?.wins || 0}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Wins
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
                {team.statistics?.losses || 0}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Losses
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
                {team.statistics?.winPercentage?.toFixed(1) || '0.0'}%
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Win %
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Squad */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Squad
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, mb: 2 }}>
          {team.players && team.players.length > 0 ? (
            team.players.map((player) => (
              <Card key={player.numericId} sx={{ minWidth: 140, boxShadow: 1, cursor: 'pointer' }} onClick={() => navigate(`/players/${player.numericId}`)}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                  <Avatar sx={{ 
                    width: 56, 
                    height: 56, 
                    mb: 1, 
                    border: '2px solid #4A90E2',
                    bgcolor: getPlayerIconColor(player.role)
                  }}>
                    {getPlayerIcon(player.role)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center' }}>
                    {player.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {player.role}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No players assigned to this team yet.
            </Typography>
          )}
        </Box>

        {/* Match History */}
        {teamMatches && teamMatches.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Match History
            </Typography>
            <Box sx={{ mb: 2 }}>
              {teamMatches.map((match) => {
                // Opponent is already provided in the matchHistory entry
                const opponent = match.opponent;

                // Determine match result for this team
                let resultText = '';
                let resultColor: 'success' | 'error' | 'default' = 'default';

                if (match.status === 'completed' && match.result) {
                  const isWinner = match.result.winner === team.name;
                  resultText = isWinner ? 'Won' : 'Lost';
                  resultColor = isWinner ? 'success' : 'error';
                  if (match.result.margin) {
                    resultText += ` by ${match.result.margin}`;
                  }
                }

                return (
                  <Card
                    key={match.id}
                    sx={{ mb: 2, boxShadow: 1, cursor: 'pointer' }}
                    onClick={() => navigate(`/matches/${match.numericId}`)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Match Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            vs {opponent?.name || 'Unknown Team'}
                          </Typography>
                          <Chip
                            label={match.status}
                            size="small"
                            color={
                              match.status === 'completed' ? 'success' :
                              match.status === 'live' ? 'error' : 'info'
                            }
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          {match.status === 'completed' && resultText && (
                            <Typography variant="body2" sx={{ fontWeight: 600, color: `${resultColor}.main` }}>
                              {resultText}
                            </Typography>
                          )}
                          {match.status === 'scheduled' && (
                            <Typography variant="body2" color="text.secondary">
                              Scheduled
                            </Typography>
                          )}
                          {match.status === 'live' && (
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                              Live
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Match Information Cards */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
                        {/* Date */}
                        <Card sx={{ minWidth: 100, boxShadow: 0, bgcolor: '#f5f5f5' }}>
                          <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Date
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                              {new Date(match.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Typography>
                          </CardContent>
                        </Card>

                        {/* Match Type */}
                        <Card sx={{ minWidth: 100, boxShadow: 0, bgcolor: '#f5f5f5' }}>
                          <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Type
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                              {match.matchType || 'T20'}
                            </Typography>
                          </CardContent>
                        </Card>

                        {/* Ground */}
                        <Card sx={{ minWidth: 120, boxShadow: 0, bgcolor: '#f5f5f5' }}>
                          <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Ground
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                              {match.venue || 'TBD'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>

                      {/* Additional Match Details */}
                      {match.status === 'completed' && (
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                          {/* Toss */}
                          <Card sx={{ minWidth: 100, boxShadow: 0, bgcolor: '#e3f2fd' }}>
                            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Toss
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                {match.toss ? `${match.toss.winner} won` : 'N/A'}
                              </Typography>
                            </CardContent>
                          </Card>

                          {/* Best Batsman */}
                          {match.bestBatsman && (
                            <Card sx={{ minWidth: 140, boxShadow: 0, bgcolor: '#e8f5e8' }}>
                              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Best Batsman
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                  {match.bestBatsman.player.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {match.bestBatsman.runs} runs
                                </Typography>
                              </CardContent>
                            </Card>
                          )}

                          {/* Best Bowler */}
                          {match.bestBowler && (
                            <Card sx={{ minWidth: 140, boxShadow: 0, bgcolor: '#ffebee' }}>
                              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  Best Bowler
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                                  {match.bestBowler.player.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {match.bestBowler.wickets} wickets
                                </Typography>
                              </CardContent>
                            </Card>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </>
        )}

        {/* Best Players */}
        {(team.bestPlayers?.batsman || team.bestPlayers?.bowler) && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Best Players
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
              {team.bestPlayers.batsman && (
                <Card sx={{ boxShadow: 1 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Top Batsman
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#4A90E2' }}>
                        {team.bestPlayers.batsman.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                          {team.bestPlayers.batsman.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Avg: {team.bestPlayers.batsman.average.toFixed(1)} • Runs: {team.bestPlayers.batsman.totalRuns}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
              {team.bestPlayers.bowler && (
                <Card sx={{ boxShadow: 1 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Top Bowler
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#EF4444' }}>
                        {team.bestPlayers.bowler.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                          {team.bestPlayers.bowler.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Wickets: {team.bestPlayers.bowler.wickets} • Econ: {team.bestPlayers.bowler.economy.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </>
        )}
      </Container>

      {/* Floating Add Player action - only show for authenticated users */}
      {isAuthenticated && (
        <Paper
          sx={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 72,
            px: 2,
            py: 1,
            borderRadius: 999,
            boxShadow: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Avatar sx={{ bgcolor: '#4A90E2', width: 44, height: 44 }}>
            <AddIcon />
          </Avatar>
          <Typography sx={{ fontWeight: 700 }}>Add Player</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TeamDetails;


