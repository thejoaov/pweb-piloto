import { relations, sql } from 'drizzle-orm'
import {
  doublePrecision,
  integer,
  pgTableCreator,
  text,
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

// const authSchema = pgSchema('auth')
// export const authUsers = authSchema.table('users', {
//   id: uuid('id').primaryKey(),
// })

export const users = createTable('users', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  image: text('image'),
  createdAt: text('created_at').notNull().default(sql`now()`),
  updatedAt: text('updated_at').notNull().default(sql`now()`),
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
  createdById: uuid('created_by')
    .notNull()
    .references(() => users.id),
  modifiedById: uuid('modified_by_id').references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`now()`),
  updatedAt: text('updated_at').notNull().default(sql`now()`),
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
}))

export const orders = createTable('order', {
  id: uuid('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  total: doublePrecision('total').notNull(),
  status: varchar('status', { length: 255 }).default('pending'),
  userId: uuid('user_id').references(() => users.id),
  modifiedById: uuid('modified_by_id').references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`now()`),
  updatedAt: text('updated_at').notNull().default(sql`now()`),
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
  createdAt: text('created_at').notNull().default(sql`now()`),
  updatedAt: text('updated_at').notNull().default(sql`now()`),
})

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))
