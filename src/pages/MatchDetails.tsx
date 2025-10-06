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
import { CricketApiService, type ApiMatch } from '../api/cricketApi';

const SummaryScore: React.FC<{ team: string; score: string; sub: string; align?: 'left' | 'right' }>
  = ({ team, score, sub, align = 'left' }) => (
  <Box sx={{ textAlign: align }}>
    <Typography variant="caption" color="text.secondary">{team}</Typography>
    <Typography variant="h5" sx={{ fontWeight: 800 }}>{score}</Typography>
    <Typography variant="caption" color="text.secondary">{sub}</Typography>
  </Box>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }>
  = ({ title, children }) => (
  <Card sx={{ mb: 1.5, boxShadow: 1 }}>
    <CardContent>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
        {title}
      </Typography>
      <Divider sx={{ my: 1 }} />
      {children}
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
            sx={{ fontWeight: 600, fontSize: '0.9rem' }} 
          />
        </Box>

        {/* Summary */}
        <Card sx={{ mb: 1.5, boxShadow: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SummaryScore
              team={match.team1?.name || 'Team 1'}
              score={innings.length > 0 ? `${innings[0].totalRuns}/${innings[0].totalWickets}` : (match.team1Score ? `${match.team1Score}` : '0/0')}
              sub={innings.length > 0 ? `(${innings[0].totalOvers} overs)` : ''}
              align="left"
            />
            <Typography variant="caption" color="text.secondary">VS</Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Chip 
              label={`${match.winner || match.result?.winner} won${match.result?.margin ? ` by ${match.result.margin}` : ''}`} 
              color="primary" 
              variant="outlined" 
              sx={{ fontWeight: 600 }} 
            />
          </Box>
        )}

        {/* Match Information Card */}
        <Card sx={{ mb: 2, boxShadow: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Match Information</Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Date:</Typography>
                <Typography variant="body2">{new Date(match.scheduledDate).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Venue:</Typography>
                <Typography variant="body2">{match.venue}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Match Type:</Typography>
                <Typography variant="body2">{match.matchType}</Typography>
              </Box>
              {match.toss && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Toss:</Typography>
                  <Typography variant="body2">{match.toss.winner} won and chose to {match.toss.decision}</Typography>
                </Box>
              )}
              {match.bestBatsman && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Best Batsman:</Typography>
                  <Typography variant="body2">
                    {match.bestBatsman.player?.name} - {match.bestBatsman.runs} runs ({match.bestBatsman.balls} balls)
                  </Typography>
                </Box>
              )}
              {match.bestBowler && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Best Bowler:</Typography>
                  <Typography variant="body2">
                    {match.bestBowler.player?.name} - {match.bestBowler.wickets} wickets ({match.bestBowler.runs} runs)
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 1 }}>
          <Tab label="Scorecard" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="Commentary" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>

        {/* Scorecard Tab */}
        {tab === 0 && (
          <>
            {innings.map((inning, index) => (
              <React.Fragment key={index}>
                <SectionCard title={`${inning.battingTeam} BATTING`}>
                  {/* Batting Table Header */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.6fr 0.6fr 0.8fr 2fr', gap: 1, mb: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>BATSMAN</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>R</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>B</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>4s</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>6s</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>SR</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>STATUS</Typography>
                  </Box>

                  {/* Batting Table Rows */}
                  <Box sx={{ display: 'grid', gap: 0.5 }}>
                    {inning.batsmen?.map((batsman: any, batsmanIndex: number) => {
                      const strikeRate = batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(2) : '0.00';
                      return (
                        <Box key={batsmanIndex} sx={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.6fr 0.6fr 0.8fr 2fr', gap: 1, py: 0.5, alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {batsman.player?.name || `Player ${batsmanIndex + 1}`}
                          </Typography>
                          <Typography sx={{ textAlign: 'center', fontWeight: 600 }}>{batsman.runs || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{batsman.balls || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{batsman.fours || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{batsman.sixes || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{strikeRate}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{batsman.status || 'not out'}</Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                    Total: {inning.totalRuns}/{inning.totalWickets} ({inning.totalOvers} overs)
                  </Typography>
                </SectionCard>

                <SectionCard title={`${inning.battingTeam === match.team1?.name ? match.team2?.name : match.team1?.name} BOWLING`}>
                  {/* Bowling Table Header */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.6fr 0.8fr 0.6fr 0.8fr', gap: 1, mb: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>BOWLER</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>O</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>M</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>R</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>W</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>ECON</Typography>
                  </Box>

                  {/* Bowling Table Rows */}
                  <Box sx={{ display: 'grid', gap: 0.5 }}>
                    {inning.bowlers?.map((bowler: any, bowlerIndex: number) => {
                      const economy = bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(2) : '0.00';
                      return (
                        <Box key={bowlerIndex} sx={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.6fr 0.8fr 0.6fr 0.8fr', gap: 1, py: 0.5, alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {bowler.player?.name || bowler.playerName || `Bowler ${bowlerIndex + 1}`}
                          </Typography>
                          <Typography sx={{ textAlign: 'center' }}>{bowler.overs || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{bowler.maidens || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{bowler.runs || 0}</Typography>
                          <Typography sx={{ textAlign: 'center', fontWeight: 600 }}>{bowler.wickets || 0}</Typography>
                          <Typography sx={{ textAlign: 'center' }}>{economy}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </SectionCard>

                {/* Fall of Wickets */}
                {inning.fallOfWickets && inning.fallOfWickets.length > 0 && (
                  <SectionCard title="FALL OF WICKETS">
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      {inning.fallOfWickets.map((fow: any, fowIndex: number) => (
                        <Typography key={fowIndex} variant="body2" sx={{ fontSize: '0.875rem' }}>
                          <Box component="span" sx={{ fontWeight: 600 }}>{fow.score}-{fow.wicket}</Box>
                          {' ('}
                          <Box component="span" sx={{ fontWeight: 600 }}>{fow.player || fow.playerName || fow.batsmanName}</Box>
                          {', '}
                          <Box component="span" sx={{ fontWeight: 600 }}>{fow.over}</Box>
                          {' overs)'}
                        </Typography>
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
          <SectionCard title="Match Commentary">
            <Typography variant="body2" color="text.secondary">
              Commentary feature coming soon...
            </Typography>
          </SectionCard>
        )}
      </Container>
    </Box>
  );
};

export default MatchDetails;


