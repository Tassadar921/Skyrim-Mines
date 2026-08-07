<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowUp, ArrowDown, ArrowUpDown, Eye, CheckCircle, XCircle, Plus, UserCircle } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.users.title');

type UserLine = Data.User & { avatarUrl: string | null };

const props = defineProps<{
    users: UserLine[];
    meta: { total: number; currentPage: number; lastPage: number; perPage: number };
    filters: { search: string; sort: string; dir: string; withoutAvatar: boolean };
}>();

const searchValue = ref(props.filters.search);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function navigate(overrides: Record<string, string | number | boolean | undefined>) {
    const params: Record<string, string | number | boolean | undefined> = {
        search: searchValue.value || undefined,
        sort: props.filters.sort,
        dir: props.filters.dir,
        withoutAvatar: props.filters.withoutAvatar || undefined,
        page: 1,
        ...overrides,
    };
    const clean: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    router.get(urlFor('admin.users.index'), clean, { preserveState: true, preserveScroll: true });
}

function onWithoutAvatarChange(checked: unknown) {
    navigate({ withoutAvatar: checked ? true : undefined, page: 1 });
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
            <Button v-if="isAdmin" as-child class="gap-2">
                <Link :href="urlFor('admin.users.create')">
                    <Plus class="size-4" />
                    {{ t('admin.users.new') }}
                </Link>
            </Button>
        </div>

        <div class="flex items-center gap-4">
            <Input :placeholder="$t('admin.users.table.username') + '…'" :model-value="searchValue" class="max-w-sm" @update:model-value="onSearchInput" />
            <div class="flex items-center gap-2">
                <Checkbox id="withoutAvatar" :model-value="filters.withoutAvatar" @update:model-value="onWithoutAvatarChange" />
                <Label for="withoutAvatar" class="cursor-pointer text-sm text-muted-foreground">{{ t('admin.users.table.withoutAvatar') }}</Label>
            </div>
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ $t('admin.users.table.avatar') }}</TableHead>
                        <TableHead>
                            <Button variant="ghost" class="gap-1 px-2" @click="onSort('username')">
                                {{ $t('admin.users.table.username') }}
                                <component :is="sortIcon('username')" class="size-4" />
                            </Button>
                        </TableHead>
                        <TableHead>{{ $t('admin.users.table.role') }}</TableHead>
                        <TableHead>{{ $t('admin.users.table.enabled') }}</TableHead>
                        <TableHead>{{ $t('admin.users.table.balance') }}</TableHead>
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
                            <TableCell>
                                <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.username" class="size-8 rounded-full object-cover" />
                                <UserCircle v-else class="size-8 text-muted-foreground" />
                            </TableCell>
                            <TableCell class="text-sm font-medium">{{ user.username }}</TableCell>
                            <TableCell>
                                <Badge :variant="user.role === 'admin' ? 'default' : 'secondary'">{{ user.role }}</Badge>
                            </TableCell>
                            <TableCell>
                                <CheckCircle v-if="user.enabled" class="size-4 text-green-600" />
                                <XCircle v-else class="size-4 text-muted-foreground" />
                            </TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ user.balance.toFixed(2) }} s</TableCell>
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
