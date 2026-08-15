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
import { ArrowUp, ArrowDown, ArrowUpDown, Plus, Eye, FilterX } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.organizations.title');

type OrganizationLine = { id: string; name: string; memberCount: number; ownerUsernames: string[] };

const props = defineProps<{
    organizations: OrganizationLine[];
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
    router.get(urlFor('admin.organizations.index'), clean, { preserveState: true, preserveScroll: true });
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
    router.get(urlFor('admin.organizations.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ meta.total }} {{ t('admin.organizations.table.count', meta.total) }}</Badge>
            <Button v-if="isAdmin" as-child class="gap-2">
                <Link :href="urlFor('admin.organizations.create')">
                    <Plus class="size-4" />
                    {{ t('admin.organizations.new') }}
                </Link>
            </Button>
        </div>

        <div class="flex items-center gap-2">
            <Input :placeholder="t('admin.organizations.table.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
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
                                {{ t('admin.organizations.table.name') }}
                                <component :is="sortIcon('name')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ t('admin.organizations.table.members') }}</TableHead>
                        <TableHead>{{ t('admin.organizations.table.owner') }}</TableHead>
                        <TableHead>{{ t('admin.organizations.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="props.organizations.length">
                        <TableRow v-for="organization in props.organizations" :key="organization.id">
                            <TableCell class="text-sm font-medium">{{ organization.name }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ organization.memberCount }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground">
                                <span v-if="organization.ownerUsernames.length">{{ organization.ownerUsernames.join(', ') }}</span>
                                <span v-else class="italic">{{ t('admin.organizations.table.noOwner') }}</span>
                            </TableCell>
                            <TableCell>
                                <Link :route="'admin.organizations.show'" :params="{ id: organization.id }">
                                    <Button variant="outline" size="sm" class="gap-1">
                                        <Eye class="size-4" />
                                        {{ t('admin.organizations.table.view') }}
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="4" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.organizations.table.empty') }}
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
