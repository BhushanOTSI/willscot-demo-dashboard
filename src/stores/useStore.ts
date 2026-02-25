import { create } from 'zustand';
import { type DateRange } from 'react-day-picker';
import { type Project } from '@/hooks/useProjects';

interface StoreState {
    // Add your state properties here
    count: number;
    user: {
        name: string | null;
        email: string | null;
    } | null;
    selectedProject: Project | null;
    dateRange: DateRange | undefined;

    // Actions
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    setUser: (user: { name: string; email: string } | null) => void;
    setSelectedProject: (project: Project | null) => void;
    setDateRange: (dateRange: DateRange | undefined) => void;
}

export const useStore = create<StoreState>((set) => ({
    // Initial state
    count: 0,
    user: null,
    selectedProject: null,
    dateRange: undefined,

    // Actions
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
    setUser: (user) => set({ user }),
    setSelectedProject: (project) => set({ selectedProject: project }),
    setDateRange: (dateRange) => set({ dateRange }),
}));

