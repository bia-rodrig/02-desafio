import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'

import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'
//import {format} from 'date-fns'

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
            included: z.boolean(),
        })

        const { id } = getMealParamsSchema.parse(request.params)
        
        const { name, description, included } = createMealBodySchema.parse(request.body)

        //const currentDate = new Date();
        //const formattedDate = format(currentDate, 'dd-MM-yy HH:mm:ss');

        await knex('meals')
        .update({
            name,
            description,
            included,
            updated_at: knex.fn.now()
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

        return reply.status(201).send()
    })

    //pega a metrica do usuário
    app.get('/metric', 
    {
        preHandler: [checkUserIdExists]
    },
    async(request) =>{
        const userId = request.cookies.sessionId

        const allMeals = await knex('meals').where('user_id', userId)

        const totalMeals = allMeals.length;
        console.log(`Total meals: ${totalMeals}`)

        let includedCount = 0;
        let notIncludedCount = 0;
        let includedBestSequence = 0;
        let temp_Sequence = 0;

        allMeals.forEach(meal => {
            
            if(meal.included === 1 as unknown as boolean){
                includedCount++;
                temp_Sequence++;
                if (temp_Sequence > includedBestSequence){
                    includedBestSequence = temp_Sequence
                }
            }
            else{
                notIncludedCount++;
                temp_Sequence = 0;
            }
        })

        const metric = {
            "Total Meals": `${totalMeals}`,
            "Included": `${includedCount}`,
            "Not included": `${notIncludedCount}`,
            "Best included sequence": `${includedBestSequence}`
        }
        
        return { metric }

    })

}


