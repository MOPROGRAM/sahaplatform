import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Supabase client instance configured with environment variables
 * Used for database operations and authentication
 */
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get(target, prop) {
        const client = getSupabaseClient()
        const value = (client as any)[prop]
        if (typeof value === 'function') {
            return value.bind(client)
        }
        return value
    }
})