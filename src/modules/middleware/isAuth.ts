import { MiddlewareFn } from 'type-graphql'
import { AuthenticationError } from 'apollo-server-express'

import { MyContext } from '../../types/MyContext'

export const isAuth: MiddlewareFn<MyContext> = async (
  { context: { req } },
  next
) => {
  if (!req.session!.userId) {
    throw new AuthenticationError('You are not authenticated!')
  }

  return next()
}
