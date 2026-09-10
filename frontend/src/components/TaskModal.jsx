import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Tag,
  Paperclip,
  MessageSquare,
  Clock,
  Trash2,
  UploadCloud,
  Send,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ taskId, projectId, onClose, onUpdated }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // details, comments, attachments

  // Form edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [storyPoints, setStoryPoints] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [sprint, setSprint] = useState('');
  const [milestone, setMilestone] = useState('');

  // Dropdown options
  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [labels, setLabels] = useState([]);

  // Comments & Attachments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchTaskData = async () => {
      setLoading(true);
      try {
        const [taskRes, membersRes, sprintsRes, milestonesRes, labelsRes, commentsRes, attachRes] =
          await Promise.all([
            api.get(`/tasks/${taskId}`),
            api.get(`/projects/${projectId}/members`),
            api.get(`/sprints/project/${projectId}`),
            api.get(`/milestones/project/${projectId}`),
            api.get(`/labels/project/${projectId}`),
            api.get(`/comments/task/${taskId}`),
            api.get(`/attachments?task=${taskId}`),
          ]);

        if (taskRes.data?.success) {
          const t = taskRes.data.data;
          setTask(t);
          setTitle(t.title);
          setDescription(t.description || '');
          setStatus(t.status);
          setPriority(t.priority);
          setStoryPoints(t.storyPoints || 0);
          setDueDate(t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '');
          setAssignedTo(t.assignedTo?._id || '');
          setSprint(t.sprint?._id || '');
          setMilestone(t.milestone?._id || '');
        }

        if (membersRes.data?.success) setMembers(membersRes.data.data);
        if (sprintsRes.data?.success) setSprints(sprintsRes.data.data);
        if (milestonesRes.data?.success) setMilestones(milestonesRes.data.data);
        if (labelsRes.data?.success) setLabels(labelsRes.data.data);
        if (commentsRes.data?.success) setComments(commentsRes.data.data);
        if (attachRes.data?.success) setAttachments(attachRes.data.data);
      } catch (error) {
        console.error('Failed to fetch task:', error);
        toast.error('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    if (taskId && projectId) {
      fetchTaskData();
    }
  }, [taskId, projectId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/tasks/${taskId}`, {
        title,
        description,
        status,
        priority,
        storyPoints,
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
        sprint: sprint || null,
        milestone: milestone || null,
      });

      if (res.data?.success) {
        toast.success('Task updated successfully');
        if (onUpdated) onUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.post('/comments', {
        task: taskId,
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
    formData.append('task', taskId);

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

  const handleDeleteAttachment = async (attachId) => {
    try {
      await api.delete(`/attachments/${attachId}`);
      setAttachments(attachments.filter((a) => a._id !== attachId));
      toast.success('Attachment removed');
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-[#923b5b] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-700">Loading task...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto animate-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Task Details
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700">
              {status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Delete Task"
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

        {/* Modal Tabs */}
        <div className="flex items-center border-b border-slate-200 px-6 gap-6 bg-white text-xs font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'details'
                ? 'border-[#923b5b] text-[#923b5b]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Details
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

        {/* Modal Body */}
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
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#923b5b]/20 focus:border-[#923b5b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add detailed task description..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#923b5b]/20 focus:border-[#923b5b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#923b5b]/20"
                  >
                    <option value="todo">TODO</option>
                    <option value="in-progress">IN PROGRESS</option>
                    <option value="review">REVIEW</option>
                    <option value="done">DONE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#923b5b]/20"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Story Points</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#923b5b]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#923b5b]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Assignee</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#923b5b]/20"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user._id} value={m.user._id}>
                        {m.user.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sprint</label>
                  <select
                    value={sprint}
                    onChange={(e) => setSprint(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#923b5b]/20"
                  >
                    <option value="">Backlog (No Sprint)</option>
                    {sprints.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Milestone</label>
                  <select
                    value={milestone}
                    onChange={(e) => setMilestone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#923b5b]/20"
                  >
                    <option value="">None</option>
                    {milestones.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Labels tag display */}
              {task?.labels && task.labels.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-600 block mb-1.5">Labels</span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map((lbl) => (
                      <span
                        key={lbl._id || lbl}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-rose-50 text-[#923b5b] border border-rose-200 font-semibold"
                      >
                        #{lbl.name || 'Label'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#923b5b] text-white hover:bg-[#652d59] transition shadow-md shadow-[#923b5b]/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No comments yet. Start the conversation!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {c.user?.name ? c.user.name.charAt(0) : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800">{c.user?.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{c.text}</p>
                      </div>
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
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#923b5b]/20 focus:border-[#923b5b]"
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
                  {uploading ? 'Uploading...' : 'Click or drop files to upload'}
                </p>
                <p className="text-[11px] text-slate-400">Supports images, documents, and archives up to 20MB</p>
              </div>

              <div className="space-y-2">
                {attachments.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">No attachments uploaded yet</p>
                ) : (
                  attachments.map((a) => (
                    <div
                      key={a._id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                        <div className="truncate">
                          <a
                            href={a.fileUrl.startsWith('http') ? a.fileUrl : `http://localhost:5000${a.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-slate-800 hover:text-[#923b5b] truncate block"
                          >
                            {a.fileName}
                          </a>
                          <span className="text-[10px] text-slate-400">
                            Uploaded by {a.uploadedBy?.name || 'User'} on {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(a._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
