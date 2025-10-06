import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsIcon from '@mui/icons-material/Sports';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { CricketApiService, type ApiMatch, type ApiTeam } from '../api/cricketApi';

interface Match {
  id: number;
  stringId: string;
  team1: {
    name: string;
    score?: string;
    overs?: string;
  };
  team2: {
    name: string;
    score?: string;
    overs?: string;
  };
  date: string;
  time: string;
  venue: string;
  status: 'Scheduled' | 'Live' | 'Completed';
  winner?: string;
  matchType: string;
}

const MatchesManagement: React.FC = () => {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [teams, setTeams] = React.useState<ApiTeam[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuMatch, setMenuMatch] = React.useState<Match | null>(null);
  const [tabValue, setTabValue] = React.useState(0);

  const [formData, setFormData] = React.useState({
    team1: '',
    team2: '',
    date: '',
    time: '',
    venue: '',
    matchType: 'T20',
  });

  const availableTeams = teams.map(team => team.name);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matchesResponse, teamsResponse] = await Promise.all([
          CricketApiService.getMatches(),
          CricketApiService.getTeams()
        ]);

        if (matchesResponse.success && teamsResponse.success) {
          // Transform API matches to component format
          const transformedMatches: Match[] = matchesResponse.data.map((apiMatch: ApiMatch) => ({
            id: apiMatch.numericId,
            stringId: apiMatch.id,
            team1: {
              name: apiMatch.team1?.name || 'Unknown Team',
              score: apiMatch.team1Score ? `${apiMatch.team1Score}` : undefined,
            },
            team2: {
              name: apiMatch.team2?.name || 'Unknown Team',
              score: apiMatch.team2Score ? `${apiMatch.team2Score}` : undefined,
            },
            date: apiMatch.scheduledDate || '',
            time: '', // API doesn't provide time separately
            venue: apiMatch.venue || '',
            status: (apiMatch.status.charAt(0).toUpperCase() + apiMatch.status.slice(1)) as 'Scheduled' | 'Live' | 'Completed',
            winner: apiMatch.winner,
            matchType: apiMatch.matchType || 'T20',
          }));

          setMatches(transformedMatches);
          setTeams(teamsResponse.data);
          setError(null);
        } else {
          setError('Failed to load matches and teams data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load matches and teams data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (match?: Match) => {
    if (match) {
      setSelectedMatch(match);
      setFormData({
        team1: match.team1.name,
        team2: match.team2.name,
        date: match.date,
        time: match.time,
        venue: match.venue,
        matchType: match.matchType,
      });
    } else {
      setSelectedMatch(null);
      setFormData({
        team1: '',
        team2: '',
        date: '',
        time: '',
        venue: '',
        matchType: 'T20',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMatch(null);
    setFormData({
      team1: '',
      team2: '',
      date: '',
      time: '',
      venue: '',
      matchType: 'T20',
    });
  };

  const handleSaveMatch = () => {
    if (selectedMatch) {
      // Update existing match
      setMatches(
        matches.map((match) =>
          match.id === selectedMatch.id
            ? {
                ...match,
                team1: {
                  name: formData.team1,
                  score: match.team1.score,
                },
                team2: {
                  name: formData.team2,
                  score: match.team2.score,
                },
                date: formData.date,
                time: formData.time,
                venue: formData.venue,
                matchType: formData.matchType,
              }
            : match
        )
      );
    } else {
      // Create new match
      const newMatch: Match = {
        id: Math.max(...matches.map((m) => m.id)) + 1,
        stringId: `match_${Math.max(...matches.map((m) => m.id)) + 1}`,
        team1: {
          name: formData.team1,
        },
        team2: {
          name: formData.team2,
        },
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        matchType: formData.matchType,
        status: 'Scheduled',
      };
      setMatches([...matches, newMatch]);
    }
    handleCloseDialog();
  };

  const handleDeleteMatch = (matchId: number) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      setMatches(matches.filter((match) => match.id !== matchId));
    }
    handleCloseMenu();
  };

  const handleUpdateStatus = (matchId: number, newStatus: 'Scheduled' | 'Live' | 'Completed') => {
    setMatches(
      matches.map((match) =>
        match.id === matchId ? { ...match, status: newStatus } : match
      )
    );
    handleCloseMenu();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, match: Match) => {
    setAnchorEl(event.currentTarget);
    setMenuMatch(match);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuMatch(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'error';
      case 'Completed':
        return 'success';
      case 'Scheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case 'Live':
        return <PlayArrowIcon sx={{ fontSize: 16 }} />;
      case 'Completed':
        return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'Scheduled':
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
      default:
        return undefined;
    }
  };

  const filterMatchesByTab = (match: Match) => {
    switch (tabValue) {
      case 0: // All
        return true;
      case 1: // Scheduled
        return match.status === 'Scheduled';
      case 2: // Live
        return match.status === 'Live';
      case 3: // Completed
        return match.status === 'Completed';
      default:
        return true;
    }
  };

  const filteredMatches = matches
    .filter(filterMatchesByTab)
    .filter(
      (match) =>
        match.team1.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.team2.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalMatches = matches.length;
  const liveMatches = matches.filter((m) => m.status === 'Live').length;
  const scheduledMatches = matches.filter((m) => m.status === 'Scheduled').length;
  const completedMatches = matches.filter((m) => m.status === 'Completed').length;

  return (
    <Box>
      {/* Header with Stats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Matches Management
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4A90E2' }}>
                  <SportsIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Matches
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalMatches}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#EF4444' }}>
                  <PlayArrowIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Live Matches
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {liveMatches}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#F59E0B' }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Scheduled
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {scheduledMatches}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#10B981' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {completedMatches}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <TextField
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: '1 1 300px', minWidth: 0 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#4A90E2' }}
            >
              Schedule Match
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading and Error States */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" align="center">
              Loading matches and teams...
            </Typography>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" color="error" align="center">
              {error}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Tabs for filtering */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`All (${totalMatches})`} />
          <Tab label={`Scheduled (${scheduledMatches})`} />
          <Tab label={`Live (${liveMatches})`} />
          <Tab label={`Completed (${completedMatches})`} />
        </Tabs>
      </Card>

      {/* Matches Table */}
      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600 }}>Match</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Venue</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMatches.map((match) => (
                <TableRow key={match.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {match.team1.name} vs {match.team2.name}
                      </Typography>
                      {match.winner && (
                        <Typography variant="caption" color="success.main">
                          Winner: {match.winner}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {match.team1.score && match.team2.score ? (
                      <Box>
                        <Typography variant="body2">
                          {match.team1.score} - {match.team2.score}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not started
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(match.date).toLocaleDateString()} {match.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2">{match.venue}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={match.matchType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(match.status)}
                      label={match.status}
                      size="small"
                      color={getStatusColor(match.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, match)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            handleOpenDialog(menuMatch!);
            handleCloseMenu();
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        {menuMatch?.status === 'Scheduled' && (
          <MenuItem onClick={() => handleUpdateStatus(menuMatch!.id, 'Live')}>
            <PlayArrowIcon sx={{ mr: 1, fontSize: 20 }} />
            Start Match
          </MenuItem>
        )}
        {menuMatch?.status === 'Live' && (
          <MenuItem onClick={() => handleUpdateStatus(menuMatch!.id, 'Completed')}>
            <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            Complete Match
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteMatch(menuMatch!.id)}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedMatch ? 'Edit Match' : 'Schedule New Match'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Team 1</InputLabel>
              <Select
                value={formData.team1}
                label="Team 1"
                onChange={(e) => setFormData({ ...formData, team1: e.target.value })}
              >
                {availableTeams.map((team) => (
                  <MenuItem key={team} value={team} disabled={team === formData.team2}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Team 2</InputLabel>
              <Select
                value={formData.team2}
                label="Team 2"
                onChange={(e) => setFormData({ ...formData, team2: e.target.value })}
              >
                {availableTeams.map((team) => (
                  <MenuItem key={team} value={team} disabled={team === formData.team1}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Time"
              type="time"
              fullWidth
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Venue"
              fullWidth
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Match Type</InputLabel>
              <Select
                value={formData.matchType}
                label="Match Type"
                onChange={(e) => setFormData({ ...formData, matchType: e.target.value })}
              >
                <MenuItem value="T20">T20</MenuItem>
                <MenuItem value="ODI">ODI (50 Overs)</MenuItem>
                <MenuItem value="Test">Test Match</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveMatch}
            disabled={
              !formData.team1 ||
              !formData.team2 ||
              !formData.date ||
              !formData.time ||
              !formData.venue ||
              formData.team1 === formData.team2
            }
            sx={{ bgcolor: '#4A90E2' }}
          >
            {selectedMatch ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MatchesManagement;
