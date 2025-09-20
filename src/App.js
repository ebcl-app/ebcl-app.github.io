
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
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

// Get the basename from the homepage URL for GitHub Pages compatibility
const getBasename = () => {
  const homepage = process.env.PUBLIC_URL || '';
  return homepage;
};

function App() {
  return (
    <Provider store={store}>
      <Router basename={getBasename()}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team-management" element={<TeamManagement />} />
          <Route path="/match-setup" element={<MatchSetup />} />
          <Route path="/match-registration" element={<MatchRegistration />} />
          <Route path="/player-registration" element={<PlayerRegistration />} />
          <Route path="/scoring" element={<Scoring />} />
          <Route path="/batting-view" element={<BattingView />} />
          <Route path="/bowling-view" element={<BowlingView />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/waiting-list" element={<WaitingList />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
