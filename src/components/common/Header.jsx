import React from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import HighlightText from './HighlightText';
import {
  Bell, Search, Menu, X, Building2, TrendingUp, CheckCircle2, Clock, Moon, Sun,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import profileImage from '../../assets/rajkumarprofile.avif';

// NotificationItem Component
const NotificationItem = ({ title, message, time, type, status, searchQuery }) => {
  const typeIcons = {
    new_company: <Building2 className="w-5 h-5" />,
    high_applications: <TrendingUp className="w-5 h-5" />,
    result_update: <CheckCircle2 className="w-5 h-5" />,
    general: <Bell className="w-5 h-5" />
  };

  const typeColors = {
    new_company: 'text-blue-600 bg-blue-50',
    high_applications: 'text-orange-600 bg-orange-50',
    result_update: 'text-green-600 bg-green-50',
    general: 'text-gray-600 bg-gray-50'
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex items-start gap-3 p-4 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${status === 'unread' ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
      <div className={`p-2 rounded-lg shrink-0 ${typeColors[type] || typeColors.general}`}>
        {typeIcons[type] || typeIcons.general}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 dark:text-white text-sm font-bold truncate">
          <HighlightText text={title || 'Notification'} highlight={searchQuery} />
        </p>
        <p className="text-gray-600 dark:text-slate-400 text-xs mt-0.5 leading-relaxed">
          <HighlightText text={message} highlight={searchQuery} />
        </p>
        <p className="text-gray-400 text-[10px] mt-2 font-medium uppercase tracking-wider">{formatTime(time)}</p>
      </div>
    </div>
  );
};

export default function Header({
  title = "Dashboard",
  subtitle,
  studentData = { name: "User" },
  studentName, // Support direct name prop from other pages
  role = "Student",
  onMenuClick,
  onSearch,
  showSearch = true,
  showUserInfo = true,
  children
}) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id;

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [localSearch, setLocalSearch] = React.useState('');
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = React.useState(0);

  // Determine user display info
  const displayUser = {
    name: studentName || studentData?.name || user.name || (role === 'Admin' ? 'Administrator' : 'Student User'),
    role: role
  };

  React.useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: { 'x-user-id': userId }
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    const fetchUnreadMessages = async () => {
      try {
        const isUserAdmin = role?.toLowerCase() === 'admin';
        const messageId = isUserAdmin ? 'placement-cell' : user.registerNumber;
        if (!messageId) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/unread-count/${messageId}`);
        setUnreadMessageCount(res.data.count);
      } catch (err) {
        console.error('Error fetching unread messages:', err);
      }
    };

    fetchNotifications();
    fetchUnreadMessages();

    const socket = io(`${import.meta.env.VITE_API_URL}`);
    
    // Join both internal ID room and Register Number room
    socket.emit('join_personal', userId);
    if (role?.toLowerCase() === 'admin') {
      socket.emit('join_personal', 'placement-cell');
    } else if (user.registerNumber) {
      socket.emit('join_personal', user.registerNumber);
    }

    socket.on('receive_notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    socket.on('receive_message', (newMessage) => {
      // If we are not on the messages page, increment count
      if (!window.location.pathname.includes('/messages')) {
        setUnreadMessageCount(prev => prev + 1);
      }
    });

    return () => socket.disconnect();
  }, [userId, role, user.registerNumber]);

  const markAllRead = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {}, {
        headers: { 'x-user-id': userId }
      });
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/notifications/clear`, {
        headers: { 'x-user-id': userId }
      });
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <header className="bg-white dark:bg-[#020617] border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 w-full">
      <div className="px-4 py-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Title Section */}
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-[#E2E8F0]">{title}</h1>
              {subtitle ? (
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{subtitle}</p>
              ) : (
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Welcome back, {displayUser.name?.split(' ')[0]}!</p>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-4 self-end md:self-auto">
            {/* Search */}
            {showSearch && (
              <div className="relative hidden md:block">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    onSearch && onSearch(e.target.value);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64 transition-colors placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
            )}

            {/* Custom Controls (e.g., Batch Selector) */}
            {children}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-slate-400"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>


            {/* Notifications */}
            <div className="relative">
              <button
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-6 h-6 text-gray-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Drawer Backdrop */}
              {showNotifications && (
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  onClick={() => setShowNotifications(false)}
                />
              )}

              {/* Notification Drawer */}
              <div className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-white dark:bg-[#020617] shadow-2xl dark:shadow-black/50 transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-tight">
                    {unreadCount} Unread Alerts
                  </span>
                  <div className="flex gap-3">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors"
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                    <button
                      className="text-xs text-red-500 hover:text-red-600 font-bold transition-colors border-l border-gray-200 dark:border-slate-700 pl-3"
                      onClick={clearAll}
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <NotificationItem
                        key={notification._id || index}
                        title={notification.title}
                        message={notification.message}
                        time={notification.createdAt}
                        type={notification.type}
                        status={notification.status}
                        searchQuery={localSearch}
                      />
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">No new notifications</p>
                      <p className="text-sm text-gray-500 mt-1">We'll notify you when something important happens.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate(role === 'Admin' ? '/admin/profile' : '/profile')}
            >
              <div className="w-10 h-10 rounded-full mb-1 group-hover:scale-105 transition-all outline outline-offset-2 outline-blue-500 overflow-hidden shadow-sm">
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              </div>
              {showUserInfo && (
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">{displayUser.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{role}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search - Visible only on mobile */}
        {showSearch && (
          <div className="mt-4 md:hidden relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => {
                setLocalSearch(e.target.value);
                onSearch && onSearch(e.target.value);
              }}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        )}
      </div>
    </header>
  )
}
