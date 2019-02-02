import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import Express from 'express'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { createConnection } from 'typeorm'
import { formatArgumentValidationError } from 'type-graphql'
import cors from 'cors'

import { redis } from './redis'
import { createSchema } from './utils/createSchema'
import { validationRules } from './utils/validationRules'

const PORT = 4000
const SESSION_SECRET = process.env.SESSION_SECRET || 'mysecret!$%?'

const main = async () => {
  await createConnection() // Reads from ormconfig.json

  const schema = await createSchema()

  const apolloServer = new ApolloServer({
    schema,
    formatError: formatArgumentValidationError,
    context: ({ req, res }: any) => ({ req, res }),
    validationRules,
  })

  const app = Express()

  const RedisStore = connectRedis(session)

  app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:3000',
    })
  )

  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: 'sid',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 2, // 2 hrs
      },
    })
  )

  apolloServer.applyMiddleware({ app })

  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}/graphql ...`)
  })
}

main()
