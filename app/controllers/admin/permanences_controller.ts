import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import SiteSettingRepository from '#repositories/site_setting_repository';
import ResourceRepository from '#repositories/resource_repository';
import PermanenceSlotRepository from '#repositories/permanence_slot_repository';
import ResourceTypeEnum from '#types/enum/resource_type_enum';
import type Resource from '#models/resource';
import { storeSlotValidator, updateBuybackValidator, updateRecruitingValidator, updateSlotDurationValidator } from '#validators/admin/permanences';

export default class PermanencesController {
    constructor(
        private readonly siteSettingRepository: SiteSettingRepository = new SiteSettingRepository(),
        private readonly resourceRepository: ResourceRepository = new ResourceRepository(),
        private readonly permanenceSlotRepository: PermanenceSlotRepository = new PermanenceSlotRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const [siteSetting, ores, ingots, slots] = await Promise.all([
            this.siteSettingRepository.get(),
            this.resourceRepository.allOfType(ResourceTypeEnum.MINERAI),
            this.resourceRepository.allOfType(ResourceTypeEnum.LINGOT),
            this.permanenceSlotRepository.allOrdered(),
        ]);
        const toBuybackRow = (resource: Resource) => ({ resourceId: resource.id, name: resource.name, enabled: resource.permanenceBuyback });

        return inertia.render('admin/permanences/index', {
            settings: {
                isRecruiting: siteSetting.isRecruiting,
                buyback: { ores: ores.map(toBuybackRow), ingots: ingots.map(toBuybackRow) },
                slots: slots.map((slot) => ({ id: slot.id, weekday: slot.weekday, time: slot.time, durationMinutes: slot.durationMinutes })),
            },
        });
    }

    public async updateRecruiting({ request, response, session, i18n }: HttpContext) {
        const { isRecruiting } = await request.validateUsing(updateRecruitingValidator);

        try {
            await this.siteSettingRepository.updateIsRecruiting(isRecruiting);
            session.flash('success', i18n.t(isRecruiting ? 'messages.admin.permanences.recruiting.opened' : 'messages.admin.permanences.recruiting.closed'));
        } catch (e) {
            logger.error({ err: e }, 'permanences.updateRecruiting failed');
            session.flash('error', i18n.t('messages.admin.permanences.recruiting.error'));
        }

        return response.redirect().back();
    }

    /** One resource, or every resource of a table at once from its header toggle. */
    public async updateBuyback({ request, response, session, i18n }: HttpContext) {
        const { resourceIds, enabled } = await request.validateUsing(updateBuybackValidator);

        try {
            await this.resourceRepository.setPermanenceBuyback(resourceIds, enabled);
            session.flash('success', i18n.t('messages.admin.permanences.buyback.success'));
        } catch (e) {
            logger.error({ err: e }, 'permanences.updateBuyback failed');
            session.flash('error', i18n.t('messages.admin.permanences.buyback.error'));
        }

        return response.redirect().back();
    }

    public async storeSlot({ request, response, session, i18n }: HttpContext) {
        const { weekday, time, durationMinutes } = await request.validateUsing(storeSlotValidator);

        if (await this.permanenceSlotRepository.exists(weekday, time)) {
            session.flash('error', i18n.t('messages.admin.permanences.slots.alreadyExists'));
            return response.redirect().back();
        }

        try {
            await this.permanenceSlotRepository.create({ weekday, time, durationMinutes });
            session.flash('success', i18n.t('messages.admin.permanences.slots.store.success'));
        } catch (e) {
            logger.error({ err: e }, 'permanences.storeSlot failed');
            session.flash('error', i18n.t('messages.admin.permanences.slots.store.error'));
        }

        return response.redirect().back();
    }

    public async destroySlot({ params, response, session, i18n }: HttpContext) {
        try {
            await this.permanenceSlotRepository.delete(params.id);
            session.flash('success', i18n.t('messages.admin.permanences.slots.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'permanences.destroySlot failed');
            session.flash('error', i18n.t('messages.admin.permanences.slots.destroy.error'));
        }

        return response.redirect().back();
    }

    public async updateSlotDuration({ params, request, response, session, i18n }: HttpContext) {
        const { durationMinutes } = await request.validateUsing(updateSlotDurationValidator);

        try {
            await this.permanenceSlotRepository.updateDuration(params.id, durationMinutes);
            session.flash('success', i18n.t('messages.admin.permanences.slots.duration.success'));
        } catch (e) {
            logger.error({ err: e }, 'permanences.updateSlotDuration failed');
            session.flash('error', i18n.t('messages.admin.permanences.slots.duration.error'));
        }

        return response.redirect().back();
    }
}
