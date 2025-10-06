import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { CricketApiService, type ApiPlayer } from '../api/cricketApi';

const StatBox: React.FC<{ label: string; value: React.ReactNode; color?: string }>
  = ({ label, value, color }) => (
  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, color: color || '#111827' }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
  </Box>
);

const MiniBar: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 64 }}>
    <Box sx={{ width: 8, height: 16, bgcolor: '#BFDBFE', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 40, bgcolor: '#60A5FA', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 28, bgcolor: '#93C5FD', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 52, bgcolor: '#3B82F6', borderRadius: 0.5 }} />
    <Box sx={{ width: 8, height: 24, bgcolor: '#93C5FD', borderRadius: 0.5 }} />
  </Box>
);

const PlayerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const [player, setPlayer] = useState<ApiPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) {
        setError('Player ID not provided');
        setLoading(false);
        return;
      }

      const numericPlayerId = parseInt(playerId, 10);
      if (isNaN(numericPlayerId)) {
        setError('Invalid player ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const playerData = await CricketApiService.getPlayer(numericPlayerId);
        
        if (!playerData) {
          setError('Player not found');
          return;
        }

        setPlayer(playerData);
      } catch (err) {
        setError('Failed to load player details. Please try again later.');
        console.error('Error fetching player details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !player) {
    return (
      <Container maxWidth="md" sx={{ pt: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Player not found'}
        </Alert>
        <Button onClick={() => navigate(-1)} variant="outlined">
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="md" sx={{ pt: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Player Details
          </Typography>
        </Box>

        {/* Summary Card */}
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 64, height: 64, border: '3px solid #4A90E2' }}>A</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{player.name}</Typography>
                <Typography variant="body2" color="text.secondary">{player.role}</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={player.role} color="primary" variant="outlined" size="small" />
                  {player.battingStyle && <Chip label={player.battingStyle} size="small" variant="outlined" />}
                  {player.bowlingStyle && <Chip label={player.bowlingStyle} size="small" variant="outlined" />}
                </Box>
              </Box>
              <Button variant="contained" startIcon={<SportsCricketIcon />} sx={{ textTransform: 'none' }}>Follow</Button>
            </Box>
          </CardContent>
        </Card>

        {/* Key Stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}><StatBox label="Matches" value={player.matchesPlayed || 0} /></Box>
          <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}><StatBox label="Runs" value={player.totalRuns || 0} color="#10B981" /></Box>
          <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}><StatBox label="Avg" value={player.battingAverage?.toFixed(1) || '0.0'} /></Box>
          <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}><StatBox label="SR" value={player.battingStrikeRate?.toFixed(1) || '0.0'} /></Box>
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Batting Last 10 Innings</Typography>
                <MiniBar />
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Bowling Last 10 Innings</Typography>
                <MiniBar />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Recent Matches */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Matches</Typography>
        <Card sx={{ boxShadow: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 36, height: 36 }}>P</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>PW vs DD</Typography>
              <Typography variant="caption" color="text.secondary">Runs: 78 (45) • 20 Jul</Typography>
            </Box>
            <Chip size="small" icon={<EmojiEventsIcon sx={{ fontSize: 16 }} />} label="MOM" color="success" />
          </CardContent>
        </Card>
      </Container>

      {/* Floating Action */}
      <Paper sx={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 72, px: 2, py: 1, borderRadius: 999, boxShadow: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: '#4A90E2', width: 44, height: 44 }}>+</Avatar>
        <Typography sx={{ fontWeight: 700 }}>Add to Favorites</Typography>
      </Paper>
    </Box>
  );
};

export default PlayerDetails;


