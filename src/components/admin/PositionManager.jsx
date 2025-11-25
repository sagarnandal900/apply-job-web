import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { positionsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

const PositionManager = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // New state for filtering
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a filter from navigation state (from dashboard click)
    if (location.state?.filter) {
      setStatusFilter(location.state.filter);
    }
  }, [location.state]);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await positionsAPI.getAll();
      setPositions(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (position = null) => {
    setEditingPosition(position);
    if (position) {
      setValue('title', position.title);
      setValue('department', position.department);
      setValue('location', position.location);
      setValue('salaryRange', position.salaryRange);
      setValue('description', position.description);
      setValue('requirements', position.requirements?.join('\n') || '');
      setValue('jobType', position.jobType);
      setValue('experience', position.experience || '');
      setValue('minimumExperience', position.minimumExperience || 0);
      setValue('relevantExperience', position.relevantExperience || 0);
      setValue('status', position.status);
    } else {
      reset();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPosition(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        requirements: data.requirements ? data.requirements.split('\n').filter(r => r.trim()) : []
      };

      if (editingPosition) {
        await positionsAPI.update(editingPosition.id, formattedData);
        toast.success('Position updated successfully');
      } else {
        await positionsAPI.create(formattedData);
        toast.success('Position created successfully');
      }

      fetchPositions();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save position');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await positionsAPI.delete(id);
        toast.success('Position deleted successfully');
        fetchPositions();
      } catch (error) {
        // Check if position has applications
        if (error.response?.data?.requiresForce) {
          const applicationCount = error.response.data.applicationCount;
          const confirmMessage = `This position has ${applicationCount} application(s).\n\nDeleting this position will also delete all associated applications.\n\nAre you sure you want to proceed?`;
          
          if (window.confirm(confirmMessage)) {
            try {
              // Force delete with applications
              await positionsAPI.delete(id, { force: 'true' });
              toast.success(`Position and ${applicationCount} application(s) deleted successfully`);
              fetchPositions();
            } catch (forceError) {
              toast.error('Failed to delete position with applications');
              console.error(forceError);
            }
          }
        } else {
          toast.error(error.response?.data?.message || 'Failed to delete position');
        }
      }
    }
  };

  const toggleStatus = async (position) => {
    try {
      const newStatus = position.status === 'active' ? 'inactive' : 'active';
      await positionsAPI.update(position.id, { ...position, status: newStatus });
      toast.success(`Position ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchPositions();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="spinner"></div></div>;
  }

  // Filter positions based on status
  const filteredPositions = positions.filter(position => {
    if (statusFilter === 'all') return true;
    return position.status === statusFilter;
  });

  const activeCount = positions.filter(p => p.status === 'active').length;
  const inactiveCount = positions.filter(p => p.status === 'inactive').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Position Management</h1>
          <p className="text-gray-600 mt-1">
            Total: {positions.length} | Active: {activeCount} | Inactive: {inactiveCount}
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
          <FaPlus className="mr-2" /> Add Position
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Positions ({positions.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'inactive'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Inactive ({inactiveCount})
        </button>
      </div>

      {/* Positions List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPositions.length > 0 ? (
          filteredPositions.map((position) => (
          <div key={position.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{position.title}</h3>
                  <span className={`badge badge-${position.status}`}>{position.status}</span>
                </div>
                <p className="text-gray-600 mb-2">{position.department} • {position.location} • {position.jobType}</p>
                <p className="text-gray-700 font-semibold mb-2">💰 {position.salaryRange}</p>
                {(position.experience || position.minimumExperience > 0 || position.relevantExperience > 0) && (
                  <p className="text-gray-700 mb-2">
                    📊 Experience: {position.experience || `${position.minimumExperience} years`}
                    {position.relevantExperience > 0 && ` (${position.relevantExperience} years relevant)`}
                  </p>
                )}
                <p className="text-gray-600 mb-3">{position.description}</p>
                {position.requirements?.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <strong>Requirements:</strong> {position.requirements.slice(0, 2).join(', ')}
                    {position.requirements.length > 2 && ` +${position.requirements.length - 2} more`}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleStatus(position)}
                  className="p-2 text-gray-600 hover:text-primary-600"
                  title={position.status === 'active' ? 'Deactivate' : 'Activate'}
                >
                  {position.status === 'active' ? <FaToggleOn className="text-2xl text-green-600" /> : <FaToggleOff className="text-2xl" />}
                </button>
                <button onClick={() => handleOpenModal(position)} className="p-2 text-blue-600 hover:text-blue-800">
                  <FaEdit className="text-xl" />
                </button>
                <button onClick={() => handleDelete(position.id)} className="p-2 text-red-600 hover:text-red-800">
                  <FaTrash className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        ))
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">
              {statusFilter === 'all'
                ? 'No positions found. Click "Add Position" to create one.'
                : `No ${statusFilter} positions found.`}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">{editingPosition ? 'Edit Position' : 'Add New Position'}</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Job Title *</label>
                  <input {...register('title', { required: 'Title is required' })} className="input-field" />
                  {errors.title && <p className="error-message">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="label">Department *</label>
                  <input {...register('department', { required: 'Department is required' })} className="input-field" />
                  {errors.department && <p className="error-message">{errors.department.message}</p>}
                </div>
                <div>
                  <label className="label">Location *</label>
                  <input {...register('location', { required: 'Location is required' })} className="input-field" />
                  {errors.location && <p className="error-message">{errors.location.message}</p>}
                </div>
                <div>
                  <label className="label">Salary Range *</label>
                  <input {...register('salaryRange', { required: 'Salary range is required' })} className="input-field" placeholder="₹50,000 - ₹70,000" />
                  {errors.salaryRange && <p className="error-message">{errors.salaryRange.message}</p>}
                </div>
                <div>
                  <label className="label">Job Type *</label>
                  <select {...register('jobType', { required: 'Job type is required' })} className="input-field">
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                  {errors.jobType && <p className="error-message">{errors.jobType.message}</p>}
                </div>
                <div>
                  <label className="label">Status *</label>
                  <select {...register('status')} className="input-field" defaultValue="active">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="label">Experience Required</label>
                  <input 
                    {...register('experience')} 
                    className="input-field" 
                    placeholder="e.g., 2-5 years, Fresher, 3+ years"
                  />
                  <p className="text-xs text-gray-500 mt-1">Text description of experience</p>
                </div>
                <div>
                  <label className="label">Minimum Experience (Years) *</label>
                  <input 
                    type="number" 
                    {...register('minimumExperience', { 
                      required: 'Minimum experience is required',
                      min: { value: 0, message: 'Cannot be negative' },
                      max: { value: 50, message: 'Cannot exceed 50 years' }
                    })} 
                    className="input-field" 
                    placeholder="0"
                    min="0"
                    max="50"
                  />
                  {errors.minimumExperience && <p className="error-message">{errors.minimumExperience.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Total years of experience (0 for fresher)</p>
                </div>
                <div className="col-span-2">
                  <label className="label">Relevant Experience (Years) *</label>
                  <input 
                    type="number" 
                    {...register('relevantExperience', { 
                      required: 'Relevant experience is required',
                      min: { value: 0, message: 'Cannot be negative' },
                      max: { value: 50, message: 'Cannot exceed 50 years' },
                      validate: {
                        notGreaterThanMin: (value, formValues) => {
                          const minExp = parseInt(formValues.minimumExperience) || 0;
                          const relExp = parseInt(value) || 0;
                          return relExp <= minExp || 'Relevant experience cannot exceed minimum experience';
                        }
                      }
                    })} 
                    className="input-field" 
                    placeholder="0"
                    min="0"
                    max="50"
                  />
                  {errors.relevantExperience && <p className="error-message">{errors.relevantExperience.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Years of experience specifically relevant to this role (0 for fresher)</p>
                </div>
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea {...register('description', { required: 'Description is required' })} className="input-field" rows="4"></textarea>
                {errors.description && <p className="error-message">{errors.description.message}</p>}
              </div>
              <div>
                <label className="label">Requirements (one per line)</label>
                <textarea {...register('requirements')} className="input-field" rows="4" placeholder="Bachelor's degree in Computer Science&#10;3+ years of experience&#10;Proficient in React"></textarea>
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingPosition ? 'Update' : 'Create'} Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionManager;
