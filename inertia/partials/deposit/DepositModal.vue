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

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));

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

function submitDeposit() {
    const items = props.resources.map((resource) => ({ resourceId: resource.id, quantity: quantities[resource.id] ?? 0 }));

    isSubmitting.value = true;
    router.post(
        urlFor('deposits.store'),
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
            <Button>{{ t('deposit.trigger') }}</Button>
        </DialogTrigger>
        <DialogScrollContent class="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{{ t('deposit.title') }}</DialogTitle>
            </DialogHeader>

            <Button class="w-full bg-green-600 text-white hover:bg-green-700" :disabled="isSubmitting" @click="submitDeposit">
                {{ t('deposit.submit') }}
            </Button>

            <div class="space-y-6">
                <div class="space-y-2">
                    <h3 class="text-sm font-medium text-muted-foreground">{{ t('admin.resources.types.minerai') }}</h3>
                    <div class="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{{ t('stocks.table.name') }}</TableHead>
                                    <TableHead>{{ t('deposit.quantity') }}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="resource in minerais" :key="resource.id">
                                    <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                    <TableCell>
                                        <QuantityStepper :model-value="quantities[resource.id] ?? 0" @update:model-value="(value) => setQuantity(resource.id, value)" />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div class="space-y-2">
                    <h3 class="text-sm font-medium text-muted-foreground">{{ t('admin.resources.types.lingot') }}</h3>
                    <div class="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{{ t('stocks.table.name') }}</TableHead>
                                    <TableHead>{{ t('deposit.quantity') }}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="resource in lingots" :key="resource.id">
                                    <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                    <TableCell>
                                        <QuantityStepper :model-value="quantities[resource.id] ?? 0" @update:model-value="(value) => setQuantity(resource.id, value)" />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Button class="w-full bg-green-600 text-white hover:bg-green-700" :disabled="isSubmitting" @click="submitDeposit">
                {{ t('deposit.submit') }}
            </Button>
        </DialogScrollContent>
    </Dialog>
</template>
