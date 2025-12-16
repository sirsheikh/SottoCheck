import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState({}); // { fileName: { status: 'uploading' | 'success' | 'error', message: '' } }
  const [uploadResponse, setUploadResponse] = useState({});
  const [urlInput, setUrlInput] = useState('');
  const [urlAnalysisStatus, setUrlAnalysisStatus] = useState({}); // { url: { status: 'analyzing' | 'success' | 'error', message: '' } }

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
        const response = await fetch('http://localhost:8000/api/analyze/upload', { // Adjust URL if needed
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
      const response = await fetch('http://localhost:8000/api/analyze/url', { // Adjust URL if needed
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
                </span>      {uploadResponse[file.name] && uploadResponse[file.name].hive_ai_response && (
        <div>
          <h4>AI Detection Result:</h4>
          <pre>{JSON.stringify(uploadResponse[file.name].hive_ai_response, null, 2)}</pre>
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
          {urlAnalysisStatus.data && urlAnalysisStatus.data.hive_ai_response && (
            <div>
              <h4>AI Detection Result:</h4>
              <pre>{JSON.stringify(urlAnalysisStatus.data.hive_ai_response, null, 2)}</pre>
            </div>
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
