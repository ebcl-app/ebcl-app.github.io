import React, { useState } from 'react';
import '../styles/figma-cricket-theme.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      {/* Top Navigation */}
      <nav className="top-nav">
        <div></div>
        <ul className="nav-links">
          <li><a href="/">Welcome</a></li>
          <li><a href="/signup" className="active">Signup</a></li>
          <li><a href="/">Home</a></li>
          <li><a href="/form">Form</a></li>
        </ul>
      </nav>

      {/* Signup Screen */}
      <div className="welcome-container">
        <div className="welcome-card">
          <div className="cricket-illustration">
            <span className="cricket-player">🏏</span>
          </div>
          
          <h1 className="app-title">CricketScorePro</h1>
          <p className="app-subtitle">Join something amazing</p>
          
          <div className="upgrade-badge" style={{marginBottom: '2rem'}}>UPGRADE PLAN</div>
          
          <form>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input 
                type="email" 
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input 
                type="password" 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" className="primary-btn">Register</button>
          </form>
          
          <p style={{marginTop: '1rem', color: '#666', fontSize: '0.9rem'}}>
            Already a member? <a href="/login" style={{color: '#667eea'}}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;