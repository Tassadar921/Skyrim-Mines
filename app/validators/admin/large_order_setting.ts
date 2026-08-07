import vine from '@vinejs/vine';

export const updateLargeOrderSettingValidator = vine.create({
    thresholdQuantity: vine.number().min(0).withoutDecimals(),
});
