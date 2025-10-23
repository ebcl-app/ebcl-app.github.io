import React from 'react';
import BusyOverlay from '../components/BusyOverlay';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Alert,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import SportsIcon from '@mui/icons-material/Sports';
import SearchIcon from '@mui/icons-material/Search';
import { CricketApiService, type ApiMatch } from '../api/cricketApi';

const MatchesList: React.FC = () => {
  const [statusFilter, setStatusFilter] = React.useState<'Live' | 'Upcoming' | 'Completed' | 'All'>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [matches, setMatches] = React.useState<ApiMatch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const navigate = useNavigate();
  const isFetchingRef = React.useRef(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const fetchData = React.useCallback(async (page: number = 1, append: boolean = false) => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      if (!append) {
        setMatches([]); // Clear matches only when not appending
      }

      // Fetch matches with all required data flags
      const matchesResponse = await CricketApiService.getMatches(
        statusFilter !== 'All' ? statusFilter.toLowerCase() : undefined,
        { page, limit: 12 }, // Increased limit for better infinite scroll experience
        true, // includePlayers
        true, // includeImpactScores
        true  // includeDismissals
      );

      if (matchesResponse.success) {
        // Deduplicate matches by id to prevent duplicate key errors
        const uniqueMatches = matchesResponse.data.filter((match, index, self) => 
          index === self.findIndex(m => m.id === match.id)
        );
        
        if (append) {
          setMatches(prev => {
            const combined = [...prev, ...uniqueMatches];
            // Remove duplicates from combined array
            return combined.filter((match, index, self) => 
              index === self.findIndex(m => m.id === match.id)
            );
          });
        } else {
          setMatches(uniqueMatches);
        }
        
        // Check if there are more pages
        const totalPages = matchesResponse.pagination?.totalPages || 1;
        setHasMore(page < totalPages);
      } else {
        setError('Failed to load matches. Please try again later.');
        setHasMore(false);
      }
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error fetching data:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [statusFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setMatches([]); // Clear matches when filter changes
    fetchData(1, false);
  }, [statusFilter, fetchData]); // Depend on both statusFilter and fetchData

  // Infinite scroll observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchData(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, currentPage, fetchData]); // Include fetchData to prevent stale closures

  const filterMatchesByStatus = (match: ApiMatch) => {
    if (statusFilter === 'All') return true;
    const statusMap = {
      'Live': 'live',
      'Upcoming': 'scheduled',
      'Completed': 'completed'
    };
    return match.status === statusMap[statusFilter as keyof typeof statusMap];
  };

  const filterMatchesBySearch = (match: ApiMatch) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      match.team1?.name?.toLowerCase().includes(query) ||
      match.team2?.name?.toLowerCase().includes(query) ||
      match.venue?.toLowerCase().includes(query)
    );
  };

  // Filter and sort matches
  const filteredMatches = matches
    .filter(filterMatchesByStatus)
    .filter(filterMatchesBySearch)
    .sort((a, b) => {
    // For completed matches, sort by date descending (most recent first)
    if (statusFilter === 'Completed' && a.scheduledDate && b.scheduledDate) {
      return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
    }
    // For other statuses, keep original order
    return 0;
  });

  const renderMatchCard = (match: ApiMatch) => {
    const isLive = match.status === 'live';
    const isUpcoming = match.status === 'scheduled';
    const isCompleted = match.status === 'completed';

    return (
      <Card
        key={match.id}
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': { 
            transform: 'translateY(-2px)', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer'
          }
        }}
        onClick={() => navigate(`/matches/${match.displayId}`)}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Status Tag */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip
              label={isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'PAST MATCH'}
              size="small"
              sx={{
                backgroundColor: isLive ? '#ef4444' : isUpcoming ? '#6b7280' : '#6b7280',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24
              }}
            />
            {isCompleted && (
              <Chip
                label="RESULT"
                size="small"
                sx={{
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24
                }}
              />
            )}
          </Box>

          {/* Match Content */}
          {isLive ? (
            // Live Match Card
            <Box>
              {/* Scores with grey background */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, py: 1.5, bgcolor: '#f9fafb', borderRadius: 1, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: match.team1?.color || '#1e3a8a', fontSize: '0.75rem', fontWeight: 700 }}>
                    {match.team1?.shortName || match.team1?.name?.substring(0, 2).toUpperCase() || 'T1'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {match.team1?.name || 'Team 1'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                      {match.team1Score || '0/0'}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#6b7280' }}>
                  VS
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {match.team2?.name || 'Team 2'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                      {match.team2Score || '0/0'}
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: match.team2?.color || '#f97316', fontSize: '0.75rem', fontWeight: 700 }}>
                    {match.team2?.shortName || match.team2?.name?.substring(0, 2).toUpperCase() || 'T2'}
                  </Avatar>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    Match in progress
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {match.venue || 'Venue TBD'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); navigate(`/matches/${match.displayId}`); }}
                  sx={{
                    backgroundColor: '#1e3a8a',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    px: 2,
                    py: 1,
                    borderRadius: 1
                  }}
                >
                  VIEW DETAILS
                </Button>
              </Box>
            </Box>
          ) : isUpcoming ? (
            // Upcoming Match Card
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: match.team1?.color || '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                    {match.team1?.shortName || match.team1?.name?.substring(0, 2).toUpperCase() || 'T1'}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {match.team1?.name || 'Team 1'}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#6b7280' }}>
                  VS
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {match.team2?.name || 'Team 2'}
                  </Typography>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: match.team2?.color || '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>
                    {match.team2?.shortName || match.team2?.name?.substring(0, 2).toUpperCase() || 'T2'}
                  </Avatar>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {match.scheduledDate ? new Date(match.scheduledDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date TBD'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {match.venue || 'Venue TBD'}
                  </Typography>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); navigate(`/matches/${match.displayId}`); }}
                  sx={{
                    minWidth: 'auto',
                    color: '#6b7280',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  View →
                </Button>
              </Box>
            </Box>
          ) : (
            // Past Match Card
            <Box>
              {/* Result/Winner */}
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 1.5, textAlign: 'center', color: '#1e3a8a', fontSize: '0.95rem' }}>
                {typeof match.result === 'string' 
                  ? match.result 
                  : match.result && typeof match.result === 'object' && match.result.winner 
                    ? (typeof match.result.winner === 'string' 
                        ? `${match.result.winner} won by ${match.result.margin}` 
                        : `${match.result.winner.name || match.result.winner.shortName} won by ${match.result.margin}`
                      )
                    : match.winner 
                      ? (typeof match.winner === 'string' 
                          ? `${match.winner} won` 
                          : `${match.winner.name || match.winner.shortName} won`
                        )
                      : `${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`
                }
              </Typography>
              
              {/* Teams and Scores - with grey stats box */}
              <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', py: 1.5, bgcolor: '#f9fafb', borderRadius: 1, mb: 1.5 }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: match.team1?.color || '#f97316', fontSize: '1rem', fontWeight: 700, mx: 'auto', mb: 0.5 }}>
                    {match.team1?.shortName || match.team1?.name?.substring(0, 2).toUpperCase() || 'T1'}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                    {match.team1?.name || 'Team 1'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.1rem' }}>
                    {match.team1?.score 
                      ? `${match.team1.score.runs}/${match.team1.score.wickets}` 
                      : match.team1Score || '0'}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600 }}>
                  vs
                </Typography>
                
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: match.team2?.color || '#f97316', fontSize: '1rem', fontWeight: 700, mx: 'auto', mb: 0.5 }}>
                    {match.team2?.shortName || match.team2?.name?.substring(0, 2).toUpperCase() || 'T2'}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                    {match.team2?.name || 'Team 2'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.1rem' }}>
                    {match.team2?.score 
                      ? `${match.team2.score.runs}/${match.team2.score.wickets}` 
                      : match.team2Score || '0'}
                  </Typography>
                </Box>
              </Box>

              {/* Player of the Match */}
              {match.result && typeof match.result === 'object' && match.result.playerOfMatch && (
                <Box sx={{ 
                  backgroundColor: '#fef3c7', 
                  borderRadius: 1, 
                  px: 1.5,
                  py: 1,
                  mb: 1.5,
                  border: '1px solid #fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      ⭐ POTM:
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {match.result.playerOfMatch.name}
                      </Typography>
                      {match.result.playerOfMatch.teamName && (
                        <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.65rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {match.result.playerOfMatch.teamName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {match.result.playerOfMatch.impact && (
                    <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {match.result.playerOfMatch.impact.toFixed(1)}
                    </Typography>
                  )}
                </Box>
              )}
              
              {/* Venue and Date */}
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center' }}>
                {match.venue || 'Venue TBD'} • {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Categorize matches by status
  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', maxWidth: { xs: '100%', md: 1280 }, mx: { xs: 0, md: 'auto' }, pb: { xs: 10, md: 4 }, width: '100%' }}>
      <BusyOverlay open={loading} label="Loading matches..." />
      
      {/* Filter Pills - Below Header */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 1, md: 2 }, pb: { xs: 2, md: 3 }, bgcolor: '#f5f5f5' }}>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, md: 1.5 }, 
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Chip
            label="All Matches"
            onClick={() => setStatusFilter('All')}
            sx={{
              bgcolor: statusFilter === 'All' ? '#1e40af' : '#ffffff',
              color: statusFilter === 'All' ? '#ffffff' : '#64748b',
              fontWeight: statusFilter === 'All' ? 600 : 500,
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              height: { xs: 32, md: 36 },
              px: { xs: 0, md: 1 },
              borderRadius: '16px',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: statusFilter === 'All' ? '#1e3a8a' : '#f1f5f9',
              },
              transition: 'all 0.2s ease',
            }}
          />
          <Chip
            label="Upcoming"
            onClick={() => setStatusFilter('Upcoming')}
            sx={{
              bgcolor: statusFilter === 'Upcoming' ? '#1e40af' : '#ffffff',
              color: statusFilter === 'Upcoming' ? '#ffffff' : '#64748b',
              fontWeight: statusFilter === 'Upcoming' ? 600 : 500,
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              height: { xs: 32, md: 36 },
              px: { xs: 0, md: 1 },
              borderRadius: '16px',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: statusFilter === 'Upcoming' ? '#1e3a8a' : '#f1f5f9',
              },
              transition: 'all 0.2s ease',
            }}
          />
          <Chip
            label="Live"
            onClick={() => setStatusFilter('Live')}
            sx={{
              bgcolor: statusFilter === 'Live' ? '#1e40af' : '#ffffff',
              color: statusFilter === 'Live' ? '#ffffff' : '#64748b',
              fontWeight: statusFilter === 'Live' ? 600 : 500,
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              height: { xs: 32, md: 36 },
              px: { xs: 0, md: 1 },
              borderRadius: '16px',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: statusFilter === 'Live' ? '#1e3a8a' : '#f1f5f9',
              },
              transition: 'all 0.2s ease',
            }}
          />
          <Chip
            label="Completed"
            onClick={() => setStatusFilter('Completed')}
            sx={{
              bgcolor: statusFilter === 'Completed' ? '#1e40af' : '#ffffff',
              color: statusFilter === 'Completed' ? '#ffffff' : '#64748b',
              fontWeight: statusFilter === 'Completed' ? 600 : 500,
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              height: { xs: 32, md: 36 },
              px: { xs: 0, md: 1 },
              borderRadius: '16px',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: statusFilter === 'Completed' ? '#1e3a8a' : '#f1f5f9',
              },
              transition: 'all 0.2s ease',
            }}
          />
          <TextField
            placeholder="Search matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: { xs: 'auto', sm: 250 },
              flex: { xs: 1, sm: 0 },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
                borderRadius: '16px',
                height: { xs: 32, md: 36 },
                fontSize: { xs: '0.875rem', md: '0.9375rem' }
              }
            }}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        px: { xs: 3, md: 4 }, 
        pt: { xs: 3, md: 0 }, 
        pb: { xs: 2, md: 2 },
        display: { xs: 'flex', md: 'grid' },
        flexDirection: { xs: 'column', md: 'initial' },
        gridTemplateColumns: { md: 'repeat(auto-fill, minmax(380px, 1fr))' },
        gap: { xs: 2, md: 3 }
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, gridColumn: { md: '1 / -1' } }}>
            {error}
          </Alert>
        )}

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => renderMatchCard(match))
        ) : (
          <Card sx={{ boxShadow: 2, borderRadius: 2, gridColumn: { md: '1 / -1' } }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <SportsIcon sx={{ fontSize: { xs: 48, md: 56 }, color: '#6b7280', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
                No matches found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9375rem' } }}>
                {statusFilter === 'All' ? 'There are no matches available at the moment.' : `There are no ${statusFilter.toLowerCase()} matches at the moment.`}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && !loading && matches.length > 0 && (
          <Box 
            ref={observerTarget} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: { xs: 2, md: 3 },
              mb: { xs: 2, md: 3 },
              py: 2,
              gridColumn: { md: '1 / -1' }
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Scroll for more...
            </Typography>
          </Box>
        )}

        {/* Loading more indicator */}
        {loading && matches.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
            <Typography variant="body2" color="text.secondary">
              Loading more matches...
            </Typography>
          </Box>
        )}
      </Box>

    </Box>
  );
};

export default MatchesList;