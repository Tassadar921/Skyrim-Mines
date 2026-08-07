/**
 * Only staff and admins can be owed money by the company (resource buybacks paid out to them).
 * For every other role the balance is always 0, so it must stay hidden everywhere it's shown.
 */
export function canHaveBalance(role: string): boolean {
    return role === 'staff' || role === 'admin';
}
