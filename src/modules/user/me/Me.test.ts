import { Connection } from 'typeorm'
import faker from 'faker'

import { testConn } from '../../../test-utils/testConn'
import { gCall } from '../../../test-utils/gCall'
import { User } from '../../../entity/User'

let conn: Connection
beforeAll(async () => {
  conn = await testConn()
})

afterAll(async () => {
  await conn.close()
})

const meQuery = `
  {
    me {
      id
      firstName
      lastName
      name
      email
    }
  }
`

describe('Me', () => {
  it('gets user', async () => {
    const user = await User.create({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(), // No need to hash pw since we aren't using it
    }).save()

    const result = await gCall({
      source: meQuery,
      userId: user.id,
    })

    expect(result.data!.me).toMatchObject({
      id: `${user.id}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
  })

  it('returns null', async () => {
    const result = await gCall({
      source: meQuery,
      // No userId in context
    })

    expect(result.data!.me).toBeNull()
  })
})
