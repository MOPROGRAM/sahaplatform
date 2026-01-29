"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                router.push('/');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-bg">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-text-muted text-sm font-bold animate-pulse">Authenticating...</p>
            </div>
        </div>
    );
}
