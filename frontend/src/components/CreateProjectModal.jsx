import React, { useState } from 'react';
import { X, FolderKanban } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useProject } from '../context/ProjectContext';

const CreateProjectModal = ({ onClose, onCreated }) => {
  const toast = useToast();
  const { activeOrg, fetchProjects } = useProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const organizationId = activeOrg?._id || activeOrg?.id;

    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!organizationId) {
      toast.error('Please select an organization before creating a project');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/projects', {
        name: name.trim(),
        description: description.trim(),
        organization: organizationId,
        status,
        startDate: startDate || null,
        endDate: endDate || null,
      });

      if (res.data?.success) {
        toast.success('Project created successfully');
        await fetchProjects(organizationId);
        if (onCreated) onCreated(res.data.data);
        onClose();
      } else {
        toast.error(res.data?.message || 'Failed to create project');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#923b5b]" />
            <h3 className="text-sm font-bold text-slate-800">Create New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile Redesign & Launch"
              required
              autoFocus
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#923b5b]/20 focus:border-[#923b5b]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary goals and scope of this project..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#923b5b]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#923b5b] text-white hover:bg-[#652d59] disabled:opacity-50 transition shadow-md shadow-[#923b5b]/20"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
