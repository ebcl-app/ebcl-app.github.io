import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import LandingPage from './components/LandingPage';
import MobileSplash from './components/MobileSplash';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import MatchesList from './pages/MatchesList';
import MatchDetails from './pages/MatchDetails';
import PlayersList from './pages/PlayersList';
import TeamsList from './pages/TeamsList';
import TeamDetails from './pages/TeamDetails';
import PlayerDetails from './pages/PlayerDetails';
import SiteLayout from './components/SiteLayout';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/mobile" element={<MobileSplash />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/matches" element={<MatchesList />} />
            <Route path="/matches/:matchId" element={<MatchDetails />} />
            <Route path="/teams" element={<TeamsList />} />
            <Route path="/teams/:teamId" element={<TeamDetails />} />
            <Route path="/players" element={<PlayersList />} />
            <Route path="/players/:playerId" element={<PlayerDetails />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;