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

type ResourceWithBarrel = Data.Resource & { quantityBarrel: number };

const { t } = useI18n();

const props = defineProps<{
    resources: ResourceWithBarrel[];
}>();

const barrelResources = computed(() => props.resources.filter((r) => r.quantityBarrel > 0));

function buildQuantities(items: ResourceWithBarrel[]): Record<string, number> {
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

function setAllMax() {
    for (const resource of barrelResources.value) {
        quantities[resource.id] = resource.quantityBarrel;
    }
}

function submitBuyback() {
    const items = barrelResources.value.map((resource) => ({ resourceId: resource.id, quantity: quantities[resource.id] ?? 0 }));

    isSubmitting.value = true;
    router.post(
        urlFor('buybacks.store'),
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
            <Button variant="outline">{{ t('buyback.trigger') }}</Button>
        </DialogTrigger>
        <DialogScrollContent class="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{{ t('buyback.title') }}</DialogTitle>
            </DialogHeader>

            <Button class="w-full" @click="setAllMax">{{ t('buyback.buyAll') }}</Button>

            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>{{ t('stocks.table.quantityBarrel') }}</TableHead>
                            <TableHead>{{ t('deposit.quantity') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="resource in barrelResources" :key="resource.id">
                            <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ resource.quantityBarrel }}</TableCell>
                            <TableCell>
                                <QuantityStepper :model-value="quantities[resource.id] ?? 0" :max="resource.quantityBarrel" show-max @update:model-value="(value) => setQuantity(resource.id, value)" />
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
