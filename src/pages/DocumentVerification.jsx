import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaDownload, FaEye, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../services/api';

const DocumentVerification = () => {
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const documentTypeLabels = {
    aadhar: '🆔 Aadhar Card',
    pan: '💳 PAN Card',
    photo: '📷 Photo',
    resume: '📝 Resume',
    degree_certificate: '🎓 Degree',
    mark_sheet: '📊 Mark Sheet',
    experience_letter: '💼 Experience',
    relieving_letter: '📄 Relieving',
    salary_slip: '💰 Salary Slip',
    other: '📎 Other',
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Auto-select candidate if navigated from Selected Candidates page
  useEffect(() => {
    if (location.state?.selectedCandidateId && candidates.length > 0) {
      const candidate = candidates.find(c => c.id === location.state.selectedCandidateId);
      if (candidate) {
        viewCandidateDocuments(candidate);
        // Clear the state to prevent re-selection on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [candidates, location.state]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/selected-candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Get unique candidates who have uploaded documents
      const candidatesData = response.data.data || [];
      
      // Fetch document counts for each candidate
      const candidatesWithDocs = await Promise.all(
        candidatesData.map(async (candidate) => {
          try {
            const docsResponse = await axios.get(
              `${API_URL}/candidate-documents/candidate/${candidate.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const docs = docsResponse.data.data || [];
            return {
              ...candidate,
              totalDocs: docs.length,
              pendingDocs: docs.filter(d => d.verificationStatus === 'pending').length,
              verifiedDocs: docs.filter(d => d.verificationStatus === 'verified').length,
              rejectedDocs: docs.filter(d => d.verificationStatus === 'rejected').length,
            };
          } catch {
            return {
              ...candidate,
              totalDocs: 0,
              pendingDocs: 0,
              verifiedDocs: 0,
              rejectedDocs: 0,
            };
          }
        })
      );
      
      // Filter only candidates with documents
      setCandidates(candidatesWithDocs.filter(c => c.totalDocs > 0));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (candidateId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/candidate-documents/candidate/${candidateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const viewCandidateDocuments = (candidate) => {
    setSelectedCandidate(candidate);
    fetchDocuments(candidate.id);
  };

  const backToCandidateList = () => {
    setSelectedCandidate(null);
    setDocuments([]);
    fetchCandidates();
  };

  const verifyDocument = async (docId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/candidate-documents/${docId}/verify`,
        { verificationStatus: 'verified' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Document verified successfully');
      fetchDocuments(selectedCandidate.id);
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document');
    }
  };

  const openRejectModal = (doc) => {
    setSelectedDoc(doc);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const rejectDocument = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/candidate-documents/${selectedDoc.id}/verify`,
        {
          verificationStatus: 'rejected',
          rejectionReason: rejectionReason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Document rejected');
      setShowRejectModal(false);
      fetchDocuments(selectedCandidate.id);
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error('Failed to reject document');
    }
  };

  const downloadDocument = async (docId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/candidate-documents/${docId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Document downloaded');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
      verified: { color: 'bg-green-100 text-green-800', label: '✓ Verified' },
      rejected: { color: 'bg-red-100 text-red-800', label: '✗ Rejected' },
    };
    const style = config[status] || config.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.color}`}>
        {style.label}
      </span>
    );
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus = filterStatus === 'all' || doc.verificationStatus === filterStatus;
    return matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // If viewing specific candidate's documents
  if (selectedCandidate) {
    return (
      <div className="p-6">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center">
          <button
            onClick={backToCandidateList}
            className="mr-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Candidates</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedCandidate.candidate?.fullName || 'Candidate'}'s Documents
            </h1>
            <p className="text-gray-600 mt-1">
              {selectedCandidate.candidate?.email} • {selectedCandidate.job?.title}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center space-x-4">
            <FaFilter className="text-gray-500" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {documents.filter((d) => d.verificationStatus === 'pending').length}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Verified</p>
                <p className="text-3xl font-bold text-green-800">
                  {documents.filter((d) => d.verificationStatus === 'verified').length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-800">
                  {documents.filter((d) => d.verificationStatus === 'rejected').length}
                </p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No documents found
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white border-2 rounded-lg p-4 transition-all shadow-md ${
                  doc.verificationStatus === 'verified'
                    ? 'border-green-300 bg-green-50'
                    : doc.verificationStatus === 'rejected'
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {documentTypeLabels[doc.documentType]?.split(' ')[0] || '📎'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {documentTypeLabels[doc.documentType] || doc.documentType}
                        </h3>
                        <p className="text-sm text-gray-600">{doc.documentName}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {doc.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {doc.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(doc.verificationStatus)}

                    <button
                      onClick={() => downloadDocument(doc.id, doc.documentName)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                      title="Download"
                    >
                      <FaDownload />
                    </button>

                    {doc.verificationStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => verifyDocument(doc.id)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                          title="Verify"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => openRejectModal(doc)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Reject Document</h2>
              <p className="text-gray-600 mb-4">
                Document: <strong>{selectedDoc?.documentName}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  rows="4"
                  placeholder="Please provide a clear reason for rejection..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={rejectDocument}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main candidates table view
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Document Verification</h1>
        <p className="text-gray-600 mt-2">Select a candidate to review and verify their documents</p>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Candidate Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Total Docs
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Pending
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Verified
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Rejected
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No candidates with uploaded documents found
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {candidate.candidate?.fullName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{candidate.candidate?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.job?.title || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{candidate.job?.department || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {candidate.totalDocs}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      {candidate.pendingDocs}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {candidate.verifiedDocs}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                      {candidate.rejectedDocs}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => viewCandidateDocuments(candidate)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all inline-flex items-center space-x-2"
                    >
                      <FaEye />
                      <span>View Documents</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentVerification;
