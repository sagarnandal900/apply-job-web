import React, { useState, useEffect } from 'react';
import { companySettingsAPI, BASE_URL } from '../../services/api';
import { toast } from 'react-toastify';
import { FaSave, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaImage } from 'react-icons/fa';

const CompanySettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [settings, setSettings] = useState({
    companyName: '',
    logo: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    website: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await companySettingsAPI.get();
      const data = response.data.data;
      setSettings(data);
      if (data.logo) {
        setLogoPreview(`${BASE_URL}${data.logo}`);
      }
    } catch (error) {
      toast.error('Failed to load company settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, SVG, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error('Please select a logo file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      const response = await companySettingsAPI.uploadLogo(formData);
      setSettings(prev => ({
        ...prev,
        logo: response.data.data.logoUrl
      }));
      setLogoFile(null);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload logo');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await companySettingsAPI.update(settings);
      toast.success('Company settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update company settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Company Settings</h2>
            <p className="text-gray-600 mt-2">Manage your company information and branding</p>
          </div>
          <FaBuilding className="text-5xl text-primary-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaBuilding className="inline mr-2" />
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Your Company Name"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaImage className="inline mr-2" />
              Company Logo
            </label>
            
            {/* Current Logo Preview */}
            {logoPreview && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                <div className="relative inline-block">
                  <img 
                    src={logoPreview} 
                    alt="Company Logo" 
                    className="h-24 object-contain border border-gray-200 rounded-lg p-3 bg-white shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* File Upload Input */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  cursor-pointer"
              />
              {logoFile && (
                <button
                  type="button"
                  onClick={handleUploadLogo}
                  disabled={uploading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Upload an image file (JPEG, PNG, GIF, SVG, WebP). Max size: 5MB</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Company Email
            </label>
            <input
              type="email"
              name="email"
              value={settings.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="contact@yourcompany.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaPhone className="inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={settings.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={settings.address || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="123 Business Street, City, State 12345"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaGlobe className="inline mr-2" />
              Website
            </label>
            <input
              type="url"
              name="website"
              value={settings.website || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="https://yourcompany.com"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Description
            </label>
            <textarea
              name="description"
              value={settings.description || ''}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              placeholder="Brief description of your company..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySettings;
