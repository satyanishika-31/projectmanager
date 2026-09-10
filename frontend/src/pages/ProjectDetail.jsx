import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  Layers,
  RotateCcw,
  Flag,
  AlertCircle,
  Users,
  Activity,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  UserPlus,
  Play,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import IssueModal from '../components/IssueModal';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateIssueModal from '../components/CreateIssueModal';
import { CreateSprintModal, CreateMilestoneModal } from '../components/PlanningModals';

const TABS = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard },
  { id: 'board', name: 'Board', icon: KanbanSquare },
  { id: 'backlog', name: 'Backlog', icon: Layers },
  { id: 'sprints', name: 'Sprints', icon: RotateCcw },
  { id: 'milestones', name: 'Milestones', icon: Flag },
  { id: 'issues', name: 'Issues', icon: AlertCircle },
  { id: 'members', name: 'Members', icon: Users },
  { id: 'activity', name: 'Activity', icon: Activity },
];

const ProjectDetail = () => {
  const { id: projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { user } = useAuth();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState('todo');
  const [createTaskSprint, setCreateTaskSprint] = useState(null);
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Add member form state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('developer');

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [projRes, tasksRes, issuesRes, sprintsRes, milestonesRes, membersRes, actRes] =
        await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/tasks/project/${projectId}?all=true`),
          api.get(`/issues/project/${projectId}`),
          api.get(`/sprints/project/${projectId}`),
          api.get(`/milestones/project/${projectId}`),
          api.get(`/projects/${projectId}/members`),
          api.get(`/activity/project/${projectId}`),
        ]);

      if (projRes.data?.success) setProject(projRes.data.data);
      if (tasksRes.data?.success) setTasks(tasksRes.data.data?.tasks || []);
      if (issuesRes.data?.success) setIssues(issuesRes.data.data?.issues || []);
      if (sprintsRes.data?.success) setSprints(sprintsRes.data.data || []);
      if (milestonesRes.data?.success) setMilestones(milestonesRes.data.data || []);
      if (membersRes.data?.success) setMembers(membersRes.data.data || []);
      if (actRes.data?.success) setActivities(actRes.data.data || []);
    } catch (error) {
      console.error('Failed to load project details:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleTaskStatusChanged = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleStartSprint = async (sprintId) => {
    try {
      await api.put(`/sprints/${sprintId}/start`);
      toast.success('Sprint started!');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to start sprint');
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    try {
      await api.put(`/sprints/${sprintId}/complete`);
      toast.success('Sprint marked as completed!');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to complete sprint');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    try {
      const res = await api.post(`/projects/${projectId}/members`, {
        email: newMemberEmail.trim(),
        role: newMemberRole,
      });
      if (res.data?.success) {
        toast.success('Member added to project');
        setNewMemberEmail('');
        setShowAddMember(false);
        fetchProjectData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateMemberRole = async (userId, role) => {
    try {
      await api.put(`/projects/${projectId}/members/${userId}`, { role });
      toast.success('Role updated');
      fetchProjectData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from project?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      toast.success('Member removed');
      fetchProjectData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-white rounded-2xl border border-slate-200" />
        <div className="h-12 bg-white rounded-2xl border border-slate-200" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Project not found or access denied.</p>
      </div>
    );
  }

  const isManagerOrLead = ['manager', 'lead'].includes(project.currentUserRole);

  // Filter tasks for Board & Backlog
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = searchQuery
      ? t.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Project Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#923b5b]/10 text-[#923b5b] border border-[#923b5b]/20">
              {project.status}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              Role: {project.currentUserRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">{project.description}</p>
        </div>

        {/* Global project actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCreateTaskStatus('todo');
              setCreateTaskSprint(null);
              setShowCreateTask(true);
            }}
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
        </div>
      </div>

      {/* 8-Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-0.5 scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#923b5b] text-[#923b5b] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {tab.id === 'board' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {tasks.length}
                </span>
              )}
              {tab.id === 'issues' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
                  {issues.filter((i) => i.status === 'open' || i.status === 'in-progress').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Project Health & Progress</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">{project.progress}%</span>
                <span className="text-xs text-slate-500 font-medium">overall completion</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Tasks</span>
                  <p className="text-lg font-extrabold text-slate-800">{tasks.length}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Completed</span>
                  <p className="text-lg font-extrabold text-emerald-600">
                    {tasks.filter((t) => t.status === 'done').length}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Open Issues</span>
                  <p className="text-lg font-extrabold text-rose-600">
                    {issues.filter((i) => i.status === 'open' || i.status === 'in-progress').length}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Sprints</span>
                  <p className="text-lg font-extrabold text-purple-600">{sprints.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Project Manager & Dates</h3>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
                  {project.manager?.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{project.manager?.name}</p>
                  <p className="text-[11px] text-slate-400">{project.manager?.email}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Start Date:</span>
                  <span className="font-semibold">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target End:</span>
                  <span className="font-semibold">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KANBAN BOARD */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title..."
                className="w-full text-xs font-medium focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={(t) => setSelectedTaskId(t._id)}
            onTaskStatusChanged={handleTaskStatusChanged}
            onAddTask={(columnStatus) => {
              setCreateTaskStatus(columnStatus);
              setCreateTaskSprint(null);
              setShowCreateTask(true);
            }}
            isManagerOrLead={isManagerOrLead}
          />
        </div>
      )}

      {/* TAB 3: BACKLOG */}
      {activeTab === 'backlog' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sprint Backlog & Unassigned Tasks</h3>
                <p className="text-xs text-slate-500">
                  Tasks waiting for allocation to upcoming sprint iterations.
                </p>
              </div>
              <button
                onClick={() => {
                  setCreateTaskSprint(null);
                  setShowCreateTask(true);
                }}
                className="px-3.5 py-1.5 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Backlog
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {tasks.filter((t) => !t.sprint).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No unassigned backlog tasks. All tasks are currently scheduled into sprints!
                </div>
              ) : (
                tasks
                  .filter((t) => !t.sprint)
                  .map((task) => (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTaskId(task._id)}
                      className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">{task.title}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {task.storyPoints > 0 && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {task.storyPoints} pts
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#923b5b] hover:underline">
                          Configure â†’
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SPRINTS */}
      {activeTab === 'sprints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Sprint Iterations</h3>
            <button
              onClick={() => setShowCreateSprint(true)}
              className="px-3.5 py-1.5 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Sprint
            </button>
          </div>

          <div className="space-y-4">
            {sprints.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-xs text-slate-400">
                No sprints created yet. Start planning your first sprint cycle!
              </div>
            ) : (
              sprints.map((sprint) => (
                <div
                  key={sprint._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-sm font-bold text-slate-900">{sprint.name}</h4>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          sprint.status === 'active'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : sprint.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sprint.status}
                      </span>
                    </div>

                    {/* Sprint action buttons */}
                    <div className="flex items-center gap-2">
                      {sprint.status === 'planned' && (
                        <button
                          onClick={() => handleStartSprint(sprint._id)}
                          className="px-3 py-1 bg-purple-700 text-white rounded-lg text-xs font-semibold hover:bg-purple-800 flex items-center gap-1 transition"
                        >
                          <Play className="w-3 h-3" />
                          Start Sprint
                        </button>
                      )}
                      {sprint.status === 'active' && (
                        <button
                          onClick={() => handleCompleteSprint(sprint._id)}
                          className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" />
                          Complete Sprint
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">{sprint.goal || 'No sprint goal specified.'}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      <strong>{sprint.totalTasks || 0}</strong> tasks
                    </span>
                    <span>â€¢</span>
                    <span>
                      <strong>{sprint.completedTasks || 0}</strong> done
                    </span>
                    <span>â€¢</span>
                    <span>
                      <strong>{sprint.totalPoints || 0}</strong> total story points
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Project Milestones</h3>
            <button
              onClick={() => setShowCreateMilestone(true)}
              className="px-3.5 py-1.5 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Milestone
            </button>
          </div>

          <div className="space-y-3">
            {milestones.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-xs text-slate-400">
                No milestones defined for this project.
              </div>
            ) : (
              milestones.map((ms) => (
                <div
                  key={ms._id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800">{ms.name}</h4>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ms.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ms.status === 'in-progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ms.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{ms.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {ms.dueDate && (
                      <span className="text-xs text-slate-500 block">
                        Due: {new Date(ms.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: ISSUES */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Issue Tracker</h3>
            <button
              onClick={() => setShowCreateIssue(true)}
              className="px-3.5 py-1.5 bg-rose-700 text-white rounded-xl text-xs font-semibold hover:bg-rose-800 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Report Issue
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {issues.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No issues reported for this project. Great job!
                </div>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue._id}
                    onClick={() => setSelectedIssueId(issue._id)}
                    className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          issue.severity === 'critical'
                            ? 'bg-rose-100 text-rose-700'
                            : issue.severity === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{issue.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          Reported by {issue.reportedBy?.name || 'User'} on{' '}
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          issue.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : issue.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {issue.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 hover:text-slate-800">
                        View Details â†’
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Project Members & Access Roles</h3>
            {isManagerOrLead && (
              <button
                onClick={() => setShowAddMember(true)}
                className="px-3.5 py-1.5 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Member
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {members.map((m) => (
                <div key={m._id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                      {m.user?.avatar ? (
                        <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                      ) : (
                        m.user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{m.user?.name}</h4>
                      <p className="text-[11px] text-slate-400">{m.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isManagerOrLead && m.user?._id !== project.manager?._id ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleUpdateMemberRole(m.user._id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50"
                      >
                        <option value="manager">Manager</option>
                        <option value="lead">Lead</option>
                        <option value="developer">Developer</option>
                        <option value="stakeholder">Stakeholder</option>
                      </select>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
                        {m.role}
                      </span>
                    )}

                    {isManagerOrLead && m.user?._id !== project.manager?._id && (
                      <button
                        onClick={() => handleRemoveMember(m.user._id)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Project Audit & Activity Log</h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No activities recorded yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="text-xs flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {act.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium">{act.action}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          projectId={projectId}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={fetchProjectData}
        />
      )}

      {selectedIssueId && (
        <IssueModal
          issueId={selectedIssueId}
          projectId={projectId}
          onClose={() => setSelectedIssueId(null)}
          onUpdated={fetchProjectData}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          projectId={projectId}
          defaultStatus={createTaskStatus}
          defaultSprint={createTaskSprint}
          onClose={() => setShowCreateTask(false)}
          onCreated={fetchProjectData}
        />
      )}

      {showCreateIssue && (
        <CreateIssueModal
          projectId={projectId}
          onClose={() => setShowCreateIssue(false)}
          onCreated={fetchProjectData}
        />
      )}

      {showCreateSprint && (
        <CreateSprintModal
          projectId={projectId}
          onClose={() => setShowCreateSprint(false)}
          onCreated={fetchProjectData}
        />
      )}

      {showCreateMilestone && (
        <CreateMilestoneModal
          projectId={projectId}
          onClose={() => setShowCreateMilestone(false)}
          onCreated={fetchProjectData}
        />
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 w-full max-w-md space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-800">Add Project Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">User Email *</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="developer">Developer</option>
                  <option value="lead">Team Lead</option>
                  <option value="manager">Project Manager</option>
                  <option value="stakeholder">Stakeholder</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59]"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
