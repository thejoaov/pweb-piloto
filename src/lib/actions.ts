'use server' // don't forget to add this!

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { DEFAULT_LOGIN_REDIRECT } from '~/config/routes'
import { action } from '~/lib/safe-action'
import { createClient } from '~/utils/supabase/server'

// This schema is used to validate input from client.
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export const loginUser = action(schema, async ({ email, password }) => {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  revalidatePath('/', 'layout')

  redirect(DEFAULT_LOGIN_REDIRECT)
})

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

export const signUp = action(
  signUpSchema,
  async ({ email, password, name }: z.infer<typeof signUpSchema>) => {
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

    if (data.user?.identities && data.user.identities.length === 0) {
      throw new Error('An error occurred. Please try again.')
    }

    if (error) {
      throw error
    }

    return { data: data.user }
  },
)
