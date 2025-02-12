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

async function main() {
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

  // ######## ADMIMN USER ########
  // const { data, error } = await adminAuthClient.createUser({
  //   email: 'jvictorsantos852@gmail.com',
  //   password: '',
  //   email_confirm: true,
  //   user_metadata: {
  //     name: 'Joao Victor',
  //   },
  // })

  // if (!data.user || error) {
  //   console.error('Failed to create user:', error)
  //   throw new Error('Failed to create supabase user')
  // }

  // // Wait 2 seconds to ensure the user is created
  // await new Promise((resolve) => setTimeout(resolve, 2000))

  // const user = await db.query.users.findFirst({
  //   where: eq(users.id, data.user.id),
  // })

  // if (!user) {
  //   throw new Error('Failed to create user')
  // }

  // console.log('User created:', user)

  // // Update to admin role
  // const adminUser = await db
  //   .update(users)
  //   .set({ role: UserRoles.ADMIN })
  //   .where(eq(users.id, user.id))
  //   .returning()
  // console.log('User updated to admin:', adminUser)
}

main()
