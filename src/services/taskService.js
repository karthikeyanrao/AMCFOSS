// Task Service for AMC FOSS Club - Firestore Operations
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  try {
    const newTask = {
      title: taskData.title,
      description: taskData.description,
      createdBy: taskData.createdBy,
      assignedTo: taskData.assignedTo || [],
      status: 'pending',
      priority: taskData.priority || 'medium',
      deadline: taskData.deadline ? new Date(taskData.deadline) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tags: taskData.tags || [],
      attachments: taskData.attachments || []
    };

    const docRef = await addDoc(collection(db, 'tasks'), newTask);
    return { success: true, taskId: docRef.id };
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
};

/**
 * Get task by ID
 */
export const getTaskById = async (taskId) => {
  try {
    const taskDoc = await getDoc(doc(db, 'tasks', taskId));
    if (taskDoc.exists()) {
      return { success: true, data: { id: taskDoc.id, ...taskDoc.data() } };
    } else {
      throw new Error('Task not found');
    }
  } catch (error) {
    console.error('Error fetching task:', error);
    throw new Error('Failed to fetch task');
  }
};

/**
 * Update task
 */
export const updateTask = async (taskId, updateData) => {
  try {
    const updateFields = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'tasks', taskId), updateFields);
    return { success: true };
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
};

/**
 * Delete task
 */
export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
};

/**
 * Get tasks created by a user
 */
export const getTasksByCreator = async (createdBy, statusFilter = null, limitCount = 50) => {
  try {
    let tasksQuery = query(
      collection(db, 'tasks'),
      where('createdBy', '==', createdBy),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Apply status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      tasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', createdBy),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(tasksQuery);
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching tasks by creator:', error);
    throw new Error('Failed to fetch tasks');
  }
};

/**
 * Get tasks assigned to a user
 */
export const getTasksByAssignee = async (assignedTo, statusFilter = null, limitCount = 50) => {
  try {
    let tasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', assignedTo),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Apply status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      tasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', assignedTo),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(tasksQuery);
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching tasks by assignee:', error);
    throw new Error('Failed to fetch tasks');
  }
};

/**
 * Get all tasks (for admin users)
 */
export const getAllTasks = async (statusFilter = null, limitCount = 100) => {
  try {
    let tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Apply status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', statusFilter),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(tasksQuery);
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
};

/**
 * Assign task to users
 */
export const assignTaskToUsers = async (taskId, userIds) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      assignedTo: arrayUnion(...userIds),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error assigning task:', error);
    throw new Error('Failed to assign task');
  }
};

/**
 * Unassign task from users
 */
export const unassignTaskFromUsers = async (taskId, userIds) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      assignedTo: arrayRemove(...userIds),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error unassigning task:', error);
    throw new Error('Failed to unassign task');
  }
};

/**
 * Update task status
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid task status');
    }

    await updateDoc(doc(db, 'tasks', taskId), {
      status,
      updatedAt: serverTimestamp(),
      completedAt: status === 'completed' ? serverTimestamp() : null
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating task status:', error);
    throw new Error('Failed to update task status');
  }
};

/**
 * Get task statistics for a user
 */
export const getTaskStats = async (userId) => {
  try {
    // Get tasks created by user
    const createdTasksQuery = query(
      collection(db, 'tasks'),
      where('createdBy', '==', userId)
    );
    const createdTasksSnapshot = await getDocs(createdTasksQuery);

    // Get tasks assigned to user
    const assignedTasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', userId)
    );
    const assignedTasksSnapshot = await getDocs(assignedTasksQuery);

    // Calculate statistics
    const createdTasks = Array.from(createdTasksSnapshot.docs).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const assignedTasks = Array.from(assignedTasksSnapshot.docs).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const stats = {
      tasksCreated: createdTasks.length,
      tasksAssigned: assignedTasks.length,
      pendingTasks: assignedTasks.filter(task => task.status === 'pending').length,
      inProgressTasks: assignedTasks.filter(task => task.status === 'in-progress').length,
      completedTasks: assignedTasks.filter(task => task.status === 'completed').length,
      overdueTasks: assignedTasks.filter(task => {
        return task.deadline && new Date(task.deadline.toDate()) < new Date() && task.status !== 'completed';
      }).length
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching task stats:', error);
    throw new Error('Failed to fetch task statistics');
  }
};

/**
 * Search tasks by title or description
 */
export const searchTasks = async (searchTerm, userId = null, limitCount = 20) => {
  try {
    let tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    // Filter by user if provided
    if (userId) {
      tasksQuery = query(
        collection(db, 'tasks'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(tasksQuery);
    const tasks = [];

    querySnapshot.forEach((doc) => {
      const taskData = { id: doc.id, ...doc.data() };

      // Simple client-side filtering (for production, use proper search service)
      if (
        taskData.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        taskData.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        tasks.push(taskData);
      }
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error searching tasks:', error);
    throw new Error('Failed to search tasks');
  }
};

/**
 * Get upcoming tasks (with deadlines)
 */
export const getUpcomingTasks = async (userId, daysAhead = 7) => {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', userId),
      where('deadline', '<=', futureDate),
      where('status', 'in', ['pending', 'in-progress']),
      orderBy('deadline', 'asc'),
      limit(10)
    );

    const querySnapshot = await getDocs(tasksQuery);
    const tasks = [];

    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    throw new Error('Failed to fetch upcoming tasks');
  }
};