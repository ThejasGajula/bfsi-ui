import React, { useState } from 'react';
import Button from '../FormElements/Button';
import '../../styles/components.css';

const DocumentUpload = ({ formData, onChange }) => {
    const [uploadStatus, setUploadStatus] = useState({});
    const [uploading, setUploading] = useState({});

    const documents = [
        { id: 'ssn', label: 'Social Security Number (SSN)', endpoint: '/api/upload/ssn', required: true },
        { id: 'drivers_license', label: 'Driver\'s License', endpoint: '/api/upload/drivers-license', required: true },
        { id: 'passport', label: 'Passport', endpoint: '/api/upload/passport', required: false },
        { id: 'w2_form', label: 'W2 Form', endpoint: '/api/upload/w2', required: true },
        { id: 'paystubs', label: 'Pay Stubs (Recent 2 months)', endpoint: '/api/upload/paystubs', required: true },
        { id: 'bank_statements', label: 'Bank Statements (Recent 3 months)', endpoint: '/api/upload/bank-statements', required: true }
    ];

    const handleFileChange = async (docId, endpoint, file) => {
        if (!file) return;

        setUploading(prev => ({ ...prev, [docId]: true }));
        setUploadStatus(prev => ({ ...prev, [docId]: { status: 'uploading', message: 'Uploading...' } }));

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('document_type', docId);

            // Simulate API call (replace with actual backend endpoint)
            console.log(`Uploading ${docId} to ${endpoint}`, file);

            // TODO: Replace with actual API call
            // const response = await fetch(endpoint, {
            //   method: 'POST',
            //   body: formData
            // });

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate success
            setUploadStatus(prev => ({
                ...prev,
                [docId]: {
                    status: 'success',
                    message: 'Uploaded successfully',
                    fileName: file.name,
                    fileSize: (file.size / 1024).toFixed(2) + ' KB'
                }
            }));

            // Update form data
            onChange({
                target: {
                    name: 'documents',
                    value: {
                        ...formData.documents,
                        [docId]: {
                            fileName: file.name,
                            fileSize: file.size,
                            uploadedAt: new Date().toISOString()
                        }
                    }
                }
            });

        } catch (error) {
            setUploadStatus(prev => ({
                ...prev,
                [docId]: {
                    status: 'error',
                    message: 'Upload failed. Please try again.'
                }
            }));
            console.error(`Error uploading ${docId}:`, error);
        } finally {
            setUploading(prev => ({ ...prev, [docId]: false }));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'uploading':
                return '⏳';
            case 'success':
                return '✓';
            case 'error':
                return '✗';
            default:
                return '';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'uploading':
                return 'var(--accent-color)';
            case 'success':
                return 'var(--success-color)';
            case 'error':
                return 'var(--error-color)';
            default:
                return 'var(--text-muted)';
        }
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="card-title">Document Upload</h2>
                <p className="card-subtitle">Please upload the required documents for verification</p>
            </div>

            <div style={{
                background: 'rgba(79, 172, 254, 0.05)',
                border: '1px solid rgba(79, 172, 254, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                    📋 <strong>Document Requirements:</strong>
                </p>
                <ul style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginLeft: 'var(--spacing-lg)' }}>
                    <li>Files must be in PDF, JPG, or PNG format</li>
                    <li>Maximum file size: 10MB per document</li>
                    <li>Documents must be clear and legible</li>
                    <li>All required documents must be uploaded to proceed</li>
                </ul>
            </div>

            {documents.map((doc) => (
                <div key={doc.id} className="dynamic-list-item" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--spacing-xs)'
                        }}>
                            {doc.label}
                            {doc.required && <span style={{ color: 'var(--error-color)', marginLeft: '4px' }}>*</span>}
                        </label>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            Endpoint: {doc.endpoint}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <label style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'var(--bg-glass)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-base)'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(doc.id, doc.endpoint, e.target.files[0])}
                                disabled={uploading[doc.id]}
                                style={{ display: 'none' }}
                            />
                            <span style={{ fontSize: '20px' }}>📎</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                {uploadStatus[doc.id]?.fileName || 'Choose file...'}
                            </span>
                        </label>

                        {uploadStatus[doc.id] && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-xs)',
                                color: getStatusColor(uploadStatus[doc.id].status),
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 500
                            }}>
                                <span style={{ fontSize: '18px' }}>{getStatusIcon(uploadStatus[doc.id].status)}</span>
                                <span>{uploadStatus[doc.id].message}</span>
                                {uploadStatus[doc.id].fileSize && (
                                    <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--spacing-xs)' }}>
                                        ({uploadStatus[doc.id].fileSize})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {uploading[doc.id] && (
                        <div style={{
                            marginTop: 'var(--spacing-sm)',
                            height: '4px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                background: 'var(--accent-gradient)',
                                animation: 'progress 1.5s ease-in-out infinite',
                                width: '50%'
                            }} />
                        </div>
                    )}
                </div>
            ))}

            <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
        </div>
    );
};

export default DocumentUpload;
