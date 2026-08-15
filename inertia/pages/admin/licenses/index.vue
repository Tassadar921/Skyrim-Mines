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
pageTitle.value = t('admin.licenses.title');

type SubscriberRow = { id: string; username: string; role: string; lastPaidWeek: number | null; totalPaid: number; paymentCount: number; isUpToDate: boolean };
type EligibleUser = Data.User;
type WeeklyTotal = { weekNumber: number; startDate: string; endDate: string; totalAmount: number; paymentCount: number };

const props = defineProps<{
    prices: { citizenPrice: number; nonCitizenPrice: number };
    subscribers: SubscriberRow[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string; role: string; status: string };
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
        role: props.filters.role || undefined,
        status: props.filters.status || undefined,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.licenses.index'), clean, { preserveState: true, preserveScroll: true });
}

function onSearchInput(value: string | number) {
    searchValue.value = String(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        navigate({ search: searchValue.value || undefined, page: 1 });
    }, 300);
}

function onRoleFilterChange(value: AcceptableValue) {
    navigate({ role: value === 'all' || value === null ? undefined : String(value), page: 1 });
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

const citizenPrice = ref(String(props.prices.citizenPrice));
const nonCitizenPrice = ref(String(props.prices.nonCitizenPrice));
const isSubmittingPrices = ref(false);

function submitPrices() {
    isSubmittingPrices.value = true;
    router.put(
        urlFor('admin.licenses.prices.update'),
        { citizenPrice: citizenPrice.value, nonCitizenPrice: nonCitizenPrice.value },
        { preserveScroll: true, onFinish: () => (isSubmittingPrices.value = false) },
    );
}

function formatWeekRange(weeklyTotal: WeeklyTotal): string {
    const format = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
    return `${format(weeklyTotal.startDate)} - ${format(weeklyTotal.endDate)}`;
}

const open = ref(false);

const subscriberForm = useForm({
    mode: 'new',
    userId: '',
    discordId: '',
    username: '',
    role: 'contractor',
});

function submitAddSubscriber() {
    subscriberForm
        .transform((data) => (data.mode === 'existing' ? { mode: data.mode, userId: data.userId } : { mode: data.mode, discordId: data.discordId, username: data.username, role: data.role }))
        .post(urlFor('admin.licenses.subscribers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                subscriberForm.reset();
                open.value = false;
            },
        });
}

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || !!props.filters.role || !!props.filters.status || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.licenses.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-6">
        <div class="rounded-md border p-5 space-y-4 max-w-lg">
            <div class="text-sm font-medium">{{ t('admin.licenses.prices.title') }}</div>
            <div class="grid grid-cols-2 gap-3">
                <Input v-model="citizenPrice" type="number" :label="t('admin.licenses.prices.citizen')" min="0" step="0.01" :readonly="!isAdmin" />
                <Input v-model="nonCitizenPrice" type="number" :label="t('admin.licenses.prices.nonCitizen')" min="0" step="0.01" :readonly="!isAdmin" />
            </div>
            <Button v-if="isAdmin" :loading="isSubmittingPrices" :disabled="isSubmittingPrices" @click="submitPrices">
                {{ t('admin.licenses.prices.save') }}
            </Button>
        </div>

        <div class="rounded-md border p-3 space-y-2">
            <div class="text-sm font-medium text-muted-foreground">{{ t('admin.licenses.weekly.title') }}</div>
            <div class="flex gap-2 overflow-x-auto pb-1">
                <div v-for="(weeklyTotal, index) in weeklyTotals" :key="weeklyTotal.weekNumber" class="w-40 shrink-0 rounded-md border p-2">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-sm font-medium">{{ t('admin.licenses.weekly.weekBadge', { week: weeklyTotal.weekNumber }) }}</span>
                        <Badge v-if="index === 0" variant="outline" class="text-xs">{{ t('admin.common.weekly.current') }}</Badge>
                    </div>
                    <div class="text-xs text-muted-foreground">{{ formatWeekRange(weeklyTotal) }}</div>
                    <div class="mt-1 text-sm font-medium">{{ weeklyTotal.totalAmount.toFixed(2) }} s</div>
                    <div class="text-xs text-muted-foreground">{{ weeklyTotal.paymentCount }} {{ t('admin.licenses.weekly.payments') }}</div>
                </div>
            </div>
        </div>

        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <Badge variant="outline">{{ meta.total }} {{ t('admin.licenses.table.count', meta.total) }}</Badge>

                <Dialog v-if="isAdmin" v-model:open="open">
                    <DialogTrigger as-child>
                        <Button size="sm" class="gap-2">
                            <Plus class="size-4" />
                            {{ t('admin.licenses.subscribers.add') }}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{{ t('admin.licenses.subscribers.add') }}</DialogTitle>
                        </DialogHeader>

                        <div class="space-y-4">
                            <div class="space-y-1">
                                <Label>{{ t('admin.licenses.subscribers.mode') }}</Label>
                                <Select v-model="subscriberForm.mode">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">{{ t('admin.licenses.subscribers.modeNew') }}</SelectItem>
                                        <SelectItem value="existing">{{ t('admin.licenses.subscribers.modeExisting') }}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div v-if="subscriberForm.mode === 'existing'" class="space-y-1">
                                <Label>{{ t('admin.licenses.subscribers.existingUser') }}</Label>
                                <Select v-model="subscriberForm.userId">
                                    <SelectTrigger>
                                        <SelectValue :placeholder="t('admin.licenses.subscribers.existingUserPlaceholder')" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="eligibleUser in props.eligibleUsers" :key="eligibleUser.id" :value="eligibleUser.id">
                                            {{ eligibleUser.username }} ({{ t(`admin.licenses.roles.${eligibleUser.role}`) }})
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p v-if="subscriberForm.errors.userId" class="text-sm text-destructive">{{ subscriberForm.errors.userId }}</p>
                            </div>

                            <template v-else>
                                <Input v-model="subscriberForm.discordId" :label="t('admin.users.create.fields.discordId')" :error="subscriberForm.errors.discordId" maxlength="32" required />
                                <Input v-model="subscriberForm.username" :label="t('admin.users.create.fields.username')" :error="subscriberForm.errors.username" maxlength="50" required />
                                <div class="space-y-1">
                                    <Label>{{ t('admin.licenses.subscribers.role') }}</Label>
                                    <Select v-model="subscriberForm.role">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contractor">{{ t('admin.licenses.roles.contractor') }}</SelectItem>
                                            <SelectItem value="client">{{ t('admin.licenses.roles.client') }}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </template>

                            <Button class="w-full" :loading="subscriberForm.processing" :disabled="subscriberForm.processing" @click="submitAddSubscriber">
                                {{ t('admin.licenses.subscribers.submit') }}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div class="flex items-center gap-2">
                <Input :placeholder="t('admin.licenses.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
                <Select :model-value="filters.role || 'all'" @update:model-value="onRoleFilterChange">
                    <SelectTrigger class="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{{ t('admin.licenses.table.allRoles') }}</SelectItem>
                        <SelectItem value="contractor">{{ t('admin.licenses.roles.contractor') }}</SelectItem>
                        <SelectItem value="client">{{ t('admin.licenses.roles.client') }}</SelectItem>
                    </SelectContent>
                </Select>
                <Select :model-value="filters.status || 'all'" @update:model-value="onStatusFilterChange">
                    <SelectTrigger class="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{{ t('admin.licenses.table.allStatuses') }}</SelectItem>
                        <SelectItem value="upToDate">{{ t('admin.licenses.table.upToDate') }}</SelectItem>
                        <SelectItem value="late">{{ t('admin.licenses.table.late') }}</SelectItem>
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
                                <Button variant="ghost" class="gap-1 px-2" @click="onSort('username')">
                                    {{ t('admin.licenses.table.username') }}
                                    <component :is="sortIcon('username')" class="size-4" />
                                </Button>
                            </TableHead>
                            <TableHead>{{ t('admin.licenses.table.role') }}</TableHead>
                            <TableHead>{{ t('admin.licenses.table.status') }}</TableHead>
                            <TableHead>{{ t('admin.licenses.table.totalPaid') }}</TableHead>
                            <TableHead>{{ t('admin.licenses.table.actions') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <template v-if="props.subscribers.length">
                            <TableRow v-for="subscriber in props.subscribers" :key="subscriber.id">
                                <TableCell class="text-sm font-medium">{{ subscriber.username }}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{{ t(`admin.licenses.roles.${subscriber.role}`) }}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge v-if="subscriber.isUpToDate" variant="outline">{{ t('admin.licenses.table.upToDate') }}</Badge>
                                    <Badge v-else variant="destructive">{{ t('admin.licenses.table.late') }}</Badge>
                                </TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ subscriber.totalPaid.toFixed(2) }} s</TableCell>
                                <TableCell>
                                    <Link :route="'admin.licenses.subscribers.show'" :params="{ id: subscriber.id }">
                                        <Button variant="outline" size="sm" class="gap-1">
                                            <Eye class="size-4" />
                                            {{ t('admin.licenses.table.view') }}
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        </template>
                        <TableRow v-else>
                            <TableCell :colspan="5" class="h-24 text-center text-muted-foreground">
                                {{ t('admin.licenses.table.empty') }}
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
