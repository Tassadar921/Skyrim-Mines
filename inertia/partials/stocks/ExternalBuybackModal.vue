<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Dialog, DialogTrigger, DialogScrollContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';
import type { Data } from '@generated/data';

const { t } = useI18n();

const props = defineProps<{
    resources: Data.Resource[];
}>();

const TYPE_ORDER: Record<string, number> = { minerai: 0, lingot: 1 };

const orderedResources = computed(() => [...props.resources].sort((a, b) => (TYPE_ORDER[a.type] ?? 2) - (TYPE_ORDER[b.type] ?? 2)));

function resourceLabel(resource: Data.Resource): string {
    return `${resource.name} (${t(`admin.resources.types.${resource.type}`)})`;
}

function buildQuantities(items: Data.Resource[]): Record<string, number> {
    return Object.fromEntries(items.map((item) => [item.id, 0]));
}

const open = ref(false);
const isSubmitting = ref(false);
const quantities = reactive<Record<string, number>>(buildQuantities(props.resources));

watch(
    () => props.resources,
    (value) => {
        Object.assign(quantities, buildQuantities(value));
    },
);

function setQuantity(id: string, value: number) {
    quantities[id] = value;
}

const totalToPay = computed(() => props.resources.reduce((sum, resource) => sum + (quantities[resource.id] ?? 0) * resource.buyPrice, 0));

function submitExternalBuyback() {
    const items = orderedResources.value.map((resource) => ({
        resourceId: resource.id,
        quantity: quantities[resource.id] ?? 0,
    }));

    isSubmitting.value = true;
    router.post(
        urlFor('admin.stocks.externalBuyback'),
        { items },
        {
            preserveScroll: true,
            onSuccess: () => {
                Object.assign(quantities, buildQuantities(props.resources));
                open.value = false;
            },
            onFinish: () => {
                isSubmitting.value = false;
            },
        },
    );
}
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button variant="outline">{{ t('admin.stocks.externalBuyback.trigger') }}</Button>
        </DialogTrigger>
        <DialogScrollContent class="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{{ t('admin.stocks.externalBuyback.title') }}</DialogTitle>
            </DialogHeader>
            <p class="text-sm text-muted-foreground">{{ t('admin.stocks.externalBuyback.description') }}</p>

            <div class="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>{{ t('admin.stocks.externalBuyback.unitPrice') }}</TableHead>
                            <TableHead>{{ t('deposit.quantity') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="resource in orderedResources" :key="resource.id">
                            <TableCell class="text-sm font-medium">{{ resourceLabel(resource) }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ resource.buyPrice.toFixed(2) }} s</TableCell>
                            <TableCell>
                                <QuantityStepper :model-value="quantities[resource.id] ?? 0" @update:model-value="(value) => setQuantity(resource.id, value)" />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <div class="flex items-center justify-end gap-2 text-lg border-t pt-3">
                <span class="text-muted-foreground">{{ t('admin.stocks.externalBuyback.totalToPay') }}</span>
                <span class="font-medium">{{ totalToPay.toFixed(2) }} s</span>
            </div>

            <Button class="w-full" :disabled="isSubmitting || totalToPay <= 0" @click="submitExternalBuyback">
                {{ t('admin.stocks.externalBuyback.submit') }}
            </Button>
        </DialogScrollContent>
    </Dialog>
</template>
