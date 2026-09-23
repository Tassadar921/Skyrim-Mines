export type TaxBracketInput = { upperBound: number | null; rate: number };

/**
 * Marginal (bracket-by-bracket) tax computation: each slice of `profit` is taxed at the rate of
 * the bracket it falls into, not the whole amount at a single rate. `brackets` must be ordered
 * ascending, with only the last bracket allowed a null `upperBound` (unbounded).
 */
export function computeProgressiveTax(profit: number, brackets: TaxBracketInput[]): number {
    if (profit <= 0 || !brackets.length) return 0;

    let tax = 0;
    let lowerBound = 0;

    for (const bracket of brackets) {
        if (profit <= lowerBound) break;

        const upperBound = bracket.upperBound ?? Infinity;
        const taxableInBracket = Math.min(profit, upperBound) - lowerBound;
        tax += taxableInBracket * (bracket.rate / 100);
        lowerBound = upperBound;
    }

    return tax;
}
