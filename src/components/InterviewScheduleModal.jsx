import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaCalendar, FaClock, FaVideo, FaMapMarkerAlt, FaUser, FaEnvelope, FaStickyNote, FaSpinner, FaCheckCircle, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../services/api';

const InterviewScheduleModal = ({ isOpen, onClose, application, position, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedInterviewers, setSelectedInterviewers] = useState([]); // Array of {id, name, email}
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    interviewType: 'video',
    interviewRound: 1,
    location: '',
    notes: ''
  });

  // Fetch users list when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Fetch users for interviewer dropdown
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users list');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add interviewer from dropdown
  const handleAddInterviewer = (userId) => {
    const selectedUser = users.find(u => u.id === parseInt(userId));
    
    if (selectedUser && !selectedInterviewers.find(i => i.id === selectedUser.id)) {
      setSelectedInterviewers(prev => [...prev, {
        id: selectedUser.id,
        name: selectedUser.fullName || selectedUser.name || selectedUser.username,
        email: selectedUser.email
      }]);
    }
  };

  // Add custom interviewer
  const handleAddCustomInterviewer = () => {
    if (!customEmail || !customName) {
      toast.error('Please enter both name and email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (selectedInterviewers.find(i => i.email === customEmail)) {
      toast.error('This interviewer is already added');
      return;
    }

    setSelectedInterviewers(prev => [...prev, {
      id: `custom-${Date.now()}`,
      name: customName,
      email: customEmail
    }]);

    setCustomName('');
    setCustomEmail('');
  };

  // Remove interviewer
  const handleRemoveInterviewer = (id) => {
    setSelectedInterviewers(prev => prev.filter(i => i.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please select date and time');
      return;
    }

    if (formData.interviewType === 'in-person' && !formData.location) {
      toast.error('Please provide location for in-person interview');
      return;
    }

    if (selectedInterviewers.length === 0) {
      toast.error('Please add at least one interviewer');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare interviewer data
      const interviewerNames = selectedInterviewers.map(i => i.name).join(', ');
      const interviewerEmails = selectedInterviewers.map(i => i.email).join(', ');
      
      const response = await axios.post(
        `${API_URL}/interviews`,
        {
          applicationId: application.id,
          positionId: position.id,
          ...formData,
          interviewerName: interviewerNames,
          interviewerEmail: interviewerEmails
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const interview = response.data.data;
        
        // Show success message with Google Meet link if available
        if (interview.meetingLink) {
          toast.success(
            <div>
              <p className="font-bold">✅ Interview scheduled successfully!</p>
              <p className="text-sm">Google Meet link created and invitations sent to {selectedInterviewers.length} interviewer(s) and candidate.</p>
            </div>,
            { autoClose: 5000 }
          );
        } else {
          toast.success(`✅ Interview scheduled successfully! Invitations sent to ${selectedInterviewers.length} interviewer(s) and candidate.`);
        }
        
        onSuccess && onSuccess(interview);
        onClose();
        
        // Reset form
        setFormData({
          scheduledDate: '',
          scheduledTime: '',
          duration: 60,
          interviewType: 'video',
          interviewRound: 1,
          location: '',
          notes: ''
        });
        setSelectedInterviewers([]);
        setCustomName('');
        setCustomEmail('');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaCalendar />
              Schedule Interview
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {application?.fullName} - {position?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 transition-colors"
            disabled={loading}
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaCalendar className="inline mr-2 text-purple-500" />
                Interview Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaClock className="inline mr-2 text-purple-500" />
                Interview Time *
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Duration and Round */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interview Round
              </label>
              <select
                name="interviewRound"
                value={formData.interviewRound}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value={1}>1st Round</option>
                <option value={2}>2nd Round</option>
                <option value={3}>3rd Round</option>
                <option value={4}>Final Round</option>
              </select>
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Interview Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'video', label: 'Video Call', icon: FaVideo },
                { value: 'phone', label: 'Phone', icon: FaUser },
                { value: 'in-person', label: 'In-Person', icon: FaMapMarkerAlt },
                { value: 'technical', label: 'Technical', icon: FaUser },
                { value: 'hr', label: 'HR Round', icon: FaUser },
                { value: 'final', label: 'Final Round', icon: FaUser }
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, interviewType: type.value }))}
                  className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
                    formData.interviewType === type.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <type.icon />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-generated Google Meet Info (for video interviews) */}
          {formData.interviewType === 'video' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-green-600 text-xl mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 text-lg mb-2">
                    🎥 Google Meet Link - Auto-Generated
                  </h3>
                  <p className="text-green-700 text-sm mb-2">
                    A Google Meet link will be <strong>automatically created</strong> when you schedule this interview. 
                    The link will be included in the invitation email sent to the candidate.
                  </p>
                  <ul className="text-green-600 text-xs space-y-1 ml-4 list-disc">
                    <li>Calendar invite will be sent to candidate's email</li>
                    <li>Interviewer will also receive the calendar invite</li>
                    <li>Meeting details will be saved in the system</li>
                    <li>Automatic reminders will be sent before the interview</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Location (for in-person interviews) */}
          {formData.interviewType === 'in-person' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2 text-purple-500" />
                Location * (Office address)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Office address, room number, etc."
                required={formData.interviewType === 'in-person'}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          )}

          {/* Interviewer Details - Multi-select */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              <FaUser className="inline mr-2 text-purple-500" />
              Add Interviewers *
            </label>
            
            {/* Dropdown to select from system users */}
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Select from System Users</h3>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-3 text-gray-500">
                  <FaSpinner className="animate-spin mr-2" />
                  Loading interviewers...
                </div>
              ) : (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddInterviewer(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="">Select an interviewer to add...</option>
                  {users.filter(user => !selectedInterviewers.find(i => i.id === user.id)).map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.name || user.username} - {user.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Custom email input */}
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Or Add Custom Interviewer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Interviewer Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Interviewer Email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomInterviewer}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus /> Add Custom Interviewer
              </button>
            </div>

            {/* Selected Interviewers List */}
            {selectedInterviewers.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Selected Interviewers ({selectedInterviewers.length})
                </h3>
                <div className="space-y-2">
                  {selectedInterviewers.map((interviewer) => (
                    <div
                      key={interviewer.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-300"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{interviewer.name}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <FaEnvelope className="text-purple-500" />
                          {interviewer.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterviewer(interviewer.id)}
                        className="ml-3 text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Remove interviewer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              📧 All selected interviewers will receive calendar invitations with the meeting details
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaStickyNote className="inline mr-2 text-purple-500" />
              Additional Notes / Instructions
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information for the candidate (what to bring, preparation topics, etc.)"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <FaCalendar />
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduleModal;
