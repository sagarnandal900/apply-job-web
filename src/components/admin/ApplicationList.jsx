import React, { useState, useEffect } from 'react';
import { applicationsAPI, positionsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaEye, FaSearch, FaFilter, FaSync } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    positionId: '',
    status: ''
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a filter from navigation state (from dashboard click)
    if (location.state?.filter) {
      setFilters(prev => ({
        ...prev,
        status: location.state.filter
      }));
    }
  }, [location.state]);

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [filters]);

  const fetchData = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const [appsRes, posRes] = await Promise.all([
        applicationsAPI.getAll({ ...filters, _t: timestamp }),
        positionsAPI.getAll()
      ]);
      setApplications(appsRes.data.data);
      setPositions(posRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchData();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await applicationsAPI.updateStatus(id, newStatus);
      
      if (newStatus === 'selected') {
        toast.success('Candidate selected and added to Selected Candidates list!');
      } else {
        toast.success('Status updated successfully');
      }
      
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const viewDetails = (id) => {
    navigate(`/admin/applications/${id}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-2">Manage and review job applications</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchData();
            toast.success('Applications refreshed!');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field pl-10"
                placeholder="Name, email, phone..."
              />
            </div>
          </div>
          <div>
            <label className="label">Position</label>
            <select
              value={filters.positionId}
              onChange={(e) => setFilters({ ...filters, positionId: e.target.value })}
              className="input-field"
            >
              <option value="">All Positions</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleSearch} className="btn-primary w-full flex items-center justify-center">
              <FaFilter className="mr-2" /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Position</th>
              <th>Experience</th>
              <th>Expected Salary</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{app.fullName}</p>
                      <p className="text-sm text-gray-600">{app.email}</p>
                      <p className="text-sm text-gray-600">{app.phone}</p>
                    </div>
                  </td>
                  <td>{app.position?.title || 'N/A'}</td>
                  <td>{app.experience} years</td>
                  <td>₹{app.expectedSalary?.toLocaleString()}</td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`badge badge-${app.status} cursor-pointer`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => viewDetails(app.id)}
                      className="text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      <FaEye className="mr-1" /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationList;
