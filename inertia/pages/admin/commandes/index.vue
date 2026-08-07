<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight, Download, CircleCheck, Archive } from '@lucide/vue';
import { Link } from '@adonisjs/inertia/vue';
import CancelOrderButton from '~/partials/commande/CancelOrderButton.vue';
import { orderStatusVariant, orderStatusLabelKey } from '~/lib/order_status';
import { deliveryProgressLabel } from '~/lib/delivery_progress';

defineOptions({ layout: AdminLayout });

type OrderLine = { resourceName: string; resourceType: string; quantity: number; unitPrice: number; totalPrice: number; deliveredQuantity: number; remainingQuantity: number };
type OrderRow = {
    id: string;
    number: number;
    requesterName: string;
    organizationName: string | null;
    status: string;
    totalAmount: number;
    createdAt: string;
    fileUrl: string | null;
    lines: OrderLine[];
};

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.commandes.title');

const props = defineProps<{
    orders: OrderRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string };
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const expanded = ref(new Set<string>());

function toggleExpanded(order: OrderRow) {
    if (expanded.value.has(order.id)) {
        expanded.value.delete(order.id);
    } else {
        expanded.value.add(order.id);
    }
}

function navigate(overrides: Record<string, string | number | undefined>) {
    const params: Record<string, string | number | undefined> = {
        search: searchValue.value || undefined,
        sort: props.filters.sort,
        dir: props.filters.dir,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.commandes.index'), clean, { preserveState: true, preserveScroll: true });
}

function onSearchInput(value: string | number) {
    searchValue.value = String(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        navigate({ search: searchValue.value || undefined, page: 1 });
    }, 300);
}

function onSort(column: string) {
    if (props.filters.sort === column) {
        navigate({ sort: column, dir: props.filters.dir === 'asc' ? 'desc' : 'asc', page: 1 });
    } else {
        navigate({ sort: column, dir: 'asc', page: 1 });
    }
}

function sortIcon(column: string) {
    if (props.filters.sort !== column) return ArrowUpDown;
    return props.filters.dir === 'asc' ? ArrowUp : ArrowDown;
}

function formatNumber(number: number): string {
    return String(number).padStart(5, '0');
}

function lineSections(order: OrderRow): { type: string; label: string; lines: OrderLine[] }[] {
    return [
        { type: 'minerai', label: t('commande.sections.minerais'), lines: order.lines.filter((line) => line.resourceType === 'minerai') },
        { type: 'lingot', label: t('commande.sections.lingots'), lines: order.lines.filter((line) => line.resourceType === 'lingot') },
    ].filter((section) => section.lines.length);
}

function canValidate(order: OrderRow): boolean {
    return isAdmin.value && order.status === 'pending';
}

function canCancel(order: OrderRow): boolean {
    return isAdmin.value && (order.status === 'pending' || order.status === 'to_deliver');
}

function validateOrder(order: OrderRow) {
    router.patch(urlFor('admin.commandes.validate', { id: order.id }), {}, { preserveScroll: true });
}

function cancelOrder(order: OrderRow) {
    router.patch(urlFor('admin.commandes.cancel', { id: order.id }), {}, { preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ meta.total }} {{ t('admin.commandes.table.count', meta.total) }}</Badge>
            <Button v-if="isAdmin" variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.orderArchives.create')">
                    <Archive class="size-4" />
                    {{ t('admin.commandes.archiveLink') }}
                </Link>
            </Button>
        </div>

        <div class="flex items-center gap-2">
            <Input :placeholder="t('admin.commandes.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-8" />
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('number')">
                                {{ t('admin.commandes.table.number') }}
                                <component :is="sortIcon('number')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('createdAt')">
                                {{ t('admin.commandes.table.date') }}
                                <component :is="sortIcon('createdAt')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('requesterName')">
                                {{ t('admin.commandes.table.requester') }}
                                <component :is="sortIcon('requesterName')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.commandes.table.organization') }}</TableHead>
                        <TableHead>{{ t('admin.commandes.table.status') }}</TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('totalAmount')">
                                {{ t('admin.commandes.table.amount') }}
                                <component :is="sortIcon('totalAmount')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.commandes.table.actions') }}</TableHead>
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
                                <TableCell class="text-sm text-muted-foreground">
                                    <span v-if="order.organizationName">{{ order.organizationName }}</span>
                                    <span v-else class="italic">{{ t('admin.commandes.table.noOrganization') }}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge :variant="orderStatusVariant(order.status)">{{ t(orderStatusLabelKey(order.status)) }}</Badge>
                                </TableCell>
                                <TableCell class="text-sm font-medium">{{ order.totalAmount.toFixed(2) }} s</TableCell>
                                <TableCell @click.stop class="space-x-2">
                                    <Button v-if="order.fileUrl" as-child variant="outline" size="sm" class="gap-1">
                                        <a :href="order.fileUrl" target="_blank" rel="noopener">
                                            <Download class="size-4" />
                                            {{ t('admin.commandes.table.download') }}
                                        </a>
                                    </Button>
                                    <Button v-if="canValidate(order)" size="sm" class="gap-1" @click="validateOrder(order)">
                                        <CircleCheck class="size-4" />
                                        {{ t('admin.commandes.actions.validate') }}
                                    </Button>
                                    <CancelOrderButton v-if="canCancel(order)" :number="order.number" size="sm" @confirm="cancelOrder(order)" />
                                </TableCell>
                            </TableRow>
                            <TableRow v-if="expanded.has(order.id)">
                                <TableCell />
                                <TableCell :colspan="7" class="bg-muted/30 p-3">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{{ t('admin.commandes.detail.resource') }}</TableHead>
                                                <TableHead>{{ t('admin.commandes.detail.quantity') }}</TableHead>
                                                <TableHead>{{ t('admin.commandes.detail.unitPrice') }}</TableHead>
                                                <TableHead>{{ t('admin.commandes.detail.total') }}</TableHead>
                                                <TableHead>{{ t('admin.commandes.detail.delivery') }}</TableHead>
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
                        <TableCell :colspan="8" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.commandes.table.empty') }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <div class="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" :disabled="meta.currentPage <= 1" @click="navigate({ page: meta.currentPage - 1 })">&larr;</Button>
            <div class="text-sm text-muted-foreground">{{ meta.currentPage }} / {{ meta.lastPage }}</div>
            <Button variant="outline" size="sm" :disabled="meta.currentPage >= meta.lastPage" @click="navigate({ page: meta.currentPage + 1 })">&rarr;</Button>
        </div>
    </div>
</template>
