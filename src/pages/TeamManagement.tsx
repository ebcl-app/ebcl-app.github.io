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
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../contexts/AuthContext';
import { CricketApiService, type ApiTeam } from '../api/cricketApi';

const TeamManagement: React.FC = () => {
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

  const [teams, setTeams] = React.useState<ApiTeam[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [teamsPagination, setTeamsPagination] = React.useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [playersPagination, setPlayersPagination] = React.useState({
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
        const [teamsResponse, playersResponse] = await Promise.all([
          CricketApiService.getTeams({ page: teamsPagination.page, limit: teamsPagination.limit }),
          CricketApiService.getPlayers({ page: 1, limit: 1 }) // Just get pagination info, not all players
        ]);

        if (teamsResponse.success && playersResponse.success) {
          setTeams(teamsResponse.data);
          setTeamsPagination(prev => ({
            ...prev,
            total: teamsResponse.pagination.total,
            totalPages: teamsResponse.pagination.totalPages,
          }));
          setPlayersPagination(prev => ({
            ...prev,
            total: playersResponse.pagination.total,
            totalPages: playersResponse.pagination.totalPages,
          }));
        } else {
          setError('Failed to load teams data');
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamsPagination.page]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<ApiTeam | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuTeam, setMenuTeam] = React.useState<ApiTeam | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    captain: '',
    players: '',
  });

  const handleOpenDialog = (team?: ApiTeam) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        captain: team.captain?.name || '',
        players: team.playersCount?.toString() || '',
      });
    } else {
      setSelectedTeam(null);
      setFormData({ name: '', captain: '', players: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeam(null);
    setFormData({ name: '', captain: '', players: '' });
  };

  const handleSaveTeam = async () => {
    try {
      if (selectedTeam) {
        // Update existing team
        const response = await CricketApiService.updateTeam(selectedTeam.numericId, {
          name: formData.name,
          captainId: formData.captain ? formData.captain : undefined,
        });

        if (response.success) {
          setTeams(teams.map(team => 
            team.numericId === selectedTeam.numericId ? response.data : team
          ));
          handleCloseDialog();
        } else {
          alert('Failed to update team');
        }
      } else {
        // Create new team
        const response = await CricketApiService.createTeam({
          name: formData.name,
          captainId: formData.captain ? formData.captain : undefined,
        });

        if (response.success) {
          setTeams([...teams, response.data]);
          handleCloseDialog();
        } else {
          alert('Failed to create team');
        }
      }
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Failed to save team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      const response = await CricketApiService.deleteTeam(parseInt(teamId));

      if (response.success) {
        setTeams(teams.filter(team => team.id !== teamId));
      } else {
        alert('Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, team: ApiTeam) => {
    setAnchorEl(event.currentTarget);
    setMenuTeam(team);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuTeam(null);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setTeamsPagination(prev => ({ ...prev, page }));
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.captain?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTeams = teamsPagination.total;
  const activeTeams = teamsPagination.total; // All teams are considered active
  const totalPlayers = playersPagination.total; // Unique players count

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
          Team Management
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#4A90E2' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Teams
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalTeams}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#10B981' }}>
                  <EmojiEventsIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Teams
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {activeTeams}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#F59E0B' }}>
                  <PeopleIcon />
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
        </Box>
      </Box>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search teams..."
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
              Add Team
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Teams Table */}
      <Card>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 600 }}>Team Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Captain</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Players</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Matches</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Wins</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Losses</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: '#4A90E2', width: 32, height: 32, fontSize: '0.875rem' }}>
                        {team.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {team.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{team.captain?.name || 'N/A'}</TableCell>
                  <TableCell>{team.playersCount || 0}</TableCell>
                  <TableCell>{team.statistics?.totalMatches || 0}</TableCell>
                  <TableCell>{team.statistics?.wins || 0}</TableCell>
                  <TableCell>{team.statistics?.losses || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label="Active"
                      size="small"
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, team)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {teamsPagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
            <Pagination
              count={teamsPagination.totalPages}
              page={teamsPagination.page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => { handleOpenDialog(menuTeam!); handleCloseMenu(); }}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTeam(menuTeam!.id)}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTeam ? 'Edit Team' : 'Add New Team'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Team Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label="Captain Name"
              fullWidth
              value={formData.captain}
              onChange={(e) => setFormData({ ...formData, captain: e.target.value })}
              required
            />
            <TextField
              label="Number of Players"
              type="number"
              fullWidth
              value={formData.players}
              onChange={(e) => setFormData({ ...formData, players: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveTeam}
            disabled={!formData.name || !formData.captain || !formData.players}
            sx={{ bgcolor: '#4A90E2' }}
          >
            {selectedTeam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManagement;
