import React from 'react';
import BusyOverlay from '../components/BusyOverlay';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SportsIcon from '@mui/icons-material/Sports';
import FilterListIcon from '@mui/icons-material/FilterList';
import { CricketApiService, type ApiMatch, type ApiTeam } from '../api/cricketApi';

interface Match {
  id: number;
  numericId: number;
  stringId: string; // Add string ID for API calls
  team1: {
    name: string;
    logo?: string;
    score?: string;
    overs?: string;
  };
  team2: {
    name: string;
    logo?: string;
    score?: string;
    overs?: string;
  };
  date: string;
  time: string;
  venue: string;
  status: 'Live' | 'Upcoming' | 'Completed';
  matchType: string;
  winner?: string;
  result?: string | { winner: string; margin: string };
  currentInnings?: string;
  bestBatsman?: {
    player: {
      id: string;
      name: string;
    };
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
  };
  bestBowler?: {
    player: {
      id: string;
      name: string;
    };
    wickets: number;
    runs: number;
    overs: number;
    economy: number;
  };
}

const MatchesList: React.FC = () => {
  const [statusFilter, setStatusFilter] = React.useState<'Live' | 'Upcoming' | 'Completed' | 'All'>('All');
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [teams, setTeams] = React.useState<ApiTeam[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch teams and matches in parallel
        const [apiTeams, apiMatches] = await Promise.all([
          CricketApiService.getTeams(),
          CricketApiService.getMatches()
        ]);

        setTeams(apiTeams);

        // Transform API data to component format
        const transformedMatches: Match[] = apiMatches.map((apiMatch: ApiMatch) => ({
          id: apiMatch.numericId,
          numericId: apiMatch.numericId,
          stringId: apiMatch.id, // Add string ID for navigation
          team1: {
            name: apiMatch.team1?.name || 'Unknown Team',
            score: apiMatch.team1Score ? `${apiMatch.team1Score}` : undefined,
            overs: undefined, // API doesn't provide overs breakdown
          },
          team2: {
            name: apiMatch.team2?.name || 'Unknown Team',
            score: apiMatch.team2Score ? `${apiMatch.team2Score}` : undefined,
            overs: undefined,
          },
          date: new Date(apiMatch.scheduledDate).toISOString().split('T')[0],
          time: new Date(apiMatch.scheduledDate).toTimeString().slice(0, 5),
          venue: apiMatch.venue,
          status: apiMatch.status === 'live' ? 'Live' :
                  apiMatch.status === 'scheduled' ? 'Upcoming' : 'Completed',
          matchType: apiMatch.matchType,
          winner: apiMatch.winner,
          result: apiMatch.result ? `${apiMatch.result.winner} ${apiMatch.result.margin}`.trim() : undefined,
          currentInnings: apiMatch.currentInnings ? `Innings ${apiMatch.currentInnings}` : undefined,
        }));

        setMatches(transformedMatches);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'error';
      case 'Completed':
        return 'success';
      case 'Upcoming':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Live':
        return <PlayArrowIcon sx={{ fontSize: 16 }} />;
      case 'Completed':
        return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'Upcoming':
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      default:
        return undefined;
    }
  };

  // Create a team color map from fetched teams data
  const teamColorMap = React.useMemo(() => {
    const map: { [key: string]: string } = {};
    teams.forEach(team => {
      if (team.color) {
        map[team.name] = team.color;
      }
    });
    return map;
  }, [teams]);

  const getTeamColor = (teamName: string) => {
    return teamColorMap[teamName] || '#6B7280'; // Default gray if no color found
  };

  const getTeamBoxStyle = (teamName: string, match: Match) => {
    const isCompleted = match.status === 'Completed';
    const isWinner = isCompleted && match.winner === teamName;

    if (isWinner) {
      return {
        bgcolor: '#D1FAE5', // Light green for winner
        border: '2px solid #10B981', // Green border
        borderRadius: 1,
        position: 'relative' as const,
        opacity: 1,
      };
    }

    if (isCompleted) {
      return {
        bgcolor: '#FEF2F2', // Light red/gray for loser
        border: '1px solid #E5E7EB',
        borderRadius: 1,
        position: 'relative' as const,
        opacity: 0.7, // Slightly muted for loser
      };
    }

    return {
      bgcolor: '#F9FAFB', // Default for upcoming/live matches
      border: '1px solid transparent',
      borderRadius: 1,
      position: 'relative' as const,
      opacity: 1,
    };
  };

  const filterMatchesByStatus = (match: Match) => {
    if (statusFilter === 'All') return true;
    return match.status === statusFilter;
  };

  const filteredMatches = matches.filter(filterMatchesByStatus);

  const liveMatchesCount = matches.filter((m) => m.status === 'Live').length;
  const upcomingMatchesCount = matches.filter((m) => m.status === 'Upcoming').length;
  const completedMatchesCount = matches.filter((m) => m.status === 'Completed').length;

  const renderMatchCard = (match: Match) => {
    const isLive = match.status === 'Live';
    const isCompleted = match.status === 'Completed';

    return (
      <Card
        key={match.id}
        sx={{
          mb: 2,
          boxShadow: isLive ? 4 : 2,
          border: isLive ? '2px solid #EF4444' : 'none',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        }}
      >
        {isLive && (
          <Box
            sx={{
              position: 'absolute',
              top: -1,
              left: -1,
              right: -1,
              height: 4,
              bgcolor: '#EF4444',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
            }}
          />
        )}
        <CardContent onClick={() => navigate(`/matches/${match.numericId}`)} sx={{ cursor: 'pointer' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Chip
                icon={getStatusIcon(match.status)}
                label={match.status}
                size="small"
                color={getStatusColor(match.status)}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label={match.matchType}
                size="small"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Box>
            {isLive && (
              <Typography
                variant="caption"
                sx={{
                  color: '#EF4444',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#EF4444',
                    animation: 'blink 1s ease-in-out infinite',
                    '@keyframes blink': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                    },
                  }}
                />
                LIVE
              </Typography>
            )}
          </Box>

          {/* Teams */}
          <Box sx={{ mb: 2 }}>
            {/* Team 1 */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                p: 1.5,
                ...getTeamBoxStyle(match.team1.name, match),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: getTeamColor(match.team1.name),
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                  }}
                >
                  {match.team1.name.substring(0, 2).toUpperCase()}
                </Avatar>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {match.team1.name}
                </Typography>
              </Box>
              {match.team1.score && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {match.team1.score}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {match.team1.overs} overs
                  </Typography>
                </Box>
              )}
              {match.status === 'Completed' && match.winner === match.team1.name && (
                <Typography variant="h6" sx={{ fontSize: '1.5rem', ml: 1 }}>
                  🏆
                </Typography>
              )}
            </Box>

            {/* VS Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography
                variant="caption"
                sx={{
                  mx: 2,
                  color: 'text.secondary',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              >
                VS
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* Team 2 */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                ...getTeamBoxStyle(match.team2.name, match),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: getTeamColor(match.team2.name),
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                  }}
                >
                  {match.team2.name.substring(0, 2).toUpperCase()}
                </Avatar>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {match.team2.name}
                </Typography>
              </Box>
              {match.team2.score && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {match.team2.score}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {match.team2.overs} overs
                  </Typography>
                </Box>
              )}
              {match.status === 'Completed' && match.winner === match.team2.name && (
                <Typography variant="h6" sx={{ fontSize: '1.5rem', ml: 1 }}>
                  🏆
                </Typography>
              )}
            </Box>
          </Box>

          {/* Match Status/Result */}
          {isLive && match.currentInnings && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: '#FEF3C7',
                borderRadius: 1,
                border: '1px solid #FCD34D',
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#92400E' }}>
                {match.currentInnings}
              </Typography>
            </Box>
          )}

          {isCompleted && (
            <Box sx={{ mb: 2 }}>
              {match.winner && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: '#D1FAE5',
                    borderRadius: 1,
                    border: '1px solid #6EE7B7',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#065F46', textAlign: 'center' }}>
                    🏆 {match.winner} Won{typeof match.result === 'object' && match.result?.margin ? ` by ${match.result.margin}` : ''}
                  </Typography>
                </Box>
              )}
              {match.bestBatsman && (
                <Box
                  sx={{
                    p: 1,
                    bgcolor: '#F0F9FF',
                    borderRadius: 1,
                    border: '1px solid #0EA5E9',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#0C4A6E', textAlign: 'center' }}>
                    🏏 Best Batsman: {match.bestBatsman.player?.name} ({match.bestBatsman.runs} runs)
                  </Typography>
                </Box>
              )}
              {match.bestBowler && (
                <Box
                  sx={{
                    p: 1,
                    bgcolor: '#FEF3C7',
                    borderRadius: 1,
                    border: '1px solid #F59E0B',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#92400E', textAlign: 'center' }}>
                    🎯 Best Bowler: {match.bestBowler.player?.name} ({match.bestBowler.wickets} wickets)
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Match Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {match.date} at {match.time}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {match.venue}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Keep shell; show overlay and inline alerts for consistency

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <BusyOverlay open={loading} label="Loading matches..." />
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Matches</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrowIcon sx={{ fontSize: 32, color: '#EF4444', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>
                {liveMatchesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live Matches
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 32, color: '#F59E0B', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                {upcomingMatchesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upcoming Matches
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                {completedMatchesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Matches
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filter Section */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value as 'Live' | 'Upcoming' | 'Completed' | 'All')}
                startAdornment={<FilterListIcon sx={{ ml: 1, mr: -0.5, color: 'action.active' }} />}
              >
                <MenuItem value="All">All Matches ({matches.length})</MenuItem>
                <MenuItem value="Live">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Live Matches ({liveMatchesCount})
                    {liveMatchesCount > 0 && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#EF4444',
                          animation: 'pulse 2s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                          },
                        }}
                      />
                    )}
                  </Box>
                </MenuItem>
                <MenuItem value="Upcoming">Upcoming Matches ({upcomingMatchesCount})</MenuItem>
                <MenuItem value="Completed">Completed Matches ({completedMatchesCount})</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredMatches.map((match) => renderMatchCard(match))}
          </Box>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <SportsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No matches found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no {statusFilter.toLowerCase()} matches at the moment.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default MatchesList;