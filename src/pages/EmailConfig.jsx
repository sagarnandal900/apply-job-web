import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaEnvelope, 
  FaServer, 
  FaCheckCircle, 
  FaPaperPlane, 
  FaToggleOn, 
  FaToggleOff,
  FaTrash,
  FaGoogle,
  FaGlobe,
  FaInfoCircle
} from 'react-icons/fa';
import { SiMicrosoftoutlook, SiGodaddy } from 'react-icons/si';
import { API_URL as API_BASE_URL } from '../services/api';

const emailAPI = {
  getPresets: () => 
    fetch(`${API_BASE_URL}/email-config/presets`).then(res => res.json()),
  
  getConfig: () =>
    fetch(`${API_BASE_URL}/email-config`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
  
  saveConfig: (data) =>
    fetch(`${API_BASE_URL}/email-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  
  testConnection: () =>
    fetch(`${API_BASE_URL}/email-config/test-connection`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
  
  sendTest: (email) =>
    fetch(`${API_BASE_URL}/email-config/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ testEmail: email })
    }).then(res => res.json()),
  
  toggle: () =>
    fetch(`${API_BASE_URL}/email-config/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()),
  
  delete: () =>
    fetch(`${API_BASE_URL}/email-config`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json())
};

const EmailConfig = () => {
  const [presets, setPresets] = useState({});
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    provider: 'gmail',
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    replyToEmail: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Set default presets first
      const defaultPresets = {
        gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
        outlook: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
        godaddy: { host: 'smtpout.secureserver.net', port: 587, secure: false },
        custom: { host: '', port: 587, secure: false }
      };
      setPresets(defaultPresets);
      
      try {
        const presetsRes = await emailAPI.getPresets();
        if (presetsRes && presetsRes.presets) {
          setPresets(presetsRes.presets);
        }
      } catch (presetError) {
        console.warn('Could not load presets, using defaults');
      }
      
      try {
        const configRes = await emailAPI.getConfig();
        if (configRes && configRes.success && configRes.config) {
          setConfig(configRes.config);
          setFormData({
            provider: configRes.config.provider,
            smtpHost: configRes.config.smtpHost,
            smtpPort: configRes.config.smtpPort,
            smtpSecure: configRes.config.smtpSecure,
            smtpUser: configRes.config.smtpUser,
            smtpPassword: '', // Never load password
            fromEmail: configRes.config.fromEmail,
            fromName: configRes.config.fromName || '',
            replyToEmail: configRes.config.replyToEmail || ''
          });
        }
      } catch (configError) {
        console.warn('No existing configuration found');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load email configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider) => {
    const preset = presets[provider];
    if (preset) {
      setFormData({
        ...formData,
        provider,
        smtpHost: preset.host,
        smtpPort: preset.port,
        smtpSecure: preset.secure
      });
    } else {
      setFormData({ ...formData, provider });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.smtpUser || !formData.fromEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await emailAPI.saveConfig(formData);
      
      if (response.success) {
        toast.success('Email configuration saved successfully');
        await loadData();
      } else {
        toast.error(response.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save email configuration');
    }
  };

  const handleTestConnection = async () => {
    if (!config) {
      toast.error('Please save configuration first');
      return;
    }

    setTesting(true);
    try {
      const response = await emailAPI.testConnection();
      
      if (response.success) {
        toast.success('✅ Connection successful!');
        await loadData();
      } else {
        toast.error(`❌ Connection failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTest = async () => {
    if (!config) {
      toast.error('Please save configuration first');
      return;
    }

    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setSending(true);
    try {
      const response = await emailAPI.sendTest(testEmail);
      
      if (response.success) {
        toast.success(`✅ Test email sent to ${testEmail}!`);
        setTestEmail('');
      } else {
        toast.error(`❌ Failed to send: ${response.message}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const handleToggle = async () => {
    if (!config) return;

    try {
      const response = await emailAPI.toggle();
      
      if (response.success) {
        toast.success(response.config.isActive ? 'Email notifications enabled' : 'Email notifications disabled');
        await loadData();
      } else {
        toast.error(response.message || 'Failed to toggle');
      }
    } catch (error) {
      console.error('Error toggling:', error);
      toast.error('Failed to toggle email notifications');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this email configuration?')) {
      return;
    }

    try {
      const response = await emailAPI.delete();
      
      if (response.success) {
        toast.success('Email configuration deleted');
        setConfig(null);
        setFormData({
          provider: 'gmail',
          smtpHost: '',
          smtpPort: 587,
          smtpSecure: false,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: '',
          fromName: '',
          replyToEmail: ''
        });
      } else {
        toast.error(response.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete configuration');
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'gmail': return <FaGoogle className="text-red-500" />;
      case 'outlook': return <SiMicrosoftoutlook className="text-blue-500" />;
      case 'godaddy': return <SiGodaddy className="text-green-600" />;
      default: return <FaServer className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaEnvelope className="text-blue-600" />
          Email Configuration
        </h1>
        <p className="text-gray-600 mt-2">
          Configure your SMTP settings to send email notifications to job applicants
        </p>
      </div>

      {/* Email Status Banner */}
      {!config ? (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-start">
            <FaInfoCircle className="text-yellow-600 text-xl mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-800 font-semibold mb-1">
                ⚠️ Email Not Configured
              </h3>
              <p className="text-yellow-700 text-sm">
                Email notifications are not set up yet. Please configure your SMTP settings below to automatically send emails to applicants when they apply or when their application status changes.
              </p>
              <p className="text-yellow-700 text-sm mt-2 font-medium">
                Without email configuration, applicants won't receive any notifications!
              </p>
            </div>
          </div>
        </div>
      ) : config.isActive ? (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-start">
            <FaCheckCircle className="text-green-600 text-xl mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-green-800 font-semibold mb-1">
                    ✅ Email Configured & Active
                  </h3>
                  <p className="text-green-700 text-sm">
                    Email notifications are enabled. Applicants will automatically receive emails when they apply and when their application status changes.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-green-700">
                    <span><strong>Provider:</strong> {config.provider}</span>
                    <span><strong>From:</strong> {config.fromEmail}</span>
                    {config.lastTestedAt && (
                      <span><strong>Last Tested:</strong> {new Date(config.lastTestedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
          <div className="flex items-start">
            <FaInfoCircle className="text-orange-600 text-xl mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-orange-800 font-semibold mb-1">
                ⏸️ Email Configured but Disabled
              </h3>
              <p className="text-orange-700 text-sm">
                Email configuration exists but is currently disabled. Enable it below to start sending notifications to applicants.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Provider *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {presets && Object.keys(presets).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => handleProviderChange(provider)}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        formData.provider === provider
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl">{getProviderIcon(provider)}</div>
                      <span className="text-sm font-medium capitalize">{provider}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SMTP Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={formData.smtpHost}
                    onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    value={formData.smtpPort}
                    onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="587"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smtpSecure"
                  checked={formData.smtpSecure}
                  onChange={(e) => setFormData({ ...formData, smtpSecure: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="smtpSecure" className="ml-2 text-sm text-gray-700">
                  Use SSL/TLS (Port 465)
                </label>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Username *
                  </label>
                  <input
                    type="text"
                    value={formData.smtpUser}
                    onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your-email@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password *
                  </label>
                  <input
                    type="password"
                    value={formData.smtpPassword}
                    onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={config ? '••••••••' : 'App Password'}
                    required={!config}
                  />
                </div>
              </div>

              {/* From Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email *
                  </label>
                  <input
                    type="email"
                    value={formData.fromEmail}
                    onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="noreply@yourcompany.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  value={formData.replyToEmail}
                  onChange={(e) => setFormData({ ...formData, replyToEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="support@yourcompany.com"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Save Configuration
              </button>
            </form>
          </div>
        </div>

        {/* Info & Actions Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          {config && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Notifications</span>
                  <button
                    onClick={handleToggle}
                    className="text-2xl"
                  >
                    {config.isActive ? (
                      <FaToggleOn className="text-green-500" />
                    ) : (
                      <FaToggleOff className="text-gray-400" />
                    )}
                  </button>
                </div>

                {config.lastTestedAt && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Last Tested</div>
                    <div className="text-xs text-gray-500">
                      {new Date(config.lastTestedAt).toLocaleString()}
                    </div>
                    <div className={`text-xs mt-1 ${config.testStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {config.testStatus === 'success' ? '✓ Success' : '✗ Failed'}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FaCheckCircle />
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
          )}

          {/* Test Email */}
          {config && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaPaperPlane className="text-blue-600" />
                Test Email
              </h3>
              
              <div className="space-y-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email to test"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <button
                  onClick={handleSendTest}
                  disabled={sending || !testEmail}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          {presets[formData.provider] && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                {getProviderIcon(formData.provider)}
                {formData.provider.charAt(0).toUpperCase() + formData.provider.slice(1)} Setup
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {presets[formData.provider].info}
              </p>
            </div>
          )}

          {/* Delete Configuration */}
          {config && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <button
                onClick={handleDelete}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash />
                Delete Configuration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfig;
