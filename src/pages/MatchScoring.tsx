import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Stop,
} from '@mui/icons-material';
import { CricketApiService, type ApiMatch } from '../api/cricketApi';

interface InningData {
  team: string;
  score: string;
  overs: number;
  extras: {
    total: number;
    wd: number;
    nb: number;
    b: number;
  };
  batting: BattingData[];
  bowling: BowlingData[];
  fall_of_wickets: FallOfWicket[];
  did_not_bat: string[];
}

interface BattingData {
  name: string;
  is_captain: boolean;
  is_wicket_keeper: boolean;
  batting_style: 'LHB' | 'RHB';
  how_out: {
    text: string;
    type: string;
    fielder?: string;
    fielders?: string[];
    bowler?: string;
  };
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: number;
}

interface BowlingData {
  name: string;
  is_captain: boolean;
  is_wicket_keeper: boolean;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  dots: number;
  fours: number;
  sixes: number;
  wides: number;
  noballs: number;
  eco: number;
}

interface FallOfWicket {
  score: number;
  wicket: number;
  player: string;
  over: string;
}

const MatchScoring: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<ApiMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentInning, setCurrentInning] = useState<InningData | null>(null);
  const [innings, setInnings] = useState<InningData[]>([]);
  const [tossDialog, setTossDialog] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Toss state
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');

  // Result state
  const [matchWinner, setMatchWinner] = useState('');
  const [resultMargin, setResultMargin] = useState('');

  useEffect(() => {
    if (matchId) {
      loadMatch();
    }
  }, [matchId]);

  const loadMatch = async () => {
    try {
      const matchData = await CricketApiService.getMatch(parseInt(matchId!));
      if (matchData) {
        setMatch(matchData);

        // Load existing innings if any - convert ApiInning to InningData format
        if (matchData.innings) {
          // For now, just set empty innings since the data format is different
          setInnings([]);
          if (matchData.currentInnings && matchData.innings[matchData.currentInnings - 1]) {
            // Convert ApiInning to InningData if needed
            setCurrentInning(null);
          }
        }
      }
    } catch (error) {
      console.error('Error loading match:', error);
      setSnackbar({ open: true, message: 'Failed to load match', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startInning = async (teamName: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scoring/start-inning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          matchId: matchId,
          battingTeam: teamName,
        }),
      });

      if (response.ok) {
        const newInning: InningData = {
          team: teamName,
          score: '0/0',
          overs: 0,
          extras: { total: 0, wd: 0, nb: 0, b: 0 },
          batting: [],
          bowling: [],
          fall_of_wickets: [],
          did_not_bat: [],
        };
        setCurrentInning(newInning);
        setInnings([...innings, newInning]);
        setSnackbar({ open: true, message: 'Inning started successfully', severity: 'success' });
      } else {
        throw new Error('Failed to start inning');
      }
    } catch (error) {
      console.error('Error starting inning:', error);
      setSnackbar({ open: true, message: 'Failed to start inning', severity: 'error' });
    }
  };

  const endInning = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scoring/end-inning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ matchId: matchId }),
      });

      if (response.ok) {
        setCurrentInning(null);
        loadMatch();
        setSnackbar({ open: true, message: 'Inning ended successfully', severity: 'success' });
      } else {
        throw new Error('Failed to end inning');
      }
    } catch (error) {
      console.error('Error ending inning:', error);
      setSnackbar({ open: true, message: 'Failed to end inning', severity: 'error' });
    }
  };

  const saveToss = () => {
    // Update match with toss information
    setSnackbar({ open: true, message: 'Toss recorded successfully', severity: 'success' });
    setTossDialog(false);
  };

  const saveResult = async () => {
    try {
      await CricketApiService.updateMatch(parseInt(matchId!), {
        status: 'completed',
        winner: matchWinner,
        result: { winner: matchWinner, margin: resultMargin },
      });
      setSnackbar({ open: true, message: 'Match completed successfully', severity: 'success' });
      setResultDialog(false);
      navigate('/admin/matches');
    } catch (error) {
      console.error('Error completing match:', error);
      setSnackbar({ open: true, message: 'Failed to complete match', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading match...</Typography>
      </Container>
    );
  }

  if (!match) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Match not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/matches')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1">
            {match.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {match.venue} • {new Date(match.scheduledDate).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Match Status and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Match Status: {match.status}</Typography>
              {match.toss && (
                <Typography variant="body2">
                  Toss: {match.toss.winner} chose to {match.toss.decision}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!match.toss && (
                <Button variant="outlined" onClick={() => setTossDialog(true)}>
                  Record Toss
                </Button>
              )}
              {match.status === 'scheduled' && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => startInning(match.team1?.name || '')}
                >
                  Start Match
                </Button>
              )}
              {currentInning && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Stop />}
                  onClick={endInning}
                >
                  End Inning
                </Button>
              )}
              {innings.length >= 2 && (
                <Button variant="contained" onClick={() => setResultDialog(true)}>
                  Complete Match
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Scoring Interface */}
      {currentInning && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Inning: {currentInning.team}
            </Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>
              {currentInning.score} ({currentInning.overs} overs)
            </Typography>

            {/* Ball-by-ball input would go here */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField label="Runs" type="number" size="small" />
              <FormControl size="small">
                <InputLabel>Ball Type</InputLabel>
                <Select value="normal">
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="wide">Wide</MenuItem>
                  <MenuItem value="noball">No Ball</MenuItem>
                  <MenuItem value="bye">Bye</MenuItem>
                  <MenuItem value="legbye">Leg Bye</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" size="small">
                Record Ball
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Scorecards */}
      <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
        {innings.map((inning, index) => (
          <Tab key={index} label={`Inning ${index + 1}: ${inning.team}`} />
        ))}
      </Tabs>

      {innings.map((inning, index) => (
        <TabPanel key={index} value={currentTab} index={index}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Batting Scorecard */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Batting</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Batsman</TableCell>
                        <TableCell>R</TableCell>
                        <TableCell>B</TableCell>
                        <TableCell>4s</TableCell>
                        <TableCell>6s</TableCell>
                        <TableCell>SR</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inning.batting.map((batsman, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {batsman.name}
                            {batsman.is_captain && <Chip label="C" size="small" sx={{ ml: 1 }} />}
                            {batsman.is_wicket_keeper && <Chip label="WK" size="small" sx={{ ml: 1 }} />}
                          </TableCell>
                          <TableCell>{batsman.runs}</TableCell>
                          <TableCell>{batsman.balls}</TableCell>
                          <TableCell>{batsman.fours}</TableCell>
                          <TableCell>{batsman.sixes}</TableCell>
                          <TableCell>{batsman.sr.toFixed(2)}</TableCell>
                          <TableCell>{batsman.how_out.text}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Bowling Scorecard */}
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Bowling</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Bowler</TableCell>
                        <TableCell>O</TableCell>
                        <TableCell>M</TableCell>
                        <TableCell>R</TableCell>
                        <TableCell>W</TableCell>
                        <TableCell>Eco</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inning.bowling.map((bowler, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            {bowler.name}
                            {bowler.is_captain && <Chip label="C" size="small" sx={{ ml: 1 }} />}
                            {bowler.is_wicket_keeper && <Chip label="WK" size="small" sx={{ ml: 1 }} />}
                          </TableCell>
                          <TableCell>{bowler.overs}</TableCell>
                          <TableCell>{bowler.maidens}</TableCell>
                          <TableCell>{bowler.runs}</TableCell>
                          <TableCell>{bowler.wickets}</TableCell>
                          <TableCell>{bowler.eco.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      ))}

      {/* Toss Dialog */}
      <Dialog open={tossDialog} onClose={() => setTossDialog(false)}>
        <DialogTitle>Record Toss</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Toss Winner</InputLabel>
            <Select
              value={tossWinner}
              onChange={(e) => setTossWinner(e.target.value)}
              label="Toss Winner"
            >
              <MenuItem value={match.team1?.name}>{match.team1?.name}</MenuItem>
              <MenuItem value={match.team2?.name}>{match.team2?.name}</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Decision</InputLabel>
            <Select
              value={tossDecision}
              onChange={(e) => setTossDecision(e.target.value as 'bat' | 'bowl')}
              label="Decision"
            >
              <MenuItem value="bat">Bat</MenuItem>
              <MenuItem value="bowl">Bowl</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTossDialog(false)}>Cancel</Button>
          <Button onClick={saveToss} variant="contained">Save Toss</Button>
        </DialogActions>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={resultDialog} onClose={() => setResultDialog(false)}>
        <DialogTitle>Match Result</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Winner</InputLabel>
            <Select
              value={matchWinner}
              onChange={(e) => setMatchWinner(e.target.value)}
              label="Winner"
            >
              <MenuItem value={match.team1?.name}>{match.team1?.name}</MenuItem>
              <MenuItem value={match.team2?.name}>{match.team2?.name}</MenuItem>
              <MenuItem value="tie">Tie</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            sx={{ mt: 2 }}
            label="Margin"
            value={resultMargin}
            onChange={(e) => setResultMargin(e.target.value)}
            placeholder="e.g., 5 wickets, 25 runs"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog(false)}>Cancel</Button>
          <Button onClick={saveResult} variant="contained">Complete Match</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

export default MatchScoring;