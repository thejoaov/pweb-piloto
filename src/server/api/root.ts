import { authRouter } from '~/server/api/routers/auth'
import { productsRouter } from '~/server/api/routers/product'
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'
import { dashboardRouter } from './routers/dashboard'
import { ordersRouter } from './routers/orders'
import { usersRouter } from './routers/users'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  products: productsRouter,
  users: usersRouter,
  orders: ordersRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
