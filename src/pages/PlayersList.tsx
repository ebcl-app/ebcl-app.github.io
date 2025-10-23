import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Alert,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { CricketApiService, type ApiPlayer } from '../api/cricketApi';
import BusyOverlay from '../components/BusyOverlay';

const PlayersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('All');
  const [letterFilter, setLetterFilter] = React.useState<string>('All');
  const [showLetterFilter, setShowLetterFilter] = React.useState(false);
  const [players, setPlayers] = React.useState<ApiPlayer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const navigate = useNavigate();
  const isFetchingRef = React.useRef(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const fetchPlayers = async (page: number = 1, append: boolean = false) => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      if (!append) {
        setPlayers([]); // Clear players only on initial load or refresh
      }
      
      const response = await CricketApiService.getPlayers({ page, limit: 12 });

      if (response.success) {
        // Deduplicate players by id to prevent duplicate key errors
        const uniquePlayers = response.data.filter((player, index, self) => 
          index === self.findIndex(p => p.id === player.id)
        );
        
        setPlayers(prev => append ? [...prev, ...uniquePlayers] : uniquePlayers);
        const totalPages = response.pagination?.pages || 1;
        setHasMore(page < totalPages);
      } else {
        setError('Failed to load players. Please try again later.');
      }
    } catch (err) {
      setError('Failed to load players. Please try again later.');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Initial data fetch
  React.useEffect(() => {
    fetchPlayers(1);
  }, []);

  // Infinite scroll observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingRef.current) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchPlayers(nextPage, true); // Append mode
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
  }, [hasMore, loading, currentPage]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Batsman':
        return '#4A90E2';
      case 'Bowler':
        return '#EF4444';
      case 'All-rounder':
        return '#10B981';
      case 'Wicket-keeper':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  // Helper function to get player icon based on role
  const getPlayerIcon = (role: string) => {
    const iconStyle = { color: '#FFFFFF !important', fontSize: 'inherit' };
    switch (role) {
      case 'Batsman':
        return <SportsCricketIcon sx={iconStyle} />;
      case 'Bowler':
        return <SportsBaseballIcon sx={iconStyle} />;
      case 'All-rounder':
        return <ShuffleIcon sx={iconStyle} />;
      case 'Wicket-keeper':
        return <SportsCricketIcon sx={iconStyle} />;
      default:
        return <SportsCricketIcon sx={iconStyle} />;
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || player.role === roleFilter;
    const matchesLetter = letterFilter === 'All' || player.name.toLowerCase().startsWith(letterFilter.toLowerCase());
    return matchesSearch && matchesRole && matchesLetter;
  });

  const renderMobileCard = (player: ApiPlayer) => (
    <Card
      key={player.id}
      onClick={() => navigate(`/players/${player.displayId}`)}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: 4,
        bgcolor: '#ffffff',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Player Info Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Chip
            label={player.role.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: getRoleColor(player.role),
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24
            }}
          />
          <Chip
            label={player.isActive ? 'ACTIVE' : 'INACTIVE'}
            size="small"
            sx={{
              backgroundColor: player.isActive ? '#10b981' : '#6b7280',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24
            }}
          />
        </Box>

        {/* Player Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: getRoleColor(player.role),
              fontSize: '1rem',
              fontWeight: 700,
              mr: 2
            }}
          >
            {getPlayerIcon(player.role)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {player.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {player.preferredTeam?.name || 'No Team'}
            </Typography>
          </Box>
        </Box>

        {/* Statistics - Grey Box */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', py: 1.5, bgcolor: '#f9fafb', borderRadius: 1, mb: 1.5 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.1rem' }}>
              {player.careerStats?.overall?.matchesPlayed || player.matchesPlayed || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
              Matches
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#F59E0B', fontSize: '1.1rem' }}>
              {player.careerStats?.batting?.runs || player.totalRuns || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
              Runs
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444', fontSize: '1.1rem' }}>
              {player.careerStats?.bowling?.wickets || player.totalWickets || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
              Wickets
            </Typography>
          </Box>
        </Box>

        {/* Average */}
        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center' }}>
          Batting Avg: {player.careerStats?.batting?.average?.toFixed(2) || player.battingAverage?.toFixed(2) || '0.00'}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderMobileView = () => {
    return (
      <Box sx={{ display: { xs: 'block', md: 'none' }, minHeight: '100vh', bgcolor: '#f5f5f5', pb: 10 }}>
        {/* Filter Pills */}
        <Box sx={{ px: 2, pt: 1, pb: 2.5, bgcolor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
            <Chip
              label="All Players"
              onClick={() => setRoleFilter('All')}
              sx={{
                bgcolor: roleFilter === 'All' ? '#1e40af' : '#ffffff',
                color: roleFilter === 'All' ? '#ffffff' : '#64748b',
                fontWeight: roleFilter === 'All' ? 600 : 500,
                fontSize: '0.875rem',
                height: 32,
                borderRadius: '16px',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: roleFilter === 'All' ? '#1e3a8a' : '#f1f5f9',
                },
                transition: 'all 0.2s ease',
              }}
            />
            <Chip
              label="Batsmen"
              onClick={() => setRoleFilter('Batsman')}
              sx={{
                bgcolor: roleFilter === 'Batsman' ? '#1e40af' : '#ffffff',
                color: roleFilter === 'Batsman' ? '#ffffff' : '#64748b',
                fontWeight: roleFilter === 'Batsman' ? 600 : 500,
                fontSize: '0.875rem',
                height: 32,
                borderRadius: '16px',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: roleFilter === 'Batsman' ? '#1e3a8a' : '#f1f5f9',
                },
                transition: 'all 0.2s ease',
              }}
            />
            <Chip
              label="All-rounders"
              onClick={() => setRoleFilter('All-rounder')}
              sx={{
                bgcolor: roleFilter === 'All-rounder' ? '#1e40af' : '#ffffff',
                color: roleFilter === 'All-rounder' ? '#ffffff' : '#64748b',
                fontWeight: roleFilter === 'All-rounder' ? 600 : 500,
                fontSize: '0.875rem',
                height: 32,
                borderRadius: '16px',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: roleFilter === 'All-rounder' ? '#1e3a8a' : '#f1f5f9',
                },
                transition: 'all 0.2s ease',
              }}
            />
          </Box>
        </Box>

        {/* Player Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 2, pb: 2 }}>
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(renderMobileCard)
          ) : (
            <Card sx={{ boxShadow: 2, borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <SportsCricketIcon sx={{ fontSize: 48, color: '#6b7280', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No players found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'Try adjusting your search' : 'No players available'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Infinite Scroll Trigger */}
        {hasMore && !loading && players.length > 0 && (
          <Box ref={observerTarget} sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Typography variant="body2" sx={{ color: '#ffffff' }}>
              Scroll for more...
            </Typography>
          </Box>
        )}

        {/* Loading more indicator */}
        {loading && players.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Typography variant="body2" sx={{ color: '#ffffff' }}>
              Loading more players...
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderGridView = () => (
    <>
       {filteredPlayers.map((player) => (
         <Card 
           key={player.id} 
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
           onClick={() => navigate(`/players/${player.displayId}`)}
         >
          <CardContent sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Player Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={player.role.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: getRoleColor(player.role),
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24
                }}
              />
              <Chip
                label={player.isActive ? 'ACTIVE' : 'INACTIVE'}
                size="small"
                sx={{
                  backgroundColor: player.isActive ? '#10b981' : '#6b7280',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24
                }}
              />
            </Box>

            {/* Player Content */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: getRoleColor(player.role), 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  mr: 2
                }}>
                  {getPlayerIcon(player.role)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {player.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {player.preferredTeam?.name || 'No Team'}
                  </Typography>
                </Box>
              </Box>

              {/* Statistics - simplified */}
              <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', py: 1.5, bgcolor: '#f9fafb', borderRadius: 1, mb: 1.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1.1rem' }}>
                    {player.careerStats?.overall?.matchesPlayed || player.matchesPlayed || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    Matches
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#F59E0B', fontSize: '1.1rem' }}>
                    {player.careerStats?.batting?.runs || player.totalRuns || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    Runs
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#EF4444', fontSize: '1.1rem' }}>
                    {player.careerStats?.bowling?.wickets || player.totalWickets || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    Wickets
                  </Typography>
                </Box>
              </Box>

              {/* Average */}
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center' }}>
                Batting Avg: {player.careerStats?.batting?.average?.toFixed(2) || player.battingAverage?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );

  return (
    <>
      <BusyOverlay open={loading && players.length === 0} label="Loading players..." />
      
      {/* Mobile View */}
      {renderMobileView()}

      {/* Desktop View */}
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', maxWidth: { xs: '100%', md: 1280 }, mx: { xs: 0, md: 'auto' }, pb: { xs: 10, md: 4 }, width: '100%', display: { xs: 'none', md: 'block' } }}>
        
        {/* Filter Chips */}
        <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 1, md: 2 }, pb: { xs: 2, md: 3 }, bgcolor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.5 }, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label="All Players"
              onClick={() => setRoleFilter('All')}
              sx={{
                bgcolor: roleFilter === 'All' ? '#1e40af' : '#ffffff',
                color: roleFilter === 'All' ? '#ffffff' : '#64748b',
                fontWeight: roleFilter === 'All' ? 600 : 500,
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                height: { xs: 32, md: 36 },
                px: { xs: 0, md: 1 },
                borderRadius: '16px',
                cursor: 'pointer',
                '&:hover': { bgcolor: roleFilter === 'All' ? '#1e3a8a' : '#f1f5f9' },
                transition: 'all 0.2s ease',
              }}
            />
            <Chip
              label="Batsmen"
              onClick={() => setRoleFilter('Batsman')}
              sx={{
                bgcolor: roleFilter === 'Batsman' ? '#1e40af' : '#ffffff',
                color: roleFilter === 'Batsman' ? '#ffffff' : '#64748b',
                fontWeight: roleFilter === 'Batsman' ? 600 : 500,
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                height: { xs: 32, md: 36 },
                px: { xs: 0, md: 1 },
                borderRadius: '16px',
                cursor: 'pointer',
                '&:hover': { bgcolor: roleFilter === 'Batsman' ? '#1e3a8a' : '#f1f5f9' },
                transition: 'all 0.2s ease',
              }}
            />
            <Chip
              label="Bowlers"
              onClick={() => setRoleFilter('Bowler')}
              sx={{
                bgcolor: roleFilter === 'Bowler' ? '#1e40af' : '#ffffff',
                color: roleFilter === 'Bowler' ? '#ffffff' : '#64748b',
                fontWeight: roleFilter === 'Bowler' ? 600 : 500,
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                height: { xs: 32, md: 36 },
                px: { xs: 0, md: 1 },
                borderRadius: '16px',
                cursor: 'pointer',
                '&:hover': { bgcolor: roleFilter === 'Bowler' ? '#1e3a8a' : '#f1f5f9' },
                transition: 'all 0.2s ease',
              }}
            />
            <Chip
              label="All-rounders"
              onClick={() => setRoleFilter('All-rounder')}
              sx={{
                bgcolor: roleFilter === 'All-rounder' ? '#1e40af' : '#ffffff',
                color: roleFilter === 'All-rounder' ? '#ffffff' : '#64748b',
                fontWeight: roleFilter === 'All-rounder' ? 600 : 500,
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                height: { xs: 32, md: 36 },
                px: { xs: 0, md: 1 },
                borderRadius: '16px',
                cursor: 'pointer',
                '&:hover': { bgcolor: roleFilter === 'All-rounder' ? '#1e3a8a' : '#f1f5f9' },
                transition: 'all 0.2s ease',
              }}
            />
            <TextField
              placeholder="Search players..."
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
        <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 1, md: 0 }, pb: { xs: 2, md: 2 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

        {/* Alphabetical filtering */}
        <Box sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 2, p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Filter by Name {letterFilter !== 'All' && `(${letterFilter})`}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowLetterFilter(!showLetterFilter)}
              sx={{ ml: 1 }}
            >
              {showLetterFilter ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          {showLetterFilter && (
            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
              {['All', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))].map((letter) => (
                <Button
                  key={letter}
                  variant={letterFilter === letter ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setLetterFilter(letter)}
                  sx={{ 
                    minWidth: { xs: '32px', sm: '36px' }, 
                    height: { xs: '32px', sm: '36px' }, 
                    p: 0,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  {letter}
                </Button>
              ))}
            </Box>
          )}
        </Box>
        </Box>

      {/* Content */}
      {/* Desktop View - Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(380px, 1fr))' },
        gap: { xs: 2, sm: 2.5, md: 3 },
      }}>
        {renderGridView()}
      </Box>

      {/* Infinite Scroll Trigger */}
      {hasMore && !loading && players.length > 0 && (
        <Box 
          ref={observerTarget} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            py: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Scroll for more...
          </Typography>
        </Box>
      )}

      {/* Loading more indicator */}
      {loading && players.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
          <Typography variant="body2" color="text.secondary">
            Loading more players...
          </Typography>
        </Box>
      )}

      {filteredPlayers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 }, px: 2 }}>
          <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, mb: 1 }}>
            🔍
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            No players found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}
      </Box>
    </>
  );
};

export default PlayersList;