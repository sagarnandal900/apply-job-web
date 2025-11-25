import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPhone, FaRobot, FaSave, FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';

const RingAIManager = () => {
  const [config, setConfig] = useState({
    apiKey: '',
    apiUrl: 'https://api.ring.ai/v1',
    enabled: false,
    autoCallOnStatus: '',
    callScript: '',
    voiceGender: 'female',
    voiceLanguage: 'en-US',
    callRetryAttempts: 3,
    callRetryDelay: 30,
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notificationEmail: '',
    webhookUrl: '',
    webhookSecret: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/ring-ai', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConfig(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching Ring AI config:', error);
      toast.error('Failed to load Ring AI configuration');
    }
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/ring-ai', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Ring AI configuration saved successfully!');
        fetchConfig(); // Reload to get masked values
      } else {
        toast.error(data.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving Ring AI config:', error);
      toast.error('Failed to save Ring AI configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/ring-ai/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Ring AI connection test successful!');
      } else {
        toast.error(data.message || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing Ring AI connection:', error);
      toast.error('Connection test failed');
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <FaRobot className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ring AI - Automated Calling
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Configure automated calling system for candidate outreach
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {config.enabled ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
          <FaCheckCircle className="text-green-600 text-3xl" />
          <div>
            <h4 className="text-lg font-bold text-green-900">Ring AI Enabled</h4>
            <p className="text-green-700 mt-1">Automated calling is active and ready</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 flex items-center gap-4">
          <FaExclamationTriangle className="text-yellow-600 text-3xl" />
          <div>
            <h4 className="text-lg font-bold text-yellow-900">Ring AI Disabled</h4>
            <p className="text-yellow-700 mt-1">Configure and enable to start automated calling</p>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 space-y-8">
        
        {/* API Configuration */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaPhone className="text-indigo-600" />
            API Configuration
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {/* API Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ring AI API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  placeholder="Enter your Ring AI API key"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {showApiKey ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            {/* API URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                API URL
              </label>
              <input
                type="text"
                value={config.apiUrl}
                onChange={(e) => handleChange('apiUrl', e.target.value)}
                placeholder="https://api.ring.ai/v1"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Enable/Disable */}
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <input
                type="checkbox"
                id="enabled"
                checked={config.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                className="w-6 h-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="enabled" className="text-lg font-semibold text-gray-800 cursor-pointer">
                Enable Automated Calling
              </label>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Call Configuration */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Call Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto Call Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Trigger Call On Status
              </label>
              <select
                value={config.autoCallOnStatus}
                onChange={(e) => handleChange('autoCallOnStatus', e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="">Don't auto-call</option>
                <option value="pending">When Pending</option>
                <option value="reviewed">When Reviewed</option>
                <option value="shortlisted">When Shortlisted</option>
                <option value="rejected">When Rejected</option>
              </select>
            </div>

            {/* Voice Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Voice Gender
              </label>
              <select
                value={config.voiceGender}
                onChange={(e) => handleChange('voiceGender', e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            {/* Voice Language */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Voice Language
              </label>
              <select
                value={config.voiceLanguage}
                onChange={(e) => handleChange('voiceLanguage', e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="en-US">English (US)</option>
                <option value="en-IN">English (India)</option>
                <option value="en-GB">English (UK)</option>
                <option value="hi-IN">Hindi</option>
              </select>
            </div>

            {/* Retry Attempts */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Retry Attempts
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={config.callRetryAttempts}
                onChange={(e) => handleChange('callRetryAttempts', parseInt(e.target.value) || 0)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Retry Delay */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Retry Delay (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={config.callRetryDelay}
                onChange={(e) => handleChange('callRetryDelay', parseInt(e.target.value) || 5)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Call Script */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Call Script / Message
            </label>
            <textarea
              value={config.callScript}
              onChange={(e) => handleChange('callScript', e.target.value)}
              placeholder="Enter the script or message to be used in automated calls..."
              rows="6"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Notifications */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>

          <div className="space-y-6">
            {/* Notification Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Notification Email
              </label>
              <input
                type="email"
                value={config.notificationEmail}
                onChange={(e) => handleChange('notificationEmail', e.target.value)}
                placeholder="admin@company.com"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Notification Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <input
                  type="checkbox"
                  id="notifyOnSuccess"
                  checked={config.notifyOnSuccess}
                  onChange={(e) => handleChange('notifyOnSuccess', e.target.checked)}
                  className="w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="notifyOnSuccess" className="text-lg font-semibold text-gray-800 cursor-pointer">
                  Notify on Success
                </label>
              </div>

              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                <input
                  type="checkbox"
                  id="notifyOnFailure"
                  checked={config.notifyOnFailure}
                  onChange={(e) => handleChange('notifyOnFailure', e.target.checked)}
                  className="w-6 h-6 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="notifyOnFailure" className="text-lg font-semibold text-gray-800 cursor-pointer">
                  Notify on Failure
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Webhook Configuration */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Webhook (Optional)</h2>

          <div className="grid grid-cols-1 gap-6">
            {/* Webhook URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Webhook URL
              </label>
              <input
                type="text"
                value={config.webhookUrl}
                onChange={(e) => handleChange('webhookUrl', e.target.value)}
                placeholder="https://your-server.com/webhooks/ring-ai"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Webhook Secret */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Webhook Secret
              </label>
              <div className="relative">
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={config.webhookSecret}
                  onChange={(e) => handleChange('webhookSecret', e.target.value)}
                  placeholder="Secret key for webhook authentication"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {showWebhookSecret ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Configuration Notes
          </label>
          <textarea
            value={config.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any notes or instructions about this configuration..."
            rows="4"
            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <FaSave />
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>

          <button
            onClick={handleTest}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <FaPhone />
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default RingAIManager;
