import UserRoleEnum from '#types/enum/user_role_enum';

export function isStaffOrAdmin(role: string): boolean {
    return role === UserRoleEnum.STAFF || role === UserRoleEnum.ADMIN;
}

export function isClientOrAuditor(role: string): boolean {
    return role === UserRoleEnum.CLIENT || role === UserRoleEnum.AUDITOR;
}

/** Back-office capability check (admin panel only) — owners and foremen, never staff/auditor/client. */
export function isAdminOrForeman(role: string): boolean {
    return role === UserRoleEnum.ADMIN || role === UserRoleEnum.FOREMAN;
}
