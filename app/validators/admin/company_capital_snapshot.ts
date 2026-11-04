import vine from '@vinejs/vine';

export const storeCompanyCapitalSnapshotValidator = vine.create({
    weekNumber: vine.number().withoutDecimals().min(1).optional(),
    donationReduction: vine.boolean().optional(),
    sponsorshipReduction: vine.boolean().optional(),
    privilegeReduction: vine.boolean().optional(),
});
