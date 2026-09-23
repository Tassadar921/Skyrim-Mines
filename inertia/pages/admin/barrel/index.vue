<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, reactive, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { AcceptableValue } from 'reka-ui';
import { ArrowUp, ArrowDown, ArrowUpDown, FilterX } from '@lucide/vue';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';

defineOptions({ layout: AdminLayout });

type BarrelEntry = { userId: string; username: string; resourceId: string; resourceName: string; resourceType: string; quantity: number };
type ResourceOption = { id: string; name: string; type: string };

const { t } = useI18n();
const { isAdmin } = useAuth();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.barrel.title');

const props = defineProps<{
    entries: BarrelEntry[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string; resourceId: string | null };
    resourceOptions: ResourceOption[];
}>();

const mineraiOptions = computed(() => props.resourceOptions.filter((resource) => resource.type === 'minerai'));
const lingotOptions = computed(() => props.resourceOptions.filter((resource) => resource.type === 'lingot'));

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function navigate(overrides: Record<string, string | number | undefined>) {
    const params: Record<string, string | number | undefined> = {
        search: searchValue.value || undefined,
        sort: props.filters.sort,
        dir: props.filters.dir,
        resourceId: props.filters.resourceId ?? undefined,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.barrel.index'), clean, { preserveState: true, preserveScroll: true });
}

function onSearchInput(value: string | number) {
    searchValue.value = String(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        navigate({ search: searchValue.value || undefined, page: 1 });
    }, 300);
}

function onResourceFilterChange(value: AcceptableValue) {
    navigate({ resourceId: value === 'all' ? undefined : String(value), page: 1 });
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

function entryKey(entry: BarrelEntry): string {
    return `${entry.userId}:${entry.resourceId}`;
}

function toQuantityMap(entries: BarrelEntry[]): Record<string, number> {
    return Object.fromEntries(entries.map((entry) => [entryKey(entry), entry.quantity]));
}

const quantities = reactive<Record<string, number>>(toQuantityMap(props.entries));

watch(
    () => props.entries,
    (entries) => {
        Object.assign(quantities, toQuantityMap(entries));
    },
);

const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function updateQuantity(entry: BarrelEntry, value: number) {
    const key = entryKey(entry);
    const quantity = Math.max(0, Math.round(value));
    quantities[key] = quantity;

    if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
    debounceTimers[key] = setTimeout(() => {
        router.patch(urlFor('admin.barrel.update'), { userId: entry.userId, resourceId: entry.resourceId, quantity }, { preserveScroll: true, preserveState: true });
    }, 500);
}

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || !!props.filters.resourceId || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.barrel.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <p class="text-sm text-muted-foreground max-w-2xl">{{ t('admin.barrel.description') }}</p>

        <div class="flex items-center gap-4">
            <Input :placeholder="t('admin.barrel.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
            <Select :model-value="filters.resourceId ?? 'all'" @update:model-value="onResourceFilterChange">
                <SelectTrigger class="w-56">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{{ t('admin.barrel.table.allResources') }}</SelectItem>
                    <SelectGroup v-if="mineraiOptions.length">
                        <SelectLabel>{{ t('admin.resources.types.minerai') }}</SelectLabel>
                        <SelectItem v-for="resource in mineraiOptions" :key="resource.id" :value="resource.id">{{ resource.name }}</SelectItem>
                    </SelectGroup>
                    <SelectGroup v-if="lingotOptions.length">
                        <SelectLabel>{{ t('admin.resources.types.lingot') }}</SelectLabel>
                        <SelectItem v-for="resource in lingotOptions" :key="resource.id" :value="resource.id">{{ resource.name }}</SelectItem>
                    </SelectGroup>
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
                                {{ t('admin.barrel.table.user') }}
                                <component :is="sortIcon('username')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('resourceName')">
                                {{ t('admin.barrel.table.resource') }}
                                <component :is="sortIcon('resourceName')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.barrel.table.type') }}</TableHead>
                        <TableHead>{{ t('admin.barrel.table.quantity') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="entries.length">
                        <TableRow v-for="entry in entries" :key="entryKey(entry)">
                            <TableCell class="text-sm font-medium">{{ entry.username }}</TableCell>
                            <TableCell class="text-sm">{{ entry.resourceName }}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{{ t(`admin.resources.types.${entry.resourceType}`) }}</Badge>
                            </TableCell>
                            <TableCell>
                                <QuantityStepper v-if="isAdmin" :model-value="quantities[entryKey(entry)] ?? 0" @update:model-value="(value) => updateQuantity(entry, value)" />
                                <span v-else class="text-sm">{{ quantities[entryKey(entry)] ?? 0 }}</span>
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="4" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.barrel.table.empty') }}
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
