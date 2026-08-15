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
import { Link } from '@adonisjs/inertia/vue';
import { ArrowUp, ArrowDown, ArrowUpDown, Plus, FilterX } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.castellanies.title');

const props = defineProps<{
    castellanies: { id: string; name: string; commissionAmount: number; largeOrderFeeRate: number }[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string };
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
    router.get(urlFor('admin.castellanies.index'), clean, { preserveState: true, preserveScroll: true });
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

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.castellanies.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ meta.total }}</Badge>
            <Button v-if="isAdmin" as-child class="gap-2">
                <Link :href="urlFor('admin.castellanies.create')">
                    <Plus class="size-4" />
                    {{ t('admin.castellanies.new') }}
                </Link>
            </Button>
        </div>

        <div class="flex items-center gap-4">
            <Input :placeholder="t('admin.castellanies.table.name') + '…'" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
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
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('name')">
                                {{ t('admin.castellanies.table.name') }}
                                <component :is="sortIcon('name')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.castellanies.table.commissionAmount') }}</TableHead>
                        <TableHead>{{ t('admin.castellanies.table.largeOrderFeeRate') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="castellanies.length">
                        <TableRow v-for="castellany in castellanies" :key="castellany.id" class="cursor-pointer" @click="router.visit(urlFor('admin.castellanies.show', { id: castellany.id }))">
                            <TableCell class="text-sm font-medium">{{ castellany.name }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ castellany.commissionAmount }} s</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ castellany.largeOrderFeeRate }} %</TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="3" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.castellanies.table.empty') }}
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
