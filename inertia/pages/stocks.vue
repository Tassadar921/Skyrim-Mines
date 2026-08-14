<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import StockResourceTable from '~/partials/stocks/StockResourceTable.vue';
import StockMaterialTable from '~/partials/stocks/StockMaterialTable.vue';
import type { Data } from '@generated/data';

type ResourceStockLine = { id: string; quantityBarrel: number; quantityPurchased: number; soljundQuantity: number };
type ResourceQuantities = Record<string, { quantityBarrel: number; quantityPurchased: number; soljundQuantity: number }>;
type MaterialStockLine = { id: string; quantity: number };
type MaterialQuantities = Record<string, number>;

const { t } = useI18n();

const props = defineProps<{
    resources: (Data.Resource & ResourceStockLine)[];
    materials: (Data.Material & MaterialStockLine)[];
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));

function toResourceQuantityMap(items: ResourceStockLine[]): ResourceQuantities {
    return Object.fromEntries(items.map((item) => [item.id, { quantityBarrel: item.quantityBarrel, quantityPurchased: item.quantityPurchased, soljundQuantity: item.soljundQuantity }]));
}

function toMaterialQuantityMap(items: MaterialStockLine[]): MaterialQuantities {
    return Object.fromEntries(items.map((item) => [item.id, item.quantity]));
}

const resourceQuantities = ref<ResourceQuantities>(toResourceQuantityMap(props.resources));
const materialQuantities = ref<MaterialQuantities>(toMaterialQuantityMap(props.materials));

watch(
    () => props.resources,
    (value) => {
        resourceQuantities.value = toResourceQuantityMap(value);
    },
);
watch(
    () => props.materials,
    (value) => {
        materialQuantities.value = toMaterialQuantityMap(value);
    },
);

const totalStockValue = computed(() => props.resources.reduce((sum, resource) => sum + resource.sellPrice * (resourceQuantities.value[resource.id]?.quantityPurchased ?? 0), 0));

const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function normalizeQuantity(value: string | number): number {
    return Math.max(0, Math.round(Number(value) || 0));
}

function updateResourceQuantity(id: string, value: string | number) {
    const quantity = normalizeQuantity(value);
    resourceQuantities.value[id] = { ...resourceQuantities.value[id], quantityPurchased: quantity };

    if (debounceTimers[id]) clearTimeout(debounceTimers[id]);
    debounceTimers[id] = setTimeout(() => {
        router.patch(urlFor('stocks.resources.updateQuantity', { id }), { quantity }, { preserveScroll: true, preserveState: true });
    }, 500);
}

function updateMaterialQuantity(id: string, value: string | number) {
    const quantity = normalizeQuantity(value);
    materialQuantities.value[id] = quantity;

    if (debounceTimers[id]) clearTimeout(debounceTimers[id]);
    debounceTimers[id] = setTimeout(() => {
        router.patch(urlFor('stocks.materials.updateQuantity', { id }), { quantity }, { preserveScroll: true, preserveState: true });
    }, 500);
}
</script>

<template>
    <Head :title="t('stocks.title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-16">
        <div class="flex flex-col items-center text-center gap-6">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('stocks.title') }}</h1>
        </div>

        <div class="max-w-5xl mx-auto space-y-10">
            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.minerai') }}</h2>
                <StockResourceTable :resources="minerais" :quantities="resourceQuantities" @update-quantity="updateResourceQuantity" />
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.lingot') }}</h2>
                <StockResourceTable :resources="lingots" :quantities="resourceQuantities" @update-quantity="updateResourceQuantity" />
            </div>

            <div class="flex items-center justify-end gap-2 text-lg">
                <span class="text-slate-600 dark:text-slate-300">{{ t('stocks.totalValue') }}</span>
                <span class="font-medium text-slate-800 dark:text-slate-100">{{ totalStockValue.toFixed(2) }}</span>
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.materials.title') }}</h2>
                <StockMaterialTable :materials="materials" :quantities="materialQuantities" @update-quantity="updateMaterialQuantity" />
            </div>
        </div>
    </div>
</template>
