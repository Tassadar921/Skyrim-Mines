import vine from '@vinejs/vine';
import TaxSystemEnum from '#types/enum/tax_system_enum';

export const updateLogoValidator = vine.create({
    logo: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }),
});

export const updateSubtitleValidator = vine.create({
    subtitle: vine.string().trim().maxLength(255).optional(),
});

export const updateTaxSystemValidator = vine.create({
    taxSystem: vine.enum(Object.values(TaxSystemEnum)),
});
