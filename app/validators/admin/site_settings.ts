import vine from '@vinejs/vine';

export const updateLogoValidator = vine.create({
    logo: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }),
});

export const updateSubtitleValidator = vine.create({
    subtitle: vine.string().trim().maxLength(255).optional(),
});
