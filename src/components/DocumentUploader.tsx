// Example component showing how to use the backend API
import React, { useState } from 'react';
import { geminiService } from '@/services/geminiService';

interface DocumentUploaderProps {
  onAnalysisComplete: (result: any) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onAnalysisComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Analyze document using the updated service
      const result = await geminiService.analyzeDocument(file, 'en');
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Call the callback with the result
      onAnalysisComplete(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="document-uploader">
      <div className="upload-area">
        <input
          type="file"
          accept=".pdf,.docx,.jpg,.jpeg,.png,.gif,.webp"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="file-input"
        />
        <div className="upload-content">
          {isUploading ? (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p>Processing document... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="upload-prompt">
              <p>📄 Upload a legal document</p>
              <p className="upload-hint">Supports PDF, DOCX, and image files</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}
    </div>
  );
};
