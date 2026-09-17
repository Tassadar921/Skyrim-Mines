import vine from '@vinejs/vine';

export const storeBarrelRentalPaymentValidator = vine.create({
    weekNumber: vine.number().min(1),
});
