import vine from '@vinejs/vine';

export const createQuoteValidator = vine.create({
    items: vine.array(
        vine.object({
            resourceId: vine.string().uuid(),
            quantity: vine.number().min(0),
        }),
    ),
    recipientMode: vine.enum(['myOrganization', 'myself', 'thirdPartyClient', 'thirdPartyOrganization']).optional(),
    recipientClientId: vine.string().uuid().optional(),
    recipientOrganizationId: vine.string().uuid().optional(),
    recipientScope: vine.enum(['organization', 'personal']).optional(),
});
