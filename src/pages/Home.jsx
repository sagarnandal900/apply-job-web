import React, { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import PositionCard from '../components/landing/PositionCard';
import ApplicationForm from '../components/application/ApplicationForm';
import { positionsAPI, companySettingsAPI } from '../services/api';
import { toast } from 'react-toastify';

const Home = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);
  const [homeContent, setHomeContent] = useState(null);

  useEffect(() => {
    fetchPositions();
    fetchCompanySettings();
    fetchHomeContent();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const response = await companySettingsAPI.get();
      setCompanySettings(response.data.data);
    } catch (error) {
      console.error('Failed to load company settings:', error);
    }
  };

  const fetchHomeContent = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://103.122.85.61:5001/api';
      const response = await fetch(`${API_BASE_URL}/home-content`);
      const data = await response.json();
      if (data.success) {
        setHomeContent(data.data);
      }
    } catch (error) {
      console.error('Failed to load home content:', error);
    }
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return '';
    const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://103.122.85.61:5001';
    return `${API_BASE_URL}${logoPath}`;
  };

  const fetchPositions = async () => {
    try {
      const response = await positionsAPI.getAll({ status: 'active' });
      setPositions(response.data.data);
    } catch (error) {
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (position) => {
    setSelectedPosition(position);
    setShowApplicationForm(true);
  };

  const handleCloseForm = () => {
    setShowApplicationForm(false);
    setSelectedPosition(null);
  };

  const handleApplicationSuccess = () => {
    fetchPositions(); // Refresh positions if needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-20 blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <Navbar companySettings={companySettings} getLogoUrl={getLogoUrl} />
        <HeroSection companySettings={companySettings} homeContent={homeContent} />

        {/* Positions Section - Enhanced Design */}
        <section id="positions" className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-pink-50/30 to-white">
          {/* Enhanced background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.08),transparent_50%)]"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.08),transparent_50%)]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-pink-200/50 text-pink-700 rounded-full text-sm font-bold mb-6 shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                OPEN POSITIONS
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-pink-700 to-purple-700 bg-clip-text text-transparent">
                  Discover Your Next Opportunity
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore exciting career opportunities and join our team of innovators, creators, and problem solvers
              </p>
            </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 relative">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 mt-6 text-lg font-medium">Loading amazing opportunities...</p>
            </div>
          ) : positions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative">
              {positions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  onApply={handleApply}
                />
              ))}
            </div>
          ) : (
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
                  <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Open Positions Yet</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We're always looking for great talent! Check back soon or send us your resume to be considered for future opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="#about" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span>Learn More About Us</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  <button className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-pink-600 hover:text-pink-600 transition-all duration-300">
                    <span>Set Job Alert</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </section>

      {/* Features Section - Enhanced Design */}
      <section id="features" className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
        {/* Enhanced background with multiple layers */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.08),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-200/50 text-purple-700 rounded-full text-sm font-bold mb-6 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              WHY CHOOSE US
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                {homeContent?.featuresTitle || 'More Than Just a Job'}
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {homeContent?.featuresSubtitle || "We're building something extraordinary, and we want passionate people to join us on this journey"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 - Enhanced Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl opacity-50 -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <span className="text-3xl">🚀</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {homeContent?.feature1Title || 'Easy Application'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {homeContent?.feature1Description || 'Simple and quick online application. Upload your resume and apply in minutes.'}
                  </p>
                  <div className="mt-6 flex items-center text-orange-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Enhanced Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl opacity-50 -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <span className="text-3xl">�</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {homeContent?.feature2Title || 'Top Companies'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {homeContent?.feature2Description || 'Work with leading companies in the industry. Access exclusive job opportunities.'}
                  </p>
                  <div className="mt-6 flex items-center text-emerald-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 - Enhanced Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl opacity-50 -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      <span className="text-3xl">📈</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {homeContent?.feature3Title || 'Career Growth'}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {homeContent?.feature3Description || 'Find roles that match your skills and help you advance your career.'}
                  </p>
                  <div className="mt-6 flex items-center text-indigo-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400 to-blue-400 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          {/* Top Wave Decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Company Logo and Description */}
            {companySettings && (
              <div className="text-center mb-16">
                {companySettings.logo && (
                  <div className="mb-6 flex justify-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <img 
                        src={getLogoUrl(companySettings.logo)}
                        alt={companySettings.companyName} 
                        className="relative h-30 w-auto object-contain filter drop-shadow-2xl"
                        onError={(e) => {
                          console.error('Failed to load footer logo');
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
        
                {companySettings.description && (
                  <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    {companySettings.description}
                  </p>
                )}
              </div>
            )}

         


            {/* Bottom Bar */}
            <div className="border-t border-gray-800/50 pt-8">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">
                  &copy; {new Date().getFullYear()} {companySettings?.companyName || 'Job Application Portal'}. All rights reserved.
                </p>
                <p className="text-gray-600 text-sm">
                  Made with ❤️ by {companySettings?.companyName || 'Our Team'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Application Form Modal */}
      {showApplicationForm && selectedPosition && (
        <ApplicationForm
          position={selectedPosition}
          onClose={handleCloseForm}
          onSuccess={handleApplicationSuccess}
        />
      )}
      </div>
    </div>
  );
};

export default Home;
