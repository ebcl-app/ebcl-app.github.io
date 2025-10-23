import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Stack,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import StarsIcon from '@mui/icons-material/Stars';
import ShieldIcon from '@mui/icons-material/Shield';
import { CricketApiService } from '../api/cricketApi';
import type { AuctionBid, CreateAuctionRequest, ApiTournament, ApiPlayer, ApiTeam } from '../api/cricketApi';

interface AuctionState {
  id?: string;
  tournamentId: string;
  tournamentName: string;
  totalBudget: number;
  minBidIncrement: number;
  basePricePerPlayer: number;
  maxPlayersPerTeam: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

interface Team {
  id: string;
  name: string;
  shortName: string;
  remainingBudget: number;
  totalBudget: number;
  playersCount: number;
  players: AuctionPlayer[];
}

interface AuctionPlayer {
  playerId: string;
  name: string;
  role: string;
  basePrice: number;
  currentBid: number;
  biddingTeam: string | null;
  status: 'available' | 'bidding' | 'sold' | 'unsold';
  soldTo?: string;
  finalPrice?: number;
}

interface Bid {
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: number;
}

// Helper function to get role icon and color
const getRoleIconAndColor = (role: string) => {
  const roleLower = role.toLowerCase();
  
  if (roleLower.includes('bat')) {
    return { 
      icon: SportsCricketIcon, 
      color: '#1976d2', // Blue for batsman
      label: 'Batsman' 
    };
  } else if (roleLower.includes('bowl')) {
    return { 
      icon: SportsBaseballIcon, 
      color: '#d32f2f', // Red for bowler
      label: 'Bowler' 
    };
  } else if (roleLower.includes('all')) {
    return { 
      icon: StarsIcon, 
      color: '#ed6c02', // Orange for all-rounder
      label: 'All-Rounder' 
    };
  } else if (roleLower.includes('wicket') || roleLower.includes('keeper')) {
    return { 
      icon: ShieldIcon, 
      color: '#2e7d32', // Green for wicket-keeper
      label: 'Wicket-Keeper' 
    };
  }
  
  // Default
  return { 
    icon: PersonIcon, 
    color: '#757575', 
    label: role 
  };
};

const AuctionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState(0);
  
