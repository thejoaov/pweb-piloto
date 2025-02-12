import { asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { OrderItemStatus, orderItems, orders } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { paginationSchema } from '../utils'

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
})

const createOrderSchema = z.object({
  total: z.number().nonnegative(),
  status: z.enum([
    OrderItemStatus.NEW,
    OrderItemStatus.IN_PROGRESS,
    OrderItemStatus.COMPLETED,
    OrderItemStatus.CANCELLED,
  ]),
  userId: z.string().uuid(),
  items: z.array(orderItemSchema),
})

const updateOrderSchema = createOrderSchema.partial().extend({
  id: z.string().uuid(),
})

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
          items: {
            with: {
              product: true,
            },
          },
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
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      const { items, ...orderData } = input

      const [createdOrder] = await ctx.db
        .insert(orders)
        .values({ ...orderData, userId: ctx.user?.id })
        .returning()

      await ctx.db.insert(orderItems).values(
        items.map((item) => ({
          orderId: createdOrder?.id as string,
          productId: item.productId,
          quantity: item.quantity,
        })),
      )

      return createdOrder
    }),

  update: protectedProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, items, ...orderData } = input

      await ctx.db
        .update(orders)
        .set({ ...orderData, modifiedById: ctx.user?.id })
        .where(eq(orders.id, id))

      // Insert new order items
      if (items?.length) {
        await ctx.db.insert(orderItems).values(
          items.map((item) => ({
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
          })),
        )
      }

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
