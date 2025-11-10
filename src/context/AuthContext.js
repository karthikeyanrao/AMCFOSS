// Authentication Context for AMC FOSS Club
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { onAuthStateChange } from '../firebase/auth';

// Initial state
const initialState = {
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Action types
const AUTH_ACTIONS = {
  AUTH_STATE_CHANGED: 'AUTH_STATE_CHANGED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  LOGOUT: 'LOGOUT'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_STATE_CHANGED:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      dispatch({
        type: AUTH_ACTIONS.AUTH_STATE_CHANGED,
        payload: { user }
      });

      // If user is authenticated, fetch their profile
      if (user) {
        try {
          const { getUserProfile } = await import('../firebase/auth');
          const profileResult = await getUserProfile(user.uid);
          dispatch({
            type: AUTH_ACTIONS.SET_USER_PROFILE,
            payload: profileResult.data
          });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          dispatch({
            type: AUTH_ACTIONS.SET_ERROR,
            payload: 'Failed to load user profile'
          });
        }
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Action creators
  const actions = {
    setLoading: (loading) => {
      dispatch({
        type: AUTH_ACTIONS.SET_LOADING,
        payload: loading
      });
    },

    setError: (error) => {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error
      });
    },

    clearError: () => {
      dispatch({
        type: AUTH_ACTIONS.CLEAR_ERROR
      });
    },

    login: async (email, password) => {
      try {
        actions.setLoading(true);
        actions.clearError();

        const { loginUser } = await import('../firebase/auth');
        const result = await loginUser(email, password);

        return { success: true, user: result.user };
      } catch (error) {
        actions.setError(error.message);
        return { success: false, error: error.message };
      } finally {
        actions.setLoading(false);
      }
    },

    register: async (email, password, userData) => {
      try {
        actions.setLoading(true);
        actions.clearError();

        const { registerUser } = await import('../firebase/auth');
        const result = await registerUser(email, password, userData);

        return { success: true, user: result.user };
      } catch (error) {
        actions.setError(error.message);
        return { success: false, error: error.message };
      } finally {
        actions.setLoading(false);
      }
    },

    logout: async () => {
      try {
        actions.setLoading(true);
        actions.clearError();

        const { logoutUser } = await import('../firebase/auth');
        await logoutUser();

        dispatch({ type: AUTH_ACTIONS.LOGOUT });

        return { success: true };
      } catch (error) {
        actions.setError(error.message);
        return { success: false, error: error.message };
      } finally {
        actions.setLoading(false);
      }
    },

    resetPassword: async (email) => {
      try {
        actions.setLoading(true);
        actions.clearError();

        const { resetPassword } = await import('../firebase/auth');
        await resetPassword(email);

        return { success: true };
      } catch (error) {
        actions.setError(error.message);
        return { success: false, error: error.message };
      } finally {
        actions.setLoading(false);
      }
    },

    updateProfile: async (profileData) => {
      try {
        actions.setLoading(true);
        actions.clearError();

        if (!state.user) {
          throw new Error('No authenticated user');
        }

        const { updateUserProfile } = await import('../firebase/auth');
        await updateUserProfile(state.user.uid, profileData);

        // Update local profile state
        dispatch({
          type: AUTH_ACTIONS.SET_USER_PROFILE,
          payload: { ...state.userProfile, ...profileData }
        });

        return { success: true };
      } catch (error) {
        actions.setError(error.message);
        return { success: false, error: error.message };
      } finally {
        actions.setLoading(false);
      }
    },

    // Helper functions
    isMentor: () => state.userProfile?.role === 'mentor',
    isOfficeBearer: () => state.userProfile?.role === 'officeBearer',
    hasRole: (role) => state.userProfile?.role === role
  };

  // Context value
  const value = {
    ...state,
    ...actions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;