  // Auction Setup States
  const [setupDialogOpen, setSetupDialogOpen] = React.useState(false);
  const [tournaments, setTournaments] = React.useState<ApiTournament[]>([]);
  const [allTeams, setAllTeams] = React.useState<Team[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [availablePlayers, setAvailablePlayers] = React.useState<ApiPlayer[]>([]);
  
  // Current Auction States
  const [auctionConfig, setAuctionConfig] = React.useState<AuctionState | null>(null);
  const [currentPlayer, setCurrentPlayer] = React.useState<AuctionPlayer | null>(null);
  const [playerQueue, setPlayerQueue] = React.useState<AuctionPlayer[]>([]);
  const [soldPlayers, setSoldPlayers] = React.useState<AuctionPlayer[]>([]);
  const [unsoldPlayers, setUnsoldPlayers] = React.useState<AuctionPlayer[]>([]);
  
  // Bidding States
  const [bidHistory, setBidHistory] = React.useState<Bid[]>([]);
  const [activeBidTeam, setActiveBidTeam] = React.useState<string | null>(null);
  const [isSyncingToBackend, setIsSyncingToBackend] = React.useState(false);
  
  // Form States
  const [selectedTournament, setSelectedTournament] = React.useState('');
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>([]);
  const [totalBudget, setTotalBudget] = React.useState(10000);
  const [minBidIncrement, setMinBidIncrement] = React.useState(100);
  const [basePrice, setBasePrice] = React.useState(500);
  const [maxPlayers, setMaxPlayers] = React.useState(15);

  React.useEffect(() => {
    fetchTournaments();
    fetchTeams();
    fetchPlayers();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await CricketApiService.getTournaments();
      if (response.success) {
        setTournaments(response.data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await CricketApiService.getTeams();
      if (response.success) {
        const teamsData: Team[] = response.data.map((team: ApiTeam) => ({
          id: team.id || team.numericId?.toString() || '',
          name: team.name,
          shortName: team.shortName || team.name.substring(0, 3).toUpperCase(),
          remainingBudget: totalBudget,
          totalBudget: totalBudget,
          playersCount: 0,
          players: []
        }));
        setAllTeams(teamsData);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await CricketApiService.getPlayers();
      if (response.success) {
        setAvailablePlayers(response.data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleCreateAuction = async () => {
    if (!selectedTournament) {
      alert('Please select a tournament');
      return;
    }

    if (selectedTeamIds.length < 2) {
      alert('Please select at least 2 teams to participate in the auction');
      return;
    }

    const tournament = tournaments.find(t => t.displayId === selectedTournament);
    const config: AuctionState = {
      tournamentId: tournament?.displayId || selectedTournament,
      tournamentName: tournament?.name || 'Unknown Tournament',
      totalBudget,
      minBidIncrement,
      basePricePerPlayer: basePrice,
      maxPlayersPerTeam: maxPlayers,
      status: 'draft'
    };

    // Initialize player queue
    const players: AuctionPlayer[] = availablePlayers.map(player => ({
      playerId: player.id || player.numericId.toString(),
      name: player.name,
      role: player.role,
      basePrice: basePrice,
      currentBid: basePrice,
      biddingTeam: null,
      status: 'available'
    }));

    // Filter teams to only include selected teams
    const participatingTeams = allTeams.filter(team => selectedTeamIds.includes(team.id));
    
    // Update team budgets
    const updatedTeams = participatingTeams.map(team => ({
      ...team,
      totalBudget,
      remainingBudget: totalBudget,
      playersCount: 0,
      players: []
    }));

    setAuctionConfig(config);
    setPlayerQueue(players);
    setTeams(updatedTeams);
    setSetupDialogOpen(false);
    setTab(1); // Switch to auction tab

    // Create auction in backend - pass config and teams directly since state update is async
    await createAuctionInBackend(config, updatedTeams);
  };

  const startAuction = async () => {
    if (!auctionConfig || playerQueue.length === 0) return;

    // Start auction in backend first
    await startAuctionInBackend();

    const nextPlayer = playerQueue[0];
    setCurrentPlayer({
      ...nextPlayer,
      status: 'bidding',
      currentBid: nextPlayer.basePrice
    });
    setPlayerQueue(playerQueue.slice(1));
    setBidHistory([]);
    setAuctionConfig({ ...auctionConfig, status: 'active' });
  };

  const handleBid = async (teamId: string) => {
    if (!currentPlayer || !auctionConfig) return;

    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const newBidAmount = currentPlayer.currentBid + auctionConfig.minBidIncrement;

    if (newBidAmount > team.remainingBudget) {
      alert(`${team.name} does not have enough budget!`);
      return;
    }

    // Place bid in backend
    await placeBidInBackend(teamId, newBidAmount);

    setCurrentPlayer({
      ...currentPlayer,
      currentBid: newBidAmount,
      biddingTeam: teamId
    });

    setBidHistory([
      {
        teamId,
        teamName: team.name,
        amount: newBidAmount,
        timestamp: Date.now()
      },
      ...bidHistory
    ]);

    setActiveBidTeam(teamId);
  };

  const handleSold = async () => {
    if (!currentPlayer || !currentPlayer.biddingTeam) {
      alert('No active bid!');
      return;
    }

    const team = teams.find(t => t.id === currentPlayer.biddingTeam);
    if (!team) return;

    // Move to next player in backend (which marks current as sold)
    await moveToNextPlayerInBackend();

    // Update player status
    const soldPlayer: AuctionPlayer = {
      ...currentPlayer,
      status: 'sold',
      soldTo: team.id,
      finalPrice: currentPlayer.currentBid
    };

    // Update team
    const updatedTeams = teams.map(t => {
      if (t.id === team.id) {
        return {
          ...t,
          remainingBudget: t.remainingBudget - currentPlayer.currentBid,
          playersCount: t.playersCount + 1,
          players: [...t.players, soldPlayer]
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    setSoldPlayers([...soldPlayers, soldPlayer]);
    setCurrentPlayer(null);
    setBidHistory([]);
    setActiveBidTeam(null);

    // Check if auction is complete
    if (playerQueue.length === 0) {
      setAuctionConfig(auctionConfig ? { ...auctionConfig, status: 'completed' } : null);
      // Update backend with completed status
      if (auctionConfig?.id) {
        await CricketApiService.updateAuction(auctionConfig.id, { status: 'completed' });
      }
    }
  };

  const handleUnsold = async () => {
    if (!currentPlayer) return;

    // Move to next player in backend (which marks current as unsold)
    await moveToNextPlayerInBackend();

    const unsoldPlayer: AuctionPlayer = {
      ...currentPlayer,
      status: 'unsold'
    };

    setUnsoldPlayers([...unsoldPlayers, unsoldPlayer]);
    setCurrentPlayer(null);
    setBidHistory([]);
    setActiveBidTeam(null);

    // Check if auction is complete
    if (playerQueue.length === 0) {
      setAuctionConfig(auctionConfig ? { ...auctionConfig, status: 'completed' } : null);
      // Update backend with completed status
      if (auctionConfig?.id) {
        await CricketApiService.updateAuction(auctionConfig.id, { status: 'completed' });
      }
    }
  };

  const handleNextPlayer = async () => {
    if (playerQueue.length === 0) return;

    // Move to next player in backend
    await moveToNextPlayerInBackend();

    const nextPlayer = playerQueue[0];
    setCurrentPlayer({
      ...nextPlayer,
      status: 'bidding',
      currentBid: nextPlayer.basePrice
    });
    setPlayerQueue(playerQueue.slice(1));
    setBidHistory([]);
    setActiveBidTeam(null);
  };

  const pauseAuction = async () => {
    if (!auctionConfig?.id) return;

    setIsSyncingToBackend(true);
    try {
      const response = await CricketApiService.pauseAuction(auctionConfig.id);
      if (response.success) {
        setAuctionConfig({ ...auctionConfig, status: 'paused' });
        console.log('Auction paused in backend');
      } else {
        console.error('Failed to pause auction:', response.message);
        alert('Failed to pause auction');
      }
    } catch (error) {
      console.error('Error pausing auction:', error);
      alert('Error pausing auction');
    } finally {
      setIsSyncingToBackend(false);
    }
  };

  const resumeAuction = async () => {
    if (!auctionConfig?.id) return;

    setIsSyncingToBackend(true);
    try {
      const response = await CricketApiService.resumeAuction(auctionConfig.id);
      if (response.success) {
        setAuctionConfig({ ...auctionConfig, status: 'active' });
        console.log('Auction resumed in backend');
      } else {
        console.error('Failed to resume auction:', response.message);
        alert('Failed to resume auction');
      }
    } catch (error) {
      console.error('Error resuming auction:', error);
      alert('Error resuming auction');
    } finally {
      setIsSyncingToBackend(false);
    }
  };

  // Backend Integration Functions
  const createAuctionInBackend = async (config: AuctionState, participatingTeams: Team[]) => {
    console.log('🚀 Creating auction in backend...', { config, teams: participatingTeams });
    
    setIsSyncingToBackend(true);
    try {
      const auctionData: CreateAuctionRequest = {
        tournamentId: config.tournamentId,
        title: `Cricket Auction - ${config.tournamentName}`,
        auctionConfig: {
          totalBudgetPerTeam: config.totalBudget,
          maxPlayersPerTeam: config.maxPlayersPerTeam,
          minPlayersPerTeam: 11, // Default minimum
          basePricePerPlayer: config.basePricePerPlayer,
          minBidIncrement: config.minBidIncrement
        },
        teams: participatingTeams.map(team => ({
          teamId: team.id,
          team: {
            teamId: team.id,
            name: team.name,
            shortName: team.shortName
          }
        }))
      };

      console.log('📤 Sending auction data to backend:', auctionData);
      const response = await CricketApiService.createAuction(auctionData);
      console.log('📥 Backend response:', response);
      
      if (response.success) {
        // Update local state with backend auction ID
        setAuctionConfig({
          ...config,
          id: response.data.auctionId
        });
        console.log('✅ Auction created in backend:', response.data.auctionId);
        alert(`Auction created successfully! ID: ${response.data.auctionId}`);
      } else {
        console.error('❌ Failed to create auction:', response.message);
        alert('Failed to create auction in backend: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error creating auction:', error);
      alert('Error creating auction in backend: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSyncingToBackend(false);
    }
  };

  const startAuctionInBackend = async () => {
    if (!auctionConfig?.id) return;

    setIsSyncingToBackend(true);
    try {
      const response = await CricketApiService.startAuction(auctionConfig.id);
      if (response.success) {
        setAuctionConfig({ ...auctionConfig, status: 'active' });
        console.log('Auction started in backend');
      } else {
        console.error('Failed to start auction:', response.message);
        alert('Failed to start auction');
      }
    } catch (error) {
      console.error('Error starting auction:', error);
      alert('Error starting auction');
    } finally {
      setIsSyncingToBackend(false);
    }
  };

  const placeBidInBackend = async (teamId: string, amount: number) => {
    if (!auctionConfig?.id || !currentPlayer) return;

    setIsSyncingToBackend(true);
    try {
      const bidData: AuctionBid = {
        teamId,
        amount
      };

      const response = await CricketApiService.placeBid(auctionConfig.id, bidData);
      if (response.success) {
        // Update local state with bid result
        setCurrentPlayer({
          ...currentPlayer,
          currentBid: amount,
          biddingTeam: teamId
        });
        console.log('Bid placed successfully in backend');
      } else {
        console.error('Failed to place bid:', response.message);
        alert(`Failed to place bid: ${response.message}`);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Error placing bid');
    } finally {
      setIsSyncingToBackend(false);
    }
  };

  const moveToNextPlayerInBackend = async () => {
    if (!auctionConfig?.id) return;

    setIsSyncingToBackend(true);
    try {
      const response = await CricketApiService.moveToNextPlayer(auctionConfig.id);
      if (response.success) {
        console.log('Moved to next player in backend');
      } else {
        console.error('Failed to move to next player:', response.message);
      }
    } catch (error) {
      console.error('Error moving to next player:', error);
    } finally {
      setIsSyncingToBackend(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/admin')} sx={{ mr: 1 }}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <GavelIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          IPL-Style Player Auction
        </Typography>
        {isSyncingToBackend && (
          <Chip 
            label="Syncing to Backend..." 
            color="warning" 
            size="small" 
            sx={{ ml: 2 }}
          />
        )}
        {!auctionConfig && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setSetupDialogOpen(true)}
            sx={{ ml: 'auto' }}
          >
            Create Auction
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)}>
          <Tab label="Setup" disabled={auctionConfig?.status === 'active'} />
          <Tab label="Live Auction" disabled={!auctionConfig} />
          <Tab label="Results" disabled={!auctionConfig} />
        </Tabs>
      </Box>

      {/* Setup Tab */}
      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Auction Configuration
            </Typography>
            {!auctionConfig ? (
              <Alert severity="info">
                Create an auction to get started. Configure tournament, budget, and rules.
              </Alert>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Tournament</Typography>
                  <Typography variant="h6">{auctionConfig.tournamentName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Budget per Team</Typography>
                  <Typography variant="h6">{auctionConfig.totalBudget.toLocaleString()} points</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Min Bid Increment</Typography>
                  <Typography variant="h6">{auctionConfig.minBidIncrement} points</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Base Price</Typography>
                  <Typography variant="h6">{auctionConfig.basePricePerPlayer} points</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Max Players per Team</Typography>
                  <Typography variant="h6">{auctionConfig.maxPlayersPerTeam}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={auctionConfig.status.toUpperCase()} 
                    color={
                      auctionConfig.status === 'active' ? 'success' :
                      auctionConfig.status === 'completed' ? 'primary' :
                      'warning'
                    }
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Participating Teams ({teams.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {teams.map(team => (
                      <Chip 
                        key={team.id}
                        label={team.name}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Auction Tab */}
      {tab === 1 && auctionConfig && (
        <Stack spacing={3}>
          {/* Auction Controls */}
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {auctionConfig.status === 'draft' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrowIcon />}
                    onClick={startAuction}
                    disabled={playerQueue.length === 0}
                  >
                    Start Auction
                  </Button>
                )}
                {auctionConfig.status === 'active' && (
                  <>
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<PauseIcon />}
                      onClick={pauseAuction}
                    >
                      Pause
                    </Button>
                    {currentPlayer && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={handleSold}
                          disabled={!currentPlayer.biddingTeam}
                        >
                          Sold
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleUnsold}
                        >
                          Unsold
                        </Button>
                      </>
                    )}
                    {!currentPlayer && playerQueue.length > 0 && (
                      <Button
                        variant="contained"
                        startIcon={<SkipNextIcon />}
                        onClick={handleNextPlayer}
                      >
                        Next Player
                      </Button>
                    )}
                  </>
                )}
                {auctionConfig.status === 'paused' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrowIcon />}
                    onClick={resumeAuction}
                  >
                    Resume
                  </Button>
                )}
                <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                  <Chip 
                    label={`Players Remaining: ${playerQueue.length}`} 
                    color="primary"
                    icon={<PersonIcon />}
                  />
                  <Chip 
                    label={`Sold: ${soldPlayers.length}`} 
                    color="success"
                    icon={<CheckCircleIcon />}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Current Player on Auction */}
            {currentPlayer && (
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Card sx={{ bgcolor: '#fff3e0', border: '3px solid #ff9800', mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#e65100' }}>
                      🔨 Current Player on Auction
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: '#ff9800' }}>
                        {currentPlayer.name.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {currentPlayer.name}
                        </Typography>
                        {(() => {
                          const roleInfo = getRoleIconAndColor(currentPlayer.role);
                          const RoleIcon = roleInfo.icon;
                          return (
                            <Chip 
                              icon={<RoleIcon sx={{ fontSize: '1rem', color: roleInfo.color + ' !important' }} />}
                              label={roleInfo.label}
                              size="small" 
                              sx={{ 
                                mt: 0.5,
                                bgcolor: roleInfo.color + '20',
                                color: roleInfo.color,
                                border: `1px solid ${roleInfo.color}`,
                                fontWeight: 600,
                                '& .MuiChip-icon': {
                                  color: roleInfo.color
                                }
                              }}
                            />
                          );
                        })()}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Base Price</Typography>
                        <Typography variant="h6">{currentPlayer.basePrice} pts</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Current Bid</Typography>
                        <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 700 }}>
                          {currentPlayer.currentBid} pts
                        </Typography>
                      </Box>
                    </Box>
                    {currentPlayer.biddingTeam && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">Leading Bid</Typography>
                        <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                          {teams.find(t => t.id === currentPlayer.biddingTeam)?.name}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Bid History */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                      Bid History
                    </Typography>
                    {bidHistory.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No bids yet</Typography>
                    ) : (
                      <Stack spacing={1}>
                        {bidHistory.map((bid, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 1.5,
                              bgcolor: index === 0 ? '#e8f5e8' : '#f5f5f5',
                              borderRadius: 1,
                              border: index === 0 ? '2px solid #4caf50' : 'none'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {bid.teamName}
                              </Typography>
                              <Typography variant="h6" sx={{ color: index === 0 ? '#2e7d32' : 'text.primary', fontWeight: 700 }}>
                                {bid.amount} pts
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Teams and Bidding */}
            <Box sx={{ flex: currentPlayer ? 1 : 2, minWidth: 300 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Teams & Budgets
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: currentPlayer ? '1fr 1fr' : '1fr 1fr 1fr' }, gap: 2 }}>
                {teams.map((team) => {
                  const budgetPercentage = (team.remainingBudget / team.totalBudget) * 100;
                  const canBid = currentPlayer && 
                    auctionConfig.status === 'active' && 
                    team.remainingBudget >= (currentPlayer.currentBid + auctionConfig.minBidIncrement) &&
                    team.playersCount < auctionConfig.maxPlayersPerTeam;

                  return (
                    <Card 
                      key={team.id}
                      sx={{ 
                        border: activeBidTeam === team.id ? '3px solid #4caf50' : 'none',
                        bgcolor: activeBidTeam === team.id ? '#e8f5e8' : 'white'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {team.name}
                          </Typography>
                          <Chip 
                            label={`${team.playersCount}/${auctionConfig.maxPlayersPerTeam}`} 
                            size="small"
                            color={team.playersCount >= auctionConfig.maxPlayersPerTeam ? 'error' : 'primary'}
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Remaining Budget</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {team.remainingBudget.toLocaleString()} pts
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={budgetPercentage} 
                            sx={{ height: 8, borderRadius: 1 }}
                            color={budgetPercentage > 50 ? 'success' : budgetPercentage > 25 ? 'warning' : 'error'}
                          />
                        </Box>
                        {currentPlayer && (
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<GavelIcon />}
                            onClick={() => handleBid(team.id)}
                            disabled={!canBid}
                            color={activeBidTeam === team.id ? 'success' : 'primary'}
                          >
                            Bid {currentPlayer.currentBid + auctionConfig.minBidIncrement} pts
                          </Button>
                        )}

                        {/* Recently Sold Players */}
                        {team.players.length > 0 && (
                          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
                              Squad ({team.players.length})
                            </Typography>
                            <Stack spacing={1}>
                              {team.players.slice(-5).reverse().map((player, index) => {
                                const roleInfo = getRoleIconAndColor(player.role);
                                const RoleIcon = roleInfo.icon;
                                
                                return (
                                  <Box
                                    key={player.playerId}
                                    sx={{
                                      p: 1.5,
                                      bgcolor: index === 0 ? '#e8f5e9' : '#f5f5f5',
                                      borderRadius: 1,
                                      border: index === 0 ? '2px solid #4caf50' : 'none',
                                      transition: 'all 0.3s ease',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {player.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, alignItems: 'center' }}>
                                          <Chip 
                                            icon={<RoleIcon sx={{ fontSize: '0.9rem', color: roleInfo.color + ' !important' }} />}
                                            label={roleInfo.label}
                                            size="small" 
                                            sx={{ 
                                              height: 20, 
                                              fontSize: '0.7rem',
                                              bgcolor: roleInfo.color + '15',
                                              color: roleInfo.color,
                                              border: `1px solid ${roleInfo.color}40`,
                                              '& .MuiChip-icon': {
                                                color: roleInfo.color
                                              }
                                            }}
                                          />
                                          {index === 0 && (
                                            <Chip 
                                              label="Latest" 
                                              size="small" 
                                              color="success"
                                              sx={{ height: 20, fontSize: '0.7rem' }}
                                            />
                                          )}
                                        </Box>
                                      </Box>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 700, 
                                          color: index === 0 ? 'success.main' : 'text.primary',
                                          ml: 1
                                        }}
                                      >
                                        {player.finalPrice?.toLocaleString()} pts
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              })}
                              {team.players.length > 5 && (
                                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 0.5 }}>
                                  +{team.players.length - 5} more players
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Player Queue */}
          {!currentPlayer && playerQueue.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Upcoming Players
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                  {playerQueue.slice(0, 8).map((player, index) => {
                    const roleInfo = getRoleIconAndColor(player.role);
                    const RoleIcon = roleInfo.icon;
                    
                    return (
                      <Card key={player.playerId} variant="outlined">
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {index + 1}. {player.name}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, gap: 1 }}>
                            <Chip 
                              icon={<RoleIcon sx={{ fontSize: '0.85rem' }} />}
                              label={roleInfo.label}
                              size="small" 
                              sx={{ 
                                height: 22,
                                fontSize: '0.7rem',
                                bgcolor: roleInfo.color + '15',
                                color: roleInfo.color,
                                border: `1px solid ${roleInfo.color}40`,
                                '& .MuiChip-icon': {
                                  color: roleInfo.color
                                }
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {player.basePrice} pts
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {/* Results Tab */}
      {tab === 2 && auctionConfig && (
        <Stack spacing={3}>
          {/* Team Squads */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {team.name}
                    </Typography>
                    <Chip 
                      label={`${team.players.length} Players`} 
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Total Spent</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {(team.totalBudget - team.remainingBudget).toLocaleString()} pts
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Remaining</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {team.remainingBudget.toLocaleString()} pts
                      </Typography>
                    </Box>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Player</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {team.players.map((player) => (
                          <TableRow key={player.playerId}>
                            <TableCell>{player.name}</TableCell>
                            <TableCell><Chip label={player.role} size="small" /></TableCell>
                            <TableCell align="right">{player.finalPrice?.toLocaleString()} pts</TableCell>
                          </TableRow>
                        ))}
                        {team.players.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              <Typography variant="body2" color="text.secondary">No players yet</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Unsold Players */}
          {unsoldPlayers.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  Unsold Players ({unsoldPlayers.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {unsoldPlayers.map((player) => (
                    <Chip 
                      key={player.playerId}
                      label={`${player.name} (${player.role})`} 
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onClose={() => setSetupDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create New Auction
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Tournament</InputLabel>
              <Select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                label="Tournament"
              >
                {tournaments.map((tournament) => (
                  <MenuItem key={tournament.id} value={tournament.displayId}>
                    {tournament.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            {/* Team Selection */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Select Participating Teams
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedTeamIds(allTeams.map(t => t.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedTeamIds([])}
                  >
                    Clear All
                  </Button>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Choose which teams will participate in this auction (minimum 2 teams required)
              </Typography>
              <FormGroup>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  {allTeams.map((team) => (
                    <FormControlLabel
                      key={team.id}
                      control={
                        <Checkbox
                          checked={selectedTeamIds.includes(team.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeamIds([...selectedTeamIds, team.id]);
                            } else {
                              setSelectedTeamIds(selectedTeamIds.filter(id => id !== team.id));
                            }
                          }}
                        />
                      }
                      label={team.name}
                    />
                  ))}
                </Box>
              </FormGroup>
              {selectedTeamIds.length > 0 && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Selected Teams ({selectedTeamIds.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedTeamIds.map(teamId => {
                      const team = allTeams.find(t => t.id === teamId);
                      return team ? (
                        <Chip
                          key={teamId}
                          label={team.name}
                          onDelete={() => setSelectedTeamIds(selectedTeamIds.filter(id => id !== teamId))}
                          color="primary"
                          size="small"
                        />
                      ) : null;
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Total Budget per Team (points)"
                type="number"
                fullWidth
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
              />
              <TextField
                label="Minimum Bid Increment (points)"
                type="number"
                fullWidth
                value={minBidIncrement}
                onChange={(e) => setMinBidIncrement(Number(e.target.value))}
              />
              <TextField
                label="Base Price per Player (points)"
                type="number"
                fullWidth
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
              />
              <TextField
                label="Max Players per Team"
                type="number"
                fullWidth
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
              />
            </Box>
            <Alert severity="info">
              {allTeams.length} teams and {availablePlayers.length} players are registered and available for auction.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateAuction}
            disabled={!selectedTournament || selectedTeamIds.length < 2}
          >
            Create Auction
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AuctionManagement;
