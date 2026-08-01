import { HttpContext } from '@adonisjs/core/http';
import env from '#start/env';

export default class LegalController {
    public async show({ inertia }: HttpContext) {
        return inertia.render('legal', { editorName: env.get('SITE_EDITOR_NAME'), contactEmail: env.get('ADMIN_SENDER_EMAIL') });
    }
}
