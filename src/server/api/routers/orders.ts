import { asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'
import {
  OrderItemStatus,
  orderCreateSchema,
  orderItemCreateSchema,
  orderItems,
  orderSelectSchema,
  orders,
  productSelectSchema,
  products,
  stock,
} from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { paginationSchema } from '../utils'

export const ordersRouter = createTRPCRouter({
  getList: protectedProcedure
    .input(
      paginationSchema.extend({
        orderBy: z
          .enum(['total', 'status', 'createdAt'])
          .default('createdAt')
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const {
        order = 'desc',
        orderBy = 'createdAt',
        page = 1,
        perPage = 10,
      } = input
      const offset = (page - 1) * perPage

      const ordersList = await ctx.db.query.orders.findMany({
        // where: eq(orders.userId, ctx.user?.id),
        offset,
        limit: perPage,
        orderBy: order === 'asc' ? asc(orders[orderBy]) : desc(orders[orderBy]),
        with: {
          modifiedBy: true,
          user: true,
          items: true,
        },
      })

      return ordersList
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.id),
        with: {
          modifiedBy: true,
          items: true,
        },
      })

      if (!order) {
        throw new Error('Order not found')
      }

      return order
    }),

  create: protectedProcedure
    .input(
      orderCreateSchema.extend({
        items: z.array(productSelectSchema),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db
        .insert(orders)
        .values({
          ...input,
          userId: ctx.user?.id,
        })
        .returning()

      if (!order) {
        throw new Error('Order not created')
      }

      return order
    }),

  update: protectedProcedure
    .input(
      orderCreateSchema.extend({
        items: z.array(orderItemCreateSchema),
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, items, ...orderData } = input

      const getOrderItems = await ctx.db.query.orderItems.findMany({
        where: eq(orderItems.orderId, id),
        with: {
          product: {
            with: {
              stock: true,
            },
          },
        },
      })

      if (items?.length) {
        await ctx.db
          .insert(orderItems)
          .values(
            items.map((item) => ({
              orderId: id,
              productId: item.productId,
              quantity: item.quantity,
            })),
          )
          .onConflictDoUpdate({
            target: orderItems.orderId,
            set: {
              quantity: sql`${orderItems.quantity} + ${items.map((item) => item.quantity)}`,
            },
          })
      }

      if (orderData.status === OrderItemStatus.CANCELLED) {
        await ctx.db.transaction(async (tx) => {
          for (const orderProduct of getOrderItems) {
            await tx
              .update(stock)
              .set({
                quantity:
                  orderProduct.product.stock.quantity + orderProduct.quantity,
              })
              .where(eq(stock.id, orderProduct.product.stock.id))
          }
        })
      }

      if (orderData.status === OrderItemStatus.COMPLETED) {
        await ctx.db.transaction(async (tx) => {
          for (const orderProduct of getOrderItems) {
            await tx
              .update(stock)
              .set({
                quantity:
                  orderProduct.product.stock.quantity - orderProduct.quantity,
              })
              .where(eq(stock.id, orderProduct.product.stock.id))
          }
        })
      }

      await ctx.db
        .update(orders)
        .set({ ...orderData, modifiedById: ctx.user?.id })
        .where(eq(orders.id, id))
        .returning()

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Delete order items first due to foreign key constraint
      await ctx.db.delete(orderItems).where(eq(orderItems.orderId, input.id))

      // Then delete the order
      await ctx.db.delete(orders).where(eq(orders.id, input.id))

      return { success: true }
    }),
})
