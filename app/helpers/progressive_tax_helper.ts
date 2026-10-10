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

/**
 * Full-slab tax computation ("taxation progressive intégrale"): the whole `profit` is taxed at
 * the single rate of the tier it falls into, not split across tiers like `computeProgressiveTax`.
 * `tiers` must be ordered ascending, with only the last tier allowed a null `upperBound` (unbounded).
 */
export function computeFullProgressiveTax(profit: number, tiers: TaxBracketInput[]): number {
    if (profit <= 0 || !tiers.length) return 0;

    const matchingTier = tiers.find((tier) => tier.upperBound === null || profit <= tier.upperBound) ?? tiers[tiers.length - 1];
    return profit * (matchingTier.rate / 100);
}

/**
 * County-registry tax reductions ("Argenterie du Comté de Bruma"), only applicable under the
 * marginal tax-brackets system — never flat or full-progressive-tier.
 */
export const TAX_REDUCTION_RATES = {
    donation: 15,
    sponsorship: 5,
    privilege: 5,
} as const;

export type TaxReductionFlags = { donation: boolean; sponsorship: boolean; privilege: boolean };

export function applyTaxReductions(weeklyTax: number, reductions: TaxReductionFlags): number {
    const totalReductionRate =
        (reductions.donation ? TAX_REDUCTION_RATES.donation : 0) + (reductions.sponsorship ? TAX_REDUCTION_RATES.sponsorship : 0) + (reductions.privilege ? TAX_REDUCTION_RATES.privilege : 0);

    return weeklyTax * (1 - totalReductionRate / 100);
}
