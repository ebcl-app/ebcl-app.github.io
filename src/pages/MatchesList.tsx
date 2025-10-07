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
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SportsIcon from '@mui/icons-material/Sports';
import FilterListIcon from '@mui/icons-material/FilterList';
import { CricketApiService, type ApiMatch } from '../api/cricketApi';

interface Match {
  id: number;
  numericId: number;
  stringId: string; // Add string ID for API calls
  team1: {
    name: string;
    logo?: string;
    score?: string;
    overs?: string;
    color?: string;
  };
  team2: {
    name: string;
    logo?: string;
    score?: string;
    overs?: string;
    color?: string;
  };
  date: string;
  time: string;
  venue: string;
  status: 'Live' | 'Upcoming' | 'Completed';
  matchType: string;
  winner?: string;
  result?: string | { winner: string; margin: string };
  currentInnings?: string;
  title?: string;
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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('grid');
  const navigate = useNavigate();
  const isFetchingRef = React.useRef(false);

  const fetchData = async (page: number = 1) => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      // Fetch only matches - team colors are included in match data
      const matchesResponse = await CricketApiService.getMatches(
        statusFilter !== 'All' ? statusFilter.toLowerCase() : undefined,
        { page, limit: 5 }
      );

      if (matchesResponse.success) {
        // Transform API data to component format
        const transformedMatches: Match[] = matchesResponse.data.map((apiMatch: ApiMatch) => ({
          id: apiMatch.numericId,
          numericId: apiMatch.numericId,
          stringId: apiMatch.id, // Add string ID for navigation
          team1: {
            name: apiMatch.team1?.name || 'Unknown Team',
            score: apiMatch.team1Score ? `${apiMatch.team1Score}` : undefined,
            overs: undefined, // API doesn't provide overs breakdown
            color: apiMatch.team1?.color,
          },
          team2: {
            name: apiMatch.team2?.name || 'Unknown Team',
            score: apiMatch.team2Score ? `${apiMatch.team2Score}` : undefined,
            overs: undefined,
            color: apiMatch.team2?.color,
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
          title: apiMatch.title || `${apiMatch.team1?.name || 'Unknown'} vs ${apiMatch.team2?.name || 'Unknown'}`,
        }));

        setMatches(transformedMatches);
        setTotalPages(matchesResponse.pagination?.totalPages || 1);
      } else {
        setError('Failed to load matches. Please try again later.');
      }
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  React.useEffect(() => {
    fetchData(1);
  }, [statusFilter]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    fetchData(page);
  };

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

  // Create a team color map from current matches data
  const teamColorMap = React.useMemo(() => {
    const map: { [key: string]: string } = {};
    matches.forEach(match => {
      if (match.team1?.name && match.team1.color) {
        map[match.team1.name] = match.team1.color;
      }
      if (match.team2?.name && match.team2.color) {
        map[match.team2.name] = match.team2.color;
      }
    });
    return map;
  }, [matches]);

  const getTeamColor = (teamName: string) => {
    return teamColorMap[teamName] || '#6B7280'; // Default gray if no color found
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
    return (
      <Card
        key={match.id}
        sx={{ minWidth: 320, '&:hover': { boxShadow: 4 }, cursor: 'pointer' }}
        onClick={() => navigate(`/matches/${match.numericId}`)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: match.status === 'Completed' ? '#2e7d32' : match.status === 'Live' ? '#d32f2f' : '#ed6c02' }}>
              {match.matchType === 'T20' ? 'T20' : match.matchType === 'ODI' ? 'ODI' : 'CRIC'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {match.team1?.name || 'TBD'} vs {match.team2?.name || 'TBD'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {match.venue || 'Venue TBD'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={match.status}
              size="small"
              color={
                match.status === 'Completed' ? 'success' :
                match.status === 'Live' ? 'error' : 'warning'
              }
              variant="outlined"
            />
            <Chip
              label={match.matchType}
              size="small"
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Date
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                {match.time}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Time
              </Typography>
            </Box>
            {match.status === 'Completed' && match.result && typeof match.result === 'object' && (
              <>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {match.result.winner}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Winner
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2937' }}>
                    {match.result.margin}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Margin
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          {match.status === 'Completed' && (match.bestBatsman || match.bestBowler) && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
              {match.bestBatsman && (
                <Box sx={{ minWidth: 120, textAlign: 'center', p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Best Batsman
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    {match.bestBatsman.player.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {match.bestBatsman.runs} runs
                  </Typography>
                </Box>
              )}
              {match.bestBowler && (
                <Box sx={{ minWidth: 120, textAlign: 'center', p: 1, bgcolor: '#ffebee', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Best Bowler
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    {match.bestBowler.player.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {match.bestBowler.wickets} wickets
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          <Button fullWidth variant="outlined" onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/matches/${match.numericId}`); }}>
            View Match
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#F9FAFB' }}>
            <TableCell sx={{ fontWeight: 700 }}>Match</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Teams</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Venue</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredMatches.map((match) => (
            <TableRow key={match.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {match.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {match.matchType}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: getTeamColor(match.team1.name), width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700 }}>
                    {match.team1.name.substring(0, 2).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2">
                    {match.team1.name} vs {match.team2.name}
                  </Typography>
                  <Avatar sx={{ bgcolor: getTeamColor(match.team2.name), width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700 }}>
                    {match.team2.name.substring(0, 2).toUpperCase()}
                  </Avatar>
                </Box>
                {(match.team1.score || match.team2.score) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {match.team1.score || '0'} - {match.team2.score || '0'}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  icon={getStatusIcon(match.status)}
                  label={match.status}
                  size="small"
                  color={getStatusColor(match.status)}
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {match.date} at {match.time}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {match.venue}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#2563EB',
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => navigate(`/matches/${match.numericId}`)}
                >
                  View Details
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCardView = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
      {filteredMatches.map((match) => renderMatchCard(match))}
    </Box>
  );

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
        <Box sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexDirection: { xs: 'row', sm: 'row', md: 'row' },
          overflowX: { xs: 'auto', sm: 'visible' },
          pb: { xs: 1, sm: 0 },
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          <Card sx={{ flex: '0 0 auto', width: 140 }}>
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
          <Card sx={{ flex: '0 0 auto', width: 140 }}>
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
          <Card sx={{ flex: '0 0 auto', width: 140 }}>
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

            {/* View Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newView) => newView && setViewMode(newView)}
              sx={{ ml: 'auto' }}
            >
              <ToggleButton value="table">
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value="grid">
                <ViewModuleIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Card>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          viewMode === 'table' ? renderTableView() : renderCardView()
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MatchesList;