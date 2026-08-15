<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Link } from '@adonisjs/inertia/vue';
import { Plus, FilterX } from '@lucide/vue';
import DraggableMaterialTable from '~/partials/admin/DraggableMaterialTable.vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.materials.title');

const props = defineProps<{
    materials: Data.Material[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string };
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const isDefaultView = computed(() => !props.filters.search && !props.filters.sort && props.meta.currentPage === 1);

function navigate(overrides: Record<string, string | number | boolean | undefined>) {
    const params: Record<string, string | number | boolean | undefined> = {
        search: searchValue.value || undefined,
        sort: props.filters.sort || undefined,
        dir: props.filters.dir,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.materials.index'), clean, { preserveState: true, preserveScroll: true });
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

const hasActiveFilters = computed(() => !!props.filters.search || !!props.filters.sort || props.meta.currentPage !== 1);

function resetFilters() {
    searchValue.value = '';
    router.get(urlFor('admin.materials.index'), {}, { preserveState: true, preserveScroll: true });
}
</script>

<template>
    <div class="space-y-10">
        <div v-if="isAdmin" class="flex items-center justify-end">
            <Button as-child class="gap-2">
                <Link :href="urlFor('admin.materials.create')">
                    <Plus class="size-4" />
                    {{ t('admin.materials.new') }}
                </Link>
            </Button>
        </div>

        <div class="flex items-center gap-4">
            <Input :placeholder="t('admin.materials.search')" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
            <Button variant="ghost" size="sm" class="gap-1" :disabled="!hasActiveFilters" @click="resetFilters">
                <FilterX class="size-4" />
                {{ t('admin.common.resetFilters') }}
            </Button>
        </div>

        <DraggableMaterialTable :materials="materials" :sort="filters.sort" :dir="filters.dir" :is-default-view="isDefaultView" @sort="onSort" />

        <div class="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" :disabled="meta.currentPage <= 1" @click="navigate({ page: meta.currentPage - 1 })">&larr;</Button>
            <div class="text-sm text-muted-foreground">{{ meta.currentPage }} / {{ meta.lastPage }}</div>
            <Button variant="outline" size="sm" :disabled="meta.currentPage >= meta.lastPage" @click="navigate({ page: meta.currentPage + 1 })">&rarr;</Button>
        </div>
    </div>
</template>
