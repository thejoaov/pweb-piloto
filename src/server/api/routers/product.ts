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
        imageBase64: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .insert(products)
        .values({ ...input, createdById: ctx.user?.id })
        .returning()
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input
      return ctx.db.query.products.findFirst({
        where: eq(products.id, id),
        with: {
          createdBy: true,
          modifiedBy: true,
        },
      })
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
      const response = await ctx.db.query.products.findMany({
        offset: (page - 1) * perPage,
        limit: perPage,
        orderBy:
          order === 'asc' ? asc(products[orderBy]) : desc(products[orderBy]),
        with: {
          createdBy: true,
          modifiedBy: true,
        },
      })

      return response
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        price: z.number().positive().optional(),
        imageBase64: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...values } = input
      return ctx.db
        .update(products)
        .set({ ...values, modifiedById: ctx.user?.id })
        .where(eq(products.id, id))
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      return ctx.db.delete(products).where(eq(products.id, id))
    }),
})
