import mail from '@adonisjs/mail/services/main';
import router from '@adonisjs/core/services/router';
import logger from '@adonisjs/core/services/logger';
import env from '#start/env';
import type { I18n } from '@adonisjs/i18n';
import UserTokenRepository from '#repositories/user_token_repository';
import UserTokenTypeEnum from '#types/enum/user_token_type_enum';

const tokenRepository = new UserTokenRepository();

export default class PasswordResetService {
    public static async sendResetEmail(user: { id: string; email: string; username: string }, i18n: I18n): Promise<void> {
        const token = await tokenRepository.create(user.id, UserTokenTypeEnum.PASSWORD_RESET);

        const resetUrl = router.makeUrl('password.reset.show', {}, { qs: { token } });

        try {
            await mail.send((message) => {
                message
                    .to(user.email)
                    .from(env.get('NOREPLY_SENDER_EMAIL'), 'Consilium')
                    .subject(i18n.t('messages.mail.passwordReset.subject'))
                    .htmlView('emails/password_reset', {
                        greeting: i18n.t('messages.mail.passwordReset.greeting', { username: user.username }),
                        body1: i18n.t('messages.mail.passwordReset.body1'),
                        ctaLabel: i18n.t('messages.mail.passwordReset.cta'),
                        resetUrl: `${env.get('APP_URL')}${resetUrl}`,
                        ignore: i18n.t('messages.mail.passwordReset.ignore'),
                        footer: i18n.t('messages.mail.passwordReset.footer'),
                        legalUrl: `${env.get('APP_URL')}${router.makeUrl('legal.show')}`,
                        footerPrivacy: i18n.t('messages.mail.footerPrivacy'),
                    });
            });
        } catch (e) {
            logger.error({ err: e, to: user.email }, 'passwordResetService: mail.send failed');
            throw e;
        }
    }
}
