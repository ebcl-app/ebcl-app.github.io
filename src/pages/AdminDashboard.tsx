import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import SportsIcon from '@mui/icons-material/Sports';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { CricketApiService } from '../api/cricketApi';

interface DashboardStats {
  totalMatches: number;
  liveMatches: number;
  completedMatches: number;
  scheduledMatches: number;
  totalPlayers: number;
  totalTeams: number;
  totalUsers: number;
  recentActivity: Array<{
    id: string;
    type: 'match' | 'player' | 'team';
    action: string;
    timestamp: string;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMatches: 0,
    liveMatches: 0,
    completedMatches: 0,
    scheduledMatches: 0,
    totalPlayers: 0,
    totalTeams: 0,
    totalUsers: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch data from APIs
        const [matchesResponse, teamsResponse, playersResponse] = await Promise.all([
          CricketApiService.getMatches(),
          CricketApiService.getTeams(),
          CricketApiService.getPlayers(),
        ]);

        // Calculate stats
        const matches = matchesResponse.success ? matchesResponse.data : [];
        const teams = teamsResponse.success ? teamsResponse.data : [];
        const players = playersResponse.success ? playersResponse.data : [];

        const liveMatches = matches.filter(m => m.status === 'live').length;
        const completedMatches = matches.filter(m => m.status === 'completed').length;
        const scheduledMatches = matches.filter(m => m.status === 'scheduled').length;

        setStats({
          totalMatches: matches.length,
          liveMatches,
          completedMatches,
          scheduledMatches,
          totalPlayers: players.length,
          totalTeams: teams.length,
          totalUsers: 1, // For now, just the admin user
          recentActivity: [
            {
              id: '1',
              type: 'match',
              action: 'Match completed: Thunder Strikers vs Lightning Bolts',
              timestamp: new Date().toISOString(),
            },
            {
              id: '2',
              type: 'player',
              action: 'New player added: Rajesh Kumar',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: '3',
              type: 'team',
              action: 'Team updated: Thunder Strikers',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
            },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {loading ? '...' : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Admin Dashboard
      </Typography>

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Total Matches"
          value={stats.totalMatches}
          icon={<SportsIcon />}
          color="#4A90E2"
        />
        <StatCard
          title="Live Matches"
          value={stats.liveMatches}
          icon={<TrendingUpIcon />}
          color="#7ED321"
          subtitle="Currently active"
        />
        <StatCard
          title="Total Players"
          value={stats.totalPlayers}
          icon={<PeopleIcon />}
          color="#F5A623"
        />
        <StatCard
          title="Total Teams"
          value={stats.totalTeams}
          icon={<GroupsIcon />}
          color="#D0021B"
        />
      </Box>

      {/* Match Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Match Status Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Scheduled</Typography>
                  <Typography variant="body2">{stats.scheduledMatches}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.scheduledMatches / Math.max(stats.totalMatches, 1)) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Live</Typography>
                  <Typography variant="body2">{stats.liveMatches}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.liveMatches / Math.max(stats.totalMatches, 1)) * 100}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completed</Typography>
                  <Typography variant="body2">{stats.completedMatches}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.completedMatches / Math.max(stats.totalMatches, 1)) * 100}
                  color="secondary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={<ScheduleIcon />}
                    label="API Status"
                    color="success"
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Online
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={<PeopleIcon />}
                    label="Active Users"
                    color="primary"
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {stats.totalUsers} admin
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={<EmojiEventsIcon />}
                    label="System Health"
                    color="success"
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Excellent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <List>
            {stats.recentActivity.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4A90E2' }}>
                      {activity.type === 'match' && <SportsIcon />}
                      {activity.type === 'player' && <PeopleIcon />}
                      {activity.type === 'team' && <GroupsIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.action}
                    secondary={new Date(activity.timestamp).toLocaleString()}
                  />
                </ListItem>
                {index < stats.recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;