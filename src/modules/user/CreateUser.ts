import {
  Resolver,
  Arg,
  Mutation,
  ClassType,
  InputType,
  Field,
  UseMiddleware,
} from 'type-graphql'
import { Middleware } from 'type-graphql/interfaces/Middleware'

import { User } from '../../entity/User'
import { Product } from '../../entity/Product'
import { RegisterInput } from './register/RegisterInput'
import { isAuth } from '../middleware/isAuth'

function createResolver<T extends ClassType, X extends ClassType>(
  suffix: string,
  returnType: T,
  inputType: X,
  entity: any,
  middleware?: Middleware<any>[]
) {
  @Resolver()
  class BaseResolver {
    @Mutation(() => returnType, { name: `create${suffix}` })
    @UseMiddleware(...(middleware || []))
    async create(@Arg('data', () => inputType) data: any) {
      return entity.create(data).save()
    }
  }

  return BaseResolver
}

@InputType()
class ProductInput {
  @Field()
  name: string

  @Field()
  price: number
}

export const CreateUserResolver = createResolver(
  'User',
  User,
  RegisterInput,
  User
)
export const CreateProductResolver = createResolver(
  'Product',
  Product,
  ProductInput,
  Product,
  [isAuth]
)
