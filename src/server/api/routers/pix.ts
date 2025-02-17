import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { pixTransactionCreateSchema, pixTransactions } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const pixRouter = createTRPCRouter({
  simulatePixPayment: publicProcedure
    .input(pixTransactionCreateSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.db.insert(pixTransactions).values({
        ...input,
      })
    }),

  getByTransactionId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const [pixTransaction] = await ctx.db
        .select()
        .from(pixTransactions)
        .where(eq(pixTransactions.transactionId, input))

      if (!pixTransaction) {
        return null
      }

      return pixTransaction
    }),

  deleteByTransactionId: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .delete(pixTransactions)
        .where(eq(pixTransactions.transactionId, input))
    }),
})
