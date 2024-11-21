import { z } from 'zod'

import { asc, desc, eq } from 'drizzle-orm'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { products } from '~/server/db/schema'
import { paginationSchema } from '../utils'

export const productsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        price: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(products).values(input)
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input
      return ctx.db.query.products.findFirst({ where: eq(products.id, id) })
    }),
  getList: protectedProcedure
    .input(
      paginationSchema.extend({
        orderBy: z
          .enum(['name', 'price', 'createdAt', 'updatedAt'])
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
        .from(products)
        .limit(perPage)
        .offset((page - 1) * perPage)
        .orderBy(
          order === 'asc' ? asc(products[orderBy]) : desc(products[orderBy]),
        )

      return response
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        price: z.number().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...values } = input
      return ctx.db.update(products).set(values).where(eq(products.id, id))
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      return ctx.db.delete(products).where(eq(products.id, id))
    }),
})
