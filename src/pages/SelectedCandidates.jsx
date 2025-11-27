import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaFileAlt, FaCheck, FaTimes, FaEye, FaCalendarAlt, FaCheckSquare, FaSquare } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../services/api';

const SelectedCandidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showJoiningModal, setShowJoiningModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bulk selection states
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [showBulkOfferModal, setShowBulkOfferModal] = useState(false);
  const [sendingBulkOffer, setSendingBulkOffer] = useState(false);

  // Form data for offer letter
  const [offerData, setOfferData] = useState({
    offeredSalary: '',
    offeredPosition: '',
    joiningDate: '',
    department: '',
    workLocation: '',
    acceptanceDeadline: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
  });

  // Form data for joining letter
  const [joiningData, setJoiningData] = useState({
    joiningDate: '',
    reportingTime: '9:30 AM',
    officeAddress: '',
    reportingManager: '',
    managerEmail: '',
    department: '',
    dressCode: 'Business Casual',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/selected-candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const candidatesData = response.data.data || [];
      
      // Fetch document verification status for each candidate
      const candidatesWithDocStatus = await Promise.all(
        candidatesData.map(async (candidate) => {
          try {
            const docsResponse = await axios.get(
              `${API_URL}/candidate-documents/candidate/${candidate.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const docs = docsResponse.data.data || [];
            const totalDocs = docs.length;
            const verifiedDocs = docs.filter(d => d.verificationStatus === 'verified').length;
            const pendingDocs = docs.filter(d => d.verificationStatus === 'pending').length;
            const rejectedDocs = docs.filter(d => d.verificationStatus === 'rejected').length;
            
            // Determine document status
            let documentStatus = 'No Documents';
            if (totalDocs > 0) {
              if (verifiedDocs === totalDocs) {
                documentStatus = 'All Verified';
              } else if (pendingDocs > 0) {
                documentStatus = 'Pending';
              } else if (rejectedDocs > 0) {
                documentStatus = 'Has Rejected';
              }
            }
            
            return {
              ...candidate,
              documentStatus,
              totalDocs,
              verifiedDocs,
              pendingDocs,
              rejectedDocs
            };
          } catch (error) {
            return {
              ...candidate,
              documentStatus: 'No Documents',
              totalDocs: 0,
              verifiedDocs: 0,
              pendingDocs: 0,
              rejectedDocs: 0
            };
          }
        })
      );
      
      setCandidates(candidatesWithDocStatus);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch selected candidates');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      selected: { color: 'bg-blue-100 text-blue-800', label: 'Selected' },
      offer_sent: { color: 'bg-purple-100 text-purple-800', label: 'Offer Sent' },
      offer_accepted: { color: 'bg-green-100 text-green-800', label: 'Offer Accepted' },
      offer_rejected: { color: 'bg-red-100 text-red-800', label: 'Offer Rejected' },
      documents_pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Docs Pending' },
      documents_submitted: { color: 'bg-orange-100 text-orange-800', label: 'Docs Submitted' },
      documents_verified: { color: 'bg-teal-100 text-teal-800', label: 'Docs Verified' },
      joining_letter_sent: { color: 'bg-indigo-100 text-indigo-800', label: 'Joining Letter Sent' },
      joined: { color: 'bg-emerald-100 text-emerald-800', label: '✓ Joined' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getDocumentStatusBadge = (documentStatus, totalDocs, verifiedDocs, pendingDocs) => {
    if (totalDocs === 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          📄 No Documents
        </span>
      );
    }

    if (documentStatus === 'All Verified') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          ✓ Verified ({verifiedDocs}/{totalDocs})
        </span>
      );
    }

    if (pendingDocs > 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          ⏳ Pending ({pendingDocs}/{totalDocs})
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
        📋 {documentStatus}
      </span>
    );
  };

  const openOfferModal = (candidate) => {
    setSelectedCandidate(candidate);
    setOfferData({
      offeredSalary: candidate.offeredSalary || '',
      offeredPosition: candidate.offeredPosition || candidate.job?.title || '',
      joiningDate: candidate.joiningDate ? candidate.joiningDate.split('T')[0] : '',
      department: candidate.job?.department || '',
      workLocation: candidate.job?.location || '',
      acceptanceDeadline: '',
      hrName: '',
      hrEmail: '',
      hrPhone: '',
    });
    setShowOfferModal(true);
  };

  const openJoiningModal = (candidate) => {
    setSelectedCandidate(candidate);
    setJoiningData({
      joiningDate: candidate.joiningDate ? candidate.joiningDate.split('T')[0] : '',
      reportingTime: '9:30 AM',
      officeAddress: candidate.job?.location || '',
      reportingManager: '',
      managerEmail: '',
      department: candidate.job?.department || '',
      dressCode: 'Business Casual',
      hrName: '',
      hrEmail: '',
      hrPhone: '',
    });
    setShowJoiningModal(true);
  };

  const sendOfferLetter = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/selected-candidates/${selectedCandidate.id}/send-offer`,
        offerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Offer letter sent successfully!');
      setShowOfferModal(false);
      fetchCandidates();
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error(error.response?.data?.message || 'Failed to send offer letter');
    }
  };

  const sendBulkOfferLetters = async () => {
    if (selectedCandidateIds.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    setSendingBulkOffer(true);
    try {
      const token = localStorage.getItem('token');
      
      // Send offer letters to all selected candidates
      const promises = selectedCandidateIds.map(candidateId =>
        axios.post(
          `${API_URL}/selected-candidates/${candidateId}/send-offer`,
          offerData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);
      
      toast.success(`✅ Offer letters sent to ${selectedCandidateIds.length} candidate(s) successfully!`);
      setShowBulkOfferModal(false);
      setSelectedCandidateIds([]);
      fetchCandidates();
    } catch (error) {
      console.error('Error sending bulk offers:', error);
      toast.error(error.response?.data?.message || 'Failed to send some offer letters');
    } finally {
      setSendingBulkOffer(false);
    }
  };

  // Toggle individual candidate selection
  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidateIds(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  // Toggle select all candidates
  const toggleSelectAll = () => {
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map(c => c.id));
    }
  };

  // Open bulk offer modal
  const openBulkOfferModal = () => {
    if (selectedCandidateIds.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }
    setShowBulkOfferModal(true);
  };

  const sendJoiningLetter = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/selected-candidates/${selectedCandidate.id}/send-joining-letter`,
        joiningData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Joining letter sent successfully!');
      setShowJoiningModal(false);
      fetchCandidates();
    } catch (error) {
      console.error('Error sending joining letter:', error);
      toast.error(error.response?.data?.message || 'Failed to send joining letter');
    }
  };

  const markAsJoined = async (candidateId) => {
    if (!window.confirm('Mark this candidate as joined?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/selected-candidates/${candidateId}`,
        { status: 'joined', actualJoinedDate: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Candidate marked as joined!');
      fetchCandidates();
    } catch (error) {
      console.error('Error marking as joined:', error);
      toast.error('Failed to update status');
    }
  };

  const cancelSelection = async (candidateId) => {
    if (!window.confirm('Are you sure you want to cancel this selection?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/selected-candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Selection cancelled');
      fetchCandidates();
    } catch (error) {
      console.error('Error cancelling selection:', error);
      toast.error('Failed to cancel selection');
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
    const matchesSearch =
      candidate.candidate?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading selected candidates...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Selected Candidates</h1>
        <p className="text-gray-600 mt-2">Manage candidates who have been selected after interviews</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="selected">Selected</option>
              <option value="offer_sent">Offer Sent</option>
              <option value="offer_accepted">Offer Accepted</option>
              <option value="documents_submitted">Docs Submitted</option>
              <option value="documents_verified">Docs Verified</option>
              <option value="joining_letter_sent">Joining Letter Sent</option>
              <option value="joined">Joined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedCandidateIds.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-purple-700 font-semibold">
              {selectedCandidateIds.length} candidate(s) selected
            </span>
            <button
              onClick={() => setSelectedCandidateIds([])}
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              Clear Selection
            </button>
          </div>
          <button
            onClick={openBulkOfferModal}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <FaEnvelope />
            Send Bulk Offer Letters
          </button>
        </div>
      )}

      {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 hover:text-purple-600"
                  >
                    {selectedCandidateIds.length === filteredCandidates.length && filteredCandidates.length > 0 ? (
                      <FaCheckSquare className="text-purple-600 text-lg" />
                    ) : (
                      <FaSquare className="text-gray-400 text-lg" />
                    )}
                    <span>Select All</span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selected Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary Offered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No selected candidates found
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleCandidateSelection(candidate.id)}
                        className="hover:scale-110 transition-transform"
                      >
                        {selectedCandidateIds.includes(candidate.id) ? (
                          <FaCheckSquare className="text-purple-600 text-xl" />
                        ) : (
                          <FaSquare className="text-gray-400 text-xl" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.candidate?.fullName}
                        </div>
                        <div className="text-sm text-gray-500">{candidate.candidate?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{candidate.job?.title}</div>
                      <div className="text-sm text-gray-500">{candidate.job?.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(candidate.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDocumentStatusBadge(
                        candidate.documentStatus,
                        candidate.totalDocs,
                        candidate.verifiedDocs,
                        candidate.pendingDocs
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(candidate.selectedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.offeredSalary
                        ? `₹${Number(candidate.offeredSalary).toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {/* Send Offer - Available for selected candidates or those who haven't accepted yet */}
                      {(candidate.status === 'selected' || candidate.status === 'offer_sent') && (
                        <button
                          onClick={() => openOfferModal(candidate)}
                          className="text-purple-600 hover:text-purple-900 transition-colors"
                          title="Send/Resend Offer Letter"
                        >
                          <FaEnvelope className="inline mr-1" /> 
                          {candidate.status === 'offer_sent' ? 'Resend Offer' : 'Send Offer'}
                        </button>
                      )}

                      {/* Send Joining Letter - Available after documents verified */}
                      {candidate.status === 'documents_verified' && (
                        <button
                          onClick={() => openJoiningModal(candidate)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Send Joining Letter"
                        >
                          <FaEnvelope className="inline mr-1" /> Joining
                        </button>
                      )}

                      {/* Mark as Joined - Available after joining letter sent */}
                      {candidate.status === 'joining_letter_sent' && (
                        <button
                          onClick={() => markAsJoined(candidate.id)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Mark as Joined"
                        >
                          <FaCheck className="inline mr-1" /> Joined
                        </button>
                      )}

                      <button
                        onClick={() => {
                          // Navigate to Document Verification page with candidate details
                          navigate('/admin/document-verification', {
                            state: { 
                              selectedCandidateId: candidate.id,
                              candidateName: candidate.candidate?.fullName,
                              candidateEmail: candidate.candidate?.email
                            }
                          });
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View & Verify Documents"
                      >
                        <FaFileAlt className="inline mr-1" /> Docs
                      </button>

                      {candidate.status !== 'joined' && candidate.status !== 'cancelled' && (
                        <button
                          onClick={() => cancelSelection(candidate.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Selection"
                        >
                          <FaTimes className="inline mr-1" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Letter Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Send Offer Letter</h2>
              <p className="text-gray-600 mb-6">
                Send offer letter to {selectedCandidate?.candidate?.fullName}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={offerData.offeredPosition}
                    onChange={(e) => setOfferData({ ...offerData, offeredPosition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Salary (₹) *
                  </label>
                  <input
                    type="number"
                    value={offerData.offeredSalary}
                    onChange={(e) => setOfferData({ ...offerData, offeredSalary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={offerData.department}
                    onChange={(e) => setOfferData({ ...offerData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Location *
                  </label>
                  <input
                    type="text"
                    value={offerData.workLocation}
                    onChange={(e) => setOfferData({ ...offerData, workLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joining Date *
                  </label>
                  <input
                    type="date"
                    value={offerData.joiningDate}
                    onChange={(e) => setOfferData({ ...offerData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acceptance Deadline *
                  </label>
                  <input
                    type="date"
                    value={offerData.acceptanceDeadline}
                    onChange={(e) => setOfferData({ ...offerData, acceptanceDeadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Name *</label>
                  <input
                    type="text"
                    value={offerData.hrName}
                    onChange={(e) => setOfferData({ ...offerData, hrName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Email *</label>
                  <input
                    type="email"
                    value={offerData.hrEmail}
                    onChange={(e) => setOfferData({ ...offerData, hrEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Phone *</label>
                  <input
                    type="tel"
                    value={offerData.hrPhone}
                    onChange={(e) => setOfferData({ ...offerData, hrPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendOfferLetter}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Send Offer Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Offer Letter Modal */}
      {showBulkOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-700">Send Bulk Offer Letters</h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700 font-semibold">
                  📨 Sending offer letters to {selectedCandidateIds.length} candidate(s)
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  All selected candidates will receive the same offer details below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={offerData.offeredPosition}
                    onChange={(e) => setOfferData({ ...offerData, offeredPosition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Salary (₹) *
                  </label>
                  <input
                    type="number"
                    value={offerData.offeredSalary}
                    onChange={(e) => setOfferData({ ...offerData, offeredSalary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={offerData.department}
                    onChange={(e) => setOfferData({ ...offerData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Location *
                  </label>
                  <input
                    type="text"
                    value={offerData.workLocation}
                    onChange={(e) => setOfferData({ ...offerData, workLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joining Date *
                  </label>
                  <input
                    type="date"
                    value={offerData.joiningDate}
                    onChange={(e) => setOfferData({ ...offerData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acceptance Deadline *
                  </label>
                  <input
                    type="date"
                    value={offerData.acceptanceDeadline}
                    onChange={(e) => setOfferData({ ...offerData, acceptanceDeadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Name *</label>
                  <input
                    type="text"
                    value={offerData.hrName}
                    onChange={(e) => setOfferData({ ...offerData, hrName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Email *</label>
                  <input
                    type="email"
                    value={offerData.hrEmail}
                    onChange={(e) => setOfferData({ ...offerData, hrEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Phone *</label>
                  <input
                    type="tel"
                    value={offerData.hrPhone}
                    onChange={(e) => setOfferData({ ...offerData, hrPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBulkOfferModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={sendingBulkOffer}
                >
                  Cancel
                </button>
                <button
                  onClick={sendBulkOfferLetters}
                  disabled={sendingBulkOffer}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {sendingBulkOffer ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      Send to {selectedCandidateIds.length} Candidate(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Joining Letter Modal */}
      {showJoiningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Send Joining Letter</h2>
              <p className="text-gray-600 mb-6">
                Send joining letter to {selectedCandidate?.candidate?.fullName}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joining Date *
                  </label>
                  <input
                    type="date"
                    value={joiningData.joiningDate}
                    onChange={(e) => setJoiningData({ ...joiningData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Time *
                  </label>
                  <input
                    type="text"
                    value={joiningData.reportingTime}
                    onChange={(e) => setJoiningData({ ...joiningData, reportingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 9:30 AM"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Address *
                  </label>
                  <textarea
                    value={joiningData.officeAddress}
                    onChange={(e) => setJoiningData({ ...joiningData, officeAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reporting Manager *
                  </label>
                  <input
                    type="text"
                    value={joiningData.reportingManager}
                    onChange={(e) => setJoiningData({ ...joiningData, reportingManager: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Email *
                  </label>
                  <input
                    type="email"
                    value={joiningData.managerEmail}
                    onChange={(e) => setJoiningData({ ...joiningData, managerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={joiningData.department}
                    onChange={(e) => setJoiningData({ ...joiningData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dress Code *
                  </label>
                  <select
                    value={joiningData.dressCode}
                    onChange={(e) => setJoiningData({ ...joiningData, dressCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="Business Formal">Business Formal</option>
                    <option value="Business Casual">Business Casual</option>
                    <option value="Smart Casual">Smart Casual</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Name *</label>
                  <input
                    type="text"
                    value={joiningData.hrName}
                    onChange={(e) => setJoiningData({ ...joiningData, hrName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Email *</label>
                  <input
                    type="email"
                    value={joiningData.hrEmail}
                    onChange={(e) => setJoiningData({ ...joiningData, hrEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Phone *</label>
                  <input
                    type="tel"
                    value={joiningData.hrPhone}
                    onChange={(e) => setJoiningData({ ...joiningData, hrPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowJoiningModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendJoiningLetter}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Send Joining Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedCandidates;
