import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUpload, FaCheckCircle, FaTimesCircle, FaFileAlt, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { API_URL } from '../services/api';

const CandidateDocumentUpload = () => {
  const { selectedCandidateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [actualSelectedCandidateId, setActualSelectedCandidateId] = useState(selectedCandidateId);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailEdit, setShowEmailEdit] = useState(false);

  // Get email from URL query parameter
  const email = searchParams.get('email');

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
    { key: 'medical_certificate', label: 'Medical Fitness Certificate', required: true, icon: '🏥' },
    { key: 'covid_certificate', label: 'COVID Vaccination Certificate', required: false, icon: '💉' },
  ];

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        if (email) {
          // Set email input and fetch by email
          setEmailInput(email);
          setLoading(true);
          await fetchCandidateByEmail(email);
        } else if (selectedCandidateId) {
          // Use ID from URL params
          setLoading(true);
          setActualSelectedCandidateId(selectedCandidateId);
        } else {
          // No email or ID provided, show email input form
          setLoading(false);
          setShowEmailEdit(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
        setShowEmailEdit(true);
      }
    };

    initializeComponent();
  }, []);

  // Load documents when actualSelectedCandidateId changes
  useEffect(() => {
    const loadData = async () => {
      if (actualSelectedCandidateId) {
        try {
          await fetchDocuments();
          if (!candidateInfo) {
            await fetchCandidateInfo();
          }
        } catch (error) {
          console.error('Error loading data:', error);
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, [actualSelectedCandidateId]);

  const fetchCandidateByEmail = async (emailToFetch = email) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/selected-candidates/by-email/${emailToFetch}`);
      if (response.data.data) {
        setActualSelectedCandidateId(response.data.data.id);
        setCandidateInfo(response.data.data);
        setShowEmailEdit(false);
        toast.success('Candidate information loaded successfully!');
        // Don't set loading to false here - let fetchDocuments handle it
      } else {
        toast.error('No selected candidate found with this email');
        setLoading(false);
        setShowEmailEdit(true);
      }
    } catch (error) {
      console.error('Error fetching candidate by email:', error);
      toast.error('Invalid email or candidate not found');
      setLoading(false);
      setShowEmailEdit(true);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (emailInput && emailInput.includes('@')) {
      fetchCandidateByEmail(emailInput);
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  const fetchCandidateInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/selected-candidates/${actualSelectedCandidateId}`);
      setCandidateInfo(response.data.data);
    } catch (error) {
      console.error('Error fetching candidate info:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/candidate-documents/candidate/${actualSelectedCandidateId}`
      );
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
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, JPG, PNG, and DOC files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('selectedCandidateId', actualSelectedCandidateId);

    try {
      setUploading(true);
      setUploadProgress({ ...uploadProgress, [documentType]: 0 });

      await axios.post(`${API_URL}/candidate-documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ ...uploadProgress, [documentType]: percentCompleted });
        },
      });

      toast.success(`${documentType} uploaded successfully!`);
      fetchDocuments();
      setUploadProgress({ ...uploadProgress, [documentType]: 100 });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
      setUploadProgress({ ...uploadProgress, [documentType]: 0 });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId, documentType) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete(`${API_URL}/candidate-documents/${docId}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const getDocumentStatus = (docType) => {
    const doc = documents.find((d) => d.documentType === docType);
    if (!doc) return null;

    const statusConfig = {
      pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: '⏳ Pending Review', icon: <FaFileAlt /> },
      verified: { color: 'text-green-600', bg: 'bg-green-50', label: '✓ Verified', icon: <FaCheckCircle /> },
      rejected: { color: 'text-red-600', bg: 'bg-red-50', label: '✗ Rejected', icon: <FaTimesCircle /> },
    };

    return {
      ...statusConfig[doc.verificationStatus],
      doc,
    };
  };

  const calculateProgress = () => {
    const requiredDocs = documentTypes.filter((dt) => dt.required);
    const uploadedRequiredDocs = requiredDocs.filter((dt) =>
      documents.some((d) => d.documentType === dt.key)
    );
    return Math.round((uploadedRequiredDocs.length / requiredDocs.length) * 100);
  };

  const allRequiredDocsUploaded = () => {
    const requiredDocs = documentTypes.filter((dt) => dt.required);
    return requiredDocs.every((dt) => documents.some((d) => d.documentType === dt.key));
  };

  if (loading && !showEmailEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show email input form if no candidate info loaded or email needs editing
  if ((!candidateInfo && !actualSelectedCandidateId) || showEmailEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Document Upload</h1>
              <p className="text-gray-600">Enter your email to access your document upload form</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Use the email address you provided in your job application
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Continue to Document Upload
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> Make sure you're using the same email address that was used in your job application.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Document Upload</h1>
                {candidateInfo && (
                  <div className="mt-1">
                    <p className="text-gray-600">
                      Welcome, {candidateInfo.candidate?.fullName || 'Candidate'}
                    </p>
                    <p className="text-sm text-gray-500">
                      📧 {candidateInfo.candidate?.email || emailInput}
                      <button
                        onClick={() => setShowEmailEdit(true)}
                        className="ml-2 text-blue-600 hover:text-blue-700 underline text-xs"
                      >
                        Change Email
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-blue-600">{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {documents.length} of {documentTypes.filter((dt) => dt.required).length} required
              documents uploaded
            </p>
          </div>

          {allRequiredDocsUploaded() && (
            <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-green-800 font-semibold">
                ✅ All required documents have been uploaded successfully!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Our HR team will review your documents shortly.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Important Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>• Upload clear, readable scans or photos of your documents</li>
            <li>• Accepted formats: PDF, JPG, PNG, DOC</li>
            <li>• Maximum file size: 5MB per document</li>
            <li>• All documents marked with (*) are mandatory</li>
            <li>• Documents will be verified by HR within 24-48 hours</li>
          </ul>
        </div>

        {/* Document Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentTypes.map((docType) => {
            const status = getDocumentStatus(docType.key);

            return (
              <div
                key={docType.key}
                className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
                  status?.doc?.verificationStatus === 'verified'
                    ? 'border-green-300'
                    : status?.doc?.verificationStatus === 'rejected'
                    ? 'border-red-300'
                    : status?.doc
                    ? 'border-yellow-300'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{docType.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {docType.label}
                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {status && (
                        <div className={`flex items-center space-x-1 mt-1 ${status.color}`}>
                          {status.icon}
                          <span className="text-sm font-medium">{status.label}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {status?.doc && (
                    <button
                      onClick={() => deleteDocument(status.doc.id, docType.key)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Delete document"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                {status?.doc?.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {status.doc.rejectionReason}
                  </div>
                )}

                {status?.doc ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 truncate">
                      📄 {status.doc.documentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(status.doc.uploadedDate).toLocaleDateString()}
                    </p>
                    {status.doc.verificationStatus === 'rejected' && (
                      <label className="block">
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(docType.key, e.target.files[0])}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          disabled={uploading}
                        />
                        <div className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-center transition-colors">
                          <FaUpload className="inline mr-2" />
                          Re-upload Document
                        </div>
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(docType.key, e.target.files[0])}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      disabled={uploading}
                    />
                    <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer text-center transition-all bg-gray-50 hover:bg-blue-50">
                      <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload {docType.label.toLowerCase()}
                      </span>
                    </div>
                  </label>
                )}

                {uploadProgress[docType.key] > 0 && uploadProgress[docType.key] < 100 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress[docType.key]}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Uploading... {uploadProgress[docType.key]}%
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {allRequiredDocsUploaded() && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              🎉 All Documents Submitted!
            </h3>
            <p className="text-gray-600 mb-4">
              Thank you for submitting all required documents. Our HR team will review them and
              notify you of the verification status.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDocumentUpload;
