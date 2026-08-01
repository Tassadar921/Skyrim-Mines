import BaseRepository from '#repositories/base/base_repository';
import TermsVersion from '#models/terms_version';
import { DateTime } from 'luxon';
import type { TermsVersionRaw } from '#helpers/terms_helper';

export const TERMS_CACHE_KEY = 'terms:latest_version';
export const TERMS_CACHE_TAG = 'terms';

export default class TermsVersionRepository extends BaseRepository<typeof TermsVersion> {
    constructor() {
        super(TermsVersion);
    }

    public async getLatest(): Promise<TermsVersionRaw | null> {
        const v = await TermsVersion.query().orderBy('invalidated_at', 'desc').first();
        if (!v) return null;
        return { invalidatedAt: v.invalidatedAt.toISO()!, gracePeriodDays: v.gracePeriodDays };
    }

    public async invalidate(data: { gracePeriodDays: number; note?: string | null }): Promise<void> {
        await TermsVersion.create({
            invalidatedAt: DateTime.now(),
            gracePeriodDays: data.gracePeriodDays,
            note: data.note ?? null,
        });
    }
}
