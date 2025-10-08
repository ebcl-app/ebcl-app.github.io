import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Alert,
  Pagination,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { CricketApiService, type ApiPlayer } from '../api/cricketApi';
import BusyOverlay from '../components/BusyOverlay';

interface Player {
  id: number;
  numericId: number;
  stringId: string; // Add string ID for API calls
  name: string;
  team: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';
  matches: number;
  runs: number;
  wickets: number;
  average: string;
  strikeRate: string;
  status: 'Active' | 'Injured' | 'Inactive';
}

const PlayersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('All');
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('grid');
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [pagination, setPagination] = React.useState<any>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isFetchingRef = React.useRef(false);

  const fetchPlayers = async (page: number = 1) => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const response = await CricketApiService.getPlayers({ page, limit: 4 });

      if (response.success) {
        // Transform API data to component format
        const transformedPlayers: Player[] = response.data.map((apiPlayer: ApiPlayer) => ({
          id: apiPlayer.numericId,
          numericId: apiPlayer.numericId,
          stringId: apiPlayer.id, // Add string ID for navigation
          name: apiPlayer.name,
          team: 'Unknown', // API doesn't provide team info directly
          role: apiPlayer.role === 'batsman' ? 'Batsman' :
                apiPlayer.role === 'bowler' ? 'Bowler' :
                apiPlayer.role === 'all-rounder' ? 'All-rounder' :
                apiPlayer.role === 'wicket-keeper' ? 'Wicket-keeper' : 'Batsman',
          matches: apiPlayer.matchesPlayed || 0,
          runs: apiPlayer.totalRuns || 0,
          wickets: apiPlayer.totalWickets || 0,
          average: apiPlayer.battingAverage ? apiPlayer.battingAverage.toFixed(2) : '0.00',
          strikeRate: apiPlayer.battingStrikeRate ? apiPlayer.battingStrikeRate.toFixed(1) : '0.0',
          status: apiPlayer.isActive ? 'Active' : 'Inactive',
        }));

        setPlayers(transformedPlayers);
        setPagination(response.pagination);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setError('Failed to load players. Please try again later.');
      }
    } catch (err) {
      setError('Failed to load players. Please try again later.');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  React.useEffect(() => {
    fetchPlayers(1);
  }, []);

  // Auto-switch view mode based on screen size
  React.useEffect(() => {
    setViewMode(isDesktop ? 'table' : 'grid');
  }, [isDesktop]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    fetchPlayers(page);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Batsman':
        return '#4A90E2';
      case 'Bowler':
        return '#EF4444';
      case 'All-rounder':
        return '#10B981';
      case 'Wicket-keeper':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  // Helper function to get player icon based on role
  const getPlayerIcon = (role: string) => {
    switch (role) {
      case 'Batsman':
        return <SportsCricketIcon />;
      case 'Bowler':
        return <SportsBaseballIcon />;
      case 'All-rounder':
        return <ShuffleIcon />;
      case 'Wicket-keeper':
        return <SportsCricketIcon />;
      default:
        return <SportsCricketIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Injured':
        return 'warning';
      case 'Inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || player.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto', maxWidth: '100%' }}>
      <Table sx={{ minWidth: { xs: 600, sm: 800 } }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#F9FAFB' }}>
            <TableCell sx={{ fontWeight: 700, minWidth: { xs: 120, sm: 150 }, py: 1.5 }}>Player</TableCell>
            <TableCell sx={{ fontWeight: 700, minWidth: { xs: 60, sm: 80 }, py: 1.5, display: { xs: 'none', sm: 'table-cell' } }}>Team</TableCell>
            <TableCell sx={{ fontWeight: 700, minWidth: { xs: 60, sm: 80 }, py: 1.5 }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: { xs: 50, sm: 60 }, py: 1.5 }}>Matches</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: { xs: 50, sm: 60 }, py: 1.5 }}>Runs</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: { xs: 50, sm: 60 }, py: 1.5 }}>Wickets</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: { xs: 50, sm: 60 }, py: 1.5, display: { xs: 'none', md: 'table-cell' } }}>Average</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: { xs: 60, sm: 80 }, py: 1.5, display: { xs: 'none', md: 'table-cell' } }}>Strike Rate</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: { xs: 50, sm: 60 }, py: 1.5 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: { xs: 70, sm: 90 }, py: 1.5 }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
           {filteredPlayers.map((player) => (
            <TableRow key={player.id} hover>
              <TableCell sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(player.role) }}>
                    {getPlayerIcon(player.role)}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {player.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1, display: { xs: 'none', sm: 'table-cell' } }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {player.team}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1 }}>
                <Chip
                  label={player.role}
                  size="small"
                  sx={{
                    bgcolor: getRoleColor(player.role),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 20, sm: 24 }
                  }}
                />
              </TableCell>
              <TableCell sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {player.matches}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {player.runs}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {player.wickets}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center', py: 1, display: { xs: 'none', md: 'table-cell' } }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {player.average}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center', py: 1, display: { xs: 'none', md: 'table-cell' } }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  {player.strikeRate}
                </Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'center', py: 1 }}>
                <Chip
                  label={player.status}
                  size="small"
                  color={getStatusColor(player.status)}
                  variant="outlined"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 20, sm: 24 }
                  }}
                />
              </TableCell>
               <TableCell sx={{ textAlign: 'center', py: 1 }}>
                 <Button
                   size="small"
                   variant="outlined"
                   onClick={() => navigate(`/players/${player.numericId}`)}
                   sx={{
                     fontSize: { xs: '0.7rem', sm: '0.75rem' },
                     minWidth: { xs: 'auto', sm: '64px' },
                     px: { xs: 1, sm: 2 }
                   }}
                 >
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
    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
       {filteredPlayers.map((player) => (
         <Card key={player.id} sx={{ '&:hover': { boxShadow: 4 }, cursor: 'pointer' }} onClick={() => navigate(`/players/${player.numericId}`)}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: getRoleColor(player.role) }}>
                {getPlayerIcon(player.role)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {player.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {player.team}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={player.role}
                size="small"
                sx={{
                  bgcolor: getRoleColor(player.role),
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={player.status}
                size="small"
                color={getStatusColor(player.status)}
                variant="outlined"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                  {player.matches}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Matches
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                  {player.runs}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Runs
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                  {player.wickets}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Wickets
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#F9FAFB', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                  {player.average}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average
                </Typography>
              </Box>
            </Box>
             <Button fullWidth variant="outlined" onClick={(e) => { e.stopPropagation(); navigate(`/players/${player.numericId}`); }}>
              View Profile
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  // Keep shell; show overlay and inline error

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <BusyOverlay open={loading} label="Loading players..." />
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Players
        </Typography>
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
            <SportsCricketIcon sx={{ fontSize: 32, color: '#4A90E2', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4A90E2' }}>
              {pagination?.total || players.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Players
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 32, color: '#10B981', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
              {players.filter(player => player.status === 'Active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Players
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontSize: 24, color: '#F59E0B', mb: 1 }}>🏏</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
              {players.length > 0 ? Math.round(players.reduce((sum, player) => sum + player.runs, 0) / players.length) : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Runs
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontSize: 24, color: '#EF4444', mb: 1 }}>🎯</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>
              {players.length > 0 ? Math.round(players.reduce((sum, player) => sum + player.wickets, 0) / players.length) : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Wickets
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              startAdornment={<FilterListIcon sx={{ ml: 1, mr: -0.5, color: 'action.active' }} />}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Batsman">Batsmen</MenuItem>
              <MenuItem value="Bowler">Bowlers</MenuItem>
              <MenuItem value="All-rounder">All-rounders</MenuItem>
              <MenuItem value="Wicket-keeper">Wicket-keepers</MenuItem>
            </Select>
          </FormControl>

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
      </Box>

      {/* Content */}
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

      {filteredPlayers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No players found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default PlayersList;