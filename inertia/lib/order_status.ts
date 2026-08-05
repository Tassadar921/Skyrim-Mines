import type { BadgeVariants } from '~/components/ui/badge';

export type OrderStatus = 'pending' | 'to_deliver' | 'delivered' | 'cancelled';

const STATUS_VARIANTS: Record<OrderStatus, NonNullable<BadgeVariants['variant']>> = {
    pending: 'outline',
    to_deliver: 'default',
    delivered: 'secondary',
    cancelled: 'destructive',
};

const STATUS_LABEL_KEYS: Record<OrderStatus, string> = {
    pending: 'commande.status.pending',
    to_deliver: 'commande.status.toDeliver',
    delivered: 'commande.status.delivered',
    cancelled: 'commande.status.cancelled',
};

export function orderStatusVariant(status: string): NonNullable<BadgeVariants['variant']> {
    return STATUS_VARIANTS[status as OrderStatus] ?? 'outline';
}

export function orderStatusLabelKey(status: string): string {
    return STATUS_LABEL_KEYS[status as OrderStatus] ?? status;
}
