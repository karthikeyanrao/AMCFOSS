// Authentication Modal Component for AMC FOSS Club
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faEyeSlash, faUser, faLock, faEnvelope, faGraduationCap, faUsers } from '@fortawesome/free-solid-svg-icons';

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'mentor',
    department: 'CSE',
    year: '1st',
    rememberMe: false,
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { login, register, loading, error, clearError } = useAuth();

  // Clear form and errors when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        role: 'mentor',
        department: 'CSE',
        year: '1st',
        rememberMe: false,
        agreeToTerms: false
      });
      setFormErrors({});
      clearError();
    }
  }, [isOpen, clearError]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Common validations
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!formData.email.endsWith('@amrita.edu')) {
      errors.email = 'Only @amrita.edu email addresses are allowed';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Registration-specific validations
    if (activeTab === 'register') {
      if (!formData.displayName.trim()) {
        errors.displayName = 'Full name is required';
      } else if (formData.displayName.trim().length < 2 || formData.displayName.trim().length > 50) {
        errors.displayName = 'Name must be between 2 and 50 characters';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (activeTab === 'login') {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onClose();
      }
    } else {
      const userData = {
        displayName: formData.displayName.trim(),
        role: formData.role,
        department: formData.department,
        year: formData.year
      };

      const result = await register(formData.email, formData.password, userData);
      if (result.success) {
        onClose();
      }
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!formData.email.trim()) {
      setFormErrors({ email: 'Email is required for password reset' });
      return;
    }

    const result = await login.resetPassword(formData.email);
    if (result.success) {
      alert('Password reset email sent! Check your inbox.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white text-center mb-4">
              {activeTab === 'login' ? 'Welcome Back' : 'Join AMC FOSS'}
            </h2>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Registration: Full Name */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4"
                  />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all ${
                      formErrors.displayName ? 'border-red-500/50' : 'border-white/20'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {formErrors.displayName && (
                  <p className="mt-1 text-red-400 text-xs">{formErrors.displayName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                College Email
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all ${
                    formErrors.email ? 'border-red-500/50' : 'border-white/20'
                  }`}
                  placeholder="your.email@amrita.edu"
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-red-400 text-xs">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all ${
                    formErrors.password ? 'border-red-500/50' : 'border-white/20'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-red-400 text-xs">{formErrors.password}</p>
              )}
            </div>

            {/* Registration: Confirm Password */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all ${
                      formErrors.confirmPassword ? 'border-red-500/50' : 'border-white/20'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="w-4 h-4" />
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-red-400 text-xs">{formErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Registration: Role Selection */}
            {activeTab === 'register' && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="mentor"
                      checked={formData.role === 'mentor'}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="p-3 bg-white/10 border border-white/20 rounded-lg cursor-pointer peer-checked:bg-white/20 peer-checked:border-white/40 transition-all hover:bg-white/15">
                      <FontAwesomeIcon icon={faGraduationCap} className="w-5 h-5 text-white/80 mb-1" />
                      <p className="text-white font-medium text-sm">Mentor</p>
                    </div>
                  </label>
                  <label className="relative">
                    <input
                      type="radio"
                      name="role"
                      value="officeBearer"
                      checked={formData.role === 'officeBearer'}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="p-3 bg-white/10 border border-white/20 rounded-lg cursor-pointer peer-checked:bg-white/20 peer-checked:border-white/40 transition-all hover:bg-white/15">
                      <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-white/80 mb-1" />
                      <p className="text-white font-medium text-sm">Office Bearer</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Registration: Department and Year */}
            {activeTab === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="CHEMICAL">CHEMICAL</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  >
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
              </div>
            )}

            {/* Login: Remember Me & Forgot Password */}
            {activeTab === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 bg-white/10 border border-white/20 rounded text-white focus:ring-white/30 focus:ring-2"
                  />
                  <span className="ml-2 text-white/70 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Registration: Terms Agreement */}
            {activeTab === 'register' && (
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 bg-white/10 border border-white/20 rounded text-white focus:ring-white/30 focus:ring-2"
                  />
                  <span className="ml-2 text-white/70 text-sm">
                    I agree to the terms and conditions of AMC FOSS Club
                  </span>
                </label>
                {formErrors.agreeToTerms && (
                  <p className="mt-1 text-red-400 text-xs">{formErrors.agreeToTerms}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                activeTab === 'login' ? 'Login' : 'Register'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;