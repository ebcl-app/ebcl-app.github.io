import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { startMatch, updateMatchDetails } from '../store/slices/matchSlice';
import '../styles/figma-cricket-theme.css';
import '../styles/match-management.css';

const MatchDetails = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { upcomingMatches } = useSelector(state => state.match);
  const [match, setMatch] = useState(location.state?.match || null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Find match by ID if not passed through state
  useEffect(() => {
    if (!match && matchId) {
      const foundMatch = upcomingMatches.find(m => m.id === matchId);
      if (foundMatch) {
        setMatch(foundMatch);
      } else {
        // Redirect to match management if match not found
        navigate('/match-management');
      }
    }
  }, [matchId, match, upcomingMatches, navigate]);

  // Set light theme for this page
  useEffect(() => {
    document.body.style.background = '#f8f9fa';
    document.body.style.color = '#000';
    
    return () => {
      document.body.style.background = '#1a1a1a';
      document.body.style.color = '#ffffff';
    };
  }, []);

  const handleStartMatch = () => {
    if (match) {
      dispatch(startMatch(match));
      navigate(`/scoring/${match.id}`);
    }
  };

  const handleEditMatch = () => {
    setShowEditModal(true);
  };

  const handleDeleteMatch = () => {
    setShowDeleteConfirm(true);
  };

  const handleBackNavigation = () => {
    const from = location.state?.from;
    if (from === 'match-management') {
      navigate('/match-management');
    } else {
      navigate('/');
    }
  };

  if (!match) {
    return (
      <div className="match-management-page">
        <div className="match-page-content">
          <div className="match-page-header">
            <h1 className="match-page-title">Match Not Found</h1>
          </div>
          <div className="match-add-section">
            <Link to="/match-management" className="match-add-btn">
              Back to Match Management
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-management-page">
      <div className="match-page-content">
        {/* Header with Back Button */}
        <div className="match-details-header">
          <button onClick={handleBackNavigation} className="back-button">
            <span className="back-arrow">←</span>
            <span className="back-text">Back</span>
          </button>
          <h1 className="match-page-title">Match Details</h1>
        </div>

        {/* Match Details Card */}
        <div className="match-details-card">
          <div className="match-header">
            <span className="match-status upcoming">UPCOMING</span>
            <span className="match-date">
              {new Date(match.date || '2025-09-20').toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>

          <div className="match-content">
            <div className="team-section">
              <div className="team-name">TEAM SOUMYAK</div>
              <div className="team-info">Black Jersey</div>
              <div className="team-players-count">11 Players</div>
            </div>
            
            <div className="vs-section">
              <div className="vs-text">VS</div>
              <div className="match-format">{match.overs || 10} Overs</div>
            </div>
            
            <div className="team-section">
              <div className="team-name">TEAM SONAL</div>
              <div className="team-info">White Jersey</div>
              <div className="team-players-count">11 Players</div>
            </div>
          </div>

          <div className="match-info-grid">
            <div className="info-item">
              <div className="info-icon">📅</div>
              <div className="info-content">
                <div className="info-label">Date & Time</div>
                <div className="info-value">{match.date || '2025-09-20'} at {match.time || '2:00 PM'}</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">🏟️</div>
              <div className="info-content">
                <div className="info-label">Venue</div>
                <div className="info-value">{match.venue || 'Ground A'}</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">🏏</div>
              <div className="info-content">
                <div className="info-label">Format</div>
                <div className="info-value">{match.overs || 10} Overs per Side</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">👨‍⚖️</div>
              <div className="info-content">
                <div className="info-label">Umpire</div>
                <div className="info-value">{match.umpire || 'TBA'}</div>
              </div>
            </div>
          </div>

          {match.description && (
            <div className="match-description">
              <div className="description-label">Match Description</div>
              <div className="description-text">{match.description}</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="match-details-actions">
          <button onClick={handleStartMatch} className="action-btn primary start-match-btn">
            <span className="btn-icon">▶️</span>
            <span className="btn-text">Start Match</span>
          </button>

          <div className="secondary-actions">
            <button onClick={handleEditMatch} className="action-btn secondary edit-btn">
              <span className="btn-icon">✏️</span>
              <span className="btn-text">Edit Details</span>
            </button>

            <button onClick={handleDeleteMatch} className="action-btn danger delete-btn">
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Delete Match</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation">
          <Link to="/" className="nav-item">
            <div className="nav-icon">🏠</div>
            <div className="nav-label">Home</div>
          </Link>
          <Link to={`/scoring/${matchId}`} className="nav-item">
            <div className="nav-icon scoring-icon">$</div>
            <div className="nav-label">Scoring</div>
          </Link>
          <Link to="/match-management" className="nav-item active">
            <div className="nav-icon">📊</div>
            <div className="nav-label">Score</div>
          </Link>
          <Link to="/teams" className="nav-item">
            <div className="nav-icon">☰</div>
            <div className="nav-label">Teams</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;