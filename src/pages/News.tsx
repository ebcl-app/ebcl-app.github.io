import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArticleIcon from '@mui/icons-material/Article';
import { Link } from 'react-router-dom';
import { CricketApiService, type ApiNews, type ApiScore } from '../api/cricketApi';

const News: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [news, setNews] = useState<ApiNews[]>([]);
  const [scores, setScores] = useState<ApiScore[]>([]);
  const [selectedNews, setSelectedNews] = useState<ApiNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Carousel state
  const [currentScoreIndex, setCurrentScoreIndex] = useState(0);
  const [isAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const autoPlayIntervalRef = useRef<number | null>(null);

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Function to detect and render URLs as clickable links
  const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <MuiLink
            key={index}
            component="button"
            variant="body1"
            sx={{
              color: '#1976d2',
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: '#1565c0',
                textDecoration: 'underline'
              }
            }}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              // Use the open_simple_browser tool to open the URL
              // Since we can't directly call tools in event handlers,
              // we'll use window.open as a fallback for now
              window.open(part, '_blank', 'noopener,noreferrer');
            }}
          >
            {part}
          </MuiLink>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (id) {
      // Load specific news article
      loadNewsById(id);
    } else {
      // Load news list
      loadNews();
      loadScores();
    }
  }, [id, currentPage, categoryFilter]);

  // Carousel functions
  const nextScore = () => {
    setCurrentScoreIndex((prev) => (prev + 1) % scores.length);
  };

  const prevScore = () => {
    setCurrentScoreIndex((prev) => (prev - 1 + scores.length) % scores.length);
  };

  const goToScore = (index: number) => {
    setCurrentScoreIndex(index);
  };

  // Auto-play effect for mobile
  useEffect(() => {
    if (isMobile && scores.length > 1 && isAutoPlaying) {
      autoPlayIntervalRef.current = setInterval(() => {
        nextScore();
      }, 4000); // Change every 4 seconds
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isMobile, scores.length, isAutoPlaying]);

  // Reset carousel when scores change
  useEffect(() => {
    setCurrentScoreIndex(0);
  }, [scores]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextScore();
    }
    if (isRightSwipe) {
      prevScore();
    }
  };

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const category = categoryFilter === 'all' ? undefined : categoryFilter;
      const response = await CricketApiService.getNews(
        { page: currentPage, limit: 12 },
        category
      );

      if (response.success && response.data) {
        setNews(response.data);
        // Calculate total pages from pagination if available
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
        } else {
          // Estimate pages based on data length (assuming 12 per page)
          setTotalPages(Math.ceil(response.data.length / 12));
        }
      } else {
        // Mock data for testing with URLs
        setNews([
          {
            id: '1',
            title: 'India vs Australia: Kohli Century Powers India to Victory',
            summary: 'Virat Kohli scored a brilliant century as India defeated Australia in a thrilling match.',
            content: `Virat Kohli played a masterful innings of 120 runs off 98 balls, leading India to a comfortable victory over Australia at the Melbourne Cricket Ground.

The match was closely contested until Kohli's innings turned the game in India's favor. For more details, check out the full scorecard at https://www.cricket.com.au/scores.

Australia's bowlers struggled to contain the Indian batsmen, with Mitchell Starc being the pick of the bowlers with 2 wickets. The next match in the series will be held at the Sydney Cricket Ground - get your tickets at https://www.cricket.com.au/tickets.`,
            author: 'Cricket Correspondent',
            category: 'match',
            tags: ['India', 'Australia', 'Virat Kohli', 'Century'],
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPublished: true,
            viewCount: 1250,
            featured: true
          },
          {
            id: '2',
            title: 'Player of the Tournament: Bumrah Takes Top Honors',
            summary: 'Jasprit Bumrah named Player of the Tournament for his outstanding bowling performance.',
            content: `Jasprit Bumrah has been awarded the Player of the Tournament award for his exceptional bowling throughout the series.

Bumrah took 15 wickets in 5 matches at an average of 18.5, including a hat-trick in the final match. His yorkers and slower balls were unplayable for the Australian batsmen.

For more player statistics and analysis, visit https://www.icc-cricket.com/player-stats.

The award ceremony will be held tomorrow at the team hotel. Bumrah dedicated his award to the Indian team management and support staff.`,
            author: 'Sports Editor',
            category: 'player',
            tags: ['Jasprit Bumrah', 'Player of Tournament', 'Bowling'],
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            isPublished: true,
            viewCount: 890,
            featured: false
          }
        ]);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Failed to load news. Please try again later.');
      console.error('Error loading news:', err);
    } finally {
      setLoading(false);
    }
  };



  const loadScores = async () => {
    try {
      const response = await CricketApiService.getScores(5);
      console.log('Scores API response:', response);
      if (response.success && response.data && response.data.length > 0) {
        console.log('Scores data:', response.data);
        setScores(response.data);
      } else {
        console.log('No scores data received, using mock data for testing');
        // Mock data for testing
        setScores([
          {
            id: '1',
            matchId: 'match1',
            team1: { name: 'India', score: 245, wickets: 3, overs: '45.2' },
            team2: { name: 'Australia', score: 180, wickets: 7, overs: '38.1' },
            status: 'live',
            venue: 'Melbourne Cricket Ground',
            currentBatsman: { name: 'Virat Kohli', runs: 45, balls: 32 },
            currentBowler: { name: 'Mitchell Starc', wickets: 2, runs: 28, overs: '7.1' },
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            matchId: 'match2',
            team1: { name: 'England', score: 320, wickets: 5, overs: '50.0' },
            team2: { name: 'South Africa', score: 285, wickets: 8, overs: '48.3' },
            status: 'live',
            venue: 'Lord\'s Cricket Ground',
            currentBatsman: { name: 'Joe Root', runs: 67, balls: 45 },
            currentBowler: { name: 'Kagiso Rabada', wickets: 3, runs: 45, overs: '9.3' },
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            matchId: 'match3',
            team1: { name: 'Pakistan', score: 280, wickets: 10, overs: '49.4' },
            team2: { name: 'New Zealand', score: 284, wickets: 6, overs: '47.2' },
            status: 'completed',
            venue: 'Eden Park',
            result: 'New Zealand won by 4 wickets',
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading scores:', err);
      // Fallback mock data on error
      setScores([
        {
          id: '1',
          matchId: 'match1',
          team1: { name: 'India', score: 245, wickets: 3, overs: '45.2' },
          team2: { name: 'Australia', score: 180, wickets: 7, overs: '38.1' },
          status: 'live',
          venue: 'Melbourne Cricket Ground',
          currentBatsman: { name: 'Virat Kohli', runs: 45, balls: 32 },
          currentBowler: { name: 'Mitchell Starc', wickets: 2, runs: 28, overs: '7.1' },
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const loadNewsById = async (newsId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await CricketApiService.getNewsById(newsId);
      if (response.success && response.data) {
        setSelectedNews(response.data);
      } else {
        setError('News article not found');
      }
    } catch (err) {
      setError('Failed to load news article. Please try again later.');
      console.error('Error loading news article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'match': return '#1976d2';
      case 'player': return '#2e7d32';
      case 'tournament': return '#ed6c02';
      case 'general': return '#757575';
      default: return '#757575';
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/news')}>
          Back to News
        </Button>
      </Container>
    );
  }

  // News Detail View
  if (selectedNews) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          <MuiLink component={Link} to="/news" underline="hover" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            News
          </MuiLink>
          <Typography color="text.primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {selectedNews.title}
          </Typography>
        </Breadcrumbs>

        <Card sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          {selectedNews.imageUrl && (
            <CardMedia
              component="img"
              image={selectedNews.imageUrl}
              alt={selectedNews.title}
              sx={{ 
                objectFit: 'cover',
                height: { xs: 200, sm: 300, md: 400 }
              }}
            />
          )}

          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  mb: { xs: 1.5, sm: 2 }, 
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                  lineHeight: 1.2
                }}
              >
                {selectedNews.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={selectedNews.category.charAt(0).toUpperCase() + selectedNews.category.slice(1)}
                  sx={{
                    backgroundColor: getCategoryColor(selectedNews.category),
                    color: 'white',
                    fontWeight: 600
                  }}
                />

                {selectedNews.featured && (
                  <Chip
                    icon={<StarIcon />}
                    label="Featured"
                    sx={{
                      backgroundColor: '#ffd700',
                      color: '#000',
                      fontWeight: 600
                    }}
                  />
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedNews.publishedAt)}
                  </Typography>
                </Box>

                {selectedNews.author && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {selectedNews.author}
                    </Typography>
                  </Box>
                )}

                {selectedNews.viewCount && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {selectedNews.viewCount} views
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  {selectedNews.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
              {selectedNews.summary && (
                <>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: { xs: 1.5, sm: 2 }, 
                      fontWeight: 600,
                      fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' }
                    }}
                  >
                    {selectedNews.summary}
                  </Typography>
                  <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
                </>
              )}
              {selectedNews.content.split('\n').map((paragraph, index) => (
                <Typography 
                  key={index} 
                  variant="body1" 
                  sx={{ 
                    mb: 2, 
                    lineHeight: 1.8,
                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' }
                  }}
                >
                  {renderContentWithLinks(paragraph)}
                </Typography>
              ))}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIosNewIcon />}
            onClick={() => navigate('/news')}
          >
            Back to News
          </Button>
        </Box>
      </Container>
    );
  }

  // News List View
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Header matching other pages */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: { xs: 2, sm: 3, md: 4 },
        gap: 1
      }}>
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'grey.100' }
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <ArticleIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}
        >
          Cricket News
        </Typography>
      </Box>



      {/* Live Scores */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 2, sm: 3 },
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Live Scores
        </Typography>
        {scores.length > 0 ? (
          <Box sx={{ position: 'relative' }}>
            {/* Mobile Carousel (1 item) */}
            <Box
              sx={{
                display: { xs: 'block', md: 'none' },
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
              }}
              ref={carouselRef}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Box
                sx={{
                  display: 'flex',
                  transition: 'transform 0.3s ease-in-out',
                  transform: `translateX(-${currentScoreIndex * 100}%)`,
                  width: `${scores.length * 100}%`,
                }}
              >
                {scores.map((score) => (
                  <Box
                    key={score.id}
                    sx={{
                      flex: '0 0 100%',
                      px: 1,
                    }}
                  >
                    <Card
                      sx={{
                        border: score.status === 'live' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 3 }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        {/* Status Badge */}
                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                          <Chip
                            label={score.status.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: score.status === 'live' ? '#4caf50' : score.status === 'completed' ? '#2196f3' : '#ff9800',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>

                        {/* Teams */}
                        <Box sx={{ mb: 2, mt: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 1 }}>
                            {score.team1?.name || 'Team 1'} vs {score.team2?.name || 'Team 2'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {score.venue || 'Venue TBA'}
                          </Typography>
                        </Box>

                        {/* Scores */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {score.team1?.name || 'Team 1'}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                              {score.team1?.score || 0}/{score.team1?.wickets || 0} ({score.team1?.overs || '0.0'})
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                              {score.team2?.name || 'Team 2'}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                              {score.team2?.score || 0}/{score.team2?.wickets || 0} ({score.team2?.overs || '0.0'})
                            </Typography>
                          </Box>
                        </Box>

                        {/* Live Match Details */}
                        {score.status === 'live' && (
                          <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 1.5 }}>
                            {score.currentBatsman && (
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#2e7d32', fontSize: '0.75rem' }}>
                                  BATTER
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {score.currentBatsman.name}: {score.currentBatsman.runs} ({score.currentBatsman.balls})
                                </Typography>
                              </Box>
                            )}
                            {score.currentBowler && (
                              <Box>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#d32f2f', fontSize: '0.75rem' }}>
                                  BOWLER
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {score.currentBowler.name}: {score.currentBowler.wickets}/{score.currentBowler.runs} ({score.currentBowler.overs})
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Result for completed matches */}
                        {score.result && (
                          <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 1.5, mt: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.8rem' }}>
                              {score.result}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {/* Mobile Navigation Dots */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                {scores.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => goToScore(index)}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: index === currentScoreIndex ? 'primary.main' : 'grey.300',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Desktop Grid (Multiple items) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'grid' },
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 2,
              }}
            >
              {scores.map((score) => (
                <Card
                  key={score.id}
                  sx={{
                    border: score.status === 'live' ? '2px solid #4caf50' : '1px solid #e0e0e0',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    {/* Status Badge */}
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Chip
                        label={score.status.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: score.status === 'live' ? '#4caf50' : score.status === 'completed' ? '#2196f3' : '#ff9800',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>

                    {/* Teams */}
                    <Box sx={{ mb: 2, mt: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 1 }}>
                        {score.team1?.name || 'Team 1'} vs {score.team2?.name || 'Team 2'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {score.venue || 'Venue TBA'}
                      </Typography>
                    </Box>

                    {/* Scores */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {score.team1?.name || 'Team 1'}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                          {score.team1?.score || 0}/{score.team1?.wickets || 0} ({score.team1?.overs || '0.0'})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                          {score.team2?.name || 'Team 2'}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                          {score.team2?.score || 0}/{score.team2?.wickets || 0} ({score.team2?.overs || '0.0'})
                        </Typography>
                      </Box>
                    </Box>

                    {/* Live Match Details */}
                    {score.status === 'live' && (
                      <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 1.5 }}>
                        {score.currentBatsman && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#2e7d32', fontSize: '0.75rem' }}>
                              BATTER
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {score.currentBatsman.name}: {score.currentBatsman.runs} ({score.currentBatsman.balls})
                            </Typography>
                          </Box>
                        )}
                        {score.currentBowler && (
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#d32f2f', fontSize: '0.75rem' }}>
                              BOWLER
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {score.currentBowler.name}: {score.currentBowler.wickets}/{score.currentBowler.runs} ({score.currentBowler.overs})
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Result for completed matches */}
                    {score.result && (
                      <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 1.5, mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.8rem' }}>
                          {score.result}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
            <Typography variant="body1" color="text.secondary">
              No live scores available at the moment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back later for live cricket scores
            </Typography>
          </Box>
        )}
      </Box>

      {/* All News */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 2 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Latest News
          </Typography>

          {/* Category Filter */}
          <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
            {['all', 'match', 'player', 'tournament', 'general'].map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? 'contained' : 'outlined'}
                onClick={() => handleCategoryChange(category)}
                size="small"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  px: { xs: 1, sm: 1.5 },
                  py: { xs: 0.3, sm: 0.5 }
                }}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }, 
          gap: { xs: 2, sm: 2.5, md: 3 } 
        }}>
          {news.map((item) => (
            <Card
              key={item.id}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => {
                // If news has a URL, open it directly, otherwise navigate to detail page
                const newsItem = item as any;
                if (newsItem.url || newsItem.link || newsItem.externalUrl) {
                  window.open(newsItem.url || newsItem.link || newsItem.externalUrl, '_blank', 'noopener,noreferrer');
                } else {
                  navigate(`/news/${item.id}`);
                }
              }}
            >
              {item.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl}
                  alt={item.title}
                  sx={{
                    height: { xs: 160, sm: 180, md: 200 },
                    objectFit: 'cover'
                  }}
                />
              )}
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    size="small"
                    sx={{
                      backgroundColor: getCategoryColor(item.category),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  {item.featured && (
                    <Chip
                      icon={<StarIcon />}
                      label="Featured"
                      size="small"
                      sx={{
                        ml: 1,
                        backgroundColor: '#ffd700',
                        color: '#000',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                    lineHeight: 1.3
                  }}
                >
                  {item.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                    lineHeight: 1.5
                  }}
                >
                  {item.summary}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.publishedAt)}
                    </Typography>
                  </Box>
                  {item.viewCount && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VisibilityIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {item.viewCount}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default News;