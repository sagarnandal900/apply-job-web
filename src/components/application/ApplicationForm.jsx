import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import FileUpload from './FileUpload';
import { validateResumeFile, validatePhotoFile } from '../../utils/fileValidation';
import { validationRules } from '../../utils/validation';
import { applicationsAPI } from '../../services/api';

const ApplicationForm = ({ position, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [resumeFile, setResumeFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onSubmit = async (data) => {
    // Validate files
    const resumeValidation = validateResumeFile(resumeFile);
    if (!resumeValidation.valid) {
      toast.error(resumeValidation.message);
      return;
    }

    const photoValidation = validatePhotoFile(photoFile);
    if (!photoValidation.valid) {
      toast.error(photoValidation.message);
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append('positionId', position.id);
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('dob', data.dob);
    formData.append('currentLocation', data.currentLocation);
    formData.append('currentCompany', data.currentCompany || '');
    formData.append('currentSalary', data.currentSalary || 0);
    formData.append('expectedSalary', data.expectedSalary);
    formData.append('experience', data.experience);
    formData.append('relevantExperience', data.relevantExperience || 0);
    formData.append('education', data.education);
    formData.append('university', data.university);
    formData.append('coverLetter', data.coverLetter || '');
    formData.append('linkedIn', data.linkedIn || '');
    formData.append('resume', resumeFile);
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      await applicationsAPI.submit(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      toast.success('Application submitted successfully!');
      reset();
      setResumeFile(null);
      setPhotoFile(null);
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit application';
      toast.error(message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Apply for {position.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Personal Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  {...register('fullName', validationRules.fullName)}
                  className="input-field"
                  placeholder="Your Full Name"
                />
                {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  {...register('email', validationRules.email)}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  {...register('phone', validationRules.phone)}
                  className="input-field"
                  placeholder="Your Phone Number"
                />
                {errors.phone && <p className="error-message">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="label">Date of Birth *</label>
                <input
                  type="date"
                  {...register('dob', validationRules.dob)}
                  className="input-field"
                />
                {errors.dob && <p className="error-message">{errors.dob.message}</p>}
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Current Location *</label>
                <input
                  type="text"
                  {...register('currentLocation', validationRules.currentLocation)}
                  className="input-field"
                  placeholder="Your City, State"
                />
                {errors.currentLocation && <p className="error-message">{errors.currentLocation.message}</p>}
              </div>

              <div>
                <label className="label">Current Company</label>
                <input
                  type="text"
                  {...register('currentCompany')}
                  className="input-field"
                  placeholder="Your Current Company"
                />
              </div>

              <div>
                <label className="label">Current Salary (Annual)</label>
                <input
                  type="number"
                  {...register('currentSalary', { min: 0 })}
                  className="input-field"
                  placeholder="₹500,000"
                />
              </div>

              <div>
                <label className="label">Expected Salary (Annual) *</label>
                <input
                  type="number"
                  {...register('expectedSalary', validationRules.expectedSalary)}
                  className="input-field"
                  placeholder="₹600,000"
                />
                {errors.expectedSalary && <p className="error-message">{errors.expectedSalary.message}</p>}
              </div>

              <div>
                <label className="label">Total Experience (Years) *</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('experience', {
                    ...validationRules.experience,
                    validate: {
                      ...validationRules.experience.validate,
                      meetsMinimum: (value) => {
                        if (position.minimumExperience && position.minimumExperience > 0) {
                          return parseFloat(value) >= position.minimumExperience || 
                            `Minimum ${position.minimumExperience} years of experience required for this position`;
                        }
                        return true;
                      }
                    }
                  })}
                  className="input-field"
                  placeholder="3.5"
                />
                {errors.experience && <p className="error-message">{errors.experience.message}</p>}
                {position.minimumExperience > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    ⚠️ Minimum required: {position.minimumExperience} years
                  </p>
                )}
              </div>

              <div>
                <label className="label">Relevant Experience (Years) {position.relevantExperience > 0 ? '*' : ''}</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('relevantExperience', {
                    required: position.relevantExperience > 0 ? 'Relevant experience is required for this position' : false,
                    min: {
                      value: 0,
                      message: 'Relevant experience cannot be negative'
                    },
                    validate: {
                      meetsMinimum: (value) => {
                        if (position.relevantExperience && position.relevantExperience > 0) {
                          return parseFloat(value || 0) >= position.relevantExperience || 
                            `Minimum ${position.relevantExperience} years of relevant experience required`;
                        }
                        return true;
                      },
                      notGreaterThanTotal: (value, formValues) => {
                        const totalExp = parseFloat(formValues.experience) || 0;
                        const relExp = parseFloat(value || 0);
                        return relExp <= totalExp || 'Relevant experience cannot exceed total experience';
                      }
                    }
                  })}
                  className="input-field"
                  placeholder="Experience Relevant to This Position"
                />
                {errors.relevantExperience && <p className="error-message">{errors.relevantExperience.message}</p>}
                {position.relevantExperience > 0 ? (
                  <p className="text-xs text-blue-600 mt-1">
                    ⚠️ Minimum required: {position.relevantExperience} years
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Experience relevant to this position</p>
                )}
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Highest Qualification *</label>
                <select
                  {...register('education', validationRules.education)}
                  className="input-field"
                >
                  <option value="">Select Your Highest Qualification</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
                {errors.education && <p className="error-message">{errors.education.message}</p>}
              </div>

              <div>
                <label className="label">University/College *</label>
                <input
                  type="text"
                  {...register('university', validationRules.university)}
                  className="input-field"
                  placeholder="Your University/College Name"
                />
                {errors.university && <p className="error-message">{errors.university.message}</p>}
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload
                label="Resume"
                accept=".pdf,.doc,.docx"
                maxSize={5 * 1024 * 1024}
                onChange={setResumeFile}
                required
                fileType="resume (PDF, DOC, DOCX)"
              />

              <FileUpload
                label="Profile Photo"
                accept="image/jpeg,image/jpg,image/png"
                maxSize={2 * 1024 * 1024}
                onChange={setPhotoFile}
                fileType="photo (JPG, PNG)"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Cover Letter</label>
                <textarea
                  {...register('coverLetter')}
                  className="input-field"
                  rows="4"
                  placeholder="Tell us why you're the perfect fit for this role..."
                ></textarea>
              </div>

              <div>
                <label className="label">LinkedIn Profile URL</label>
                <input
                  type="url"
                  {...register('linkedIn')}
                  className="input-field"
                  placeholder="Your LinkedIn Profile URL"
                />
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm font-medium text-primary-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
