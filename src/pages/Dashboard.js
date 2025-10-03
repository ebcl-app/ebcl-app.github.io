import React, { useState, useEffect } from 'react';
import teamService from '../services/teamService';
import matchService from '../services/matchService';
import liveScoresService from '../services/liveScoresService';
import '../styles/cricket.css';

const Dashboard = () => {
  console.log('🏠 Dashboard component rendered at:', new Date().toISOString());
  console.log('🏠 API_BASE_URL from env:', process.env.REACT_APP_API_BASE_URL);
  const [activeTab, setActiveTab] = useState('Matches');
  const [dashboardData, setDashboardData] = useState({
    teams: { count: 0, loading: true },
    matches: { upcoming: 0, completed: 0, loading: true },
    liveScores: { count: 0, loading: true }
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered at:', new Date().toISOString());
    console.log('🔄 Current dashboardData state:', dashboardData);
    const fetchDashboardData = async () => {
      console.log('📊 Starting to fetch dashboard data at:', new Date().toISOString());
      try {
        setError(null);
        
        const [teamsResponse, matchesResponse, liveScoresResponse] = await Promise.all([
          teamService.getAllTeams().catch((err) => {
            console.error('❌ Teams API error:', err);
            return { success: false, data: [] };
          }),
          matchService.getAllMatches().catch((err) => {
            console.error('❌ Matches API error:', err);
            return [];
          }),
          liveScoresService.fetchLiveScores().catch((err) => {
            console.error('❌ Live Scores API error:', err);
            return { success: false, data: [] };
          })
        ]);

        console.log('📊 API Responses received:', {
          teams: teamsResponse,
          matches: matchesResponse,
          liveScores: liveScoresResponse
        });

        setDashboardData({
          teams: {
            count: teamsResponse.success ? teamsResponse.data.length : 0,
            loading: false
          },
          matches: {
            upcoming: Array.isArray(matchesResponse) ? matchesResponse.filter(m => m.status !== 'completed').length : 0,
            completed: Array.isArray(matchesResponse) ? matchesResponse.filter(m => m.status === 'completed').length : 0,
            loading: false
          },
          liveScores: {
            count: liveScoresResponse.success ? liveScoresResponse.data.length : 0,
            loading: false
          }
        });

        console.log('✅ Dashboard data updated successfully');

      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setDashboardData(prev => ({
          ...prev,
          teams: { ...prev.teams, loading: false },
          matches: { ...prev.matches, loading: false },
          liveScores: { ...prev.liveScores, loading: false }
        }));
      }
    };

    fetchDashboardData();
  }, []);

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
              Live Scores {dashboardData.liveScores.loading ? '⏳' : `🏏 ${dashboardData.liveScores.count}`}
            </h3>
            {error && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
          </div>

          {/* Upcoming Section */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
              Match Overview
            </h3>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">🏏</span>
                <div className="stat-label">Teams</div>
                <div className="stat-value">
                  {dashboardData.teams.loading ? '⏳' : dashboardData.teams.count}
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">�</span>
                <div className="stat-label">Upcoming</div>
                <div className="stat-value">
                  {dashboardData.matches.loading ? '⏳' : dashboardData.matches.upcoming}
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">✅</span>
                <div className="stat-label">Completed</div>
                <div className="stat-value">
                  {dashboardData.matches.loading ? '⏳' : dashboardData.matches.completed}
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">�</span>
                <div className="stat-label">Live Matches</div>
                <div className="stat-value">
                  {dashboardData.liveScores.loading ? '⏳' : dashboardData.liveScores.count}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;