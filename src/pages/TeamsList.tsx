import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Container,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TimelineIcon from '@mui/icons-material/Timeline';
import { CricketApiService, type ApiTeam } from '../api/cricketApi';
import BusyOverlay from '../components/BusyOverlay';

interface Team {
  id: number;
  numericId: number;
  stringId: string; // Add string ID for API calls
  name: string;
  shortName: string;
  captain?: string;
  playersCount: number;
  color?: string;
  statistics?: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winPercentage: number;
    currentStreak: { type: string; count: number };
    longestWinStreak: number;
    longestLossStreak: number;
    recentMatches: Array<{
      matchId: number;
      date: string;
      opponent: string;
      result: string;
      winner: string;
      venue: string;
      status: string;
    }>;
    form: string[];
  };
}

const TeamsList: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [pagination, setPagination] = React.useState<any>(null);
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('grid');
  const navigate = useNavigate();
  const isFetchingRef = React.useRef(false);

  const fetchTeams = async (page: number = 1) => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const response = await CricketApiService.getTeams({ page, limit: 5 });

      if (response.success) {
        // Transform API data to component format
        const transformedTeams: Team[] = response.data.map((apiTeam: ApiTeam) => ({
          id: apiTeam.numericId,
          numericId: apiTeam.numericId,
          stringId: apiTeam.id, // Add string ID for navigation
          name: apiTeam.name,
          shortName: apiTeam.shortName,
          captain: apiTeam.captain?.name,
          playersCount: apiTeam.playersCount || 0,
          color: apiTeam.color,
          statistics: apiTeam.statistics,
        }));

        setTeams(transformedTeams);
        setPagination(response.pagination);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError('Failed to load teams. Please try again later.');
      }
    } catch (err) {
      setError('Failed to load teams. Please try again later.');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  React.useEffect(() => {
    fetchTeams(1);
  }, []);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    fetchTeams(page);
  };

  const filtered = teams.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#F9FAFB' }}>
            <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Captain</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Players</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Matches</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>W-L-D</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Win %</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Streak</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((team) => (
            <TableRow key={team.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: team.color || '#4A90E2', width: 40, height: 40, fontWeight: 800 }}>
                    {team.shortName}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {team.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {team.shortName}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{team.captain || 'Not assigned'}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Chip icon={<GroupIcon />} label={team.playersCount} size="small" variant="outlined" />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {team.statistics?.totalMatches || 0}
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {team.statistics ? `${team.statistics.wins}-${team.statistics.losses}-${team.statistics.draws}` : '0-0-0'}
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {team.statistics ? `${Math.round(team.statistics.winPercentage)}%` : '0%'}
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                {team.statistics?.currentStreak ? 
                  `${team.statistics.currentStreak.type === 'win' ? 'W' : 
                    team.statistics.currentStreak.type === 'loss' ? 'L' : 'D'}${team.statistics.currentStreak.count}` : 
                  'None'
                }
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Button size="small" variant="outlined" onClick={() => navigate(`/teams/${team.numericId}`)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderGridView = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mt: 2 }}>
      {filtered.map((team) => (
        <Card key={team.id} sx={{ '&:hover': { boxShadow: 4 }, cursor: 'pointer' }} onClick={() => navigate(`/teams/${team.numericId}`)}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: team.color || '#4A90E2', fontWeight: 800 }}>
                {team.shortName}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {team.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {team.playersCount || 0} Players
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={`Captain: ${(team.captain as any)?.name || 'Not assigned'}`}
                size="small"
                variant="outlined"
              />
            </Box>
            {team.statistics && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                    {team.statistics.totalMatches}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Matches
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {team.statistics.wins}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Wins
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                    {team.statistics.losses}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Losses
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                    {team.statistics.winPercentage?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Win %
                  </Typography>
                </Box>
              </Box>
            )}
            <Button fullWidth variant="outlined" onClick={(e) => { e.stopPropagation(); navigate(`/teams/${team.numericId}`); }}>
              View Team
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  // Keep page shell; show overlay and inline error

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <BusyOverlay open={loading} label="Loading teams..." />
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Teams</Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 2,
          mb: 3
        }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsSoccerIcon sx={{ fontSize: 32, color: '#4A90E2', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4A90E2' }}>
                {pagination?.total || teams.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Teams
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                {teams.length > 0 ? Math.round(teams.reduce((sum, team) => sum + (team.playersCount || 0), 0) / teams.length) : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Players/Team
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 32, color: '#F59E0B', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                {teams.filter(team => team.captain).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teams with Captain
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 32, color: '#8B5CF6', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                {teams.length > 0 ? Math.round(teams.reduce((sum, team) => sum + (team.statistics?.winPercentage || 0), 0) / teams.filter(t => (t.statistics?.totalMatches || 0) > 0).length) || 0 : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Win Rate
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon sx={{ fontSize: 32, color: '#06B6D4', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#06B6D4' }}>
                {teams.filter(team => team.statistics?.currentStreak?.type === 'win').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Teams on Win Streak
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search teams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* View Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newView) => newView && setViewMode(newView)}
          >
            <ToggleButton value="table">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* Teams content */}
        {viewMode === 'table' ? renderTableView() : renderGridView()}

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

        {filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No teams found matching your search.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default TeamsList;


