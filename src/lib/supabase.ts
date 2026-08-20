import { createClient } from '@supabase/supabase-js'

const configuredUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const configuredKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey)

export const supabase = createClient(
  configuredUrl ?? 'https://placeholder.supabase.co',
  configuredKey ?? 'placeholder-publishable-key',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
)
