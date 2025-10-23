import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { SplashProvider, useSplash } from './contexts/SplashContext';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import MatchesList from './pages/MatchesList';
import MatchDetails from './pages/MatchDetails';
import MatchesManagement from './pages/MatchesManagement';
import MatchScoring from './pages/MatchScoring';
import PlayersList from './pages/PlayersList';
import TeamsList from './pages/TeamsList';
import TeamDetails from './pages/TeamDetails';
import PlayerDetails from './pages/PlayerDetails';
import News from './pages/News';
import AuctionManagement from './pages/AuctionManagement';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import SiteLayout from './components/SiteLayout';

const illustrationSrc = '/logo.png';

const SplashScreen = () => (
  <Box
    sx={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
    }}
  >
    <Box
      component="img"
      src={illustrationSrc}
      alt="Cricket illustration"
      sx={{ width: '75%', maxWidth: 280, filter: 'drop-shadow(0 12px 24px rgba(15, 23, 42, 0.35))' }}
      onError={(e: any) => {
        if (e.currentTarget && e.currentTarget.src.indexOf('logo.png') !== -1) {
          e.currentTarget.src = '/landingpage-512x512.png';
        }
      }}
    />
  </Box>
);

const AppContent = () => {
  const { showSplash } = useSplash();

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Dashboard />} />
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
        <Route
          path="/admin/auction"
          element={
            <ProtectedRoute requireAdmin>
              <AuctionManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/matches" element={<MatchesList />} />
        <Route path="/matches/:matchId" element={<MatchDetails />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/teams" element={<TeamsList />} />
        <Route path="/teams/:teamId" element={<TeamDetails />} />
        <Route path="/players" element={<PlayersList />} />
        <Route path="/players/:playerId" element={<PlayerDetails />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<News />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SplashProvider>
          <Router>
            <AppContent />
          </Router>
        </SplashProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
