// Authentication functions for AMC FOSS Club
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Registration function with email validation
export const registerUser = async (email, password, userData) => {
  try {
    // Validate email domain
    if (!email.endsWith('@amrita.edu')) {
      throw new Error('Only @amrita.edu email addresses are allowed');
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: userData.displayName
    });

    // Save user data to Firestore
    const userDoc = {
      uid: user.uid,
      email: email,
      displayName: userData.displayName,
      role: userData.role,
      department: userData.department,
      year: userData.year,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      profile: {
        avatar: null,
        bio: '',
        skills: []
      }
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return { success: true, user };
  } catch (error) {
    let errorMessage = 'Registration failed';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 8 characters long';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format';
        break;
      default:
        errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// Login function with error handling
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login timestamp
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: serverTimestamp()
    });

    return { success: true, user };
  } catch (error) {
    let errorMessage = 'Login failed';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      default:
        errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// Logout function with state cleanup
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    throw new Error('Logout failed');
  }
};

// Password reset functionality
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Password reset failed';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format';
        break;
      default:
        errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// Session persistence management (Firebase handles this automatically)
// But we can add custom logic if needed

// Auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get user profile data
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    throw new Error('Failed to fetch user profile');
  }
};

// Update user profile
export const updateUserProfile = async (uid, profileData) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    throw new Error('Failed to update profile');
  }
};