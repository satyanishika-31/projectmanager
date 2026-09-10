import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';

const Tasks = () => {
  const { activeProject } = useProject();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const fetchTasks = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);

      const res = await api.get(`/tasks/project/${activeProject._id}?${params.toString()}`);
      if (res.data?.success) {
        setTasks(res.data.data.tasks);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeProject, page, status, priority, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTasks();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {total} tasks across {activeProject?.name || 'project'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateTask(true)}
          className="px-4 py-2 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] transition shadow-md shadow-[#923b5b]/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title & hit Enter..."
            className="w-full text-xs font-medium focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
          >
            <option value="">All Statuses</option>
            <option value="todo">TODO</option>
            <option value="in-progress">IN PROGRESS</option>
            <option value="review">REVIEW</option>
            <option value="done">DONE</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sorting */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="dueDate-asc">Due Date (Earliest)</option>
            <option value="storyPoints-desc">Story Points (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-3.5 pl-5">Task</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Points</th>
                <th className="p-3.5">Assignee</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5 text-right pr-5">Sprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => setSelectedTaskId(task._id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="p-3.5 pl-5 font-bold text-slate-900 max-w-xs truncate">
                      {task.title}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          task.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'review'
                            ? 'bg-blue-100 text-blue-800'
                            : task.status === 'in-progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600">
                      {task.storyPoints > 0 ? `${task.storyPoints}p` : '-'}
                    </td>
                    <td className="p-3.5">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center">
                            {task.assignedTo.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-[120px]">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3.5 text-right pr-5 text-slate-500 font-medium">
                      {task.sprint?.name || <span className="text-slate-400 italic">Backlog</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {page} of {totalPages} ({total} total tasks)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          projectId={activeProject._id}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={fetchTasks}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          projectId={activeProject._id}
          onClose={() => setShowCreateTask(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
};

export default Tasks;
