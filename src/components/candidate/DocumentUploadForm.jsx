import React, { useState, useEffect } from 'react';
import { candidateDocumentsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaUpload, FaCheckCircle, FaTimesCircle, FaFileAlt, FaTrash } from 'react-icons/fa';

const DocumentUploadForm = ({ selectedCandidateId, candidateId, onUploadComplete }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // Document types with their details
  const documentTypes = [
    { key: 'aadhar', label: 'Aadhar Card', required: true, icon: '🆔' },
    { key: 'pan', label: 'PAN Card', required: true, icon: '💳' },
    { key: 'photo', label: 'Passport Size Photo', required: true, icon: '📸' },
    { key: 'resume', label: 'Updated Resume/CV', required: true, icon: '📄' },
    { key: 'degree_certificate', label: 'Degree Certificate', required: true, icon: '🎓' },
    { key: 'mark_sheet', label: 'Mark Sheet / Transcripts', required: true, icon: '📝' },
    { key: 'experience_letter', label: 'Experience Letter', required: true, icon: '📋' },
    { key: 'relieving_letter', label: 'Relieving Letter', required: true, icon: '📑' },
    { key: 'salary_slip', label: 'Last 3 Months Salary Slips', required: true, icon: '💰' },
    { key: 'bank_statement', label: 'Bank Statement (Last 6 months)', required: true, icon: '🏦' },
    { key: 'medical_certificate', label: 'Medical Certificate', required: true, icon: '🏥' },
    { key: 'covid_certificate', label: 'COVID Vaccination Certificate', required: false, icon: '💉' },
  ];

  useEffect(() => {
    fetchDocuments();
  }, [selectedCandidateId]);

  const fetchDocuments = async () => {
    try {
      const response = await candidateDocumentsAPI.getByCandidate(selectedCandidateId);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, PDF, and DOC files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('selectedCandidateId', selectedCandidateId);
    formData.append('documentType', documentType);
    formData.append('documentName', file.name);

    setUploading(true);
    setUploadProgress({ ...uploadProgress, [documentType]: 0 });

    try {
      await candidateDocumentsAPI.upload(formData);
      
      toast.success(`${documentTypes.find(d => d.key === documentType)?.label} uploaded successfully!`);
      setUploadProgress({ ...uploadProgress, [documentType]: 100 });
      
      // Refresh documents list
      await fetchDocuments();
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
      setUploadProgress({ ...uploadProgress, [documentType]: -1 });
    } finally {
      setUploading(false);
      // Clear progress after 2 seconds
      setTimeout(() => {
        setUploadProgress({ ...uploadProgress, [documentType]: undefined });
      }, 2000);
    }
  };

  const handleDelete = async (docId, docType) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await candidateDocumentsAPI.delete(docId);
      toast.success('Document deleted successfully');
      await fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const getDocumentStatus = (docType) => {
    const doc = documents.find(d => d.documentType === docType);
    if (!doc) return { uploaded: false, status: null };
    
    return {
      uploaded: true,
      status: doc.verificationStatus,
      document: doc
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" /> Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaFileAlt className="mr-1" /> Pending Review
          </span>
        );
      default:
        return null;
    }
  };

  const calculateProgress = () => {
    const requiredDocs = documentTypes.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => getDocumentStatus(d.key).uploaded).length;
    return Math.round((uploadedRequired / requiredDocs.length) * 100);
  };

  const allRequiredUploaded = () => {
    const requiredDocs = documentTypes.filter(d => d.required);
    return requiredDocs.every(d => getDocumentStatus(d.key).uploaded);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Document Verification</h2>
        <p className="text-gray-600 mb-4">
          Please upload all required documents for verification. All documents must be clear and legible.
        </p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Upload Progress</span>
            <span className="text-sm font-medium text-primary-600">{calculateProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          {allRequiredUploaded() && (
            <p className="text-green-600 text-sm mt-2 flex items-center">
              <FaCheckCircle className="mr-2" />
              All required documents uploaded! Waiting for admin verification.
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h3 className="text-sm font-medium text-blue-800 mb-2">📌 Important Instructions:</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>All documents marked with <span className="text-red-600 font-bold">*</span> are mandatory</li>
            <li>COVID Vaccination Certificate is optional</li>
            <li>File size should not exceed 5MB per document</li>
            <li>Accepted formats: JPG, PNG, PDF, DOC, DOCX</li>
            <li>Ensure all documents are clear and text is readable</li>
            <li>For Aadhar & PAN: Front and back sides should be visible</li>
            <li>Photo: Passport size, recent, clear background</li>
            <li>Degree Certificate & Mark Sheets: All pages/semesters</li>
            <li>Experience & Relieving Letters: From all previous employers</li>
            <li>Salary Slips: Last 3 months (combine into one PDF if possible)</li>
            <li>Bank Statement: Last 6 months showing salary credits</li>
            <li>Medical Certificate: From a registered medical practitioner</li>
          </ul>
        </div>
      </div>

      {/* Document Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((docType) => {
          const docStatus = getDocumentStatus(docType.key);
          const progress = uploadProgress[docType.key];

          return (
            <div
              key={docType.key}
              className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
                docStatus.uploaded
                  ? docStatus.status === 'verified'
                    ? 'border-green-500'
                    : docStatus.status === 'rejected'
                    ? 'border-red-500'
                    : 'border-yellow-500'
                  : docType.required
                  ? 'border-gray-300'
                  : 'border-dashed border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{docType.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {docType.label}
                      {docType.required && <span className="text-red-600 ml-1">*</span>}
                    </h3>
                    {!docType.required && (
                      <span className="text-xs text-gray-500">(Optional)</span>
                    )}
                  </div>
                </div>
                {docStatus.uploaded && getStatusBadge(docStatus.status)}
              </div>

              {/* Upload Progress */}
              {progress !== undefined && progress >= 0 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Document Info or Upload Button */}
              {docStatus.uploaded ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center space-x-2">
                      <FaFileAlt className="text-gray-600" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {docStatus.document.documentName}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(docStatus.document.id, docType.key)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete document"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  {docStatus.status === 'rejected' && docStatus.document.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{docStatus.document.rejectionReason}</p>
                      <p className="text-xs text-red-600 mt-2">Please upload a new document</p>
                    </div>
                  )}

                  {/* Re-upload option for rejected documents */}
                  {docStatus.status === 'rejected' && (
                    <label className="btn-secondary w-full flex items-center justify-center cursor-pointer">
                      <FaUpload className="mr-2" />
                      Re-upload Document
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleFileUpload(docType.key, e.target.files[0]);
                          }
                        }}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <label className="btn-primary w-full flex items-center justify-center cursor-pointer">
                  <FaUpload className="mr-2" />
                  Upload {docType.label}
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(docType.key, e.target.files[0]);
                      }
                    }}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📊 Upload Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
            <p className="text-sm text-gray-600">Total Uploaded</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.verificationStatus === 'verified').length}
            </p>
            <p className="text-sm text-gray-600">Verified</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => d.verificationStatus === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">
              {documents.filter(d => d.verificationStatus === 'rejected').length}
            </p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadForm;
