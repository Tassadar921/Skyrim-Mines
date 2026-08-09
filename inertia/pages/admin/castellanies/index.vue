<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Link } from '@adonisjs/inertia/vue';
import { Plus } from '@lucide/vue';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();
pageTitle.value = t('admin.castellanies.title');

defineProps<{
    castellanies: { id: string; name: string; commissionAmount: number; largeOrderFeeRate: number }[];
}>();
</script>

<template>
    <div class="space-y-4">
        <div v-if="isAdmin" class="flex items-center justify-end">
            <Button as-child class="gap-2">
                <Link :href="urlFor('admin.castellanies.create')">
                    <Plus class="size-4" />
                    {{ t('admin.castellanies.new') }}
                </Link>
            </Button>
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.castellanies.table.name') }}</TableHead>
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
    </div>
</template>
