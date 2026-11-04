import vine from '@vinejs/vine';

/** Naive Europe/Paris date ("YYYY-MM-DD") or date-time ("YYYY-MM-DDTHH:mm"), as sent by date / datetime-local inputs. */
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;

export const AGENDA_VIEWS = ['month', 'week', 'day'] as const;

export const indexAgendaEventValidator = vine.create({
    view: vine.enum(AGENDA_VIEWS).optional(),
    date: vine
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
});

export const storeAgendaEventValidator = vine.create({
    title: vine.string().trim().minLength(1).maxLength(100),
    description: vine.string().trim().maxLength(2000).nullable().optional(),
    isShared: vine.boolean(),
    allDay: vine.boolean(),
    startsAt: vine.string().regex(LOCAL_DATE_TIME),
    endsAt: vine.string().regex(LOCAL_DATE_TIME),
    recursWeekly: vine.boolean(),
    needsAssignee: vine.boolean(),
    recurrenceEndsOn: vine
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable()
        .optional(),
});

export const assignAgendaEventValidator = vine.create({
    mode: vine.enum(['personal', 'shared']),
});
