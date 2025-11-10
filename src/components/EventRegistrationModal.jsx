// Event Registration Modal Component for AMC FOSS Club
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faClock,
  faUser,
  faEnvelope,
  faGraduationCap,
  faBuilding,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { registerForEvent, isUserRegisteredForEvent } from '../services/eventService';

const EventRegistrationModal = ({ isOpen, onClose, event }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    year: '',
    specialRequirements: '',
    agreeToTerms: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { user, userProfile } = useAuth();

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (isOpen && user && userProfile) {
      setFormData({
        name: userProfile.displayName || '',
        email: user.email,
        department: userProfile.department || '',
        year: userProfile.year || '',
        specialRequirements: '',
        agreeToTerms: false
      });
    }
  }, [isOpen, user, userProfile]);

  // Check registration status when event changes
  useEffect(() => {
    if (isOpen && event && user) {
      checkRegistrationStatus();
    }
  }, [isOpen, event, user]);

  const checkRegistrationStatus = async () => {
    try {
      const result = await isUserRegisteredForEvent(event.id, user.uid);
      setIsRegistered(result.isRegistered);
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

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

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      errors.name = 'Name must be between 2 and 50 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!formData.email.endsWith('@amrita.edu')) {
      errors.email = 'Only @amrita.edu email addresses are allowed';
    }

    if (!formData.department) {
      errors.department = 'Please select your department';
    }

    if (!formData.year) {
      errors.year = 'Please select your year of study';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
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

    setLoading(true);

    try {
      const result = await registerForEvent(event.id, user.uid, formData);

      if (result.success) {
        setRegistrationSuccess(true);
        setIsRegistered(true);

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setRegistrationSuccess(false);
        }, 2000);
      }
    } catch (error) {
      setFormErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Format event date
  const formatEventDate = (date) => {
    const eventDate = date.toDate ? date.toDate() : new Date(date);
    return eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !event) return null;

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
          className="relative w-full max-w-2xl max-h-[90vh] bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Success State */}
          {registrationSuccess ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="w-10 h-10 text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
              <p className="text-white/60">You have been successfully registered for {event.title}</p>
              <p className="text-white/40 text-sm mt-2">This window will close automatically...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="relative p-6 border-b border-white/10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Event Registration</h2>

                {/* Event Details */}
                <div className="bg-white/5 rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                  <div className="space-y-2 text-white/70 text-sm">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-2" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faUsers} className="w-4 h-4 mr-2" />
                      <span>{event.currentRegistrations || 0}/{event.maxParticipants || 50} registered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Error Display */}
                {formErrors.general && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 mr-2" />
                    {formErrors.general}
                  </div>
                )}

                {/* Already Registered Notice */}
                {isRegistered && (
                  <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-200 text-sm">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                    You are already registered for this event.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4"
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all ${
                          formErrors.name ? 'border-red-500/50' : 'border-white/20'
                        }`}
                        placeholder="Enter your full name"
                        disabled={isRegistered}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-red-400 text-xs">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      College Email *
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
                        disabled={isRegistered}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-red-400 text-xs">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Department *
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4"
                      />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all appearance-none ${
                          formErrors.department ? 'border-red-500/50' : 'border-white/20'
                        }`}
                        disabled={isRegistered}
                      >
                        <option value="" className="bg-gray-800">Select Department</option>
                        <option value="CSE" className="bg-gray-800">Computer Science</option>
                        <option value="ECE" className="bg-gray-800">Electronics & Communication</option>
                        <option value="EEE" className="bg-gray-800">Electrical & Electronics</option>
                        <option value="MECH" className="bg-gray-800">Mechanical</option>
                        <option value="CIVIL" className="bg-gray-800">Civil</option>
                        <option value="CHEMICAL" className="bg-gray-800">Chemical</option>
                        <option value="OTHER" className="bg-gray-800">Other</option>
                      </select>
                    </div>
                    {formErrors.department && (
                      <p className="mt-1 text-red-400 text-xs">{formErrors.department}</p>
                    )}
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Year of Study *
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4"
                      />
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all appearance-none ${
                          formErrors.year ? 'border-red-500/50' : 'border-white/20'
                        }`}
                        disabled={isRegistered}
                      >
                        <option value="" className="bg-gray-800">Select Year</option>
                        <option value="1st" className="bg-gray-800">1st Year</option>
                        <option value="2nd" className="bg-gray-800">2nd Year</option>
                        <option value="3rd" className="bg-gray-800">3rd Year</option>
                        <option value="4th" className="bg-gray-800">4th Year</option>
                      </select>
                    </div>
                    {formErrors.year && (
                      <p className="mt-1 text-red-400 text-xs">{formErrors.year}</p>
                    )}
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="mt-4">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none"
                    placeholder="Any special requirements or accommodations you may need..."
                    disabled={isRegistered}
                  />
                </div>

                {/* Terms Agreement */}
                {!isRegistered && (
                  <div className="mt-6">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="mt-1 w-4 h-4 bg-white/10 border border-white/20 rounded text-white focus:ring-white/30 focus:ring-2"
                      />
                      <span className="ml-2 text-white/70 text-sm">
                        I agree to participate in this event and adhere to all guidelines and rules set by the AMC FOSS Club organizers.
                      </span>
                    </label>
                    {formErrors.agreeToTerms && (
                      <p className="mt-1 text-red-400 text-xs">{formErrors.agreeToTerms}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                {!isRegistered && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      'Register for Event'
                    )}
                  </button>
                )}

                {/* Already Registered Button */}
                {isRegistered && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventRegistrationModal;