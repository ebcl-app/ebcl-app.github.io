import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/cricket.css';

const Home = () => (
  <div>
    {/* Top Navigation */}
    <nav className="top-nav">
      <div className="logo-section">
        <div className="app-logo">🏏</div>
        <div className="app-name">Box Cricket</div>
        <div className="user-id">User ID: a1b2c3d4e5f6</div>
      </div>
      <ul className="nav-links">
        <li><Link to="/" className="active">Home</Link></li>
        <li><Link to="/team-management">Team Management</Link></li>
        <li><Link to="/match-setup">Match Registration Screen</Link></li>
        <li><Link to="/scoring">Live Scoring</Link></li>
        <li><Link to="/waiting-list">Waiting List</Link></li>
      </ul>
    </nav>

    {/* Dashboard Container */}
    <div className="dashboard-container">
      <div className="dashboard-card home-card">
        <h1 className="app-title">Box Cricket Management</h1>
        <p className="app-subtitle">Manage your teams, register new players, and keep track of scores in real-time.</p>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/team-management" className="register-team-btn">
            <span className="btn-icon">➕</span>
            Register Team
          </Link>
          
          <Link to="/team-management" className="view-teams-btn">
            <span className="btn-icon">👥</span>
            View Teams
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default Home;