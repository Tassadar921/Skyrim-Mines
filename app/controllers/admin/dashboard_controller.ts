import { HttpContext } from '@adonisjs/core/http';
import { inject } from '@adonisjs/core';
import cache from '@adonisjs/cache/services/main';
import TermsVersionRepository, { TERMS_CACHE_TAG } from '#repositories/terms_version_repository';
import { invalidateTermsValidator } from '#validators/admin/dashboard';

@inject()
export default class DashboardController {
    constructor(private readonly termsVersionRepository: TermsVersionRepository = new TermsVersionRepository()) {}

    public async index({ inertia }: HttpContext) {
        return inertia.render('admin/dashboard', {});
    }

    public async invalidateTerms({ request, response, session, i18n }: HttpContext) {
        const { gracePeriodDays, note } = await request.validateUsing(invalidateTermsValidator);
        await this.termsVersionRepository.invalidate({ gracePeriodDays, note });
        await cache.deleteByTag({ tags: [TERMS_CACHE_TAG] });
        session.flash('success', i18n.t('messages.admin.terms.invalidated'));
        return response.redirect().toRoute('admin.dashboard');
    }
}
