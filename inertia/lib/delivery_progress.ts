export function deliveryProgressLabel(t: (key: string, params?: Record<string, unknown>) => string, deliveredQuantity: number, orderedQuantity: number): string {
    if (deliveredQuantity <= 0) return t('commande.show.notDelivered');
    if (deliveredQuantity >= orderedQuantity) return t('commande.show.fullyDelivered');
    return t('commande.show.deliveredOfOrdered', { delivered: deliveredQuantity, ordered: orderedQuantity });
}
