import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import SportsCricketOutlined from '@mui/icons-material/SportsCricketOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined';

const illustrationSrc = '/cricketIllustration.png';

const MobileSplash: React.FC = () => {
  return (
    <Box
      sx={{
        maxWidth: 480,
        minHeight: '100vh',
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Top content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, pt: 4 }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
            BoxCricket
          </Typography>
        </Box>

        {/* Tagline */}
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 700, color: '#1976d2' }}
        >
          Score. Manage. Win.
        </Typography>

        {/* Illustration */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Box
            component="img"
            src={illustrationSrc}
            alt="Cricket illustration"
            sx={{ width: '80%', maxWidth: 320, height: 'auto' }}
            onError={(e: any) => {
              // Fallback to an existing public asset if the illustration is missing
              if (e.currentTarget && e.currentTarget.src.indexOf('cricketIllustration.png') !== -1) {
                e.currentTarget.src = '/landingpage-512x512.png';
              }
            }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body1"
          align="center"
          sx={{ color: 'text.secondary', px: 2 }}
        >
          Seamless box cricket scoring and team management designed for fast, on-the-go updates.
        </Typography>

        {/* CTA */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            GET STARTED
          </Button>
        </Box>
      </Box>

      {/* Bottom nav */}
      <Box
        sx={{
          borderTop: '1px solid #e5e7eb',
          p: 1,
          pb: 2,
          backgroundColor: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <HomeOutlined sx={{ color: '#1976d2' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2' }}>
              Home
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <SportsCricketOutlined sx={{ color: '#6b7280' }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Matches
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <PeopleOutline sx={{ color: '#6b7280' }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Players
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <MoreHorizOutlined sx={{ color: '#6b7280' }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              More
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MobileSplash;


