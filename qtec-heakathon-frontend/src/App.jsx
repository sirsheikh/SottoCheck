import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({}); // { fileName: { status: 'uploading' | 'success' | 'error', message: '' } }
  const [uploadResponse, setUploadResponse] = useState({});
  const [urlInput, setUrlInput] = useState('');
  const [urlAnalysisStatus, setUrlAnalysisStatus] = useState({}); // { url: { status: 'analyzing' | 'success' | 'error', message: '' } }

  const [reverseSearchResults, setReverseSearchResults] = useState({}); // { sourceUrl: { status: 'searching' | 'success' | 'error', message: '', data: [] } }
  const [reverseSearchStatus, setReverseSearchStatus] = useState({});

  const [factCheckQuery, setFactCheckQuery] = useState('');
  const [factCheckResults, setFactCheckResults] = useState(null);
  const [factCheckStatus, setFactCheckStatus] = useState({}); // { status: 'searching' | 'success' | 'error', message: '' }

  const [metadataResults, setMetadataResults] = useState({}); // { sourceUrl: { status: 'fetching' | 'success' | 'error', message: '', data: {} } }
  const [metadataStatus, setMetadataStatus] = useState({});

  const [sourceVerificationResults, setSourceVerificationResults] = useState({}); // { sourceUrl: { status: 'verifying' | 'success' | 'error', message: '', data: {} } }
  const [sourceVerificationStatus, setSourceVerificationStatus] = useState({});

  const handleVerifySource = async (sourceUrl) => {
    if (!sourceUrl) {
      setSourceVerificationStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: 'Source URL cannot be empty.' } }));
      return;
    }

    setSourceVerificationStatus(prev => ({ ...prev, [sourceUrl]: { status: 'verifying', message: 'Verifying source...' } }));
    setSourceVerificationResults(prev => ({ ...prev, [sourceUrl]: null })); // Clear previous results

    try {
      const response = await fetch('/api/verify-source', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: sourceUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setSourceVerificationResults(prev => ({ ...prev, [sourceUrl]: data }));
        setSourceVerificationStatus(prev => ({ ...prev, [sourceUrl]: { status: 'success', message: 'Source verification successful!' } }));
        console.log('Source verification success:', data);
      } else {
        setSourceVerificationStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: data.message || 'Source verification failed.' } }));
        console.error('Source verification failed:', data);
      }
    } catch (error) {
      setSourceVerificationStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: error.message || 'Network error during source verification.' } }));
      console.error('Network error during source verification:', error);
    }
  };

  const handleGetMetadata = async (sourceUrl) => {
    if (!sourceUrl) {
      setMetadataStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: 'Source URL cannot be empty.' } }));
      return;
    }

    setMetadataStatus(prev => ({ ...prev, [sourceUrl]: { status: 'fetching', message: 'Fetching metadata...' } }));
    setMetadataResults(prev => ({ ...prev, [sourceUrl]: null })); // Clear previous results

    try {
      // Use URLSearchParams for GET request
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(sourceUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMetadataResults(prev => ({ ...prev, [sourceUrl]: data }));
        setMetadataStatus(prev => ({ ...prev, [sourceUrl]: { status: 'success', message: 'Metadata fetched successfully!' } }));
        console.log('Metadata success:', data);
      } else {
        setMetadataStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: data.message || 'Failed to fetch metadata.' } }));
        console.error('Metadata failed:', data);
      }
    } catch (error) {
      setMetadataStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: error.message || 'Network error during metadata fetch.' } }));
      console.error('Network error during metadata fetch:', error);
    }
  };

  const handleFactCheckSubmit = async () => {
    if (!factCheckQuery) {
      setFactCheckStatus({ status: 'error', message: 'Fact-check query cannot be empty.' });
      return;
    }

    setFactCheckStatus({ status: 'searching', message: 'Searching for fact-checks...' });
    setFactCheckResults(null); // Clear previous results

    try {
      const response = await fetch('/api/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: factCheckQuery }),
      });

      const data = await response.json();

      if (response.ok) {
        setFactCheckResults(data.results);
        setFactCheckStatus({ status: 'success', message: 'Fact-check successful!' });
        console.log('Fact-check success:', data);
      } else {
        setFactCheckStatus({ status: 'error', message: data.message || 'Fact-check failed.' });
        console.error('Fact-check failed:', data);
      }
    } catch (error) {
      setFactCheckStatus({ status: 'error', message: error.message || 'Network error during fact-check.' });
      console.error('Network error during fact-check:', error);
    }
  };

  const handleReverseSearch = async (sourceUrl) => {
    if (!sourceUrl) {
      setReverseSearchStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: 'Source URL cannot be empty.' } }));
      return;
    }

    setReverseSearchStatus(prev => ({ ...prev, [sourceUrl]: { status: 'searching', message: 'Performing reverse search...' } }));
    setReverseSearchResults(prev => ({ ...prev, [sourceUrl]: null })); // Clear previous results

    try {
      const response = await fetch('/api/reverse-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: sourceUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setReverseSearchResults(prev => ({ ...prev, [sourceUrl]: data.results }));
        setReverseSearchStatus(prev => ({ ...prev, [sourceUrl]: { status: 'success', message: 'Reverse search successful!' } }));
        console.log('Reverse search success:', data);
      } else {
        setReverseSearchStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: data.message || 'Reverse search failed.' } }));
        console.error('Reverse search failed:', data);
      }
    } catch (error) {
      setReverseSearchStatus(prev => ({ ...prev, [sourceUrl]: { status: 'error', message: error.message || 'Network error during reverse search.' } }));
      console.error('Network error during reverse search:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    // Handle accepted files
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))]);

    // Handle file rejections
    fileRejections.forEach(({ file, errors }) => {
      console.log('Rejected file:', file.name, errors);
      setUploadStatus(prev => ({
        ...prev,
        [file.name]: { status: 'error', message: errors.map(e => e.message).join(', ') }
      }));
    });

    // Upload accepted files immediately
    for (const file of acceptedFiles) {
      setUploadStatus(prev => ({ ...prev, [file.name]: { status: 'uploading', message: 'Uploading...' } }));
      const formData = new FormData();
      formData.append('media', file);

      try {
        const response = await fetch('/api/analyze/upload', { // Adjust URL if needed
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setUploadStatus(prev => ({ ...prev, [file.name]: { status: 'success', message: 'Upload successful!' } }));
          setUploadResponse(prev => ({ ...prev, [file.name]: data }));
          console.log('Upload success:', data);
        } else {
          setUploadStatus(prev => ({ ...prev, [file.name]: { status: 'error', message: data.message || 'Upload failed.' } }));
          console.error('Upload failed:', data);
        }
      } catch (error) {
        setUploadStatus(prev => ({ ...prev, [file.name]: { status: 'error', message: error.message || 'Network error.' } }));
        console.error('Network error during upload:', error);
      }
    }
  }, []);

  const handleUrlSubmit = async () => {
    if (!urlInput) {
      setUrlAnalysisStatus({ status: 'error', message: 'URL cannot be empty.' });
      return;
    }

    setUrlAnalysisStatus({ status: 'analyzing', message: 'Analyzing URL...' });
    try {
      const response = await fetch('/api/analyze/url', { // Adjust URL if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await response.json();

      if (response.ok) {
        setUrlAnalysisStatus({ status: 'success', message: 'URL analysis successful!', data: data });
        console.log('URL analysis success:', data);
      } else {
        setUrlAnalysisStatus({ status: 'error', message: data.message || 'URL analysis failed.' });
        console.error('URL analysis failed:', data);
      }
    } catch (error) {
      setUrlAnalysisStatus({ status: 'error', message: error.message || 'Network error during URL analysis.' });
      console.error('Network error during URL analysis:', error);
    }
  };

const displayAnalysisResult = (googleVisionResponse) => {
    if (!googleVisionResponse) {
      return <p>No detailed analysis result available from Google Vision.</p>;
    }

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
      <div className="google-vision-results">
        <h4>Google Vision Safe Search Results:</h4>
        <p>Adult: <span style={{ color: getLikelihoodColor(googleVisionResponse.adult), fontWeight: 'bold' }}>{googleVisionResponse.adult}</span></p>
        <p>Spoof: <span style={{ color: getLikelihoodColor(googleVisionResponse.spoof), fontWeight: 'bold' }}>{googleVisionResponse.spoof}</span></p>
        <p>Medical: <span style={{ color: getLikelihoodColor(googleVisionResponse.medical), fontWeight: 'bold' }}>{googleVisionResponse.medical}</span></p>
        <p>Violence: <span style={{ color: getLikelihoodColor(googleVisionResponse.violence), fontWeight: 'bold' }}>{googleVisionResponse.violence}</span></p>
        <p>Racy: <span style={{ color: getLikelihoodColor(googleVisionResponse.racy), fontWeight: 'bold' }}>{googleVisionResponse.racy}</span></p>
      </div>
    );
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
      'video/mp4': [],
      'video/quicktime': [], // .mov
      'video/x-msvideo': [], // .avi
    },
    maxSize: 200 * 1024 * 1024, // 200MB
  });

  const acceptedFileItems = files.map(file => (
    <li key={file.name}>
      {file.type.startsWith('image/') && <img src={file.preview} alt={file.name} className="file-preview-thumbnail" />}
      {file.type.startsWith('video/') && <video src={file.preview} controls className="file-preview-thumbnail" />}
      {file.name} - {file.size} bytes
                <span className={`upload-status ${uploadStatus[file.name]?.status}`}>
                  ({uploadStatus[file.name]?.status === 'uploading' ? 'Analyzing...' : uploadStatus[file.name]?.message})
                </span>      {uploadResponse[file.name] && uploadResponse[file.name].google_vision_response && (
        <div>
          {displayAnalysisResult(uploadResponse[file.name].google_vision_response)}
          {uploadResponse[file.name].source && (
            <button onClick={() => handleReverseSearch(uploadResponse[file.name].source)} disabled={reverseSearchStatus[uploadResponse[file.name].source]?.status === 'searching'}>
              {reverseSearchStatus[uploadResponse[file.name].source]?.status === 'searching' ? 'Searching...' : 'Reverse Search Image'}
            </button>
          )}
          {reverseSearchStatus[uploadResponse[file.name].source]?.status === 'error' && (
            <p className="error-message">{reverseSearchStatus[uploadResponse[file.name].source].message}</p>
          )}
          {reverseSearchResults[uploadResponse[file.name].source] && (
            <div className="reverse-search-results">
              <h4>Similar Images:</h4>
              <ul>
                {reverseSearchResults[uploadResponse[file.name].source].map((result, index) => (
                  <li key={index}>
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      <img src={result.thumbnail} alt={result.title} />
                      {result.title}
                    </a>
                    <p>{result.snippet}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {uploadResponse[file.name].source && (
            <button onClick={() => handleGetMetadata(uploadResponse[file.name].source)} disabled={metadataStatus[uploadResponse[file.name].source]?.status === 'fetching'}>
              {metadataStatus[uploadResponse[file.name].source]?.status === 'fetching' ? 'Fetching Metadata...' : 'Get Metadata'}
            </button>
          )}
          {metadataStatus[uploadResponse[file.name].source]?.status === 'error' && (
            <p className="error-message">{metadataStatus[uploadResponse[file.name].source].message}</p>
          )}
          {metadataResults[uploadResponse[file.name].source] && (
            <div className="metadata-results">
              <h4>Metadata:</h4>
              <p><strong>Content Type:</strong> {metadataResults[uploadResponse[file.name].source].content_type}</p>
              <p><strong>Content Length:</strong> {metadataResults[uploadResponse[file.name].source].content_length} bytes</p>
              {metadataResults[uploadResponse[file.name].source].exif && (
                <div>
                  <h5>EXIF Data:</h5>
                  <ul>
                    {Object.entries(metadataResults[uploadResponse[file.name].source].exif).map(([key, value]) => (
                      <li key={key}><strong>{key}:</strong> {value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {uploadResponse[file.name].source && (
            <button onClick={() => handleVerifySource(uploadResponse[file.name].source)} disabled={sourceVerificationStatus[uploadResponse[file.name].source]?.status === 'verifying'}>
              {sourceVerificationStatus[uploadResponse[file.name].source]?.status === 'verifying' ? 'Verifying Source...' : 'Verify Source'}
            </button>
          )}
          {sourceVerificationStatus[uploadResponse[file.name].source]?.status === 'error' && (
            <p className="error-message">{sourceVerificationStatus[uploadResponse[file.name].source].message}</p>
          )}
          {sourceVerificationResults[uploadResponse[file.name].source] && (
            <div className="source-verification-results">
              <h4>Source Verification:</h4>
              {sourceVerificationResults[uploadResponse[file.name].source].original_source && (
                <p><strong>Original Source:</strong> <a href={sourceVerificationResults[uploadResponse[file.name].source].original_source.url} target="_blank" rel="noopener noreferrer">
                  {sourceVerificationResults[uploadResponse[file.name].source].original_source.name}
                </a> (Published: {sourceVerificationResults[uploadResponse[file.name].source].original_source.published_date})</p>
              )}
              {sourceVerificationResults[uploadResponse[file.name].source].publication_timeline && sourceVerificationResults[uploadResponse[file.name].source].publication_timeline.length > 0 && (
                <div>
                  <h5>Publication Timeline:</h5>
                  <ul>
                    {sourceVerificationResults[uploadResponse[file.name].source].publication_timeline.map((item, index) => (
                      <li key={index}><strong>{item.date}:</strong> {item.event}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sourceVerificationResults[uploadResponse[file.name].source].related_verified_news && sourceVerificationResults[uploadResponse[file.name].source].related_verified_news.length > 0 && (
                <div>
                  <h5>Related Verified News:</h5>
                  <ul>
                    {sourceVerificationResults[uploadResponse[file.name].source].related_verified_news.map((item, index) => (
                      <li key={index}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a> ({item.publisher})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.name} className="rejected-file">
      {file.name} - {file.size} bytes
      <ul>
        {errors.map(e => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Content Detection Platform</h1>
        
        {/* URL Input Section */}
        <div className="url-input-section">
          <h2>Analyze from URL</h2>
          <input
            type="text"
            placeholder="Enter media URL here"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="url-input"
          />
          <button onClick={handleUrlSubmit} className="url-submit-button">Analyze URL</button>
          {urlAnalysisStatus.message && (
            <p className={`url-analysis-status ${urlAnalysisStatus.status}`}>
              {urlAnalysisStatus.status === 'analyzing' ? 'Analyzing...' : urlAnalysisStatus.message}
            </p>
          )}
          {urlAnalysisStatus.data && urlAnalysisStatus.data.google_vision_response && (
            <div>
              {displayAnalysisResult(urlAnalysisStatus.data.google_vision_response)}
              {urlInput && ( // Use urlInput for reverse search as it's the primary source
                <button onClick={() => handleReverseSearch(urlInput)} disabled={reverseSearchStatus[urlInput]?.status === 'searching'}>
                  {reverseSearchStatus[urlInput]?.status === 'searching' ? 'Searching...' : 'Reverse Search URL'}
                </button>
              )}
              {reverseSearchStatus[urlInput]?.status === 'error' && (
                <p className="error-message">{reverseSearchStatus[urlInput].message}</p>
              )}
              {reverseSearchResults[urlInput] && (
                <div className="reverse-search-results">
                  <h4>Similar Images:</h4>
                  <ul>
                    {reverseSearchResults[urlInput].map((result, index) => (
                      <li key={index}>
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          <img src={result.thumbnail} alt={result.title} />
                          {result.title}
                        </a>
                        <p>{result.snippet}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {urlInput && (
                <button onClick={() => handleGetMetadata(urlInput)} disabled={metadataStatus[urlInput]?.status === 'fetching'}>
                  {metadataStatus[urlInput]?.status === 'fetching' ? 'Fetching Metadata...' : 'Get Metadata'}
                </button>
              )}
              {metadataStatus[urlInput]?.status === 'error' && (
                <p className="error-message">{metadataStatus[urlInput].message}</p>
              )}
              {metadataResults[urlInput] && (
                <div className="metadata-results">
                  <h4>Metadata:</h4>
                  <p><strong>Content Type:</strong> {metadataResults[urlInput].content_type}</p>
                  <p><strong>Content Length:</strong> {metadataResults[urlInput].content_length} bytes</p>
                  {metadataResults[urlInput].exif && (
                    <div>
                      <h5>EXIF Data:</h5>
                      <ul>
                        {Object.entries(metadataResults[urlInput].exif).map(([key, value]) => (
                          <li key={key}><strong>{key}:</strong> {value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {urlInput && (
                <button onClick={() => handleVerifySource(urlInput)} disabled={sourceVerificationStatus[urlInput]?.status === 'verifying'}>
                  {sourceVerificationStatus[urlInput]?.status === 'verifying' ? 'Verifying Source...' : 'Verify Source'}
                </button>
              )}
              {sourceVerificationStatus[urlInput]?.status === 'error' && (
                <p className="error-message">{sourceVerificationStatus[urlInput].message}</p>
              )}
              {sourceVerificationResults[urlInput] && (
                <div className="source-verification-results">
                  <h4>Source Verification:</h4>
                  {sourceVerificationResults[urlInput].original_source && (
                    <p><strong>Original Source:</strong> <a href={sourceVerificationResults[urlInput].original_source.url} target="_blank" rel="noopener noreferrer">
                      {sourceVerificationResults[urlInput].original_source.name}
                    </a> (Published: {sourceVerificationResults[urlInput].original_source.published_date})</p>
                  )}
                  {sourceVerificationResults[urlInput].publication_timeline && sourceVerificationResults[urlInput].publication_timeline.length > 0 && (
                    <div>
                      <h5>Publication Timeline:</h5>
                      <ul>
                        {sourceVerificationResults[urlInput].publication_timeline.map((item, index) => (
                          <li key={index}><strong>{item.date}:</strong> {item.event}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {sourceVerificationResults[urlInput].related_verified_news && sourceVerificationResults[urlInput].related_verified_news.length > 0 && (
                    <div>
                      <h5>Related Verified News:</h5>
                      <ul>
                        {sourceVerificationResults[urlInput].related_verified_news.map((item, index) => (
                          <li key={index}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a> ({item.publisher})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fact-Checking Section */}
        <div className="fact-check-section">
          <h2>Fact-Check Content</h2>
          <input
            type="text"
            placeholder="Enter keywords or content description"
            value={factCheckQuery}
            onChange={(e) => setFactCheckQuery(e.target.value)}
            className="fact-check-input"
          />
          <button onClick={handleFactCheckSubmit} className="fact-check-submit-button" disabled={factCheckStatus.status === 'searching'}>
            {factCheckStatus.status === 'searching' ? 'Searching...' : 'Fact-Check'}
          </button>
          {factCheckStatus.message && (
            <p className={`fact-check-status ${factCheckStatus.status}`}>
              {factCheckStatus.message}
            </p>
          )}
          {factCheckResults && factCheckResults.length > 0 && (
            <div className="fact-check-results">
              <h4>Related Fact-Checks:</h4>
              <ul>
                {factCheckResults.map((result, index) => (
                  <li key={index}>
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      {result.title}
                    </a>
                    <p>Publisher: {result.publisher} - Rating: <strong>{result.rating}</strong></p>
                    <p>{result.snippet}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {factCheckResults && factCheckResults.length === 0 && factCheckStatus.status === 'success' && (
            <p>No fact-checks found for your query.</p>
          )}
        </div>

        <h2>Upload File for Analysis</h2>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag 'n' drop some files here, or click to select files</p>
          }
          <p>Accepted formats: JPG, PNG, GIF, WEBP, MP4, MOV, AVI</p>
          <p>Max file size: 200MB</p>
        </div>

        <aside>
          <h4>Accepted Files</h4>
          <ul>{acceptedFileItems}</ul>
          <h4>Rejected Files</h4>
          <ul>{fileRejectionItems}</ul>
        </aside>
      </header>
    </div>
  );
}

export default App;
