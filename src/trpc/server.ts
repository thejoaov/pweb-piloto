import { headers } from 'next/headers'
import { cache } from 'react'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { createClient } from '~/utils/supabase/server'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers())
  heads.set('x-trpc-source', 'rsc')

  const supabase = await createClient()

  return createTRPCContext({
    supabase,
    headers: heads,
  })
})

export const api = createCaller(createContext)
