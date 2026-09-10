import React, { useState } from 'react';
import {
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const COLUMNS = [
  { id: 'todo', title: 'TODO', color: 'border-t-slate-400', badge: 'bg-slate-100 text-slate-700' },
  { id: 'in-progress', title: 'IN PROGRESS', color: 'border-t-amber-500', badge: 'bg-amber-100 text-amber-800' },
  { id: 'review', title: 'REVIEW', color: 'border-t-blue-500', badge: 'bg-blue-100 text-blue-800' },
  { id: 'done', title: 'DONE', color: 'border-t-emerald-500', badge: 'bg-emerald-100 text-emerald-800' },
];

const KanbanBoard = ({ tasks, onTaskClick, onTaskStatusChanged, onAddTask, isManagerOrLead }) => {
  const toast = useToast();
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    setDraggingTaskId(null);

    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    // Optimistically notify parent
    onTaskStatusChanged(taskId, targetStatus);

    try {
      await api.put(`/tasks/${taskId}/status`, { status: targetStatus });
      toast.success(`Task moved to ${targetStatus.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to move task');
      // Revert status by triggering refresh
      onTaskStatusChanged(taskId, task.status);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4.5 pb-8 items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const totalPoints = columnTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col min-h-[500px] border-t-4 ${col.color}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 tracking-wide">
                  {col.title}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${col.badge}`}>
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {totalPoints > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200" title="Total Story Points">
                    {totalPoints} pts
                  </span>
                )}
                <button
                  onClick={() => onAddTask && onAddTask(col.id)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white transition"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Task Cards Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 min-h-[100px]">
              {columnTasks.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium select-none">
                  Drop tasks here
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    onClick={() => onTaskClick(task)}
                    className="group bg-white rounded-xl p-3.5 shadow-2xs border border-slate-200 hover:border-[#923b5b]/40 hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.99]"
                  >
                    {/* Labels row */}
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.labels.map((lbl) => (
                          <span
                            key={lbl._id || lbl}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-[#923b5b] border border-rose-100"
                          >
                            {lbl.name || 'Label'}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Task Title */}
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-[#923b5b] transition-colors leading-snug">
                      {task.title}
                    </h4>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        {task.storyPoints > 0 && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {task.storyPoints}p
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {task.dueDate && (
                          <span
                            className={`text-[10px] flex items-center gap-0.5 ${
                              new Date(task.dueDate) < new Date() && task.status !== 'done'
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-400'
                            }`}
                            title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                          >
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}

                        {/* Assignee Avatar */}
                        {task.assignedTo ? (
                          <div
                            className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center overflow-hidden border border-slate-200"
                            title={task.assignedTo.name}
                          >
                            {task.assignedTo.avatar ? (
                              <img
                                src={task.assignedTo.avatar}
                                alt={task.assignedTo.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              task.assignedTo.name.charAt(0)
                            )}
                          </div>
                        ) : (
                          <div
                            className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400"
                            title="Unassigned"
                          >
                            ?
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
