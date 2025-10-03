import React, { useState, useEffect } from 'react';
import liveScoresService from '../services/liveScoresService';
import '../styles/live-scores.css';

const LiveScoreTicker = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchLiveScores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await liveScoresService.fetchLiveScores();
      
      // Now both success:true and success:false return valid data
      setMatches(response.data);
      
      if (response.fallback) {
        console.info('Using mock live scores data');
      }
      
    } catch (err) {
      console.error('Error in LiveScoreTicker:', err);
      setError('Failed to load live scores');
      setMatches(liveScoresService.getMockLiveScores());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveScores();
    
    // Refresh scores every 30 seconds
    const interval = setInterval(fetchLiveScores, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance live scores ticker
  useEffect(() => {
    if (matches.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % matches.length);
      }, 8000); // Change every 8 seconds

      return () => clearInterval(interval);
    }
  }, [matches.length]);

  const handlePrevMatch = () => {
    setCurrentIndex(prev => prev === 0 ? matches.length - 1 : prev - 1);
  };

  const handleNextMatch = () => {
    setCurrentIndex(prev => (prev + 1) % matches.length);
  };

  const handleRefresh = () => {
    fetchLiveScores();
  };

  if (loading) {
    return (
      <div className="live-scores-section">
        <div className="scores-section-header">
          <div className="scores-section-title">
            <span className="scores-icon">🏏</span>
            Live Cricket Scores
          </div>
        </div>
        <div className="live-scores-card">
          <div className="live-scores-content">
            <div className="scores-loading">Loading live scores...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="live-scores-section">
        <div className="scores-section-header">
          <div className="scores-section-title">
            <span className="scores-icon">🏏</span>
            Live Cricket Scores
          </div>
        </div>
        <div className="live-scores-card">
          <div className="live-scores-content">
            <div className="scores-error">No live matches at the moment</div>
          </div>
        </div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <div className="live-scores-section">
      {/* Header with title and navigation */}
      <div className="scores-section-header">
        <div className="scores-section-title">
          <span className="scores-icon">🏏</span>
          Live Cricket Scores
          <button 
            className="scores-refresh-btn" 
            onClick={handleRefresh} 
            title="Refresh scores"
          >
            🔄
          </button>
        </div>
        <div className="scores-header-controls">
          <div className="scores-counter">
            {currentIndex + 1} / {matches.length}
          </div>
          <div className="scores-navigation-controls">
            <button className="scores-nav-btn" onClick={handlePrevMatch} title="Previous match">‹</button>
            <button className="scores-nav-btn" onClick={handleNextMatch} title="Next match">›</button>
          </div>
        </div>
      </div>

      {/* Live Score Card - Compact Design */}
      <div className="live-scores-card">
        <div className="live-scores-content">
          {/* Compact Header */}
          <div className="match-compact-header">
            <div className="match-title-section">
              <span className="match-title">{currentMatch.matchTitle}</span>
              <span className="match-format-compact">{currentMatch.matchFormat}</span>
            </div>
            <div 
              className={`match-status-compact ${liveScoresService.getDisplayStatus(currentMatch).class}`}
              aria-label={`Match status: ${liveScoresService.getDisplayStatus(currentMatch).fullText}`}
              title={liveScoresService.getDisplayStatus(currentMatch).fullText}
            >
              <span className="status-icon" aria-hidden="true">{liveScoresService.getDisplayStatus(currentMatch).icon}</span>
              <span className="status-text">{liveScoresService.getDisplayStatus(currentMatch).text}</span>
            </div>
          </div>

          {/* Teams Section - Horizontal Layout */}
          <div className="teams-horizontal-layout">
            {/* Team One */}
            <div className="team-compact">
              <div className="team-name-compact">{currentMatch.teamOne.name}</div>
              <div className="team-score-compact">
                {liveScoresService.getTeamDisplayScore(currentMatch.teamOne)}
              </div>
              <div className="team-status-indicator">
                {currentMatch.teamOne.status === 'bat' && '🏏'}
                {currentMatch.teamOne.status === 'bowl' && '⚾'}
                {currentMatch.teamOne.status === 'sold' && '✅'}
              </div>
            </div>

            {/* VS Divider - Compact */}
            <div className="vs-compact">vs</div>

            {/* Team Two */}
            <div className="team-compact">
              <div className="team-name-compact">{currentMatch.teamTwo.name}</div>
              <div className="team-score-compact">
                {liveScoresService.getTeamDisplayScore(currentMatch.teamTwo)}
              </div>
              <div className="team-status-indicator">
                {currentMatch.teamTwo.status === 'bat' && '🏏'}
                {currentMatch.teamTwo.status === 'bowl' && '⚾'}
                {currentMatch.teamTwo.status === 'unsold' && '❌'}
              </div>
            </div>
          </div>

          {/* Match Status - Compact */}
          <div className="match-status-text">
            {currentMatch.matchStatus}
          </div>
        </div>
      </div>
      
      {/* Dotted navigation indicators */}
      <div className="scores-indicators">
        {matches.map((_, index) => (
          <button
            key={index}
            className={`scores-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            title={`Go to match ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveScoreTicker;