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

type ResourceWithBarrel = Data.Resource & { quantityBarrel: number; soljundBarrel: number };

const { t } = useI18n();

const props = defineProps<{
    resources: ResourceWithBarrel[];
}>();

const TYPE_ORDER: Record<string, number> = { minerai: 0, lingot: 1 };

const barrelResources = computed(() => props.resources.filter((r) => r.quantityBarrel > 0).sort((a, b) => (TYPE_ORDER[a.type] ?? 2) - (TYPE_ORDER[b.type] ?? 2)));

function resourceLabel(resource: ResourceWithBarrel): string {
    return `${resource.name} (${t(`admin.resources.types.${resource.type}`)})`;
}

function buildQuantities(items: ResourceWithBarrel[]): Record<string, number> {
    return Object.fromEntries(items.map((item) => [item.id, 0]));
}

const open = ref(false);
const isSubmitting = ref(false);
const quantities = reactive<Record<string, number>>(buildQuantities(props.resources));

const soljundResourceId = computed(() => barrelResources.value.find((r) => r.name === 'Pierre de Lune' && r.type === 'minerai')?.id);
const soljundQuantity = ref(0);

watch(
    () => props.resources,
    (value) => {
        Object.assign(quantities, buildQuantities(value));
    },
);

function setQuantity(id: string, value: number) {
    quantities[id] = value;
    if (id === soljundResourceId.value && soljundQuantity.value > value) {
        soljundQuantity.value = value;
    }
}

function setAllMax() {
    for (const resource of barrelResources.value) {
        quantities[resource.id] = resource.quantityBarrel;
        if (resource.id === soljundResourceId.value) {
            soljundQuantity.value = resource.soljundBarrel;
        }
    }
}

function submitBuyback() {
    const items = barrelResources.value.map((resource) => ({
        resourceId: resource.id,
        quantity: quantities[resource.id] ?? 0,
        soljundQuantity: resource.id === soljundResourceId.value ? soljundQuantity.value : 0,
    }));

    isSubmitting.value = true;
    router.post(
        urlFor('buybacks.store'),
        { items },
        {
            preserveScroll: true,
            onSuccess: () => {
                Object.assign(quantities, buildQuantities(props.resources));
                soljundQuantity.value = 0;
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
            <Button variant="outline">{{ t('buyback.trigger') }}</Button>
        </DialogTrigger>
        <DialogScrollContent class="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{{ t('buyback.title') }}</DialogTitle>
            </DialogHeader>

            <Button class="w-full" @click="setAllMax">{{ t('buyback.buyAll') }}</Button>

            <div class="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>{{ t('stocks.table.quantityBarrel') }}</TableHead>
                            <TableHead>{{ t('deposit.quantity') }}</TableHead>
                            <TableHead>{{ t('deposit.soljundColumn') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="resource in barrelResources" :key="resource.id">
                            <TableCell class="text-sm font-medium">{{ resourceLabel(resource) }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ resource.quantityBarrel }}</TableCell>
                            <TableCell>
                                <QuantityStepper :model-value="quantities[resource.id] ?? 0" :max="resource.quantityBarrel" show-max @update:model-value="(value) => setQuantity(resource.id, value)" />
                            </TableCell>
                            <TableCell>
                                <QuantityStepper
                                    v-if="resource.id === soljundResourceId"
                                    :model-value="soljundQuantity"
                                    :max="Math.min(quantities[resource.id] ?? 0, resource.soljundBarrel)"
                                    show-max
                                    @update:model-value="(value) => (soljundQuantity = value)"
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <Button class="w-full" :disabled="isSubmitting" @click="submitBuyback">
                {{ t('buyback.submit') }}
            </Button>
        </DialogScrollContent>
    </Dialog>
</template>
