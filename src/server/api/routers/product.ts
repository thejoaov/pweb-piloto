import { z } from 'zod'

import { TRPCError } from '@trpc/server'
import { and, asc, count, desc, eq, gt, sql } from 'drizzle-orm'
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

  getTable: protectedProcedure
    .input(
      z.object({
        pageIndex: z.number().int().default(0),
        pageSize: z.number().int().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const data = await ctx.db.query.products.findMany({
        offset: input.pageIndex * input.pageSize,
        limit: input.pageSize,
        orderBy: asc(products.name),
        with: {
          createdBy: true,
          modifiedBy: true,
          stock: true,
        },
      })

      const [rowCount = { count: 0 }] = await ctx.db
        .select({ count: count() })
        .from(products)

      return {
        rows: data,
        pageCount: Math.ceil(rowCount.count / input.pageSize),
        rowCount: rowCount.count,
      }
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
      const { id, quantity, ...values } = input

      const [newProduct] = await ctx.db
        .update(products)
        .set({ ...values, modifiedById: ctx.user?.id })
        .where(eq(products.id, id))
        .returning()

      if (!newProduct) {
        throw new Error('Failed to update product')
      }

      const prevStock = await ctx.db.query.stock.findFirst({
        where: eq(stock.id, newProduct.stockId),
      })

      if (!prevStock) {
        throw new Error('Failed to find product stock')
      }

      if (input.quantity !== prevStock.quantity) {
        await ctx.db.update(stock).set({
          id: prevStock.id,
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
