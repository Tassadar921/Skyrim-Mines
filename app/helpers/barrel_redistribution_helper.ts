/**
 * Spreads a positive amount as evenly as possible across every given user (order-independent
 * result: user ids are sorted first so the +1 remainder always lands on the same users for a
 * given input, keeping the operation deterministic/idempotent for identical inputs).
 */
export function distributeEvenly(userIds: string[], amount: number): Map<string, number> {
    const n = userIds.length;
    if (n === 0 || amount <= 0) return new Map();

    const sorted = [...userIds].sort();
    const base = Math.floor(amount / n);
    const remainder = amount - base * n;

    return new Map(sorted.map((userId, index) => [userId, base + (index < remainder ? 1 : 0)]));
}

/**
 * Removes a positive amount from a set of users, weighted by each user's current quantity
 * (largest-remainder method, so the amounts sum exactly to `amount` and no one is taken below
 * their own quantity). Amount is capped at the sum of all quantities.
 */
export function distributeProportionally(quantityByUserId: Map<string, number>, amount: number): Map<string, number> {
    if (amount <= 0) return new Map();

    const total = [...quantityByUserId.values()].reduce((sum, quantity) => sum + quantity, 0);
    if (total <= 0) return new Map();

    const capped = Math.min(amount, total);

    const shares = [...quantityByUserId.entries()]
        .filter(([, quantity]) => quantity > 0)
        .map(([userId, quantity]) => {
            const exact = (quantity / total) * capped;
            const floor = Math.floor(exact);
            return { userId, quantity, floor, remainder: exact - floor };
        });

    const assigned = shares.reduce((sum, share) => sum + share.floor, 0);
    let remaining = capped - assigned;

    shares.sort((a, b) => b.remainder - a.remainder);

    const result = new Map<string, number>();
    for (const share of shares) {
        const extra = remaining > 0 ? 1 : 0;
        if (extra) remaining -= 1;
        result.set(share.userId, Math.min(share.floor + extra, share.quantity));
    }

    return result;
}
