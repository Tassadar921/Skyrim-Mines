import { type HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
import SiteSettingRepository from '#repositories/site_setting_repository';
import FileRepository from '#repositories/file_repository';
import type TaxSystemEnum from '#types/enum/tax_system_enum';
import { updateLogoValidator, updateSubtitleValidator, updateTaxSystemValidator, updateWeekOneStartValidator } from '#validators/admin/site_settings';
import { storeUploadedFile, deleteStoredFile } from '#helpers/file_storage_helper';
import { DEFAULT_GAME_WEEK_ONE_START } from '#helpers/game_week_helper';

export default class SiteSettingsController {
    constructor(
        private readonly siteSettingRepository: SiteSettingRepository = new SiteSettingRepository(),
        private readonly fileRepository: FileRepository = new FileRepository(),
    ) {}

    public async index({ inertia }: HttpContext) {
        const siteSetting = await this.siteSettingRepository.get();

        return inertia.render('admin/site-settings/index', {
            taxSystem: siteSetting.taxSystem as TaxSystemEnum,
            weekOneStart: siteSetting.weekOneStart?.toISODate() ?? null,
            defaultWeekOneStart: DEFAULT_GAME_WEEK_ONE_START.toISODate()!,
        });
    }

    public async updateLogo({ request, response, session, i18n }: HttpContext) {
        const { logo } = await request.validateUsing(updateLogoValidator);

        try {
            const previous = await this.siteSettingRepository.get();
            const previousLogoFileId = previous.logoFileId;

            const path = await storeUploadedFile(logo, 'uploads/logo');
            const file = await this.fileRepository.create({
                path,
                originalName: logo.clientName,
                mimeType: `${logo.type}/${logo.subtype}`,
                size: logo.size,
            });

            await this.siteSettingRepository.updateLogo(file.id);

            if (previousLogoFileId) {
                const previousFile = await this.fileRepository.findOrFail(previousLogoFileId);
                await deleteStoredFile(previousFile.path);
                await this.fileRepository.delete(previousLogoFileId);
            }

            session.flash('success', i18n.t('messages.admin.siteSettings.logo.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'siteSettings.updateLogo failed');
            session.flash('error', i18n.t('messages.admin.siteSettings.logo.update.error'));
        }

        return response.redirect().back();
    }

    public async destroyLogo({ response, session, i18n }: HttpContext) {
        try {
            const current = await this.siteSettingRepository.get();

            if (current.logoFileId) {
                const file = await this.fileRepository.findOrFail(current.logoFileId);
                await this.siteSettingRepository.updateLogo(null);
                await deleteStoredFile(file.path);
                await this.fileRepository.delete(file.id);
            }

            session.flash('success', i18n.t('messages.admin.siteSettings.logo.destroy.success'));
        } catch (e) {
            logger.error({ err: e }, 'siteSettings.destroyLogo failed');
            session.flash('error', i18n.t('messages.admin.siteSettings.logo.destroy.error'));
        }

        return response.redirect().back();
    }

    public async updateSubtitle({ request, response, session, i18n }: HttpContext) {
        const { subtitle } = await request.validateUsing(updateSubtitleValidator);

        try {
            await this.siteSettingRepository.updateSubtitle(subtitle?.length ? subtitle : null);
            session.flash('success', i18n.t('messages.admin.siteSettings.subtitle.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'siteSettings.updateSubtitle failed');
            session.flash('error', i18n.t('messages.admin.siteSettings.subtitle.update.error'));
        }

        return response.redirect().back();
    }

    public async updateTaxSystem({ request, response, session, i18n }: HttpContext) {
        const { taxSystem } = await request.validateUsing(updateTaxSystemValidator);

        try {
            await this.siteSettingRepository.updateTaxSystem(taxSystem as TaxSystemEnum);
            session.flash('success', i18n.t('messages.admin.siteSettings.taxSystem.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'siteSettings.updateTaxSystem failed');
            session.flash('error', i18n.t('messages.admin.siteSettings.taxSystem.update.error'));
        }

        return response.redirect().back();
    }

    public async updateWeekOneStart({ request, response, session, i18n }: HttpContext) {
        const { weekOneStart } = await request.validateUsing(updateWeekOneStartValidator);

        try {
            if (!weekOneStart) {
                await this.siteSettingRepository.updateWeekOneStart(null);
                session.flash('success', i18n.t('messages.admin.siteSettings.weekOneStart.update.success'));
                return response.redirect().back();
            }

            const parsed = DateTime.fromISO(weekOneStart, { zone: 'utc' }).startOf('day');
            if (!parsed.isValid || parsed < DEFAULT_GAME_WEEK_ONE_START) {
                session.flash('error', i18n.t('messages.admin.siteSettings.weekOneStart.update.invalid'));
                return response.redirect().back();
            }

            await this.siteSettingRepository.updateWeekOneStart(parsed);
            session.flash('success', i18n.t('messages.admin.siteSettings.weekOneStart.update.success'));
        } catch (e) {
            logger.error({ err: e }, 'siteSettings.updateWeekOneStart failed');
            session.flash('error', i18n.t('messages.admin.siteSettings.weekOneStart.update.error'));
        }

        return response.redirect().back();
    }
}
