import { app } from './app';
import { env } from './env';

app.listen({
    port: env.PORT
}). then(function() {
    host: '0.0.0.0'
    console.log('HTTP Server Running')
})
