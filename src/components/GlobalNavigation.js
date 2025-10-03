import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/cricket.css';

const GlobalNavigation = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  // Navigation items - organized by priority
  const primaryNavItems = [
    // Main Dashboard
    {
      path: '/',
      label: 'Home',
      icon: '🏠',
      description: 'Dashboard & Overview'
    },
    
    // Match Management
    {
      path: '/match-management',
      label: 'Matches',
      icon: '📅',
      description: 'Schedule & Manage Matches'
    },
    
    // Live Scoring
    {
      path: '/scoring',
      label: 'Scoring',
      icon: '📊',
      description: 'Live Match Scoring'
    },
    
    // Player & Team Management
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
    }
  ];

  const secondaryNavItems = [
    {
      path: '/match-setup',
      label: 'Match Setup',
      icon: '⚙️',
      description: 'Match Setup'
    },
    {
      path: '/start-match',
      label: 'Start Match',
      icon: '▶️',
      description: 'Start New Match'
    },
    {
      path: '/scoreboard',
      label: 'Scoreboard',
      icon: '📋',
      description: 'Scoreboard View'
    },
    {
      path: '/batting-view',
      label: 'Batting Stats',
      icon: '🏃',
      description: 'Batting Statistics'
    },
    {
      path: '/bowling-view',
      label: 'Bowling Stats',
      icon: '🎯',
      description: 'Bowling Statistics'
    },
    {
      path: '/news',
      label: 'News',
      icon: '📰',
      description: 'Cricket News'
    },
    {
      path: '/waiting-list',
      label: 'Waiting List',
      icon: '⏳',
      description: 'Waiting List'
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
    setShowHamburgerMenu(false);
  };

  return (
    <nav className="global-navigation">
      <div className="nav-container">
        {/* Global Navigation Tabs */}
        <div className="nav-tabs">
          {primaryNavItems.map((item) => (
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
          
          {/* Hamburger Menu Button */}
          <button 
            className={`nav-tab hamburger-btn ${showHamburgerMenu ? 'active' : ''}`}
            onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
            title="More options"
            aria-label="More navigation options"
          >
            <span className="tab-icon">☰</span>
            <span className="tab-label">More</span>
          </button>
        </div>

        {/* Hamburger Menu Dropdown */}
        {showHamburgerMenu && (
          <div className="hamburger-menu">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`hamburger-item ${isActiveTab(item.path) ? 'active' : ''}`}
                onClick={() => setShowHamburgerMenu(false)}
                title={item.description}
              >
                <span className="hamburger-icon">{item.icon}</span>
                <span className="hamburger-label">{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Theme Toggle and User Menu */}
        <div className="nav-actions">
          {/* Dark Mode Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-icon">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <button
              className="user-menu-trigger"
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowHamburgerMenu(false);
              }}
              onBlur={handleClickOutside}
              title="User menu"
              aria-label="User menu"
            >
              <span className="user-icon">👤</span>
            </button>

            {showProfileDropdown && (
              <div className="user-dropdown">
                <button className="user-dropdown-item">
                  <span className="item-icon">👤</span>
                  <span className="item-text">View Profile</span>
                </button>

                <div className="dropdown-divider"></div>

                <button className="user-dropdown-item logout-item">
                  <span className="item-icon">🚪</span>
                  <span className="item-text">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavigation;