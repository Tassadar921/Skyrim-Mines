/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env';

export default await Env.create(new URL('../', import.meta.url), {
    // Node
    TZ: Env.schema.string(),
    NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
    PORT: Env.schema.number(),
    HOST: Env.schema.string({ format: 'host' }),

    // App
    LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
    APP_KEY: Env.schema.secret(),
    APP_URL: Env.schema.string(),
    SITE_EDITOR_NAME: Env.schema.string(),

    // Session
    SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

    /*
|----------------------------------------------------------
| Variables for configuring database connection
|----------------------------------------------------------
*/
    DB_CONNECTION: Env.schema.enum(['pg', 'mysql']),

    /*
|----------------------------------------------------------
| Variables for configuring main app database
|----------------------------------------------------------
*/
    DB_HOST: Env.schema.string({ format: 'host' }),
    DB_PORT: Env.schema.number(),
    DB_USER: Env.schema.string(),
    DB_PASSWORD: Env.schema.string.optional(),
    DB_DATABASE: Env.schema.string(),

    /*
|----------------------------------------------------------
| Variables for configuring redis package
|----------------------------------------------------------
*/
    REDIS_HOST: Env.schema.string({ format: 'host' }),
    REDIS_PORT: Env.schema.number(),
    REDIS_PASSWORD: Env.schema.string.optional(),

    /*
|----------------------------------------------------------
| Variables for API keys
|----------------------------------------------------------
*/
    BREVO_API_KEY: Env.schema.string(),

    ADMIN_SENDER_EMAIL: Env.schema.string(),
    NOREPLY_SENDER_EMAIL: Env.schema.string(),
    ADMIN_EMAIL: Env.schema.string(),

    /*
  |----------------------------------------------------------
  | Variables for configuring the limiter package
  |----------------------------------------------------------
  */
    LIMITER_STORE: Env.schema.enum(['redis', 'memory'] as const),
});
