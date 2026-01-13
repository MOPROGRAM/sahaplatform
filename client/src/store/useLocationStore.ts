import { create } from 'zustand';
import { apiService } from '@/lib/api';

interface Country {
    id: string;
    name: string;
    nameAr: string;
    nameEn: string;
    code: string;
    phoneCode: string;
    flag: string;
    currency: {
        id: string;
        code: string;
        symbol: string;
        nameAr: string;
        nameEn: string;
    };
    cities: City[];
}

interface City {
    id: string;
    name: string;
    nameAr: string;
    nameEn: string;
    latitude?: number;
    longitude?: number;
}

interface LocationState {
    countries: Country[];
    loading: boolean;
    error: string | null;

    // Actions
    fetchCountries: () => Promise<void>;
    getCountryById: (id: string) => Country | undefined;
    getCitiesByCountry: (countryId: string) => City[];
    getCityById: (id: string) => City | undefined;
}

export const useLocationStore = create<LocationState>((set, get) => ({
    countries: [],
    loading: false,
    error: null,

    fetchCountries: async () => {
        set({ loading: true, error: null });
        try {
            const countries = await apiService.getCountries();
            set({ countries, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch countries',
                loading: false
            });
        }
    },

    getCountryById: (id: string) => {
        return get().countries.find(country => country.id === id);
    },

    getCitiesByCountry: (countryId: string) => {
        const country = get().countries.find(c => c.id === countryId);
        return country?.cities || [];
    },

    getCityById: (id: string) => {
        for (const country of get().countries) {
            const city = country.cities.find(c => c.id === id);
            if (city) return city;
        }
        return undefined;
    }
}));