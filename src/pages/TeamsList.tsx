import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import TimelineIcon from '@mui/icons-material/Timeline';
import { CricketApiService, type ApiTeam } from '../api/cricketApi';
import BusyOverlay from '../components/BusyOverlay';

interface Team {
  id: number;
  numericId: number;
  displayId: string;
  stringId: string; // Add string ID for API calls
  name: string;
  shortName: string;
  captain?: string;
  playersCount: number;
  color?: string;
  statistics?: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winPercentage: number;
    currentStreak: { type: string; count: number };
    longestWinStreak: number;
    longestLossStreak: number;
    recentMatches: Array<{
      matchId: number;
      date: string;
      opponent: string;
      result: string;
      winner: string;
      venue: string;
      status: string;
    }>;
    form: string[];
  };
}

const TeamsList: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const navigate = useNavigate();
  const isFetchingRef = React.useRef(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const fetchTeams = React.useCallback(async (page: number = 1, append: boolean = false) => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      if (!append) {
        setTeams([]); // Clear teams only on initial load or refresh
      }
      
      const response = await CricketApiService.getTeams({ page, limit: 12 });

      if (response.success) {
        // Transform API data to component format
        const transformedTeams: Team[] = response.data.map((apiTeam: ApiTeam) => ({
          id: apiTeam.numericId || 0,
          numericId: apiTeam.numericId || 0,
          displayId: apiTeam.displayId || '',
          stringId: apiTeam.id, // Add string ID for navigation
          name: apiTeam.name,
          shortName: apiTeam.shortName,
          captain: apiTeam.captain?.name,
          playersCount: apiTeam.playersCount || 0,
          color: apiTeam.color,
          // Use teamStats from API if available, otherwise fall back to statistics
          statistics: apiTeam.teamStats ? {
            totalMatches: apiTeam.teamStats.matchesPlayed,
            wins: apiTeam.teamStats.wins,
            losses: apiTeam.teamStats.losses,
            draws: apiTeam.teamStats.draws || 0,
            winPercentage: apiTeam.teamStats.winPercentage,
            currentStreak: { type: 'N/A', count: 0 },
            longestWinStreak: 0,
            longestLossStreak: 0,
            recentMatches: [],
            form: []
          } : apiTeam.statistics,
        }));

        // Deduplicate teams by stringId to prevent duplicate key errors
        const uniqueTeams = transformedTeams.filter((team, index, self) =>
          index === self.findIndex(t => t.stringId === team.stringId)
        );

        setTeams(prev => {
          const combined = append ? [...prev, ...uniqueTeams] : uniqueTeams;
          // Deduplicate across all teams to prevent duplicate keys
          return combined.filter((team, index, self) =>
            index === self.findIndex(t => t.stringId === team.stringId)
          );
        });
        const totalPages = response.pagination?.pages || 1;
        setHasMore(page < totalPages);
      } else {
        setError('Failed to load teams. Please try again later.');
      }
    } catch (err) {
      setError('Failed to load teams. Please try again later.');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial data fetch
  React.useEffect(() => {
    fetchTeams(1).then(() => {
      setCurrentPage(1); // Set current page after initial load
    });
  }, []);

  // Infinite scroll observer - only set up after initial load
  React.useEffect(() => {
    // Don't set up observer until we have initial data and it's not loading
    if (loading || teams.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchTeams(nextPage, true); // Append mode
        }
      },
      {
        threshold: 0.3, // Increased threshold for better mobile detection
        rootMargin: '50px' // Trigger 50px before element comes into view
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, currentPage, fetchTeams, teams.length]);

  const filtered = teams.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  const renderGridView = () => (
    <>
      {filtered.map((team) => (
        <Card 
          key={team.stringId} 
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
          onClick={() => navigate(`/teams/${team.displayId}`)}
        >
          <CardContent sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Team Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label="TEAM"
                size="small"
                sx={{
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24
                }}
              />
            </Box>

            {/* Team Content */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: team.color || '#1e3a8a', 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  mr: 2
                }}>
                  {team.shortName}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {team.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {team.playersCount || 0} Players
                  </Typography>
                </Box>
              </Box>

              {/* Captain info */}
              {team.captain && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    Captain: {team.captain}
                  </Typography>
                </Box>
              )}

              {/* Statistics - simplified */}
              {team.statistics && (
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', py: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.1rem' }}>
                      {team.statistics.totalMatches}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                      Matches
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>
                      {team.statistics.wins}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                      Won
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444', fontSize: '1.1rem' }}>
                      {team.statistics.losses}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                      Lost
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Win percentage */}
              {team.statistics && (
                <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center', mt: 1.5 }}>
                  Win Rate: {team.statistics.winPercentage?.toFixed(1) || 0}%
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );

  // Keep page shell; show overlay and inline error

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', maxWidth: { xs: '100%', md: 1280 }, mx: { xs: 0, md: 'auto' }, pb: { xs: 10, md: 4 }, width: '100%' }}>
      <BusyOverlay open={loading} label="Loading teams..." />
      
      {/* Filter Chips */}
      <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 1, md: 2 }, pb: { xs: 2, md: 3 }, bgcolor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.5 }, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label="All Teams"
            onClick={() => setQuery('')}
            sx={{
              bgcolor: query === '' ? '#1e40af' : '#ffffff',
              color: query === '' ? '#ffffff' : '#64748b',
              fontWeight: query === '' ? 600 : 500,
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              height: { xs: 32, md: 36 },
              px: { xs: 0, md: 1 },
              borderRadius: '16px',
              cursor: 'pointer',
              '&:hover': { bgcolor: query === '' ? '#1e3a8a' : '#f1f5f9' },
              transition: 'all 0.2s ease',
            }}
          />
          <TextField
            placeholder="Search teams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

      <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 1, md: 0 }, pb: { xs: 2, md: 2 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Teams content */}
        <Box sx={{
          display: { xs: 'flex', md: 'grid' },
          flexDirection: { xs: 'column', md: 'initial' },
          gridTemplateColumns: { md: 'repeat(auto-fill, minmax(380px, 1fr))' },
          gap: { xs: 2, md: 3 }
        }}>
          {filtered.length > 0 ? (
            renderGridView()
          ) : (
            <Card sx={{ boxShadow: 2, borderRadius: 2, gridColumn: { md: '1 / -1' } }}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
                <SportsSoccerIcon sx={{ fontSize: { xs: 48, sm: 56, md: 64 }, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                  No teams found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                  {query ? 'No teams match your search criteria.' : 'There are no teams available at the moment.'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Infinite Scroll Trigger */}
        {hasMore && !loading && teams.length > 0 && (
          <Box
            ref={observerTarget}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: { xs: 3, sm: 4 },
              mb: { xs: 3, sm: 4 },
              py: { xs: 3, sm: 2 },
              minHeight: { xs: 60, sm: 40 } // Ensure minimum height for mobile
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <TimelineIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              Scroll for more teams...
            </Typography>
          </Box>
        )}

        {/* Loading more indicator */}
        {loading && teams.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
            <Typography variant="body2" color="text.secondary">
              Loading more teams...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TeamsList;


