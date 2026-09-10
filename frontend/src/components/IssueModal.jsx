import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Paperclip,
  UploadCloud,
  Send,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const IssueModal = ({ issueId, projectId, onClose, onUpdated }) => {
  const toast = useToast();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [status, setStatus] = useState('open');
  const [assignedTo, setAssignedTo] = useState('');
  const [resolution, setResolution] = useState('');

  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchIssueData = async () => {
      setLoading(true);
      try {
        const [issueRes, membersRes, commentsRes, attachRes] = await Promise.all([
          api.get(`/issues/${issueId}`),
          api.get(`/projects/${projectId}/members`),
          api.get(`/comments/issue/${issueId}`),
          api.get(`/attachments?issue=${issueId}`),
        ]);

        if (issueRes.data?.success) {
          const i = issueRes.data.data;
          setIssue(i);
          setTitle(i.title);
          setDescription(i.description || '');
          setReproductionSteps(i.reproductionSteps || '');
          setSeverity(i.severity);
          setStatus(i.status);
          setAssignedTo(i.assignedTo?._id || '');
          setResolution(i.resolution || '');
        }

        if (membersRes.data?.success) setMembers(membersRes.data.data);
        if (commentsRes.data?.success) setComments(commentsRes.data.data);
        if (attachRes.data?.success) setAttachments(attachRes.data.data);
      } catch (error) {
        console.error('Failed to fetch issue:', error);
        toast.error('Failed to load issue');
      } finally {
        setLoading(false);
      }
    };

    if (issueId && projectId) {
      fetchIssueData();
    }
  }, [issueId, projectId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/issues/${issueId}`, {
        title,
        description,
        reproductionSteps,
        severity,
        status,
        assignedTo: assignedTo || null,
        resolution,
      });

      if (res.data?.success) {
        toast.success('Issue updated');
        if (onUpdated) onUpdated();
        onClose();
      }
    } catch (error) {
      toast.error('Failed to update issue');
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error('Please enter a resolution note before resolving');
      return;
    }
    try {
      const res = await api.put(`/issues/${issueId}/resolve`, { resolution });
      if (res.data?.success) {
        toast.success('Issue marked as resolved');
        if (onUpdated) onUpdated();
        onClose();
      }
    } catch (error) {
      toast.error('Failed to resolve issue');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this issue?')) return;
    try {
      await api.delete(`/issues/${issueId}`);
      toast.success('Issue deleted');
      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      toast.error('Failed to delete issue');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post('/comments', {
        issue: issueId,
        text: newComment,
      });

      if (res.data?.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
        toast.success('Comment posted');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('issue', issueId);

    setUploading(true);
    try {
      const res = await api.post('/attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setAttachments([res.data.data, ...attachments]);
        toast.success('File uploaded');
      }
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-700">Loading issue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Issue #{issue?._id?.slice(-5)}
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                severity === 'critical'
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : severity === 'high'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {severity}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Delete Issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 gap-6 bg-white text-xs font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'details'
                ? 'border-[#923b5b] text-[#923b5b]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Details & Resolution
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-[#923b5b] text-[#923b5b]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'attachments'
                ? 'border-[#923b5b] text-[#923b5b]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            Attachments ({attachments.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'details' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#923b5b]/20"
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
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#923b5b]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reproduction Steps
                </label>
                <textarea
                  rows={2}
                  value={reproductionSteps}
                  onChange={(e) => setReproductionSteps(e.target.value)}
                  placeholder="1. Step one... 2. Step two..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#923b5b]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Assignee</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user._id} value={m.user._id}>
                        {m.user.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resolution Section */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Resolution Details</span>
                  {status === 'resolved' && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  )}
                </label>
                <textarea
                  rows={2}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Explain how this issue was resolved..."
                  className="w-full px-3.5 py-2 border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
                {status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={handleResolve}
                    className="mt-2 px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition"
                  >
                    Mark as Resolved with Note
                  </button>
                )}
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#923b5b] text-white hover:bg-[#652d59] transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No comments yet</p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">{c.user?.name}</span>
                        <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#923b5b]/20"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </form>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-slate-300 hover:border-[#923b5b] rounded-xl text-center cursor-pointer relative bg-slate-50/50 transition">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700">
                  {uploading ? 'Uploading...' : 'Upload logs or screenshots'}
                </p>
              </div>

              <div className="space-y-2">
                {attachments.map((a) => (
                  <div key={a._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <a
                      href={a.fileUrl.startsWith('http') ? a.fileUrl : `http://localhost:5000${a.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-800 hover:text-[#923b5b] truncate"
                    >
                      {a.fileName}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
