// Notification Toast Component for AMC FOSS Club
import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faExclamationTriangle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

// Toast Context
const ToastContext = createContext();

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);
  const info = (message, duration) => addToast(message, 'info', duration);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
  const getToastConfig = (type) => {
    const configs = {
      success: {
        icon: faCheckCircle,
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        borderColor: 'border-green-600'
      },
      error: {
        icon: faExclamationCircle,
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        borderColor: 'border-red-600'
      },
      warning: {
        icon: faExclamationTriangle,
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
        borderColor: 'border-yellow-600'
      },
      info: {
        icon: faInfoCircle,
        bgColor: 'bg-blue-500',
        textColor: 'text-white',
        borderColor: 'border-blue-600'
      }
    };

    return configs[type] || configs.info;
  };

  const config = getToastConfig(toast.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`toast ${config.bgColor} ${config.textColor} ${config.borderColor} border rounded-lg shadow-lg p-4 mb-3 min-w-[300px] max-w-md`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FontAwesomeIcon icon={config.icon} className="w-5 h-5" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium break-words">
            {toast.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex text-white/60 hover:text-white focus:outline-none transition-colors`}
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Global toast styles
const ToastStyles = () => (
  <style jsx>{`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
      }

      .toast {
        min-width: auto;
        width: 100%;
      }
    }

    /* Ensure toasts appear above modals */
    .toast-container {
      z-index: 10001;
    }
  `}</style>
);

export default ToastProvider;