// User Service for AMC FOSS Club - Firestore Operations
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
  collection,
  serverTimestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

/**
 * Get user profile by UID
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, profileData) => {
  try {
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'users', uid), updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
};

/**
 * Upload profile image to Firebase Storage
 */
export const uploadProfileImage = async (uid, imageFile) => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `profile-images/${uid}/${Date.now()}_${imageFile.name}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, imageFile);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user profile with image URL
    await updateUserProfile(uid, {
      'profile.avatar': downloadURL
    });

    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image');
  }
};

/**
 * Get users by role (mentor or office bearer)
 */
export const getUsersByRole = async (role, limitCount = 50) => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', role),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw new Error('Failed to fetch users');
  }
};

/**
 * Get all users (for admin purposes)
 */
export const getAllUsers = async (limitCount = 100) => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
};

/**
 * Search users by name or email
 */
export const searchUsers = async (searchTerm, limitCount = 20) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that searches by display name
    // For a production app, consider using Algolia or similar search service

    const usersQuery = query(
      collection(db, 'users'),
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }
};

/**
 * Update user skills
 */
export const updateUserSkills = async (uid, skills) => {
  try {
    await updateUserProfile(uid, {
      'profile.skills': arrayUnion(...skills)
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user skills:', error);
    throw new Error('Failed to update skills');
  }
};

/**
 * Remove user skill
 */
export const removeUserSkill = async (uid, skill) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      'profile.skills': arrayRemove(skill)
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing user skill:', error);
    throw new Error('Failed to remove skill');
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (uid) => {
  try {
    const userProfile = await getUserProfile(uid);
    const user = userProfile.data;

    // Get tasks created by user
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('createdBy', '==', uid)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasksCreated = tasksSnapshot.size;

    // Get events created by user (if office bearer)
    let eventsCreated = 0;
    if (user.role === 'officeBearer') {
      const eventsQuery = query(
        collection(db, 'events'),
        where('createdBy', '==', uid)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      eventsCreated = eventsSnapshot.size;
    }

    // Get task assignments
    const assignedTasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', uid)
    );
    const assignedTasksSnapshot = await getDocs(assignedTasksQuery);
    const tasksAssigned = assignedTasksSnapshot.size;

    // Calculate completed tasks
    const completedTasks = Array.from(assignedTasksSnapshot.docs).filter(
      doc => doc.data().status === 'completed'
    ).length;

    const stats = {
      tasksCreated,
      tasksAssigned,
      completedTasks,
      eventsCreated,
      joinDate: user.createdAt?.toDate()?.toLocaleDateString(),
      lastLogin: user.lastLogin?.toDate()?.toLocaleDateString()
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw new Error('Failed to fetch user statistics');
  }
};

/**
 * Validate user role
 */
export const validateUserRole = async (uid, requiredRole) => {
  try {
    const userProfile = await getUserProfile(uid);
    const user = userProfile.data;

    if (!user) {
      return { valid: false, reason: 'User not found' };
    }

    if (user.role !== requiredRole) {
      return { valid: false, reason: `User role is ${user.role}, required ${requiredRole}` };
    }

    return { valid: true, user };
  } catch (error) {
    console.error('Error validating user role:', error);
    return { valid: false, reason: 'Validation failed' };
  }
};

/**
 * Check if user has admin privileges (office bearer)
 */
export const hasAdminPrivileges = async (uid) => {
  const validation = await validateUserRole(uid, 'officeBearer');
  return validation.valid;
};

/**
 * Update user activity status
 */
export const updateUserActivity = async (uid, activity) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      lastActivity: serverTimestamp(),
      currentActivity: activity
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user activity:', error);
    // Don't throw error for activity updates to avoid disrupting main flow
    return { success: false };
  }
};

/**
 * Get online users (users with recent activity)
 */
export const getOnlineUsers = async (minutesThreshold = 5) => {
  try {
    const threshold = new Date(Date.now() - minutesThreshold * 60 * 1000);

    // This is a simplified approach - in production, you'd use a more sophisticated method
    const usersQuery = query(
      collection(db, 'users'),
      where('lastLogin', '>=', threshold),
      limit(20)
    );

    const querySnapshot = await getDocs(usersQuery);
    const users = [];

    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching online users:', error);
    throw new Error('Failed to fetch online users');
  }
};