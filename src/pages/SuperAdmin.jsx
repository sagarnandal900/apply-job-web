import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaBan, FaMoneyBillWave, FaEye, FaTrash, FaSignOutAlt } from 'react-icons/fa';

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentAmount: '',
    paymentStatus: 'paid',
    subscriptionStatus: 'active',
    subscriptionExpiry: ''
  });

  useEffect(() => {
    // Check if user is super admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'super_admin') {
      toast.error('Access denied. Super admin only.');
      navigate('/login');
      return;
    }
    
    fetchTenants();
  }, [filter]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await superAdminAPI.getAllTenants(params);
      setTenants(response.data.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tenantId) => {
    if (!confirm('Are you sure you want to approve this tenant?')) return;

    try {
      await superAdminAPI.approveTenant(tenantId);
      toast.success('Tenant approved successfully!');
      fetchTenants();
    } catch (error) {
      toast.error('Failed to approve tenant');
    }
  };

  const handleReject = async (tenantId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      await superAdminAPI.rejectTenant(tenantId, reason);
      toast.success('Tenant rejected');
      fetchTenants();
    } catch (error) {
      toast.error('Failed to reject tenant');
    }
  };

  const handleSuspend = async (tenantId) => {
    if (!confirm('Are you sure you want to suspend this tenant?')) return;

    try {
      await superAdminAPI.suspendTenant(tenantId);
      toast.success('Tenant suspended');
      fetchTenants();
    } catch (error) {
      toast.error('Failed to suspend tenant');
    }
  };

  const handleDelete = async (tenantId) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) return;

    try {
      await superAdminAPI.deleteTenant(tenantId);
      toast.success('Tenant deleted');
      fetchTenants();
    } catch (error) {
      toast.error('Failed to delete tenant');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    try {
      await superAdminAPI.updatePayment(selectedTenant.id, paymentData);
      toast.success('Payment updated successfully!');
      setShowPaymentModal(false);
      setSelectedTenant(null);
      fetchTenants();
    } catch (error) {
      toast.error('Failed to update payment');
    }
  };

  const openPaymentModal = (tenant) => {
    setSelectedTenant(tenant);
    setPaymentData({
      paymentAmount: tenant.paymentAmount || '',
      paymentStatus: tenant.paymentStatus || 'paid',
      subscriptionStatus: tenant.subscriptionStatus || 'active',
      subscriptionExpiry: tenant.subscriptionExpiry ? tenant.subscriptionExpiry.split('T')[0] : ''
    });
    setShowPaymentModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      approved: 'badge-active',
      rejected: 'badge-rejected',
      suspended: 'badge-rejected'
    };
    return `badge ${badges[status] || ''}`;
  };

  const getSubscriptionBadge = (status) => {
    const badges = {
      trial: 'badge-pending',
      active: 'badge-active',
      expired: 'badge-rejected',
      cancelled: 'badge-rejected'
    };
    return `badge ${badges[status] || ''}`;
  };

  const filteredTenants = tenants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              <p className="text-primary-100 mt-1">Manage tenant registrations and subscriptions</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected', 'suspended'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === tab
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab !== 'all' && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {tenants.filter(t => t.status === tab).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tenants Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner border-primary-600"></div>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No tenants found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{tenant.companyName}</p>
                          {tenant.website && (
                            <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                              {tenant.website}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{tenant.email}</p>
                          {tenant.phone && <p className="text-gray-500">{tenant.phone}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(tenant.status)}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getSubscriptionBadge(tenant.subscriptionStatus)}>
                          {tenant.subscriptionStatus}
                        </span>
                        {tenant.subscriptionExpiry && (
                          <p className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(tenant.subscriptionExpiry).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {tenant.paymentAmount && (
                            <p className="font-semibold text-gray-900">${tenant.paymentAmount}</p>
                          )}
                          <span className={`badge ${tenant.paymentStatus === 'paid' ? 'badge-active' : 'badge-pending'}`}>
                            {tenant.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {tenant.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(tenant.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleReject(tenant.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {tenant.status === 'approved' && (
                            <button
                              onClick={() => handleSuspend(tenant.id)}
                              className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                              title="Suspend"
                            >
                              <FaBan />
                            </button>
                          )}
                          <button
                            onClick={() => openPaymentModal(tenant)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Manage Payment"
                          >
                            <FaMoneyBillWave />
                          </button>
                          <button
                            onClick={() => handleDelete(tenant.id)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTenant && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Manage Payment - {selectedTenant.companyName}</h2>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="label">Payment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentData.paymentAmount}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentAmount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="label">Payment Status</label>
                  <select
                    value={paymentData.paymentStatus}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentStatus: e.target.value })}
                    className="input-field"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="label">Subscription Status</label>
                  <select
                    value={paymentData.subscriptionStatus}
                    onChange={(e) => setPaymentData({ ...paymentData, subscriptionStatus: e.target.value })}
                    className="input-field"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="label">Subscription Expiry</label>
                  <input
                    type="date"
                    value={paymentData.subscriptionExpiry}
                    onChange={(e) => setPaymentData({ ...paymentData, subscriptionExpiry: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Update Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
