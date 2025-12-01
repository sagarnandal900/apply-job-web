import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companySettingsAPI, BASE_URL } from '../services/api';
import { toast } from 'react-toastify';
import { 
  FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt, 
  FaEdit, FaSave, FaTimes, FaImage, FaChartBar, FaUsers,
  FaBriefcase, FaFileAlt
} from 'react-icons/fa';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    logo: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [stats, setStats] = useState({
    positions: 0,
    applications: 0,
    users: 0,
    interviews: 0
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.tenantId) {
        toast.error('No company associated with your account');
        return;
      }

      // Get company settings
      const response = await companySettingsAPI.get();
      const data = response.data.data || response.data;
      
      setCompanyData({
        companyName: data.companyName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        website: data.website || '',
        description: data.description || '',
        logo: data.logo || ''
      });
      setOriginalData({ ...data });

      // You can add an endpoint to get tenant statistics
      // For now using placeholder
      setStats({
        positions: 0,
        applications: 0,
        users: 1,
        interviews: 0
      });
    } catch (error) {
      console.error('Error fetching company profile:', error);
      toast.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setCompanyData({ ...originalData });
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      await companySettingsAPI.update(companyData);
      setOriginalData({ ...companyData });
      setEditing(false);
      toast.success('Company profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update company profile');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await companySettingsAPI.uploadLogo(formData);
      const logoPath = response.data.data?.logo || response.data.logo;
      setCompanyData(prev => ({ ...prev, logo: logoPath }));
      setOriginalData(prev => ({ ...prev, logo: logoPath }));
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                <FaBuilding />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Company Profile</h1>
                <p className="text-gray-600">Manage your company information and settings</p>
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <FaSave /> Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Logo */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaImage className="text-indigo-600" />
                Company Logo
              </h2>
              <div className="flex items-center gap-6">
                {companyData.logo ? (
                  <img
                    src={`${BASE_URL}${companyData.logo}`}
                    alt="Company Logo"
                    className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <FaBuilding className="text-4xl text-indigo-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Upload your company logo (JPG, PNG)</p>
                  <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    Choose File
                  </label>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaBuilding className="inline mr-2 text-indigo-600" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={companyData.companyName}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-indigo-600" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={companyData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2 text-indigo-600" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={companyData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaGlobe className="inline mr-2 text-indigo-600" />
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={companyData.website}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2 text-indigo-600" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={companyData.address}
                    onChange={handleChange}
                    disabled={!editing}
                    rows="2"
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={companyData.description}
                    onChange={handleChange}
                    disabled={!editing}
                    rows="4"
                    className={`w-full px-4 py-2 border rounded-lg ${
                      editing ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500' : 'bg-gray-50'
                    }`}
                    placeholder="Tell us about your company..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Statistics & Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaChartBar className="text-indigo-600" />
                Quick Stats
              </h2>
              <div className="space-y-4">
                <StatItem 
                  icon={<FaBriefcase className="text-purple-600" />}
                  label="Active Positions"
                  value={stats.positions}
                  bgColor="bg-purple-50"
                />
                <StatItem 
                  icon={<FaFileAlt className="text-green-600" />}
                  label="Total Applications"
                  value={stats.applications}
                  bgColor="bg-green-50"
                />
                <StatItem 
                  icon={<FaUsers className="text-blue-600" />}
                  label="Team Members"
                  value={stats.users}
                  bgColor="bg-blue-50"
                />
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Subscription</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Plan:</span>
                  <span className="font-bold">Trial</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Status:</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Expires:</span>
                  <span className="font-medium">14 days</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contact our support team for any questions about your company profile or subscription.
              </p>
              <a
                href="mailto:support@wizoneit.com"
                className="block text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component
const StatItem = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} rounded-lg p-4 flex items-center gap-3`}>
    <div className="text-2xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </div>
);

export default CompanyProfile;
