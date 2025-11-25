import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaStar, FaEnvelope, FaPhone, FaEye, FaFileDownload, FaBrain, FaFilter, FaTimes, FaCalendar } from 'react-icons/fa';
import axios from 'axios';
import InterviewScheduleModal from '../components/InterviewScheduleModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ShortlistedCandidates = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedForInterview, setSelectedForInterview] = useState(null);

  useEffect(() => {
    fetchPositions();
    fetchShortlisted();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [candidates, selectedPosition]);

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/positions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        setPositions(response.data.data);
      } else {
        setPositions([]);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
    }
  };

  const fetchShortlisted = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ai-matching/shortlisted`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCandidates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching shortlisted candidates:', error);
      toast.error('Failed to fetch shortlisted candidates');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!selectedPosition) {
      setFilteredCandidates(candidates);
    } else {
      setFilteredCandidates(
        candidates.filter(c => c.positionId === parseInt(selectedPosition))
      );
    }
  };

  const viewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  const openScheduleModal = (candidate) => {
    setSelectedForInterview(candidate);
    setShowScheduleModal(true);
  };

  const handleInterviewScheduled = () => {
    toast.success('📧 Interview invitation has been sent to the candidate!');
    setShowScheduleModal(false);
    setSelectedForInterview(null);
  };

  const downloadResume = (application) => {
    if (application.resumePath) {
      window.open(`${API_URL.replace('/api', '')}/uploads/${application.resumePath}`, '_blank');
    } else {
      toast.info('Resume not available');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaStar className="text-yellow-500" />
          Shortlisted Candidates
        </h1>
        <p className="text-gray-600 mt-2">
          Top candidates automatically shortlisted by AI based on matching scores
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 mb-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-lg font-semibold mb-2">Total Shortlisted Candidates</p>
            <p className="text-6xl font-bold">{candidates.length}</p>
          </div>
          <FaStar className="text-9xl text-yellow-200 opacity-30" />
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaFilter className="text-purple-500" />
            Filter by Position
          </h2>
          {selectedPosition && (
            <button
              onClick={() => setSelectedPosition('')}
              className="text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
            >
              <FaTimes /> Clear Filter
            </button>
          )}
        </div>
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">All Positions</option>
          {positions.map(pos => (
            <option key={pos.id} value={pos.id}>{pos.title} - {pos.department}</option>
          ))}
        </select>
        <div className="mt-3 text-sm text-gray-600">
          Showing <span className="font-bold text-purple-600">{filteredCandidates.length}</span> of {candidates.length} candidates
        </div>
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-200">
          <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-600 mb-2">No Shortlisted Candidates</h3>
          <p className="text-gray-500">
            {candidates.length === 0 
              ? 'No candidates have been shortlisted yet. Run AI matching on applications.'
              : 'No candidates found for selected position.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-2xl hover:scale-105"
            >
              {/* Card Header with Score */}
              <div className={`bg-gradient-to-r ${getScoreColor(candidate.overallScore)} text-white p-6 relative`}>
                <div className="absolute top-4 right-4">
                  <FaStar className="text-yellow-300 text-3xl drop-shadow-lg" />
                </div>
                <div className="text-6xl font-bold mb-2">{candidate.overallScore}%</div>
                <p className="text-white/90 font-semibold">Match Score</p>
              </div>

              {/* Candidate Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {candidate.Application?.fullName || 'N/A'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Applied for: <span className="font-semibold text-purple-600">
                    {candidate.Position?.title || 'N/A'}
                  </span>
                </p>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <a
                    href={`mailto:${candidate.Application?.email}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <FaEnvelope className="text-purple-500" />
                    <span className="truncate">{candidate.Application?.email || 'N/A'}</span>
                  </a>
                  {candidate.Application?.phone && (
                    <a
                      href={`tel:${candidate.Application.phone}`}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      <FaPhone className="text-purple-500" />
                      <span>{candidate.Application.phone}</span>
                    </a>
                  )}
                </div>

                {/* Top 3 Strengths */}
                {candidate.strengths && candidate.strengths.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">Top Strengths:</p>
                    <ul className="space-y-1">
                      {candidate.strengths.slice(0, 3).map((strength, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="line-clamp-1">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Score Breakdown Mini */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Skills</p>
                    <p className="text-lg font-bold text-blue-600">{candidate.skillsScore}%</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600">Experience</p>
                    <p className="text-lg font-bold text-green-600">{candidate.experienceScore}%</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => viewDetails(candidate)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <FaEye /> Details
                    </button>
                    <button
                      onClick={() => downloadResume(candidate.Application)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <FaFileDownload /> Resume
                    </button>
                  </div>
                  <button
                    onClick={() => openScheduleModal(candidate)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FaCalendar /> Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${getScoreColor(selectedCandidate.overallScore)} text-white p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaStar className="text-yellow-300 text-3xl" />
                    <h2 className="text-2xl font-bold">
                      {selectedCandidate.Application?.fullName || 'Candidate'}
                    </h2>
                  </div>
                  <p className="text-white/90">
                    Applied for: {selectedCandidate.Position?.title || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Overall Score */}
              <div className={`bg-gradient-to-r ${getScoreColor(selectedCandidate.overallScore)} bg-opacity-10 rounded-xl p-6 border-2 border-yellow-300`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 font-semibold mb-2">Overall Match Score</p>
                    <p className="text-6xl font-bold text-gray-800">{selectedCandidate.overallScore}%</p>
                  </div>
                  <FaStar className="text-yellow-500 text-7xl" />
                </div>
              </div>

              {/* Score Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Skills</p>
                  <p className="text-3xl font-bold text-blue-600">{selectedCandidate.skillsScore}%</p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Experience</p>
                  <p className="text-3xl font-bold text-green-600">{selectedCandidate.experienceScore}%</p>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Education</p>
                  <p className="text-3xl font-bold text-yellow-600">{selectedCandidate.educationScore}%</p>
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Relevance</p>
                  <p className="text-3xl font-bold text-purple-600">{selectedCandidate.relevanceScore}%</p>
                </div>
              </div>

              {/* AI Analysis */}
              {selectedCandidate.aiAnalysis && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaBrain className="text-blue-600" />
                    AI Analysis
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedCandidate.aiAnalysis}</p>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Strengths */}
                {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 text-green-700">
                      ✓ Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {selectedCandidate.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {selectedCandidate.weaknesses && selectedCandidate.weaknesses.length > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 text-yellow-700">
                      ⚠ Considerations
                    </h3>
                    <ul className="space-y-2">
                      {selectedCandidate.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-yellow-500 font-bold">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendation */}
              {selectedCandidate.recommendations && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Hiring Recommendation</h3>
                  <p className="text-xl font-semibold text-purple-700">{selectedCandidate.recommendations}</p>
                </div>
              )}

              {/* Contact Actions */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Candidate</h3>
                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedCandidate.Application?.email}`}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <FaEnvelope /> Send Email
                  </a>
                  {selectedCandidate.Application?.phone && (
                    <a
                      href={`tel:${selectedCandidate.Application.phone}`}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <FaPhone /> Call
                    </a>
                  )}
                  <button
                    onClick={() => downloadResume(selectedCandidate.Application)}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <FaFileDownload /> Resume
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Schedule Modal */}
      {showScheduleModal && selectedForInterview && (
        <InterviewScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedForInterview(null);
          }}
          application={selectedForInterview.Application}
          position={selectedForInterview.Position}
          onSuccess={handleInterviewScheduled}
        />
      )}
    </div>
  );
};

export default ShortlistedCandidates;
