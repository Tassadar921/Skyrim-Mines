import mail from '@adonisjs/mail/services/main';
import router from '@adonisjs/core/services/router';
import env from '#start/env';
import type { I18n } from '@adonisjs/i18n';
import UserTokenRepository from '#repositories/user_token_repository';
import UserTokenTypeEnum from '#types/enum/user_token_type_enum';

const tokenRepository = new UserTokenRepository();

export default class EmailVerificationService {
    public static async sendVerificationEmail(user: { id: string; email: string; username: string }, i18n: I18n): Promise<void> {
        const token = await tokenRepository.create(user.id, UserTokenTypeEnum.EMAIL_VERIFICATION, 24);

        const verifyUrl = router.makeUrl('email.verify', {}, { qs: { token } });

        await mail.send((message) => {
            message
                .to(user.email)
                .from(env.get('NOREPLY_SENDER_EMAIL'), 'Consilium')
                .subject(i18n.t('messages.mail.emailVerification.subject'))
                .htmlView('emails/email_verification', {
                    greeting: i18n.t('messages.mail.emailVerification.greeting', { username: user.username }),
                    body1: i18n.t('messages.mail.emailVerification.body1'),
                    ctaLabel: i18n.t('messages.mail.emailVerification.cta'),
                    verifyUrl: `${env.get('APP_URL')}${verifyUrl}`,
                    ignore: i18n.t('messages.mail.emailVerification.ignore'),
                    footer: i18n.t('messages.mail.emailVerification.footer'),
                    legalUrl: `${env.get('APP_URL')}${router.makeUrl('legal.show')}`,
                    footerPrivacy: i18n.t('messages.mail.footerPrivacy'),
                });
        });
    }
}
