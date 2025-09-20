import React, { useState } from 'react';
import '../styles/cricket.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Matches');

  return (
    <div>
      {/* Top Navigation */}
      <nav className="top-nav">
        <div></div>
        <ul className="nav-links">
          <li><a href="/">Welcome</a></li>
          <li><a href="/signup">Signup</a></li>
          <li><a href="/dashboard" className="active">Home</a></li>
          <li><a href="/form">Form</a></li>
        </ul>
      </nav>

      {/* Dashboard */}
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Welcome<br/>CricketScorePro</h2>
            <span className="upgrade-badge">UPGRADE PLAN</span>
          </div>
          
          {/* Navigation Tabs */}
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'Matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('Matches')}
            >
              Matches
            </button>
            <button 
              className={`nav-tab ${activeTab === 'Statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('Statistics')}
            >
              Statistics
            </button>
          </div>

          {/* Live Scores Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
              Live Scores <span style={{ fontSize: '0.9rem' }}>👥 65%</span>
            </h3>
          </div>

          {/* Upcoming Section */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
              Upcoming <span className="upgrade-badge">UPGRADE PLAN</span>
            </h3>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">📊</span>
                <div className="stat-label">Statistics</div>
                <div className="stat-value">2/10</div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div className="stat-label">Players</div>
                <div className="stat-value">1/10</div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📈</span>
                <div className="stat-label">Statistics</div>
                <div className="stat-value">2/10</div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🔔</span>
                <div className="stat-label">Updates</div>
                <div className="stat-value">3/10</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;