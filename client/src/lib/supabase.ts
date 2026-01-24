import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: typeof window !== 'undefined' ? localStorage : undefined,
            autoRefreshToken: typeof window !== 'undefined',
            persistSession: typeof window !== 'undefined'
        }
    })
}

/**
 * Supabase client instance configured with environment variables
 * Used for database operations and authentication
 */
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export const supabase: ReturnType<typeof createClient<Database>> = new Proxy({} as any, {
    get(target, prop) {
        if (!supabaseClient) {
            supabaseClient = getSupabaseClient()
        }
        const value = (supabaseClient as any)[prop]
        if (typeof value === 'function') {
            return value.bind(supabaseClient)
        }
        return value
    }
})