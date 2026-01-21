import { create } from 'zustand';
import { countriesService, Country, City } from '@/lib/countries';

interface LocationState {
    countries: Country[];
    cities: City[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchCountries: () => Promise<void>;
    fetchCities: () => Promise<void>;
    getCountryById: (id: string) => Country | undefined;
    getCitiesByCountry: (countryId: string) => City[];
    getCityById: (id: string) => City | undefined;
}

export const useLocationStore = create<LocationState>((set, get) => ({
    countries: [],
    cities: [],
    loading: false,
    error: null,

    fetchCountries: async () => {
        set({ loading: true, error: null });
        try {
            const countries = await countriesService.getCountries();
            set({ countries, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch countries',
                loading: false
            });
        }
    },

    fetchCities: async () => {
        set({ loading: true, error: null });
        try {
            const cities = await countriesService.getCities();
            set({ cities, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch cities',
                loading: false
            });
        }
    },

    getCountryById: (id: string) => {
        return get().countries.find(country => country.id === id);
    },

    getCitiesByCountry: (countryId: string) => {
        return get().cities.filter(city => city.country_id === countryId);
    },

    getCityById: (id: string) => {
        return get().cities.find(city => city.id === id);
    }
}));