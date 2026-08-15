<script setup lang="ts">
import { computed, ref } from 'vue';
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Link } from '@adonisjs/inertia/vue';
import { Plus, FilterX } from '@lucide/vue';
import DraggableResourceTable from '~/partials/admin/DraggableResourceTable.vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.resources.title');

type PaginatedResources = {
    resources: Data.Resource[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
};

const props = defineProps<{
    minerais: PaginatedResources;
    lingots: PaginatedResources;
    filters: { search: string; sort: string; dir: string };
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const mineraiIsDefaultView = computed(() => !props.filters.search && !props.filters.sort && props.minerais.meta.currentPage === 1);
const lingotIsDefaultView = computed(() => !props.filters.search && !props.filters.sort && props.lingots.meta.currentPage === 1);

function navigate(overrides: Record<string, string | number | undefined>) {
    const params: Record<string, string | number | undefined> = {
        search: searchValue.value || undefined,
        sort: props.filters.sort || undefined,
        dir: props.filters.dir || undefined,
        mineraiPage: props.minerais.meta.currentPage,
        lingotPage: props.lingots.meta.currentPage,
        ...overrides,
    };
    const clean: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.resources.index'), clean, { preserveState: true, preserveScroll: true });
}

function onSearchInput(value: string | number) {
    searchValue.value = String(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        navigate({ search: searchValue.value || undefined, mineraiPage: 1, lingotPage: 1 });
    }, 300);
}

function onSort(column: string) {
    if (props.filters.sort === column) {
        navigate({ sort: column, dir: props.filters.dir === 'asc' ? 'desc' : 'asc', mineraiPage: 1, lingotPage: 1 });
    } else {
        navigate({ sort: column, dir: 'asc', mineraiPage: 1, lingotPage: 1 });
    }
}

function onMineraiPage(page: number) {
    navigate({ mineraiPage: page });
}

function onLingotPage(page: number) {
    navigate({ lingotPage: page });
}

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || props.minerais.meta.currentPage !== 1 || props.lingots.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.resources.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-10">
        <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
                <Input :placeholder="t('admin.resources.table.name') + '…'" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
                <Button variant="ghost" size="sm" class="gap-1" :disabled="!hasActiveFilters" @click="resetFilters">
                    <FilterX class="size-4" />
                    {{ t('admin.common.resetFilters') }}
                </Button>
            </div>
            <Button v-if="isAdmin" as-child class="gap-2">
                <Link :href="urlFor('admin.resources.create')">
                    <Plus class="size-4" />
                    {{ t('admin.resources.new') }}
                </Link>
            </Button>
        </div>

        <div class="space-y-3">
            <h2 class="text-lg font-medium">{{ t('admin.resources.types.minerai') }}</h2>
            <DraggableResourceTable
                :resources="minerais.resources"
                :meta="minerais.meta"
                :sort="filters.sort"
                :dir="filters.dir"
                :is-default-view="mineraiIsDefaultView"
                @sort="onSort"
                @page="onMineraiPage"
            />
        </div>

        <div class="space-y-3">
            <h2 class="text-lg font-medium">{{ t('admin.resources.types.lingot') }}</h2>
            <DraggableResourceTable
                :resources="lingots.resources"
                :meta="lingots.meta"
                :sort="filters.sort"
                :dir="filters.dir"
                :is-default-view="lingotIsDefaultView"
                @sort="onSort"
                @page="onLingotPage"
            />
        </div>
    </div>
</template>
