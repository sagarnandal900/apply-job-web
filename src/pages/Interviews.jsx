import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCalendar, FaFilter, FaTimes, FaClock, FaVideo, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaSpinner, FaBan, FaRedo, FaBell } from 'react-icons/fa';
import axios from 'axios';
import InterviewScheduleModal from '../components/InterviewScheduleModal';
import { API_URL } from '../services/api';

const Interviews = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    upcoming: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    upcoming: false
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchInterviews();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [interviews, filters]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/interviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setInterviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/interviews/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...interviews];

    if (filters.status) {
      filtered = filtered.filter(i => i.status === filters.status);
    }

    if (filters.upcoming) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(i => 
        i.scheduledDate >= today && 
        ['scheduled', 'confirmed'].includes(i.status)
      );
    }

    setFilteredInterviews(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      upcoming: false
    });
  };

  const cancelInterview = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;

    try {
      const token = localStorage.getItem('token');
      const reason = prompt('Enter cancellation reason (optional):');
      
      const response = await axios.put(
        `${API_URL}/interviews/${id}/cancel`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('✅ Interview cancelled successfully');
        fetchInterviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      toast.error('Failed to cancel interview');
    }
  };

  const sendReminder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/interviews/${id}/remind`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('📧 Reminder sent successfully');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  const completeInterview = async (id) => {
    const feedback = prompt('Enter interview feedback (optional):');
    const rating = parseInt(prompt('Enter rating (1-5):') || '0');

    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/interviews/${id}/complete`,
        { feedback, rating },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('✅ Interview marked as completed');
        fetchInterviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error('Failed to complete interview');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { color: 'bg-blue-100 text-blue-600', icon: FaClock, text: 'Scheduled' },
      confirmed: { color: 'bg-green-100 text-green-600', icon: FaCheckCircle, text: 'Confirmed' },
      completed: { color: 'bg-purple-100 text-purple-600', icon: FaCheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-600', icon: FaBan, text: 'Cancelled' },
      rescheduled: { color: 'bg-yellow-100 text-yellow-600', icon: FaRedo, text: 'Rescheduled' },
      'no-show': { color: 'bg-gray-100 text-gray-600', icon: FaTimesCircle, text: 'No Show' }
    };

    const badge = badges[status] || badges.scheduled;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
        <Icon className="text-xs" />
        {badge.text}
      </span>
    );
  };

  const getInterviewTypeIcon = (type) => {
    const icons = {
      video: FaVideo,
      phone: FaPhone,
      'in-person': FaMapMarkerAlt,
      technical: FaUser,
      hr: FaUser,
      final: FaUser
    };
    return icons[type] || FaUser;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
              <FaCalendar className="text-purple-500" />
              Scheduled Interviews
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track all candidate interviews
            </p>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <FaCalendar />
            Schedule New Interview
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold">Total Interviews</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <FaCalendar className="text-5xl text-blue-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-semibold">Scheduled</p>
              <p className="text-4xl font-bold mt-2">{stats.scheduled}</p>
            </div>
            <FaClock className="text-5xl text-yellow-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold">Completed</p>
              <p className="text-4xl font-bold mt-2">{stats.completed}</p>
            </div>
            <FaCheckCircle className="text-5xl text-green-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold">Upcoming</p>
              <p className="text-4xl font-bold mt-2">{stats.upcoming}</p>
            </div>
            <FaClock className="text-5xl text-purple-200 opacity-50" />
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
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          {/* Upcoming Only */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.upcoming}
                onChange={(e) => handleFilterChange('upcoming', e.target.checked)}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Show Upcoming Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      {filteredInterviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-200">
          <FaCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-600 mb-2">No Interviews Found</h3>
          <p className="text-gray-500">
            {interviews.length === 0 
              ? 'No interviews have been scheduled yet. Click "Schedule New Interview" to get started.'
              : 'Try adjusting your filters to see more results.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInterviews.map(interview => {
            const TypeIcon = getInterviewTypeIcon(interview.interviewType);
            
            return (
              <div key={interview.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Date & Time */}
                  <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl p-4 text-center min-w-[120px]">
                    <div className="text-2xl font-bold">{new Date(interview.scheduledDate).getDate()}</div>
                    <div className="text-sm">{new Date(interview.scheduledDate).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-sm mt-1 flex items-center justify-center gap-1">
                      <FaClock />
                      {formatTime(interview.scheduledTime)}
                    </div>
                  </div>

                  {/* Candidate & Position Info */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {interview.Application?.fullName || 'N/A'}
                    </h3>
                    <p className="text-purple-600 font-semibold mb-2">
                      {interview.Position?.title || 'N/A'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <TypeIcon className="text-purple-500" />
                        <span className="capitalize">{interview.interviewType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaEnvelope className="text-purple-500" />
                        <span>{interview.Application?.email || 'N/A'}</span>
                      </div>
                      {interview.interviewerName && (
                        <div className="flex items-center gap-1">
                          <FaUser className="text-purple-500" />
                          <span>{interview.interviewerName}</span>
                        </div>
                      )}
                    </div>
                    {interview.notes && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                        <span className="font-semibold">Notes:</span> {interview.notes}
                      </p>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                    {getStatusBadge(interview.status)}
                    <div className="flex gap-2 mt-2">
                      {['scheduled', 'confirmed'].includes(interview.status) && (
                        <>
                          <button
                            onClick={() => sendReminder(interview.id)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                            title="Send Reminder"
                          >
                            <FaBell />
                          </button>
                          <button
                            onClick={() => completeInterview(interview.id)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                            title="Mark Complete"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            onClick={() => cancelInterview(interview.id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                            title="Cancel"
                          >
                            <FaBan />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <InterviewScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedInterview(null);
          }}
          application={selectedInterview?.Application}
          position={selectedInterview?.Position}
          onSuccess={() => {
            toast.success('✅ Interview scheduled successfully!');
            setShowScheduleModal(false);
            fetchInterviews();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

export default Interviews;
