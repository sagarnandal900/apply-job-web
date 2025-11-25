import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/admin/Dashboard';
import PositionManager from '../components/admin/PositionManager';
import ApplicationList from '../components/admin/ApplicationList';
import ApplicationDetails from '../components/admin/ApplicationDetails';
import CompanySettings from '../components/admin/CompanySettings';
import EmailConfig from './EmailConfig';
import EmailTemplates from '../components/admin/EmailTemplates';
import HomeContentCMS from './HomeContentCMS';
import RingAIManager from './RingAIManager';
import RolesManager from './RolesManager';
import UsersManager from './UsersManager';
import AIConfigManager from './AIConfigManager';
import AIMatchingResults from './AIMatchingResults';
import ShortlistedCandidates from './ShortlistedCandidates';
import Interviews from './Interviews';
import IntegrationSettings from './IntegrationSettings';
import SelectedCandidates from './SelectedCandidates';
import DocumentVerification from './DocumentVerification';
import { FaHome, FaBriefcase, FaFileAlt, FaSignOutAlt, FaChartLine, FaCog, FaEnvelope, FaEnvelopeOpenText, FaEdit, FaRobot, FaShieldAlt, FaUsers, FaBrain, FaStar, FaCalendar, FaPlug, FaUserCheck, FaFileAlt as FaFileCheck, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  // Check if user has permission for a module
  const hasPermission = (module, action = 'view') => {
    // If not RBAC user (old admin system), grant all permissions
    if (!admin?.isRBACUser) {
      return true;
    }

    // For RBAC users, check permissions
    const permissions = admin?.permissions || {};
    return permissions[module]?.[action] === true;
  };

  // Check if user can see any permission for a module
  const hasAnyPermission = (module) => {
    if (!admin?.isRBACUser) return true;
    const permissions = admin?.permissions || {};
    const modulePerms = permissions[module] || {};
    return Object.values(modulePerms).some(val => val === true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      {/* Top Navigation - Enhanced */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaChartLine className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-sm text-gray-500">Welcome,</span>
                <p className="font-bold text-gray-900">{admin?.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar - Enhanced */}
        <aside className="w-64 bg-white/80 backdrop-blur-xl shadow-xl border-r border-gray-200/50 fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* Dashboard - Always visible */}
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                }`
              }
            >
              <FaChartLine className="text-lg" />
              <span className="font-semibold">Dashboard</span>
            </NavLink>

            {/* Positions */}
            {hasAnyPermission('positions') && (
              <NavLink
                to="/admin/positions"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`
                }
              >
                <FaBriefcase className="text-lg" />
                <span className="font-semibold">Positions</span>
              </NavLink>
            )}

            {/* Applications */}
            {hasAnyPermission('applications') && (
              <NavLink
                to="/admin/applications"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`
                }
              >
                <FaFileAlt className="text-lg" />
                <span className="font-semibold">Applications</span>
              </NavLink>
            )}

            {/* Home Content */}
            {hasAnyPermission('homeContent') && (
              <NavLink
                to="/admin/home-content"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`
                }
              >
                <FaEdit className="text-lg" />
                <span className="font-semibold">Home Page Content</span>
              </NavLink>
            )}

            {/* AI Resume Matching Section */}
            {hasAnyPermission('aiMatching') && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  AI Matching System
                </div>
              </>
            )}

            {/* AI Matching Results */}
            {hasAnyPermission('aiMatching') && (
              <NavLink
                to="/admin/ai-matching-results"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`
                }
              >
                <FaBrain className="text-lg" />
                <span className="font-semibold">Matching Results</span>
              </NavLink>
            )}

            {/* Shortlisted Candidates */}
            {hasAnyPermission('aiMatching') && (
              <NavLink
                to="/admin/shortlisted"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`
                }
              >
                <FaStar className="text-lg" />
                <span className="font-semibold">Shortlisted</span>
              </NavLink>
            )}

            {/* Interviews */}
            {hasAnyPermission('applications') && (
              <NavLink
                to="/admin/interviews"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`
                }
              >
                <FaCalendar className="text-lg" />
                <span className="font-semibold">Interviews</span>
              </NavLink>
            )}

            {/* Selected Candidates */}
            {hasAnyPermission('applications') && (
              <NavLink
                to="/admin/selected-candidates"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:scale-105'
                  }`
                }
              >
                <FaUserCheck className="text-lg" />
                <span className="font-semibold">Selected Candidates</span>
              </NavLink>
            )}

            {/* Document Verification */}
            {hasAnyPermission('applications') && (
              <NavLink
                to="/admin/document-verification"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:scale-105'
                  }`
                }
              >
                <FaFileCheck className="text-lg" />
                <span className="font-semibold">Document Verification</span>
              </NavLink>
            )}

            {/* Settings Dropdown Menu - Configuration Section */}
            {(hasAnyPermission('settings') || hasAnyPermission('emailConfig') || hasAnyPermission('emailTemplates') || hasAnyPermission('ringAI') || hasAnyPermission('aiConfig')) && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Configuration
                </div>
                
                {/* Settings Menu Toggle */}
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="w-full group flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <FaCog className="text-lg" />
                    <span className="font-semibold">Settings</span>
                  </div>
                  {settingsOpen ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />}
                </button>

                {/* Settings Submenu */}
                {settingsOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-indigo-200 pl-2">
                    {/* Company Settings */}
                    {hasAnyPermission('settings') && (
                      <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`
                        }
                      >
                        <FaCog className="text-base" />
                        <span className="font-medium">Company Settings</span>
                      </NavLink>
                    )}

                    {/* Email Config */}
                    {hasAnyPermission('emailConfig') && (
                      <NavLink
                        to="/admin/email-config"
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`
                        }
                      >
                        <FaEnvelope className="text-base" />
                        <span className="font-medium">Email Settings</span>
                      </NavLink>
                    )}

                    {/* Email Templates */}
                    {hasAnyPermission('emailTemplates') && (
                      <NavLink
                        to="/admin/email-templates"
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`
                        }
                      >
                        <FaEnvelopeOpenText className="text-base" />
                        <span className="font-medium">Email Templates</span>
                      </NavLink>
                    )}

                    {/* Integration Settings */}
                    {hasAnyPermission('emailConfig') && (
                      <NavLink
                        to="/admin/integration-settings"
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`
                        }
                      >
                        <FaPlug className="text-base" />
                        <span className="font-medium">Integration Settings</span>
                      </NavLink>
                    )}

                    {/* Ring AI */}
                    {hasAnyPermission('ringAI') && (
                      <NavLink
                        to="/admin/ring-ai"
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`
                        }
                      >
                        <FaRobot className="text-base" />
                        <span className="font-medium">Ring AI Calling</span>
                      </NavLink>
                    )}

                    {/* AI Configuration */}
                    {hasAnyPermission('aiConfig') && (
                      <NavLink
                        to="/admin/ai-config"
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`
                        }
                      >
                        <FaBrain className="text-base" />
                        <span className="font-medium">AI Configuration</span>
                      </NavLink>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Divider - Access Control (only show if user has permission) */}
            {(hasAnyPermission('roles') || hasAnyPermission('users')) && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Access Control
                </div>
              </>
            )}
            
            {/* Roles */}
            {hasAnyPermission('roles') && (
              <NavLink
                to="/admin/roles"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`
                }
              >
                <FaShieldAlt className="text-lg" />
                <span className="font-semibold">Roles</span>
              </NavLink>
            )}

            {/* Users */}
            {hasAnyPermission('users') && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:scale-105'
                  }`
                }
              >
                <FaUsers className="text-lg" />
                <span className="font-semibold">Users</span>
              </NavLink>
            )}
            
            {/* Divider */}
            <div className="my-4 border-t border-gray-200"></div>
            
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:scale-105 transition-all duration-300"
            >
              <FaHome className="text-lg" />
              <span className="font-semibold">View Site</span>
              <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="positions" element={<PositionManager />} />
            <Route path="applications" element={<ApplicationList />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="settings" element={<CompanySettings />} />
            <Route path="email-config" element={<EmailConfig />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="integration-settings" element={<IntegrationSettings />} />
            <Route path="home-content" element={<HomeContentCMS />} />
            <Route path="ring-ai" element={<RingAIManager />} />
            <Route path="ai-config" element={<AIConfigManager />} />
            <Route path="ai-matching-results" element={<AIMatchingResults />} />
            <Route path="shortlisted" element={<ShortlistedCandidates />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="selected-candidates" element={<SelectedCandidates />} />
            <Route path="document-verification" element={<DocumentVerification />} />
            <Route path="roles" element={<RolesManager />} />
            <Route path="users" element={<UsersManager />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const Admin = () => {
  return <AdminLayout />;
};

export default Admin;
