import vine from '@vinejs/vine';

export const storeCompanyCapitalSnapshotValidator = vine.create({
    capital: vine.number().min(0),
    stockValue: vine.number().min(0),
    donationReduction: vine.boolean().optional(),
    sponsorshipReduction: vine.boolean().optional(),
    privilegeReduction: vine.boolean().optional(),
});
