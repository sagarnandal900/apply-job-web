import { useState, useEffect } from 'react';
import { FiMail, FiCalendar, FiSettings, FiSave, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const IntegrationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingMeet, setTestingMeet] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [config, setConfig] = useState({
    // Email Config
    emailProvider: 'gmail',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpFrom: '',
    smtpFromName: 'Recruitment Team',
    emailEnabled: false,
    
    // Google Calendar Config
    googleClientId: '',
    googleClientSecret: '',
    googleRedirectUri: '',
    googleCalendarId: 'primary',
    googleCalendarEnabled: false,
    
    // Automation Settings
    autoCreateCalendarEvent: true,
    autoSendInvitation: true,
    sendReminderBefore: 24,
    
    // Company Info
    companyName: '',
    companyWebsite: '',
    
    // Status fields (read-only)
    verificationStatus: 'pending',
    verificationMessage: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/integrations/config');
      setConfig(response.data.data);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/integrations/config', config);
      setConfig(response.data.data);
      toast.success('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTesting(true);
      const testEmail = prompt('Enter email address to send test email to:');
      if (!testEmail) return;

      const response = await api.post('/integrations/test-email', { to: testEmail });
      toast.success(response.data.message || 'Test email sent successfully!');
      
      // Refresh config to get updated verification status
      fetchConfig();
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error(error.response?.data?.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setAuthorizing(true);
      
      // First save the config
      await handleSave();
      
      // Open OAuth window
      const authUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/integrations/google/auth`;
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        authUrl,
        'Google Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Listen for auth completion
      const checkAuth = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkAuth);
          setAuthorizing(false);
          // Refresh config to see if token was saved
          setTimeout(() => {
            fetchConfig();
            toast.info('Please check if authorization was successful');
          }, 1000);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error starting OAuth:', error);
      toast.error('Failed to start Google authorization');
      setAuthorizing(false);
    }
  };

  const handleTestMeetLink = async () => {
    try {
      setTestingMeet(true);
      const response = await api.post('/interviews/generate-meet-link');
      
      if (response.data.success) {
        const { meetLink, placeholder, message } = response.data;
        
        if (placeholder) {
          toast.warning(
            <div>
              <p className="font-semibold">⚠️ Placeholder Link Generated</p>
              <p className="text-sm mt-1">{message}</p>
              <p className="text-xs mt-2 font-mono">{meetLink}</p>
              <p className="text-xs mt-2 text-yellow-600">This link won't work. Complete OAuth to generate real links.</p>
            </div>,
            { autoClose: 8000 }
          );
        } else {
          toast.success(
            <div>
              <p className="font-semibold">✅ Real Google Meet Link Generated!</p>
              <p className="text-xs mt-2 font-mono break-all">{meetLink}</p>
              <a 
                href={meetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-2 block"
              >
                Click to test link →
              </a>
            </div>,
            { autoClose: 10000 }
          );
        }
      }
    } catch (error) {
      console.error('Error testing Meet link:', error);
      toast.error(error.response?.data?.message || 'Failed to generate Meet link');
    } finally {
      setTestingMeet(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Integration Settings</h1>
        <p className="text-gray-600">Configure email and calendar integrations for automated interview scheduling</p>
      </div>

      {/* Status Banner */}
      {config.verificationMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          config.verificationStatus === 'verified' 
            ? 'bg-green-50 border border-green-200' 
            : config.verificationStatus === 'failed'
            ? 'bg-red-50 border border-red-200'
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          {config.verificationStatus === 'verified' ? (
            <FiCheck className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
          ) : (
            <FiAlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
          )}
          <div>
            <p className={`font-medium ${
              config.verificationStatus === 'verified' ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {config.verificationStatus === 'verified' ? 'Configuration Verified' : 'Configuration Status'}
            </p>
            <p className={`text-sm ${
              config.verificationStatus === 'verified' ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {config.verificationMessage}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Email Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiMail className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Email Configuration</h2>
              <p className="text-sm text-gray-600">SMTP settings for sending interview invitations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Provider
              </label>
              <select
                value={config.emailProvider}
                onChange={(e) => handleChange('emailProvider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
                <option value="custom">Custom SMTP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={config.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={config.smtpPort}
                onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP User (Email)
              </label>
              <input
                type="email"
                value={config.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
                placeholder="careers@oshoind.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password (App Password)
                {config.smtpPasswordSet && (
                  <span className="ml-2 text-xs text-green-600">✓ Set</span>
                )}
              </label>
              <input
                type="password"
                value={config.smtpPassword}
                onChange={(e) => handleChange('smtpPassword', e.target.value)}
                placeholder={config.smtpPasswordSet ? '••••••••••••' : 'Enter app password'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                For Gmail: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Generate App Password</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={config.smtpFrom}
                onChange={(e) => handleChange('smtpFrom', e.target.value)}
                placeholder="careers@oshoind.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={config.smtpFromName}
                onChange={(e) => handleChange('smtpFromName', e.target.value)}
                placeholder="Recruitment Team"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.emailEnabled}
                  onChange={(e) => handleChange('emailEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable Email Sending</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleTestEmail}
              disabled={testing || !config.smtpUser}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FiMail />
                  Send Test Email
                </>
              )}
            </button>
          </div>
        </div>

        {/* Google Meet Link Generator */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiCalendar className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Google Meet Link Generator</h2>
              <p className="text-sm text-gray-600">Auto-generate real Google Meet links for interviews (No calendar needed)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Client ID *
              </label>
              <input
                type="text"
                value={config.googleClientId}
                onChange={(e) => handleChange('googleClientId', e.target.value)}
                placeholder="Your Google OAuth Client ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">From Google Cloud Console credentials</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Client Secret *
                {config.googleClientSecretSet && (
                  <span className="ml-2 text-xs text-green-600">✓ Set</span>
                )}
              </label>
              <input
                type="password"
                value={config.googleClientSecret}
                onChange={(e) => handleChange('googleClientSecret', e.target.value)}
                placeholder={config.googleClientSecretSet ? '••••••••••••' : 'Enter client secret'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Keep this secret and secure</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendar ID (Optional)
              </label>
              <input
                type="text"
                value={config.googleCalendarId}
                onChange={(e) => handleChange('googleCalendarId', e.target.value)}
                placeholder="primary"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave as "primary" to use your main calendar</p>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">OAuth Status</p>
                  <p className="text-xs text-gray-500">
                    {config.googleRefreshTokenSet 
                      ? '✅ Authorized - Real Google Meet links enabled' 
                      : '⚠️ Not authorized - Using placeholder links'}
                  </p>
                </div>
                <button 
                  onClick={handleGoogleAuth}
                  disabled={authorizing || !config.googleClientId || !config.googleClientSecret}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {authorizing ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <FiCalendar />
                      {config.googleRefreshTokenSet ? 'Re-authorize Google' : 'Authorize with Google'}
                    </>
                  )}
                </button>
              </div>
              
              {/* Test Meet Link Button */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Test Google Meet Link Generation</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Generate a test Meet link to verify your configuration
                    </p>
                  </div>
                  <button
                    onClick={handleTestMeetLink}
                    disabled={testingMeet}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {testingMeet ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <FiCalendar />
                        Test Meet Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.googleCalendarEnabled}
                  onChange={(e) => handleChange('googleCalendarEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable Google Calendar Integration</span>
              </label>
              <span className="text-xs text-gray-500">
                (Toggle this ON after authorization to use real Meet links)
              </span>
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiSettings className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Automation Settings</h2>
              <p className="text-sm text-gray-600">Configure automated interview scheduling behavior</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoCreateCalendarEvent}
                onChange={(e) => handleChange('autoCreateCalendarEvent', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3">
                <span className="text-sm font-medium text-gray-700">Automatically create calendar events</span>
                <p className="text-xs text-gray-500">Create Google Calendar events when interviews are scheduled</p>
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoSendInvitation}
                onChange={(e) => handleChange('autoSendInvitation', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3">
                <span className="text-sm font-medium text-gray-700">Automatically send email invitations</span>
                <p className="text-xs text-gray-500">Send interview invitation emails to candidates automatically</p>
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Reminder Before (hours)
              </label>
              <input
                type="number"
                value={config.sendReminderBefore}
                onChange={(e) => handleChange('sendReminderBefore', parseInt(e.target.value))}
                min="1"
                max="168"
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">How many hours before the interview to send a reminder</p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Your Company Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <input
                type="url"
                value={config.companyWebsite}
                onChange={(e) => handleChange('companyWebsite', e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => fetchConfig()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <FiRefreshCw className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                Save Configuration
              </>
            )}
          </button>
        </div>

        {/* Setup Help Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-purple-600" />
            Google Meet Link Setup Guide
          </h3>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">Step 1:</span>
              <div>
                Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> and create a project
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">Step 2:</span>
              <div>
                Enable <strong>Google Calendar API</strong> in APIs & Services → Library
                <p className="text-xs text-gray-500 mt-1">(We only use it to generate Meet links, not to manage calendars)</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">Step 3:</span>
              <div>
                Create OAuth 2.0 credentials:
                <ul className="list-disc list-inside ml-4 mt-1 text-xs text-gray-600 space-y-1">
                  <li>Go to APIs & Services → Credentials</li>
                  <li>Click "Create Credentials" → "OAuth client ID"</li>
                  <li>Application type: "Web application"</li>
                  <li>
                    <strong>Add this redirect URI:</strong>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-white px-2 py-1 rounded border border-purple-300 text-xs">
                        http://localhost:5001/api/integrations/google/callback
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('http://localhost:5001/api/integrations/google/callback');
                          toast.success('✅ Redirect URI copied!');
                        }}
                        className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                      >
                        Copy
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">Step 4:</span>
              <div>
                Copy the <strong>Client ID</strong> and <strong>Client Secret</strong> from Google Console and paste them in the fields above
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">Step 5:</span>
              <div>
                Click <strong>"Save Configuration"</strong> button (at the bottom)
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">Step 6:</span>
              <div>
                Click <strong>"Authorize with Google"</strong> button - a popup will open for Google sign-in
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">Step 7:</span>
              <div>
                After authorization succeeds, check the <strong>"Enable Google Meet Link Auto-Generation"</strong> checkbox and save again
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">Step 8:</span>
              <div>
                Click <strong>"Test Meet Link"</strong> button to verify - you should see a REAL Google Meet link! ✅
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border border-purple-200">
            <p className="text-xs text-gray-600">
              <strong className="text-purple-700">💡 Quick Tip:</strong> If you don't want to set up Google OAuth, you can still schedule interviews by manually entering meeting links (Zoom, Google Meet, Microsoft Teams, etc.) when scheduling. This setup is only needed if you want to auto-generate real Google Meet links with one click!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
