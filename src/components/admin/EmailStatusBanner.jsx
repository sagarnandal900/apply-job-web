import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaCog } from 'react-icons/fa';
import { API_URL } from '../../services/api';

const EmailStatusBanner = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEmailStatus();
  }, []);

  const checkEmailStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/email-config/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Error checking email status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!status) {
    return null; // Don't show if we couldn't check status
  }

  // Don't show if email is configured and active
  if (status.isConfigured && status.isActive) {
    return null;
  }

  // Email not configured at all
  if (!status.isConfigured) {
    return (
      <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <FaTimesCircle className="text-red-600 text-xl mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-semibold mb-1">
                ⚠️ Email System Not Configured
              </h3>
              <p className="text-red-700 text-sm">
                Email notifications are not set up! Applicants won't receive any emails when they apply or when their status changes.
              </p>
            </div>
          </div>
          <Link
            to="/admin/email-config"
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <FaCog />
            Configure Now
          </Link>
        </div>
      </div>
    );
  }

  // Email configured but disabled
  if (status.isConfigured && !status.isActive) {
    return (
      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-600 text-xl mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-800 font-semibold mb-1">
                ⏸️ Email Notifications Disabled
              </h3>
              <p className="text-yellow-700 text-sm">
                Email system is configured but currently disabled. Applicants won't receive notifications until you enable it.
              </p>
              {status.provider && (
                <p className="text-yellow-700 text-xs mt-1">
                  <strong>Provider:</strong> {status.provider} | <strong>From:</strong> {status.fromEmail}
                </p>
              )}
            </div>
          </div>
          <Link
            to="/admin/email-config"
            className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <FaCog />
            Enable Email
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default EmailStatusBanner;
