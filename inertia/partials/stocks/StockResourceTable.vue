<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import QuantityStepper from './QuantityStepper.vue';
import type { Data } from '@generated/data';

const { t } = useI18n();

const props = defineProps<{
    resources: Data.Resource[];
    quantities: Record<string, { quantityBarrel: number; quantityPurchased: number; quantityPurchasedSoljund: number; soljundQuantity: number }>;
    editablePurchased?: boolean;
    editableSoljundResourceId?: string;
}>();

const emit = defineEmits<{
    'update-purchased': [id: string, value: string | number];
    'update-purchased-soljund': [id: string, value: string | number];
    'update-barrel-soljund': [id: string, value: string | number];
}>();

function stockValue(resource: Data.Resource): number {
    return resource.sellPrice * (props.quantities[resource.id]?.quantityPurchased ?? 0);
}
</script>

<template>
    <div class="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{{ t('stocks.table.name') }}</TableHead>
                    <TableHead>{{ t('stocks.table.buyPrice') }}</TableHead>
                    <TableHead>{{ t('stocks.table.sellPrice') }}</TableHead>
                    <TableHead>{{ t('stocks.table.quantityBarrel') }}</TableHead>
                    <TableHead>{{ t('stocks.table.quantityPurchased') }}</TableHead>
                    <TableHead>{{ t('stocks.table.stockValue') }}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <template v-if="resources.length">
                    <TableRow v-for="resource in resources" :key="resource.id">
                        <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                        <TableCell class="text-sm text-muted-foreground">{{ resource.buyPrice }}</TableCell>
                        <TableCell class="text-sm text-muted-foreground">{{ resource.sellPrice }}</TableCell>
                        <TableCell class="text-sm">
                            {{ quantities[resource.id]?.quantityBarrel ?? 0 }}
                            <div v-if="editableSoljundResourceId === resource.id" class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                {{ t('stocks.table.soljundQuantityLabel') }}
                                <QuantityStepper :model-value="quantities[resource.id]?.soljundQuantity ?? 0" @update:model-value="(value) => emit('update-barrel-soljund', resource.id, value)" />
                            </div>
                            <div v-else-if="quantities[resource.id]?.soljundQuantity" class="text-xs text-muted-foreground">
                                {{ t('stocks.table.soljundQuantity', { quantity: quantities[resource.id].soljundQuantity }) }}
                            </div>
                        </TableCell>
                        <TableCell class="text-sm">
                            <QuantityStepper
                                v-if="editablePurchased"
                                :model-value="quantities[resource.id]?.quantityPurchased ?? 0"
                                @update:model-value="(value) => emit('update-purchased', resource.id, value)"
                            />
                            <template v-else>{{ quantities[resource.id]?.quantityPurchased ?? 0 }}</template>
                            <div v-if="editableSoljundResourceId === resource.id" class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                {{ t('stocks.table.quantityPurchasedSoljund') }}
                                <QuantityStepper
                                    :model-value="quantities[resource.id]?.quantityPurchasedSoljund ?? 0"
                                    @update:model-value="(value) => emit('update-purchased-soljund', resource.id, value)"
                                />
                            </div>
                            <div v-else-if="quantities[resource.id]?.quantityPurchasedSoljund" class="text-xs text-muted-foreground">
                                {{ t('stocks.table.quantityPurchasedSoljund') }} {{ quantities[resource.id].quantityPurchasedSoljund }}
                            </div>
                        </TableCell>
                        <TableCell class="text-sm font-medium">{{ stockValue(resource).toFixed(2) }}</TableCell>
                    </TableRow>
                </template>
                <TableRow v-else>
                    <TableCell :colspan="6" class="h-24 text-center text-muted-foreground">
                        {{ t('stocks.table.empty') }}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>
