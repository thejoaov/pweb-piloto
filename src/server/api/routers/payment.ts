import { paymentCreateSchema, payments } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const paymentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(paymentCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .insert(payments)
        .values({
          ...input,
        })
        .returning()

      if (!result) {
        throw new Error('Payment not created')
      }

      return result
    }),
})
