import { type HttpContext } from '@adonisjs/core/http';
import logger from '@adonisjs/core/services/logger';
import SiteSettingRepository from '#repositories/site_setting_repository';
import FileRepository from '#repositories/file_repository';
import { updateLogoValidator, updateSubtitleValidator } from '#validators/admin/site_settings';
import { storeUploadedFile, deleteStoredFile } from '#helpers/file_storage_helper';

export default class SiteSettingsController {
    constructor(
        private readonly siteSettingRepository: SiteSettingRepository = new SiteSettingRepository(),
        private readonly fileRepository: FileRepository = new FileRepository(),
    ) {}

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
}
