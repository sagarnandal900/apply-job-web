import { useState, useEffect } from 'react';
import { emailTemplatesAPI } from '../../services/api';
import { FaEnvelope, FaEdit, FaEye, FaUndo, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    subject: '',
    htmlContent: ''
  });
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await emailTemplatesAPI.getAll();
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch email templates: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditForm({
      subject: template.subject,
      htmlContent: template.htmlContent
    });
    setIsEditing(true);
    setShowPreview(false);
  };

  const handlePreview = async () => {
    try {
      const response = await emailTemplatesAPI.preview({
        htmlContent: editForm.htmlContent,
        sampleData: {
          applicantName: 'John Doe',
          positionTitle: 'Software Engineer',
          companyName: 'Tech Company Inc.',
          applicationId: '12345',
          appliedDate: new Date().toLocaleDateString(),
          reviewedDate: new Date().toLocaleDateString(),
          positionLocation: 'San Francisco, CA'
        }
      });
      setPreviewHtml(response.data.html);
      setShowPreview(true);
    } catch (err) {
      console.error('Error previewing template:', err);
      alert('Failed to preview template: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Create or update tenant-specific template
      await emailTemplatesAPI.create({
        name: selectedTemplate.name,
        subject: editForm.subject,
        htmlContent: editForm.htmlContent,
        type: selectedTemplate.type,
        variables: selectedTemplate.variables
      });

      alert('Template saved successfully!');
      await fetchTemplates();
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Failed to save template: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (template) => {
    if (!confirm(`Are you sure you want to reset "${template.name}" to the default template?`)) {
      return;
    }

    try {
      await emailTemplatesAPI.reset(template.type);
      alert('Template reset to default successfully!');
      await fetchTemplates();
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Error resetting template:', err);
      alert('Failed to reset template: ' + (err.response?.data?.error || err.message));
    }
  };

  const getTemplateIcon = (type) => {
    const icons = {
      application_received: '📨',
      application_reviewed: '📋',
      application_shortlisted: '✅',
      application_rejected: '❌'
    };
    return icons[type] || '📧';
  };

  const getTemplateColor = (type) => {
    const colors = {
      application_received: 'from-purple-500 to-purple-700',
      application_reviewed: 'from-blue-500 to-blue-700',
      application_shortlisted: 'from-green-500 to-green-700',
      application_rejected: 'from-gray-500 to-gray-700'
    };
    return colors[type] || 'from-indigo-500 to-indigo-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customize email templates sent to applicants
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`bg-gradient-to-r ${getTemplateColor(template.type)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getTemplateIcon(template.type)}</span>
                    <div>
                      <h3 className="text-xl font-bold">{template.name}</h3>
                      <p className="text-sm opacity-90">{template.type}</p>
                    </div>
                  </div>
                  {template.tenantId && (
                    <span className="bg-white/20 text-xs px-2 py-1 rounded">Custom</span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Subject</label>
                    <p className="text-sm text-gray-900 mt-1">{template.subject}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <div className="flex items-center mt-1">
                      {template.isActive ? (
                        <span className="flex items-center text-green-600 text-sm">
                          <FaCheckCircle className="mr-1" /> Active
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Inactive</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                    {template.tenantId && (
                      <button
                        onClick={() => handleReset(template)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Reset to default"
                      >
                        <FaUndo />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Edit Form */
        <div className="bg-white rounded-lg shadow-md">
          <div className={`bg-gradient-to-r ${getTemplateColor(selectedTemplate.type)} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getTemplateIcon(selectedTemplate.type)}</span>
                <div>
                  <h3 className="text-xl font-bold">Edit: {selectedTemplate.name}</h3>
                  <p className="text-sm opacity-90">{selectedTemplate.type}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedTemplate(null);
                  setShowPreview(false);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter email subject..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Use variables like {'{'}{'{'} positionTitle {'}'}{'}'}
              </p>
            </div>

            {/* HTML Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Content
              </label>
              <textarea
                value={editForm.htmlContent}
                onChange={(e) => setEditForm({ ...editForm, htmlContent: e.target.value })}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter HTML content..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Available variables: applicantName, positionTitle, companyName, companyLogo, applicationId, etc.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handlePreview}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEye className="mr-2" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FaSave className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedTemplate(null);
                  setShowPreview(false);
                }}
                className="flex items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-96">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      {!isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <FaEnvelope className="mr-2" />
            Available Template Variables
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">
                {'{'}{'{'} applicantName {'}'}{'}'}
              </code>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">
                {'{'}{'{'} positionTitle {'}'}{'}'}
              </code>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">
                {'{'}{'{'} companyName {'}'}{'}'}
              </code>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">
                {'{'}{'{'} companyLogo {'}'}{'}'}
              </code>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">
                {'{'}{'{'} applicationId {'}'}{'}'}
              </code>
            </div>
            <div>
              <code className="bg-white px-2 py-1 rounded text-blue-600">
                {'{'}{'{'} appliedDate {'}'}{'}'}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
