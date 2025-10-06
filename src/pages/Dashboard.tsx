import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
// useMediaQuery removed - responsive handled via sx
// icons removed; header/footer provided by SiteLayout

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // responsive layout handled via MUI sx breakpoints

  // features removed from home page

  // Unified layout for all screen sizes - mobile-specific adjustments handled via responsive styles

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header/footer provided by SiteLayout */}

      {/* Mobile: Hero Image with Logo Overlay - match desktop white theme */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          backgroundColor: '#ffffff',
          pt: 3,
          pb: 0,
        }}
      >
        {/* Logo and tagline - restored to match mockup */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#4A90E2',
              mb: 0.5,
              fontSize: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            BOX CRICKET
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666666',
              fontSize: '1rem',
              fontWeight: 400,
            }}
          >
            Your Local Game. Live.
          </Typography>
        </Box>
        
        {/* Centered Hero Image */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            component="img"
            src="/landingpage-512x512.png"
            alt="Cricket Players"
            sx={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>
      </Box>

      {/* Mobile: Spacer Below Image (theming aligned to white) */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          backgroundColor: '#ffffff',
          width: '100%',
          height: { xs: '150px', sm: '180px' },
        }}
      />

      {/* Desktop: Hero Section with Image */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          backgroundImage: `url('/landingpage-1024x1024.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: 400,
          py: 4,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Desktop content can go here if needed */}
        </Container>
      </Box>

      {/* Content Section */}
      <Box sx={{ 
        width: '100%', 
        backgroundColor: '#ffffff', 
        mt: { xs: -12, md: 0 }, 
        position: 'relative', 
        zIndex: 10,
        borderRadius: { xs: '24px 24px 0 0', md: 0 },
        pb: { xs: 12, md: 0 },
        boxShadow: { xs: '0 -4px 20px rgba(0,0,0,0.1)', md: 'none' },
      }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 3, sm: 3, md: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 3, md: 6 }, 
            alignItems: 'center', 
            width: '100%', 
            margin: '0 auto',
            textAlign: 'center',
          }}>
          {/* Main Content - Enhanced Typography */}
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: '#4A90E2',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                lineHeight: 1.2,
                maxWidth: '800px',
              }}
            >
              YOUR LOCAL GAME. LIVE
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                fontSize: { xs: '1rem', md: '1.1rem', lg: '1.2rem' },
                lineHeight: 1.6,
                maxWidth: '600px',
                fontWeight: 400,
              }}
            >
              Track live scores, manage teams & players.
              <br />
              Connect with you local cricket community
            </Typography>
            
            {/* CTA Button */}
            <Box sx={{ mt: 2, mb: { xs: 8, md: 0 } }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/matches')}
                sx={{
                  backgroundColor: '#4A90E2',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  px: { xs: 5, md: 6, lg: 8 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.1rem', lg: '1.2rem' },
                  borderRadius: '50px',
                  boxShadow: '0 4px 12px rgba(74, 144, 226, 0.4)',
                  '&:hover': {
                    backgroundColor: '#357ABD',
                    boxShadow: '0 6px 16px rgba(74, 144, 226, 0.5)',
                  },
                }}
              >
                GET STARTED
              </Button>
            </Box>
          </Box>

          {/* Feature cards removed from home page */}
        </Box>
        </Container>
      </Box>

      {/* Bottom navigation provided by SiteLayout */}
    </Box>
  );
};

export default Dashboard;
