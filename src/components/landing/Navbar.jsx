import React from 'react';
import { FaBriefcase, FaInfoCircle } from 'react-icons/fa';

const Navbar = ({ companySettings, getLogoUrl }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Company Name */}
          <div className="flex items-center gap-3">
            {companySettings?.logo && (
              <img 
                src={getLogoUrl ? getLogoUrl(companySettings.logo) : `http://103.122.85.61:5001${companySettings.logo}`}
                alt={companySettings.companyName} 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  console.error('Failed to load logo:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              {companySettings?.companyName || 'Job Application Portal'}
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#positions" 
              className="flex items-center gap-2 text-gray-700 hover:text-primary-600 font-semibold transition-colors"
            >
              <FaBriefcase />
              Open Positionsss
            </a>
          
           
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
