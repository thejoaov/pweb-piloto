import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { paginationSchema } from '../utils'

export const usersRouter = createTRPCRouter({
  getList: protectedProcedure
    .input(
      paginationSchema.extend({
        orderBy: z
          .enum(['name', 'email', 'image', 'createdAt', 'updatedAt'])
          .default('name')
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        order = 'asc',
        orderBy = 'createdAt',
        page = 1,
        perPage = 10,
      } = input
      const response = await ctx.db
        .select()
        .from(users)
        .limit(perPage)
        .offset((page - 1) * perPage)
        .orderBy(order === 'asc' ? asc(users[orderBy]) : desc(users[orderBy]))

      return response
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      const response = await ctx.db.delete(users).where(eq(users.id, id))
      return response
    }),
})
