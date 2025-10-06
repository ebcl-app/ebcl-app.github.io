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
import PersonIcon from '@mui/icons-material/Person';
import SportsIcon from '@mui/icons-material/Sports';
import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Player {
  id: number;
  name: string;
  email: string;
  phone: string;
  team: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';
  battingStyle: string;
  bowlingStyle: string;
  matches: number;
  runs: number;
  wickets: number;
  average: string;
  strikeRate: string;
  status: 'Active' | 'Injured' | 'Inactive';
  avatar?: string;
}

const PlayersManagement: React.FC = () => {
  const [players, setPlayers] = React.useState<Player[]>([
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.k@email.com',
      phone: '+91 98765 43210',
      team: 'Thunder Strikers',
      role: 'Batsman',
      battingStyle: 'Right-handed',
      bowlingStyle: 'N/A',
      matches: 45,
      runs: 2156,
      wickets: 0,
      average: '47.91',
      strikeRate: '142.5',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Amit Sharma',
      email: 'amit.sharma@email.com',
      phone: '+91 98765 43211',
      team: 'Lightning Bolts',
      role: 'All-rounder',
      battingStyle: 'Right-handed',
      bowlingStyle: 'Right-arm fast',
      matches: 52,
      runs: 1876,
      wickets: 64,
      average: '38.25',
      strikeRate: '135.8',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Priya Patel',
      email: 'priya.p@email.com',
      phone: '+91 98765 43212',
      team: 'Royal Warriors',
      role: 'Bowler',
      battingStyle: 'Right-handed',
      bowlingStyle: 'Right-arm spin',
      matches: 38,
      runs: 245,
      wickets: 58,
      average: '8.12',
      strikeRate: '98.5',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Vikram Singh',
      email: 'vikram.s@email.com',
      phone: '+91 98765 43213',
      team: 'Phoenix Risers',
      role: 'Wicket-keeper',
      battingStyle: 'Left-handed',
      bowlingStyle: 'N/A',
      matches: 41,
      runs: 1654,
      wickets: 0,
      average: '42.41',
      strikeRate: '128.3',
      status: 'Injured',
    },
    {
      id: 5,
      name: 'Anil Verma',
      email: 'anil.v@email.com',
      phone: '+91 98765 43214',
      team: 'Kings XI',
      role: 'All-rounder',
      battingStyle: 'Right-handed',
      bowlingStyle: 'Left-arm spin',
      matches: 48,
      runs: 1923,
      wickets: 42,
      average: '44.72',
      strikeRate: '138.9',
      status: 'Active',
    },
    {
      id: 6,
      name: 'Sneha Reddy',
      email: 'sneha.r@email.com',
      phone: '+91 98765 43215',
      team: 'Eagle Eyes',
      role: 'Batsman',
      battingStyle: 'Right-handed',
      bowlingStyle: 'N/A',
      matches: 35,
      runs: 1587,
      wickets: 0,
      average: '49.59',
      strikeRate: '145.2',
      status: 'Active',
    },
    {
      id: 7,
      name: 'Mohammed Ali',
      email: 'mohammed.a@email.com',
      phone: '+91 98765 43216',
      team: 'Thunder Strikers',
      role: 'Bowler',
      battingStyle: 'Right-handed',
      bowlingStyle: 'Right-arm fast',
      matches: 44,
      runs: 156,
      wickets: 72,
      average: '5.19',
      strikeRate: '87.4',
      status: 'Active',
    },
    {
      id: 8,
      name: 'Deepak Choudhary',
      email: 'deepak.c@email.com',
      phone: '+91 98765 43217',
      team: 'Lightning Bolts',
      role: 'Batsman',
      battingStyle: 'Left-handed',
      bowlingStyle: 'N/A',
      matches: 29,
      runs: 1234,
      wickets: 0,
      average: '45.70',
      strikeRate: '139.8',
      status: 'Inactive',
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuPlayer, setMenuPlayer] = React.useState<Player | null>(null);
  const [tabValue, setTabValue] = React.useState(0);

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    team: '',
    role: 'Batsman' as Player['role'],
    battingStyle: 'Right-handed',
    bowlingStyle: 'N/A',
  });

  const availableTeams = [
    'Thunder Strikers',
    'Lightning Bolts',
    'Royal Warriors',
    'Kings XI',
    'Phoenix Risers',
    'Eagle Eyes',
    'Warriors United',
    'Storm Chasers',
  ];

  const handleOpenDialog = (player?: Player) => {
    if (player) {
      setSelectedPlayer(player);
      setFormData({
        name: player.name,
        email: player.email,
        phone: player.phone,
        team: player.team,
        role: player.role,
        battingStyle: player.battingStyle,
        bowlingStyle: player.bowlingStyle,
      });
    } else {
      setSelectedPlayer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        team: '',
        role: 'Batsman',
        battingStyle: 'Right-handed',
        bowlingStyle: 'N/A',
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
      role: 'Batsman',
      battingStyle: 'Right-handed',
      bowlingStyle: 'N/A',
    });
  };

  const handleSavePlayer = () => {
    if (selectedPlayer) {
      // Update existing player
      setPlayers(
        players.map((player) =>
          player.id === selectedPlayer.id
            ? {
                ...player,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                team: formData.team,
                role: formData.role,
                battingStyle: formData.battingStyle,
                bowlingStyle: formData.bowlingStyle,
              }
            : player
        )
      );
    } else {
      // Create new player
      const newPlayer: Player = {
        id: Math.max(...players.map((p) => p.id)) + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        team: formData.team,
        role: formData.role,
        battingStyle: formData.battingStyle,
        bowlingStyle: formData.bowlingStyle,
        matches: 0,
        runs: 0,
        wickets: 0,
        average: '0.00',
        strikeRate: '0.00',
        status: 'Active',
      };
      setPlayers([...players, newPlayer]);
    }
    handleCloseDialog();
  };

  const handleDeletePlayer = (playerId: number) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      setPlayers(players.filter((player) => player.id !== playerId));
    }
    handleCloseMenu();
  };

  const handleUpdateStatus = (playerId: number, newStatus: Player['status']) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId ? { ...player, status: newStatus } : player
      )
    );
    handleCloseMenu();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, player: Player) => {
    setAnchorEl(event.currentTarget);
    setMenuPlayer(player);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuPlayer(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Injured':
        return 'error';
      case 'Inactive':
        return 'default';
      default:
        return 'default';
    }
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

  const filterPlayersByTab = (player: Player) => {
    switch (tabValue) {
      case 0: // All
        return true;
      case 1: // Batsmen
        return player.role === 'Batsman';
      case 2: // Bowlers
        return player.role === 'Bowler';
      case 3: // All-rounders
        return player.role === 'All-rounder';
      case 4: // Wicket-keepers
        return player.role === 'Wicket-keeper';
      default:
        return true;
    }
  };

  const filteredPlayers = players
    .filter(filterPlayersByTab)
    .filter(
      (player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalPlayers = players.length;
  const activePlayers = players.filter((p) => p.status === 'Active').length;
  const totalRuns = players.reduce((sum, p) => sum + p.runs, 0);
  const totalWickets = players.reduce((sum, p) => sum + p.wickets, 0);

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
          <Tab label={`All (${totalPlayers})`} />
          <Tab label={`Batsmen (${players.filter((p) => p.role === 'Batsman').length})`} />
          <Tab label={`Bowlers (${players.filter((p) => p.role === 'Bowler').length})`} />
          <Tab label={`All-rounders (${players.filter((p) => p.role === 'All-rounder').length})`} />
          <Tab label={`Wicket-keepers (${players.filter((p) => p.role === 'Wicket-keeper').length})`} />
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
                    <Typography variant="body2">{player.team}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={player.role}
                      size="small"
                      sx={{
                        bgcolor: `${getRoleColor(player.role)}20`,
                        color: getRoleColor(player.role),
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{player.matches}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {player.runs}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {player.wickets}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{player.average}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{player.strikeRate}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={player.status}
                      size="small"
                      color={getStatusColor(player.status)}
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
        {menuPlayer?.status !== 'Active' && (
          <MenuItem onClick={() => handleUpdateStatus(menuPlayer!.id, 'Active')}>
            <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
            Mark as Active
          </MenuItem>
        )}
        {menuPlayer?.status !== 'Injured' && (
          <MenuItem onClick={() => handleUpdateStatus(menuPlayer!.id, 'Injured')}>
            <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
            Mark as Injured
          </MenuItem>
        )}
        {menuPlayer?.status !== 'Inactive' && (
          <MenuItem onClick={() => handleUpdateStatus(menuPlayer!.id, 'Inactive')}>
            <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
            Mark as Inactive
          </MenuItem>
        )}
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
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Player['role'] })}
              >
                <MenuItem value="Batsman">Batsman</MenuItem>
                <MenuItem value="Bowler">Bowler</MenuItem>
                <MenuItem value="All-rounder">All-rounder</MenuItem>
                <MenuItem value="Wicket-keeper">Wicket-keeper</MenuItem>
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
