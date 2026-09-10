import React, { useState, useEffect } from 'react';
import { Activity, Clock, FolderKanban } from 'lucide-react';
import api from '../services/api';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await api.get('/activity');
        if (res.data?.success) {
          setActivities(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Activity Feed</h1>
        <p className="text-xs text-slate-500 mt-1">
          Chronological audit trail of actions taken across projects and sprints.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading activity history...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">No activities recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {activities.map((act) => (
              <div
                key={act._id}
                className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                  {act.user?.avatar ? (
                    <img src={act.user.avatar} alt={act.user.name} className="w-full h-full object-cover" />
                  ) : (
                    act.user?.name?.charAt(0) || 'U'
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{act.user?.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-snug">{act.action}</p>
                  {act.project && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#923b5b] bg-rose-50 px-2 py-0.5 rounded-md mt-2 border border-rose-100">
                      <FolderKanban className="w-3 h-3" />
                      {act.project.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
