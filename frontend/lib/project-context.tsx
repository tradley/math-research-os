"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { projectsApi, type Project, type ProjectStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  stats: ProjectStats | null;
  loading: boolean;
  error: string | null;
  setActiveProject: (project: Project) => void;
  refresh: () => Promise<void>;
  createProject: (title: string, description?: string, field?: string) => Promise<Project>;
}

const ProjectContext = createContext<ProjectState>({
  projects: [],
  activeProject: null,
  stats: null,
  loading: true,
  error: null,
  setActiveProject: () => {},
  refresh: async () => {},
  createProject: async () => ({} as Project),
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const list = await projectsApi.list(token);
      setProjects(list);
      // Auto-select first project if none active
      if (list.length > 0 && !activeProject) {
        setActiveProjectState(list[0]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Fetch stats when active project changes
  useEffect(() => {
    if (!token || !activeProject) { setStats(null); return; }
    projectsApi.stats(activeProject.id, token).then(setStats).catch(() => setStats(null));
  }, [token, activeProject]);

  const setActiveProject = useCallback((project: Project) => {
    setActiveProjectState(project);
  }, []);

  const createProject = useCallback(async (title: string, description?: string, field?: string) => {
    if (!token) throw new Error("Not authenticated");
    const project = await projectsApi.create({ title, description, field }, token);
    setProjects(prev => [project, ...prev]);
    setActiveProjectState(project);
    return project;
  }, [token]);

  return (
    <ProjectContext.Provider value={{ projects, activeProject, stats, loading, error, setActiveProject, refresh: fetchProjects, createProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
