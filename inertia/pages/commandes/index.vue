<script setup lang="ts">
import { ref } from 'vue';
import { Head, router, Link } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { ChevronDown, ChevronRight, Download } from '@lucide/vue';
import CancelOrderButton from '~/partials/commande/CancelOrderButton.vue';
import { orderStatusVariant, orderStatusLabelKey } from '~/lib/order_status';
import { deliveryProgressLabel } from '~/lib/delivery_progress';

type OrderLine = { resourceName: string; resourceType: string; quantity: number; unitPrice: number; totalPrice: number; deliveredQuantity: number; remainingQuantity: number };
type OrderRow = {
    id: string;
    number: number;
    requesterName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    fileUrl: string | null;
    lines: OrderLine[];
};

const { t } = useI18n();

const props = defineProps<{
    orders: OrderRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
}>();

const expanded = ref(new Set<string>());

function toggleExpanded(order: OrderRow) {
    if (expanded.value.has(order.id)) {
        expanded.value.delete(order.id);
    } else {
        expanded.value.add(order.id);
    }
}

function goToPage(page: number) {
    router.get(urlFor('commandes.index'), { page }, { preserveState: true, preserveScroll: true });
}

function formatNumber(number: number): string {
    return String(number).padStart(5, '0');
}

function canCancel(order: OrderRow): boolean {
    return order.status === 'pending' || order.status === 'to_deliver';
}

function cancelOrder(order: OrderRow) {
    router.patch(urlFor('commandes.cancel', { id: order.id }), {}, { preserveScroll: true });
}

function lineSections(order: OrderRow): { type: string; label: string; lines: OrderLine[] }[] {
    return [
        { type: 'minerai', label: t('commande.sections.minerais'), lines: order.lines.filter((line) => line.resourceType === 'minerai') },
        { type: 'lingot', label: t('commande.sections.lingots'), lines: order.lines.filter((line) => line.resourceType === 'lingot') },
    ].filter((section) => section.lines.length);
}
</script>

<template>
    <Head :title="t('commande.index.title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-10">
        <div class="flex flex-col items-center text-center gap-2">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('commande.index.title') }}</h1>
            <Badge variant="outline">{{ meta.total }} {{ t('commande.index.table.count', meta.total) }}</Badge>
        </div>

        <div class="max-w-4xl mx-auto space-y-4">
            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead class="w-8" />
                            <TableHead>{{ t('commande.index.table.number') }}</TableHead>
                            <TableHead>{{ t('commande.index.table.date') }}</TableHead>
                            <TableHead>{{ t('commande.index.table.requester') }}</TableHead>
                            <TableHead>{{ t('commande.index.table.status') }}</TableHead>
                            <TableHead>{{ t('commande.index.table.amount') }}</TableHead>
                            <TableHead>{{ t('commande.index.table.actions') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <template v-if="orders.length">
                            <template v-for="order in orders" :key="order.id">
                                <TableRow class="cursor-pointer" @click="toggleExpanded(order)">
                                    <TableCell>
                                        <ChevronDown v-if="expanded.has(order.id)" class="size-4 text-muted-foreground" />
                                        <ChevronRight v-else class="size-4 text-muted-foreground" />
                                    </TableCell>
                                    <TableCell class="text-sm font-medium">{{ formatNumber(order.number) }}</TableCell>
                                    <TableCell class="text-sm text-muted-foreground">{{ new Date(order.createdAt).toLocaleString('fr-FR', { timeZone: 'UTC' }) }}</TableCell>
                                    <TableCell class="text-sm font-medium">{{ order.requesterName }}</TableCell>
                                    <TableCell>
                                        <Badge :variant="orderStatusVariant(order.status)">{{ t(orderStatusLabelKey(order.status)) }}</Badge>
                                    </TableCell>
                                    <TableCell class="text-sm font-medium">{{ order.totalAmount.toFixed(2) }} s</TableCell>
                                    <TableCell @click.stop class="space-x-2">
                                        <Button v-if="order.fileUrl" as-child variant="outline" size="sm" class="gap-1">
                                            <a :href="order.fileUrl" target="_blank" rel="noopener">
                                                <Download class="size-4" />
                                                {{ t('commande.index.table.download') }}
                                            </a>
                                        </Button>
                                        <CancelOrderButton v-if="canCancel(order)" :number="order.number" size="sm" @confirm="cancelOrder(order)" />
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="expanded.has(order.id)">
                                    <TableCell />
                                    <TableCell :colspan="6" class="bg-muted/30 p-3">
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
                                                <template v-for="section in lineSections(order)" :key="section.type">
                                                    <TableRow>
                                                        <TableCell :colspan="5" class="text-xs font-semibold uppercase text-muted-foreground">{{ section.label }}</TableCell>
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
                                    </TableCell>
                                </TableRow>
                            </template>
                        </template>
                        <TableRow v-else>
                            <TableCell :colspan="7" class="h-24 text-center text-muted-foreground">
                                {{ t('commande.index.table.empty') }}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div v-if="meta.lastPage > 1" class="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" :disabled="meta.currentPage <= 1" @click="goToPage(meta.currentPage - 1)">&larr;</Button>
                <div class="text-sm text-muted-foreground">{{ meta.currentPage }} / {{ meta.lastPage }}</div>
                <Button variant="outline" size="sm" :disabled="meta.currentPage >= meta.lastPage" @click="goToPage(meta.currentPage + 1)">&rarr;</Button>
            </div>

            <div class="flex justify-center">
                <Link :href="urlFor('commandes.create')" class="text-sm text-slate-500 hover:text-amber-700 hover:dark:text-amber-400 underline">
                    {{ t('commande.title') }}
                </Link>
            </div>
        </div>
    </div>
</template>
