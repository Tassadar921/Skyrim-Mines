<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Link } from '@adonisjs/inertia/vue';
import { Plus, Eye } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.organizations.title');

type OrganizationLine = { id: string; name: string; memberCount: number; ownerUsernames: string[] };

const props = defineProps<{
    organizations: OrganizationLine[];
}>();
</script>

<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <Badge variant="outline">{{ props.organizations.length }} {{ t('admin.organizations.table.count', props.organizations.length) }}</Badge>
            <Button v-if="isAdmin" as-child class="gap-2">
                <Link :href="urlFor('admin.organizations.create')">
                    <Plus class="size-4" />
                    {{ t('admin.organizations.new') }}
                </Link>
            </Button>
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.organizations.table.name') }}</TableHead>
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
    </div>
</template>
