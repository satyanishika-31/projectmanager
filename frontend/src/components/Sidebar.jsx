import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  KanbanSquare,
  CheckSquare,
  AlertCircle,
  Flag,
  RotateCcw,
  Activity,
  Users,
  Building2,
  Settings,
  X,
  Layers,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { activeProject } = useProject();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    ...(activeProject
      ? [
          {
            name: 'Kanban Board',
            path: `/projects/${activeProject._id}?tab=board`,
            icon: KanbanSquare,
          },
          {
            name: 'Backlog',
            path: `/projects/${activeProject._id}?tab=backlog`,
            icon: Layers,
          },
          {
            name: 'Sprints',
            path: `/projects/${activeProject._id}?tab=sprints`,
            icon: RotateCcw,
          },
          {
            name: 'Milestones',
            path: `/projects/${activeProject._id}?tab=milestones`,
            icon: Flag,
          },
        ]
      : []),
    { name: 'All Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Issues Tracker', path: '/issues', icon: AlertCircle },
    { name: 'Activity Feed', path: '/activity', icon: Activity },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Organizations', path: '/organizations', icon: Building2 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-950 text-slate-300 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#923b5b] to-[#b87591] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#923b5b]/30">
              P
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Project<span className="text-[#b87591]">Pulse</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Agile Suite
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Project Pill if selected */}
        {activeProject && (
          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Active Project
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                {activeProject.name}
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-[#923b5b]/30 text-rose-300 border border-[#923b5b]/50">
                {activeProject.status}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#923b5b] text-white shadow-sm shadow-[#923b5b]/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300">ProjectPulse Capstone</p>
          <p className="text-[10px] text-slate-400 mt-0.5">MERN Agile Suite v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
