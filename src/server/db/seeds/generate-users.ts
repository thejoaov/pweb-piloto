import { writeFile } from 'node:fs/promises'
import { faker } from '@faker-js/faker'
import { createClient } from '@supabase/supabase-js'
import { eq } from 'drizzle-orm'
import { env } from '~/env'
import { db } from '..'
import { UserRoles, users } from '../schema'

const USER_COUNT = 20

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const adminAuthClient = supabase.auth.admin

const createAdminUser = async () => {
  const { data, error } = await adminAuthClient.createUser({
    email: 'jvictorsantos852@gmail.com',
    password: process.env.ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      name: 'Joao Victor',
    },
  })
  if (!data.user || error) {
    console.error('Failed to create user:', error)
    throw new Error('Failed to create supabase user')
  }
  // Wait 2 seconds to ensure the user is created
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const user = await db.query.users.findFirst({
    where: eq(users.email, data.user.email as string),
  })

  if (!user) {
    throw new Error('Failed to create user')
  }
  await db
    .update(users)
    .set({ role: UserRoles.ADMIN })
    .where(eq(users.id, user.id))

  console.log('Admin user created:', data.user)
}

const createUsers = async () => {
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

  await writeFile('./users.json', JSON.stringify(usersCreated, null, 2))
  console.log('Users created:', usersCreated)
}

async function main() {
  await Promise.all([createAdminUser(), createUsers()])
}

main()
