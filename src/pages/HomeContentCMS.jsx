import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaHome, 
  FaSave, 
  FaUndo, 
  FaEye,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaRocket
} from 'react-icons/fa';
import { API_URL as API_BASE_URL } from '../services/api';

const HomeContentCMS = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroButtonText: '',
    featuresTitle: '',
    featuresSubtitle: '',
    feature1Title: '',
    feature1Description: '',
    feature2Title: '',
    feature2Description: '',
    feature3Title: '',
    feature3Description: '',
    aboutTitle: '',
    aboutDescription: '',
    ctaTitle: '',
    ctaDescription: '',
    ctaButtonText: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
    metaTitle: '',
    metaDescription: ''
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/home-content`);
      const data = await response.json();
      
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/home-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(content)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ Content updated successfully!');
        setContent(data.data);
      } else {
        toast.error(data.message || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all content to defaults? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/home-content/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ Content reset to defaults');
        setContent(data.data);
      } else {
        toast.error(data.message || 'Failed to reset content');
      }
    } catch (error) {
      console.error('Error resetting content:', error);
      toast.error('Failed to reset content');
    }
  };

  const handleChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: <FaHome /> },
    { id: 'features', label: 'Features', icon: <FaGlobe /> },
    { id: 'about', label: 'About', icon: <FaGlobe /> },
    { id: 'cta', label: 'Call to Action', icon: <FaGlobe /> },
    { id: 'contact', label: 'Contact Info', icon: <FaEnvelope /> },
    { id: 'social', label: 'Social Media', icon: <FaGlobe /> },
    { id: 'seo', label: 'SEO', icon: <FaGlobe /> }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header - Enhanced */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaHome className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Home Page Content Manager
                </h1>
                <p className="text-gray-600 mt-2 text-lg flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live on home page • Changes reflect immediately
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-700">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Enhanced */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <FaSave className="text-xl" />
          <span>{saving ? 'Saving Changes...' : 'Save & Publish'}</span>
          {saving && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          )}
        </button>
        
        <button
          onClick={handlePreview}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
        >
          <FaEye className="text-xl" />
          <span>Preview Live Page</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        
        <button
          onClick={handleReset}
          className="group inline-flex items-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <FaUndo className="text-xl" />
          <span>Reset to Defaults</span>
        </button>
      </div>
      
      {/* Info Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-blue-900 mb-1">Real-Time Content Management</h4>
          <p className="text-blue-700 text-sm">
            Any changes you save here will immediately appear on your live home page. Click "Save & Publish" to update the content, then click "Preview Live Page" to see your changes in action!
          </p>
        </div>
      </div>

      {/* Tabs - Enhanced */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="border-b-2 border-gray-200 overflow-x-auto">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-5 font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b-4 border-purple-700 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

        <form onSubmit={handleSave} className="p-8">
          {/* Hero Section */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaHome className="text-white" />
                </div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Hero Section
                </h2>
              </div>
              
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Main Title * <span className="text-red-500">Required</span>
                </label>
                <input
                  type="text"
                  value={content.heroTitle}
                  onChange={(e) => handleChange('heroTitle', e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold"
                  placeholder="Enter a compelling main headline..."
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Subtitle * <span className="text-red-500">Required</span>
                </label>
                <textarea
                  value={content.heroSubtitle}
                  onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                  rows="4"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg"
                  placeholder="Add a descriptive subtitle that explains your value proposition..."
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Button Text * <span className="text-red-500">Required</span>
                </label>
                <input
                  type="text"
                  value={content.heroButtonText}
                  onChange={(e) => handleChange('heroButtonText', e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-lg font-semibold"
                  placeholder="e.g., View Open Positions"
                  required
                />
              </div>
            </div>
          )}

          {/* Features Section */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Features Section</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title *
                </label>
                <input
                  type="text"
                  value={content.featuresTitle}
                  onChange={(e) => handleChange('featuresTitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={content.featuresSubtitle}
                  onChange={(e) => handleChange('featuresSubtitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Feature 1 */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Feature 1</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={content.feature1Title}
                    onChange={(e) => handleChange('feature1Title', e.target.value)}
                    placeholder="Title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    value={content.feature1Description}
                    onChange={(e) => handleChange('feature1Description', e.target.value)}
                    placeholder="Description"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Feature 2</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={content.feature2Title}
                    onChange={(e) => handleChange('feature2Title', e.target.value)}
                    placeholder="Title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    value={content.feature2Description}
                    onChange={(e) => handleChange('feature2Description', e.target.value)}
                    placeholder="Description"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Feature 3</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={content.feature3Title}
                    onChange={(e) => handleChange('feature3Title', e.target.value)}
                    placeholder="Title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    value={content.feature3Description}
                    onChange={(e) => handleChange('feature3Description', e.target.value)}
                    placeholder="Description"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* About Section */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <FaGlobe className="text-white" />
                </div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  About Section
                </h2>
              </div>
              
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Section Title * <span className="text-red-500">Required</span>
                </label>
                <input
                  type="text"
                  value={content.aboutTitle}
                  onChange={(e) => handleChange('aboutTitle', e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-lg font-semibold"
                  placeholder="About Your Company"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Description * <span className="text-red-500">Required</span>
                </label>
                <textarea
                  value={content.aboutDescription}
                  onChange={(e) => handleChange('aboutDescription', e.target.value)}
                  rows="6"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-lg"
                  placeholder="Describe your company, mission, and what makes you unique..."
                  required
                />
              </div>
            </div>
          )}

          {/* CTA Section */}
          {activeTab === 'cta' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white" />
                </div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Call to Action Section
                </h2>
              </div>
              
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  CTA Title * <span className="text-red-500">Required</span>
                </label>
                <input
                  type="text"
                  value={content.ctaTitle}
                  onChange={(e) => handleChange('ctaTitle', e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 text-lg font-semibold"
                  placeholder="Ready to Start Your Journey?"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  CTA Description * <span className="text-red-500">Required</span>
                </label>
                <textarea
                  value={content.ctaDescription}
                  onChange={(e) => handleChange('ctaDescription', e.target.value)}
                  rows="4"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 text-lg"
                  placeholder="Motivate visitors to take action..."
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Button Text * <span className="text-red-500">Required</span>
                </label>
                <input
                  type="text"
                  value={content.ctaButtonText}
                  onChange={(e) => handleChange('ctaButtonText', e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 text-lg font-semibold"
                  placeholder="e.g., Apply Now, View Positions"
                  required
                />
              </div>
            </div>
          )}

          {/* Contact Info */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaHome /> Company Name
                </label>
                <input
                  type="text"
                  value={content.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  value={content.companyEmail}
                  onChange={(e) => handleChange('companyEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaPhone /> Phone
                </label>
                <input
                  type="text"
                  value={content.companyPhone}
                  onChange={(e) => handleChange('companyPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt /> Address
                </label>
                <textarea
                  value={content.companyAddress}
                  onChange={(e) => handleChange('companyAddress', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Social Media */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Media Links</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaFacebook className="text-blue-600" /> Facebook URL
                </label>
                <input
                  type="url"
                  value={content.facebookUrl}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaTwitter className="text-blue-400" /> Twitter URL
                </label>
                <input
                  type="url"
                  value={content.twitterUrl}
                  onChange={(e) => handleChange('twitterUrl', e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaLinkedin className="text-blue-700" /> LinkedIn URL
                </label>
                <input
                  type="url"
                  value={content.linkedinUrl}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaInstagram className="text-pink-600" /> Instagram URL
                </label>
                <input
                  type="url"
                  value={content.instagramUrl}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/yourprofile"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">SEO Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={content.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  placeholder="Job Portal - Find Your Dream Job"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 50-60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={content.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  placeholder="Connect with top employers and discover exciting career opportunities..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 150-160 characters
                </p>
              </div>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
};

export default HomeContentCMS;
