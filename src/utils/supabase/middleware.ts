import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  DEFAULT_AUTH_ROUTE,
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  protectedRoutes,
} from '~/config/routes'
import { env } from '~/env'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
    },
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options) {
        try {
          request.cookies.set({ name, value, ...options })
        } catch (_error) {
          console.error(_error)
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options) {
        try {
          request.cookies.set({ name, value: '', ...options })
        } catch (_error) {
          console.error(_error)
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })

  // Get user
  const { data, error } = await supabase.auth.getUser()

  // If protected route and user is not authenticated, redirect to login
  const isProtectedRoute = protectedRoutes.includes(request.nextUrl.pathname)

  if (isProtectedRoute && (error ?? !data.user)) {
    const url = new URL(DEFAULT_AUTH_ROUTE, request.url)
    return NextResponse.redirect(url)
  }

  // Forward authed user to DEFAULT_LOGIN_REDIRECT if auth route
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  if (isAuthRoute && data.user) {
    const url = new URL(DEFAULT_LOGIN_REDIRECT, request.url)
    return NextResponse.redirect(url)
  }

  // Proceed as normal
  return response
}
