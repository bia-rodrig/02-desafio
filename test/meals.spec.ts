import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process';

import request from 'supertest';

import { app } from '../src/app'



describe('Meals routes', () =>{
    beforeAll(async () =>{
        await app.ready()
    })
    
    afterAll(async() => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })
    
    it('should be able to create a new meal', async () => {
        await request(app.server)
        .post('/meals')
        .send({
            name: 'New meal',
            description: 'kind of meal',
            included: true
        })
        .expect(201)
    })

    it('should be able to list all meals', async()=>{
        const createMealResponse = await request(app.server)
        .post('/meals')
        .send({
            name: 'New meal',
            description: 'kind of meal',
            included: true
        })

        const cookies = createMealResponse.get('Set-Cookie')

        const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

        expect (listMealsResponse.body.meals).toEqual([
            expect.objectContaining({
                name: 'New meal',
                description: 'kind of meal',
                included: 1
            })
        ])
    })

    it('should be able to get a specific meal', async() => {
        const createMealResponse = await request(app.server)
        .post('/meals')
        .send({
            name: 'New meal',
            description: 'kind of meal',
            included: true
        })

        const cookies = createMealResponse.get('Set-Cookie')

        const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

        const mealId = listMealsResponse.body.meals[0].id

        const getMealResponse = await request(app.server)
        .get(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .expect(200)

        expect(getMealResponse.body.meal).toEqual(
            expect.objectContaining({
                name: 'New meal',
                description: 'kind of meal',
                included: 1
            })
        )
    })

    it ('should be able to delete a meal', async() =>{
        const createMealResponse = await request(app.server)
        .post('/meals')
        .send({
            name: 'New meal',
            description: 'kind of meal',
            included: true
        })

        const cookies = createMealResponse.get('Set-Cookie')

        const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

        const mealId = listMealsResponse.body.meals[0].id

        const getMealResponse = await request(app.server)
        .delete(`/meals/${mealId}`)
        .set('Cookie', cookies)
        .expect(201)
    })

    it ('should be able to edit a meal', async() =>{
        const createMealResponse = await request(app.server)
        .post('/meals')
        .send({
            name: 'New meal',
            description: 'kind of meal',
            included: true
        })

        const cookies = createMealResponse.get('Set-Cookie')

        const listMealsResponse = await request(app.server)
        .get('/meals')
        .set('Cookie', cookies)
        .expect(200)

        const meal = listMealsResponse.body.meals[0]

        meal.name = 'Changed meal'
        meal.description = 'The meal kind changed'
        meal.included = false
        
        const getMealResponse = await request(app.server)
        .put(`/meals/${meal.id}`)
        .set('Cookie', cookies)
        .send(meal)
        .expect(201)        
    })

    it ('should be able to get the user metrics', async() => {
        const createMealResponse = await request(app.server)
        .post('/meals')
        .send({
            name: 'New meal',
            description: 'kind of meal',
            included: true
        })

        const cookies = createMealResponse.get('Set-Cookie')

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'New second meal',
            description: 'kind of meal 2',
            included: true
        })

        await request(app.server)
        .post('/meals')
        .set('Cookie', cookies)
        .send({
            name: 'New second meal',
            description: 'kind of meal 2',
            included: false
        })

        const metricResponse = await request(app.server)
        .get('/meals/metric')
        .set('Cookie', cookies)
        .expect(200)

        expect(metricResponse.body.metric).toEqual(
            expect.objectContaining({            
                totalMeals: "3",
                included: "2",
                notIncluded: "1",
                bestIncludedSequence: "2"
            })
        )
        
    })

})