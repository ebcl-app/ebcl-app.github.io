
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import MatchSetup from './pages/MatchSetup';
import Scoring from './pages/Scoring';
import Scoreboard from './pages/Scoreboard';
import WaitingList from './pages/WaitingList';
import MatchRegistration from './pages/MatchRegistration';
import BattingView from './pages/BattingView';
import BowlingView from './pages/BowlingView';
import PlayerRegistration from './pages/PlayerRegistration';
import MatchManagement from './pages/MatchManagement';
import MatchDetails from './pages/MatchDetails';
import PlayerManagement from './pages/PlayerManagement';
import StartMatch from './pages/StartMatch';

// Get the basename from the homepage URL for GitHub Pages compatibility
const getBasename = () => {
  const homepage = process.env.PUBLIC_URL || '';
  return homepage;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router basename={getBasename()}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team-management" element={<TeamManagement />} />
            <Route path="/match-setup" element={<MatchSetup />} />
            <Route path="/start-match" element={<StartMatch />} />
            <Route path="/match-registration" element={<MatchRegistration />} />
            <Route path="/match-management" element={<MatchManagement />} />
            <Route path="/match-details/:matchId" element={<MatchDetails />} />
            <Route path="/player-registration" element={<PlayerRegistration />} />
            <Route path="/player-management" element={<PlayerManagement />} />
            <Route path="/scoring" element={<Scoring />} />
            <Route path="/batting-view" element={<BattingView />} />
            <Route path="/bowling-view" element={<BowlingView />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
            <Route path="/waiting-list" element={<WaitingList />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
