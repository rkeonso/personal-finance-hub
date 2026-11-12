import React, { useState, useRef } from 'react';
import { uploadTransactionsCSV } from '../api/services';

export default function CsvUploader({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

   if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile); 

  }
};

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setStatus({ type: null, message: '' });

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setStatus({
        type: 'error',
        message: 'Invalid file format. Please upload a standard .csv statement.',
      });
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus({
        type: 'error',
        message: 'File size exceeds the 5MB limit.',
      });
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

    const handleUpload = async () => {
      if (!selectedFile) {
        setErrorMsg('Please select or drop a CSV file first.');
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setStatus({ type: 'loading', message: 'Uploading CSV...' });

      try {
        const data = await uploadTransactionsCSV(selectedFile);

        setSuccessMsg(`Successfully imported ${data.count} transactions.`);
        setStatus({ type: 'success', message: 'CSV imported successfully.' });
        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        if (onUploadSuccess) onUploadSuccess();
      } catch (err) {
        console.error('Upload error:', err);
        const errorMessage =
          err.response?.data?.error || err.message || 'Failed to upload CSV';
        setErrorMsg(errorMessage);
        setStatus({ type: 'error', message: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };


  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Import CSV Statements</h3>
      <p style={styles.subheading}>
        Upload standard export files with columns: <code>Date</code>, <code>Description</code>, <code>Amount</code>, <code>Category</code>.
      </p>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,text/csv"
        style={{ display: 'none' }}
      />

      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-300 hover:border-indigo-400'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >

        <div style={styles.iconContainer}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: isDragging ? '#059669' : '#64748b' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {selectedFile ? (
          <div>
            <p style={styles.fileName}>{selectedFile.name}</p>
            <span style={styles.fileSize}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ) : (
          <div>
            <p style={styles.promptText}>
              <strong>Click to upload</strong> or drag and drop your CSV here
            </p>
            <span style={styles.hintText}>Up to 5MB</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {selectedFile && (
        <div style={styles.actions}>
          <button
            onClick={() => handleUpload()}
            disabled={isLoading}
            style={{
              ...styles.uploadButton,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Processing & Ingesting...' : 'Upload Transactions'}
          </button>
        </div>
      )}

      {/* Status Notifications */}
      {status.message && (
        <div
          style={{
            ...styles.alert,
            backgroundColor: status.type === 'error' ? '#fef2f2' : '#f0fdf4',
            borderColor: status.type === 'error' ? '#fecaca' : '#bbf7d0',
            color: status.type === 'error' ? '#991b1b' : '#166534',
          }}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '540px',
    margin: '20px auto',
  },
  heading: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subheading: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 20px 0',
    lineHeight: '1.4',
  },
  dropArea: {
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '32px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
  },
  dropAreaActive: {
    borderColor: '#059669',
    backgroundColor: '#ecfdf5',
  },
  iconContainer: {
    marginBottom: '10px',
  },
  promptText: {
    fontSize: '14px',
    color: '#334155',
    margin: '0 0 4px 0',
  },
  hintText: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 2px 0',
  },
  fileSize: {
    fontSize: '12px',
    color: '#64748b',
  },
  actions: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  uploadButton: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
  },
  alert: {
    marginTop: '16px',
    padding: '12px 16px',
    borderRadius: '6px',
    borderWidth: '1px',
    borderStyle: 'solid',
    fontSize: '13px',
  },
};