import { relations, sql } from 'drizzle-orm'
import {
  date,
  doublePrecision,
  foreignKey,
  integer,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `cadweb_${name}`)

export const enum UserRoles {
  ADMIN = 'admin',
  USER = 'user',
}

export const userRoles = pgEnum('user_roles', [UserRoles.ADMIN, UserRoles.USER])

export const users = createTable(
  'users',
  {
    id: uuid('id').primaryKey().notNull(),
    name: text('name'),
    email: text('email').unique(),
    image: text('image'),
    cpf: text('cpf').unique(),
    role: userRoles('role').notNull().default(UserRoles.USER),
    birthDate: text('birth_date'),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      // reference to the auth table from Supabase
      foreignColumns: [authUsers.id],
      name: 'users_id_fk',
    }).onDelete('cascade'),
  ],
)

export const userCreateSchema = createInsertSchema(users)
export const userSelectSchema = createSelectSchema(users)

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  products: many(products),
}))

export const products = createTable('product', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  price: doublePrecision('price').notNull(),
  imageBase64: text('image_base64'),
  createdById: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'set null' }),
  stockId: uuid('stock_id')
    .notNull()
    .references(() => stock.id, { onDelete: 'cascade' }),
  modifiedById: uuid('modified_by_id').references(() => users.id),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => new Date(),
  ),
})

export const productCreateSchema = createInsertSchema(products)
export const productSelectSchema = createSelectSchema(products)

export const productsRelations = relations(products, ({ one }) => ({
  modifiedBy: one(users, {
    fields: [products.modifiedById],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [products.createdById],
    references: [users.id],
  }),
  stock: one(stock, { fields: [products.stockId], references: [stock.id] }),
}))

export const stock = createTable('stock', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => new Date(),
  ),
})

// export const stockRelations = relations(stock, ({ one }) => ({
//   product: one(products, {
//     fields: [stock.id],
//     references: [products.stockId],
//   }),
// }))

export const stockCreateSchema = createInsertSchema(stock)
export const stockSelectSchema = createSelectSchema(stock)

export const enum OrderItemStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const orderStatus = pgEnum('order_status', [
  OrderItemStatus.NEW,
  OrderItemStatus.IN_PROGRESS,
  OrderItemStatus.COMPLETED,
  OrderItemStatus.CANCELLED,
])

export const orders = createTable('order', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  total: doublePrecision('total').notNull(),
  status: orderStatus('status').notNull().default(OrderItemStatus.NEW),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  modifiedById: uuid('modified_by_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => new Date(),
  ),
})

export const orderCreateSchema = createInsertSchema(orders)
export const orderSelectSchema = createSelectSchema(orders)

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  orderItems: many(orderItems),
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
    () => new Date(),
  ),
})

export const orderItemCreateSchema = createInsertSchema(orderItems)
export const orderItemSelectSchema = createSelectSchema(orderItems)

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

export const enum PaymentMethods {
  CASH = 'cash',
  CARD = 'card',
  DEBIT = 'debit',
  PIX = 'pix',
  TICKET = 'ticket',
}

export const paymentMethods = pgEnum('payment_methods', [
  PaymentMethods.CASH,
  PaymentMethods.CARD,
  PaymentMethods.DEBIT,
  PaymentMethods.PIX,
  PaymentMethods.TICKET,
])

export const payments = createTable('payment', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  amount: doublePrecision('amount').notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  paymentMethod: paymentMethods('payment_method').notNull(),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 }).$onUpdate(
    () => new Date(),
  ),
})

export const paymentCreateSchema = createInsertSchema(payments)
export const paymentSelectSchema = createSelectSchema(payments)

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}))
