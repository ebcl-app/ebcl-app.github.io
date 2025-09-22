import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/cricket.css';

const GlobalNavigation = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const location = useLocation();

  // Navigation items configuration
  const navigationItems = [
    {
      path: '/',
      label: 'Home',
      icon: '🏠',
      description: 'Dashboard & Overview'
    },
    {
      path: '/match-management',
      label: 'Matches',
      icon: '📅',
      description: 'Schedule & Manage Matches'
    },
    {
      path: '/player-management',
      label: 'Players',
      icon: '👥',
      description: 'Player Database'
    },
    {
      path: '/team-management',
      label: 'Teams',
      icon: '🏏',
      description: 'Team Organization'
    },
    {
      path: '/scoring',
      label: 'Live Scoring',
      icon: '📊',
      description: 'Match Scoring System'
    }
  ];

  // Check if current path is active
  const isActiveTab = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setShowProfileDropdown(false);
  };

  return (
    <nav className="global-navigation">
      <div className="nav-container">
        {/* Logo and Branding */}
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <div className="brand-logo">
              <span className="logo-icon">🏏</span>
              <div className="brand-text">
                <h1 className="brand-title">Ecolife Cricket</h1>
                <span className="brand-subtitle">Match Management</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Navigation Tabs */}
        <div className="nav-tabs">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-tab ${isActiveTab(item.path) ? 'active' : ''}`}
              title={item.description}
            >
              <span className="tab-icon">{item.icon}</span>
              <span className="tab-label">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Profile Section */}
        <div className="nav-profile">
          <div className="profile-container">
            <button 
              className="profile-trigger"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              onBlur={handleClickOutside}
            >
              <div className="profile-avatar">
                <span className="avatar-text">EM</span>
              </div>
              <div className="profile-info">
                <span className="profile-name">Ecolife Member</span>
                <span className="profile-id">ID: a1b2c3d4e5f6</span>
              </div>
              <span className="dropdown-caret">{showProfileDropdown ? '▲' : '▼'}</span>
            </button>
            
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="user-avatar-large">
                    <span className="avatar-large-text">EM</span>
                  </div>
                  <div className="user-details">
                    <h3 className="user-name">Ecolife Member</h3>
                    <p className="user-email">member@ecolife.com</p>
                    <div className="user-id-badge">
                      <span className="id-label">User ID:</span>
                      <span className="id-value">a1b2c3d4e5f6</span>
                      <button className="copy-id-btn" title="Copy User ID">📋</button>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <div className="dropdown-menu">
                  <button className="dropdown-item">
                    <span className="item-icon">👤</span>
                    <div className="item-content">
                      <span className="item-title">Profile Settings</span>
                      <span className="item-subtitle">Update your information</span>
                    </div>
                  </button>
                  
                  <button className="dropdown-item">
                    <span className="item-icon">🏏</span>
                    <div className="item-content">
                      <span className="item-title">My Teams</span>
                      <span className="item-subtitle">View your teams</span>
                    </div>
                  </button>
                  
                  <button className="dropdown-item">
                    <span className="item-icon">📊</span>
                    <div className="item-content">
                      <span className="item-title">Statistics</span>
                      <span className="item-subtitle">Performance analytics</span>
                    </div>
                  </button>
                  
                  <button className="dropdown-item">
                    <span className="item-icon">⚙️</span>
                    <div className="item-content">
                      <span className="item-title">Preferences</span>
                      <span className="item-subtitle">App settings</span>
                    </div>
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item logout-item">
                    <span className="item-icon">🚪</span>
                    <div className="item-content">
                      <span className="item-title">Sign Out</span>
                      <span className="item-subtitle">End your session</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavigation;