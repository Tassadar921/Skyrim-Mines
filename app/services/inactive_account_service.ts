import mail from '@adonisjs/mail/services/main';
import router from '@adonisjs/core/services/router';
import logger from '@adonisjs/core/services/logger';
import env from '#start/env';
import { DateTime } from 'luxon';
import User from '#models/user';
import UserRoleEnum from '#types/enum/user_role_enum';

const INACTIVITY_YEARS = 3;
const WARNING_DAYS_BEFORE = 30;

async function getI18n() {
    const i18nManager = await import('@adonisjs/i18n/services/main');
    return i18nManager.default.locale('fr');
}

async function sendWarningEmail(user: User): Promise<void> {
    const i18n = await getI18n();
    const loginUrl = `${env.get('APP_URL')}${router.makeUrl('login')}`;
    const legalUrl = `${env.get('APP_URL')}${router.makeUrl('legal.show')}`;

    await mail.send((message) => {
        message
            .to(user.email)
            .from(env.get('NOREPLY_SENDER_EMAIL'), 'Consilium')
            .subject(i18n.t('messages.mail.inactivityWarning.subject'))
            .htmlView('emails/inactivity_warning', {
                greeting: i18n.t('messages.mail.inactivityWarning.greeting', { username: user.username }),
                body1: i18n.t('messages.mail.inactivityWarning.body1'),
                body2: i18n.t('messages.mail.inactivityWarning.body2'),
                ctaLabel: i18n.t('messages.mail.inactivityWarning.cta'),
                loginUrl,
                ignore: i18n.t('messages.mail.inactivityWarning.ignore'),
                footer: i18n.t('messages.mail.inactivityWarning.footer'),
                legalUrl,
                footerPrivacy: i18n.t('messages.mail.footerPrivacy'),
            });
    });
}

export default class InactiveAccountService {
    public static async runCleanup(): Promise<void> {
        const now = DateTime.now();
        const deletionThreshold = now.minus({ years: INACTIVITY_YEARS });
        const warningThreshold = deletionThreshold.plus({ days: WARNING_DAYS_BEFORE });

        // COALESCE(last_login_at, created_at) is used so that accounts that predate
        // the last_login_at column are still eligible based on creation date.
        const inactivityExpr = `COALESCE(last_login_at, created_at)`;

        // 1. Delete accounts past the 3-year threshold that already received a warning
        const toDelete = await User.query()
            .whereNot('role', UserRoleEnum.ADMIN)
            .where('enabled', true)
            .whereNotNull('deletionWarningSentAt')
            .whereRaw(`${inactivityExpr} <= ?`, [deletionThreshold.toSQL()]);

        for (const user of toDelete) {
            try {
                await user.delete();
                logger.info({ userId: user.id, email: user.email }, 'inactivity: account deleted');
            } catch (e) {
                logger.error({ err: e, userId: user.id }, 'inactivity: failed to delete account');
            }
        }

        // 2. Warn accounts approaching the threshold (not yet warned)
        const toWarn = await User.query()
            .whereNot('role', UserRoleEnum.ADMIN)
            .where('enabled', true)
            .whereNull('deletionWarningSentAt')
            .whereRaw(`${inactivityExpr} <= ?`, [warningThreshold.toSQL()])
            .whereRaw(`${inactivityExpr} > ?`, [deletionThreshold.toSQL()]);

        for (const user of toWarn) {
            try {
                await sendWarningEmail(user);
                user.deletionWarningSentAt = DateTime.now();
                await user.save();
                logger.info({ userId: user.id, email: user.email }, 'inactivity: warning email sent');
            } catch (e) {
                logger.error({ err: e, userId: user.id }, 'inactivity: failed to send warning email');
            }
        }

        logger.info({ deleted: toDelete.length, warned: toWarn.length }, 'inactivity: cleanup complete');
    }
}
