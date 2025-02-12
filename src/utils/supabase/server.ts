import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '~/env'

export async function createClient() {
  'use server'

  const cookieStore = await cookies()

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          cookieStore.set(cookie)
        }
        for (const cookie of cookiesToSet) {
          cookieStore.set(cookie)
        }
      },
    },
  })
}
