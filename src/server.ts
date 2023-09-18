import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { env } from './env'
import {mealsRoutes} from './routes/meals'

const app = fastify()

app.register(cookie)


app.register(mealsRoutes, {
    prefix: 'meals'
})

app.listen({
    port: env.PORT
}).then(function () {
    console.log('HTTP Server Running')
})

