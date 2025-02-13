'use server'

import { AuthApiError, AuthError, type User } from '@supabase/supabase-js'
import { and, eq } from 'drizzle-orm'
import { returnValidationErrors } from 'next-safe-action'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { DEFAULT_LOGIN_REDIRECT } from '~/config/routes'
import { actionClient, authActionClient } from '~/lib/safe-action'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { createClient } from '~/utils/supabase/server'

// This schema is used to validate input from client.
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export const loginUser = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    let bypassUserDataInRedirect: User | null = null
    try {
      const supabase = await createClient()

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('loginUser action error', error)
        throw error
      }

      if (data.user) {
        bypassUserDataInRedirect = data.user
      }
      redirect(DEFAULT_LOGIN_REDIRECT)
    } catch (error) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      if ((error as any).digest === 'NEXT_REDIRECT;push;/dashboard;307;') {
        return { data: bypassUserDataInRedirect }
      }

      console.error(error)

      return returnValidationErrors(loginSchema, {
        _errors: [
          error instanceof AuthError
            ? error.message
            : 'Username or password is incorrect.',
        ],
      })
    }
  })

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  cpf: z
    .string()
    .min(11)
    .transform((value) => {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    }),
  name: z.string().min(2),
})

export const signUp = actionClient
  .schema(signUpSchema)
  .action(async ({ parsedInput: { email, password, name, cpf } }) => {
    try {
      const supabase = await createClient()

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (
        (data.user?.identities && data.user.identities.length === 0) ||
        error
      ) {
        throw error
      }

      await db
        .update(users)
        .set({
          cpf,
        })
        .where(
          and(eq(users.email, email), eq(users.id, data.user?.id as string)),
        )

      return { data: data.user }
    } catch (error) {
      console.error(error)
      return returnValidationErrors(signUpSchema, {
        _errors: [
          error instanceof AuthError ? error.message : 'Something went wrong',
        ],
      })
    }
  })
