import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { setMatchSquads, startMatch, createNewMatch, setCurrentMatch } from '../store/slices/matchSlice';
import '../styles/figma-cricket-theme.css';

const MatchRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');

  const { upcomingMatches } = useSelector(state => state.match);
  const { teams, availableUmpires } = useSelector(state => state.team);

  const [currentMatch, setCurrentMatch] = useState(null);
  const [isNewMatch, setIsNewMatch] = useState(!matchId);
  const [newMatchDetails, setNewMatchDetails] = useState({
    team1: null,
    team2: null,
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    venue: 'Cricket Ground'
  });

  const [matchSettings, setMatchSettings] = useState({
    overs: 20,
    playersPerTeam: 11,
    maxOversPerBowler: 4,
    format: 'T20'
  });
  const [selectedSquads, setSelectedSquads] = useState({
    team1: [],
    team2: []
  });
  const [selectedCaptains, setSelectedCaptains] = useState({
    team1: null,
    team2: null
  });
  const [selectedUmpire, setSelectedUmpire] = useState(null);
  const [tossWinner, setTossWinner] = useState(null);
  const [tossChoice, setTossChoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [step, setStep] = useState(isNewMatch ? 0 : 1); // 0: Team Selection (new match), 1: Match Settings, 2: Squad Selection, 3: Captain Selection, 4: Umpire & Toss

  useEffect(() => {
    if (matchId) {
      // Existing match flow
      const match = upcomingMatches.find(m => m.id === parseInt(matchId));
      if (match) {
        setCurrentMatch(match);
        setIsNewMatch(false);
        setStep(1);
      }
    } else {
      // New match flow
      setIsNewMatch(true);
      setStep(0);
    }
  }, [matchId, upcomingMatches]);

  const handleMatchSettingChange = (setting, value) => {
    setMatchSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTeamSelection = (teamSlot, team) => {
    setNewMatchDetails(prev => ({
      ...prev,
      [teamSlot]: team
    }));
  };

  const handleNewMatchDetailChange = (field, value) => {
    setNewMatchDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSquadSelection = (teamKey, player, isSelected) => {
    const currentSquadSize = selectedSquads[teamKey].length;
    
    if (isSelected && currentSquadSize >= matchSettings.playersPerTeam) {
      alert(`Cannot select more than ${matchSettings.playersPerTeam} players`);
      return;
    }
    
    setSelectedSquads(prev => ({
      ...prev,
      [teamKey]: isSelected 
        ? [...prev[teamKey], player]
        : prev[teamKey].filter(p => p.id !== player.id)
    }));
  };

  const handleCaptainSelection = (teamKey, player) => {
    setSelectedCaptains(prev => ({
      ...prev,
      [teamKey]: player
    }));
  };

  const handleNextStep = () => {
    const maxStep = isNewMatch ? 4 : 4;
    if (step < maxStep) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    const minStep = isNewMatch ? 0 : 1;
    if (step > minStep) {
      setStep(step - 1);
    }
  };

  const handleStartMatch = () => {
    let finalMatchId = matchId;

    // If this is a new match, create it first
    if (isNewMatch) {
      finalMatchId = Date.now();
      
      // Create the new match
      dispatch(createNewMatch({
        id: finalMatchId,
        team1: {
          name: newMatchDetails.team1.name,
          players: [],
          captain: null
        },
        team2: {
          name: newMatchDetails.team2.name,
          players: [],
          captain: null
        },
        date: newMatchDetails.date,
        time: newMatchDetails.time,
        venue: newMatchDetails.venue,
        format: matchSettings.format,
        overs: matchSettings.overs,
        playersPerTeam: matchSettings.playersPerTeam,
        maxOversPerBowler: matchSettings.maxOversPerBowler
      }));

      // Set this as the current match
      dispatch(setCurrentMatch({
        id: finalMatchId,
        team1: {
          name: newMatchDetails.team1.name,
          players: newMatchDetails.team1.players,
          captain: null
        },
        team2: {
          name: newMatchDetails.team2.name,
          players: newMatchDetails.team2.players,
          captain: null
        },
        date: newMatchDetails.date,
        time: newMatchDetails.time,
        venue: newMatchDetails.venue,
        format: matchSettings.format,
        overs: matchSettings.overs,
        playersPerTeam: matchSettings.playersPerTeam,
        maxOversPerBowler: matchSettings.maxOversPerBowler,
        status: 'upcoming'
      }));
    }

    // Save squad and captain details to Redux
    dispatch(setMatchSquads({
      matchId: finalMatchId,
      team1Players: selectedSquads.team1,
      team2Players: selectedSquads.team2,
      team1Captain: selectedCaptains.team1,
      team2Captain: selectedCaptains.team2,
      umpire: selectedUmpire,
      matchSettings: matchSettings // Include match settings
    }));

    // Start the match with toss details
    dispatch(startMatch({
      matchId: finalMatchId,
      tossWinner,
      choosenToAction: tossChoice,
      matchSettings: matchSettings // Include match settings
    }));

    // Navigate to scoring page
    navigate(`/scoring/${finalMatchId}`);
  };

  // Enhanced navigation functions with confirmation
  const handleNextStepWithConfirmation = () => {
    let confirmMessage = '';
    
    if (step === (isNewMatch ? 1 : 1)) {
      // Match settings confirmation
      confirmMessage = `You've configured a ${matchSettings.format} match with ${matchSettings.playersPerTeam} players per team and ${matchSettings.overs} overs. Proceed to squad selection?`;
    } else if (step === (isNewMatch ? 2 : 2)) {
      // Squad selection confirmation  
      confirmMessage = `You've selected ${selectedSquads.team1.length} players for ${isNewMatch ? newMatchDetails.team1?.name : currentMatch?.team1.name} and ${selectedSquads.team2.length} players for ${isNewMatch ? newMatchDetails.team2?.name : currentMatch?.team2.name}. Proceed to captain selection?`;
    } else if (step === (isNewMatch ? 3 : 3)) {
      // Captain selection confirmation
      confirmMessage = `You've selected ${selectedCaptains.team1?.name} as captain for ${isNewMatch ? newMatchDetails.team1?.name : currentMatch?.team1.name} and ${selectedCaptains.team2?.name} as captain for ${isNewMatch ? newMatchDetails.team2?.name : currentMatch?.team2.name}. Proceed to toss details?`;
    }
    
    if (confirmMessage) {
      if (window.confirm(confirmMessage)) {
        handleNextStep();
      }
    } else {
      handleNextStep();
    }
  };

  const handleStartMatchWithConfirmation = () => {
    const matchType = matchSettings.format;
    const team1Name = isNewMatch ? newMatchDetails.team1?.name : currentMatch?.team1.name;
    const team2Name = isNewMatch ? newMatchDetails.team2?.name : currentMatch?.team2.name;
    
    const confirmMessage = `Ready to start the ${matchType} match between ${team1Name} and ${team2Name}? Toss won by ${tossWinner} who chose to ${tossChoice === 'bat' ? 'bat first' : 'bowl first'}. This action will begin live scoring.`;
    
    if (window.confirm(confirmMessage)) {
      handleStartMatch();
    }
  };

  if (!currentMatch) {
    return (
      <div className="home-page-container modern-bg">
        <div className="dashboard-container full-screen modern-dashboard">
          <div className="dashboard-card home-card full-width modern-card">
            <div className="modern-header">
              <div className="modern-header-left">
                <span className="modern-cricket-icon">🏏</span>
                <span className="modern-title">Match Registration</span>
              </div>
            </div>
            <div className="loading-state">
              <h2 className="modern-main-title">Loading Match Details...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const team1Details = teams.find(t => t.name === currentMatch.team1.name);
  const team2Details = teams.find(t => t.name === currentMatch.team2.name);

  return (
    <div className="home-page-container modern-bg">
      {/* Cricket Equipment Background */}
      <div className="cricket-background">
        <div className="cricket-bat cricket-bat-1">🏏</div>
        <div className="cricket-ball cricket-ball-1">🏏</div>
        <div className="cricket-bat cricket-bat-2">🏏</div>
        <div className="cricket-ball cricket-ball-2">⚾</div>
        <div className="cricket-wickets cricket-wickets-1">🏏</div>
        <div className="cricket-ball cricket-ball-3">🏏</div>
      </div>

      <div className="dashboard-container full-screen modern-dashboard">
        <div className="dashboard-card home-card full-width modern-card">
          {/* Back Button */}
          <div className="modern-back-button">
            <Link to="/" className="modern-btn-back">
              <span className="modern-btn-icon">←</span>
              Back to Home
            </Link>
          </div>

          {/* Header Section */}
          <div className="modern-header">
            <div className="modern-header-left">
              <span className="modern-cricket-icon">🏏</span>
              <span className="modern-title">Match Registration</span>
            </div>
          </div>

          {/* Enhanced Horizontal Stepper */}
          <div className="match-stepper-container">
            <div className="match-stepper">
              {isNewMatch ? (
                // New Match 5-Step Flow
                <>
                  <div className={`stepper-step ${step >= 0 ? 'completed' : ''} ${step === 0 ? 'active' : ''}`} 
                       onClick={() => step > 0 && setStep(0)}>
                    <div className="stepper-circle">
                      <span className="stepper-number">1</span>
                      {step > 0 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Team Selection</span>
                      <span className="stepper-subtitle">Choose teams & details</span>
                    </div>
                  </div>
                  <div className="stepper-connector"></div>
                  
                  <div className={`stepper-step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`} 
                       onClick={() => step > 1 && setStep(1)}>
                    <div className="stepper-circle">
                      <span className="stepper-number">2</span>
                      {step > 1 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Match Settings</span>
                      <span className="stepper-subtitle">Format & rules</span>
                    </div>
                  </div>
                  <div className="stepper-connector"></div>
                  
                  <div className={`stepper-step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`} 
                       onClick={() => step > 2 && setStep(2)}>
                    <div className="stepper-circle">
                      <span className="stepper-number">3</span>
                      {step > 2 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Squad Selection</span>
                      <span className="stepper-subtitle">Pick players</span>
                    </div>
                  </div>
                  <div className="stepper-connector"></div>
                  
                  <div className={`stepper-step ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`} 
                       onClick={() => step > 3 && setStep(3)}>
                    <div className="stepper-circle">
                      <span className="stepper-number">4</span>
                      {step > 3 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Captain Selection</span>
                      <span className="stepper-subtitle">Choose captains</span>
                    </div>
                  </div>
                  <div className="stepper-connector"></div>
                  
                  <div className={`stepper-step ${step >= 4 ? 'completed' : ''} ${step === 4 ? 'active' : ''}`}>
                    <div className="stepper-circle">
                      <span className="stepper-number">5</span>
                      {step > 4 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Toss & Start</span>
                      <span className="stepper-subtitle">Final details</span>
                    </div>
                  </div>
                </>
              ) : (
                // Existing Match 4-Step Flow
                <>
                  <div className={`stepper-step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`} 
                       onClick={() => step > 1 && setStep(1)}>
                    <div className="stepper-circle">
                      <span className="stepper-number">1</span>
                      {step > 1 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Match Settings</span>
                      <span className="stepper-subtitle">Format & rules</span>
                    </div>
                  </div>
                  <div className="stepper-connector"></div>
                  
                  <div className={`stepper-step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`} 
                       onClick={() => step > 2 && setStep(2)}>
                    <div className="stepper-circle">
                      <span className="stepper-number">2</span>
                      {step > 2 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Squad Selection</span>
                      <span className="stepper-subtitle">Pick players</span>
                    </div>
                  </div>
                  <div className="stepper-connector"></div>
                  
                  <div className={`stepper-step ${step >= 3 ? 'completed' : ''} ${step === 3 ? 'active' : ''}`} 
                       onClick={() => step > 3 && setStep(3)}>
                    <div className="stepper-circle">
                      <span className="stepper-number">3</span>
                      {step > 3 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Captain Selection</span>
                      <span className="stepper-subtitle">Choose captains</span>
                    </div>
                  </div>
                  <div className="stepper-connector"></div>
                  
                  <div className={`stepper-step ${step >= 4 ? 'completed' : ''} ${step === 4 ? 'active' : ''}`}>
                    <div className="stepper-circle">
                      <span className="stepper-number">4</span>
                      {step > 4 && <span className="stepper-check">✓</span>}
                    </div>
                    <div className="stepper-label">
                      <span className="stepper-title">Toss & Start</span>
                      <span className="stepper-subtitle">Final details</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Match Info Header */}
          <div className="match-info-header">
            <h1 className="match-teams-title">
              {isNewMatch 
                ? (newMatchDetails.team1 && newMatchDetails.team2 
                    ? `${newMatchDetails.team1.name} vs ${newMatchDetails.team2.name}`
                    : "Select Teams to Start")
                : `${currentMatch?.team1.name} vs ${currentMatch?.team2.name}`}
            </h1>
            <div className="match-details-badge">
              <span className="detail-item">
                <span className="detail-icon">📅</span>
                {isNewMatch ? newMatchDetails.date || 'Date TBD' : currentMatch?.date}
              </span>
              <span className="detail-item">
                <span className="detail-icon">⏰</span>
                {isNewMatch ? newMatchDetails.time || 'Time TBD' : currentMatch?.time}
              </span>
              <span className="detail-item">
                <span className="detail-icon">📍</span>
                {isNewMatch ? newMatchDetails.venue || 'Venue TBD' : currentMatch?.venue}
              </span>
            </div>
          </div>

          {/* Step Content */}
          <div className="modern-step-content">
            {step === 0 && isNewMatch && (
              <div className="modern-section">
                <h3 className="modern-section-title">Select Teams & Match Details</h3>
                
                <div className="modern-form-grid">
                  <div className="modern-form-group">
                    <label className="modern-label">Team 1</label>
                    <select 
                      className="modern-select"
                      value={newMatchDetails.team1?.id || ''}
                      onChange={(e) => {
                        const team = teams.find(t => t.id === parseInt(e.target.value));
                        handleTeamSelection('team1', team);
                      }}
                    >
                      <option value="">Select Team 1</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="modern-form-group">
                    <label className="modern-label">Team 2</label>
                    <select 
                      className="modern-select"
                      value={newMatchDetails.team2?.id || ''}
                      onChange={(e) => {
                        const team = teams.find(t => t.id === parseInt(e.target.value));
                        handleTeamSelection('team2', team);
                      }}
                    >
                      <option value="">Select Team 2</option>
                      {teams.filter(team => team.id !== newMatchDetails.team1?.id).map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="modern-form-group">
                    <label className="modern-label">Match Date</label>
                    <input 
                      type="date"
                      className="modern-input"
                      value={newMatchDetails.date}
                      onChange={(e) => handleNewMatchDetailChange('date', e.target.value)}
                    />
                  </div>
                  
                  <div className="modern-form-group">
                    <label className="modern-label">Match Time</label>
                    <input 
                      type="time"
                      className="modern-input"
                      value={newMatchDetails.time}
                      onChange={(e) => handleNewMatchDetailChange('time', e.target.value)}
                    />
                  </div>
                  
                  <div className="modern-form-group">
                    <label className="modern-label">Venue</label>
                    <input 
                      type="text"
                      className="modern-input"
                      value={newMatchDetails.venue}
                      onChange={(e) => handleNewMatchDetailChange('venue', e.target.value)}
                      placeholder="Enter venue name"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === (isNewMatch ? 1 : 1) && (
              <div className="step-container">
                {/* Match Format Card */}
                <div className="settings-card primary-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span className="card-icon">🏏</span>
                      Match Format & Settings
                    </h3>
                    <div className="card-subtitle">Configure your cricket match format and rules</div>
                  </div>
                  
                  <div className="card-content">
                    {/* Format & Overs Group */}
                    <div className="settings-group">
                      <h4 className="group-title">
                        <span className="group-icon">⚙️</span>
                        Format Configuration
                      </h4>
                      <div className="group-fields">
                        <div className="field-row">
                          <div className="modern-form-group format-select">
                            <label className="enhanced-label">
                              Match Format
                              <span className="field-tooltip" title="Choose the type of cricket match">ℹ️</span>
                            </label>
                            <div className="select-wrapper">
                              <select 
                                className="enhanced-select"
                                value={matchSettings.format}
                                onChange={(e) => {
                                  const format = e.target.value;
                                  let defaultOvers = 20;
                                  let defaultPlayers = 11;
                                  let defaultMaxOvers = 4;
                                  
                                  if (format === 'Test') {
                                    defaultOvers = 90;
                                    defaultPlayers = 11;
                                    defaultMaxOvers = 15;
                                  } else if (format === 'ODI') {
                                    defaultOvers = 50;
                                    defaultPlayers = 11;
                                    defaultMaxOvers = 10;
                                  } else if (format === 'T20') {
                                    defaultOvers = 20;
                                    defaultPlayers = 11;
                                    defaultMaxOvers = 4;
                                  } else if (format === 'Box Cricket') {
                                    defaultOvers = 6;
                                    defaultPlayers = 8;
                                    defaultMaxOvers = 2;
                                  }
                                  
                                  setMatchSettings({
                                    format,
                                    overs: defaultOvers,
                                    playersPerTeam: defaultPlayers,
                                    maxOversPerBowler: defaultMaxOvers
                                  });
                                }}
                              >
                                <option value="T20">🔵 T20 (20 overs)</option>
                                <option value="ODI">🟡 ODI (50 overs)</option>
                                <option value="Box Cricket">🟢 Box Cricket (6 overs)</option>
                                <option value="Custom">⚪ Custom Format</option>
                              </select>
                              <div className="format-badge">
                                {matchSettings.format === 'T20' && <span className="badge blue">Fast-paced</span>}
                                {matchSettings.format === 'ODI' && <span className="badge yellow">Balanced</span>}
                                {matchSettings.format === 'Box Cricket' && <span className="badge green">Quick</span>}
                                {matchSettings.format === 'Custom' && <span className="badge gray">Flexible</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="modern-form-group overs-input">
                            <label className="enhanced-label">
                              Total Overs
                              <span className="field-tooltip" title="Maximum overs per innings">ℹ️</span>
                            </label>
                            <div className="input-wrapper">
                              <input 
                                type="number"
                                className="enhanced-input"
                                value={matchSettings.overs}
                                onChange={(e) => handleMatchSettingChange('overs', parseInt(e.target.value))}
                                min="1"
                                max="100"
                                placeholder="Enter total overs"
                              />
                              <div className="input-validation">
                                {matchSettings.overs > 50 && (
                                  <span className="validation-warning">⚠️ Long format match</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Team & Player Configuration Group */}
                    <div className="settings-group">
                      <h4 className="group-title">
                        <span className="group-icon">👥</span>
                        Team Configuration
                      </h4>
                      <div className="group-fields">
                        <div className="field-row">
                          <div className="modern-form-group players-input">
                            <label className="enhanced-label">
                              Players Per Team
                              <span className="field-tooltip" title="Number of players in each team (6-15)">ℹ️</span>
                            </label>
                            <div className="input-wrapper">
                              <input 
                                type="number"
                                className="enhanced-input"
                                value={matchSettings.playersPerTeam}
                                onChange={(e) => handleMatchSettingChange('playersPerTeam', parseInt(e.target.value))}
                                min="6"
                                max="15"
                                placeholder="Number of players"
                              />
                              <div className="input-validation">
                                {matchSettings.playersPerTeam < 11 && (
                                  <span className="validation-info">ℹ️ Reduced team size</span>
                                )}
                                {matchSettings.playersPerTeam > 11 && (
                                  <span className="validation-info">ℹ️ Extended squad</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="modern-form-group bowler-input">
                            <label className="enhanced-label">
                              Max Overs Per Bowler
                              <span className="field-tooltip" title="Maximum overs a single bowler can bowl">ℹ️</span>
                            </label>
                            <div className="input-wrapper">
                              <input 
                                type="number"
                                className="enhanced-input"
                                value={matchSettings.maxOversPerBowler}
                                onChange={(e) => handleMatchSettingChange('maxOversPerBowler', parseInt(e.target.value))}
                                min="1"
                                max={Math.floor(matchSettings.overs / 2)}
                                placeholder="Max overs per bowler"
                              />
                              <div className="input-validation">
                                {matchSettings.maxOversPerBowler > Math.floor(matchSettings.overs / 2) && (
                                  <span className="validation-error">❌ Cannot exceed {Math.floor(matchSettings.overs / 2)} overs</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Match Preview Toggle */}
                    <div className="preview-section">
                      <button 
                        className="preview-toggle"
                        onClick={() => setShowPreview(!showPreview)}
                        type="button"
                      >
                        <span className="preview-icon">👁️</span>
                        {showPreview ? 'Hide' : 'Show'} Match Summary
                      </button>
                      
                      {showPreview && (
                        <div className="match-preview">
                          <h5 className="preview-title">Match Configuration Preview</h5>
                          <div className="preview-grid">
                            <div className="preview-item">
                              <span className="preview-label">Format:</span>
                              <span className="preview-value">{matchSettings.format}</span>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Overs:</span>
                              <span className="preview-value">{matchSettings.overs} per innings</span>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Team Size:</span>
                              <span className="preview-value">{matchSettings.playersPerTeam} players each</span>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Bowler Limit:</span>
                              <span className="preview-value">{matchSettings.maxOversPerBowler} overs max</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === (isNewMatch ? 2 : 2) && (
              <div className="modern-section">
                <h3 className="modern-section-title">Select Playing Squad ({matchSettings.playersPerTeam} players each)</h3>
                
                <div className="modern-teams-grid">
                  {/* Team 1 */}
                  <div className="modern-team-section">
                    <h4 className="modern-team-title">
                      {isNewMatch ? newMatchDetails.team1?.name : currentMatch?.team1.name}
                    </h4>
                    <div className="modern-players-grid">
                      {(isNewMatch ? newMatchDetails.team1?.players : teams.find(t => t.name === currentMatch?.team1.name)?.players)?.map(player => (
                        <div 
                          key={player.id} 
                          className={`modern-player-card ${selectedSquads.team1.find(p => p.id === player.id) ? 'selected' : ''}`}
                          onClick={() => handleSquadSelection('team1', player, !selectedSquads.team1.find(p => p.id === player.id))}
                        >
                          <div className="modern-player-name">{player.name}</div>
                          <div className="modern-player-role">{player.role}</div>
                        </div>
                      ))}
                    </div>
                    <div className="selection-count">
                      Selected: {selectedSquads.team1.length}/{matchSettings.playersPerTeam}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="modern-team-section">
                    <h4 className="modern-team-title">
                      {isNewMatch ? newMatchDetails.team2?.name : currentMatch?.team2.name}
                    </h4>
                    <div className="modern-players-grid">
                      {(isNewMatch ? newMatchDetails.team2?.players : teams.find(t => t.name === currentMatch?.team2.name)?.players)?.map(player => (
                        <div 
                          key={player.id} 
                          className={`modern-player-card ${selectedSquads.team2.find(p => p.id === player.id) ? 'selected' : ''}`}
                          onClick={() => handleSquadSelection('team2', player, !selectedSquads.team2.find(p => p.id === player.id))}
                        >
                          <div className="modern-player-name">{player.name}</div>
                          <div className="modern-player-role">{player.role}</div>
                        </div>
                      ))}
                    </div>
                    <div className="selection-count">
                      Selected: {selectedSquads.team2.length}/{matchSettings.playersPerTeam}
                    </div>
                  </div>
                </div>
              </div>
            )}            {step === (isNewMatch ? 3 : 3) && (
              <div className="modern-section">
                <h3 className="modern-section-title">Select Captains</h3>
                
                <div className="modern-teams-grid">
                  {/* Team 1 Captain */}
                  <div className="modern-team-section">
                    <h4 className="modern-team-title">
                      {isNewMatch ? newMatchDetails.team1?.name : currentMatch?.team1.name} Captain
                    </h4>
                    <div className="modern-players-grid">
                      {selectedSquads.team1.map(player => (
                        <div 
                          key={player.id} 
                          className={`modern-player-card ${selectedCaptains.team1?.id === player.id ? 'selected' : ''}`}
                          onClick={() => handleCaptainSelection('team1', player)}
                        >
                          <div className="modern-player-name">{player.name}</div>
                          <div className="modern-player-role">{player.role}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team 2 Captain */}
                  <div className="modern-team-section">
                    <h4 className="modern-team-title">
                      {isNewMatch ? newMatchDetails.team2?.name : currentMatch?.team2.name} Captain
                    </h4>
                    <div className="modern-players-grid">
                      {selectedSquads.team2.map(player => (
                        <div 
                          key={player.id} 
                          className={`modern-player-card ${selectedCaptains.team2?.id === player.id ? 'selected' : ''}`}
                          onClick={() => handleCaptainSelection('team2', player)}
                        >
                          <div className="modern-player-name">{player.name}</div>
                          <div className="modern-player-role">{player.role}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === (isNewMatch ? 4 : 4) && (
              <div className="modern-section">
                <h3 className="modern-section-title">Toss & Match Details</h3>
                
                <div className="modern-form-row">
                  <div className="modern-form-group">
                    <label className="modern-label">Select Umpire</label>
                    <div className="modern-umpire-grid">
                      {availableUmpires.map(umpire => (
                        <div 
                          key={umpire.id}
                          className={`modern-umpire-card ${selectedUmpire?.id === umpire.id ? 'selected' : ''}`}
                          onClick={() => setSelectedUmpire(umpire)}
                        >
                          <div className="umpire-name">{umpire.name}</div>
                          <div className="umpire-experience">{umpire.experience}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modern-form-row">
                  <div className="modern-form-group">
                    <label className="modern-label">Toss Winner</label>
                    <div className="modern-button-group">
                      <button 
                        className={`modern-select-btn ${tossWinner === (isNewMatch ? newMatchDetails.team1?.name : currentMatch?.team1.name) ? 'selected' : ''}`}
                        onClick={() => setTossWinner(isNewMatch ? newMatchDetails.team1?.name : currentMatch?.team1.name)}
                      >
                        {isNewMatch ? newMatchDetails.team1?.name : currentMatch?.team1.name}
                      </button>
                      <button 
                        className={`modern-select-btn ${tossWinner === (isNewMatch ? newMatchDetails.team2?.name : currentMatch?.team2.name) ? 'selected' : ''}`}
                        onClick={() => setTossWinner(isNewMatch ? newMatchDetails.team2?.name : currentMatch?.team2.name)}
                      >
                        {isNewMatch ? newMatchDetails.team2?.name : currentMatch?.team2.name}
                      </button>
                    </div>
                  </div>
                </div>

                {tossWinner && (
                  <div className="modern-form-row">
                    <div className="modern-form-group">
                      <label className="modern-label">Toss Decision</label>
                      <div className="modern-button-group">
                        <button 
                          className={`modern-select-btn ${tossChoice === 'bat' ? 'selected' : ''}`}
                          onClick={() => setTossChoice('bat')}
                        >
                          Bat First
                        </button>
                        <button 
                          className={`modern-select-btn ${tossChoice === 'bowl' ? 'selected' : ''}`}
                          onClick={() => setTossChoice('bowl')}
                        >
                          Bowl First
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Sticky Footer Navigation */}
      <div className="sticky-footer-navigation">
        <div className="footer-content">
          <div className="footer-left">
            {step > (isNewMatch ? 0 : 1) && (
              <button 
                className="footer-btn secondary" 
                onClick={handlePreviousStep}
                aria-label="Go to previous step"
              >
                <span className="btn-icon">←</span>
                <span className="btn-text">Previous</span>
              </button>
            )}
          </div>
          
          <div className="footer-center">
            <div className="step-indicator">
              Step {isNewMatch ? step + 1 : step} of {isNewMatch ? 5 : 4}
            </div>
          </div>
          
          <div className="footer-right">
            {step < (isNewMatch ? 4 : 4) ? (
              <button 
                className="footer-btn primary" 
                onClick={handleNextStepWithConfirmation}
                disabled={
                  (isNewMatch && step === 0 && (!newMatchDetails.team1 || !newMatchDetails.team2 || !newMatchDetails.date || !newMatchDetails.time || !newMatchDetails.venue)) ||
                  (step === (isNewMatch ? 1 : 1) && (!matchSettings.format || !matchSettings.overs || !matchSettings.playersPerTeam || !matchSettings.maxOversPerBowler)) ||
                  (step === (isNewMatch ? 2 : 2) && (selectedSquads.team1.length !== matchSettings.playersPerTeam || selectedSquads.team2.length !== matchSettings.playersPerTeam)) ||
                  (step === (isNewMatch ? 3 : 3) && (!selectedCaptains.team1 || !selectedCaptains.team2))
                }
                aria-label="Continue to next step"
              >
                <span className="btn-text">Continue</span>
                <span className="btn-icon">→</span>
              </button>
            ) : (
              <button 
                className="footer-btn success" 
                onClick={handleStartMatchWithConfirmation}
                disabled={!selectedUmpire || !tossWinner || !tossChoice}
                aria-label="Start the cricket match"
              >
                <span className="btn-icon">🏏</span>
                <span className="btn-text">Start Match</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="footer-progress">
          <div 
            className="progress-fill" 
            style={{
              width: `${((isNewMatch ? step + 1 : step) / (isNewMatch ? 5 : 4)) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MatchRegistration;