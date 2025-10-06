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
            <Box sx={{ display: 'flex', gap: { xs: 1, md: 3 }, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/')} sx={{ color: '#333', textTransform: 'none', fontWeight: 500, fontSize: { xs: '0.85rem', md: '1rem' }, minWidth: 'auto' }}>Home</Button>
              <Button onClick={() => navigate('/matches')} sx={{ color: '#333', textTransform: 'none', fontWeight: 500, fontSize: { xs: '0.85rem', md: '1rem' }, minWidth: 'auto' }}>Matches</Button>
              <Button onClick={() => navigate('/teams')} sx={{ color: '#333', textTransform: 'none', fontWeight: 500, fontSize: { xs: '0.85rem', md: '1rem' }, minWidth: 'auto', display: { xs: 'none', sm: 'inline-flex' } }}>Teams</Button>
              <Button onClick={() => navigate('/players')} sx={{ color: '#333', textTransform: 'none', fontWeight: 500, fontSize: { xs: '0.85rem', md: '1rem' }, minWidth: 'auto', display: { xs: 'none', sm: 'inline-flex' } }}>Players</Button>
              <Button sx={{ color: '#333', textTransform: 'none', fontWeight: 500, fontSize: { xs: '0.85rem', md: '1rem' }, minWidth: 'auto', display: { xs: 'none', sm: 'inline-flex' } }}>News</Button>
              <Button
                variant="contained"
                onClick={() => navigate('/admin')}
                sx={{
                  backgroundColor: '#FF7A59',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: { xs: 2, md: 3 },
                  fontSize: { xs: '0.85rem', md: '1rem' },
                  '&:hover': { backgroundColor: '#FF6347' },
                }}
              >
                Login
              </Button>
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
        }}
        elevation={3}
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
            '& .MuiBottomNavigationAction-root': {
              color: '#6b7280',
              minWidth: 'auto',
              padding: '6px 0',
            },
            '& .MuiBottomNavigationAction-root.Mui-selected': {
              color: '#4A90E2',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              marginTop: '4px',
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<HomeIcon />} />
          <BottomNavigationAction label="Matches" icon={<SportsIcon />} />
          <BottomNavigationAction label="Teams" icon={<GroupsIcon />} />
          <BottomNavigationAction label="Players" icon={<PeopleIcon />} />
          <BottomNavigationAction label="More" icon={<MoreHorizIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default SiteLayout;


