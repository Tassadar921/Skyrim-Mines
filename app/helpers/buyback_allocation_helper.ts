export function allocateProportionally(total: number, weights: Map<string, number>): Map<string, number> {
    const totalWeight = [...weights.values()].reduce((sum, weight) => sum + weight, 0);
    const result = new Map<string, number>();
    if (total <= 0 || totalWeight <= 0) return result;

    const remainders: { key: string; remainder: number }[] = [];
    let allocated = 0;

    for (const [key, weight] of weights) {
        const raw = (total * weight) / totalWeight;
        const floor = Math.floor(raw);
        result.set(key, floor);
        remainders.push({ key, remainder: raw - floor });
        allocated += floor;
    }

    remainders.sort((a, b) => b.remainder - a.remainder);
    let remaining = total - allocated;
    for (const { key } of remainders) {
        if (remaining <= 0) break;
        result.set(key, (result.get(key) ?? 0) + 1);
        remaining -= 1;
    }

    return result;
}
