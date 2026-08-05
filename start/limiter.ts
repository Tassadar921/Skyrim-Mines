/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main';

export const throttle = limiter.define('global', () => {
    return limiter.allowRequests(10).every('1 minute');
});

export const discordAuthThrottle = limiter.define('discord_auth', (ctx) => {
    return limiter.allowRequests(10).every('15 minutes').usingKey(`discord_auth_${ctx.request.ip()}`);
});
