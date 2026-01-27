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
    cityId: string | null;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    tags: string[];
    setCategory: (category: string | null) => void;
    setSubCategory: (sub: string | null) => void;
    setSearchQuery: (query: string) => void;
    setCityId: (cityId: string | null) => void;
    setPriceRange: (min: string, max: string) => void;
    setAreaRange: (min: string, max: string) => void;
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    toggleTag: (tag: string) => void;
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
    setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
    setAreaRange: (minArea, maxArea) => set({ minArea, maxArea }),
    setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
    toggleTag: (tag) => set((state) => ({
        tags: state.tags.includes(tag)
            ? state.tags.filter(t => t !== tag)
            : [...state.tags, tag]
    })),
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
