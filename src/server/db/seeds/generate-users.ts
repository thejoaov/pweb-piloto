import { Buffer } from 'node:buffer'
import { writeFile } from 'node:fs'
import { faker } from '@faker-js/faker'
import { createClient } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'
import type { z } from 'zod'
import { env } from '~/env'
import { db } from '..'
import {
  UserRoles,
  productCreateSchema,
  products,
  stock,
  users,
} from '../schema'

const USER_COUNT = 20
const PRODUCTS_BY_USER = 5

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const adminAuthClient = supabase.auth.admin

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const log = (title: string, data?: any) => {
  return console.log(
    `>>> ${title}`,
    data ? `\n: ${JSON.stringify(data, null, 2)}` : '',
  )
}

const createAdminUser = async () => {
  log('Creating admin user')
  const { data, error } = await adminAuthClient.createUser({
    email: 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      name: 'Admin',
    },
  })

  if (error?.code === 'email_exists') {
    log('Admin user already exists, skipping')
    return
  }

  if (!data.user || error) {
    log('Failed to create user', error)
    throw new Error('Failed to create supabase user')
  }
  // Wait 2 seconds to ensure the user is created
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const user = await db.query.users.findFirst({
    where: eq(users.email, data.user.email as string),
  })

  if (!user) {
    log('Failed to find user in db', data.user)
    throw new Error('Failed to find user in db')
  }

  await db
    .update(users)
    .set({ role: UserRoles.ADMIN })
    .where(eq(users.id, user.id))

  log('Admin user created')
  return data.user
}

const createUsers = async () => {
  log('Creating users')
  const usersCreated = []

  for (let i = 0; i < USER_COUNT; i++) {
    const userPassword = faker.internet.password()
    const userEmail = faker.internet.email()
    const name = faker.person.fullName()
    const user = await adminAuthClient.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        name,
      },
    })
    usersCreated.push({
      ...user.data,
      email: userEmail,
      password: userPassword,
      name,
    })
  }

  const data = new Uint8Array(
    Buffer.from(JSON.stringify(usersCreated, null, 2)),
  )

  log('Writing users to users.json')
  writeFile('./users.json', data, (err) => {
    if (err) {
      log('Failed to write users to file', err)
    }
  })

  // Wait 10 seconds to ensure all users are created by the trigger
  log('Waiting 20 seconds to ensure all users are created by the auth trigger')
  await new Promise((resolve) => setTimeout(resolve, 10000))

  const usersCreatedInDb = await db.query.users.findMany()

  if (usersCreatedInDb.length === 1 /** Meaning that we only have admin */) {
    log('Failed to create users', { usersCreatedInDb })
    throw new Error('Failed to create users')
  }

  log('Users created')
}

const createProducts = async () => {
  log('Creating products')

  const users = await db.query.users.findMany()

  log('Users count', users.length)

  if (users.length <= 1) {
    log('Failed to find users')
    throw new Error('Failed to find users')
  }

  for (const user of users) {
    const [productStock] = await db
      .insert(stock)
      .values({
        quantity: faker.number.int({
          min: 1,
          max: 100,
        }),
      })
      .returning()

    if (!productStock) {
      log('Failed to create stock')
      throw new Error('Failed to create stock')
    }

    const newProduct = await db
      .insert(products)
      .values(
        Array.from({ length: PRODUCTS_BY_USER }).map(() => ({
          name: faker.commerce.productName(),
          createdById: user.id,
          stockId: productStock.id,
          price: faker.number.float({
            min: 1,
            max: 1000,
            fractionDigits: 2,
          }),
          imageBase64: faker.image.dataUri({
            width: 200,
            height: 200,
            type: 'svg-base64',
          }),
        })),
      )
      .returning()

    if (!newProduct) {
      log('Failed to create product')
      throw new Error('Failed to create product')
    }
  }

  const productsCreated = await db.query.products.findMany()
  log('Products created', productsCreated)
}

async function main() {
  log('Starting seed script')

  await createAdminUser()
  await createUsers()
  await createProducts()

  process.exit(0)
}

await main()
