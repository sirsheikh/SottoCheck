import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import App from './App.jsx'; // Our existing analysis page
import ReportPage from './pages/ReportPage.jsx'; // Import ReportPage

function AppRouter() {
  return (
    <>
      <nav className="main-navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/analyze">Analyze Media</Link>
          </li>
          <li>
            <Link to="/report/123">Sample Report</Link> {/* Link to a sample report */}
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<App />} />
        <Route path="/report/:analysisId" element={<ReportPage />} /> {/* Route for Report Page */}
      </Routes>
    </>
  );
}

export default AppRouter;
