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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
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
}

const TeamsList: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [pagination, setPagination] = React.useState<any>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
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
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
      {filtered.map((team) => (
         <Card key={team.id} sx={{ boxShadow: 2, '&:hover': { boxShadow: 6, transform: 'translateY(-2px)', transition: 'all .2s' }, cursor: 'pointer' }} onClick={() => navigate(`/teams/${team.numericId}`)}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Avatar sx={{ bgcolor: team.color || '#4A90E2', width: 48, height: 48, fontWeight: 800 }}>
                {team.shortName}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{team.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<GroupIcon />} label={`${team.playersCount} Players`} size="small" variant="outlined" />
                  {team.captain && (
                    <Chip label={`Captain: ${team.captain}`} size="small" variant="outlined" />
                  )}
                </Box>
              </Box>
               <Button variant="outlined" size="small" sx={{ textTransform: 'none' }} onClick={(e) => { e.stopPropagation(); navigate(`/teams/${team.numericId}`); }}>View</Button>
            </Box>
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
          display: 'flex',
          gap: 2,
          mb: 3,
          flexDirection: { xs: 'row', sm: 'row', md: 'row' },
          overflowX: { xs: 'auto', sm: 'visible' },
          pb: { xs: 1, sm: 0 },
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          <Card sx={{ flex: '0 0 auto', minWidth: { xs: 140, sm: 180 } }}>
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
          <Card sx={{ flex: '0 0 auto', minWidth: { xs: 140, sm: 180 } }}>
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
          <Card sx={{ flex: '0 0 auto', minWidth: { xs: 140, sm: 180 } }}>
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* Teams content - Table on desktop, Grid on mobile */}
        {isDesktop ? renderTableView() : renderGridView()}

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


