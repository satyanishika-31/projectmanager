import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Shield,
  Search,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import CreateProjectModal from '../components/CreateProjectModal';

const Projects = () => {
  const { projects, activeOrg, fetchProjects } = useProject();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active workspaces under{' '}
            <span className="font-semibold text-slate-700">{activeOrg?.name || 'Organization'}</span>
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] transition shadow-md shadow-[#923b5b]/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full text-xs font-medium focus:outline-none"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50"
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-400">
            No projects found matching criteria.
          </div>
        ) : (
          filteredProjects.map((p) => (
            <Link
              key={p._id}
              to={`/projects/${p._id}`}
              className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#923b5b]/40 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      p.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'planning'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Role: {p.currentUserRole || 'member'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#923b5b] transition-colors line-clamp-1 mb-1.5">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    <strong>{p.totalTasks || 0}</strong> tasks
                  </span>
                  <span className="text-[#923b5b] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Open Project <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchProjects(activeOrg?._id)}
        />
      )}
    </div>
  );
};

export default Projects;
