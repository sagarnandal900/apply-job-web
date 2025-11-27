import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaMapMarkerAlt, FaRupeeSign, FaClock, FaBuilding, FaArrowRight, FaChevronDown, FaTimes } from 'react-icons/fa';

const PositionCard = ({ position, onApply }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  const toggleExpand = (e) => {
    // Don't expand if clicking on Apply button
    if (e.target.closest('button[data-apply]')) return;
    setIsExpanded(!isExpanded);
  };

  // Modal component rendered via Portal
  const Modal = () => createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={() => setIsExpanded(false)}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ animation: 'modalZoomIn 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-3xl" style={{ zIndex: 1 }}>
          <button 
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <FaTimes />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              position.status === 'active' 
                ? 'bg-white text-green-600' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${position.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
              {position.status === 'active' ? 'Hiring Now' : 'Closed'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white rounded-full text-xs font-bold">
              <FaClock className="text-xs" />
              {position.jobType}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">{position.title}</h2>
          <div className="flex items-center text-white/90">
            <FaBuilding className="mr-2" />
            <span className="font-semibold">{position.department}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl mr-4 shadow-md">
                <FaMapMarkerAlt className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Location</p>
                <p className="font-bold text-gray-900 text-lg">{position.location}</p>
              </div>
            </div>

            <div className="flex items-center bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mr-4 shadow-md">
                <FaRupeeSign className="text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Salary Range</p>
                <p className="font-bold text-emerald-700 text-lg">{position.salaryRange}</p>
              </div>
            </div>

            {(position.experience || position.minimumExperience > 0) && (
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 md:col-span-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4 shadow-md">
                  <FaClock className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Experience Required</p>
                  <p className="font-bold text-blue-700 text-lg">
                    {position.experience || `${position.minimumExperience}-${position.minimumExperience + 2} years`}
                    {position.relevantExperience > 0 && (
                      <span className="text-sm font-normal ml-2">({position.relevantExperience}+ relevant)</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {position.description && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                <div className="w-1 h-5 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full mr-3"></div>
                Job Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{position.description}</p>
            </div>
          )}

          {/* All Requirements */}
          {position.requirements && position.requirements.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                <div className="w-1 h-5 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full mr-3"></div>
                Requirements ({position.requirements.length})
              </h3>
              <ul className="space-y-3">
                {position.requirements.map((req, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    </span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsibilities if available */}
          {position.responsibilities && position.responsibilities.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                Responsibilities
              </h3>
              <ul className="space-y-3">
                {position.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply Button in Modal */}
          <button
            data-apply="true"
            onClick={() => {
              setIsExpanded(false);
              onApply(position);
            }}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center ${
              position.status === 'active'
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={position.status !== 'active'}
          >
            {position.status === 'active' ? (
              <>
                <span>Apply for This Position</span>
                <FaArrowRight className="ml-3" />
              </>
            ) : (
              'Position Closed'
            )}
          </button>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes modalZoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );

  return (
    <>
      {/* Expanded Modal Overlay - rendered via Portal */}
      {isExpanded && <Modal />}

      {/* Regular Card */}
      <div 
        className="group relative h-full cursor-pointer"
        onClick={toggleExpand}
      >
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
        
        <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-yellow-200 h-full flex flex-col overflow-hidden">
          {/* Decorative corner element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl opacity-50 -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>
          
          {/* Card Header */}
          <div className="p-6 pb-4 relative">
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                position.status === 'active' 
                  ? 'bg-gradient-to-r from-emerald-400 to-green-400 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${position.status === 'active' ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></span>
                {position.status === 'active' ? 'Hiring Now' : 'Closed'}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 text-orange-700 rounded-full text-xs font-bold">
                <FaClock className="text-xs" />
                <span>{position.jobType}</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors leading-tight">
              {position.title}
            </h3>
            
            <div className="flex items-center text-gray-600">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg mr-2">
                <FaBuilding className="text-orange-600 text-sm" />
              </div>
              <span className="text-sm font-semibold">{position.department}</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 pb-6 flex-grow flex flex-col">
            {/* Details Grid */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg mr-3 shadow-sm">
                  <FaMapMarkerAlt className="text-white text-sm" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 font-semibold">Location</p>
                  <p className="font-bold text-gray-900">{position.location}</p>
                </div>
              </div>

              <div className="flex items-center bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mr-3 shadow-sm">
                  <FaRupeeSign className="text-white text-sm" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs text-emerald-700 font-semibold">Salary Range</p>
                  <p className="font-bold text-emerald-700">{position.salaryRange}</p>
                </div>
              </div>

              {/* Experience Requirements */}
              {(position.experience || position.minimumExperience > 0 || position.relevantExperience > 0) && (
                <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 shadow-sm">
                    <FaClock className="text-white text-sm" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs text-blue-700 font-semibold">Experience Required</p>
                    <p className="font-bold text-blue-700">
                      {position.experience || `${position.minimumExperience}-${position.minimumExperience + 2}`}
                      {position.relevantExperience > 0 && ` (${position.relevantExperience}+ relevant)`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {position.description && (
              <p className="text-gray-600 mb-5 line-clamp-2 text-sm leading-relaxed">
                {position.description}
              </p>
            )}

            {/* Requirements */}
            {position.requirements && position.requirements.length > 0 && (
              <div className="mb-6 flex-grow">
                <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center">
                  <div className="w-1 h-4 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full mr-2"></div>
                  Key Requirements
                </h4>
                <ul className="space-y-2">
                  {position.requirements.slice(0, 2).map((req, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-orange-600 font-bold text-xs">✓</span>
                      </span>
                      <span className="line-clamp-1">{req}</span>
                    </li>
                  ))}
                  {position.requirements.length > 2 && (
                    <li className="text-sm text-orange-600 font-semibold ml-7 flex items-center">
                      +{position.requirements.length - 2} more requirements
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Apply Button */}
            <button
              data-apply="true"
              onClick={(e) => {
                e.stopPropagation();
                onApply(position);
              }}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center mt-auto ${
                position.status === 'active'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-500 hover:to-orange-500 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={position.status !== 'active'}
            >
              {position.status === 'active' ? (
                <>
                  <span>Apply for This Position</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </>
              ) : (
                'Position Closed'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PositionCard;
