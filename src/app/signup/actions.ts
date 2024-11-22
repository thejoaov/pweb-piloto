'use server'

import { z } from 'zod'
import { action } from '~/lib/safe-action'
import { createClient } from '~/utils/supabase/server'

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
      throw new Error('Ocorreu um erro. Por favor, tente novamente.')
    }

    if (error) {
      throw error
    }

    return { data: data.user }
  },
)
