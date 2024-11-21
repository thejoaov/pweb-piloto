'use server'

import { z } from 'zod'
import { action } from '~/lib/safe-action'
import { api } from '~/trpc/server'

export const createProduct = action(
  z.object({
    name: z.string(),
    price: z.number(),
  }),
  async (data) => {
    await api.products.create({
      name: data.name,
      price: data.price,
    })
  },
)
