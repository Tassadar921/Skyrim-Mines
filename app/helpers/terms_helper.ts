import type User from '#models/user';
import { DateTime } from 'luxon';
import UserRoleEnum from '#types/enum/user_role_enum';

export interface TermsVersionRaw {
    invalidatedAt: string;
    gracePeriodDays: number;
}

export interface LatestTermsVersion {
    invalidatedAt: DateTime;
    gracePeriodDays: number;
}

export function deserializeTermsVersion(raw: TermsVersionRaw | null): LatestTermsVersion | null {
    if (!raw) return null;
    return { invalidatedAt: DateTime.fromISO(raw.invalidatedAt), gracePeriodDays: raw.gracePeriodDays };
}

export function isTermsOutdated(user: User, latest: LatestTermsVersion | null): boolean {
    if (user.role === UserRoleEnum.ADMIN) return false;
    if (!latest) return false;
    if (!user.acceptedTermsAt) return true;
    return user.acceptedTermsAt.toMillis() < latest.invalidatedAt.toMillis();
}

export function isAccountDeactivated(user: User, latest: LatestTermsVersion | null): boolean {
    if (!isTermsOutdated(user, latest)) return false;
    const deadline = latest!.invalidatedAt.plus({ days: latest!.gracePeriodDays });
    return DateTime.now().toMillis() >= deadline.toMillis();
}
