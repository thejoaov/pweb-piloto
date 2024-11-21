import { count } from 'drizzle-orm'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { orders, products, users } from '~/server/db/schema'

export const dashboardRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const usersCountPromise = ctx.db.select({ value: count() }).from(users)
    const productsCountPromise = ctx.db
      .select({ value: count() })
      .from(products)
    const ordersCountPromise = ctx.db.select({ value: count() }).from(orders)

    const [[usersCount], [productsCount], [ordersCount]] = await Promise.all([
      usersCountPromise,
      productsCountPromise,
      ordersCountPromise,
    ])

    return {
      usersCount: usersCount?.value || 0,
      productsCount: productsCount?.value || 0,
      ordersCount: ordersCount?.value || 0,
    }
  }),
})
