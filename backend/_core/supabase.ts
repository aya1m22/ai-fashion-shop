import { createClient } from '@supabase/supabase-js'
import { ENV } from './env'

if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for backend')
}

export const supabaseAdmin = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
