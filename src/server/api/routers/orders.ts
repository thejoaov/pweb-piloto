import { TRPCError } from '@trpc/server'
import { asc, count, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import {
  OrderItemStatus,
  orderCreateSchema,
  orderItems,
  orders,
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
          client: true,
          user: true,
          items: true,
        },
      })

      return ordersList
    }),

  getTable: protectedProcedure
    .input(
      z.object({
        pageIndex: z.number().int().default(0),
        pageSize: z.number().int().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const data = await ctx.db.query.orders.findMany({
        offset: input.pageIndex * input.pageSize,
        limit: input.pageSize,
        orderBy: desc(orders.createdAt),
        with: {
          user: true,
          modifiedBy: true,
          orderItems: true,
          client: true,
          items: {
            with: {
              product: {
                with: {
                  stock: true,
                },
              },
            },
          },
        },
      })

      const [rowCount = { count: 0 }] = await ctx.db
        .select({ count: count() })
        .from(orders)

      return {
        rows: data,
        pageCount: Math.ceil(rowCount.count / input.pageSize),
        rowCount: rowCount.count,
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.id),
        with: {
          modifiedBy: true,
          user: true,
          client: true,
          items: {
            with: {
              product: true,
            },
          },
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
        items: z.array(
          z.object({
            productId: z.string().uuid(),
            quantity: z.number().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [order] = await ctx.db
        .insert(orders)
        .values({
          ...input,
          userId: ctx.user?.id,
          status: OrderItemStatus.NEW,
        })
        .returning()

      if (!order) {
        throw new Error('Order not created')
      }

      if (input.items?.length) {
        await ctx.db.insert(orderItems).values(
          input.items.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
          })),
        )
      }

      return order
    }),

  update: protectedProcedure
    .input(
      orderCreateSchema.partial().extend({
        items: z
          .array(
            z.object({
              productId: z.string().uuid(),
              quantity: z.number().min(1),
            }),
          )
          .optional(),
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
        await ctx.db.insert(orderItems).values(
          items.map((item) => ({
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
          })),
        )
        // .onConflictDoUpdate({
        //   target: orderItems.orderId,
        //   set: {
        //     quantity: sql`${orderItems.quantity} + ${items.map((item) => item.quantity)}`,
        //   },
        // })
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

  advanceStatus: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input: id, ctx }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, id),
        with: {
          items: {
            with: {
              product: {
                with: {
                  stock: true,
                },
              },
            },
          },
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      let nextStatus: OrderItemStatus = OrderItemStatus.NEW

      switch (order.status) {
        case OrderItemStatus.NEW:
          nextStatus = OrderItemStatus.WAITING_PAYMENT
          break
        case OrderItemStatus.WAITING_PAYMENT:
          nextStatus = OrderItemStatus.IN_PROGRESS
          break
        case OrderItemStatus.IN_PROGRESS:
          nextStatus = OrderItemStatus.COMPLETED
          break
        default:
          nextStatus = OrderItemStatus.CANCELLED
      }

      if (nextStatus === OrderItemStatus.COMPLETED) {
        await ctx.db.transaction(async (trx) => {
          for (const orderItem of order.items) {
            await trx
              .update(stock)
              .set({
                quantity: orderItem.product.stock.quantity - orderItem.quantity,
              })
              .where(eq(stock.id, orderItem.product.stockId))
          }
        })
      }

      const [updatedOrder] = await ctx.db
        .update(orders)
        .set({
          status: nextStatus,
        })
        .where(eq(orders.id, id))
        .returning()

      if (!updatedOrder) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Order not updated',
        })
      }

      return updatedOrder
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
