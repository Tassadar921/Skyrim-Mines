<script setup lang="ts">
import { computed } from 'vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Download } from '@lucide/vue';
import CancelOrderButton from '~/partials/commande/CancelOrderButton.vue';
import { orderStatusVariant, orderStatusLabelKey } from '~/lib/order_status';
import { deliveryProgressLabel } from '~/lib/delivery_progress';

type OrderLine = { resourceName: string; resourceType: string; quantity: number; unitPrice: number; totalPrice: number; deliveredQuantity: number; remainingQuantity: number };
type Order = {
    id: string;
    number: number;
    organizationName: string | null;
    requesterName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    fileUrl: string | null;
    lines: OrderLine[];
};

const { t } = useI18n();

const props = defineProps<{
    order: Order;
}>();

const formattedNumber = String(props.order.number).padStart(5, '0');
const canCancel = computed(() => props.order.status === 'pending' || props.order.status === 'to_deliver');

function cancelOrder() {
    router.patch(urlFor('commandes.cancel', { id: props.order.id }), {}, { preserveScroll: true });
}

const lineSections = computed(() =>
    [
        { type: 'minerai', label: t('commande.sections.minerais'), lines: props.order.lines.filter((line) => line.resourceType === 'minerai') },
        { type: 'lingot', label: t('commande.sections.lingots'), lines: props.order.lines.filter((line) => line.resourceType === 'lingot') },
    ].filter((section) => section.lines.length),
);
</script>

<template>
    <Head :title="`${t('commande.title')} n° ${formattedNumber}`" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-10">
        <div class="flex flex-col items-center text-center gap-2">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('commande.show.title') }}</h1>
            <p class="text-slate-500 dark:text-slate-400">{{ t('commande.show.number', { number: formattedNumber }) }}</p>
            <Badge :variant="orderStatusVariant(order.status)">{{ t(orderStatusLabelKey(order.status)) }}</Badge>
        </div>

        <div class="max-w-3xl mx-auto space-y-6">
            <div class="flex flex-col items-center gap-4 rounded-md border p-6 text-center">
                <p class="text-slate-600 dark:text-slate-300">{{ t('commande.show.ready') }}</p>
                <div class="flex items-center gap-3">
                    <Button v-if="order.fileUrl" as-child class="gap-2">
                        <a :href="order.fileUrl" target="_blank" rel="noopener">
                            <Download class="size-4" />
                            {{ t('commande.show.download') }}
                        </a>
                    </Button>
                    <CancelOrderButton v-if="canCancel" :number="order.number" @confirm="cancelOrder" />
                </div>
            </div>

            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{{ t('stocks.table.name') }}</TableHead>
                            <TableHead>{{ t('deposit.quantity') }}</TableHead>
                            <TableHead>{{ t('stocks.table.sellPrice') }}</TableHead>
                            <TableHead>{{ t('commande.show.total') }}</TableHead>
                            <TableHead>{{ t('commande.show.delivery') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <template v-for="section in lineSections" :key="section.type">
                            <TableRow>
                                <TableCell :colspan="5" class="text-xs font-semibold uppercase text-muted-foreground bg-muted/30">{{ section.label }}</TableCell>
                            </TableRow>
                            <TableRow v-for="line in section.lines" :key="line.resourceName">
                                <TableCell class="text-sm font-medium">{{ line.resourceName }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ line.quantity }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ line.unitPrice.toFixed(2) }} s</TableCell>
                                <TableCell class="text-sm font-medium">{{ line.totalPrice.toFixed(2) }} s</TableCell>
                                <TableCell class="text-sm">
                                    <Badge :variant="line.remainingQuantity <= 0 ? 'secondary' : 'outline'">
                                        {{ deliveryProgressLabel(t, line.deliveredQuantity, line.quantity) }}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        </template>
                    </TableBody>
                </Table>
            </div>

            <div class="flex items-center justify-end gap-2 text-lg">
                <span class="text-slate-600 dark:text-slate-300">{{ t('commande.show.total') }}</span>
                <span class="font-medium text-slate-800 dark:text-slate-100">{{ order.totalAmount.toFixed(2) }} s</span>
            </div>

            <div class="flex justify-center">
                <Link :href="urlFor('commandes.create')" class="text-sm text-slate-500 hover:text-amber-700 hover:dark:text-amber-400 underline">
                    {{ t('commande.show.newOrder') }}
                </Link>
            </div>
        </div>
    </div>
</template>
