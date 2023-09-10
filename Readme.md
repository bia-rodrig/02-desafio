# Desafio 02
## Passo a Passo
* ```npm init -y```
* ```npm i -D typescript```
* ```npx tsc --init```
* tsconfig.json: "target": "es2020"
* ```npm install fastify```
* ```npm install -D @types/node```
* ```npm install tsx -D``` -> converede TS para JS automaticamente
* script package.json -> ```"dev": "tsx watch src/server.ts"```
* instalar eslint -> ```npm i eslint @rocketseat/eslint-config -D```
* src/.eslintrc.json
    ```
    {
        "extends": [
            "@rocketseat/eslint-config/node"
        ],
        "rules": {
            "prettier/prettier": "off"
        }
    }
    ```

* script package.json -> ```"lint": "eslint src --ext .ts --fix"```
* npm install knex
* npm install sqlite3
* script package.json -> ```"knex": "node --no-warnings --loader tsx ./node_modules/knex/bin/cli.js"```
* criar migration: ```npm run knex -- migrate:make nome-da-migration```
* rodar migration: ```npm run knex -- migrate:latest```
* retornar migration: ```npm run knex -- migrate:rollback```
