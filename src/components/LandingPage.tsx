import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import MobileSplash from './MobileSplash';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PeopleIcon from '@mui/icons-material/People';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import AssessmentIcon from '@mui/icons-material/Assessment';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:480px)');
  const navigate = useNavigate();

  const features = [
    {
      icon: <SportsCricketIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Live Scoring',
      description: 'Real-time cricket scoring with automatic calculations and statistics tracking.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Team Management',
      description: 'Manage players, teams, and match schedules with ease.',
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Analytics & Reports',
      description: 'Comprehensive match analytics and performance reports.',
    },
  ];

  if (isMobile) {
    return <MobileSplash />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '50%' } }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Box Cricket
              <br />
              Management
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontWeight: 300,
              }}
            >
              Professional cricket scoring and team management platform for box cricket leagues.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate('/')}
                sx={{
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: '#f5f5f5',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '50%' }, display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: 300, md: 400 } }}>
            <SportsCricketIcon
              sx={{
                fontSize: { xs: 200, md: 300 },
                opacity: 0.3,
                color: 'white',
              }}
            />
          </Box>
        </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          Powerful Features
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          sx={{
            mb: 8,
            color: theme.palette.text.secondary,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          Everything you need to manage your box cricket league efficiently
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ flex: 1 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
              fontWeight: 600,
            }}
          >
            Ready to Transform Your Cricket League?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontWeight: 300,
            }}
          >
            Join thousands of cricket enthusiasts who trust our platform for professional match management.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: 'white',
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              px: 6,
              py: 2,
              fontSize: '1.1rem',
            }}
          >
            Start Managing Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;