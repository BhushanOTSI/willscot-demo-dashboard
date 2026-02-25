import { create } from 'zustand';
import { type DateRange } from 'react-day-picker';
import { type Project } from '@/hooks/useProjects';

interface StoreState {
    selectedProject: Project | null;
    dateRange: DateRange | undefined;

    // Actions
    setSelectedProject: (project: Project | null) => void;
    setDateRange: (dateRange: DateRange | undefined) => void;
}

export const useStore = create<StoreState>((set) => ({
    // Initial state
    selectedProject: null,
    dateRange: undefined,

    // Actions
    setSelectedProject: (project) => set({ selectedProject: project }),
    setDateRange: (dateRange) => set({ dateRange }),
}));

