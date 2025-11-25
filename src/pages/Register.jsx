import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tenantAuthAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Company Information
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    address: '',
    website: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await tenantAuthAPI.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        address: formData.address,
        website: formData.website,
        description: formData.description
      });

      toast.success(response.data.message || 'Registration successful! Please wait for admin approval.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-20 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-lg text-gray-600">
            Join our platform and start hiring top talent today!
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <FaUser className="inline mr-2 text-primary-600" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="label">
                    <FaEnvelope className="inline mr-2 text-primary-600" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="label">
                    <FaLock className="inline mr-2 text-primary-600" />
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="label">
                    <FaLock className="inline mr-2 text-primary-600" />
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="label">
                    <FaPhone className="inline mr-2 text-primary-600" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FaBuilding className="text-white text-sm" />
                </div>
                Company Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <FaBuilding className="inline mr-2 text-purple-600" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="label">
                    <FaEnvelope className="inline mr-2 text-purple-600" />
                    Company Email *
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="info@acme.com"
                  />
                </div>

                <div>
                  <label className="label">
                    <FaPhone className="inline mr-2 text-purple-600" />
                    Company Phone
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>

                <div>
                  <label className="label">
                    <FaGlobe className="inline mr-2 text-purple-600" />
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://www.acme.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    <FaMapMarkerAlt className="inline mr-2 text-purple-600" />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="123 Business Street, City, State 12345"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Company Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="input-field"
                    placeholder="Tell us about your company..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Already have an account? Login
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-lg font-bold text-lg hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Registering...
                  </span>
                ) : (
                  'Register'
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">📌 What happens next?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Your registration will be reviewed by our admin team</li>
                <li>You'll receive an email once your account is approved</li>
                <li>After approval, you can login and start posting jobs</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-primary-600 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
