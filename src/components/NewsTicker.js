import React, { useState, useEffect } from 'react';
import newsService from '../services/newsService';

const NewsTicker = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchCricketNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await newsService.fetchCricketNews(8);
      
      if (response.success) {
        setNews(response.data);
      } else {
        setError(response.error);
        setNews(response.data); // Fallback to mock data
      }
    } catch (err) {
      console.error('Error in NewsTicker:', err);
      setError('Failed to load news');
      setNews(newsService.getMockNews());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCricketNews();
  }, []);

  // Auto-advance news ticker
  useEffect(() => {
    if (news.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % news.length);
      }, 6000); // Change every 6 seconds

      return () => clearInterval(interval);
    }
  }, [news.length]);

  const handlePrevNews = () => {
    setCurrentIndex(prev => prev === 0 ? news.length - 1 : prev - 1);
  };

  const handleNextNews = () => {
    setCurrentIndex(prev => (prev + 1) % news.length);
  };

  const handleRefresh = () => {
    fetchCricketNews();
  };

  if (loading) {
    return (
      <div className="news-ticker-section">
        <div className="news-section-header">
          <div className="news-section-title">
            <span className="news-icon">📰</span>
            Cricket News
          </div>
        </div>
        <div className="news-ticker-card">
          <div className="news-ticker-content">
            <div className="news-loading">Loading latest cricket news...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="news-ticker-section">
        <div className="news-section-header">
          <div className="news-section-title">
            <span className="news-icon">📰</span>
            Cricket News
          </div>
        </div>
        <div className="news-ticker-card">
          <div className="news-ticker-content">
            <div className="news-error">No news available at the moment</div>
          </div>
        </div>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className="news-ticker-section">
      {/* Header with title and navigation - outside card */}
      <div className="news-section-header">
        <div className="news-section-title">
          <span className="news-icon">📰</span>
          Cricket News
        </div>
        <div className="news-header-controls">
          <div className="news-counter">
            {currentIndex + 1} / {news.length}
          </div>
          <div className="news-navigation-controls">
            <button className="news-nav-btn" onClick={handlePrevNews} title="Previous news">‹</button>
            <button className="news-nav-btn" onClick={handleNextNews} title="Next news">›</button>
          </div>
        </div>
      </div>

      {/* Card with only image and news content */}
      <div className="news-ticker-card">
        <div className="news-ticker-content">
          {currentNews.image_url && (
            <div className="news-image">
              <img 
                src={currentNews.image_url} 
                alt={currentNews.title}
                onError={(e) => {
                  // Replace with a cricket-themed placeholder
                  e.target.style.display = 'none';
                  e.target.parentNode.classList.add('image-failed');
                  e.target.parentNode.innerHTML = '<div class="image-placeholder">🏏</div>';
                }}
              />
            </div>
          )}
          <div className="news-text">
            <div className="news-main-content">
              <div className="news-headline">
                {currentNews.title}
              </div>
              <div className="news-description">
                {currentNews.description}
              </div>
            </div>
            <div className="news-meta">
              <span className="news-source">{currentNews.source_name}</span>
              <span className="news-date">{newsService.formatDate(currentNews.pubDate)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dotted navigation indicators - outside card */}
      <div className="news-indicators">
        {news.map((_, index) => (
          <button
            key={index}
            className={`news-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            title={`Go to news ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;