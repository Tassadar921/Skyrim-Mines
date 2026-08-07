import vine from '@vinejs/vine';

export const createOrderArchiveValidator = vine.create({
    items: vine.array(
        vine.object({
            resourceId: vine.string().uuid(),
            quantity: vine.number().min(0),
        }),
    ),
    recipientMode: vine.enum(['thirdPartyClient', 'thirdPartyOrganization']),
    recipientClientId: vine.string().uuid().optional(),
    recipientOrganizationId: vine.string().uuid().optional(),
    recipientScope: vine.enum(['organization', 'personal']).optional(),
    orderWeek: vine.number().min(1),
    deliveryWeek: vine.number().min(1),
    castellanyId: vine.string().uuid().nullable().optional(),
});
