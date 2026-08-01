import { HttpContext } from '@adonisjs/core/http';
import { forgotPasswordValidator } from '#validators/auth';
import UserRepository from '#repositories/user_repository';
import PasswordResetService from '#services/password_reset_service';

export default class ForgotPasswordController {
    constructor(private readonly userRepository: UserRepository = new UserRepository()) {}

    public async show({ inertia }: HttpContext) {
        return inertia.render('auth/forgot_password', {});
    }

    public async store({ request, response, session, i18n }: HttpContext) {
        const { email } = await request.validateUsing(forgotPasswordValidator);

        const user = await this.userRepository.findOneBy({ email });

        if (user && user.enabled) {
            await PasswordResetService.sendResetEmail({ id: user.id, email: user.email, username: user.username }, i18n);
        } else {
            await new Promise((resolve) => setTimeout(resolve, 400));
        }

        session.flash('success', i18n.t('messages.forgotPassword.sent'));
        return response.redirect().toRoute('login');
    }
}
