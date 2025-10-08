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
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SportsIcon from '@mui/icons-material/Sports';
import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../contexts/AuthContext';
import { CricketApiService, type ApiPlayer, type ApiTeam } from '../api/cricketApi';

const PlayersManagement: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Access denied. Please log in as an administrator.
        </Typography>
      </Box>
    );
  }

  const [players, setPlayers] = React.useState<ApiPlayer[]>([]);
  const [teams, setTeams] = React.useState<ApiTeam[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [playersPagination, setPlayersPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [teamsPagination, setTeamsPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [playersResponse, teamsResponse] = await Promise.all([
          CricketApiService.getPlayers({ page: playersPagination.page, limit: playersPagination.limit }),
          CricketApiService.getTeams({ page: teamsPagination.page, limit: teamsPagination.limit })
        ]);

        if (playersResponse.success && teamsResponse.success) {
          setPlayers(playersResponse.data);
          setTeams(teamsResponse.data);
          setPlayersPagination(prev => ({
            ...prev,
            total: playersResponse.pagination.total,
            totalPages: playersResponse.pagination.totalPages,
          }));
          setTeamsPagination(prev => ({
            ...prev,
            total: teamsResponse.pagination.total,
            totalPages: teamsResponse.pagination.totalPages,
          }));
        } else {
          setError('Failed to load players and teams data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load players and teams data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playersPagination.page, teamsPagination.page]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedPlayer, setSelectedPlayer] = React.useState<ApiPlayer | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuPlayer, setMenuPlayer] = React.useState<ApiPlayer | null>(null);
  const [tabValue, setTabValue] = React.useState(0);

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    team: '',
    role: 'batsman' as ApiPlayer['role'],
    battingStyle: 'RHB',
    bowlingStyle: '',
  });

  const availableTeams = teams.map(team => team.name);

  const handleOpenDialog = (player?: ApiPlayer) => {
    if (player) {
      setSelectedPlayer(player);
      setFormData({
        name: player.name,
        email: player.email || '',
        phone: '', // ApiPlayer doesn't have phone
        team: '', // ApiPlayer doesn't have team directly
        role: player.role,
        battingStyle: player.battingStyle || 'RHB',
        bowlingStyle: player.bowlingStyle || '',
      });
    } else {
      setSelectedPlayer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        team: '',
        role: 'batsman',
        battingStyle: 'RHB',
        bowlingStyle: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlayer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      team: '',
      role: 'batsman',
      battingStyle: 'Right-handed',
      bowlingStyle: 'N/A',
    });
  };

  const handleSavePlayer = async () => {
    try {
      if (selectedPlayer) {
        // Update existing player
        const response = await CricketApiService.updatePlayer(selectedPlayer.numericId, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          battingStyle: formData.battingStyle === 'N/A' ? undefined : formData.battingStyle as 'RHB' | 'LHB',
          bowlingStyle: formData.bowlingStyle === 'N/A' ? undefined : formData.bowlingStyle,
        });

        if (response.success) {
          setPlayers(players.map(player => 
            player.numericId === selectedPlayer.numericId ? response.data : player
          ));
          handleCloseDialog();
        } else {
          alert('Failed to update player');
        }
      } else {
        // Create new player
        const response = await CricketApiService.createPlayer({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          battingStyle: formData.battingStyle === 'N/A' ? undefined : formData.battingStyle as 'RHB' | 'LHB',
          bowlingStyle: formData.bowlingStyle === 'N/A' ? undefined : formData.bowlingStyle,
          isActive: true,
        });

        if (response.success) {
          setPlayers([...players, response.data]);
          handleCloseDialog();
        } else {
          alert('Failed to create player');
        }
      }
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Failed to save player');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return;
    }

    try {
      const response = await CricketApiService.deletePlayer(parseInt(playerId));

      if (response.success) {
        setPlayers(players.filter(player => player.id !== playerId));
      } else {
        alert('Failed to delete player');
      }
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, player: ApiPlayer) => {
    setAnchorEl(event.currentTarget);
    setMenuPlayer(player);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuPlayer(null);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPlayersPagination(prev => ({ ...prev, page }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman':
        return '#4A90E2';
      case 'bowler':
        return '#EF4444';
      case 'all-rounder':
        return '#10B981';
      case 'wicket-keeper':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const filterPlayersByTab = (player: ApiPlayer) => {
    switch (tabValue) {
      case 0: // All
        return true;
      case 1: // Batsmen
        return player.role === 'batsman';
      case 2: // Bowlers
        return player.role === 'bowler';
      case 3: // All-rounders
        return player.role === 'all-rounder';
      case 4: // Wicket-keepers
        return player.role === 'wicket-keeper';
      default:
        return true;
    }
  };

  const filteredPlayers = players
    .filter(filterPlayersByTab)
    .filter(
      (player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.email && player.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const totalPlayers = playersPagination.total;
  const activePlayers = players.filter((p) => p.isActive).length;
  const totalRuns = players.reduce((sum, p) => sum + (p.totalRuns || 0), 0);
  const totalWickets = players.reduce((sum, p) => sum + (p.totalWickets || 0), 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Stats */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Players Management
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4A90E2' }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Players
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalPlayers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#10B981' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Players
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {activePlayers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#F59E0B' }}>
                  <SportsIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Runs
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalRuns.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#EF4444' }}>
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Wickets
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalWickets}
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
              sx={{ flex: '1 1 300px', minWidth: 0 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#4A90E2' }}
            >
              Add Player
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs for filtering by role */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" />
          <Tab label="Batsmen" />
          <Tab label="Bowlers" />
          <Tab label="All-rounders" />
          <Tab label="Wicket-keepers" />
        </Tabs>
      </Card>

      {/* Players Table */}
      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Matches</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Runs</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Wickets</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Average</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Strike Rate</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: getRoleColor(player.role),
                          width: 40,
                          height: 40,
                        }}
                      >
                        {player.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {player.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {player.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">N/A</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={player.role.charAt(0).toUpperCase() + player.role.slice(1)}
                      size="small"
                      sx={{
                        bgcolor: `${getRoleColor(player.role)}20`,
                        color: getRoleColor(player.role),
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{player.matchesPlayed || 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {player.totalRuns || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {player.totalWickets || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{player.battingAverage?.toFixed(2) || '0.00'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{player.battingStrikeRate?.toFixed(2) || '0.00'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={player.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={player.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, player)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {playersPagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
            <Pagination
              count={playersPagination.totalPages}
              page={playersPagination.page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Card>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => {
          // TODO: Navigate to player profile
          handleCloseMenu();
        }}>
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
          View Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOpenDialog(menuPlayer!);
            handleCloseMenu();
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeletePlayer(menuPlayer!.id)}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Team</InputLabel>
              <Select
                value={formData.team}
                label="Team"
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              >
                {availableTeams.map((team) => (
                  <MenuItem key={team} value={team}>
                    {team}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as ApiPlayer['role'] })}
              >
                <MenuItem value="batsman">Batsman</MenuItem>
                <MenuItem value="bowler">Bowler</MenuItem>
                <MenuItem value="all-rounder">All-rounder</MenuItem>
                <MenuItem value="wicket-keeper">Wicket-keeper</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Batting Style</InputLabel>
                <Select
                  value={formData.battingStyle}
                  label="Batting Style"
                  onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })}
                >
                  <MenuItem value="Right-handed">Right-handed</MenuItem>
                  <MenuItem value="Left-handed">Left-handed</MenuItem>
                  <MenuItem value="N/A">N/A</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Bowling Style</InputLabel>
                <Select
                  value={formData.bowlingStyle}
                  label="Bowling Style"
                  onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
                >
                  <MenuItem value="Right-arm fast">Right-arm fast</MenuItem>
                  <MenuItem value="Left-arm fast">Left-arm fast</MenuItem>
                  <MenuItem value="Right-arm spin">Right-arm spin</MenuItem>
                  <MenuItem value="Left-arm spin">Left-arm spin</MenuItem>
                  <MenuItem value="N/A">N/A</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePlayer}
            disabled={
              !formData.name ||
              !formData.email ||
              !formData.phone ||
              !formData.team
            }
            sx={{ bgcolor: '#4A90E2' }}
          >
            {selectedPlayer ? 'Update' : 'Add Player'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlayersManagement;
