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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FilterListIcon from '@mui/icons-material/FilterList';
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
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table');
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiPlayers = await CricketApiService.getPlayers();

        // Transform API data to component format
        const transformedPlayers: Player[] = apiPlayers.map((apiPlayer: ApiPlayer) => ({
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
      } catch (err) {
        setError('Failed to load players. Please try again later.');
        console.error('Error fetching players:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

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
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#F9FAFB' }}>
            <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Matches</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Runs</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Wickets</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Average</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Strike Rate</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
           {filteredPlayers.map((player) => (
            <TableRow key={player.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(player.role) }}>
                    {player.name.substring(0, 2).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {player.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{player.team}</TableCell>
              <TableCell>
                <Chip
                  label={player.role}
                  size="small"
                  sx={{
                    bgcolor: getRoleColor(player.role),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{player.matches}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{player.runs}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{player.wickets}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{player.average}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>{player.strikeRate}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Chip
                  label={player.status}
                  size="small"
                  color={getStatusColor(player.status)}
                  variant="outlined"
                />
              </TableCell>
               <TableCell sx={{ textAlign: 'center' }}>
                 <Button size="small" variant="outlined" onClick={() => navigate(`/players/${player.numericId}`)}>
                   View Profile
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
                {player.name.substring(0, 2).toUpperCase()}
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <BusyOverlay open={loading} label="Loading players..." />
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Players
        </Typography>
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