import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Shield, Trash2, UserPlus, Check } from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Organizations = () => {
  const { organizations, activeOrg, setActiveOrg, fetchOrganizations } = useProject();
  const { user } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDesc, setOrgDesc] = useState('');

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeOrg) return;
      setLoadingMembers(true);
      try {
        const res = await api.get(`/organizations/${activeOrg._id}/members`);
        if (res.data?.success) setMembers(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [activeOrg]);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    try {
      const res = await api.post('/organizations', {
        name: orgName.trim(),
        description: orgDesc.trim(),
      });
      if (res.data?.success) {
        toast.success('Organization created!');
        setOrgName('');
        setOrgDesc('');
        setShowCreateOrg(false);
        await fetchOrganizations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim() || !activeOrg) return;

    try {
      const res = await api.post(`/organizations/${activeOrg._id}/members`, {
        email: memberEmail.trim(),
        role: memberRole,
      });
      if (res.data?.success) {
        toast.success('Member added to organization');
        setMemberEmail('');
        setShowAddMember(false);
        // refresh members
        const membersRes = await api.get(`/organizations/${activeOrg._id}/members`);
        if (membersRes.data?.success) setMembers(membersRes.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await api.put(`/organizations/${activeOrg._id}/members/${userId}`, { role });
      toast.success('Role updated');
      const membersRes = await api.get(`/organizations/${activeOrg._id}/members`);
      if (membersRes.data?.success) setMembers(membersRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove member from organization?')) return;
    try {
      await api.delete(`/organizations/${activeOrg._id}/members/${userId}`);
      toast.success('Member removed');
      const membersRes = await api.get(`/organizations/${activeOrg._id}/members`);
      if (membersRes.data?.success) setMembers(membersRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteOrganization = async (organization) => {
    const confirmed = window.confirm(
      `Delete "${organization.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/organizations/${organization._id}`);
      toast.success('Organization deleted');
      if (activeOrg?._id === organization._id) setActiveOrg(null);
      await fetchOrganizations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete organization');
    }
  };

  const isOrgAdmin = activeOrg?.currentUserRole === 'admin';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Organizations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage organization workspaces, membership access, and administrative roles.
          </p>
        </div>

        <button
          onClick={() => setShowCreateOrg(true)}
          className="px-4 py-2.5 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] transition shadow-md shadow-[#923b5b]/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Organization
        </button>
      </div>

      {/* Orgs List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {organizations.map((org) => {
          const isSelected = activeOrg?._id === org._id;
          return (
            <div
              key={org._id}
              onClick={() => setActiveOrg(org)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-rose-50/40 border-[#923b5b] shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className={`w-5 h-5 ${isSelected ? 'text-[#923b5b]' : 'text-slate-400'}`} />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {org.currentUserRole || 'member'}
                  </span>
                  {org.owner?._id === user?._id && (
                    <button
                      type="button"
                      title={`Delete ${org.name}`}
                      aria-label={`Delete ${org.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteOrganization(org);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 truncate">{org.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">
                {org.description || 'No description provided.'}
              </p>
              {isSelected && (
                <div className="flex items-center gap-1 text-xs font-bold text-[#923b5b]">
                  <Check className="w-3.5 h-3.5" /> Active Workspace
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Organization Members Section */}
      {activeOrg && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {activeOrg.name} â€” Members ({members.length})
              </h3>
              <p className="text-xs text-slate-500">
                Users with access to projects and teams within this organization.
              </p>
            </div>

            {isOrgAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="px-3.5 py-1.5 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59] flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Member
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {members.map((m) => (
              <div key={m._id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {m.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.user?.name}</h4>
                    <p className="text-[11px] text-slate-400">{m.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isOrgAdmin && m.user?._id !== activeOrg.owner?._id ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleUpdateRole(m.user._id, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
                      {m.role}
                    </span>
                  )}

                  {isOrgAdmin && m.user?._id !== activeOrg.owner?._id && (
                    <button
                      onClick={() => handleRemoveMember(m.user._id)}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Org Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 w-full max-w-md space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-800">Create New Organization</h3>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Labs"
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={orgDesc}
                  onChange={(e) => setOrgDesc(e.target.value)}
                  placeholder="Brief description..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateOrg(false)}
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
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 w-full max-w-md space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-800">Add Organization Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">User Email *</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#923b5b] text-white rounded-xl text-xs font-semibold hover:bg-[#652d59]"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;
