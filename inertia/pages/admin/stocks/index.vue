<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import StockResourceTable from '~/partials/stocks/StockResourceTable.vue';
import StockMaterialTable from '~/partials/stocks/StockMaterialTable.vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

type ResourceStockLine = { id: string; quantityBarrel: number; quantityPurchased: number; soljundQuantity: number };
type ResourceQuantities = Record<string, { quantityBarrel: number; quantityPurchased: number; soljundQuantity: number }>;
type MaterialStockLine = { id: string; quantity: number };
type MaterialQuantities = Record<string, number>;

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.stocks.title');

const props = defineProps<{
    resources: (Data.Resource & ResourceStockLine)[];
    materials: (Data.Material & MaterialStockLine)[];
    dolineMaterialName: string;
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));

const dolineMaterialId = computed(() => props.materials.find((m) => m.name === props.dolineMaterialName)?.id);

function toResourceQuantityMap(items: ResourceStockLine[]): ResourceQuantities {
    return Object.fromEntries(items.map((item) => [item.id, { quantityBarrel: item.quantityBarrel, quantityPurchased: item.quantityPurchased, soljundQuantity: item.soljundQuantity }]));
}

function toMaterialQuantityMap(items: MaterialStockLine[]): MaterialQuantities {
    return Object.fromEntries(items.map((item) => [item.id, item.quantity]));
}

const resourceQuantities = computed(() => toResourceQuantityMap(props.resources));
const materialQuantities = reactive<MaterialQuantities>(toMaterialQuantityMap(props.materials));

watch(
    () => props.materials,
    (value) => {
        Object.assign(materialQuantities, toMaterialQuantityMap(value));
    },
);

const totalStockValue = computed(() => props.resources.reduce((sum, resource) => sum + resource.sellPrice * (resourceQuantities.value[resource.id]?.quantityPurchased ?? 0), 0));

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function updateDolineQuantity(id: string, value: string | number) {
    const quantity = Math.max(0, Math.round(Number(value) || 0));
    materialQuantities[id] = quantity;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        router.patch(urlFor('admin.stocks.doline.update'), { quantity }, { preserveScroll: true, preserveState: true });
    }, 500);
}
</script>

<template>
    <div class="space-y-10">
        <p class="text-sm text-muted-foreground max-w-2xl">{{ t('admin.stocks.description') }}</p>

        <div class="space-y-3">
            <h2 class="font-serif text-2xl font-light">{{ t('admin.resources.types.minerai') }}</h2>
            <StockResourceTable :resources="minerais" :quantities="resourceQuantities" />
        </div>

        <div class="space-y-3">
            <h2 class="font-serif text-2xl font-light">{{ t('admin.resources.types.lingot') }}</h2>
            <StockResourceTable :resources="lingots" :quantities="resourceQuantities" />
        </div>

        <div class="flex items-center justify-end gap-2 text-lg">
            <span class="text-muted-foreground">{{ t('stocks.totalValue') }}</span>
            <span class="font-medium">{{ totalStockValue.toFixed(2) }}</span>
        </div>

        <div class="space-y-3">
            <h2 class="font-serif text-2xl font-light">{{ t('admin.materials.title') }}</h2>
            <StockMaterialTable :materials="materials" :quantities="materialQuantities" :editable-material-id="dolineMaterialId" @update-quantity="updateDolineQuantity" />
        </div>
    </div>
</template>
