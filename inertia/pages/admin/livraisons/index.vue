<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from '~/components/ui/alert-dialog';
import type { AcceptableValue } from 'reka-ui';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight, FilterX, PackageMinus } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

type DeliveryLine = { resourceName: string; resourceType: string; quantity: number; unitPrice: number; totalPrice: number; profit: number | null };
type DeliveryRow = {
    id: string;
    deliveredAt: string;
    weekNumber: number;
    orderNumber: number;
    requesterName: string;
    organizationName: string | null;
    castellanyName: string | null;
    stockDeducted: boolean;
    lines: DeliveryLine[];
    totalProfit: number;
};

type WeeklyTotal = {
    weekNumber: number;
    startDate: string;
    endDate: string;
    deliveryCount: number;
    totalAmount: number;
    totalQuantity: number;
    byOre: { resourceName: string; quantity: number }[];
};

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isManager } = useAuth();
pageTitle.value = t('admin.livraisons.title');

const props = defineProps<{
    deliveries: DeliveryRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string; week: number | null };
    weeklyTotals: WeeklyTotal[];
    pendingStockDeductionCount: number;
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const expanded = ref(new Set<string>());

function toggleExpanded(delivery: DeliveryRow) {
    if (expanded.value.has(delivery.id)) {
        expanded.value.delete(delivery.id);
    } else {
        expanded.value.add(delivery.id);
    }
}

function deliveryTotal(delivery: DeliveryRow): number {
    return delivery.lines.reduce((sum, line) => sum + line.totalPrice, 0);
}

function formatOrderNumber(number: number): string {
    return String(number).padStart(5, '0');
}

