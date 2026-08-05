import UserRoleEnum from '#types/enum/user_role_enum';

export function isStaffOrAdmin(role: string): boolean {
    return role === UserRoleEnum.STAFF || role === UserRoleEnum.ADMIN;
}
