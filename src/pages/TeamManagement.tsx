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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from '../contexts/AuthContext';

interface Team {
  id: number;
  name: string;
  captain: string;
  players: number;
  matches: number;
  wins: number;
  losses: number;
  status: 'Active' | 'Inactive';
  logo?: string;
}

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
  const [teams, setTeams] = React.useState<Team[]>([
    { id: 1, name: 'Thunder Strikers', captain: 'Rajesh Kumar', players: 15, matches: 24, wins: 18, losses: 6, status: 'Active' },
    { id: 2, name: 'Lightning Bolts', captain: 'Amit Singh', players: 14, matches: 22, wins: 14, losses: 8, status: 'Active' },
    { id: 3, name: 'Royal Warriors', captain: 'Vikas Sharma', players: 16, matches: 20, wins: 12, losses: 8, status: 'Active' },
    { id: 4, name: 'Kings XI', captain: 'Suresh Patel', players: 15, matches: 18, wins: 10, losses: 8, status: 'Active' },
    { id: 5, name: 'Phoenix Risers', captain: 'Anil Verma', players: 13, matches: 15, wins: 8, losses: 7, status: 'Inactive' },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuTeam, setMenuTeam] = React.useState<Team | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    captain: '',
    players: '',
  });

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        captain: team.captain,
        players: team.players.toString(),
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

  const handleSaveTeam = () => {
    if (selectedTeam) {
      // Update existing team
      setTeams(teams.map(team =>
        team.id === selectedTeam.id
          ? { ...team, name: formData.name, captain: formData.captain, players: parseInt(formData.players) || 0 }
          : team
      ));
    } else {
      // Create new team
      const newTeam: Team = {
        id: Math.max(...teams.map(t => t.id)) + 1,
        name: formData.name,
        captain: formData.captain,
        players: parseInt(formData.players) || 0,
        matches: 0,
        wins: 0,
        losses: 0,
        status: 'Active',
      };
      setTeams([...teams, newTeam]);
    }
    handleCloseDialog();
  };

  const handleDeleteTeam = (teamId: number) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      setTeams(teams.filter(team => team.id !== teamId));
    }
    handleCloseMenu();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, team: Team) => {
    setAnchorEl(event.currentTarget);
    setMenuTeam(team);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuTeam(null);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.captain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTeams = teams.length;
  const activeTeams = teams.filter(t => t.status === 'Active').length;
  const totalPlayers = teams.reduce((sum, team) => sum + team.players, 0);

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
                  <TableCell>{team.captain}</TableCell>
                  <TableCell>{team.players}</TableCell>
                  <TableCell>{team.matches}</TableCell>
                  <TableCell>{team.wins}</TableCell>
                  <TableCell>{team.losses}</TableCell>
                  <TableCell>
                    <Chip
                      label={team.status}
                      size="small"
                      color={team.status === 'Active' ? 'success' : 'default'}
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
