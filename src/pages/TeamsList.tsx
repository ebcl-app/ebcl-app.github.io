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
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
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
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiTeams = await CricketApiService.getTeams();

        // Transform API data to component format
        const transformedTeams: Team[] = apiTeams.map((apiTeam: ApiTeam) => ({
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
      } catch (err) {
        setError('Failed to load teams. Please try again later.');
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filtered = teams.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  // Keep page shell; show overlay and inline error

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <BusyOverlay open={loading} label="Loading teams..." />
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Teams</Typography>
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

        {/* Teams grid */}
         <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
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


