import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SportsIcon from '@mui/icons-material/Sports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface PlayerProfileProps {
  playerId?: number;
  onBack?: () => void;
}

interface MatchPerformance {
  id: number;
  date: string;
  opponent: string;
  runs: number;
  wickets: number;
  result: 'Won' | 'Lost';
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ playerId = 1, onBack }) => {
  // Mock player data - in real app, fetch based on playerId
  const player = {
    id: playerId,
    name: 'Rajesh Kumar',
    email: 'rajesh.k@email.com',
    phone: '+91 98765 43210',
    team: 'Thunder Strikers',
    role: 'Batsman',
    battingStyle: 'Right-handed',
    bowlingStyle: 'N/A',
    status: 'Active',
    joinDate: '2023-01-15',
    
    // Career stats
    matches: 45,
    innings: 43,
    runs: 2156,
    highestScore: 98,
    average: '47.91',
    strikeRate: '142.5',
    fifties: 18,
    hundreds: 4,
    
    // Bowling stats
    wickets: 0,
    bestBowling: 'N/A',
    bowlingAverage: 'N/A',
    economy: 'N/A',
    
    // Achievements
    achievements: [
      'Player of the Match - 8 times',
      'Highest run scorer - Season 2024',
      'Best batting average - Season 2023',
      'Century against Lightning Bolts',
    ],
  };

  const recentMatches: MatchPerformance[] = [
    { id: 1, date: '2025-10-01', opponent: 'Lightning Bolts', runs: 78, wickets: 0, result: 'Won' },
    { id: 2, date: '2025-09-28', opponent: 'Royal Warriors', runs: 45, wickets: 0, result: 'Lost' },
    { id: 3, date: '2025-09-25', opponent: 'Phoenix Risers', runs: 92, wickets: 0, result: 'Won' },
    { id: 4, date: '2025-09-20', opponent: 'Kings XI', runs: 34, wickets: 0, result: 'Won' },
    { id: 5, date: '2025-09-15', opponent: 'Eagle Eyes', runs: 67, wickets: 0, result: 'Lost' },
  ];

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

  return (
    <Box>
      {/* Back Button */}
      {onBack && (
        <IconButton onClick={onBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
      )}

      {/* Header Card */}
      <Card sx={{ mb: 3, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 4,
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'white',
                color: getRoleColor(player.role),
                fontSize: '3rem',
                fontWeight: 700,
                border: '4px solid white',
              }}
            >
              {player.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {player.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={player.role}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={player.status}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={player.team}
                  icon={<SportsIcon sx={{ color: 'white !important' }} />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">{player.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">{player.phone}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Stats Overview */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Matches Played
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4A90E2' }}>
              {player.matches}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Runs
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
              {player.runs}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Average
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
              {player.average}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Strike Rate
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>
              {player.strikeRate}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Left Column - Career Statistics */}
        <Box sx={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Career Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Innings Played
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.innings}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Highest Score
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.highestScore}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fifties
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.fifties}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Hundreds
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.hundreds}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Batting Style
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.battingStyle}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bowling Style
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.bowlingStyle}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Achievements
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {player.achievements.map((achievement, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      bgcolor: '#F9FAFB',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#10B981',
                      }}
                    />
                    <Typography variant="body2">{achievement}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Recent Matches */}
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUpIcon sx={{ color: '#4A90E2' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Matches
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentMatches.map((match) => (
                  <Paper
                    key={match.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: '#F9FAFB',
                      borderLeft: `4px solid ${
                        match.result === 'Won' ? '#10B981' : '#EF4444'
                      }`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        vs {match.opponent}
                      </Typography>
                      <Chip
                        label={match.result}
                        size="small"
                        color={match.result === 'Won' ? 'success' : 'error'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {new Date(match.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Runs
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4A90E2' }}>
                          {match.runs}
                        </Typography>
                      </Box>
                      {match.wickets > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Wickets
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444' }}>
                            {match.wickets}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Performance Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Consistency</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      85%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#E5E7EB',
                      '& .MuiLinearProgress-bar': { bgcolor: '#10B981' },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Big Match Player</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      78%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={78}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#E5E7EB',
                      '& .MuiLinearProgress-bar': { bgcolor: '#4A90E2' },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Form</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      92%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={92}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#E5E7EB',
                      '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default PlayerProfile;
