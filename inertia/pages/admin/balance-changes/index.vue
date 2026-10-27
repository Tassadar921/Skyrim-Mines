<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { formatDateTime, formatShortDate } from '~/lib/date_format';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { Link } from '@adonisjs/inertia/vue';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
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
import { ArrowUp, ArrowDown, ArrowUpDown, FilterX, Undo2 } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.balanceChanges.title');

type BalanceAction = 'update' | 'pay' | 'rollback';
type ChangeRow = {
    id: string;
    userId: string | null;
    username: string;
    changedByUserId: string | null;
    changedByUsername: string;
    action: BalanceAction;
    previousBalance: number;
    newBalance: number;
    weekNumber: number;
    createdAt: string;
    rolledBack: boolean;
};
type Week = { weekNumber: number; startDate: string; endDate: string };

const ACTIONS: BalanceAction[] = ['update', 'pay', 'rollback'];

const props = defineProps<{
    changes: ChangeRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string; week: number | null; action: BalanceAction | null };
    weeks: Week[];
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function navigate(overrides: Record<string, string | number | undefined>) {
    const params: Record<string, string | number | undefined> = {
        search: searchValue.value || undefined,
        sort: props.filters.sort,
        dir: props.filters.dir,
        week: props.filters.week ?? undefined,
        action: props.filters.action ?? undefined,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.balanceChanges.index'), clean, { preserveState: true, preserveScroll: true });
}

function onWeekFilterChange(value: AcceptableValue) {
    navigate({ week: value === 'all' || value === null ? undefined : Number(value) });
}

function onActionFilterChange(value: AcceptableValue) {
    navigate({ action: value === 'all' || value === null ? undefined : String(value) });
}

function onSearchInput(value: string | number) {
    searchValue.value = String(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        navigate({ search: searchValue.value || undefined });
    }, 300);
}

function onSort(column: string) {
    if (props.filters.sort === column) {
        navigate({ sort: column, dir: props.filters.dir === 'asc' ? 'desc' : 'asc' });
    } else {
        navigate({ sort: column, dir: 'asc' });
    }
}

function sortIcon(column: string) {
    if (props.filters.sort !== column) return ArrowUpDown;
    return props.filters.dir === 'asc' ? ArrowUp : ArrowDown;
}

function formatWeekRange(week: Week): string {
    return `${formatShortDate(week.startDate)} - ${formatShortDate(week.endDate)}`;
}

function formatDifference(change: ChangeRow): string {
    const difference = change.newBalance - change.previousBalance;
    return `${difference > 0 ? '+' : ''}${difference.toFixed(2)} s`;
}

const hasActiveFilters = computed(() => !!props.filters.search || props.filters.week !== null || props.filters.action !== null || props.meta.currentPage !== 1);

const rollingBackId = ref<string | null>(null);

function rollbackChange(id: string) {
    rollingBackId.value = id;
    router.post(urlFor('admin.balanceChanges.rollback', { id }), {}, { preserveScroll: true, onFinish: () => (rollingBackId.value = null) });
}

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.balanceChanges.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <Badge variant="outline">{{ meta.total }} {{ t('admin.balanceChanges.table.count', meta.total) }}</Badge>

        <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
            <Input :placeholder="t('admin.balanceChanges.table.search')" :model-value="searchValue" class="w-full lg:max-w-sm" @update:model-value="onSearchInput" />
            <Select :model-value="filters.week ? String(filters.week) : 'all'" @update:model-value="onWeekFilterChange">
                <SelectTrigger class="w-full lg:w-56">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{{ t('admin.balanceChanges.table.allWeeks') }}</SelectItem>
                    <SelectItem v-for="week in weeks" :key="week.weekNumber" :value="String(week.weekNumber)">
                        {{ t('admin.balanceChanges.table.weekBadge', { week: week.weekNumber }) }} ({{ formatWeekRange(week) }})
                    </SelectItem>
                </SelectContent>
            </Select>
            <Select :model-value="filters.action ?? 'all'" @update:model-value="onActionFilterChange">
                <SelectTrigger class="w-full lg:w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{{ t('admin.balanceChanges.table.allActions') }}</SelectItem>
                    <SelectItem v-for="action in ACTIONS" :key="action" :value="action">{{ t(`admin.balanceChanges.actions.${action}`) }}</SelectItem>
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
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('createdAt')">
                                {{ t('admin.balanceChanges.table.date') }}
                                <component :is="sortIcon('createdAt')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('week')">
                                {{ t('admin.balanceChanges.table.week') }}
                                <component :is="sortIcon('week')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('username')">
                                {{ t('admin.balanceChanges.table.user') }}
                                <component :is="sortIcon('username')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.balanceChanges.table.action') }}</TableHead>
                        <TableHead>{{ t('admin.balanceChanges.table.previousBalance') }}</TableHead>
                        <TableHead>{{ t('admin.balanceChanges.table.newBalance') }}</TableHead>
                        <TableHead>{{ t('admin.balanceChanges.table.difference') }}</TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('changedBy')">
                                {{ t('admin.balanceChanges.table.changedBy') }}
                                <component :is="sortIcon('changedBy')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.balanceChanges.table.rollback') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="props.changes.length">
                        <TableRow v-for="change in props.changes" :key="change.id">
                            <TableCell class="text-sm text-muted-foreground">{{ formatDateTime(change.createdAt) }}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{{ t('admin.balanceChanges.table.weekBadge', { week: change.weekNumber }) }}</Badge>
                            </TableCell>
                            <TableCell class="text-sm font-medium">
                                <Link v-if="change.userId" :route="'admin.users.show'" :params="{ id: change.userId }" class="hover:underline">{{ change.username }}</Link>
                                <span v-else>{{ change.username }}</span>
                            </TableCell>
                            <TableCell>
                                <Badge :variant="change.action === 'pay' ? 'default' : 'outline'">{{ t(`admin.balanceChanges.actions.${change.action}`) }}</Badge>
                            </TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ change.previousBalance.toFixed(2) }} s</TableCell>
                            <TableCell class="text-sm font-medium">{{ change.newBalance.toFixed(2) }} s</TableCell>
                            <TableCell class="text-sm" :class="change.newBalance >= change.previousBalance ? 'text-green-600' : 'text-destructive'">{{ formatDifference(change) }}</TableCell>
                            <TableCell class="text-sm">
                                <Link v-if="change.changedByUserId" :route="'admin.users.show'" :params="{ id: change.changedByUserId }" class="hover:underline">{{ change.changedByUsername }}</Link>
                                <span v-else>{{ change.changedByUsername }}</span>
                            </TableCell>
                            <TableCell>
                                <Badge v-if="change.rolledBack" variant="secondary">{{ t('admin.balanceChanges.rolledBack') }}</Badge>
                                <AlertDialog v-else-if="isAdmin && change.action !== 'rollback' && change.userId">
                                    <AlertDialogTrigger as-child>
                                        <Button variant="outline" size="sm" class="gap-1" :loading="rollingBackId === change.id" :disabled="rollingBackId !== null">
                                            <Undo2 class="size-4" />
                                            {{ t('admin.balanceChanges.rollback.label') }}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{{ t('admin.balanceChanges.rollback.title') }}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {{ t('admin.balanceChanges.rollback.description', { difference: formatDifference(change), username: change.username }) }}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{{ t('admin.balanceChanges.rollback.cancel') }}</AlertDialogCancel>
                                            <AlertDialogAction @click="rollbackChange(change.id)">{{ t('admin.balanceChanges.rollback.confirm') }}</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <span v-else class="text-xs text-muted-foreground">—</span>
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="9" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.balanceChanges.table.empty') }}
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
