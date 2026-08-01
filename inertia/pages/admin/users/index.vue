<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, CheckCircle, XCircle } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.users.title');

const props = defineProps<{
    users: Data.User[];
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
    router.get(urlFor('admin.users.index'), clean, { preserveState: true, preserveScroll: true });
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
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ meta.total }} {{ $t('admin.users.table.userCount', meta.total) }}</Badge>
        </div>

        <div class="flex items-center gap-2">
            <Input :placeholder="$t('admin.users.table.username') + ' / ' + $t('admin.users.table.email') + '…'" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('username')">
                                {{ $t('admin.users.table.username') }}
                                <component :is="sortIcon('username')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('email')">
                                {{ $t('admin.users.table.email') }}
                                <component :is="sortIcon('email')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ $t('admin.users.table.role') }}</TableHead>
                        <TableHead>{{ $t('admin.users.table.enabled') }}</TableHead>
                        <TableHead>{{ $t('admin.users.table.acceptedTerms') }}</TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('createdAt')">
                                {{ $t('admin.users.table.createdAt') }}
                                <component :is="sortIcon('createdAt')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ $t('admin.users.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="users.length">
                        <TableRow v-for="user in users" :key="user.id">
                            <TableCell class="text-sm font-medium">{{ user.username }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground font-mono">{{ user.email }}</TableCell>
                            <TableCell>
                                <Badge :variant="user.role === 'admin' ? 'default' : 'secondary'">{{ user.role }}</Badge>
                            </TableCell>
                            <TableCell>
                                <CheckCircle v-if="user.enabled" class="size-4 text-green-600" />
                                <XCircle v-else class="size-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell>
                                <CheckCircle v-if="user.acceptedTermsAt" class="size-4 text-green-600" />
                                <XCircle v-else class="size-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ new Date(user.createdAt).toLocaleDateString(undefined, { timeZone: 'UTC' }) }}</TableCell>
                            <TableCell>
                                <Link :route="'admin.users.show'" :params="{ id: user.id }">
                                    <Button variant="outline" size="sm" class="gap-1">
                                        <Eye class="size-4" />
                                        {{ t('admin.users.table.view') }}
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="7" class="h-24 text-center text-muted-foreground">
                            {{ $t('admin.users.table.empty') }}
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
