import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import MobileSplash from './components/MobileSplash';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import MatchesList from './pages/MatchesList';
import MatchDetails from './pages/MatchDetails';
import MatchesManagement from './pages/MatchesManagement';
import MatchScoring from './pages/MatchScoring';
import PlayersList from './pages/PlayersList';
import TeamsList from './pages/TeamsList';
import TeamDetails from './pages/TeamDetails';
import PlayerDetails from './pages/PlayerDetails';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import SiteLayout from './components/SiteLayout';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/mobile" element={<MobileSplash />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/matches"
                element={
                  <ProtectedRoute requireAdmin>
                    <MatchesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/matches/:matchId/score"
                element={
                  <ProtectedRoute requireAdmin>
                    <MatchScoring />
                  </ProtectedRoute>
                }
              />
              <Route path="/matches" element={<MatchesList />} />
              <Route path="/matches/:matchId" element={<MatchDetails />} />
              <Route path="/teams" element={<TeamsList />} />
              <Route path="/teams/:teamId" element={<TeamDetails />} />
              <Route path="/players" element={<PlayersList />} />
              <Route path="/players/:playerId" element={<PlayerDetails />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;