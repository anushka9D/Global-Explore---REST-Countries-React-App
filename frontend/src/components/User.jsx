import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaExclamationCircle, 
  FaCheckCircle, 
  FaUserEdit, 
  FaTrash, 
  FaSignOutAlt,
  FaCheck,
  FaArrowLeft
} from 'react-icons/fa';

import { Link, useNavigate } from 'react-router-dom';

function User() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const navigate = useNavigate();

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      // Get the JWT token from local storage
      const token = Cookies.get('token');

      console.log('this is token'+token);
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get('http://localhost:8090/api/auth/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserData(response.data.user);
      // Initialize edit form with current data
      setEditFormData({
        name: response.data.user.name,
        email: response.data.user.email,
        password: '',
        confirmPassword: ''
      });
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load user data. Please try again.');
      setIsLoading(false);
      if (err.response && err.response.status === 401) {
        // Redirect to login if unauthorized
        navigate('/login');
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!editFormData.name || !editFormData.email) {
      setError('Name and email are required');
      return false;
    }

    if (editFormData.password && editFormData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (editFormData.password !== editFormData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      
      // Create update data object
      const updateData = {
        name: editFormData.name,
        email: editFormData.email
      };
      
      // Only include password if it was changed
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }
      
      const response = await axios.put('http://localhost:8090/api/auth/update/user',
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccessMessage('Profile updated successfully!');
      setUserData(response.data.user);
      setIsEditing(false);
      setIsLoading(false);
      
      // Clear password fields after update
      setEditFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Update failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== userData.email) {
      setError('Please enter your email correctly to confirm deletion');
      return;
    }
    
    try {
      setIsLoading(true);
      const token = Cookies.get('token');
      
      await axios.delete('http://localhost:8090/api/auth/delete/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Clear local storage and redirect to signup
      Cookies.remove('token');
      navigate('/');
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    navigate('/');
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccessMessage('');
    
    // Reset form data to current user data when toggling edit mode
    if (!isEditing) {
      setEditFormData({
        name: userData.name,
        email: userData.email,
        password: '',
        confirmPassword: ''
      });
    }
  };

  const toggleDeleteConfirm = () => {
    setIsDeleting(!isDeleting);
    setConfirmDelete('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-indigo-800 dark:to-purple-900 p-6 sm:p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-3">
                {isEditing ? (
                  <FaUserEdit className="h-8 w-8 text-white" />
                ) : (
                  <FaUser className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-white">
              {isEditing ? "Edit Profile" : "User Profile"}
            </h1>
            <p className="text-blue-100 text-center mt-2">
              {isEditing ? "Update your personal information" : "View and manage your account"}
            </p>
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
                <FaCheckCircle className="text-green-500 dark:text-green-400 h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 dark:text-green-400 text-sm">{successMessage}</p>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
                <FaExclamationCircle className="text-red-500 dark:text-red-400 h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            {isDeleting ? (
              // Delete Account Confirmation
              <div className="space-y-5">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Delete Account</h3>
                  <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                    This action cannot be undone. All your data will be permanently removed.
                  </p>
                  <div>
                    <label htmlFor="confirmDelete" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type your email to confirm: <span className="font-semibold">{userData.email}</span>
                    </label>
                    <input
                      id="confirmDelete"
                      type="email"
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm mb-4"
                      placeholder={userData.email}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70"
                    >
                      {isLoading ? "Processing..." : "Permanently Delete Account"}
                    </button>
                    <button
                      onClick={toggleDeleteConfirm}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : isEditing ? (
              // Edit Form
              <form onSubmit={handleUpdate} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={editFormData.password}
                      onChange={handleEditChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="h-5 w-5" />
                        ) : (
                          <FaEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={editFormData.confirmPassword}
                      onChange={handleEditChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash className="h-5 w-5" />
                        ) : (
                          <FaEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Password Requirements */}
                {editFormData.password && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password strength:</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${editFormData.password.length >= 8 ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}>
                          <FaCheck className="h-4 w-4" />
                        </div>
                        <p className={`ml-2 text-xs ${editFormData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          At least 8 characters
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${/[A-Z]/.test(editFormData.password) ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}>
                          <FaCheck className="h-4 w-4" />
                        </div>
                        <p className={`ml-2 text-xs ${/[A-Z]/.test(editFormData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          At least one uppercase letter
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${/[0-9]/.test(editFormData.password) ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}>
                          <FaCheck className="h-4 w-4" />
                        </div>
                        <p className={`ml-2 text-xs ${/[0-9]/.test(editFormData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          At least one number
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleEditMode}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Profile View
              <div className="space-y-6">
                {/* User info card */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                  <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-medium">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">
                    {userData.name}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-center mb-6 flex items-center justify-center">
                    <FaEnvelope className="h-4 w-4 mr-2" />
                    {userData.email}
                  </p>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <dl>
                      <div className="flex py-2">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-1">Full Name</dt>
                        <dd className="text-sm text-gray-900 dark:text-white font-medium">{userData.name}</dd>
                      </div>
                      <div className="flex py-2 border-t border-gray-200 dark:border-gray-700">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-1">Email</dt>
                        <dd className="text-sm text-gray-900 dark:text-white font-medium">{userData.email}</dd>
                      </div>
                      <div className="flex py-2 border-t border-gray-200 dark:border-gray-700">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-1">Password</dt>
                        <dd className="text-sm text-gray-900 dark:text-white font-medium">••••••••</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={toggleEditMode}
                    className="flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    <FaUserEdit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    <FaSignOutAlt className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
                
                {/* Delete Account */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={toggleDeleteConfirm}
                    className="flex justify-center items-center w-full py-3 px-4 border border-red-300 dark:border-red-800 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                  >
                    <FaTrash className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
                
                {/* Back to Home button */}
                <div className="text-center pt-4">
                  <a 
                    href="/home" 
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <FaArrowLeft className="h-3 w-3 mr-1" />
                    Back to Home
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;