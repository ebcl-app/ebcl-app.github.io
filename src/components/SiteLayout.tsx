import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Button,
  IconButton,
  Badge,
  Stack,
  Typography,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SportsIcon from '@mui/icons-material/Sports';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import LoginIcon from '@mui/icons-material/Login';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArticleIcon from '@mui/icons-material/Article';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlined from '@mui/icons-material/AccountCircleOutlined';
import SportsCricketOutlined from '@mui/icons-material/SportsCricket';
import EventNoteOutlined from '@mui/icons-material/EventNote';
import ScoreboardOutlined from '@mui/icons-material/Scoreboard';
import GroupsOutlined from '@mui/icons-material/Groups';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAuth } from '../contexts/AuthContext';

const SiteLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const isDashboardPage = location.pathname === '/';
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleCreateMatch = () => {
    handleMenuClose();
    navigate('/admin/matches/new');
  };

  const handleCreateTeam = () => {
    handleMenuClose();
    navigate('/admin/teams/new');
  };

  const handleCreatePlayer = () => {
    handleMenuClose();
    navigate('/admin/players/new');
  };
  
  // Get page title based on route
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Box Cricket';
    if (location.pathname.startsWith('/matches/')) return 'Match Details';
    if (location.pathname === '/matches') return 'Matches';
    if (location.pathname.startsWith('/players/')) return 'Player Details';
    if (location.pathname === '/players') return 'Players';
    if (location.pathname.startsWith('/teams/')) return 'Team Details';
    if (location.pathname === '/teams') return 'Teams';
    if (location.pathname === '/leaderboard') return 'Leaderboard';
    return 'Box Cricket';
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Mobile header - modern gradient design */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
          px: 3,
          py: 2,
          borderRadius: '0 0 24px 24px',
          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)',
          display: { xs: 'block', md: 'none' },
          zIndex: 1100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!isDashboardPage && (
            <IconButton 
              size="small" 
              sx={{ color: '#ffffff', p: 0.5 }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          )}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: isDashboardPage ? 0 : 1, justifyContent: isDashboardPage ? 'flex-start' : 'center' }}>
            {isDashboardPage && <SportsCricketOutlined sx={{ color: '#ffffff', fontSize: 24 }} />}
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.3, color: '#ffffff', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
              {getPageTitle()}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" sx={{ color: '#ffffff' }}>
              <NotificationsNoneOutlined fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: '#ffffff' }}
              onClick={handleUserMenuClick}
            >
              <AccountCircleOutlined fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* User Menu - Mobile */}
        <Menu
          anchorEl={userMenuAnchorEl}
          open={userMenuOpen}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              minWidth: 200,
              mt: 1,
            },
          }}
        >
          {isAuthenticated ? (
            <>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {user?.username || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </Typography>
              </Box>
              <MenuItem onClick={() => { handleUserMenuClose(); navigate('/admin'); }} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText>Admin Panel</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleUserMenuClose(); logout(); navigate('/'); }} sx={{ py: 1.5, color: '#ef4444' }}>
                <ListItemIcon>
                  <LoginIcon fontSize="small" sx={{ color: '#ef4444' }} />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </>
          ) : (
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/login'); }} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LoginIcon fontSize="small" sx={{ color: '#2563eb' }} />
              </ListItemIcon>
              <ListItemText>Login</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>

      {/* Desktop header - elevated modern design */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          py: 2,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                }
              }}
              onClick={() => navigate('/')}
              >
                <Box sx={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <SportsCricketOutlined sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box component="img" src="/logo.png" alt="CricketPro" sx={{ height: 52, width: 'auto' }} />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button 
                onClick={() => navigate('/')} 
                variant="text"
                startIcon={<HomeIcon />}
                sx={{ 
                  color: location.pathname === '/' ? '#2563eb' : '#64748b',
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  backgroundColor: location.pathname === '/' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb'
                  }
                }}
              >
                Home
              </Button>
              <Button 
                onClick={() => navigate('/leaderboard')} 
                variant="text"
                startIcon={<EmojiEventsIcon />}
                sx={{ 
                  color: location.pathname === '/leaderboard' ? '#2563eb' : '#64748b',
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  backgroundColor: location.pathname === '/leaderboard' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb'
                  }
                }}
              >
                Leaderboard
              </Button>
              <Button 
                onClick={() => navigate('/matches')} 
                variant="text"
                startIcon={<SportsIcon />}
                sx={{ 
                  color: location.pathname.startsWith('/matches') ? '#2563eb' : '#64748b',
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  backgroundColor: location.pathname.startsWith('/matches') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb'
                  }
                }}
              >
                Matches
              </Button>
              <Button 
                onClick={() => navigate('/teams')} 
                variant="text"
                startIcon={<GroupsIcon />}
                sx={{ 
                  color: location.pathname.startsWith('/teams') ? '#2563eb' : '#64748b',
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  backgroundColor: location.pathname.startsWith('/teams') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb'
                  }
                }}
              >
                Teams
              </Button>
              <Button 
                onClick={() => navigate('/players')} 
                variant="text"
                startIcon={<PeopleIcon />}
                sx={{ 
                  color: location.pathname.startsWith('/players') ? '#2563eb' : '#64748b',
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  backgroundColor: location.pathname.startsWith('/players') ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb'
                  }
                }}
              >
                Players
              </Button>
              <Button 
                onClick={() => navigate('/news')} 
                variant="text"
                startIcon={<ArticleIcon />}
                sx={{ 
                  color: location.pathname === '/news' ? '#2563eb' : '#64748b',
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  backgroundColor: location.pathname === '/news' ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb'
                  }
                }}
              >
                News
              </Button>

              <Box sx={{ ml: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <IconButton 
                  sx={{ 
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563eb'
                    }
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsNoneOutlined />
                  </Badge>
                </IconButton>
                
                <IconButton 
                  onClick={handleUserMenuClick}
                  sx={{ 
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563eb'
                    }
                  }}
                >
                  <AccountCircleOutlined />
                </IconButton>

                {/* User Menu - Desktop */}
                <Menu
                  anchorEl={userMenuAnchorEl}
                  open={userMenuOpen}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      minWidth: 220,
                      mt: 1,
                    },
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #e2e8f0' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                          {user?.username || 'Admin User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Administrator
                        </Typography>
                      </Box>
                      <MenuItem onClick={() => { handleUserMenuClose(); navigate('/admin'); }} sx={{ py: 1.5, px: 2.5 }}>
                        <ListItemIcon>
                          <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#2563eb' }} />
                        </ListItemIcon>
                        <ListItemText>Admin Panel</ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={() => { handleUserMenuClose(); logout(); navigate('/'); }} sx={{ py: 1.5, px: 2.5, color: '#ef4444' }}>
                        <ListItemIcon>
                          <LoginIcon fontSize="small" sx={{ color: '#ef4444' }} />
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                      </MenuItem>
                    </>
                  ) : (
                    <MenuItem onClick={() => { handleUserMenuClose(); navigate('/login'); }} sx={{ py: 1.5, px: 2.5 }}>
                      <ListItemIcon>
                        <LoginIcon fontSize="small" sx={{ color: '#2563eb' }} />
                      </ListItemIcon>
                      <ListItemText>Login</ListItemText>
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Page content area - add bottom padding on mobile to avoid overlap with bottom nav */}
      <Box component="main" sx={{ 
        flex: 1, 
        width: '100%', 
        pb: { xs: isDashboardPage ? 8 : 0, md: 0 }, 
        pt: { xs: 12, md: 10 },
        mt: { xs: 0, md: 0 }
      }}>
        <Outlet />
      </Box>

      {/* Mobile bottom nav - curved top design */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          borderTop: 'none',
          backgroundColor: '#ffffff',
          py: 1,
          px: 3,
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.1)',
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" position="relative" spacing={1}>
          <Stack spacing={0.5} alignItems="center" sx={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => navigate('/')}>
            {location.pathname === '/' ? (
              <Box sx={{ backgroundColor: '#1e3a8a', borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <HomeIcon sx={{ fontSize: 22, color: '#ffffff' }} />
              </Box>
            ) : (
              <Box sx={{ borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <HomeIcon sx={{ fontSize: 22, color: '#94a3b8' }} />
              </Box>
            )}
            <Typography variant="caption" sx={{ fontWeight: location.pathname === '/' ? 700 : 500, color: location.pathname === '/' ? '#1e3a8a' : '#94a3b8', fontSize: '0.7rem' }}>
              Home
            </Typography>
          </Stack>
          <Stack spacing={0.5} alignItems="center" sx={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => navigate('/matches')}>
            {location.pathname.startsWith('/matches') ? (
              <Box sx={{ backgroundColor: '#1e3a8a', borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <EventNoteOutlined sx={{ fontSize: 22, color: '#ffffff' }} />
              </Box>
            ) : (
              <Box sx={{ borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <EventNoteOutlined sx={{ fontSize: 22, color: '#94a3b8' }} />
              </Box>
            )}
            <Typography variant="caption" sx={{ fontWeight: location.pathname.startsWith('/matches') ? 700 : 500, color: location.pathname.startsWith('/matches') ? '#1e3a8a' : '#94a3b8', fontSize: '0.7rem' }}>
              Matches
            </Typography>
          </Stack>
          
          {/* Floating Action Button (FAB) in center */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', minWidth: 0 }}>
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleMenuClick}
              sx={{
                position: 'absolute',
                top: -32,
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                boxShadow: '0 10px 20px rgba(37, 99, 235, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  boxShadow: '0 12px 24px rgba(37, 99, 235, 0.5)',
                },
              }}
            >
              <AddIcon sx={{ fontSize: 30 }} />
            </Fab>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '20px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  p: 1,
                  minWidth: 'auto',
                },
                '& .MuiMenu-list': {
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  p: 0,
                },
              }}
            >
              <MenuItem 
                onClick={handleCreateMatch} 
                sx={{ 
                  py: 1.5, 
                  px: 2, 
                  borderRadius: '16px',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                  <AddCircleOutlineIcon fontSize="small" sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '0.875rem', fontWeight: 600 } }}>Match</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={handleCreateTeam} 
                sx={{ 
                  py: 1.5, 
                  px: 2, 
                  borderRadius: '16px',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                  <GroupAddIcon fontSize="small" sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '0.875rem', fontWeight: 600 } }}>Team</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={handleCreatePlayer} 
                sx={{ 
                  py: 1.5, 
                  px: 2, 
                  borderRadius: '16px',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                  <PersonAddIcon fontSize="small" sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '0.875rem', fontWeight: 600 } }}>Player</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
          <Stack spacing={0.5} alignItems="center" sx={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => navigate('/teams')}>
            {location.pathname.startsWith('/teams') ? (
              <Box sx={{ backgroundColor: '#1e3a8a', borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <GroupsOutlined sx={{ fontSize: 22, color: '#ffffff' }} />
              </Box>
            ) : (
              <Box sx={{ borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <GroupsOutlined sx={{ fontSize: 22, color: '#94a3b8' }} />
              </Box>
            )}
            <Typography variant="caption" sx={{ fontWeight: location.pathname.startsWith('/teams') ? 700 : 500, color: location.pathname.startsWith('/teams') ? '#1e3a8a' : '#94a3b8', fontSize: '0.7rem' }}>
              Teams
            </Typography>
          </Stack>
          <Stack spacing={0.5} alignItems="center" sx={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => navigate('/players')}>
            {location.pathname.startsWith('/players') ? (
              <Box sx={{ backgroundColor: '#1e3a8a', borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <ScoreboardOutlined sx={{ fontSize: 22, color: '#ffffff' }} />
              </Box>
            ) : (
              <Box sx={{ borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <ScoreboardOutlined sx={{ fontSize: 22, color: '#94a3b8' }} />
              </Box>
            )}
            <Typography variant="caption" sx={{ fontWeight: location.pathname.startsWith('/players') ? 700 : 500, color: location.pathname.startsWith('/players') ? '#1e3a8a' : '#94a3b8', fontSize: '0.7rem' }}>
              Players
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default SiteLayout;


