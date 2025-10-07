import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import { CricketApiService, type ApiMatch } from '../api/cricketApi';

const SummaryScore: React.FC<{ team: string; score: string; sub: string; align?: 'left' | 'right' }>
  = ({ team, score, sub, align = 'left' }) => (
  <Box sx={{ textAlign: align, minWidth: 120 }}>
    <Typography 
      variant="body1" 
      sx={{ 
        fontWeight: 700, 
        mb: 1,
        opacity: 0.9,
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      {team}
    </Typography>
    <Typography 
      variant="h4" 
      sx={{ 
        fontWeight: 900, 
        mb: 0.5,
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        letterSpacing: '-0.02em'
      }}
    >
      {score}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        opacity: 0.8,
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      {sub}
    </Typography>
  </Box>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }>
  = ({ title, children }) => (
  <Card sx={{ 
    mb: 2, 
    boxShadow: 2,
    borderRadius: 3,
    border: '1px solid rgba(0,0,0,0.08)',
    overflow: 'hidden'
  }}>
    <CardContent sx={{ p: 0 }}>
      <Box sx={{ 
        bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            color: '#1a237e',
            textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
);

const MatchDetails: React.FC = () => {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [tab, setTab] = React.useState(0);
  const [match, setMatch] = React.useState<ApiMatch | null>(null);
  const [innings, setInnings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMatchDetails = async () => {
      if (!matchId) {
        setError('Match ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const numericMatchId = parseInt(matchId, 10);
        if (isNaN(numericMatchId)) {
          setError('Invalid match ID');
          return;
        }

        // For now, we'll simulate fetching innings data
        // In a real implementation, you'd have an API endpoint for innings
        const matchData = await CricketApiService.getMatch(numericMatchId);
        if (!matchData) {
          setError('Match not found');
          return;
        }

        setMatch(matchData);

        // Fetch real innings data from API
        const inningsData = await CricketApiService.getInnings(numericMatchId);
        setInnings(inningsData);
      } catch (err) {
        setError('Failed to load match details. Please try again later.');
        console.error('Error fetching match details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [matchId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'live': return 'error';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'live': return 'Live';
      case 'scheduled': return 'Scheduled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!match) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Match not found</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="md" sx={{ pt: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Match Details</Typography>
        </Box>

        {/* Match Status */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip 
            label={getStatusLabel(match.status)} 
            color={getStatusColor(match.status) as any} 
            variant="filled"
            sx={{ 
              fontWeight: 700, 
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          />
        </Box>

        {/* Summary */}
        <Card sx={{ 
          mb: 1.5, 
          boxShadow: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 'inherit'
          }
        }}>
          <CardContent sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
            py: 3
          }}>
            <SummaryScore
              team={match.team1?.name || 'Team 1'}
              score={innings.length > 0 ? `${innings[0].totalRuns}/${innings[0].totalWickets}` : (match.team1Score ? `${match.team1Score}` : '0/0')}
              sub={innings.length > 0 ? `(${innings[0].totalOvers} overs)` : ''}
              align="left"
            />
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mx: 2
            }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 900, 
                  mb: 1,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                VS
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {match.venue}
              </Typography>
            </Box>
            <SummaryScore
              team={match.team2?.name || 'Team 2'}
              score={innings.length > 1 ? `${innings[1].totalRuns}/${innings[1].totalWickets}` : (match.team2Score ? `${match.team2Score}` : '0/0')}
              sub={innings.length > 1 ? `(${innings[1].totalOvers} overs)` : ''}
              align="right"
            />
          </CardContent>
        </Card>

        {/* Result */}
        {(match.winner || match.result?.winner) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip 
              label={`${match.winner || match.result?.winner} won${match.result?.margin ? ` by ${match.result.margin}` : ''}`} 
              color="success" 
              variant="filled" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '1rem',
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                border: '2px solid rgba(255,255,255,0.8)'
              }} 
            />
          </Box>
        )}

        {/* Match Information Card */}
        <Card sx={{
          mb: 2,
          boxShadow: 2,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SportsCricketIcon sx={{ fontSize: 24 }} />
              Match Information
            </Typography>

            {/* Match Information Cards - First Row */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
              {/* Date */}
              <Card sx={{ minWidth: 100, boxShadow: 0, bgcolor: '#f5f5f5' }}>
                <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    {new Date(match.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Typography>
                </CardContent>
              </Card>

              {/* Match Type */}
              <Card sx={{ minWidth: 100, boxShadow: 0, bgcolor: '#f5f5f5' }}>
                <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    {match.matchType}
                  </Typography>
                </CardContent>
              </Card>

              {/* Ground */}
              <Card sx={{ minWidth: 120, boxShadow: 0, bgcolor: '#f5f5f5' }}>
                <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Ground
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    {match.venue}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Additional Match Details - Second Row */}
            {(match.toss || match.bestBatsman || match.bestBowler) && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                {/* Toss */}
                {match.toss && (
                  <Card sx={{ minWidth: 120, boxShadow: 0, bgcolor: '#e3f2fd' }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Toss
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                        {match.toss.winner} won
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Chose to {match.toss.decision}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Best Batsman */}
                {match.bestBatsman && (
                  <Card sx={{ minWidth: 140, boxShadow: 0, bgcolor: '#e8f5e8' }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Best Batsman
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                        {match.bestBatsman.player?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {match.bestBatsman.runs} runs
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* Best Bowler */}
                {match.bestBowler && (
                  <Card sx={{ minWidth: 140, boxShadow: 0, bgcolor: '#ffebee' }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Best Bowler
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                        {match.bestBowler.player?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {match.bestBowler.wickets} wickets
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tab} 
            onChange={(_, v) => setTab(v)} 
            centered 
            sx={{ 
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                minHeight: 48,
                borderRadius: '8px 8px 0 0',
                mx: 1,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab label="Scorecard" />
            <Tab label="Commentary" />
          </Tabs>
        </Box>

        {/* Scorecard Tab */}
        {tab === 0 && (
          <>
            {innings.map((inning, index) => (
              <React.Fragment key={index}>
                <SectionCard title={`${inning.battingTeam} BATTING`}>
                  {/* Batting Table Header */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 0.8fr 0.8fr 0.6fr 0.6fr 0.8fr 2fr', 
                    gap: 1, 
                    mb: 2, 
                    pb: 1.5, 
                    borderBottom: '2px solid #e3f2fd',
                    bgcolor: '#f8f9fa',
                    p: 2,
                    borderRadius: 2,
                    mx: -3,
                    mt: -3
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#424242' }}>BATSMAN</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>R</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>B</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>4s</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>6s</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>SR</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#424242' }}>STATUS</Typography>
                  </Box>

                  {/* Batting Table Rows */}
                  <Box sx={{ display: 'grid', gap: 0.5 }}>
                    {inning.batsmen?.map((batsman: any, batsmanIndex: number) => {
                      const strikeRate = batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(2) : '0.00';
                      return (
                        <Box 
                          key={batsmanIndex} 
                          sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: '2fr 0.8fr 0.8fr 0.6fr 0.6fr 0.8fr 2fr', 
                            gap: 1, 
                            py: 1.5, 
                            px: 2,
                            alignItems: 'center',
                            bgcolor: batsmanIndex % 2 === 0 ? '#ffffff' : '#f8f9fa',
                            borderRadius: 1,
                            border: '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#e3f2fd',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#2c3e50' }}>
                            {batsman.player?.name || `Player ${batsmanIndex + 1}`}
                          </Typography>
                          <Typography sx={{ textAlign: 'center', fontWeight: 700, color: '#1976d2' }}>{batsman.runs || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', color: '#616161' }}>{batsman.balls || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', color: '#388e3c' }}>{batsman.fours || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', color: '#7b1fa2' }}>{batsman.sixes || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', color: '#f57c00' }}>{strikeRate}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: batsman.status === 'not out' ? '#388e3c' : '#d32f2f', fontWeight: 600 }}>
                            {batsman.status || 'not out'}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Divider sx={{ my: 3, borderColor: '#e3f2fd' }} />
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    p: 2,
                    bgcolor: '#e8f5e8',
                    borderRadius: 2,
                    border: '1px solid #c8e6c9'
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      Total: {inning.totalRuns}/{inning.totalWickets} ({inning.totalOvers} overs)
                    </Typography>
                  </Box>
                </SectionCard>

                <SectionCard title={`${inning.battingTeam === match.team1?.name ? match.team2?.name : match.team1?.name} BOWLING`}>
                  {/* Bowling Table Header */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 0.8fr 0.6fr 0.8fr 0.6fr 0.8fr', 
                    gap: 1, 
                    mb: 2, 
                    pb: 1.5, 
                    borderBottom: '2px solid #fce4ec',
                    bgcolor: '#fafafa',
                    p: 2,
                    borderRadius: 2,
                    mx: -3,
                    mt: -3
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#424242' }}>BOWLER</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>O</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>M</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>R</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>W</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', textAlign: 'center', color: '#424242' }}>ECON</Typography>
                  </Box>

                  {/* Bowling Table Rows */}
                  <Box sx={{ display: 'grid', gap: 0.5 }}>
                    {inning.bowlers?.map((bowler: any, bowlerIndex: number) => {
                      const economy = bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(2) : '0.00';
                      return (
                        <Box 
                          key={bowlerIndex} 
                          sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: '2fr 0.8fr 0.6fr 0.8fr 0.6fr 0.8fr', 
                            gap: 1, 
                            py: 1.5, 
                            px: 2,
                            alignItems: 'center',
                            bgcolor: bowlerIndex % 2 === 0 ? '#ffffff' : '#f8f9fa',
                            borderRadius: 1,
                            border: '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#fce4ec',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#2c3e50' }}>
                            {bowler.player?.name || bowler.playerName || `Bowler ${bowlerIndex + 1}`}
                          </Typography>
                          <Typography sx={{ textAlign: 'center', color: '#616161' }}>{bowler.overs || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', color: '#616161' }}>{bowler.maidens || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', color: '#f44336' }}>{bowler.runs || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', fontWeight: 700, color: '#d32f2f' }}>{bowler.wickets || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', color: '#ff9800' }}>{economy}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </SectionCard>

                {/* Fall of Wickets */}
                {inning.fallOfWickets && inning.fallOfWickets.length > 0 && (
                  <SectionCard title="FALL OF WICKETS">
                    <Box sx={{ display: 'grid', gap: 1 }}>
                      {inning.fallOfWickets.map((fow: any, fowIndex: number) => (
                        <Box 
                          key={fowIndex} 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            bgcolor: '#fff3e0',
                            borderRadius: 1,
                            border: '1px solid #ffe0b2',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#ffcc02',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            bgcolor: '#ff6f00',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700,
                            color: 'white',
                            fontSize: '0.875rem'
                          }}>
                            {fow.wicket}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#e65100' }}>
                              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.1em' }}>{fow.score}-{fow.wicket}</Box>
                              {' - '}
                              <Box component="span" sx={{ fontWeight: 600 }}>{fow.player || fow.playerName || fow.batsmanName}</Box>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fow.over} overs
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </SectionCard>
                )}
              </React.Fragment>
            ))}
          </>
        )}

        {/* Commentary Tab */}
        {tab === 1 && (
          <SectionCard title="MATCH COMMENTARY">
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
              mx: -3,
              mb: -3
            }}>
              <SportsCricketIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Live Commentary Coming Soon
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ball-by-ball updates and expert analysis will be available here during live matches.
              </Typography>
            </Box>
          </SectionCard>
        )}
      </Container>
    </Box>
  );
};

export default MatchDetails;


