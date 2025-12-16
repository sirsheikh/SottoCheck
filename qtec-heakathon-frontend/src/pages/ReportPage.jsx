import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ReportPage.css'; // Assuming a CSS file for styling

function ReportPage() {
  const { analysisId } = useParams(); // Assuming an analysis ID is passed via route
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, you would fetch report data from your backend
    // using the analysisId. For now, we'll use mock data.
    if (analysisId) {
      setLoading(true);
      setError(null);
      // Simulate API call
      setTimeout(() => {
        const mockData = {
          id: analysisId,
          mediaUrl: `https://example.com/analyzed-media-${analysisId}.jpg`,
          analysisDate: new Date().toLocaleString(),
          aiDetection: {
            adult: 'VERY_UNLIKELY',
            spoof: 'UNLIKELY',
            medical: 'POSSIBLE',
            violence: 'VERY_UNLIKELY',
            racy: 'UNLIKELY',
          },
          reverseSearch: {
            message: 'Reverse image search results for https://example.com/analyzed-media-123.jpg',
            source_url: 'https://example.com/analyzed-media-123.jpg',
            results: [
              {
                title: 'Similar Image Found on Blog Post',
                url: 'https://blog.example.com/post-1.html',
                snippet: 'Early appearance in a tech blog.',
                thumbnail: 'https://via.placeholder.com/70',
              },
            ],
            earliest_appearance: 'https://original.site/image.jpg (2023-01-01)',
          },
          factCheck: {
            message: 'Fact-checking results for: "AI generated image"',
            query: 'AI generated image',
            results: [
              {
                title: 'Fact-Check: Tools to Spot AI-Generated Content',
                url: 'https://factcheck.org/tools-to-spot-ai-content/',
                publisher: 'FactCheck.org',
                rating: 'Informative',
                snippet: 'Overview of methods and tools to identify AI-generated images.',
              },
            ],
          },
          metadata: {
            source_url: `https://example.com/analyzed-media-${analysisId}.jpg`,
            content_type: 'image/jpeg',
            content_length: '500000',
            exif: {
              Make: 'MockCamera',
              Model: 'Mock-D5000',
              DateTimeOriginal: '2024:01:15 10:30:00',
            },
          },
          sourceVerification: {
            message: 'Source verification results for https://example.com/analyzed-media-123.jpg',
            verified_url: 'https://example.com/analyzed-media-123.jpg',
            original_source: {
              url: 'https://original-source.com/report.html',
              name: 'Original Reporter',
              published_date: '2023-01-01 08:00:00',
            },
            publication_timeline: [
              { date: '2023-01-01', event: 'First published by Original Reporter' },
              { date: '2023-01-02', event: 'Shared widely on Twitter' },
            ],
            related_verified_news: [
              { title: 'Verified: Source is Legitimate', url: 'https://verifiednews.com/legitimate-source', publisher: 'Verified News' },
            ],
          }
        };
        setReportData(mockData);
        setLoading(false);
      }, 1000);
    } else {
      setError('No analysis ID provided.');
      setLoading(false);
    }
  }, [analysisId]);

  if (loading) return <div className="report-loading">Loading report...</div>;
  if (error) return <div className="report-error">Error: {error}</div>;
  if (!reportData) return <div className="report-empty">No report data found.</div>;

  const handleDownloadReport = () => {
    alert('Download functionality not implemented yet!');
    // Implement PDF/Image generation and download here
  };

  const handleShareReport = () => {
    alert('Share functionality not implemented yet!');
    // Implement social media sharing or link copying here
  };

  return (
    <div className="report-page-container">
      <header className="report-header">
        <h1>Analysis Report for ID: {reportData.id}</h1>
        <p>Generated on: {reportData.analysisDate}</p>
        <div className="report-actions">
          <button onClick={handleDownloadReport}>Download Report</button>
          <button onClick={handleShareReport}>Share Report</button>
        </div>
      </header>

      <section className="report-section ai-detection">
        <h2>Google Vision Safe Search Results</h2>
        {(() => {
          const likelihoodColors = {
            'VERY_LIKELY': 'red',
            'LIKELY': 'orange',
            'POSSIBLE': 'gold',
            'UNLIKELY': 'green',
            'VERY_UNLIKELY': 'green',
            'UNKNOWN': 'gray',
          };
          const getLikelihoodColor = (likelihood) => likelihoodColors[likelihood] || 'gray';

          return (
            <div>
              <p>Adult: <span style={{ color: getLikelihoodColor(reportData.aiDetection.adult), fontWeight: 'bold' }}>{reportData.aiDetection.adult}</span></p>
              <p>Spoof: <span style={{ color: getLikelihoodColor(reportData.aiDetection.spoof), fontWeight: 'bold' }}>{reportData.aiDetection.spoof}</span></p>
              <p>Medical: <span style={{ color: getLikelihoodColor(reportData.aiDetection.medical), fontWeight: 'bold' }}>{reportData.aiDetection.medical}</span></p>
              <p>Violence: <span style={{ color: getLikelihoodColor(reportData.aiDetection.violence), fontWeight: 'bold' }}>{reportData.aiDetection.violence}</span></p>
              <p>Racy: <span style={{ color: getLikelihoodColor(reportData.aiDetection.racy), fontWeight: 'bold' }}>{reportData.aiDetection.racy}</span></p>
            </div>
          );
        })()}
      </section>

      {reportData.reverseSearch && (
        <section className="report-section reverse-search-report">
          <h2>Reverse Image Search</h2>
          {reportData.reverseSearch.earliest_appearance && (
            <p><strong>Earliest Appearance:</strong> <a href={reportData.reverseSearch.earliest_appearance.split(' ')[0]} target="_blank" rel="noopener noreferrer">{reportData.reverseSearch.earliest_appearance.split(' ')[0]}</a> ({reportData.reverseSearch.earliest_appearance.split('(')[1]}</p>
          )}
          {reportData.reverseSearch.results && reportData.reverseSearch.results.length > 0 && (
            <div>
              <h3>Similar Images Found:</h3>
              <div className="similar-images-grid">
                {reportData.reverseSearch.results.map((result, index) => (
                  <div key={index} className="similar-image-card">
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      <img src={result.thumbnail} alt={result.title} />
                      <p>{result.title}</p>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {reportData.factCheck && (
        <section className="report-section fact-check-report">
          <h2>Fact-Checking Results</h2>
          {reportData.factCheck.results && reportData.factCheck.results.length > 0 ? (
            <ul>
              {reportData.factCheck.results.map((result, index) => (
                <li key={index}>
                  <a href={result.url} target="_blank" rel="noopener noreferrer">{result.title}</a>
                  <p>Publisher: {result.publisher} - Rating: <strong>{result.rating}</strong></p>
                  <p>{result.snippet}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No related fact-checks found.</p>
          )}
        </section>
      )}

      {reportData.metadata && (
        <section className="report-section metadata-report">
          <h2>Metadata Analysis</h2>
          <p><strong>Source URL:</strong> <a href={reportData.metadata.source_url} target="_blank" rel="noopener noreferrer">{reportData.metadata.source_url}</a></p>
          <p><strong>Content Type:</strong> {reportData.metadata.content_type}</p>
          <p><strong>Content Length:</strong> {reportData.metadata.content_length} bytes</p>
          {reportData.metadata.exif && (
            <div>
              <h3>EXIF Data:</h3>
              <ul>
                {Object.entries(reportData.metadata.exif).map(([key, value]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {reportData.sourceVerification && (
        <section className="report-section source-verification-report">
          <h2>Source Verification</h2>
          {reportData.sourceVerification.original_source && (
            <p><strong>Original Source:</strong> <a href={reportData.sourceVerification.original_source.url} target="_blank" rel="noopener noreferrer">
              {reportData.sourceVerification.original_source.name}
            </a> (Published: {reportData.sourceVerification.original_source.published_date})</p>
          )}
          {reportData.sourceVerification.publication_timeline && reportData.sourceVerification.publication_timeline.length > 0 && (
            <div>
              <h3>Publication Timeline:</h3>
              <ul>
                {reportData.sourceVerification.publication_timeline.map((item, index) => (
                  <li key={index}><strong>{item.date}:</strong> {item.event}</li>
                ))}
              </ul>
            </div>
          )}
          {reportData.sourceVerification.related_verified_news && reportData.sourceVerification.related_verified_news.length > 0 && (
            <div>
              <h3>Related Verified News:</h3>
              <ul>
                {reportData.sourceVerification.related_verified_news.map((item, index) => (
                  <li key={index}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a> ({item.publisher})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <footer className="report-footer">
        <p>&copy; 2025 AI Content Detection Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ReportPage;
