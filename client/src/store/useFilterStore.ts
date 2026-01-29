import { create } from 'zustand';

interface FilterState {
    category: string | null;
    subCategory: string | null;
    cityId: string | null;
    searchQuery: string;
    minPrice: string;
    maxPrice: string;
    minArea: string;
    maxArea: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    tags: string[];
    setCategory: (category: string | null) => void;
    setSubCategory: (sub: string | null) => void;
    setSearchQuery: (query: string) => void;
    setCityId: (cityId: string | null) => void;
    setMinPrice: (min: string) => void;
    setMaxPrice: (max: string) => void;
    setMinArea: (min: string) => void;
    setMaxArea: (max: string) => void;
    setSortBy: (sortBy: string) => void;
    setSortOrder: (sortOrder: 'asc' | 'desc') => void;
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    category: null,
    subCategory: null,
    cityId: null,
    searchQuery: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    tags: [],
    setCategory: (category) => set({ 
        category, 
        subCategory: null,
        tags: [],
        minArea: '',
        maxArea: '' 
    }),
    setSubCategory: (subCategory) => set({ subCategory }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setCityId: (cityId) => set({ cityId }),
    setMinPrice: (minPrice) => set({ minPrice }),
    setMaxPrice: (maxPrice) => set({ maxPrice }),
    setMinArea: (minArea) => set({ minArea }),
    setMaxArea: (maxArea) => set({ maxArea }),
    setSortBy: (sortBy) => set({ sortBy }),
    setSortOrder: (sortOrder) => set({ sortOrder }),
    addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
    removeTag: (tag) => set((state) => ({ tags: state.tags.filter(t => t !== tag) })),
    resetFilters: () => set({
        category: null,
        subCategory: null,
        cityId: null,
        tags: [],
        searchQuery: '',
        minPrice: '',
        maxPrice: '',
        minArea: '',
        maxArea: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
    }),
}));
