// استخدام API الخاص بالباكيند الموجود على Render مع PostgreSQL
export const authService = {
    async login(email: string, password: string) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        return response.json();
    },

    async register(email: string, password: string, name: string) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    },

    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    },

    setToken(token: string) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('token', token);
    },

    removeToken() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('token');
    }
};

export type AuthUser = {
    id: string;
    email: string;
    name?: string;
    role?: string;
    verified?: boolean;
};