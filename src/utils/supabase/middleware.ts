import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
  let response = NextResponse.next({
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
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie)
        }
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie)
        }
        response = NextResponse.next({
          request,
        })
      },
    },
  })

  const { data, error } = await supabase.auth.getUser()

  const isProtectedRoute = protectedRoutes.includes(request.nextUrl.pathname)

  if (isProtectedRoute && (error || !data.user)) {
    const url = new URL(DEFAULT_AUTH_ROUTE, request.url)
    return NextResponse.redirect(url)
  }

  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)

  if (isAuthRoute && data.user) {
    const url = new URL(DEFAULT_LOGIN_REDIRECT, request.url)
    return NextResponse.redirect(url)
  }

  return response
}
