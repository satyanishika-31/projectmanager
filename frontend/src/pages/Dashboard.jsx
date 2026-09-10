import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Flag,
  Users,
  Calendar,
  ArrowRight,
  Plus,
  AlertTriangle,
  FolderKanban,
  Activity,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateIssueModal from '../components/CreateIssueModal';

const Dashboard = () => {
  const { user } = useAuth();
  const { activeProject, projects, setActiveProject } = useProject();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateIssue, setShowCreateIssue] = useState(false);

  const fetchDashboard = async () => {
    if (!activeProject) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/projects/${activeProject._id}/dashboard`);
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load project dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [activeProject]);

  if (!activeProject) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-xl mx-auto my-12">
        <FolderKanban className="w-12 h-12 text-[#923b5b] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Active Project Selected</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Select or create a project to view agile progress, sprint velocity, and team workload.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/projects"
            className="px-5 py-2.5 rounded-xl bg-[#923b5b] text-white text-xs font-bold hover:bg-[#652d59] transition shadow-md shadow-[#923b5b]/20"
          >
            Explore Projects
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white rounded-2xl border border-slate-200 col-span-2" />
          <div className="h-80 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    );
  }

  const {
    project,
    totalTasks = 0,
    completedTasks = 0,
    pendingTasks = 0,
    inProgressTasks = 0,
    reviewTasks = 0,
    totalIssues = 0,
    openIssues = 0,
    resolvedIssues = 0,
    projectProgress = 0,
    upcomingMilestones = [],
    currentSprint,
    teamWorkload = [],
    recentActivity = [],
    overdueTasks = [],
  } = dashboardData || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {project?.name || activeProject.name}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#923b5b]/10 text-[#923b5b] border border-[#923b5b]/20">
              {project?.status || activeProject.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl line-clamp-1">
            {project?.description || 'Track deliverables, sprint goals, and team members.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateTask(true)}
            className="px-4 py-2 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] transition shadow-md shadow-[#923b5b]/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
          <button
            onClick={() => setShowCreateIssue(true)}
            className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-100 transition flex items-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Report Issue
          </button>
          <Link
            to={`/projects/${activeProject._id}?tab=board`}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            Kanban Board
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Overdue Tasks Alert Banner if any exist */}
      {overdueTasks.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                {overdueTasks.length} Overdue {overdueTasks.length === 1 ? 'Task Requires' : 'Tasks Require'} Attention
              </h4>
              <p className="text-[11px] text-rose-700">
                {overdueTasks.map((t) => t.title).slice(0, 2).join(' â€¢ ')}
                {overdueTasks.length > 2 && ` and ${overdueTasks.length - 2} more`}
              </p>
            </div>
          </div>
          <Link
            to={`/tasks?status=todo,in-progress,review`}
            className="text-xs font-bold text-rose-800 hover:underline whitespace-nowrap"
          >
            Review Overdue â†’
          </Link>
        </div>
      )}

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Project Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{projectProgress}%</span>
            <span className="text-xs text-slate-400 font-medium">completed</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${projectProgress}%` }}
            />
          </div>
        </div>

        {/* Task Statistics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalTasks}</span>
            <span className="text-xs text-slate-400 font-medium">tasks tracked</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px] font-semibold text-slate-500">
            <span className="text-emerald-600">{completedTasks} Done</span>
            <span>â€¢</span>
            <span className="text-amber-600">{inProgressTasks} In Progress</span>
            <span>â€¢</span>
            <span className="text-slate-500">{pendingTasks} Todo</span>
          </div>
        </div>

        {/* Issue Statistics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Issue Health
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{openIssues}</span>
            <span className="text-xs text-slate-400 font-medium">open issues</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px] font-semibold text-slate-500">
            <span className="text-emerald-600">{resolvedIssues} Resolved</span>
            <span>â€¢</span>
            <span className="text-slate-400">{totalIssues} Total</span>
          </div>
        </div>

        {/* Active Sprint KPI */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Sprint
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          {currentSprint ? (
            <div>
              <p className="text-sm font-bold text-slate-800 truncate" title={currentSprint.name}>
                {currentSprint.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {currentSprint.goal || 'Sprint underway'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-400 italic">No Active Sprint</p>
              <Link
                to={`/projects/${activeProject._id}?tab=sprints`}
                className="text-[11px] font-bold text-[#923b5b] hover:underline block mt-1"
              >
                + Plan or Start Sprint
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Workload & Sprints vs Activity & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Team Workload & Sprint Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Workload */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#923b5b]" />
                <h3 className="text-sm font-bold text-slate-900">Team Workload Distribution</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {teamWorkload.length} Team Members
              </span>
            </div>

            {teamWorkload.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No members assigned to this project</p>
            ) : (
              <div className="space-y-4">
                {teamWorkload.map((m) => {
                  const percent =
                    totalTasks > 0 ? Math.round((m.totalAssigned / totalTasks) * 100) : 0;
                  return (
                    <div key={m.user?._id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                            {m.user?.avatar ? (
                              <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                            ) : (
                              m.user?.name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{m.user?.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2 uppercase font-semibold">
                              {m.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-600">
                          <span className="text-amber-600 font-bold">{m.activeTasks} active</span> / {m.totalAssigned} total
                        </div>
                      </div>

                      {/* Workload Progress */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#923b5b] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, percent * 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Milestones */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#923b5b]" />
                <h3 className="text-sm font-bold text-slate-900">Approaching Milestones</h3>
              </div>
              <Link
                to={`/projects/${activeProject._id}?tab=milestones`}
                className="text-xs font-semibold text-[#923b5b] hover:underline"
              >
                View all â†’
              </Link>
            </div>

            {upcomingMilestones.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No upcoming milestones planned</p>
            ) : (
              <div className="space-y-3">
                {upcomingMilestones.map((ms) => (
                  <div
                    key={ms._id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-[#923b5b]/30 transition"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{ms.name}</h5>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{ms.description || 'No description'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ms.status === 'in-progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ms.status}
                      </span>
                      {ms.dueDate && (
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(ms.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Recent Project Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#923b5b]" />
                <h3 className="text-sm font-bold text-slate-900">Recent Project Activity</h3>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recorded activity yet</p>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {recentActivity.map((act) => (
                  <div key={act._id} className="text-xs flex items-start gap-2.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {act.user?.avatar ? (
                        <img src={act.user.avatar} alt={act.user.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        act.user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-medium leading-snug break-words">
                        {act.action}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Task and Issue Modals */}
      {showCreateTask && (
        <CreateTaskModal
          projectId={activeProject._id}
          onClose={() => setShowCreateTask(false)}
          onCreated={fetchDashboard}
        />
      )}

      {showCreateIssue && (
        <CreateIssueModal
          projectId={activeProject._id}
          onClose={() => setShowCreateIssue(false)}
          onCreated={fetchDashboard}
        />
      )}
    </div>
  );
};

export default Dashboard;
