import { create } from 'zustand';

interface FilterState {
    category: string | null;
    subCategory: string | null;
    location: string;
    searchQuery: string;
    tags: string[];
    setCategory: (category: string | null) => void;
    setSubCategory: (sub: string | null) => void;
    setSearchQuery: (query: string) => void;
    toggleTag: (tag: string) => void;
    setLocation: (loc: string) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    category: null,
    subCategory: null,
    location: 'Riyadh',
    searchQuery: '',
    tags: [],
    setCategory: (category) => set({ category, subCategory: null }),
    setSubCategory: (subCategory) => set({ subCategory }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    toggleTag: (tag) => set((state) => ({
        tags: state.tags.includes(tag)
            ? state.tags.filter(t => t !== tag)
            : [...state.tags, tag]
    })),
    setLocation: (location) => set({ location }),
    resetFilters: () => set({ category: null, subCategory: null, tags: [], searchQuery: '' }),
}));
