import { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import env from '#start/env';

export default class TermsController {
    public async show({ inertia }: HttpContext) {
        return inertia.render('terms', { contactEmail: env.get('ADMIN_SENDER_EMAIL') });
    }

    public async accept({ auth, response }: HttpContext) {
        const user = auth.user!;
        user.acceptedTermsAt = DateTime.now();
        await user.save();
        return response.redirect().back();
    }
}
