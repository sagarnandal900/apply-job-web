import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBrain, FaSave, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../services/api';

const AIConfigManager = () => {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyChanged, setApiKeyChanged] = useState(false);
  
  const [config, setConfig] = useState({
    openaiApiKey: '',
    modelName: 'gpt-4o-mini',
    enabled: false,
    autoMatch: false,
    matchingInterval: 60,
    minimumMatchScore: 60,
    matchingCriteria: {
      skills: 30,
      experience: 25,
      education: 20,
      relevance: 25
    },
    maxTokens: 1000,
    temperature: 0.3,
    notes: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ai-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setConfig(response.data.data);
        // If the API key is masked, it means there's an existing key
        if (response.data.data.openaiApiKey && response.data.data.openaiApiKey.includes('*')) {
          setApiKeyChanged(false); // Has existing key, not changed yet
        }
      }
    } catch (error) {
      console.error('Error fetching AI config:', error);
      toast.error('Failed to fetch AI configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear test result when API key changes
    if (name === 'openaiApiKey') {
      setTestResult(null);
      setApiKeyChanged(true); // Mark that key has been changed
    }
  };

  const handleCriteriaChange = (criterion, value) => {
    setConfig(prev => ({
      ...prev,
      matchingCriteria: {
        ...prev.matchingCriteria,
        [criterion]: parseInt(value)
      }
    }));
  };

  const handleTestAPIKey = async () => {
    const hasActualKey = config.openaiApiKey && 
                         config.openaiApiKey.trim() !== '' && 
                         !config.openaiApiKey.startsWith('sk-proj*') &&
                         (config.openaiApiKey.startsWith('sk-') || apiKeyChanged);
    
    if (!hasActualKey) {
      toast.warning('Please enter a valid API key to test');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/ai-config/test`,
        { apiKey: config.openaiApiKey },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setTestResult({
          success: true,
          message: response.data.message,
          model: response.data.model
        });
        toast.success('✅ OpenAI API connection successful!');
      }
    } catch (error) {
      console.error('API test error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'API connection failed';
      setTestResult({
        success: false,
        message: errorMessage
      });
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate matching criteria totals 100%
    const total = Object.values(config.matchingCriteria).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      toast.error(`Matching criteria must total 100% (currently ${total}%)`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/ai-config`,
        config,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('AI configuration saved successfully!');
        fetchConfig(); // Refresh to get masked API key
      }
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    }
  };

  const criteriaTotal = Object.values(config.matchingCriteria).reduce((sum, val) => sum + val, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaBrain className="text-purple-500" />
          AI Resume Matching Configuration
        </h1>
        <p className="text-gray-600 mt-2">
          Configure OpenAI integration for automated resume-to-job matching and candidate shortlisting
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* OpenAI API Configuration */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-purple-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaBrain className="text-purple-500" />
            OpenAI API Configuration
          </h2>

          <div className="space-y-6">
            {/* API Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                OpenAI API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  name="openaiApiKey"
                  value={config.openaiApiKey}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-24 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500"
                >
                  {showApiKey ? <FaEyeSlash /> : <FaEye />}
                </button>
                <button
                  type="button"
                  onClick={handleTestAPIKey}
                  disabled={testing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
                  title="Test OpenAI API Key connection"
                >
                  {testing ? <FaSpinner className="animate-spin" /> : 'Test'}
                </button>
              </div>
              
              {/* Test Result */}
              {testResult && (
                <div className={`mt-3 p-4 rounded-xl border-2 ${
                  testResult.success 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <FaCheckCircle className="text-green-600 text-xl" />
                    ) : (
                      <FaTimesCircle className="text-red-600 text-xl" />
                    )}
                    <div>
                      <p className={`font-semibold ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.message}
                      </p>
                      {testResult.model && (
                        <p className="text-sm text-green-700 mt-1">
                          Model detected: <span className="font-mono">{testResult.model}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Get your API key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            {/* Model Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  name="modelName"
                  value={config.modelName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="gpt-4o">GPT-4o (Most Accurate)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  name="maxTokens"
                  value={config.maxTokens}
                  onChange={handleInputChange}
                  min="500"
                  max="4000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Temperature: {config.temperature}
              </label>
              <input
                type="range"
                name="temperature"
                value={config.temperature}
                onChange={handleInputChange}
                min="0"
                max="1"
                step="0.1"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>More Deterministic</span>
                <span>More Creative</span>
              </div>
            </div>

            {/* Enable/Disable */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
              <input
                type="checkbox"
                name="enabled"
                id="enabled"
                checked={config.enabled}
                onChange={handleInputChange}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
              />
              <label htmlFor="enabled" className="text-sm font-semibold text-gray-700">
                Enable AI-Powered Resume Matching
              </label>
            </div>
          </div>
        </div>

        {/* Matching Configuration */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Matching Configuration</h2>

          <div className="space-y-6">
            {/* Auto Match */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <input
                type="checkbox"
                name="autoMatch"
                id="autoMatch"
                checked={config.autoMatch}
                onChange={handleInputChange}
                disabled={!config.enabled}
                className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <label htmlFor="autoMatch" className="text-sm font-semibold text-gray-700 block">
                  Automatically Match New Applications
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Run AI matching automatically on a schedule
                </p>
              </div>
            </div>

            {/* Matching Interval */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Matching Interval (minutes)
              </label>
              <input
                type="number"
                name="matchingInterval"
                value={config.matchingInterval}
                onChange={handleInputChange}
                min="15"
                max="1440"
                disabled={!config.autoMatch}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                How often to check for new applications (15-1440 minutes)
              </p>
            </div>

            {/* Minimum Match Score */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Score for Auto-Shortlist: {config.minimumMatchScore}%
              </label>
              <input
                type="range"
                name="minimumMatchScore"
                value={config.minimumMatchScore}
                onChange={handleInputChange}
                min="50"
                max="90"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50% (More Inclusive)</span>
                <span>90% (More Selective)</span>
              </div>
            </div>

            {/* Matching Criteria Weights */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Matching Criteria Weights (must total 100%)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Skills: {config.matchingCriteria.skills}%</label>
                  <input
                    type="range"
                    value={config.matchingCriteria.skills}
                    onChange={(e) => handleCriteriaChange('skills', e.target.value)}
                    min="0"
                    max="100"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Experience: {config.matchingCriteria.experience}%</label>
                  <input
                    type="range"
                    value={config.matchingCriteria.experience}
                    onChange={(e) => handleCriteriaChange('experience', e.target.value)}
                    min="0"
                    max="100"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Education: {config.matchingCriteria.education}%</label>
                  <input
                    type="range"
                    value={config.matchingCriteria.education}
                    onChange={(e) => handleCriteriaChange('education', e.target.value)}
                    min="0"
                    max="100"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Relevance: {config.matchingCriteria.relevance}%</label>
                  <input
                    type="range"
                    value={config.matchingCriteria.relevance}
                    onChange={(e) => handleCriteriaChange('relevance', e.target.value)}
                    min="0"
                    max="100"
                    className="w-full"
                  />
                </div>
              </div>
              <div className={`mt-3 text-center font-bold text-lg ${
                criteriaTotal === 100 ? 'text-green-600' : 'text-red-600'
              }`}>
                Total: {criteriaTotal}%
                {criteriaTotal !== 100 && ' ⚠️ Must equal 100%'}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={config.notes}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="Add any notes about your AI matching configuration..."
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <FaSave /> Save Configuration
          </button>
        </div>
      </form>

      {/* Stats Section */}
      {config.totalMatchesRun > 0 && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Matches Run</p>
              <p className="text-2xl font-bold text-purple-600">{config.totalMatchesRun}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Match Run</p>
              <p className="text-sm font-semibold text-gray-800">
                {config.lastMatchRun ? new Date(config.lastMatchRun).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfigManager;
