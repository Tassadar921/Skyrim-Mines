/**
 * Evaluates a restricted arithmetic expression (+, -, *, /, parentheses, decimals) without
 * using eval/Function. Returns NaN if the expression contains anything else or is malformed.
 */
export function evaluateMathExpression(expression: string): number {
    const sanitized = expression.trim();
    if (!sanitized || !/^[\d+\-*/().\s]+$/.test(sanitized)) return Number.NaN;

    let pos = 0;

    function peek(): string | undefined {
        return sanitized[pos];
    }

    function skipSpaces(): void {
        while (peek() === ' ') pos++;
    }

    function parseNumber(): number {
        const start = pos;
        while (peek() !== undefined && /[\d.]/.test(peek()!)) pos++;
        const text = sanitized.slice(start, pos);
        if (!text) throw new Error('expected a number');
        return Number(text);
    }

    function parseFactor(): number {
        skipSpaces();
        if (peek() === '(') {
            pos++;
            const value = parseExpression();
            skipSpaces();
            if (peek() !== ')') throw new Error('expected )');
            pos++;
            return value;
        }
        if (peek() === '-') {
            pos++;
            return -parseFactor();
        }
        if (peek() === '+') {
            pos++;
            return parseFactor();
        }
        return parseNumber();
    }

    function parseTerm(): number {
        let value = parseFactor();
        skipSpaces();
        while (peek() === '*' || peek() === '/') {
            const op = peek();
            pos++;
            const rhs = parseFactor();
            value = op === '*' ? value * rhs : value / rhs;
            skipSpaces();
        }
        return value;
    }

    function parseExpression(): number {
        let value = parseTerm();
        skipSpaces();
        while (peek() === '+' || peek() === '-') {
            const op = peek();
            pos++;
            const rhs = parseTerm();
            value = op === '+' ? value + rhs : value - rhs;
            skipSpaces();
        }
        return value;
    }

    try {
        const result = parseExpression();
        skipSpaces();
        if (pos !== sanitized.length || Number.isNaN(result)) return Number.NaN;
        return result;
    } catch {
        return Number.NaN;
    }
}
