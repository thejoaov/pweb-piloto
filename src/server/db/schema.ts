import { relations, sql } from 'drizzle-orm'
import {
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `piloto_${name}`)

export const enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
}

export const userRoles = pgEnum('user_roles', [UserRoles.ADMIN, UserRoles.USER])

export const users = createTable('users', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  image: text('image'),
  role: userRoles('role').notNull().default(UserRoles.USER),
  birthDate: text('birth_date'),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => sql`now()`,
  ),
})

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  products: many(products),
}))

export const products = createTable('product', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  price: doublePrecision('price').notNull(),
  imageBase64: text('image_base64'),
  createdById: uuid('created_by')
    .notNull()
    .references(() => users.id),
  modifiedById: uuid('modified_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => sql`now()`,
  ),
})

export const productsRelations = relations(products, ({ many, one }) => ({
  orders: many(orderItems),
  modifiedBy: one(users, {
    fields: [products.modifiedById],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [products.createdById],
    references: [users.id],
  }),
  stock: one(stock),
}))

export const stock = createTable('stock', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quantity: integer('quantity').notNull(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => sql`now()`,
  ),
})

export const stockRelations = relations(stock, ({ one }) => ({
  product: one(products, {
    fields: [stock.productId],
    references: [products.id],
  }),
}))

export const orderStatus = pgEnum('order_status', [
  'new',
  'in_progress',
  'completed',
  'cancelled',
])

export const enum OrderItemStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const orders = createTable('order', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  total: doublePrecision('total').notNull(),
  status: orderStatus('status').notNull().default('new'),
  userId: uuid('user_id').references(() => users.id),
  modifiedById: uuid('modified_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => sql`now()`,
  ),
})

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  modifiedBy: one(users, {
    fields: [orders.modifiedById],
    references: [users.id],
  }),
}))

export const orderItems = createTable('order_item', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => sql`now()`,
  ),
})

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

export const paymentMethods = pgEnum('payment_methods', [
  'cash',
  'card',
  'debit',
  'pix',
  'ticket',
])

export const payments = createTable('payment', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  amount: doublePrecision('amount').notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  paymentMethod: paymentMethods('payment_method').notNull(),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => sql`now()`,
  ),
})

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}))
