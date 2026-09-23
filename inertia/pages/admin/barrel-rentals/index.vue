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
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Link } from '@adonisjs/inertia/vue';
import type { AcceptableValue } from 'reka-ui';
import { ArrowUp, ArrowDown, ArrowUpDown, Plus, Eye, FilterX } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.barrelRentals.title');

const NO_TENANT = 'none';

type BarrelRentalStatus = 'vacant' | 'upToDate' | 'late';
type RentalRow = {
    id: string;
    label: string;
    price: number;
    userId: string | null;
    username: string | null;
    role: string | null;
    lastPaidWeek: number | null;
    totalPaid: number;
    paymentCount: number;
    status: BarrelRentalStatus;
};
type EligibleUser = Data.User;
type WeeklyTotal = { weekNumber: number; startDate: string; endDate: string; totalAmount: number; paymentCount: number };

const props = defineProps<{
    rentals: RentalRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string; status: string };
    eligibleUsers: EligibleUser[];
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
        status: props.filters.status || undefined,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.barrelRentals.index'), clean, { preserveState: true, preserveScroll: true });
}

function onSearchInput(value: string | number) {
    searchValue.value = String(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        navigate({ search: searchValue.value || undefined, page: 1 });
    }, 300);
}

function onStatusFilterChange(value: AcceptableValue) {
    navigate({ status: value === 'all' || value === null ? undefined : String(value), page: 1 });
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

function statusVariant(status: BarrelRentalStatus): 'outline' | 'destructive' | 'secondary' {
    if (status === 'upToDate') return 'outline';
    if (status === 'late') return 'destructive';
    return 'secondary';
}

const open = ref(false);

const rentalForm = useForm({
    label: '',
    price: '0',
    userId: NO_TENANT,
});

function submitAddRental() {
    rentalForm
        .transform((data) => ({ ...data, userId: data.userId === NO_TENANT ? null : data.userId }))
        .post(urlFor('admin.barrelRentals.store'), {
            preserveScroll: true,
            onSuccess: () => {
                rentalForm.reset();
                open.value = false;
            },
        });
}

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || !!props.filters.status || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.barrelRentals.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-6">
        <p class="text-sm text-muted-foreground max-w-2xl">{{ t('admin.barrelRentals.description') }}</p>

        <div class="rounded-md border p-3 space-y-2">
            <div class="text-sm font-medium text-muted-foreground">{{ t('admin.barrelRentals.weekly.title') }}</div>
            <div class="flex gap-2 overflow-x-auto pb-1">
                <div v-for="(weeklyTotal, index) in weeklyTotals" :key="weeklyTotal.weekNumber" class="w-40 shrink-0 rounded-md border p-2">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-medium">{{ t('admin.barrelRentals.weekly.weekBadge', { week: weeklyTotal.weekNumber }) }}</span>
                        <Badge v-if="index === 0" variant="outline" class="text-xs">{{ t('admin.common.weekly.current') }}</Badge>
                    </div>
                    <div class="text-xs text-muted-foreground">{{ formatWeekRange(weeklyTotal) }}</div>
                    <div class="mt-1 text-sm font-medium">{{ weeklyTotal.totalAmount.toFixed(2) }} s</div>
                    <div class="text-xs text-muted-foreground">{{ weeklyTotal.paymentCount }} {{ t('admin.barrelRentals.weekly.payments') }}</div>
                </div>
            </div>
        </div>

        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <Badge variant="outline">{{ meta.total }} {{ t('admin.barrelRentals.table.count', meta.total) }}</Badge>

                <Dialog v-if="isAdmin" v-model:open="open">
                    <DialogTrigger as-child>
                        <Button size="sm" class="gap-2">
                            <Plus class="size-4" />
                            {{ t('admin.barrelRentals.add') }}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{{ t('admin.barrelRentals.add') }}</DialogTitle>
                        </DialogHeader>

                        <div class="space-y-4">
                            <Input v-model="rentalForm.label" :label="t('admin.barrelRentals.fields.label')" :error="rentalForm.errors.label" maxlength="100" required />

                            <Input v-model="rentalForm.price" type="number" min="0" step="0.01" :label="t('admin.barrelRentals.fields.price')" :error="rentalForm.errors.price" />

                            <div class="space-y-1">
                                <Label>{{ t('admin.barrelRentals.fields.tenant') }}</Label>
                                <Select v-model="rentalForm.userId">
                                    <SelectTrigger>
                                        <SelectValue :placeholder="t('admin.barrelRentals.fields.tenantPlaceholder')" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem :value="NO_TENANT">{{ t('admin.barrelRentals.fields.noTenant') }}</SelectItem>
                                        <SelectItem v-for="eligibleUser in props.eligibleUsers" :key="eligibleUser.id" :value="eligibleUser.id">
                                            {{ eligibleUser.username }} ({{ t(`admin.users.show.fields.roles.${eligibleUser.role}`) }})
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p v-if="rentalForm.errors.userId" class="text-sm text-destructive">{{ rentalForm.errors.userId }}</p>
                            </div>

                            <Button class="w-full" :loading="rentalForm.processing" :disabled="rentalForm.processing" @click="submitAddRental">
                                {{ t('admin.barrelRentals.submit') }}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div class="flex items-center gap-2">
                <Input :placeholder="t('admin.barrelRentals.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
                <Select :model-value="filters.status || 'all'" @update:model-value="onStatusFilterChange">
                    <SelectTrigger class="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{{ t('admin.barrelRentals.table.allStatuses') }}</SelectItem>
                        <SelectItem value="upToDate">{{ t('admin.barrelRentals.table.upToDate') }}</SelectItem>
                        <SelectItem value="late">{{ t('admin.barrelRentals.table.late') }}</SelectItem>
                        <SelectItem value="vacant">{{ t('admin.barrelRentals.table.vacant') }}</SelectItem>
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
                                <Button variant="ghost" class="gap-1 px-2" @click="onSort('label')">
                                    {{ t('admin.barrelRentals.table.label') }}
                                    <component :is="sortIcon('label')" class="size-4" />
                                </Button>
                            </TableHead>
                            <TableHead>{{ t('admin.barrelRentals.table.tenant') }}</TableHead>
                            <TableHead>{{ t('admin.barrelRentals.table.price') }}</TableHead>
                            <TableHead>{{ t('admin.barrelRentals.table.status') }}</TableHead>
                            <TableHead>{{ t('admin.barrelRentals.table.totalPaid') }}</TableHead>
                            <TableHead>{{ t('admin.barrelRentals.table.actions') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <template v-if="props.rentals.length">
                            <TableRow v-for="rental in props.rentals" :key="rental.id">
                                <TableCell class="text-sm font-medium">{{ rental.label }}</TableCell>
                                <TableCell class="text-sm">
                                    <span v-if="rental.username" class="inline-flex items-center gap-2">
                                        {{ rental.username }}
                                        <Badge variant="secondary">{{ t(`admin.users.show.fields.roles.${rental.role}`) }}</Badge>
                                    </span>
                                    <span v-else class="text-muted-foreground italic">{{ t('admin.barrelRentals.fields.noTenant') }}</span>
                                </TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ rental.price.toFixed(2) }} s</TableCell>
                                <TableCell>
                                    <Badge :variant="statusVariant(rental.status)">{{ t(`admin.barrelRentals.table.${rental.status}`) }}</Badge>
                                </TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ rental.totalPaid.toFixed(2) }} s</TableCell>
                                <TableCell>
                                    <Link :route="'admin.barrelRentals.show'" :params="{ id: rental.id }">
                                        <Button variant="outline" size="sm" class="gap-1">
                                            <Eye class="size-4" />
                                            {{ t('admin.barrelRentals.table.view') }}
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        </template>
                        <TableRow v-else>
                            <TableCell :colspan="6" class="h-24 text-center text-muted-foreground">
                                {{ t('admin.barrelRentals.table.empty') }}
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
    </div>
</template>
