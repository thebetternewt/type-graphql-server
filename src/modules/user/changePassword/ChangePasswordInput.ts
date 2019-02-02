import { InputType, Field } from 'type-graphql'
import { PasswordMixin } from '../../shared/PasswordInput'

@InputType()
export class ChangePasswordInput extends PasswordMixin(class {}) {
  @Field()
  token: string
}
