import React, { useState } from 'react';
import { CalendarDays, Pencil, X } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const toDateInputValue = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const EditProjectModal = ({ project, onClose, onUpdated }) => {
  const toast = useToast();
  const [name, setName] = useState(project.name || '');
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status || 'planning');
  const [startDate, setStartDate] = useState(toDateInputValue(project.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(project.endDate));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error('Deadline cannot be before the start date');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.put(`/projects/${project._id}`, {
        name: name.trim(),
        description: description.trim(),
        status,
        startDate: startDate || null,
        endDate: endDate || null,
      });

      if (response.data?.success) {
        toast.success('Project updated successfully');
        onUpdated(response.data.data);
        onClose();
      } else {
        toast.error(response.data?.message || 'Failed to update project');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-[#923b5b]" />
            <h3 className="text-sm font-bold text-slate-800">Edit Project</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit project dialog"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-[#923b5b] focus:ring-2 focus:ring-[#923b5b]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-[#923b5b] focus:ring-2 focus:ring-[#923b5b]/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" /> Deadline
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#923b5b] px-5 py-2 text-xs font-semibold text-white shadow-md shadow-[#923b5b]/20 transition hover:bg-[#652d59] disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
