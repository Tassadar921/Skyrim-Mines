import vine from '@vinejs/vine';
import { PERMANENCE_MAX_DURATION, PERMANENCE_MIN_DURATION } from '#helpers/permanence_helper';

export const updateRecruitingValidator = vine.create({
    isRecruiting: vine.boolean(),
});

export const updateBuybackValidator = vine.create({
    resourceIds: vine.array(vine.string().uuid()).minLength(1),
    enabled: vine.boolean(),
});

export const storeSlotValidator = vine.create({
    /** ISO weekday: 1 = Monday … 7 = Sunday. */
    weekday: vine.number().withoutDecimals().min(1).max(7),
    time: vine.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    durationMinutes: vine.number().withoutDecimals().min(PERMANENCE_MIN_DURATION).max(PERMANENCE_MAX_DURATION),
});

export const updateSlotDurationValidator = vine.create({
    durationMinutes: vine.number().withoutDecimals().min(PERMANENCE_MIN_DURATION).max(PERMANENCE_MAX_DURATION),
});
