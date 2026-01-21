import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

/**
 * Supabase client instance configured with environment variables
 * Used for database operations and authentication
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)