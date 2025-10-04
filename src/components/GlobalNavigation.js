import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/figma-cricket-theme.css';

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
      svgIcon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      description: 'Dashboard & Overview'
    },
    
    // Match Management
    {
      path: '/match-management',
      label: 'Matches',
      icon: '🏏',
      svgIcon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      description: 'Schedule & Manage Matches'
    },
    
    // Live Scoring
    {
      path: '/scoring',
      label: 'Scoring',
      icon: '📊',
      svgIcon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      description: 'Live Match Scoring'
    },
    
    // Player & Team Management
    {
      path: '/player-management',
      label: 'Players',
      icon: '👥',
      svgIcon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      description: 'Player Database'
    },
    {
      path: '/team-management',
      label: 'Teams',
      icon: '⚡',
      svgIcon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      description: 'Team Organization'
    }
  ];

  const secondaryNavItems = [
    {
      path: '/match-setup',
      label: 'Setup',
      icon: '⚙️',
      svgIcon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      description: 'Match Setup'
    },
    {
      path: '/start-match',
      label: 'Start',
      icon: '▶️',
      svgIcon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
      description: 'Start New Match'
    },
    {
      path: '/scoreboard',
      label: 'Board',
      icon: '📋',
      svgIcon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      description: 'Scoreboard View'
    },
    {
      path: '/batting-view',
      label: 'Batting',
      icon: '🏃',
      svgIcon: 'M13 10V3L4 14h7v7l9-11h-7z',
      description: 'Batting Statistics'
    },
    {
      path: '/bowling-view',
      label: 'Bowling',
      icon: '🎯',
      svgIcon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122',
      description: 'Bowling Statistics'
    },
    {
      path: '/news',
      label: 'News',
      icon: '📰',
      svgIcon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      description: 'Cricket News'
    },
    {
      path: '/waiting-list',
      label: 'Waiting',
      icon: '⏳',
      svgIcon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
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