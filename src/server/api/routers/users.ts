import { asc, count, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { paginationSchema } from '../utils'

export const usersRouter = createTRPCRouter({
  getTable: protectedProcedure
    .input(
      z.object({
        pageIndex: z.number().int().default(0),
        pageSize: z.number().int().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const data = await ctx.db.query.users.findMany({
        offset: input.pageIndex * input.pageSize,
        limit: input.pageSize,
        orderBy: asc(users.name),
      })

      const [rowCount = { count: 0 }] = await ctx.db
        .select({ count: count() })
        .from(users)

      return {
        rows: data,
        pageCount: Math.ceil(rowCount.count / input.pageSize),
        rowCount: rowCount.count,
      }
    }),

  getList: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .selectDistinct()
      .from(users)
      .orderBy(asc(users.name))

    return data
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      const response = await ctx.db.delete(users).where(eq(users.id, id))
      return response
    }),
})
