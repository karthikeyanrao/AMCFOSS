// Dashboard Modal Component for AMC FOSS Club
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUser,
  faTasks,
  faCalendarAlt,
  faChartBar,
  faPlus,
  faEdit,
  faTrash,
  faClock,
  faUsers,
  faGraduationCap,
  faDashboard,
  faSignOutAlt,
  faCog,
  faChevronLeft,
  faChevronRight,
  faSearch,
  faFilter,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import { getTaskStats, getTasksByCreator, getTasksByAssignee } from '../services/taskService';
import { getEventStats, getEventsByCreator, getUpcomingEvents } from '../services/eventService';
import { getUserStats } from '../services/userService';

const DashboardModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [taskStats, setTaskStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const { user, userProfile, logout, isMentor, isOfficeBearer } = useAuth();

  // Dashboard navigation items based on role
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: faDashboard, role: 'all' },
    { id: 'profile', label: 'Profile', icon: faUser, role: 'all' },
    { id: 'tasks', label: 'Tasks', icon: faTasks, role: 'all' },
    { id: 'events', label: 'Events', icon: faCalendarAlt, role: 'officeBearer' },
    { id: 'analytics', label: 'Analytics', icon: faChartBar, role: 'all' },
  ];

  // Filter navigation items based on user role
  const availableNavItems = navigationItems.filter(item =>
    item.role === 'all' ||
    (item.role === 'officeBearer' && isOfficeBearer()) ||
    (item.role === 'mentor' && isMentor())
  );

  // Load dashboard data
  useEffect(() => {
    if (isOpen && user) {
      loadDashboardData();
    }
  }, [isOpen, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load task statistics
      const taskStatsResult = await getTaskStats(user.uid);
      setTaskStats(taskStatsResult.data);

      // Load user statistics
      const userStatsResult = await getUserStats(user.uid);
      setUserStats(userStatsResult.data);

      // Load tasks created by user
      const createdTasksResult = await getTasksByCreator(user.uid, 'pending', 10);
      setCreatedTasks(createdTasksResult.data);

      // Load tasks assigned to user
      const assignedTasksResult = await getTasksByAssignee(user.uid, 'pending', 10);
      setAssignedTasks(assignedTasksResult.data);

      // If user is office bearer, load event data
      if (isOfficeBearer()) {
        const eventStatsResult = await getEventStats();
        setEventStats(eventStatsResult.data);

        const createdEventsResult = await getEventsByCreator(user.uid, 'upcoming', 5);
        setCreatedEvents(createdEventsResult.data);

        const upcomingEventsResult = await getUpcomingEvents(5);
        setUpcomingEvents(upcomingEventsResult.data);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation
  const handleNavigation = (tabId) => {
    setActiveTab(tabId);
  };

  // Render overview content
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{taskStats?.tasksCreated || 0}</p>
            </div>
            <FontAwesomeIcon icon={faTasks} className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Assigned Tasks</p>
              <p className="text-2xl font-bold text-white">{taskStats?.tasksAssigned || 0}</p>
            </div>
            <FontAwesomeIcon icon={faClock} className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Completed Tasks</p>
              <p className="text-2xl font-bold text-white">{taskStats?.completedTasks || 0}</p>
            </div>
            <FontAwesomeIcon icon={faChartBar} className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {isOfficeBearer() && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Events Created</p>
                <p className="text-2xl font-bold text-white">{userStats?.eventsCreated || 0}</p>
              </div>
              <FontAwesomeIcon icon={faCalendarAlt} className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {createdTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{task.title}</p>
                  <p className="text-white/60 text-sm">{task.status}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                  task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
            {createdTasks.length === 0 && (
              <p className="text-white/60 text-center py-4">No tasks created yet</p>
            )}
          </div>
        </div>

        {isOfficeBearer() && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {createdEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{event.title}</p>
                    <p className="text-white/60 text-sm">
                      {event.date?.toDate()?.toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
                    {event.currentRegistrations}/{event.maxParticipants}
                  </span>
                </div>
              ))}
              {createdEvents.length === 0 && (
                <p className="text-white/60 text-center py-4">No events created yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render profile content
  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>

        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {userProfile?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white">{userProfile?.displayName || 'User'}</h4>
            <p className="text-white/60">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                isMentor()
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                <FontAwesomeIcon
                  icon={isMentor() ? faGraduationCap : faUsers}
                  className="w-3 h-3 mr-1"
                />
                {isMentor() ? 'Mentor' : 'Office Bearer'}
              </span>
              <span className="px-3 py-1 text-sm bg-white/10 text-white/70 rounded-full">
                {userProfile?.department} • {userProfile?.year}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-sm">Member Since</label>
              <p className="text-white">{userStats?.joinDate || 'N/A'}</p>
            </div>
            <div>
              <label className="text-white/60 text-sm">Last Login</label>
              <p className="text-white">{userStats?.lastLogin || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-white/60 text-sm">Department</label>
              <p className="text-white">{userProfile?.department || 'N/A'}</p>
            </div>
            <div>
              <label className="text-white/60 text-sm">Year</label>
              <p className="text-white">{userProfile?.year || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render tasks content
  const renderTasks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Task Management</h3>
        <button
          onClick={() => setIsCreatingTask(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
          Create Task
        </button>
      </div>

      {/* Task Filters */}
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
          All Tasks
        </button>
        <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
          Pending
        </button>
        <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
          In Progress
        </button>
        <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
          Completed
        </button>
      </div>

      {/* Tasks List */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="space-y-4">
          {createdTasks.map((task) => (
            <div key={task.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{task.title}</h4>
                  <p className="text-white/60 text-sm mt-1">{task.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {task.status}
                    </span>
                    {task.deadline && (
                      <span className="text-white/60 text-sm">
                        <FontAwesomeIcon icon={faClock} className="w-3 h-3 mr-1" />
                        {new Date(task.deadline.toDate()).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-white/60 hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-red-400 transition-colors">
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {createdTasks.length === 0 && (
            <p className="text-white/60 text-center py-8">No tasks created yet</p>
          )}
        </div>
      </div>
    </div>
  );

  // Render events content (Office Bearer only)
  const renderEvents = () => {
    if (!isOfficeBearer()) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">Event management is available for Office Bearers only</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Event Management</h3>
          <button
            onClick={() => setIsCreatingEvent(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
            Create Event
          </button>
        </div>

        {/* Events List */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <div className="space-y-4">
            {createdEvents.map((event) => (
              <div key={event.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{event.title}</h4>
                    <p className="text-white/60 text-sm mt-1">{event.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        event.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        event.status === 'ongoing' ? 'bg-blue-500/20 text-blue-300' :
                        event.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {event.status}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
                        {event.eventType}
                      </span>
                      <span className="text-white/60 text-sm">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 mr-1" />
                        {event.date?.toDate()?.toLocaleDateString()}
                      </span>
                      <span className="text-white/60 text-sm">
                        <FontAwesomeIcon icon={faUsers} className="w-3 h-3 mr-1" />
                        {event.currentRegistrations}/{event.maxParticipants}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-white/60 hover:text-white transition-colors">
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-white/60 hover:text-red-400 transition-colors">
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {createdEvents.length === 0 && (
              <p className="text-white/60 text-center py-8">No events created yet</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render analytics content
  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Analytics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Task Performance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Completion Rate</span>
              <span className="text-white font-medium">
                {taskStats?.tasksAssigned > 0
                  ? Math.round((taskStats?.completedTasks / taskStats?.tasksAssigned) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Overdue Tasks</span>
              <span className="text-white font-medium">{taskStats?.overdueTasks || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">In Progress</span>
              <span className="text-white font-medium">{taskStats?.inProgressTasks || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Activity Summary</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Tasks Created</span>
              <span className="text-white font-medium">{taskStats?.tasksCreated || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Events Created</span>
              <span className="text-white font-medium">{userStats?.eventsCreated || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Member Since</span>
              <span className="text-white font-medium">{userStats?.joinDate || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return renderProfile();
      case 'tasks':
        return renderTasks();
      case 'events':
        return renderEvents();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
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
          className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {userProfile?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                  <p className="text-white/60">
                    {isMentor() ? 'Mentor' : 'Office Bearer'} • {userProfile?.displayName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 border-b border-white/10">
            <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
              {availableNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DashboardModal;