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

  // Match setup state
  const [setupDialog, setSetupDialog] = useState(false);
  const [totalOvers, setTotalOvers] = useState<number>(20);
  const [team1PlayingMembers, setTeam1PlayingMembers] = useState<string[]>([]);
  const [team2PlayingMembers, setTeam2PlayingMembers] = useState<string[]>([]);
  
  // Player pool state
  const [searchText, setSearchText] = useState('');
  const [alphabetFilter, setAlphabetFilter] = useState<string>('');

  // Result state
  const [matchWinner, setMatchWinner] = useState('');
  const [resultMargin, setResultMargin] = useState('');

  useEffect(() => {
    if (matchId) {
      loadMatch();
    }
  }, [matchId]);

  // Effect to load fresh match data when setup dialog opens
  useEffect(() => {
    console.log('useEffect triggered - setupDialog:', setupDialog, 'matchId:', matchId, 'match exists:', !!match);
    if (setupDialog && matchId && match) {
      console.log('Setup dialog opened, ensuring team data with players is loaded...');
      console.log('Match team1:', match.team1?.name, 'teamId:', match.team1?.teamId, 'id:', match.team1?.id);
      console.log('Match team2:', match.team2?.name, 'teamId:', match.team2?.teamId, 'id:', match.team2?.id);
      loadMatchWithTeams();
    } else if (setupDialog && matchId && !match) {
      console.log('Setup dialog opened but match data not loaded yet, waiting...');
    } else {
      console.log('useEffect conditions not met - setupDialog:', setupDialog, 'matchId:', matchId, 'match exists:', !!match);
    }
  }, [setupDialog, matchId]); // Keep match out of dependencies

  const loadMatchWithTeams = async () => {
    if (!match) {
      console.log('No match data available, cannot load teams');
      return;
    }

    try {
      console.log('Loading team players for setup dialog...');
      console.log('Current match data:', JSON.stringify(match, null, 2));
      console.log('Team1 data:', match.team1);
      console.log('Team2 data:', match.team2);
      
      // Fetch players for both teams using existing match data
      let team1Players: Array<{playerId: string, name: string, role: string}> = [];
      let team2Players: Array<{playerId: string, name: string, role: string}> = [];
      
      // Check for team1 ID (prefer displayId, then teamId, avoid internal id)
      let team1Id = match.team1?.displayId?.toString() || match.team1?.teamId;
      const isTeam1IdInternal = team1Id && team1Id.toString().match(/^\d{19,}$/);
      
      console.log('Team 1 ID check:', { 
        displayId: match.team1?.displayId,
        teamId: match.team1?.teamId, 
        id: match.team1?.id, 
        selected: team1Id,
        isInternal: isTeam1IdInternal 
      });
      
      if (team1Id && !isTeam1IdInternal) {
        console.log('Loading team 1 players for teamId:', team1Id);
        try {
          const playersResponse = await CricketApiService.getTeamPlayers(team1Id);
          console.log('Team 1 players API response:', playersResponse);
          if (playersResponse.success && playersResponse.data) {
            team1Players = playersResponse.data.map(player => ({
              // Include all player data for stats display
              ...player,
              // Override with our mapping
              playerId: player.id,
              id: player.id,
              displayId: player.displayId,
              finalImpactScore: 0
            }));
            console.log('Team 1 players loaded:', team1Players.length, 'players', team1Players);
          } else {
            console.log('Team 1 players API call failed or returned no data:', playersResponse);
          }
        } catch (error) {
          console.error('Error loading team 1 players:', error);
        }
      } else {
        console.log('No valid team1 ID found or ID is internal - displayId:', match.team1?.displayId, 'teamId:', match.team1?.teamId, 'id:', match.team1?.id);
      }
      
      // Check for team2 ID (prefer displayId, then teamId, avoid internal id)
      let team2Id = match.team2?.displayId?.toString() || match.team2?.teamId;
      const isTeam2IdInternal = team2Id && team2Id.toString().match(/^\d{19,}$/);
      
      console.log('Team 2 ID check:', { 
        displayId: match.team2?.displayId,
        teamId: match.team2?.teamId, 
        id: match.team2?.id, 
        selected: team2Id,
        isInternal: isTeam2IdInternal 
      });
      
      if (team2Id && !isTeam2IdInternal) {
        console.log('Loading team 2 players for teamId:', team2Id);
        try {
          const playersResponse = await CricketApiService.getTeamPlayers(team2Id);
          console.log('Team 2 players API response:', playersResponse);
          if (playersResponse.success && playersResponse.data) {
            team2Players = playersResponse.data.map(player => ({
              // Include all player data for stats display
              ...player,
              // Override with our mapping
              playerId: player.id,
              id: player.id,
              displayId: player.displayId,
              finalImpactScore: 0
            }));
            console.log('Team 2 players loaded:', team2Players.length, 'players', team2Players);
          } else {
            console.log('Team 2 players API call failed or returned no data:', playersResponse);
          }
        } catch (error) {
          console.error('Error loading team 2 players:', error);
        }
      } else {
        console.log('No valid team2 ID found or ID is internal - displayId:', match.team2?.displayId, 'teamId:', match.team2?.teamId, 'id:', match.team2?.id);
      }
      
      // Update match data with players
      const updatedMatchData = {
        ...match,
        team1: match.team1 ? {
          ...match.team1,
          players: team1Players
        } : match.team1,
        team2: match.team2 ? {
          ...match.team2,
          players: team2Players
        } : match.team2
      };
      
      console.log('Updated match data with players - team1:', team1Players.length, 'team2:', team2Players.length);
      setMatch(updatedMatchData);

      // Initialize setup state with existing data
      if (match.totalOvers) {
        setTotalOvers(match.totalOvers);
      }
      // Don't auto-populate playing members - let user select them manually
      // Players will be selected one by one from the available pool
    } catch (error) {
      console.error('Error loading team players:', error);
      setSnackbar({ open: true, message: 'Error loading team players', severity: 'error' });
    }
  };

  const loadMatch = async () => {
    try {
      console.log('Loading match with ID:', matchId, 'parsed as:', parseInt(matchId!));
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      
      const matchData = await CricketApiService.getMatch(parseInt(matchId!));
      console.log('API response received:', matchData);
      
      if (matchData) {
        console.log('Loaded match data:', matchData);
        console.log('Team 1:', matchData.team1);
        console.log('Team 2:', matchData.team2);
        setMatch(matchData);

        // Initialize setup state with existing data
        if (matchData.totalOvers) {
          setTotalOvers(matchData.totalOvers);
        }
        // Initialize playing members from team's players array
        if (matchData.team1?.players) {
          setTeam1PlayingMembers(matchData.team1.players.map(p => p.playerId));
        }
        if (matchData.team2?.players) {
          setTeam2PlayingMembers(matchData.team2.players.map(p => p.playerId));
        }

        // Load existing innings if any - convert ApiInning to InningData format
        if (matchData.innings) {
          // For now, just set empty innings since the data format is different
          setInnings([]);
          if (matchData.currentInnings && matchData.innings[matchData.currentInnings - 1]) {
            // Convert ApiInning to InningData if needed
            setCurrentInning(null);
          }
        }
      } else {
        console.log('No match data received from API');
        setSnackbar({ open: true, message: 'Match not found', severity: 'error' });
      }
    } catch (error) {
      console.error('Error loading match:', error);
      setSnackbar({ open: true, message: `Failed to load match: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const startInning = async (teamName: string) => {
    if (!match) return;

    try {
      // Find the batting team
      const battingTeam = match.team1?.name === teamName ? match.team1 : match.team2;
      const bowlingTeam = match.team1?.name === teamName ? match.team2 : match.team1;

      if (!battingTeam || !bowlingTeam) {
        setSnackbar({ open: true, message: 'Team data not found', severity: 'error' });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scoring/start-inning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          matchId: parseInt(matchId!),
          battingTeamId: battingTeam.teamId || battingTeam.id,
          bowlingTeamId: bowlingTeam.teamId || bowlingTeam.id,
          inningNumber: innings.length + 1,
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to start inning');
      }
    } catch (error) {
      console.error('Error starting inning:', error);
      setSnackbar({ open: true, message: `Failed to start inning: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' });
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

  const saveToss = async () => {
    if (!match) return;

    try {
      const updateData = {
        toss: {
          winner: tossWinner,
          decision: tossDecision,
        },
      };
      console.log('Saving toss with data:', updateData);
      
      await CricketApiService.updateMatch(parseInt(matchId!), updateData);
      console.log('Toss saved successfully');
      
      setSnackbar({ open: true, message: 'Toss recorded successfully', severity: 'success' });
      setTossDialog(false);
      
      // Reload match data to update UI state
      await loadMatch();
      
      // Wait a bit for state to update, then check if match setup is needed
      setTimeout(async () => {
        // Reload match data again to ensure we have the latest data
        await loadMatch();
        
        // Now check the updated state
        const currentMatch = await CricketApiService.getMatch(parseInt(matchId!));
        console.log('Match data after toss:', {
          hasToss: !!currentMatch?.toss,
          totalOvers: currentMatch?.totalOvers,
          team1Players: currentMatch?.team1?.players?.length || 0,
          team2Players: currentMatch?.team2?.players?.length || 0,
          team1PlayingMembers: team1PlayingMembers,
          team2PlayingMembers: team2PlayingMembers
        });
        if (currentMatch && currentMatch.toss && (!currentMatch.totalOvers || !currentMatch.team1?.players?.length || !currentMatch.team2?.players?.length)) {
          console.log('Opening setup dialog');
          setSetupDialog(true);
        }
      }, 500);
    } catch (error) {
      console.error('Error saving toss:', error);
      setSnackbar({ open: true, message: 'Failed to save toss', severity: 'error' });
    }
  };

  const saveMatchSetup = async () => {
    if (!match) return;

    try {
      const team1IdForSquad = match.team1?.displayId?.toString() || match.team1?.teamId || match.team1?.id || 'team1';
      const team2IdForSquad = match.team2?.displayId?.toString() || match.team2?.teamId || match.team2?.id || 'team2';
      
      const updateData = {
        totalOvers: totalOvers,
        squads: {
          [team1IdForSquad]: {
            teamId: team1IdForSquad,
            players: team1PlayingMembers.map(playerId => {
              const player = match.team1?.players?.find(p => p.playerId === playerId);
              return player ? {
                playerId: (player as any).displayId || (player as any).numericId?.toString() || player.playerId,
                name: player.name,
                role: player.role
              } : null;
            }).filter((p): p is { playerId: string; name: string; role: string } => p !== null)
          },
          [team2IdForSquad]: {
            teamId: team2IdForSquad,
            players: team2PlayingMembers.map(playerId => {
              const player = match.team2?.players?.find(p => p.playerId === playerId);
              return player ? {
                playerId: (player as any).displayId || (player as any).numericId?.toString() || player.playerId,
                name: player.name,
                role: player.role
              } : null;
            }).filter((p): p is { playerId: string; name: string; role: string } => p !== null)
          }
        }
      };

      console.log('Update data being sent:', JSON.stringify(updateData, null, 2));
      
      await CricketApiService.updateMatch(parseInt(matchId!), updateData);
      setSnackbar({ open: true, message: 'Match setup saved successfully', severity: 'success' });
      setSetupDialog(false);
      // Reload match data to update UI state
      await loadMatch();
    } catch (error) {
      console.error('Error saving match setup:', error);
      setSnackbar({ open: true, message: 'Failed to save match setup', severity: 'error' });
    }
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
              {match.toss && (!match.totalOvers || !match.team1?.players?.length || !match.team2?.players?.length) && (
                <Button variant="outlined" onClick={() => setSetupDialog(true)}>
                  Complete Setup
                </Button>
              )}
              {/* Debug button - remove this later */}
              <Button variant="text" size="small" onClick={() => setSetupDialog(true)} sx={{ fontSize: '0.7rem' }}>
                Debug Setup
              </Button>
              {match.status === 'scheduled' && match.toss && match.totalOvers && match.team1?.players?.length && match.team2?.players?.length && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => startInning(match.team1?.name || '')}
                >
                  Start Match
                </Button>
              )}
              {match.status === 'live' && match.toss && match.totalOvers && match.team1?.players?.length && match.team2?.players?.length && !currentInning && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => startInning(match.toss!.decision === 'bat' ? match.toss!.winner : (match.toss!.winner === match.team1?.name ? match.team2?.name : match.team1?.name) || '')}
                >
                  Start Innings
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

      {/* Match Setup Dialog */}
      <Dialog open={setupDialog} onClose={() => setSetupDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Match Setup</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Match Configuration</Typography>
          
          <TextField
            fullWidth
            type="number"
            label="Total Overs"
            value={totalOvers}
            onChange={(e) => setTotalOvers(parseInt(e.target.value) || 20)}
            sx={{ mb: 3 }}
            inputProps={{ min: 1, max: 50 }}
          />

          <Typography variant="h6" sx={{ mb: 2 }}>Playing Members Selection</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Search and filter players, then assign them to Team 1 or Team 2 playing XI.
          </Typography>
          
          {/* Player Pool Section */}
          <Box sx={{ mb: 3 }}>
            {/* Search and Filter */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by player name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              {/* Alphabet Filter */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                <Button 
                  size="small" 
                  variant={alphabetFilter === '' ? 'contained' : 'outlined'}
                  onClick={() => setAlphabetFilter('')}
                  sx={{ minWidth: 40, px: 1 }}
                >
                  All
                </Button>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                  <Button
                    key={letter}
                    size="small"
                    variant={alphabetFilter === letter ? 'contained' : 'outlined'}
                    onClick={() => setAlphabetFilter(letter)}
                    sx={{ minWidth: 40, px: 1 }}
                  >
                    {letter}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Player Pool List */}
            <Box sx={{ 
              maxHeight: 300, 
              overflow: 'auto', 
              border: '1px solid #ccc', 
              borderRadius: 1, 
              bgcolor: '#fafafa',
              mb: 3
            }}>
              <Typography variant="subtitle2" sx={{ p: 1.5, bgcolor: '#e0e0e0', fontWeight: 'bold' }}>
                Available Players
              </Typography>
              {(() => {
                // Combine all players from both teams
                const allPlayers = [
                  ...(match?.team1?.players || []).map((p: any) => ({ ...p, sourceTeam: match?.team1?.name })),
                  ...(match?.team2?.players || []).map((p: any) => ({ ...p, sourceTeam: match?.team2?.name }))
                ];

                // Deduplicate players based on playerId
                const uniquePlayers = allPlayers.reduce((acc: any[], player: any) => {
                  const playerId = player.playerId || player.id;
                  const exists = acc.find(p => (p.playerId || p.id) === playerId);
                  if (!exists) {
                    acc.push(player);
                  }
                  return acc;
                }, []);

                // Apply filters
                let filteredPlayers = uniquePlayers.filter((player: any) => {
                  const playerId = player.playerId || player.id;
                  const isAlreadySelected = team1PlayingMembers.includes(playerId) || team2PlayingMembers.includes(playerId);
                  
                  // Don't show already selected players
                  if (isAlreadySelected) return false;
                  
                  // Apply search filter
                  if (searchText && !player.name.toLowerCase().includes(searchText.toLowerCase())) {
                    return false;
                  }
                  
                  // Apply alphabet filter
                  if (alphabetFilter && !player.name.toUpperCase().startsWith(alphabetFilter)) {
                    return false;
                  }
                  
                  return true;
                });

                // Sort by name
                filteredPlayers.sort((a: any, b: any) => a.name.localeCompare(b.name));

                return filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player: any) => {
                    const playerId = player.playerId || player.id;
                    // Debug: Log player data structure
                    if (filteredPlayers.indexOf(player) === 0) {
                      console.log('Sample player data:', player);
                      console.log('Player careerStats:', player.careerStats);
                    }
                    return (
                      <Box 
                        key={playerId}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 1.5,
                          borderBottom: '1px solid #e0e0e0',
                          '&:hover': { bgcolor: '#f5f5f5' }
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {player.name}
                            </Typography>
                            {/* Impact Score - Prominent Display */}
                            {(player.finalImpactScore !== undefined || player.impactScore !== undefined) && (
                              <Chip 
                                label={`★ ${(player.finalImpactScore || player.impactScore || 0).toFixed(1)}`}
                                size="small"
                                color="success"
                                sx={{ 
                                  height: 24, 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700,
                                  bgcolor: '#4caf50',
                                  color: 'white'
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {player.role} • From {player.sourceTeam}
                          </Typography>
                          
                          {/* Player Statistics */}
                          <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                            {/* Batting Stats */}
                            {player.careerStats?.batting && (
                              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976d2' }}>BAT:</Typography>
                                <Chip 
                                  label={`Mat: ${player.careerStats.batting.matchesPlayed || 0}`}
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  label={`Runs: ${player.careerStats.batting.runs || 0}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  label={`Avg: ${player.careerStats.batting.average?.toFixed(1) || '0.0'}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  label={`SR: ${player.careerStats.batting.strikeRate?.toFixed(1) || '0.0'}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                {player.careerStats.batting.centuries > 0 && (
                                  <Chip 
                                    label={`100s: ${player.careerStats.batting.centuries}`}
                                    size="small"
                                    color="success"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                                {player.careerStats.batting.fifties > 0 && (
                                  <Chip 
                                    label={`50s: ${player.careerStats.batting.fifties}`}
                                    size="small"
                                    color="info"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            )}
                            
                            {/* Bowling Stats */}
                            {player.careerStats?.bowling && player.careerStats.bowling.wickets > 0 && (
                              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#9c27b0' }}>BOWL:</Typography>
                                <Chip 
                                  label={`Wkts: ${player.careerStats.bowling.wickets || 0}`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  label={`Avg: ${player.careerStats.bowling.average?.toFixed(1) || '0.0'}`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  label={`Econ: ${player.careerStats.bowling.economyRate?.toFixed(2) || '0.00'}`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                {player.careerStats.bowling.fiveWicketHauls > 0 && (
                                  <Chip 
                                    label={`5W: ${player.careerStats.bowling.fiveWicketHauls}`}
                                    size="small"
                                    color="warning"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            )}
                            
                            {/* Show overall stats if no detailed stats available */}
                            {!player.careerStats?.batting && !player.careerStats?.bowling && player.careerStats?.overall && (
                              <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Chip 
                                  label={`Matches: ${player.careerStats.overall.matchesPlayed || 0}`}
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Chip 
                                  label={`Wins: ${player.careerStats.overall.wins || 0}`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, ml: 2, flexDirection: 'column' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              if (team1PlayingMembers.length < 11) {
                                setTeam1PlayingMembers(prev => [...prev, playerId]);
                              }
                            }}
                            disabled={team1PlayingMembers.length >= 11}
                            sx={{ whiteSpace: 'nowrap', minWidth: 100 }}
                          >
                            {match?.team1?.name || 'Team 1'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              if (team2PlayingMembers.length < 11) {
                                setTeam2PlayingMembers(prev => [...prev, playerId]);
                              }
                            }}
                            disabled={team2PlayingMembers.length >= 11}
                            sx={{ whiteSpace: 'nowrap', minWidth: 100 }}
                          >
                            {match?.team2?.name || 'Team 2'}
                          </Button>
                        </Box>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    {searchText || alphabetFilter ? 'No players match your filters' : 'No available players'}
                  </Typography>
                );
              })()}
            </Box>
          </Box>

          {/* Selected Playing XI Display */}
          <Typography variant="h6" sx={{ mb: 2 }}>Selected Playing XI</Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Team 1 Playing XI */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {match?.team1?.name}
                </Typography>
                <Chip 
                  label={`${team1PlayingMembers.length}/11`}
                  size="small" 
                  color={team1PlayingMembers.length === 11 ? "success" : "default"}
                />
              </Box>
              <Box sx={{ 
                minHeight: 200,
                maxHeight: 300, 
                overflow: 'auto', 
                border: '2px solid #1976d2', 
                borderRadius: 1, 
                bgcolor: '#e3f2fd',
                p: 1
              }}>
                {team1PlayingMembers.length > 0 ? (
                  team1PlayingMembers.map((playerId, index) => {
                    // Find player from either team
                    const player = [...(match?.team1?.players || []), ...(match?.team2?.players || [])]
                      .find((p: any) => (p.playerId || p.id) === playerId);
                    
                    if (!player) return null;
                    
                    return (
                      <Box 
                        key={playerId}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          mb: 0.5,
                          bgcolor: 'white',
                          borderRadius: 1,
                          border: '1px solid #90caf9'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={index + 1} size="small" sx={{ minWidth: 30 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {player.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {player.role}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => setTeam1PlayingMembers(prev => prev.filter(id => id !== playerId))}
                        >
                          <Stop fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No players selected
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Team 2 Playing XI */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {match?.team2?.name}
                </Typography>
                <Chip 
                  label={`${team2PlayingMembers.length}/11`}
                  size="small" 
                  color={team2PlayingMembers.length === 11 ? "success" : "default"}
                />
              </Box>
              <Box sx={{ 
                minHeight: 200,
                maxHeight: 300, 
                overflow: 'auto', 
                border: '2px solid #9c27b0', 
                borderRadius: 1, 
                bgcolor: '#f3e5f5',
                p: 1
              }}>
                {team2PlayingMembers.length > 0 ? (
                  team2PlayingMembers.map((playerId, index) => {
                    // Find player from either team
                    const player = [...(match?.team1?.players || []), ...(match?.team2?.players || [])]
                      .find((p: any) => (p.playerId || p.id) === playerId);
                    
                    if (!player) return null;
                    
                    return (
                      <Box 
                        key={playerId}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          mb: 0.5,
                          bgcolor: 'white',
                          borderRadius: 1,
                          border: '1px solid #ce93d8'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={index + 1} size="small" sx={{ minWidth: 30 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {player.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {player.role}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => setTeam2PlayingMembers(prev => prev.filter(id => id !== playerId))}
                        >
                          <Stop fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No players selected
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSetupDialog(false)}>Cancel</Button>
          <Button onClick={saveMatchSetup} variant="contained">Save Setup</Button>
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