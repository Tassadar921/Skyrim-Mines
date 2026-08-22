<script setup lang="ts">
import { computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import StockResourceTable from '~/partials/stocks/StockResourceTable.vue';
import StockMaterialTable from '~/partials/stocks/StockMaterialTable.vue';
import type { Data } from '@generated/data';

type ResourceStockLine = { id: string; quantityBarrel: number; quantityPurchased: number; quantityPurchasedSoljund: number; soljundQuantity: number };
type ResourceQuantities = Record<string, { quantityBarrel: number; quantityPurchased: number; quantityPurchasedSoljund: number; soljundQuantity: number }>;
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
    return Object.fromEntries(
        items.map((item) => [
            item.id,
            { quantityBarrel: item.quantityBarrel, quantityPurchased: item.quantityPurchased, quantityPurchasedSoljund: item.quantityPurchasedSoljund, soljundQuantity: item.soljundQuantity },
        ]),
    );
}

function toMaterialQuantityMap(items: MaterialStockLine[]): MaterialQuantities {
    return Object.fromEntries(items.map((item) => [item.id, item.quantity]));
}

const resourceQuantities = computed(() => toResourceQuantityMap(props.resources));
const materialQuantities = computed(() => toMaterialQuantityMap(props.materials));

const totalStockValue = computed(() => props.resources.reduce((sum, resource) => sum + resource.sellPrice * (resourceQuantities.value[resource.id]?.quantityPurchased ?? 0), 0));
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
                <StockResourceTable :resources="minerais" :quantities="resourceQuantities" />
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.lingot') }}</h2>
                <StockResourceTable :resources="lingots" :quantities="resourceQuantities" />
            </div>

            <div class="flex items-center justify-end gap-2 text-lg">
                <span class="text-slate-600 dark:text-slate-300">{{ t('stocks.totalValue') }}</span>
                <span class="font-medium text-slate-800 dark:text-slate-100">{{ totalStockValue.toFixed(2) }}</span>
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.materials.title') }}</h2>
                <StockMaterialTable :materials="materials" :quantities="materialQuantities" />
            </div>
        </div>
    </div>
</template>
