import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaUsers, FaCheckCircle, FaClock, FaChartLine, FaFileAlt } from 'react-icons/fa';
import { applicationsAPI, positionsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import EmailStatusBanner from './EmailStatusBanner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data...');
      
      const [statsRes, positionsRes] = await Promise.all([
        applicationsAPI.getDashboardStats(),
        positionsAPI.getAll()
      ]);

      console.log('✅ Stats Response:', statsRes.data);
      console.log('✅ Positions Response:', positionsRes.data);

      setStats(statsRes.data.data);
      setPositions(positionsRes.data.data || []);
    } catch (error) {
      console.error('❌ Dashboard data fetch error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const statusCounts = {
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    selected: 0
  };

  // Map status counts from backend response
  stats?.applicationsByStatus?.forEach(item => {
    const status = item.status || item.id;
    statusCounts[status] = parseInt(item.count) || 0;
  });

  console.log('📊 Dashboard Stats:', {
    totalApplications: stats?.totalApplications,
    statusCounts,
    applicationsByPosition: stats?.applicationsByPosition,
    recentApplications: stats?.recentApplications
  });

  return (
    <div className="space-y-6">
      {/* Email Status Warning Banner */}
      <EmailStatusBanner />
      
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaChartLine className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-lg">Overview of your recruitment pipeline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <div 
          className="group relative cursor-pointer"
          onClick={() => navigate('/admin/applications')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Applications</p>
                <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                  {stats?.totalApplications || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">Click to view all</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaUsers className="text-2xl text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div 
          className="group relative cursor-pointer"
          onClick={() => navigate('/admin/applications', { state: { filter: 'pending' } })}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Review</p>
                <p className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mt-2">
                  {statusCounts.pending}
                </p>
                <p className="text-xs text-gray-500 mt-2">Click to view pending</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaClock className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Shortlisted */}
        <div 
          className="group relative cursor-pointer"
          onClick={() => navigate('/admin/applications', { state: { filter: 'shortlisted' } })}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Shortlisted</p>
                <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mt-2">
                  {statusCounts.shortlisted}
                </p>
                <p className="text-xs text-gray-500 mt-2">Click to view shortlisted</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaCheckCircle className="text-2xl text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Positions */}
        <div 
          className="group relative cursor-pointer"
          onClick={() => navigate('/admin/positions', { state: { filter: 'active' } })}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Positions</p>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                  {positions.filter(p => p.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500 mt-2">Click to view active</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaBriefcase className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications by Position - Enhanced */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FaBriefcase className="text-white" />
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Applications by Position
            </h2>
          </div>
          <div className="space-y-3">
            {stats?.applicationsByPosition?.length > 0 ? (
              stats.applicationsByPosition.map((item, index) => (
                <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 border border-gray-200/50 hover:border-purple-300/50 hover:scale-[1.02]">
                  <span className="font-bold text-gray-900">
                    {item.position?.title || item.positionTitle || 'Unknown Position'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                      {item.count || 0}
                    </span>
                    <span className="text-sm text-gray-600 font-medium">
                      {parseInt(item.count) === 1 ? 'application' : 'applications'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBriefcase className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No applications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications - Enhanced */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <FaFileAlt className="text-white" />
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Recent Applications
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm tracking-wide">Applicant</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm tracking-wide">Position</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm tracking-wide">Status</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm tracking-wide">Applied On</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentApplications?.length > 0 ? (
                  stats.recentApplications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-gray-900">{app.fullName}</p>
                          <p className="text-sm text-gray-600">{app.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-700">{app.position?.title || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-medium">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaFileAlt className="text-3xl text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No recent applications</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
