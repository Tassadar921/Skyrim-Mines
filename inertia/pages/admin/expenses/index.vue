<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import type { AcceptableValue } from 'reka-ui';
import { ArrowUp, ArrowDown, ArrowUpDown, Plus, FilterX } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.expenses.title');

type ExpenseRow = { id: string; weekNumber: number; title: string; label: string; amount: number; createdAt: string };
type WeeklyTotal = { weekNumber: number; startDate: string; endDate: string; totalAmount: number };

const props = defineProps<{
    expenses: ExpenseRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string; week: number | null };
    currentWeek: number;
    weeklyTotals: WeeklyTotal[];
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
    router.get(urlFor('admin.expenses.index'), clean, { preserveState: true, preserveScroll: true });
}

function onWeekFilterChange(value: AcceptableValue) {
    navigate({ week: value === 'all' || value === null ? undefined : Number(value), page: 1 });
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

function formatWeekRange(weeklyTotal: WeeklyTotal): string {
    const format = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
    return `${format(weeklyTotal.startDate)} - ${format(weeklyTotal.endDate)}`;
}

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || props.filters.week !== null || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.expenses.index'), {}, { preserveState: true, preserveScroll: true });
}

const open = ref(false);

const expenseForm = useForm({
    weekNumber: String(props.currentWeek),
    title: '',
    label: '',
    amount: '',
});

function submitAddExpense() {
    expenseForm.post(urlFor('admin.expenses.store'), {
        preserveScroll: true,
        onSuccess: () => {
            expenseForm.reset('title', 'label', 'amount');
            open.value = false;
        },
    });
}

function deleteExpense(id: string) {
    router.delete(urlFor('admin.expenses.destroy', { id }), { preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <div class="rounded-md border p-3 space-y-2">
            <div class="text-sm font-medium text-muted-foreground">{{ t('admin.expenses.weekly.title') }}</div>
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
                        <span class="text-sm font-medium">{{ t('admin.expenses.weekly.weekBadge', { week: weeklyTotal.weekNumber }) }}</span>
                        <Badge v-if="index === 0" variant="outline" class="text-xs">{{ t('admin.common.weekly.current') }}</Badge>
                    </div>
                    <div class="text-xs text-muted-foreground">{{ formatWeekRange(weeklyTotal) }}</div>
                    <div class="mt-1 text-sm font-medium">{{ weeklyTotal.totalAmount.toFixed(2) }} s</div>
                </button>
            </div>
        </div>

        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ meta.total }} {{ t('admin.expenses.table.count', meta.total) }}</Badge>

            <Dialog v-if="isAdmin" v-model:open="open">
                <DialogTrigger as-child>
                    <Button size="sm" class="gap-2">
                        <Plus class="size-4" />
                        {{ t('admin.expenses.add') }}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{{ t('admin.expenses.add') }}</DialogTitle>
                    </DialogHeader>

                    <div class="space-y-4">
                        <Input v-model="expenseForm.weekNumber" type="number" min="1" step="1" :label="t('admin.expenses.fields.week')" :error="expenseForm.errors.weekNumber" />
                        <Input v-model="expenseForm.title" :label="t('admin.expenses.fields.title')" maxlength="100" :error="expenseForm.errors.title" />
                        <Input v-model="expenseForm.label" :label="t('admin.expenses.fields.label')" maxlength="255" :error="expenseForm.errors.label" />
                        <Input v-model="expenseForm.amount" type="number" min="0" step="0.01" :label="t('admin.expenses.fields.amount')" :error="expenseForm.errors.amount" />

                        <Button class="w-full" :loading="expenseForm.processing" :disabled="expenseForm.processing" @click="submitAddExpense">
                            {{ t('admin.expenses.submit') }}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        <div class="flex items-center gap-2">
            <Input :placeholder="t('admin.expenses.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
            <Select :model-value="filters.week ? String(filters.week) : 'all'" @update:model-value="onWeekFilterChange">
                <SelectTrigger class="w-56">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{{ t('admin.expenses.table.allWeeks') }}</SelectItem>
                    <SelectItem v-for="weeklyTotal in weeklyTotals" :key="weeklyTotal.weekNumber" :value="String(weeklyTotal.weekNumber)">
                        {{ t('admin.expenses.weekly.weekBadge', { week: weeklyTotal.weekNumber }) }} ({{ formatWeekRange(weeklyTotal) }})
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
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('week')">
                                {{ t('admin.expenses.table.week') }}
                                <component :is="sortIcon('week')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('title')">
                                {{ t('admin.expenses.table.title') }}
                                <component :is="sortIcon('title')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.expenses.table.label') }}</TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('amount')">
                                {{ t('admin.expenses.table.amount') }}
                                <component :is="sortIcon('amount')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.expenses.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="props.expenses.length">
                        <TableRow v-for="expense in props.expenses" :key="expense.id">
                            <TableCell>
                                <Badge variant="secondary">{{ t('admin.expenses.weekly.weekBadge', { week: expense.weekNumber }) }}</Badge>
                            </TableCell>
                            <TableCell class="text-sm font-medium">{{ expense.title }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ expense.label }}</TableCell>
                            <TableCell class="text-sm font-medium">{{ expense.amount.toFixed(2) }} s</TableCell>
                            <TableCell>
                                <DeleteButton
                                    v-if="isAdmin"
                                    :label="t('admin.expenses.delete.label')"
                                    :title="t('admin.expenses.delete.title')"
                                    :description="t('admin.expenses.delete.description', { title: expense.title })"
                                    :cancel-label="t('admin.expenses.delete.cancel')"
                                    :confirm-label="t('admin.expenses.delete.confirm')"
                                    @confirm="deleteExpense(expense.id)"
                                />
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="5" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.expenses.table.empty') }}
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
