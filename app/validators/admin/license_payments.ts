import vine from '@vinejs/vine';

export const storeLicensePaymentValidator = vine.create({
    weekNumber: vine.number().min(1),
    isCitizen: vine.boolean(),
    amountPaid: vine.number().min(0),
});
