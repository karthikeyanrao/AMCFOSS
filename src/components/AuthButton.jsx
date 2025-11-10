// Authentication Button Component for AMC FOSS Club
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faSignOutAlt, faDashboard, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const AuthButton = ({ onAuthModalOpen, onDashboardOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, userProfile, logout, isMentor, isOfficeBearer } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  // Handle dashboard navigation
  const handleDashboardClick = () => {
    setIsDropdownOpen(false);
    onDashboardOpen();
  };

  // If user is not authenticated, show login/register button
  if (!user) {
    return (
      <motion.button
        onClick={onAuthModalOpen}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-full hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 transform hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Login / Register
      </motion.button>
    );
  }

  // If user is authenticated, show user avatar and dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {userProfile?.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
        </div>

        {/* User Name */}
        <span className="text-white font-medium hidden md:block">
          {userProfile?.displayName?.split(' ')[0] || user.email?.split('@')[0]}
        </span>

        {/* Role Badge */}
        <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full hidden sm:block">
          {isMentor() ? 'Mentor' : 'Office Bearer'}
        </span>

        {/* Dropdown Arrow */}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-3 h-3 text-white/70 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {userProfile?.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {userProfile?.displayName || 'User'}
                  </p>
                  <p className="text-white/60 text-sm truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      isMentor()
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {isMentor() ? 'Mentor' : 'Office Bearer'}
                    </span>
                    <span className="ml-2 text-white/50 text-xs">
                      {userProfile?.department} • {userProfile?.year}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Dashboard */}
              <button
                onClick={handleDashboardClick}
                className="w-full px-4 py-3 flex items-center space-x-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <FontAwesomeIcon icon={faDashboard} className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              {/* Profile Settings */}
              <button className="w-full px-4 py-3 flex items-center space-x-3 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200">
                <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                <span className="text-sm font-medium">Profile Settings</span>
              </button>

              {/* Divider */}
              <div className="my-2 h-px bg-white/10"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center space-x-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthButton;