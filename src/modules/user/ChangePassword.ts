import { Resolver, Mutation, Arg, Ctx } from 'type-graphql'
import bcrypt from 'bcryptjs'

import { redis } from '../../redis'
import { forgotPasswordPrefix } from '../constants/redisPrefixes'
import { User } from '../../entity/User'
import { ChangePasswordInput } from './changePassword/ChangePasswordInput'
import { MyContext } from '../../types/MyContext'

@Resolver()
export class ChangePasswordResolver {
  @Mutation(() => User, { nullable: true })
  async changePassword(
    @Arg('data')
    { token, password }: ChangePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    // Check redis for userId
    const userId = await redis.get(forgotPasswordPrefix + token)

    if (!userId) {
      return null
    }

    // Search for user
    const user = await User.findOne(userId)

    if (!user) {
      return null
    }

    // Delete token from redis
    await redis.del(forgotPasswordPrefix + token)

    // Update user password
    user.password = await bcrypt.hash(password, 12)

    // Save user
    await user.save()

    // Log in user after updating password
    ctx.req.session!.userId = user.id

    return user
  }
}
