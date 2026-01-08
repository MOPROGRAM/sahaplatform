import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'MERCHANT' | 'ADMIN';
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    setUser: (user: User | null, token: string | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: {
        id: '1',
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        role: 'MERCHANT',
        isVerified: true
    }, // مموك مسبقاً للتطوير
    token: 'mock-token',
    setUser: (user, token) => set({ user, token }),
    logout: () => set({ user: null, token: null }),
}));
