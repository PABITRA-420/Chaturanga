import { create } from 'zustand';

export interface TournamentFilterState {
  activeTab: 'upcoming' | 'past';
  searchQuery: string;
  selectedCategory: string; // 'all' | 'classical' | 'rapid' | 'blitz' | 'team'
  selectedDepartment: string;
  activeRound: number;

  setActiveTab: (tab: 'upcoming' | 'past') => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedDepartment: (dept: string) => void;
  setActiveRound: (round: number) => void;
  resetFilters: () => void;
}

export const useTournamentStore = create<TournamentFilterState>((set) => ({
  activeTab: 'upcoming',
  searchQuery: '',
  selectedCategory: 'all',
  selectedDepartment: 'all',
  activeRound: 1,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),
  setActiveRound: (round) => set({ activeRound: round }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: 'all',
      selectedDepartment: 'all',
    }),
}));

