import { createSafeActionClient } from 'next-safe-action'
import { createClient } from '~/utils/supabase/server'

// Base client
export const actionClient = createSafeActionClient({
  throwValidationErrors: true,
  handleServerError(e, utils) {
    // You can access these properties inside the `utils` object.
    const { clientInput, bindArgsClientInputs, metadata, ctx } = utils

    // Log to console.
    console.error('Action error:', e)

    // Return generic message
    return 'Oh no, something went wrong!'
  },
})

// Auth client
export const authActionClient = actionClient.use(async ({ next, ctx }) => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  console.log(data, error)

  if (error ?? !data.user) {
    throw new Error('Unauthorized')
  }

  if (!data.user.id) {
    throw new Error('Session is not valid!')
  }

  return next({ ctx: { userId: data.user.id } })
})
