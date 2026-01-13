import { create } from 'zustand';

interface FilterState {
    category: string | null;
    subCategory: string | null;
    cityId: string | null;
    searchQuery: string;
    minPrice: string;
    maxPrice: string;
    tags: string[];
    setCategory: (category: string | null) => void;
    setSubCategory: (sub: string | null) => void;
    setSearchQuery: (query: string) => void;
    setCityId: (cityId: string | null) => void;
    setPriceRange: (min: string, max: string) => void;
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
    tags: [],
    setCategory: (category) => set({ category, subCategory: null }),
    setSubCategory: (subCategory) => set({ subCategory }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setCityId: (cityId) => set({ cityId }),
    setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
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
        maxPrice: ''
    }),
}));
