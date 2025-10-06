import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SportsIcon from '@mui/icons-material/Sports';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TeamManagement from './TeamManagement';
import MatchesManagement from './MatchesManagement';
import PlayersManagement from './PlayersManagement';

const drawerWidth = 240;

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
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [selectedMenu, setSelectedMenu] = React.useState('Dashboard');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Matches', icon: <SportsIcon />, path: '/admin/matches' },
    { text: 'Teams', icon: <PeopleIcon />, path: '/admin/teams' },
    { text: 'Players', icon: <PersonIcon />, path: '/admin/players' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: '#4A90E2', color: 'white' }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          CRICK HEROES
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={selectedMenu === item.text}
              onClick={() => setSelectedMenu(item.text)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: '#E3F2FD',
                  borderLeft: '4px solid #4A90E2',
                  '& .MuiListItemIcon-root': {
                    color: '#4A90E2',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#333',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {selectedMenu}
          </Typography>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <Avatar sx={{ ml: 2, bgcolor: '#4A90E2' }}>A</Avatar>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />

        {/* Dashboard Content */}
        {selectedMenu === 'Dashboard' && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Overview
            </Typography>

            {/* Stats Grid */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
                <StatCard
                  title="Total Matches"
                  value="156"
                  icon={<SportsIcon />}
                  color="#4A90E2"
                  trend="+12% this month"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
                <StatCard
                  title="Active Teams"
                  value="24"
                  icon={<PeopleIcon />}
                  color="#10B981"
                  trend="+5% this month"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
                <StatCard
                  title="Registered Players"
                  value="482"
                  icon={<PersonIcon />}
                  color="#F59E0B"
                  trend="+18% this month"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: 0 }}>
                <StatCard
                  title="Championships"
                  value="12"
                  icon={<EmojiEventsIcon />}
                  color="#EF4444"
                  trend="+2 this year"
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
                      {[
                        { team1: 'Thunder Strikers', team2: 'Lightning Bolts', score: '185/8 vs 178/9', status: 'Completed' },
                        { team1: 'Royal Warriors', team2: 'Kings XI', score: '156/6 vs 142/10', status: 'Completed' },
                        { team1: 'Phoenix Risers', team2: 'Eagle Eyes', score: '120/4 vs 95/3', status: 'Live' },
                      ].map((match, index) => (
                        <Box
                          key={index}
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
                      {[
                        { name: 'Rajesh Kumar', runs: '1,245', avatar: 'R' },
                        { name: 'Amit Singh', runs: '1,180', avatar: 'A' },
                        { name: 'Vikas Sharma', runs: '1,050', avatar: 'V' },
                      ].map((player, index) => (
                        <Box
                          key={index}
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
                            #{index + 1}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        )}

        {/* Teams Management */}
        {selectedMenu === 'Teams' && <TeamManagement />}

        {/* Matches Management */}
        {selectedMenu === 'Matches' && <MatchesManagement />}

        {/* Players Management */}
        {selectedMenu === 'Players' && <PlayersManagement />}

        {/* Other Menu Content Placeholders */}
        {selectedMenu !== 'Dashboard' && 
         selectedMenu !== 'Teams' && 
         selectedMenu !== 'Matches' && 
         selectedMenu !== 'Players' && (
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedMenu}
              </Typography>
              <Typography color="text.secondary">
                {selectedMenu} management interface will be implemented here.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default AdminPanel;
