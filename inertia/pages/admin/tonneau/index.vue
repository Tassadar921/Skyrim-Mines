<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { reactive, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';

defineOptions({ layout: AdminLayout });

type TonneauEntry = { userId: string; username: string; resourceId: string; resourceName: string; resourceType: string; quantity: number };

const { t } = useI18n();
const { isAdmin } = useAuth();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.tonneau.title');

const props = defineProps<{
    entries: TonneauEntry[];
}>();

function entryKey(entry: TonneauEntry): string {
    return `${entry.userId}:${entry.resourceId}`;
}

function toQuantityMap(entries: TonneauEntry[]): Record<string, number> {
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

function updateQuantity(entry: TonneauEntry, value: number) {
    const key = entryKey(entry);
    const quantity = Math.max(0, Math.round(value));
    quantities[key] = quantity;

    if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
    debounceTimers[key] = setTimeout(() => {
        router.patch(urlFor('admin.tonneau.update'), { userId: entry.userId, resourceId: entry.resourceId, quantity }, { preserveScroll: true, preserveState: true });
    }, 500);
}
</script>

<template>
    <div class="space-y-4">
        <p class="text-sm text-muted-foreground max-w-2xl">{{ t('admin.tonneau.description') }}</p>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.tonneau.table.user') }}</TableHead>
                        <TableHead>{{ t('admin.tonneau.table.resource') }}</TableHead>
                        <TableHead>{{ t('admin.tonneau.table.type') }}</TableHead>
                        <TableHead>{{ t('admin.tonneau.table.quantity') }}</TableHead>
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
                            {{ t('admin.tonneau.table.empty') }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
</template>
