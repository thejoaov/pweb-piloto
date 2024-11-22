import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, email, image } = input

      const exists = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      })

      if (exists) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists.',
        })
      }

      const user = await ctx.db.insert(users).values({
        id: ctx?.user?.id as string,
        email,
        name,
        image,
      })

      return user
    }),
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx?.user
  }),
})
