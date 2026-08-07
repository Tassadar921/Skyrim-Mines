import vine from '@vinejs/vine';

export const updateLicensePricesValidator = vine.create({
    citizenPrice: vine.number().min(0),
    nonCitizenPrice: vine.number().min(0),
});
