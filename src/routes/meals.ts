import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'

export async function mealsRoutes(app: FastifyInstance){
    app.addHook('preHandler', async (request, reply) => {
        console.log(`[${request.method}] ${request.url}`)

    })

    // lista todas as refeições de um usuário
    app.get('/', 
    {
        preHandler: [checkUserIdExists]
    },
    async(request, reply) => {

        const userId = request.cookies.sessionId

        const meals = await knex('meals').where('user_id', userId).select('*')

        return { meals }
    })

    // busca refeição pelo id
    app.get('/:id', 
    {
        preHandler: [checkUserIdExists]
    },
    async (request) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        })
        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where('id', id).first()

        return { meal }

    })    

    // adiciona uma refeição
    app.post('/', async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            included: z.boolean()
        })

        const { name, description, included } = createMealBodySchema.parse(request.body)

        let userId = request.cookies.sessionId
        console.log(userId)

        if (!userId){
            userId = randomUUID()

            reply.cookie('sessionId', userId,{
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7 //7 dias
            })
        }
        
        await knex('meals')
        .insert({
            id: randomUUID(),
            name,
            description,
            included,
            user_id: userId
        })
        
        return reply.status(201).send()
    })
    
    //alterar todos os dados de uma refeição
    app.put('/:id',
    {
        preHandler: [checkUserIdExists]
    },
    async (request, reply) =>{
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        })

        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            included: z.boolean()
        })

        const { id } = getMealParamsSchema.parse(request.params)
        
        const { name, description, included } = createMealBodySchema.parse(request.body)

        await knex('meals')
        .update({
            name,
            description,
            included
        })
        .where('id', id)

        return reply.status(201).send()
})







    // remove uma refeição
    app.delete('/:id',
    {
        preHandler: [checkUserIdExists]
    },
    async (request, reply) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where('id', id).del()

        console.log('MEAL: ')
        console.log(meal)

        return reply.status(201).send()
    })

}


