import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  perPage: z.number().int().positive().optional().default(10),
  orderBy: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export interface Paginator {
  perPage: number
  currentPage: number
  firstPage: number
  lastPage: number
  total: number
  hasMorePages: boolean
  hasPages: boolean
}

export interface PaginatedResponse<T> {
  meta: Paginator
  data: T[]
}
