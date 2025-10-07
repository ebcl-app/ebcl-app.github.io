import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Button,
  Typography,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SportsIcon from '@mui/icons-material/Sports';
import PeopleIcon from '@mui/icons-material/People';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAuth } from '../contexts/AuthContext';

const navIndexForPath = (pathname: string): number => {
  if (pathname.startsWith('/matches')) return 1;
  if (pathname.startsWith('/players')) return 3;
  if (pathname.startsWith('/teams')) return 2;
  if (pathname.startsWith('/admin')) return 4;
  return 0;
};

const SiteLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const bottomValue = navIndexForPath(location.pathname);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Desktop header */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          py: { xs: 0, md: 2 },
          flexShrink: 0,
          width: '100%',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="img" src="/logo.png" alt="Crick Heroes" sx={{ height: 28, width: 'auto' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#4A90E2', fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                CRICK HEROES
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button 
                onClick={() => navigate('/')} 
                variant="text"
                sx={{ 
                  color: '#333', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: { xs: '0.85rem', md: '1rem' }, 
                  minWidth: 'auto',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(74, 144, 226, 0.08)',
                    color: '#4A90E2'
                  }
                }}
              >
                Home
              </Button>
              <Button 
                onClick={() => navigate('/matches')} 
                variant="text"
                sx={{ 
                  color: '#333', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: { xs: '0.85rem', md: '1rem' }, 
                  minWidth: 'auto',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(74, 144, 226, 0.08)',
                    color: '#4A90E2'
                  }
                }}
              >
                Matches
              </Button>
              <Button 
                onClick={() => navigate('/teams')} 
                variant="text"
                sx={{ 
                  color: '#333', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: { xs: '0.85rem', md: '1rem' }, 
                  minWidth: 'auto',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  display: { xs: 'none', sm: 'inline-flex' },
                  '&:hover': {
                    backgroundColor: 'rgba(74, 144, 226, 0.08)',
                    color: '#4A90E2'
                  }
                }}
              >
                Teams
              </Button>
              <Button 
                onClick={() => navigate('/players')} 
                variant="text"
                sx={{ 
                  color: '#333', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: { xs: '0.85rem', md: '1rem' }, 
                  minWidth: 'auto',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  display: { xs: 'none', sm: 'inline-flex' },
                  '&:hover': {
                    backgroundColor: 'rgba(74, 144, 226, 0.08)',
                    color: '#4A90E2'
                  }
                }}
              >
                Players
              </Button>
              <Button 
                variant="text"
                sx={{ 
                  color: '#333', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: { xs: '0.85rem', md: '1rem' }, 
                  minWidth: 'auto',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  display: { xs: 'none', sm: 'inline-flex' },
                  '&:hover': {
                    backgroundColor: 'rgba(74, 144, 226, 0.08)',
                    color: '#4A90E2'
                  }
                }}
              >
                News
              </Button>
              <Button
                variant="contained"
                onClick={isAuthenticated ? () => navigate('/admin') : () => navigate('/login')}
                sx={{
                  backgroundColor: '#4A90E2',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: { xs: 3, md: 4 },
                  py: 1.5,
                  fontSize: { xs: '0.85rem', md: '1rem' },
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)',
                  '&:hover': {
                    backgroundColor: '#357ABD',
                    boxShadow: '0 4px 12px rgba(74, 144, 226, 0.4)'
                  },
                }}
              >
                {isAuthenticated ? 'Admin Panel' : 'Login'}
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  sx={{
                    color: '#4A90E2',
                    borderColor: '#4A90E2',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: { xs: 2, md: 3 },
                    py: 1.5,
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    borderRadius: 2,
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(74, 144, 226, 0.08)',
                      borderColor: '#357ABD'
                    },
                  }}
                >
                  Logout
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Page content area - add bottom padding on mobile to avoid overlap with bottom nav */}
      <Box component="main" sx={{ flex: 1, width: '100%', pb: { xs: 10, md: 0 } }}>
        <Outlet />
      </Box>

      {/* Mobile bottom nav */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'block', md: 'none' },
          zIndex: 1000,
          borderTop: '1px solid #e0e0e0',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
        }}
        elevation={8}
      >
        <BottomNavigation
          value={bottomValue}
          onChange={(_event, newValue) => {
            if (newValue === 1) navigate('/matches');
            else if (newValue === 2) navigate('/teams');
            else if (newValue === 3) navigate('/players');
            else if (newValue === 4) navigate('/admin');
            else navigate('/');
          }}
          showLabels
          sx={{
            backgroundColor: '#ffffff',
            height: 72,
            '& .MuiBottomNavigationAction-root': {
              color: '#6b7280',
              minWidth: 'auto',
              padding: '8px 0 6px 0',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(74, 144, 226, 0.04)',
              },
            },
            '& .MuiBottomNavigationAction-root.Mui-selected': {
              color: '#4A90E2',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 600,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 500,
              marginTop: '4px',
              transition: 'all 0.2s ease',
            },
            '& .MuiBottomNavigationAction-label.Mui-selected': {
              fontSize: '0.75rem',
            },
          }}
        >
          <BottomNavigationAction 
            label="Home" 
            icon={<HomeIcon sx={{ fontSize: 24 }} />} 
          />
          <BottomNavigationAction 
            label="Matches" 
            icon={<SportsIcon sx={{ fontSize: 24 }} />} 
          />
          <BottomNavigationAction 
            label="Teams" 
            icon={<GroupsIcon sx={{ fontSize: 24 }} />} 
          />
          <BottomNavigationAction 
            label="Players" 
            icon={<PeopleIcon sx={{ fontSize: 24 }} />} 
          />
          <BottomNavigationAction 
            label="More" 
            icon={<MoreHorizIcon sx={{ fontSize: 24 }} />} 
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default SiteLayout;


