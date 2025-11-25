import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaCloudUploadAlt, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AcceptOffer = () => {
  const { id } = useParams(); // selected candidate ID
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState({});

  const documentTypes = [
    { type: 'aadhar', label: 'Aadhar Card', icon: '🆔', required: true },
    { type: 'pan', label: 'PAN Card', icon: '💳', required: true },
    { type: 'photo', label: 'Passport Size Photo', icon: '📷', required: true },
    { type: 'resume', label: 'Updated Resume', icon: '📝', required: true },
    { type: 'degree_certificate', label: 'Degree Certificate', icon: '🎓', required: false },
    { type: 'mark_sheet', label: 'Mark Sheets', icon: '📊', required: false },
    { type: 'experience_letter', label: 'Experience Letter', icon: '💼', required: false },
    { type: 'relieving_letter', label: 'Relieving Letter', icon: '📄', required: false },
  ];

  useEffect(() => {
    fetchCandidateData();
    fetchDocuments();
  }, [id]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      // This endpoint should be public or use a token from URL
      const response = await axios.get(`${API_URL}/selected-candidates/${id}`);
      setCandidate(response.data.data);
      setOfferAccepted(
        ['offer_accepted', 'documents_pending', 'documents_submitted', 'documents_verified'].includes(
          response.data.data?.status
        )
      );
    } catch (error) {
      console.error('Error fetching candidate:', error);
      toast.error('Invalid link or candidate not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/candidate-documents/candidate/${id}`);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const acceptOffer = async () => {
    try {
      await axios.put(`${API_URL}/selected-candidates/${id}`, {
        status: 'offer_accepted',
        offerAcceptedDate: new Date().toISOString(),
      });
      setOfferAccepted(true);
      toast.success('Offer accepted! Please upload the required documents.');
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer');
    }
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, PDF, and DOC files are allowed');
      return;
    }

    try {
      setUploadingDocs((prev) => ({ ...prev, [type]: true }));

      const formData = new FormData();
      formData.append('document', file);
      formData.append('selectedCandidateId', id);
      formData.append('documentType', type);
      formData.append('documentName', file.name);

      await axios.post(`${API_URL}/candidate-documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`${file.name} uploaded successfully!`);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [type]: false }));
    }
  };

  const getDocumentStatus = (type) => {
    const doc = documents.find((d) => d.documentType === type);
    if (!doc) return null;
    return doc.verificationStatus;
  };

  const getDocumentName = (type) => {
    const doc = documents.find((d) => d.documentType === type);
    return doc?.documentName || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h1>
          <p className="text-gray-600">This offer link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎉 Congratulations, {candidate.candidate?.name}!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              You have been offered the position of <strong>{candidate.offeredPosition}</strong>
            </p>
            {candidate.offeredSalary && (
              <p className="text-2xl font-bold text-purple-600 mb-4">
                Annual Salary: ₹{Number(candidate.offeredSalary).toLocaleString()}
              </p>
            )}
          </div>

          {!offerAccepted && candidate.status === 'offer_sent' && (
            <div className="mt-6 text-center">
              <button
                onClick={acceptOffer}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all"
              >
                Accept Offer
              </button>
              <p className="text-sm text-gray-500 mt-3">
                By accepting this offer, you agree to the terms and conditions mentioned in the offer letter.
              </p>
            </div>
          )}

          {offerAccepted && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <FaCheckCircle className="mr-2" />
                <span className="font-semibold">Offer Accepted</span>
              </div>
            </div>
          )}
        </div>

        {/* Document Upload Section */}
        {offerAccepted && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Required Documents</h2>
            <p className="text-gray-600 mb-6">
              Please upload the following documents to complete your onboarding process. All documents marked with * are mandatory.
            </p>

            <div className="space-y-4">
              {documentTypes.map((docType) => {
                const status = getDocumentStatus(docType.type);
                const fileName = getDocumentName(docType.type);
                const isUploading = uploadingDocs[docType.type];

                return (
                  <div
                    key={docType.type}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      status === 'verified'
                        ? 'border-green-300 bg-green-50'
                        : status === 'rejected'
                        ? 'border-red-300 bg-red-50'
                        : status === 'pending'
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-3xl">{docType.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {docType.label}
                            {docType.required && <span className="text-red-500 ml-1">*</span>}
                          </h3>
                          {fileName && (
                            <p className="text-sm text-gray-600 truncate">{fileName}</p>
                          )}
                          {!fileName && (
                            <p className="text-sm text-gray-500">
                              Max size: 5MB | Format: JPEG, PNG, PDF, DOC
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {status === 'verified' && (
                          <span className="flex items-center text-green-600 font-semibold">
                            <FaCheckCircle className="mr-1" /> Verified
                          </span>
                        )}
                        {status === 'rejected' && (
                          <span className="flex items-center text-red-600 font-semibold">
                            <FaTimesCircle className="mr-1" /> Rejected
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="flex items-center text-yellow-600 font-semibold">
                            <FaFileAlt className="mr-1" /> Pending Review
                          </span>
                        )}

                        {(!status || status === 'rejected') && (
                          <label
                            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
                              isUploading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            {isUploading ? (
                              <>Uploading...</>
                            ) : (
                              <>
                                <FaCloudUploadAlt className="inline mr-1" />
                                {status === 'rejected' ? 'Re-upload' : 'Upload'}
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                              onChange={(e) => handleFileUpload(docType.type, e.target.files[0])}
                              disabled={isUploading}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📝 Important Notes:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>All documents will be reviewed by our HR team</li>
                <li>You will be notified if any document is rejected</li>
                <li>Please ensure all documents are clear and readable</li>
                <li>Original documents will be verified on your joining date</li>
              </ul>
            </div>

            {documents.length > 0 && documents.every((doc) => doc.verificationStatus === 'verified') && (
              <div className="mt-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                <FaCheckCircle className="text-5xl text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  All Documents Verified! 🎉
                </h3>
                <p className="text-green-700">
                  Your joining letter will be sent to you shortly. We look forward to welcoming you to our team!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptOffer;
