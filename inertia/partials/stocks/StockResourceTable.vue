<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from '~/components/ui/alert-dialog';
import { Pencil } from '@lucide/vue';
import QuantityStepper from './QuantityStepper.vue';
import type { Data } from '@generated/data';

const { t } = useI18n();

const props = defineProps<{
    resources: Data.Resource[];
    quantities: Record<string, { quantityBarrel: number; quantityPurchased: number }>;
    editablePurchased?: boolean;
    editableBarrelTotal?: boolean;
}>();

const emit = defineEmits<{
    'update-purchased': [id: string, value: string | number];
}>();

function stockValue(resource: Data.Resource): number {
    return resource.sellPrice * (props.quantities[resource.id]?.quantityPurchased ?? 0);
}

const barrelInputs = reactive<Record<string, number>>({});

function barrelInputValue(resource: Data.Resource): number {
    return barrelInputs[resource.id] ?? props.quantities[resource.id]?.quantityBarrel ?? 0;
}

function resetBarrelInput(resource: Data.Resource) {
    barrelInputs[resource.id] = props.quantities[resource.id]?.quantityBarrel ?? 0;
}

function barrelDelta(resource: Data.Resource): number {
    return barrelInputValue(resource) - (props.quantities[resource.id]?.quantityBarrel ?? 0);
}

const submittingBarrelId = ref<string | null>(null);

function submitBarrelTotal(resource: Data.Resource) {
    submittingBarrelId.value = resource.id;
    router.patch(
        urlFor('admin.stocks.barrel.update', { resourceId: resource.id }),
        { quantity: barrelInputValue(resource) },
        { preserveScroll: true, onFinish: () => (submittingBarrelId.value = null) },
    );
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
                            <div class="flex items-center gap-1">
                                {{ quantities[resource.id]?.quantityBarrel ?? 0 }}

                                <AlertDialog v-if="editableBarrelTotal">
                                    <AlertDialogTrigger as-child>
                                        <Button variant="ghost" size="icon-sm" class="size-6" @click="resetBarrelInput(resource)">
                                            <Pencil class="size-3.5" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{{ t('stocks.table.barrelEdit.title', { name: resource.name }) }}</AlertDialogTitle>
                                            <AlertDialogDescription>{{ t('stocks.table.barrelEdit.description') }}</AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <div class="space-y-3">
                                            <div class="text-sm text-muted-foreground">
                                                {{ t('stocks.table.barrelEdit.current', { quantity: quantities[resource.id]?.quantityBarrel ?? 0 }) }}
                                            </div>
                                            <QuantityStepper :model-value="barrelInputValue(resource)" @update:model-value="(value) => (barrelInputs[resource.id] = value)" />
                                            <div v-if="barrelDelta(resource) > 0" class="text-sm text-amber-600 dark:text-amber-500">
                                                {{ t('stocks.table.barrelEdit.willAdd', { quantity: barrelDelta(resource) }) }}
                                            </div>
                                            <div v-else-if="barrelDelta(resource) < 0" class="text-sm text-amber-600 dark:text-amber-500">
                                                {{ t('stocks.table.barrelEdit.willRemove', { quantity: -barrelDelta(resource) }) }}
                                            </div>
                                        </div>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{{ t('stocks.table.barrelEdit.cancel') }}</AlertDialogCancel>
                                            <AlertDialogAction :disabled="barrelDelta(resource) === 0 || submittingBarrelId === resource.id" @click="submitBarrelTotal(resource)">
                                                {{ t('stocks.table.barrelEdit.confirm') }}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </TableCell>
                        <TableCell class="text-sm">
                            <QuantityStepper
                                v-if="editablePurchased"
                                :model-value="quantities[resource.id]?.quantityPurchased ?? 0"
                                @update:model-value="(value) => emit('update-purchased', resource.id, value)"
                            />
                            <template v-else>{{ quantities[resource.id]?.quantityPurchased ?? 0 }}</template>
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
