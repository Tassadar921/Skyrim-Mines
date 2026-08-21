export function computeBarrelQuantity(resourceId: string, deposits: Map<string, number>, buybacks: Map<string, number>, adjustments: Map<string, number>): number {
    return (deposits.get(resourceId) ?? 0) - (buybacks.get(resourceId) ?? 0) + (adjustments.get(resourceId) ?? 0);
}
