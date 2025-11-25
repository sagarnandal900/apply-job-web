import { useState, useEffect } from 'react';
import { FaEnvelope, FaEdit, FaEye, FaUndo, FaSave, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { emailTemplatesAPI } from '../services/api';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Sample data for preview
  const sampleData = {
    applicantName: 'John Doe',
    positionTitle: 'Senior Software Engineer',
    companyName: 'Tech Innovations Inc.',
    companyLogo: 'https://via.placeholder.com/120x40/667eea/ffffff?text=Company+Logo',
    companyEmail: 'careers@techinnovations.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Tech Street, Silicon Valley, CA 94000',
    companyWebsite: 'https://techinnovations.com',
    applicationId: '12345',
    appliedDate: new Date().toLocaleDateString(),
    reviewedDate: new Date().toLocaleDateString(),
    positionLocation: 'San Francisco, CA'
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if token exists
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching templates from API...');
      const response = await emailTemplatesAPI.getAll();
      console.log('Templates response:', response.data);
      setTemplates(response.data.templates || []);
      setError('');
    } catch (err) {
      console.error('Error fetching templates:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        setError('Session expired or invalid. Please refresh the page or login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view email templates.');
      } else {
        setError(`Failed to fetch email templates: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate({
      ...template,
      originalSubject: template.subject,
      originalHtmlContent: template.htmlContent
    });
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    try {
      // Create or update tenant-specific template
      await emailTemplatesAPI.create({
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        htmlContent: editingTemplate.htmlContent,
        type: editingTemplate.type,
        variables: editingTemplate.variables,
        isActive: true
      });

      setSuccess('Template saved successfully!');
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err) {
      setError('Failed to save template');
      console.error(err);
    }
  };

  const handlePreview = async () => {
    try {
      const response = await emailTemplatesAPI.preview({
        htmlContent: editingTemplate.htmlContent,
        sampleData
      });
      setPreviewHtml(response.data.html);
      setShowPreview(true);
    } catch (err) {
      setError('Failed to preview template');
      console.error(err);
    }
  };

  const handleReset = async (type) => {
    if (!confirm('Are you sure you want to reset this template to default?')) return;

    try {
      await emailTemplatesAPI.reset(type);
      setSuccess('Template reset to default successfully!');
      fetchTemplates();
    } catch (err) {
      setError('Failed to reset template');
      console.error(err);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('htmlContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingTemplate.htmlContent;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    setEditingTemplate({
      ...editingTemplate,
      htmlContent: before + `{{${variable}}}` + after
    });
  };

  const availableVariables = [
    'applicantName',
    'positionTitle',
    'companyName',
    'companyLogo',
    'companyEmail',
    'companyPhone',
    'companyAddress',
    'companyWebsite',
    'applicationId',
    'appliedDate',
    'reviewedDate',
    'positionLocation'
  ];

  const getTemplateColor = (type) => {
    const colors = {
      application_received: 'from-purple-500 to-purple-700',
      application_reviewed: 'from-blue-500 to-blue-700',
      application_shortlisted: 'from-green-500 to-green-700',
      application_rejected: 'from-gray-500 to-gray-700'
    };
    return colors[type] || 'from-indigo-500 to-indigo-700';
  };

  const getTemplateIcon = (type) => {
    const icons = {
      application_received: '📨',
      application_reviewed: '📋',
      application_shortlisted: '🎉',
      application_rejected: '📄'
    };
    return icons[type] || '✉️';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaEnvelope className="text-primary-600" />
          Email Templates
        </h1>
        <p className="text-gray-600 mt-2">
          Customize email templates for applicant notifications
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Templates List */}
      {!editingTemplate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`bg-gradient-to-r ${getTemplateColor(template.type)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getTemplateIcon(template.type)}</span>
                    <div>
                      <h3 className="text-xl font-bold">{template.name}</h3>
                      <p className="text-sm opacity-90 mt-1">{template.subject}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Type</span>
                  <p className="text-sm text-gray-700 mt-1 font-mono">{template.type}</p>
                </div>

                <div className="mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                  <p className="text-sm mt-1">
                    {template.isActive ? (
                      <span className="text-green-600 font-semibold">✓ Active</span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                    {template.tenantId ? (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Custom
                      </span>
                    ) : (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(template)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaEdit /> Edit
                  </button>
                  {template.tenantId && (
                    <button
                      onClick={() => handleReset(template.type)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      title="Reset to default"
                    >
                      <FaUndo />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Template Editor */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className={`bg-gradient-to-r ${getTemplateColor(editingTemplate.type)} p-6 text-white`}>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-4xl">{getTemplateIcon(editingTemplate.type)}</span>
              Editing: {editingTemplate.name}
            </h2>
          </div>

          <div className="p-6">
            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={editingTemplate.subject}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Email subject line..."
              />
            </div>

            {/* Variable Helper */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Available Variables (Click to insert)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => insertVariable(variable)}
                    className="bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 px-3 py-1 rounded-full text-sm font-mono transition-colors"
                  >
                    {`{{${variable}}}`}
                  </button>
                ))}
              </div>
            </div>

            {/* HTML Content */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                HTML Template
              </label>
              <textarea
                id="htmlContent"
                value={editingTemplate.htmlContent}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                rows="15"
                placeholder="HTML template content..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Use Handlebars syntax: {`{{variableName}}`} for variables, {`{{#if condition}}`} for conditionals
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors"
              >
                <FaSave /> Save Template
              </button>
              <button
                onClick={handlePreview}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors"
              >
                <FaEye /> Preview
              </button>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setError('');
                  setSuccess('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <FaEye /> Email Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <div className="mb-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Subject:</strong> {editingTemplate.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => sampleData[key] || match)}
                </p>
              </div>
              <div
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
            <div className="bg-gray-50 p-4 border-t flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
