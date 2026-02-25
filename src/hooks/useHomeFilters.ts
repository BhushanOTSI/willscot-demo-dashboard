import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "@/stores/useStore";
import { useProjects } from "@/hooks/useProjects";
import { subDays } from "date-fns";

type ViewMode = "table" | "charts";

export function useHomeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedProject, dateRange, setSelectedProject, setDateRange } = useStore();
  const { data: projectsData } = useProjects();
  const projects = React.useMemo(() => projectsData?.projects || [], [projectsData?.projects]);

  // Initialize view mode from query params
  const [viewMode, setViewMode] = React.useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "table"
  );

  // Initialize filters from query params on mount
  React.useEffect(() => {
    // Set project from query params
    const projectId = searchParams.get("projectId");
    if (projectId && projects.length > 0 && !selectedProject) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    } else if (projects.length > 0 && !selectedProject && !projectId) {
      // Pre-select first project if no query param
      setSelectedProject(projects[0]);
    }

    // Set date range from query params
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate && endDate && !dateRange) {
      setDateRange({
        from: new Date(startDate),
        to: new Date(endDate),
      });
    } else if (!dateRange && !startDate && !endDate) {
      // Initialize with last 30 days if no query params
      const today = new Date();
      setDateRange({
        from: subDays(today, 30),
        to: today,
      });
    }
  }, [searchParams, projects, selectedProject, dateRange, setSelectedProject, setDateRange]);

  // Update query params when filters change
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedProject) {
      params.set("projectId", selectedProject.id);
    } else {
      params.delete("projectId");
    }

    if (dateRange?.from && dateRange?.to) {
      params.set("startDate", dateRange.from.toISOString());
      params.set("endDate", dateRange.to.toISOString());
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    if (viewMode) {
      params.set("view", viewMode);
    } else {
      params.delete("view");
    }

    setSearchParams(params, { replace: true });
  }, [selectedProject, dateRange, viewMode, searchParams, setSearchParams]);

  const handleViewModeChange = React.useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return {
    viewMode,
    handleViewModeChange,
  };
}

