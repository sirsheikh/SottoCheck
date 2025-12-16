import React from 'react';
import './HomePage.css'; // Assuming a CSS file for styling

function HomePage() {
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>Welcome to AI Content Detection Platform</h1>
        <p className="tagline">
          Combat misinformation with advanced AI detection for images and videos.
        </p>
        <div className="value-proposition">
          <h3>Why use our platform?</h3>
          <ul>
            <li>Accurate AI detection for various media types.</li>
            <li>Comprehensive contextual information (reverse search, fact-checks, metadata).</li>
            <li>Easy-to-use interface for quick analysis.</li>
          </ul>
        </div>
      </header>

      <section className="quick-start-guide">
        <h2>Quick Start Guide</h2>
        <ol>
          <li>Click on the "Analyze Media" link to go to the analysis page.</li>
          <li>Upload your image/video file or paste a URL.</li>
          <li>View AI detection results and explore contextual information.</li>
        </ol>
      </section>

      <section className="recent-statistics">
        <h2>Recent Detection Statistics (Mock Data)</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>5,000+</h3>
            <p>Media Analyzed This Week</p>
          </div>
          <div className="stat-card">
            <h3>90%</h3>
            <p>AI-Generated Content Detected</p>
          </div>
          <div className="stat-card">
            <h3>200+</h3>
            <p>Debunked Claims Linked</p>
          </div>
        </div>
      </section>

      <footer className="homepage-footer">
        <p>&copy; 2025 AI Content Detection Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
