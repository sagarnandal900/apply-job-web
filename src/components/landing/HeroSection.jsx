import React from 'react';
import { FaBriefcase, FaUsers, FaChartLine, FaRocket } from 'react-icons/fa';

const HeroSection = ({ companySettings, homeContent }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Modern geometric background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          {/* Premium badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <FaRocket className="text-purple-600" />
            <span className="text-sm font-semibold">NOW HIRING • JOIN OUR TEAM</span>
          </div>

          {/* Main heading with gradient effect */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 animate-slide-up">
            <span className="block bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
              {homeContent?.heroTitle || 'Find Your Dream Job Today'}
            </span>
          </h1>

          {/* Subtitle - HIGHLIGHTED & PROMINENT */}
          <div className="relative mb-12 animate-slide-up animation-delay-200">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/30 via-orange-200/30 to-yellow-200/30 blur-2xl"></div>
            
            {/* Subtitle text with enhanced styling */}
            <p className="relative text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-800 max-w-5xl mx-auto leading-relaxed font-bold px-6 py-6 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-yellow-300/50">
              <span className="bg-gradient-to-r from-gray-900 via-orange-800 to-gray-900 bg-clip-text text-transparent">
                {homeContent?.heroSubtitle || 'Connect with top employers and discover exciting career opportunities that match your skills and aspirations.'}
              </span>
            </p>
          </div>

          {/* Modern CTA buttons - SUPER HIGHLIGHTED */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up animation-delay-400">
            {/* Primary Button - View Open Positions */}
            <a
              href="#positions"
              className="group relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-gray-900 px-12 py-6 rounded-2xl font-black text-xl hover:from-yellow-500 hover:via-orange-500 hover:to-red-600 transition-all duration-300 inline-flex items-center justify-center shadow-2xl hover:shadow-yellow-500/60 hover:scale-110 hover:-translate-y-2 overflow-hidden animate-pulse hover:animate-none"
            >
              {/* Glowing background effect */}
              <span className="absolute inset-0 rounded-2xl bg-yellow-400 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></span>
              
              {/* Animated shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              
              {/* Sparkles */}
              <span className="absolute top-2 left-8 w-2 h-2 bg-white rounded-full animate-ping"></span>
              <span className="absolute bottom-2 right-8 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></span>
              <span className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></span>
              
              {/* Content */}
              <span className="relative flex items-center gap-3">
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span className="drop-shadow-sm">{homeContent?.heroButtonText || 'View Open Positions'}</span>
                <svg className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            
        
          </div>

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Stat 1 - Glassmorphism design */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 animate-slide-up animation-delay-600">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaBriefcase className="text-4xl text-white" />
                </div>
                <h3 className="text-5xl font-black mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">25+</h3>
                <p className="text-gray-800 font-bold text-lg">Open Positions</p>
                <p className="text-sm text-gray-600 mt-1">Multiple departments</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 animate-slide-up animation-delay-800">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="text-4xl text-white" />
                </div>
                <h3 className="text-5xl font-black mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">300+</h3>
                <p className="text-gray-800 font-bold text-lg">Team Members</p>
                <p className="text-sm text-gray-600 mt-1">Growing community</p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 animate-slide-up animation-delay-1000">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaChartLine className="text-4xl text-white" />
                </div>
                <h3 className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">28+</h3>
                <p className="text-gray-800 font-bold text-lg">Years Strong</p>
                <p className="text-sm text-gray-600 mt-1">Industry expertise</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant wave divider with gradient */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-20 sm:h-32" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path fill="url(#waveGradient)" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          <path fill="#ffffff" d="M0,96L48,90.7C96,85,192,75,288,80C384,85,480,107,576,112C672,117,768,107,864,101.3C960,96,1056,96,1152,101.3C1248,107,1344,117,1392,122.7L1440,128L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
