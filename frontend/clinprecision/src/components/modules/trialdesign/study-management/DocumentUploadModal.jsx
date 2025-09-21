// src/components/modules/trialdesign/study-management/DocumentUploadModal.jsx
import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import StudyDocumentService from '../../../../services/StudyDocumentService';

/**
 * Modal for uploading documents to a study
 */
const DocumentUploadModal = ({ isOpen, onClose, studyId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const documentTypes = StudyDocumentService.getDocumentTypes();

    const handleFileChange = (selectedFile) => {
        if (selectedFile) {
            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (selectedFile.size > maxSize) {
                setError('File size must be less than 10MB');
                return;
            }

            // Validate file type (basic validation)
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'image/jpeg',
                'image/png',
                'image/gif'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                setError('File type not supported. Please upload PDF, Word, Excel, text, or image files.');
                return;
            }

            setFile(selectedFile);
            setError('');
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        if (!documentType) {
            setError('Please select a document type');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create a mock document object
            const mockDocument = {
                fileName: file.name,
                fileSize: file.size,
                documentType: documentType,
                description: description,
                uploadedAt: new Date().toISOString(),
                uploadedBy: 1, // Mock user ID
                status: 'ACTIVE'
            };

            console.log('Document uploaded successfully (in-memory):', mockDocument);

            // Reset form
            setFile(null);
            setDocumentType('');
            setDescription('');

            // Notify parent component
            if (onUploadSuccess) {
                onUploadSuccess(mockDocument);
            }

            // Close modal
            onClose();

        } catch (error) {
            console.error('Upload failed:', error);
            setError('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setFile(null);
            setDocumentType('');
            setDescription('');
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
                    <button
                        onClick={handleClose}
                        disabled={uploading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Select File *
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : file
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files[0])}
                                disabled={uploading}
                            />

                            {file ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">
                                        {file.name}
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                    <div className="text-sm text-gray-600">
                                        Click to select or drag and drop a file
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        PDF, Word, Excel, Text, or Image files (max 10MB)
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Document Type */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Document Type *
                        </label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            disabled={uploading}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                            <option value="">Select document type...</option>
                            {documentTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploading}
                            rows={3}
                            placeholder="Enter a description for this document..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={uploading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !file || !documentType}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Upload</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentUploadModal;