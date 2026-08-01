import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import UserRepository from '#repositories/user_repository';
import { registerValidator } from '#validators/register';
import EmailVerificationService from '#services/email_verification_service';

export default class RegisterController {
    constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

    public async show({ inertia, session }: HttpContext) {
        session.put('register_form_loaded_at', Date.now());
        return inertia.render('auth/register', {});
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        // Timing check: bots submit instantly — require at least 3 seconds after page load
        const loadedAt = session.pull('register_form_loaded_at') as number | null;
        if (!loadedAt || Date.now() - loadedAt < 3000) {
            session.flash('success', i18n.t('messages.register.success'));
            return response.redirect().toRoute('login');
        }

        const { username, email, password, passwordConfirmation, acceptedTerms } = await request.validateUsing(registerValidator);

        if (!acceptedTerms) {
            session.flash('error', i18n.t('messages.register.termsRequired'));
            return response.redirect().back();
        }

        if (password !== passwordConfirmation) {
            session.flash('error', i18n.t('messages.register.passwordMismatch'));
            return response.redirect().back();
        }

        const existing = await this.userRepository.findOneBy({ email });
        if (existing) {
            session.flash('error', i18n.t('messages.register.emailTaken'));
            return response.redirect().back();
        }

        try {
            const user = await this.userRepository.create({ username, email, password, acceptedTerms });
            await EmailVerificationService.sendVerificationEmail({ id: user.id, email: user.email, username: user.username }, i18n);

            session.flash('success', i18n.t('messages.register.success'));
            return response.redirect().toRoute('login');
        } catch (e) {
            logger.error({ err: e }, 'register.store failed');
            session.flash('error', i18n.t('messages.register.error'));
            return response.redirect().back();
        }
    }
}
