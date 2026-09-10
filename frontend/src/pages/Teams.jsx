import React, { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, Trash2, Shield, User } from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';

const Teams = () => {
  const { activeOrg } = useProject();
  const toast = useToast();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [orgMembers, setOrgMembers] = useState([]);

  // Add member to specific team state
  const [selectedTeamForMember, setSelectedTeamForMember] = useState(null);
  const [memberToAdd, setMemberToAdd] = useState('');

  const fetchTeamsAndMembers = async () => {
    if (!activeOrg) return;
    setLoading(true);
    try {
      const [teamsRes, membersRes] = await Promise.all([
        api.get(`/teams?organization=${activeOrg._id}`),
        api.get(`/organizations/${activeOrg._id}/members`),
      ]);

      if (teamsRes.data?.success) setTeams(teamsRes.data.data);
      if (membersRes.data?.success) setOrgMembers(membersRes.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndMembers();
  }, [activeOrg]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !activeOrg) return;

    try {
      const res = await api.post('/teams', {
        name: teamName.trim(),
        organization: activeOrg._id,
      });

      if (res.data?.success) {
        toast.success('Team created!');
        setTeamName('');
        setShowCreateTeam(false);
        fetchTeamsAndMembers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleAddMemberToTeam = async (e) => {
    e.preventDefault();
    if (!memberToAdd || !selectedTeamForMember) return;

    try {
      const res = await api.post(`/teams/${selectedTeamForMember._id}/members`, {
        userId: memberToAdd,
      });

      if (res.data?.success) {
        toast.success('Member added to team');
        setMemberToAdd('');
        setSelectedTeamForMember(null);
        fetchTeamsAndMembers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      toast.success('Member removed from team');
      fetchTeamsAndMembers();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Delete this team?')) return;
    try {
      await api.delete(`/teams/${teamId}`);
      toast.success('Team deleted');
      fetchTeamsAndMembers();
    } catch (error) {
      toast.error('Failed to delete team');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Teams</h1>
          <p className="text-xs text-slate-500 mt-1">
            Department and functional teams in{' '}
            <span className="font-semibold text-slate-700">{activeOrg?.name || 'Organization'}</span>
          </p>
        </div>

        <button
          onClick={() => setShowCreateTeam(true)}
          className="px-4 py-2.5 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] transition shadow-md shadow-[#923b5b]/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-400">
            No teams created yet.
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#923b5b] flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{team.name}</h3>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Leader: {team.leader?.name || 'None'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTeamForMember(team)}
                    className="p-1.5 text-[#923b5b] hover:bg-rose-50 rounded-lg transition"
                    title="Add Member"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Team Members ({team.members?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {team.members?.map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                          {m.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-semibold text-slate-800">{m.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(team._id, m._id)}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 w-full max-w-md space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-800">Create New Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Infrastructure & DevOps"
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {selectedTeamForMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 w-full max-w-md space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-800">
              Add Member to {selectedTeamForMember.name}
            </h3>
            <form onSubmit={handleAddMemberToTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Organization Member
                </label>
                <select
                  value={memberToAdd}
                  onChange={(e) => setMemberToAdd(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="">Select User...</option>
                  {orgMembers.map((om) => (
                    <option key={om.user._id} value={om.user._id}>
                      {om.user.name} ({om.user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeamForMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59]"
                >
                  Add to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
