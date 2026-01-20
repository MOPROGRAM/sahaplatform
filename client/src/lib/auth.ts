import { apiService } from './api';

// استخدام API Backend للمصادقة
export const authService = {
    async login(email: string, password: string) {
        const response = await apiService.login({ email, password });

        return {
            token: response.token,
            user: {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                role: response.user.role,
                userType: response.user.userType,
                verified: response.user.verified,
            },
        };
    },

    async register(email: string, password: string, name: string, userType: string = 'SEEKER') {
        const response = await apiService.register({ email, password, name });

        return {
            token: response.token,
            user: {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                role: response.user.role,
                userType: response.user.userType,
                verified: response.user.verified,
            },
        };
    },

    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    },

    setToken(token: string) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('auth_token', token);
    },

    removeToken() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('auth_token');
    }
};

export type AuthUser = {
    id: string;
    email: string;
    name?: string;
    role?: string;
    userType?: string;
    verified?: boolean;
    image?: string;
};