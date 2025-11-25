import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tenantAuthAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await tenantAuthAPI.login(formData);
      
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast.success('Login successful!');

      // Redirect based on role
      if (response.data.user.role === 'super_admin') {
        navigate('/super-admin');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-30 blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-30 blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-fadeIn">
        {/* Header with enhanced styling */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 animate-bounce-slow">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <FaUserShield className="text-white text-4xl drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 animate-slideDown">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-700 font-medium animate-slideUp">
            Sign in to your admin dashboard
          </p>
        </div>

        {/* Login Form with enhanced glass effect */}
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border-2 border-white/50 hover:shadow-3xl transition-all duration-300 animate-scaleIn">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="transform hover:scale-105 transition-transform duration-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2 text-indigo-600" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 hover:border-purple-400"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div className="transform hover:scale-105 transition-transform duration-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaLock className="inline mr-2 text-purple-600" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 hover:border-pink-400"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center group">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-700 group-hover:text-indigo-600 transition-colors cursor-pointer">
                  Remember me
                </label>
              </div>

              <div>
                <a href="#" className="font-semibold text-indigo-600 hover:text-purple-600 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaUserShield className="text-xl" />
                  Sign In to Dashboard
                </span>
              )}
            </button>

            <div className="text-center pt-6 border-t-2 border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text hover:from-purple-600 hover:to-pink-600 transition-all">
                  Register here
                </Link>
              </p>
            </div>
          </form>

   
        </div>

        {/* Back to Home with enhanced styling */}
        <div className="text-center mt-8 animate-fadeIn">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-semibold text-lg group transition-all duration-300"
          >
            <span className="transform group-hover:-translate-x-2 transition-transform duration-300">←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out 0.2s both;
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out 0.3s both;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
