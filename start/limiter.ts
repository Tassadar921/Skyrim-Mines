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

export const loginThrottle = limiter.define('login', (ctx) => {
    return limiter.allowRequests(10).every('15 minutes').usingKey(`login_${ctx.request.ip()}`);
});

export const loginEmailThrottle = limiter.define('login_email', (ctx) => {
    const email = (ctx.request.input('email') as string | undefined)?.toLowerCase().trim();
    return limiter
        .allowRequests(5)
        .every('15 minutes')
        .usingKey(email ? `login_email_${email}` : `login_ip_${ctx.request.ip()}`);
});

export const registerThrottle = limiter.define('register', (ctx) => {
    return limiter.allowRequests(3).every('1 hour').usingKey(`register_${ctx.request.ip()}`);
});

export const forgotPasswordThrottle = limiter.define('forgot_password', (ctx) => {
    return limiter.allowRequests(5).every('15 minutes').usingKey(`forgot_password_${ctx.request.ip()}`);
});

export const passwordResetThrottle = limiter.define('password_reset', (ctx) => {
    const token = ctx.request.qs().token as string | undefined;
    return limiter
        .allowRequests(5)
        .every('15 minutes')
        .usingKey(token ? `password_reset_token_${token}` : `password_reset_ip_${ctx.request.ip()}`);
});
