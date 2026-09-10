import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Search,
  Plus,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import IssueModal from '../components/IssueModal';
import CreateIssueModal from '../components/CreateIssueModal';

const Issues = () => {
  const { activeProject } = useProject();
  const toast = useToast();

  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [showCreateIssue, setShowCreateIssue] = useState(false);

  const fetchIssues = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
      });

      if (search) params.append('search', search);
      if (severity) params.append('severity', severity);
      if (status) params.append('status', status);

      const res = await api.get(`/issues/project/${activeProject._id}?${params.toString()}`);
      if (res.data?.success) {
        setIssues(res.data.data.issues);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [activeProject, page, severity, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchIssues();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Issue Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {total} issues across {activeProject?.name || 'project'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateIssue(true)}
          className="px-4 py-2 bg-rose-700 text-white rounded-xl text-xs font-semibold hover:bg-rose-800 transition shadow-md shadow-rose-700/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Report Issue
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
            placeholder="Search issues & hit Enter..."
            className="w-full text-xs font-medium focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

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
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-3.5 pl-5">Issue</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Reported By</th>
                <th className="p-3.5">Assignee</th>
                <th className="p-3.5 text-right pr-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading issues...
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No issues found matching your filters.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr
                    key={issue._id}
                    onClick={() => setSelectedIssueId(issue._id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="p-3.5 pl-5 font-bold text-slate-900 max-w-xs truncate">
                      {issue.title}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          issue.severity === 'critical'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : issue.severity === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="p-3.5">
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
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {issue.reportedBy?.name || 'User'}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {issue.assignedTo?.name ? (
                        <span className="font-semibold text-slate-800">{issue.assignedTo.name}</span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right pr-5 text-slate-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
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
            Page {page} of {totalPages} ({total} total issues)
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

      {selectedIssueId && (
        <IssueModal
          issueId={selectedIssueId}
          projectId={activeProject._id}
          onClose={() => setSelectedIssueId(null)}
          onUpdated={fetchIssues}
        />
      )}

      {showCreateIssue && (
        <CreateIssueModal
          projectId={activeProject._id}
          onClose={() => setShowCreateIssue(false)}
          onCreated={fetchIssues}
        />
      )}
    </div>
  );
};

export default Issues;
