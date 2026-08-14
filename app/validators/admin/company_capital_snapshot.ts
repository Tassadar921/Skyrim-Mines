import vine from '@vinejs/vine';

export const storeCompanyCapitalSnapshotValidator = vine.create({
    capital: vine.number().min(0),
    stockValue: vine.number().min(0),
});
