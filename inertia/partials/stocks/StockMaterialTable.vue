<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import QuantityStepper from './QuantityStepper.vue';
import type { Data } from '@generated/data';

const { t } = useI18n();

defineProps<{
    materials: Data.Material[];
    quantities: Record<string, number>;
    editableMaterialId?: string;
}>();

const emit = defineEmits<{
    'update-quantity': [id: string, value: string | number];
}>();
</script>

<template>
    <div class="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{{ t('stocks.table.name') }}</TableHead>
                    <TableHead>{{ t('stocks.table.buyPrice') }}</TableHead>
                    <TableHead>{{ t('stocks.table.inStock') }}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <template v-if="materials.length">
                    <TableRow v-for="material in materials" :key="material.id">
                        <TableCell class="text-sm font-medium">{{ material.name }}</TableCell>
                        <TableCell class="text-sm text-muted-foreground">{{ material.buyPrice }}</TableCell>
                        <TableCell>
                            <QuantityStepper
                                v-if="editableMaterialId === material.id"
                                :model-value="quantities[material.id] ?? 0"
                                @update:model-value="(value) => emit('update-quantity', material.id, value)"
                            />
                            <span v-else class="text-sm">{{ quantities[material.id] ?? 0 }}</span>
                        </TableCell>
                    </TableRow>
                </template>
                <TableRow v-else>
                    <TableCell :colspan="3" class="h-24 text-center text-muted-foreground">
                        {{ t('stocks.table.empty') }}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>
