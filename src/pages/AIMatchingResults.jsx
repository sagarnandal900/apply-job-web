import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBrain, FaStar, FaEye, FaFilter, FaTimes, FaCheckCircle, FaTimesCircle, FaSpinner, FaDownload, FaChartBar, FaCalendar } from 'react-icons/fa';
import axios from 'axios';
import InterviewScheduleModal from '../components/InterviewScheduleModal';
import { API_URL } from '../services/api';

const AIMatchingResults = () => {
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedForInterview, setSelectedForInterview] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    positionId: '',
    minScore: 0,
    onlyShortlisted: false
  });
  
  const [positions, setPositions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    shortlisted: 0,
    avgScore: 0
  });

  useEffect(() => {
    fetchPositions();
    fetchResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [results, filters]);

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

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ai-matching/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setResults(data);
        
        // Calculate stats
        const total = data.length;
        const shortlisted = data.filter(r => r.isShortlisted).length;
        const avgScore = total > 0 
          ? (data.reduce((sum, r) => sum + r.overallScore, 0) / total).toFixed(1)
          : 0;
        
        setStats({ total, shortlisted, avgScore });
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch matching results');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    if (filters.positionId) {
      filtered = filtered.filter(r => r.positionId === parseInt(filters.positionId));
    }

    if (filters.minScore > 0) {
      filtered = filtered.filter(r => r.overallScore >= filters.minScore);
    }

    if (filters.onlyShortlisted) {
      filtered = filtered.filter(r => r.isShortlisted);
    }

    setFilteredResults(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      positionId: '',
      minScore: 0,
      onlyShortlisted: false
    });
  };

  const openScheduleModal = (match) => {
    setSelectedForInterview(match);
    setShowScheduleModal(true);
  };

  const handleInterviewScheduled = () => {
    toast.success('📧 Interview invitation has been sent to the candidate!');
    setShowScheduleModal(false);
    setSelectedForInterview(null);
  };

  const viewDetails = (match) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMatch(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleMatchNow = async () => {
    if (matching) {
      return;
    }
    
    setMatching(true);
    const toastId = toast.loading('🤖 AI is analyzing applications... This may take a few moments.');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/ai-matching/match-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const { matched, skipped, errors } = response.data;
        
        toast.update(toastId, {
          render: `✅ Matching complete! ${matched} new applications matched, ${skipped} already matched`,
          type: 'success',
          isLoading: false,
          autoClose: 5000
        });
        
        // Refresh results
        await fetchResults();
      } else {
        toast.update(toastId, {
          render: `⚠️ ${response.data.message || 'Matching completed with issues'}`,
          type: 'warning',
          isLoading: false,
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Error matching applications:', error);
      toast.update(toastId, {
        render: `❌ ${error.response?.data?.message || error.message || 'Failed to match applications'}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setMatching(false);
    }
  };

  const exportToCSV = () => {
    if (filteredResults.length === 0) {
      toast.warning('No results to export');
      return;
    }

    const csvData = filteredResults.map(r => ({
      'Candidate': r.Application?.fullName || 'N/A',
      'Email': r.Application?.email || 'N/A',
      'Position': r.Position?.title || 'N/A',
      'Overall Score': r.overallScore,
      'Skills Score': r.skillsScore,
      'Experience Score': r.experienceScore,
      'Education Score': r.educationScore,
      'Relevance Score': r.relevanceScore,
      'Shortlisted': r.isShortlisted ? 'Yes' : 'No',
      'Recommendation': r.recommendations,
      'Match Date': new Date(r.matchedAt).toLocaleString()
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-matching-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Results exported to CSV');
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaBrain className="text-purple-500" />
              AI Matching Results
            </h1>
            <p className="text-gray-600 mt-2">
              View AI-powered resume matching scores and analysis
            </p>
          </div>
          <div className="flex gap-3 relative z-10">
            <button
              onClick={handleMatchNow}
              disabled={matching}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {matching ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <FaBrain />
                  Match Now
                </>
              )}
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredResults.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold">Total Matches</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <FaChartBar className="text-5xl text-blue-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold">Shortlisted</p>
              <p className="text-4xl font-bold mt-2">{stats.shortlisted}</p>
            </div>
            <FaStar className="text-5xl text-green-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold">Average Score</p>
              <p className="text-4xl font-bold mt-2">{stats.avgScore}%</p>
            </div>
            <FaBrain className="text-5xl text-purple-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaFilter className="text-purple-500" />
            Filters
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
          >
            <FaTimes /> Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Position Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Position
            </label>
            <select
              value={filters.positionId}
              onChange={(e) => handleFilterChange('positionId', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">All Positions</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.title}</option>
              ))}
            </select>
          </div>

          {/* Minimum Score Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Score: {filters.minScore}%
            </label>
            <input
              type="range"
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', parseInt(e.target.value))}
              min="0"
              max="100"
              step="5"
              className="w-full"
            />
          </div>

          {/* Shortlisted Only */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyShortlisted}
                onChange={(e) => handleFilterChange('onlyShortlisted', e.target.checked)}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Show only shortlisted candidates
              </span>
            </label>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-bold text-purple-600">{filteredResults.length}</span> of {results.length} results
        </div>
      </div>

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-200">
          <FaBrain className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-600 mb-2">No Matching Results Found</h3>
          <p className="text-gray-500">
            {results.length === 0 
              ? 'No applications have been matched yet. Configure AI and run matching.'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">Candidate</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Position</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Overall Score</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Skills</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Experience</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Education</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Relevance</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {result.Application?.fullName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {result.Application?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {result.Position?.title || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.Position?.department || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getScoreColor(result.overallScore)}`}>
                        {result.overallScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBgColor(result.skillsScore)}`}
                          style={{ width: `${result.skillsScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 mt-1 block">
                        {result.skillsScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBgColor(result.experienceScore)}`}
                          style={{ width: `${result.experienceScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 mt-1 block">
                        {result.experienceScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBgColor(result.educationScore)}`}
                          style={{ width: `${result.educationScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 mt-1 block">
                        {result.educationScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBgColor(result.relevanceScore)}`}
                          style={{ width: `${result.relevanceScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 mt-1 block">
                        {result.relevanceScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {result.isShortlisted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          <FaStar className="text-yellow-500" /> Shortlisted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                          Not Shortlisted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => viewDetails(result)}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm flex items-center gap-2"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {result.isShortlisted && (
                          <button
                            onClick={() => openScheduleModal(result)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm flex items-center gap-2"
                            title="Schedule Interview"
                          >
                            <FaCalendar />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedMatch.Application?.fullName || 'Candidate'}
                  </h2>
                  <p className="text-purple-100">
                    Applied for: {selectedMatch.Position?.title || 'N/A'}
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
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Overall Match Score</h3>
                <div className="flex items-center gap-4">
                  <div className={`text-6xl font-bold ${
                    selectedMatch.overallScore >= 80 ? 'text-green-600' :
                    selectedMatch.overallScore >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedMatch.overallScore}%
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full ${getScoreBgColor(selectedMatch.overallScore)}`}
                        style={{ width: `${selectedMatch.overallScore}%` }}
                      ></div>
                    </div>
                    {selectedMatch.isShortlisted && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        <FaStar className="text-yellow-500" /> Shortlisted Candidate
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Skills Match</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-blue-600">{selectedMatch.skillsScore}%</span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-blue-500"
                          style={{ width: `${selectedMatch.skillsScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-green-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Experience Match</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-green-600">{selectedMatch.experienceScore}%</span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-green-500"
                          style={{ width: `${selectedMatch.experienceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Education Match</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-yellow-600">{selectedMatch.educationScore}%</span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-yellow-500"
                          style={{ width: `${selectedMatch.educationScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Relevance Match</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-purple-600">{selectedMatch.relevanceScore}%</span>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-purple-500"
                          style={{ width: `${selectedMatch.relevanceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {selectedMatch.aiAnalysis && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaBrain className="text-blue-600" />
                    AI Analysis
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedMatch.aiAnalysis}</p>
                </div>
              )}

              {/* Strengths */}
              {selectedMatch.strengths && selectedMatch.strengths.length > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {selectedMatch.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {selectedMatch.weaknesses && selectedMatch.weaknesses.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FaTimesCircle className="text-yellow-600" />
                    Areas for Consideration
                  </h3>
                  <ul className="space-y-2">
                    {selectedMatch.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <FaTimesCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              {selectedMatch.recommendations && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Hiring Recommendation</h3>
                  <p className="text-lg font-semibold text-purple-700">{selectedMatch.recommendations}</p>
                </div>
              )}

              {/* Meta Information */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Match Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedMatch.matchedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">AI Model Used</p>
                    <p className="font-semibold text-gray-800 font-mono">
                      {selectedMatch.modelUsed || 'N/A'}
                    </p>
                  </div>
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

export default AIMatchingResults;
