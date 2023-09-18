import { Knex } from 'knex'

declare module 'knex/types/tables'{
    export interface Tables{
        meals: {
            id: string,
            name: string,
            description: string,
            created_at: string,
            included: boolean,
            user_id?: string
        }
    }
}