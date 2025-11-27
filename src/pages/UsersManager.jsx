import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUsers, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../services/api';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    roleIds: [],
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch both users and roles
      const [usersResponse, rolesResponse] = await Promise.all([
        axios.get(`${API_URL}/users`, config),
        axios.get(`${API_URL}/roles`, config)
      ]);
      
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data);
      }
      
      if (rolesResponse.data.success) {
        // Only show active roles
        setRoles(rolesResponse.data.data.filter(role => role.isActive));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (user = null) => {
    if (user) {
      // Edit mode
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // Leave empty for edit
        fullName: user.fullName,
        roleIds: user.roleIds || [],
        isActive: user.isActive
      });
    } else {
      // Add mode
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roleIds: [],
        isActive: true
      });
    }
    setShowForm(true);
    setShowPassword(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      roleIds: [],
      isActive: true
    });
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      const roleIds = [...prev.roleIds];
      const index = roleIds.indexOf(roleId);
      
      if (index > -1) {
        roleIds.splice(index, 1);
      } else {
        roleIds.push(roleId);
      }
      
      return { ...prev, roleIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      toast.error('Username, email, and full name are required');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    if (formData.roleIds.length === 0) {
      toast.error('Please assign at least one role');
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

      const submitData = { ...formData };
      
      // Don't send empty password for edit
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }

      if (editingUser) {
        // Update existing user
        await axios.put(`${API_URL}/users/${editingUser.id}`, submitData, config);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await axios.post(`${API_URL}/users`, submitData, config);
        toast.success('User created successfully');
      }

      handleCloseForm();
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete the user "${username}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('User deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
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
            <FaUsers className="text-yellow-500" />
            Users Management
          </h1>
          <p className="text-gray-600 mt-2">Manage admin users and their role assignments</p>
        </div>
        {!showForm && (
          <button
            onClick={() => handleOpenForm()}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FaPlus /> Add New User
          </button>
        )}
      </div>

      {/* User Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password {editingUser ? '' : <span className="text-red-500">*</span>}
                  {editingUser && <span className="text-xs text-gray-500">(Leave empty to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors pr-12"
                    placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Active Status */}
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
                Active User
              </label>
            </div>

            {/* Role Assignment */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-yellow-500" />
                Assign Roles <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map(role => (
                  <div
                    key={role.id}
                    onClick={() => handleRoleToggle(role.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.roleIds.includes(role.id)
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-300 bg-white hover:border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                        formData.roleIds.includes(role.id)
                          ? 'border-yellow-500 bg-yellow-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.roleIds.includes(role.id) && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{role.name}</div>
                        {role.description && (
                          <div className="text-xs text-gray-500 mt-1">{role.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {roles.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No active roles available. Please create roles first.
                  </div>
                )}
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
                <FaSave /> {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Username</th>
                  <th className="px-6 py-4 text-left font-bold">Full Name</th>
                  <th className="px-6 py-4 text-left font-bold">Email</th>
                  <th className="px-6 py-4 text-left font-bold">Roles</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-200 hover:bg-yellow-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">{user.username}</td>
                    <td className="px-6 py-4 text-gray-700">{user.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles?.map(role => (
                          <span
                            key={role.id}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full"
                          >
                            {role.name}
                          </span>
                        ))}
                        {(!user.roles || user.roles.length === 0) && (
                          <span className="text-xs text-gray-400">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleOpenForm(user)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No users created yet</p>
                      <p className="text-gray-400 mt-2">Click "Add New User" to create your first user</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
