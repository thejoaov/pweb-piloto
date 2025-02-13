import { z } from 'zod'

import { TRPCError } from '@trpc/server'
import { asc, desc, eq } from 'drizzle-orm'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import {
  productCreateSchema,
  productSelectSchema,
  products,
  stock,
} from '~/server/db/schema'
import { paginationSchema } from '../utils'

export const productsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      productCreateSchema.omit({ createdById: true, stockId: true }).extend({
        quantity: z.number().min(0).max(1000000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newProductStock] = await ctx.db
        .insert(stock)
        .values({
          quantity: input.quantity,
        })
        .returning()

      if (!newProductStock) {
        throw new Error('Failed to create product stock')
      }

      const [newProduct] = await ctx.db
        .insert(products)
        .values({
          ...input,
          createdById: ctx.user?.id,
          stockId: newProductStock.id,
        })
        .returning()

      if (!newProduct) {
        throw new Error('Failed to create product')
      }

      return newProduct
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
          stock: true,
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
          stock: true,
        },
      })

      return response
    }),
  update: protectedProcedure
    .input(
      productSelectSchema.partial().merge(
        z.object({
          id: z.string().uuid(),
          quantity: z.number().min(0).max(1000000),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...values } = input

      const [newProduct] = await ctx.db
        .update(products)
        .set({ ...values, modifiedById: ctx.user?.id })
        .where(eq(products.id, id))
        .returning()

      if (!newProduct) {
        throw new Error('Failed to update product')
      }

      if (input.quantity) {
        await ctx.db.update(stock).set({
          id: newProduct.stockId,
          quantity: input.quantity,
        })
      }

      return newProduct
    }),

  updateProductStock: protectedProcedure
    .input(
      z.object({
        stockId: z.string().uuid(),
        quantity: z.number().min(0).max(1000000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { stockId, quantity } = input
      return ctx.db.update(stock).set({ quantity }).where(eq(stock.id, stockId))
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      return ctx.db.delete(products).where(eq(products.id, id))
    }),
})
