import { HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import UserTransformer from '#transformers/user_transformer';
import { updateProfileValidator } from '#validators/profile';
import PasswordResetService from '#services/password_reset_service';

export default class ProfileController {
    public async show({ inertia, auth }: HttpContext) {
        const user = auth.user!;
        return inertia.render('profile', {
            user: new UserTransformer(user).toObject(),
        });
    }

    public async exportData({ auth, response }: HttpContext) {
        const user = auth.user!;

        const data = {
            export_date: new Date().toISOString(),
            account: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.createdAt.toISO(),
                updated_at: user.updatedAt?.toISO() ?? null,
            },
        };

        const filename = `export-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
        response.header('Content-Disposition', `attachment; filename="${filename}"`);
        response.header('Content-Type', 'application/json');
        return response.send(JSON.stringify(data, null, 2));
    }

    public async update({ request, auth, response, session, i18n }: HttpContext) {
        const { username } = await request.validateUsing(updateProfileValidator);
        const user = auth.user!;

        user.username = username;
        await user.save();

        session.flash('success', i18n.t('messages.profile.update.success'));
        return response.redirect().toRoute('profile.show');
    }

    public async destroy({ auth, response, session, i18n }: HttpContext) {
        const user = auth.user!;

        try {
            await auth.use('web').logout();
            await user.delete();
            session.flash('success', i18n.t('messages.profile.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'profile.destroy failed');
            session.flash('error', i18n.t('messages.profile.destroy.error'));
            return response.redirect().toRoute('profile.show');
        }

        return response.redirect().toRoute('home');
    }

    public async sendPasswordReset({ auth, response, session, i18n }: HttpContext) {
        const user = auth.user!;

        try {
            await PasswordResetService.sendResetEmail({ id: user.id, email: user.email, username: user.username }, i18n);
            session.flash('success', i18n.t('messages.profile.passwordReset.sent'));
        } catch (e) {
            logger.error({ err: e }, 'profile.sendPasswordReset failed');
            session.flash('error', i18n.t('messages.profile.passwordReset.error'));
        }

        return response.redirect().toRoute('profile.show');
    }
}
