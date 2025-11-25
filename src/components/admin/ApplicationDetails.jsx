import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI, filesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaDownload, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaLinkedin } from 'react-icons/fa';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await applicationsAPI.getById(id);
      const app = response.data.data;
      setApplication(app);
      
      // Get photo URL if exists
      if (app.photoPath) {
        const filename = app.photoPath.split('/').pop();
        const token = localStorage.getItem('token');
        setPhotoUrl(`${filesAPI.getPhoto(filename)}?token=${token}`);
      }
    } catch (error) {
      toast.error('Failed to fetch application details');
      navigate('/admin/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await applicationsAPI.updateStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchApplication();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadResume = async () => {
    try {
      const filename = application.resumePath.split('/').pop();
      const response = await filesAPI.downloadResume(filename);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Resume downloaded successfully');
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="spinner"></div></div>;
  }

  if (!application) {
    return <div className="text-center py-8">Application not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/applications')} className="btn-secondary flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Applications
        </button>
        <div className="flex gap-2">
          <select
            value={application.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`badge badge-${application.status} cursor-pointer px-4 py-2`}
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={application.fullName}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-600">
                {application.fullName.charAt(0)}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{application.fullName}</h2>
            <p className="text-gray-600 mb-4">{application.positionId?.title}</p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center text-gray-700">
                <FaEnvelope className="mr-3 text-primary-600" />
                <a href={`mailto:${application.email}`} className="hover:text-primary-600">{application.email}</a>
              </div>
              <div className="flex items-center text-gray-700">
                <FaPhone className="mr-3 text-primary-600" />
                <a href={`tel:${application.phone}`} className="hover:text-primary-600">{application.phone}</a>
              </div>
              <div className="flex items-center text-gray-700">
                <FaMapMarkerAlt className="mr-3 text-primary-600" />
                <span>{application.currentLocation}</span>
              </div>
              {application.linkedIn && (
                <div className="flex items-center text-gray-700">
                  <FaLinkedin className="mr-3 text-primary-600" />
                  <a href={application.linkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 truncate">
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>

            <button onClick={handleDownloadResume} className="w-full btn-primary mt-6 flex items-center justify-center">
              <FaDownload className="mr-2" /> Download Resume
            </button>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Details */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaBriefcase className="mr-2 text-primary-600" /> Professional Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Company</p>
                <p className="font-medium text-gray-900">{application.currentCompany || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Experience</p>
                <p className="font-medium text-gray-900">{application.experience} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relevant Experience</p>
                <p className="font-medium text-gray-900">{application.relevantExperience || 0} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Salary</p>
                <p className="font-medium text-gray-900">
                  {application.currentSalary ? `₹${application.currentSalary.toLocaleString()}` : 'Not disclosed'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Salary</p>
                <p className="font-medium text-gray-900 text-green-600">₹{application.expectedSalary.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaGraduationCap className="mr-2 text-primary-600" /> Education
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Highest Qualification</p>
                <p className="font-medium text-gray-900">{application.education}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">University/College</p>
                <p className="font-medium text-gray-900">{application.university}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium text-gray-900">{new Date(application.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-medium text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cover Letter</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
