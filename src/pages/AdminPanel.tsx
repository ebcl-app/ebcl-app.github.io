import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Container,
  IconButton,
  Tabs,
  Tab,
  Pagination,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SportsIcon from '@mui/icons-material/Sports';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import TeamManagement from './TeamManagement';
import MatchesManagement from './MatchesManagement';
import PlayersManagement from './PlayersManagement';
import { CricketApiService, type ApiMatch } from '../api/cricketApi';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%', boxShadow: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
            {value}
          </Typography>
          {trend && (
            <Chip
              icon={<TrendingUpIcon />}
              label={trend}
              size="small"
              color="success"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [matchesPage, setMatchesPage] = React.useState(1);
  const [playersPage, setPlayersPage] = React.useState(1);
  const [dashboardStats, setDashboardStats] = React.useState({
    totalMatches: 0,
    activeTeams: 0,
    registeredPlayers: 0,
    championships: 0,
    loading: true,
    error: null as string | null,
  });
  const [recentMatches, setRecentMatches] = React.useState<any[]>([]);
  const [topPlayers, setTopPlayers] = React.useState<any[]>([]);

  // Pagination constants
  const MATCHES_PER_PAGE = 10;
  const PLAYERS_PER_PAGE = 10;

  // Fetch dashboard statistics
  React.useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setDashboardStats(prev => ({ ...prev, loading: true, error: null }));

        // Fetch all data in parallel with high limits for dashboard
        const [matchesResponse, teamsResponse, playersResponse] = await Promise.all([
          CricketApiService.getMatches(undefined, { page: 1, limit: 1000 }),
          CricketApiService.getTeams({ page: 1, limit: 1000 }),
          CricketApiService.getPlayers({ page: 1, limit: 1000 }),
        ]);

        if (matchesResponse.success && teamsResponse.success && playersResponse.success) {
          const matches = matchesResponse.data;
          const players = playersResponse.data;

          // Calculate statistics using pagination totals
          const totalMatches = matchesResponse.pagination.total;
          const activeTeams = teamsResponse.pagination.total;
          const registeredPlayers = playersResponse.pagination.total;
          
          // Count completed matches from the loaded data (since we need to filter)
          const completedMatches = matches.filter((match: ApiMatch) => match.status === 'completed').length;

          setDashboardStats({
            totalMatches,
            activeTeams,
            registeredPlayers,
            championships: completedMatches,
            loading: false,
            error: null,
          });

          // Set recent matches (all matches, not just last 3)
          const recentMatchesData = matches.map((match: ApiMatch) => ({
            team1: match.team1?.name || 'Unknown Team',
            team2: match.team2?.name || 'Unknown Team',
            score: match.team1Score && match.team2Score ? `${match.team1Score} vs ${match.team2Score}` : 'Not started',
            status: match.status.charAt(0).toUpperCase() + match.status.slice(1),
          }));
          setRecentMatches(recentMatchesData);

          // Set top players (by total runs, all players)
          const sortedPlayers = players
            .filter((player: any) => player.totalRuns)
            .sort((a: any, b: any) => (b.totalRuns || 0) - (a.totalRuns || 0))
            .map((player: any) => ({
              name: player.name,
              runs: player.totalRuns?.toLocaleString() || '0',
              avatar: player.name.charAt(0),
            }));
          setTopPlayers(sortedPlayers);
        } else {
          setDashboardStats(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to load dashboard data',
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setDashboardStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data',
        }));
      }
    };

    fetchDashboardStats();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleMatchesPageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setMatchesPage(page);
  };

  const handlePlayersPageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPlayersPage(page);
  };

  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Admin Panel
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="admin navigation">
            <Tab label="Dashboard" />
            <Tab label="Teams" />
            <Tab label="Players" />
            <Tab label="Matches" />
          </Tabs>
        </Box>

        {/* Content Area */}
        {selectedTab === 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Dashboard Overview
            </Typography>

            {/* Stats Grid */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
                <StatCard
                  title="Total Matches"
                  value={dashboardStats.loading ? '...' : dashboardStats.totalMatches}
                  icon={<SportsIcon />}
                  color="#4A90E2"
                  trend={dashboardStats.loading ? undefined : "+12% this month"}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
                <StatCard
                  title="Active Teams"
                  value={dashboardStats.loading ? '...' : dashboardStats.activeTeams}
                  icon={<PeopleIcon />}
                  color="#10B981"
                  trend={dashboardStats.loading ? undefined : "+5% this month"}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
                <StatCard
                  title="Registered Players"
                  value={dashboardStats.loading ? '...' : dashboardStats.registeredPlayers}
                  icon={<PersonIcon />}
                  color="#F59E0B"
                  trend={dashboardStats.loading ? undefined : "+18% this month"}
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
                <StatCard
                  title="Championships"
                  value={dashboardStats.loading ? '...' : dashboardStats.championships}
                  icon={<EmojiEventsIcon />}
                  color="#EF4444"
                  trend={dashboardStats.loading ? undefined : "+2 this year"}
                />
              </Box>
            </Box>

            {/* Recent Activity */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.67% - 12px)' }, minWidth: 0 }}>
                <Card sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Recent Matches
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dashboardStats.loading ? (
                        <Typography>Loading recent matches...</Typography>
                      ) : (() => {
                        const startIndex = (matchesPage - 1) * MATCHES_PER_PAGE;
                        const endIndex = startIndex + MATCHES_PER_PAGE;
                        const paginatedMatches = recentMatches.slice(startIndex, endIndex);
                        
                        return paginatedMatches.length > 0 ? (
                          <>
                            {paginatedMatches.map((match, index) => (
                              <Box
                                key={startIndex + index}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  p: 2,
                                  bgcolor: '#F9FAFB',
                                  borderRadius: 1,
                                }}
                              >
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {match.team1} vs {match.team2}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {match.score}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={match.status}
                                  size="small"
                                  color={match.status === 'Live' ? 'error' : 'success'}
                                />
                              </Box>
                            ))}
                            {recentMatches.length > MATCHES_PER_PAGE && (
                              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Pagination
                                  count={Math.ceil(recentMatches.length / MATCHES_PER_PAGE)}
                                  page={matchesPage}
                                  onChange={handleMatchesPageChange}
                                  size="small"
                                  color="primary"
                                />
                              </Box>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No recent matches available
                          </Typography>
                        );
                      })()}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 12px)' }, minWidth: 0 }}>
                <Card sx={{ boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Top Players
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dashboardStats.loading ? (
                        <Typography>Loading top players...</Typography>
                      ) : (() => {
                        const startIndex = (playersPage - 1) * PLAYERS_PER_PAGE;
                        const endIndex = startIndex + PLAYERS_PER_PAGE;
                        const paginatedPlayers = topPlayers.slice(startIndex, endIndex);
                        
                        return paginatedPlayers.length > 0 ? (
                          <>
                            {paginatedPlayers.map((player, index) => (
                              <Box
                                key={startIndex + index}
                                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                              >
                                <Avatar sx={{ bgcolor: '#4A90E2' }}>{player.avatar}</Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {player.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {player.runs} runs
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                                  #{startIndex + index + 1}
                                </Typography>
                              </Box>
                            ))}
                            {topPlayers.length > PLAYERS_PER_PAGE && (
                              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Pagination
                                  count={Math.ceil(topPlayers.length / PLAYERS_PER_PAGE)}
                                  page={playersPage}
                                  onChange={handlePlayersPageChange}
                                  size="small"
                                  color="primary"
                                />
                              </Box>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No player data available
                          </Typography>
                        );
                      })()}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </>
        )}

        {/* Teams Management */}
        {selectedTab === 1 && <TeamManagement />}

        {/* Players Management */}
        {selectedTab === 2 && <PlayersManagement />}

        {/* Matches Management */}
        {selectedTab === 3 && <MatchesManagement />}
      </Container>
    </Box>
  );
};

export default AdminPanel;
