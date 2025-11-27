import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaShieldAlt, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../services/api';

// Define all modules and their permissions
const MODULES = [
  { key: 'positions', label: 'Job Positions' },
  { key: 'applications', label: 'Applications' },
  { key: 'settings', label: 'Company Settings' },
  { key: 'emailConfig', label: 'Email Configuration' },
  { key: 'emailTemplates', label: 'Email Templates' },
  { key: 'homeContent', label: 'Home Content' },
  { key: 'ringAI', label: 'Ring AI Configuration' },
  { key: 'aiConfig', label: 'AI Configuration' },
  { key: 'aiMatching', label: 'AI Matching System' },
  { key: 'roles', label: 'Roles Management' },
  { key: 'users', label: 'Users Management' }
];

const PERMISSIONS = [
  { key: 'view', label: 'View' },
  { key: 'add', label: 'Add' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' }
];

const RolesManager = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {},
    isActive: true
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (role = null) => {
    if (role) {
      // Edit mode
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || {},
        isActive: role.isActive
      });
    } else {
      // Add mode - initialize all permissions to false
      const defaultPermissions = {};
      MODULES.forEach(module => {
        defaultPermissions[module.key] = {
          view: false,
          add: false,
          edit: false,
          delete: false
        };
      });
      
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: defaultPermissions,
        isActive: true
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: {},
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePermissionChange = (moduleKey, permissionKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          ...prev.permissions[moduleKey],
          [permissionKey]: !prev.permissions[moduleKey]?.[permissionKey]
        }
      }
    }));
  };

  const handleSelectAllModule = (moduleKey) => {
    const allChecked = PERMISSIONS.every(p => formData.permissions[moduleKey]?.[p.key]);
    
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          view: !allChecked,
          add: !allChecked,
          edit: !allChecked,
          delete: !allChecked
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (editingRole) {
        // Update existing role
        await axios.put(`${API_URL}/roles/${editingRole.id}`, formData, config);
        toast.success('Role updated successfully');
      } else {
        // Create new role
        await axios.post(`${API_URL}/roles`, formData, config);
        toast.success('Role created successfully');
      }

      handleCloseForm();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDelete = async (roleId, roleName, isSystem) => {
    if (isSystem) {
      toast.error('Cannot delete system roles');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/roles/${roleId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Role deleted successfully');
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        toast.error(error.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  const countPermissions = (permissions) => {
    if (!permissions) return 0;
    let count = 0;
    Object.values(permissions).forEach(modulePerms => {
      if (modulePerms) {
        count += Object.values(modulePerms).filter(Boolean).length;
      }
    });
    return count;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaShieldAlt className="text-yellow-500" />
            Roles Management
          </h1>
          <p className="text-gray-600 mt-2">Create and manage roles with granular permissions</p>
        </div>
        {!showForm && (
          <button
            onClick={() => handleOpenForm()}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FaPlus /> Add New Role
          </button>
        )}
      </div>

      {/* Role Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="e.g., HR Manager, Recruiter"
                  required
                  disabled={editingRole?.isSystem}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Brief description of this role"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                Active Role
              </label>
            </div>

            {/* Permission Matrix */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Permissions</h3>
              <div className="overflow-x-auto bg-gray-50 rounded-xl p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-bold text-gray-700">Module</th>
                      {PERMISSIONS.map(permission => (
                        <th key={permission.key} className="text-center py-3 px-4 font-bold text-gray-700">
                          {permission.label}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-bold text-gray-700">All</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map(module => (
                      <tr key={module.key} className="border-b border-gray-200 hover:bg-white transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-700">{module.label}</td>
                        {PERMISSIONS.map(permission => (
                          <td key={permission.key} className="text-center py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handlePermissionChange(module.key, permission.key)}
                              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                                formData.permissions[module.key]?.[permission.key]
                                  ? 'bg-yellow-500 border-yellow-500 text-white'
                                  : 'bg-white border-gray-300 hover:border-yellow-400'
                              }`}
                            >
                              {formData.permissions[module.key]?.[permission.key] && <FaCheck />}
                            </button>
                          </td>
                        ))}
                        <td className="text-center py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleSelectAllModule(module.key)}
                            className="px-4 py-2 text-sm bg-gray-200 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors font-semibold"
                          >
                            Toggle All
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all flex items-center gap-2 shadow-lg"
              >
                <FaSave /> {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles List */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <div
              key={role.id}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    {role.name}
                    {role.isSystem && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        System
                      </span>
                    )}
                    {!role.isActive && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </h3>
                  {role.description && (
                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-yellow-50 px-3 py-2 rounded-lg">
                  <FaShieldAlt className="text-yellow-500" />
                  <span className="font-semibold">{countPermissions(role.permissions)} permissions granted</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenForm(role)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDelete(role.id, role.name, role.isSystem)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}

          {roles.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FaShieldAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No roles created yet</p>
              <p className="text-gray-400 mt-2">Click "Add New Role" to create your first role</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RolesManager;
