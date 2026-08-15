<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { AcceptableValue } from 'reka-ui';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, ChevronRight, FilterX } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

type BuybackDetail = {
    resourceId: string;
    resourceName: string;
    username: string;
    quantity: number;
    unitPrice: number;
    amount: number;
};

type BuybackResourceLine = {
    resourceId: string;
    resourceName: string;
    quantity: number;
    amount: number;
};

type BuybackGroup = {
    batchId: string;
    createdAt: string;
    weekNumber: number;
    totalQuantity: number;
    totalAmount: number;
    resources: BuybackResourceLine[];
    details: BuybackDetail[];
};

type WeeklyTotal = {
    weekNumber: number;
    startDate: string;
    endDate: string;
    totalQuantity: number;
    totalAmount: number;
};

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.buybacks.title');

const props = defineProps<{
    buybacks: BuybackGroup[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string; week: number | null };
    weeklyTotals: WeeklyTotal[];
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const expanded = ref(new Set<string>());

function groupKey(group: BuybackGroup): string {
    return group.batchId;
}

function resourceSummary(group: BuybackGroup): string {
    return group.resources.map((resource) => resource.resourceName).join(', ');
}

function toggleExpanded(group: BuybackGroup) {
    const key = groupKey(group);
    if (expanded.value.has(key)) {
        expanded.value.delete(key);
    } else {
        expanded.value.add(key);
    }
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
    router.get(urlFor('admin.buybacks.index'), clean, { preserveState: true, preserveScroll: true });
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

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || props.filters.week !== null || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.buybacks.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ meta.total }} {{ t('admin.buybacks.table.count', meta.total) }}</Badge>
        </div>

        <div class="rounded-md border p-3 space-y-2">
            <div class="text-sm font-medium text-muted-foreground">{{ t('admin.buybacks.weekly.title') }}</div>
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
                        <span class="text-sm font-medium">{{ t('admin.buybacks.table.weekBadge', { week: weeklyTotal.weekNumber }) }}</span>
                        <Badge v-if="index === 0" variant="outline" class="text-xs">{{ t('admin.common.weekly.current') }}</Badge>
                    </div>
                    <div class="text-xs text-muted-foreground">{{ formatWeekRange(weeklyTotal) }}</div>
                    <div class="mt-1 text-sm font-medium">{{ weeklyTotal.totalAmount.toFixed(2) }} s</div>
                    <div class="text-xs text-muted-foreground">{{ weeklyTotal.totalQuantity }} {{ t('admin.buybacks.weekly.units') }}</div>
                </button>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <Input :placeholder="t('admin.buybacks.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
            <Select :model-value="filters.week ? String(filters.week) : 'all'" @update:model-value="onWeekFilterChange">
                <SelectTrigger class="w-56">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{{ t('admin.buybacks.table.allWeeks') }}</SelectItem>
                    <SelectItem v-for="weeklyTotal in weeklyTotals" :key="weeklyTotal.weekNumber" :value="String(weeklyTotal.weekNumber)">
                        {{ t('admin.buybacks.table.weekBadge', { week: weeklyTotal.weekNumber }) }} ({{ formatWeekRange(weeklyTotal) }})
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
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('createdAt')">
                                {{ t('admin.buybacks.table.date') }}
                                <component :is="sortIcon('createdAt')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('week')">
                                {{ t('admin.buybacks.table.week') }}
                                <component :is="sortIcon('week')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('resource')">
                                {{ t('admin.buybacks.table.resource') }}
                                <component :is="sortIcon('resource')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('quantity')">
                                {{ t('admin.buybacks.table.quantity') }}
                                <component :is="sortIcon('quantity')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('amount')">
                                {{ t('admin.buybacks.table.amount') }}
                                <component :is="sortIcon('amount')" class="size-4" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="buybacks.length">
                        <template v-for="group in buybacks" :key="groupKey(group)">
                            <TableRow class="cursor-pointer" @click="toggleExpanded(group)">
                                <TableCell>
                                    <ChevronDown v-if="expanded.has(groupKey(group))" class="size-4 text-muted-foreground" />
                                    <ChevronRight v-else class="size-4 text-muted-foreground" />
                                </TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ new Date(group.createdAt).toLocaleString(undefined, { timeZone: 'UTC' }) }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">
                                    <Badge variant="secondary">{{ t('admin.buybacks.table.weekBadge', { week: group.weekNumber }) }}</Badge>
                                </TableCell>
                                <TableCell class="text-sm font-medium">{{ resourceSummary(group) }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ group.totalQuantity }}</TableCell>
                                <TableCell class="text-sm font-medium">{{ group.totalAmount.toFixed(2) }} s</TableCell>
                            </TableRow>
                            <TableRow v-if="expanded.has(groupKey(group))">
                                <TableCell />
                                <TableCell :colspan="5" class="bg-muted/30 p-3">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{{ t('admin.buybacks.detail.resource') }}</TableHead>
                                                <TableHead>{{ t('admin.buybacks.detail.user') }}</TableHead>
                                                <TableHead>{{ t('admin.buybacks.detail.quantity') }}</TableHead>
                                                <TableHead>{{ t('admin.buybacks.detail.unitPrice') }}</TableHead>
                                                <TableHead>{{ t('admin.buybacks.detail.amount') }}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow v-for="detail in group.details" :key="`${detail.resourceId}-${detail.username}`">
                                                <TableCell class="text-sm font-medium">{{ detail.resourceName }}</TableCell>
                                                <TableCell class="text-sm font-medium">{{ detail.username }}</TableCell>
                                                <TableCell class="text-sm text-muted-foreground">{{ detail.quantity }}</TableCell>
                                                <TableCell class="text-sm text-muted-foreground">{{ detail.unitPrice.toFixed(2) }} s</TableCell>
                                                <TableCell class="text-sm font-medium">{{ detail.amount.toFixed(2) }} s</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableCell>
                            </TableRow>
                        </template>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="6" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.buybacks.table.empty') }}
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
