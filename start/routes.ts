import router from '@adonisjs/core/services/router';
import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';
import { loginThrottle, loginEmailThrottle, registerThrottle, forgotPasswordThrottle, passwordResetThrottle } from '#start/limiter';

router.on('/').renderInertia('home', {}).as('home');

router.get('/password-reset', [controllers.PasswordReset, 'show']).as('password.reset.show');
router.post('/password-reset', [controllers.PasswordReset, 'update']).as('password.reset.update').use(passwordResetThrottle);

router.get('/profile', [controllers.Profile, 'show']).as('profile.show').use([middleware.auth(), middleware.terms()]);
router.get('/profile/export', [controllers.Profile, 'exportData']).as('profile.export').use([middleware.auth(), middleware.terms()]);
router.put('/profile', [controllers.Profile, 'update']).as('profile.update').use([middleware.auth(), middleware.terms()]);
router.post('/profile/password-reset', [controllers.Profile, 'sendPasswordReset']).as('profile.passwordReset').use([middleware.auth(), middleware.terms()]);
router.delete('/profile', [controllers.Profile, 'destroy']).as('profile.destroy').use(middleware.auth());

router.on('/login').renderInertia('auth/login', {}).as('login').use(middleware.guest());
router.post('/login', [controllers.Auth, 'login']).as('auth.login.store').use(loginThrottle).use(loginEmailThrottle);
router.get('/forgot-password', [controllers.ForgotPassword, 'show']).as('forgot.password').use(middleware.guest());
router.post('/forgot-password', [controllers.ForgotPassword, 'store']).as('forgot.password.store').use(middleware.guest()).use(forgotPasswordThrottle);
router.get('/register', [controllers.Register, 'show']).as('register').use(middleware.guest());
router
    .post('/register', [controllers.Register, 'store'])
    .as('register.store')
    .use(middleware.guest())
    .use(registerThrottle)
    .use(middleware.honeypot({ flashKey: 'messages.register.success' }));
router.get('/email-verify', [controllers.EmailVerification, 'show']).as('email.verify');
router.delete('/logout', [controllers.Auth, 'logout']).as('auth.logout').use(middleware.auth());

router
    .group((): void => {
        router.get('/', [controllers.admin.Dashboard, 'index']).as('admin.dashboard');
        router.post('/terms/invalidate', [controllers.admin.Dashboard, 'invalidateTerms']).as('admin.terms.invalidate');

        router.get('/users', [controllers.admin.Users, 'index']).as('admin.users.index');
        router.get('/users/:id', [controllers.admin.Users, 'show']).as('admin.users.show');
        router.get('/users/:id/export', [controllers.admin.Users, 'exportData']).as('admin.users.export');
        router.put('/users/:id', [controllers.admin.Users, 'update']).as('admin.users.update');
    })
    .prefix('/admin')
    .use([middleware.auth(), middleware.admin()]);

router.get('/legal', [controllers.Legal, 'show']).as('legal.show');
router.get('/terms', [controllers.Terms, 'show']).as('terms.show');
router.post('/terms/accept', [controllers.Terms, 'accept']).as('terms.accept').use(middleware.auth());