function navigate(overrides: Record<string, string | number | undefined>) {
    const params: Record<string, string | number | undefined> = {
        search: searchValue.value || undefined,
        sort: props.filters.sort,
        dir: props.filters.dir,
        week: props.filters.week ?? undefined,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.livraisons.index'), clean, { preserveState: true, preserveScroll: true });
}

function onWeekFilterChange(value: AcceptableValue) {
    navigate({ week: value === 'all' || value === null ? undefined : Number(value), page: 1 });
}

function formatWeekRange(weeklyTotal: WeeklyTotal): string {
    const format = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
    return `${format(weeklyTotal.startDate)} - ${format(weeklyTotal.endDate)}`;
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

function deleteDelivery(delivery: DeliveryRow) {
    router.delete(urlFor('admin.livraisons.destroy', { id: delivery.id }), { preserveScroll: true });
}

const deductingId = ref<string | null>(null);

function deductStock(delivery: DeliveryRow) {
    deductingId.value = delivery.id;
    router.patch(urlFor('admin.livraisons.deductStock', { id: delivery.id }), {}, { preserveScroll: true, preserveState: true, onFinish: () => (deductingId.value = null) });
}

function markStockDeducted(delivery: DeliveryRow) {
    deductingId.value = delivery.id;
    router.patch(urlFor('admin.livraisons.markStockDeducted', { id: delivery.id }), {}, { preserveScroll: true, preserveState: true, onFinish: () => (deductingId.value = null) });
}

const isDeductingAll = ref(false);

function deductStockAll() {
    isDeductingAll.value = true;
    router.post(urlFor('admin.livraisons.deductStockAll'), {}, { preserveScroll: true, preserveState: true, onFinish: () => (isDeductingAll.value = false) });
}

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || props.filters.week !== null || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.livraisons.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ meta.total }} {{ t('admin.livraisons.table.count', meta.total) }}</Badge>

            <AlertDialog v-if="isManager && pendingStockDeductionCount > 0">
                <AlertDialogTrigger as-child>
                    <Button variant="outline" size="sm" class="gap-2" :loading="isDeductingAll" :disabled="isDeductingAll">
                        <PackageMinus class="size-4" />
                        {{ t('admin.livraisons.deductStock.allButton', { count: pendingStockDeductionCount }) }}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{{ t('admin.livraisons.deductStock.allConfirm.title') }}</AlertDialogTitle>
                        <AlertDialogDescription>{{ t('admin.livraisons.deductStock.allConfirm.description', { count: pendingStockDeductionCount }) }}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{{ t('admin.livraisons.deductStock.allConfirm.cancel') }}</AlertDialogCancel>
                        <AlertDialogAction @click="deductStockAll">{{ t('admin.livraisons.deductStock.allConfirm.confirm') }}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <div class="rounded-md border p-3 space-y-2">
            <div class="text-sm font-medium text-muted-foreground">{{ t('admin.livraisons.weekly.title') }}</div>
            <div class="flex gap-2 overflow-x-auto pb-1">
                <button
                    v-for="(weeklyTotal, index) in weeklyTotals"
                    :key="weeklyTotal.weekNumber"
                    type="button"
                    class="w-40 shrink-0 rounded-md border p-2 text-left transition-colors hover:bg-muted/50"
                    :class="filters.week === weeklyTotal.weekNumber ? 'border-primary bg-muted/50' : ''"
                    @click="navigate({ week: filters.week === weeklyTotal.weekNumber ? undefined : weeklyTotal.weekNumber, page: 1 })"
                >
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-medium">{{ t('admin.livraisons.table.weekBadge', { week: weeklyTotal.weekNumber }) }}</span>
                        <Badge v-if="index === 0" variant="outline" class="text-xs">{{ t('admin.common.weekly.current') }}</Badge>
                    </div>
                    <div class="text-xs text-muted-foreground">{{ formatWeekRange(weeklyTotal) }}</div>
                    <div class="mt-1 text-sm font-medium">{{ weeklyTotal.totalAmount.toFixed(2) }} s</div>
                    <div class="text-xs text-muted-foreground">{{ weeklyTotal.deliveryCount }} {{ t('admin.livraisons.weekly.deliveries', weeklyTotal.deliveryCount) }}</div>
                </button>
            </div>
        </div>

        <div class="rounded-md border p-3 space-y-2">
            <div class="text-sm font-medium text-muted-foreground">{{ t('admin.livraisons.weeklyQuantities.title') }}</div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.livraisons.table.week') }}</TableHead>
                        <TableHead>{{ t('admin.livraisons.weeklyQuantities.table.total') }}</TableHead>
                        <TableHead>{{ t('admin.livraisons.weeklyQuantities.table.detail') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="weeklyTotal in weeklyTotals" :key="weeklyTotal.weekNumber">
                        <TableCell class="text-sm font-medium">{{ t('admin.livraisons.table.weekBadge', { week: weeklyTotal.weekNumber }) }}</TableCell>
                        <TableCell class="text-sm font-medium">{{ weeklyTotal.totalQuantity }} {{ t('admin.livraisons.weekly.units') }}</TableCell>
                        <TableCell>
                            <div v-if="weeklyTotal.byOre.length" class="flex flex-wrap gap-1">
                                <Badge v-for="ore in weeklyTotal.byOre" :key="ore.resourceName" variant="secondary" class="text-xs">{{ ore.resourceName }} : {{ ore.quantity }}</Badge>
                            </div>
                            <span v-else class="text-xs text-muted-foreground">{{ t('admin.livraisons.weeklyQuantities.table.none') }}</span>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <div class="flex items-center gap-2">
            <Input :placeholder="t('admin.livraisons.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
            <Select :model-value="filters.week ? String(filters.week) : 'all'" @update:model-value="onWeekFilterChange">
                <SelectTrigger class="w-56">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{{ t('admin.livraisons.table.allWeeks') }}</SelectItem>
                    <SelectItem v-for="weeklyTotal in weeklyTotals" :key="weeklyTotal.weekNumber" :value="String(weeklyTotal.weekNumber)">
                        {{ t('admin.livraisons.table.weekBadge', { week: weeklyTotal.weekNumber }) }} ({{ formatWeekRange(weeklyTotal) }})
                    </SelectItem>
                </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" class="gap-1" :disabled="!hasActiveFilters" @click="resetFilters">
                <FilterX class="size-4" />
                {{ t('admin.common.resetFilters') }}
            </Button>
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-8" />
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('deliveredAt')">
                                {{ t('admin.livraisons.table.date') }}
                                <component :is="sortIcon('deliveredAt')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('week')">
                                {{ t('admin.livraisons.table.week') }}
                                <component :is="sortIcon('week')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.livraisons.table.order') }}</TableHead>
                        <TableHead>{{ t('admin.livraisons.table.organization') }}</TableHead>
                        <TableHead>{{ t('admin.livraisons.table.amount') }}</TableHead>
                        <TableHead>{{ t('admin.livraisons.table.profit') }}</TableHead>
                        <TableHead>{{ t('admin.livraisons.deductStock.column') }}</TableHead>
                        <TableHead>{{ t('admin.livraisons.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="deliveries.length">
                        <template v-for="delivery in deliveries" :key="delivery.id">
                            <TableRow class="cursor-pointer" @click="toggleExpanded(delivery)">
                                <TableCell>
                                    <ChevronDown v-if="expanded.has(delivery.id)" class="size-4 text-muted-foreground" />
                                    <ChevronRight v-else class="size-4 text-muted-foreground" />
                                </TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ new Date(delivery.deliveredAt).toLocaleString('fr-FR', { timeZone: 'UTC' }) }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">
                                    <Badge variant="secondary">{{ t('admin.livraisons.table.weekBadge', { week: delivery.weekNumber }) }}</Badge>
                                </TableCell>
                                <TableCell class="text-sm font-medium">{{ formatOrderNumber(delivery.orderNumber) }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">
                                    <span v-if="delivery.organizationName">{{ delivery.organizationName }}</span>
                                    <span v-else class="italic">{{ t('admin.livraisons.table.noOrganization') }}</span>
                                </TableCell>
                                <TableCell class="text-sm font-medium">{{ deliveryTotal(delivery).toFixed(2) }} s</TableCell>
                                <TableCell class="text-sm font-medium" :class="delivery.totalProfit >= 0 ? 'text-green-600' : 'text-destructive'">{{ delivery.totalProfit.toFixed(2) }} s</TableCell>
                                <TableCell @click.stop>
                                    <Badge v-if="delivery.stockDeducted" variant="outline">{{ t('admin.livraisons.deductStock.deducted') }}</Badge>
                                    <div v-else-if="isManager" class="flex items-center gap-1">
                                        <AlertDialog>
                                            <AlertDialogTrigger as-child>
                                                <Button variant="outline" size="sm" class="gap-1" :loading="deductingId === delivery.id" :disabled="deductingId === delivery.id">
                                                    <PackageMinus class="size-4" />
                                                    {{ t('admin.livraisons.deductStock.action') }}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{{ t('admin.livraisons.deductStock.confirm.title') }}</AlertDialogTitle>
                                                    <AlertDialogDescription>{{ t('admin.livraisons.deductStock.confirm.description') }}</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{{ t('admin.livraisons.deductStock.confirm.cancel') }}</AlertDialogCancel>
                                                    <AlertDialogAction @click="deductStock(delivery)">{{ t('admin.livraisons.deductStock.confirm.confirm') }}</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger as-child>
                                                <Button variant="ghost" size="sm" class="gap-1" :loading="deductingId === delivery.id" :disabled="deductingId === delivery.id">
                                                    {{ t('admin.livraisons.deductStock.markAction') }}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{{ t('admin.livraisons.deductStock.markConfirm.title') }}</AlertDialogTitle>
                                                    <AlertDialogDescription>{{ t('admin.livraisons.deductStock.markConfirm.description') }}</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{{ t('admin.livraisons.deductStock.markConfirm.cancel') }}</AlertDialogCancel>
                                                    <AlertDialogAction @click="markStockDeducted(delivery)">{{ t('admin.livraisons.deductStock.markConfirm.confirm') }}</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    <Badge v-else variant="secondary">{{ t('admin.livraisons.deductStock.notDeducted') }}</Badge>
                                </TableCell>
                                <TableCell @click.stop>
                                    <DeleteButton
                                        v-if="isManager"
                                        :label="t('admin.livraisons.delete.label')"
                                        :title="t('admin.livraisons.delete.title')"
                                        :description="t('admin.livraisons.delete.description', { number: formatOrderNumber(delivery.orderNumber) })"
                                        :cancel-label="t('admin.livraisons.delete.cancel')"
                                        :confirm-label="t('admin.livraisons.delete.confirm')"
                                        @confirm="deleteDelivery(delivery)"
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow v-if="expanded.has(delivery.id)">
                                <TableCell />
                                <TableCell :colspan="8" class="bg-muted/30 p-3">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{{ t('admin.livraisons.detail.resource') }}</TableHead>
                                                <TableHead>{{ t('admin.livraisons.detail.quantity') }}</TableHead>
                                                <TableHead>{{ t('admin.livraisons.detail.unitPrice') }}</TableHead>
                                                <TableHead>{{ t('admin.livraisons.detail.total') }}</TableHead>
                                                <TableHead>{{ t('admin.livraisons.detail.profit') }}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow v-for="line in delivery.lines" :key="line.resourceName">
                                                <TableCell class="text-sm font-medium">{{ line.resourceName }}</TableCell>
                                                <TableCell class="text-sm text-muted-foreground">{{ line.quantity }}</TableCell>
                                                <TableCell class="text-sm text-muted-foreground">{{ line.unitPrice.toFixed(2) }} s</TableCell>
                                                <TableCell class="text-sm font-medium">{{ line.totalPrice.toFixed(2) }} s</TableCell>
                                                <TableCell class="text-sm font-medium">
                                                    <span v-if="line.profit === null" class="text-muted-foreground italic">{{ t('admin.livraisons.detail.profitUnknown') }}</span>
                                                    <span v-else :class="line.profit >= 0 ? 'text-green-600' : 'text-destructive'">{{ line.profit.toFixed(2) }} s</span>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableCell>
                            </TableRow>
                        </template>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="9" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.livraisons.table.empty') }}
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
