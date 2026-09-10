import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  FolderKanban,
  Building2,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { organizations, activeOrg, setActiveOrg, projects, activeProject, setActiveProject } = useProject();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'issue':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowOrgMenu(!showOrgMenu);
              setShowProjectMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="max-w-[120px] sm:max-w-[160px] truncate">
              {activeOrg ? activeOrg.name : 'Select Org'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showOrgMenu && (
            <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Organizations
              </div>
              {organizations.map((org) => (
                <button
                  key={org._id}
                  onClick={() => {
                    setActiveOrg(org);
                    setShowOrgMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    activeOrg?._id === org._id ? 'font-semibold text-[#923b5b] bg-rose-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  {activeOrg?._id === org._id && <div className="w-1.5 h-1.5 rounded-full bg-[#923b5b]" />}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <Link
                  to="/organizations"
                  onClick={() => setShowOrgMenu(false)}
                  className="block px-3 py-2 text-xs text-slate-600 hover:text-[#923b5b] font-medium"
                >
                  + Manage Organizations
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Project Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProjectMenu(!showProjectMenu);
              setShowOrgMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#923b5b]" />
            <span className="max-w-[120px] sm:max-w-[180px] truncate">
              {activeProject ? activeProject.name : 'Select Project'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showProjectMenu && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Projects
              </div>
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400 italic">No projects found</div>
              ) : (
                projects.map((proj) => (
                  <button
                    key={proj._id}
                    onClick={() => {
                      setActiveProject(proj);
                      setShowProjectMenu(false);
                      navigate(`/projects/${proj._id}`);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      activeProject?._id === proj._id ? 'font-semibold text-[#923b5b] bg-rose-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                      {proj.status}
                    </span>
                  </button>
                ))
              )}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <Link
                  to="/projects"
                  onClick={() => setShowProjectMenu(false)}
                  className="block px-3 py-2 text-xs text-slate-600 hover:text-[#923b5b] font-medium"
                >
                  + View All Projects
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#923b5b] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-[#923b5b] rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-slate-500 hover:text-[#923b5b] flex items-center gap-1 font-medium transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    You have no notifications right now.
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={`p-3 text-xs flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition ${
                        !n.isRead ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-slate-800 leading-snug ${!n.isRead ? 'font-medium' : ''}`}>
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()} at{' '}
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#923b5b] mt-1 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs font-semibold text-[#923b5b] hover:underline"
                >
                  View All Notifications â†’
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-slate-200">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <span className="text-xs font-medium text-slate-800 hidden md:block max-w-[100px] truncate">
              {user?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile Details
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings & Password
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
