import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const SyllabusUploadModal = ({ examData, onUpload, onClose }) => {
  const [uploadData, setUploadData] = useState({
    file: null,
    title: '',
    curriculum: examData.curriculum || 'JSS',
    subject: examData.subject || '',
    description: ''
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (file) => {
    setUploadError('');
    
    if (!file) return;
    
    // Validate file
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
      return;
    }
    
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }
    
    setUploadData(prev => ({ ...prev, file }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    if (!uploadData.title.trim()) {
      setUploadError('Please provide a title for the syllabus.');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('syllabusFile', uploadData.file);
      formData.append('title', uploadData.title.trim());
      formData.append('curriculum', uploadData.curriculum);
      formData.append('subject', uploadData.subject.trim());
      if (uploadData.description.trim()) {
        formData.append('description', uploadData.description.trim());
      }
      
      await onUpload(formData);
      setUploadSuccess(true);
      
      // Auto-close after successful upload
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  if (uploadSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h3>
            <p className="text-gray-600">
              Your syllabus has been uploaded and is ready for use in question generation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Upload Syllabus</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Syllabus Document
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="syllabusFile"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {uploadData.file ? (
                <div className="flex items-center justify-center space-x-3">
                  {getFileIcon(uploadData.file.type)}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{uploadData.file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(uploadData.file.size)}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your syllabus file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports PDF, DOC, DOCX, TXT files up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={uploadData.title}
                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Form 2 Geography Syllabus"
                required
              />
            </div>

            <div>
              <label htmlFor="curriculum" className="block text-sm font-medium text-gray-700 mb-1">
                Curriculum *
              </label>
              <select
                id="curriculum"
                value={uploadData.curriculum}
                onChange={(e) => setUploadData(prev => ({ ...prev, curriculum: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="JSS">Junior Secondary School</option>
                <option value="SSS">Senior Secondary School</option>
                <option value="Primary">Primary</option>
                <option value="University">University</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={uploadData.subject}
              onChange={(e) => setUploadData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Geography, Mathematics, English"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the syllabus content..."
            />
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600">{uploadError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !uploadData.file}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Syllabus</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SyllabusUploadModal;