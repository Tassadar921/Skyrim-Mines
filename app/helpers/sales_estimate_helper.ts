/** Number of complete weeks a forecast looks back on. */
export const SALES_ESTIMATE_HISTORY_WEEKS = 5;

/**
 * Trimmed mean of weekly quantities: with a full history, the lowest and highest weeks are dropped before
 * averaging, so one exceptional week does not skew the forecast. With a shorter history, a plain mean.
 */
export function trimmedMean(values: number[]): number {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const kept = sorted.length >= SALES_ESTIMATE_HISTORY_WEEKS ? sorted.slice(1, -1) : sorted;
    return kept.reduce((sum, value) => sum + value, 0) / kept.length;
}

type RecipeIngredient = { resourceId: string; ingredientResourceId: string; quantity: number };

/**
 * Ore needed to cover the given sales: ores count as themselves, ingots are broken down through their
 * recipes (per unit made), ingredients that are ingots themselves being broken down in turn.
 */
export function expandToOreNeeds(sales: Map<string, number>, oreIds: Set<string>, recipes: RecipeIngredient[]): Map<string, number> {
    const ingredientsByResource = new Map<string, RecipeIngredient[]>();
    for (const line of recipes) {
        ingredientsByResource.set(line.resourceId, [...(ingredientsByResource.get(line.resourceId) ?? []), line]);
    }

    const needs = new Map<string, number>();
    // Depth guard against a recipe loop entered by mistake.
    const add = (resourceId: string, quantity: number, depth: number) => {
        if (oreIds.has(resourceId)) {
            needs.set(resourceId, (needs.get(resourceId) ?? 0) + quantity);
            return;
        }
        if (depth > 5) return;
        for (const ingredient of ingredientsByResource.get(resourceId) ?? []) {
            add(ingredient.ingredientResourceId, quantity * ingredient.quantity, depth + 1);
        }
    };

    for (const [resourceId, quantity] of sales) add(resourceId, quantity, 0);
    return needs;
}

export function roundQuantity(value: number): number {
    return Math.round(value * 100) / 100;
}
