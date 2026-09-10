import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/organizations');
      if (res.data && res.data.success) {
        setOrganizations(res.data.data);
        const storedOrgId = localStorage.getItem('activeOrgId');
        const found = res.data.data.find((o) => o._id === storedOrgId) || res.data.data[0];
        if (found) {
          setActiveOrg(found);
          localStorage.setItem('activeOrgId', found._id);
        } else {
          setActiveOrg(null);
          localStorage.removeItem('activeOrgId');
          setProjects([]);
          setActiveProject(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  }, [isAuthenticated]);

  const fetchProjects = useCallback(async (orgId = null) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const targetOrg = orgId || activeOrg?._id;
      const url = targetOrg ? `/projects?organization=${targetOrg}` : '/projects';
      const res = await api.get(url);
      if (res.data && res.data.success) {
        setProjects(res.data.data);
        const storedProjId = localStorage.getItem('activeProjectId');
        const found = res.data.data.find((p) => p._id === storedProjId) || res.data.data[0];
        if (found) {
          setActiveProject(found);
          localStorage.setItem('activeProjectId', found._id);
        } else {
          setActiveProject(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeOrg]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    } else {
      setOrganizations([]);
      setActiveOrg(null);
      setProjects([]);
      setActiveProject(null);
    }
  }, [isAuthenticated, fetchOrganizations]);

  useEffect(() => {
    if (activeOrg) {
      fetchProjects(activeOrg._id);
    }
  }, [activeOrg, fetchProjects]);

  const handleSelectOrg = (org) => {
    setActiveOrg(org);
    if (org) {
      localStorage.setItem('activeOrgId', org._id);
    }
  };

  const handleSelectProject = (project) => {
    setActiveProject(project);
    if (project) {
      localStorage.setItem('activeProjectId', project._id);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        organizations,
        activeOrg,
        setActiveOrg: handleSelectOrg,
        projects,
        activeProject,
        setActiveProject: handleSelectProject,
        fetchOrganizations,
        fetchProjects,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};
