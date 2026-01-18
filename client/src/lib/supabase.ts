import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Supabase client instance configured with environment variables
 * Used for database operations and authentication
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)