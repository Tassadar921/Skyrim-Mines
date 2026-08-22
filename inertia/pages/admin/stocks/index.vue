<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import StockResourceTable from '~/partials/stocks/StockResourceTable.vue';
import StockMaterialTable from '~/partials/stocks/StockMaterialTable.vue';
import { Button } from '~/components/ui/button';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

type ResourceStockLine = { id: string; quantityBarrel: number; quantityPurchased: number; quantityPurchasedSoljund: number; soljundQuantity: number };
type ResourceQuantities = Record<string, { quantityBarrel: number; quantityPurchased: number; quantityPurchasedSoljund: number; soljundQuantity: number }>;
type MaterialStockLine = { id: string; quantity: number };
type MaterialQuantities = Record<string, number>;

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.stocks.title');

const props = defineProps<{
    resources: (Data.Resource & ResourceStockLine)[];
    materials: (Data.Material & MaterialStockLine)[];
    dolineMaterialName: string;
    moonstoneResourceName: string;
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));

const dolineMaterialId = computed(() => props.materials.find((m) => m.name === props.dolineMaterialName)?.id);
const moonstoneResourceId = computed(() => props.resources.find((r) => r.name === props.moonstoneResourceName && r.type === 'minerai')?.id);

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

const resourceQuantities = reactive<ResourceQuantities>(toResourceQuantityMap(props.resources));
const materialQuantities = reactive<MaterialQuantities>(toMaterialQuantityMap(props.materials));

watch(
    () => props.resources,
    (value) => {
        Object.assign(resourceQuantities, toResourceQuantityMap(value));
    },
);

watch(
    () => props.materials,
    (value) => {
        Object.assign(materialQuantities, toMaterialQuantityMap(value));
    },
);

const totalStockValue = computed(() => props.resources.reduce((sum, resource) => sum + resource.sellPrice * (resourceQuantities[resource.id]?.quantityPurchased ?? 0), 0));

function updatePurchased(id: string, value: string | number) {
    const quantity = Math.max(0, Math.round(Number(value) || 0));
    const current = resourceQuantities[id];
    if (current) resourceQuantities[id] = { ...current, quantityPurchased: quantity };
}

function updatePurchasedSoljund(id: string, value: string | number) {
    const quantity = Math.max(0, Math.round(Number(value) || 0));
    const current = resourceQuantities[id];
    if (current) resourceQuantities[id] = { ...current, quantityPurchasedSoljund: quantity };
}

function updateBarrelSoljund(id: string, value: string | number) {
    const quantity = Math.max(0, Math.round(Number(value) || 0));
    const current = resourceQuantities[id];
    if (current) resourceQuantities[id] = { ...current, soljundQuantity: quantity };
}

function updateDolineQuantity(id: string, value: string | number) {
    materialQuantities[id] = Math.max(0, Math.round(Number(value) || 0));
}

const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.patch(
        urlFor('admin.stocks.update'),
        {
            dolineQuantity: dolineMaterialId.value ? (materialQuantities[dolineMaterialId.value] ?? 0) : 0,
            resources: props.resources.map((r) => ({
                resourceId: r.id,
                quantityPurchased: resourceQuantities[r.id]?.quantityPurchased ?? 0,
                quantityPurchasedSoljund: resourceQuantities[r.id]?.quantityPurchasedSoljund ?? 0,
                quantityBarrelSoljund: resourceQuantities[r.id]?.soljundQuantity ?? 0,
            })),
        },
        { preserveScroll: true, onFinish: () => (isSubmitting.value = false) },
    );
}
</script>

<template>
    <div class="space-y-10">
        <div class="flex items-start justify-between gap-4">
            <p class="text-sm text-muted-foreground max-w-2xl">{{ t('admin.stocks.description') }}</p>
            <Button :loading="isSubmitting" :disabled="isSubmitting" @click="submit">{{ t('admin.stocks.save') }}</Button>
        </div>

        <div class="space-y-3">
            <h2 class="font-serif text-2xl font-light">{{ t('admin.resources.types.minerai') }}</h2>
            <StockResourceTable
                :resources="minerais"
                :quantities="resourceQuantities"
                editable-purchased
                :editable-soljund-resource-id="moonstoneResourceId"
                @update-purchased="updatePurchased"
                @update-purchased-soljund="updatePurchasedSoljund"
                @update-barrel-soljund="updateBarrelSoljund"
            />
        </div>

        <div class="space-y-3">
            <h2 class="font-serif text-2xl font-light">{{ t('admin.resources.types.lingot') }}</h2>
            <StockResourceTable :resources="lingots" :quantities="resourceQuantities" editable-purchased @update-purchased="updatePurchased" />
        </div>

        <div class="flex items-center justify-end gap-2 text-lg">
            <span class="text-muted-foreground">{{ t('stocks.totalValue') }}</span>
            <span class="font-medium">{{ totalStockValue.toFixed(2) }}</span>
        </div>

        <div class="space-y-3">
            <h2 class="font-serif text-2xl font-light">{{ t('admin.materials.title') }}</h2>
            <StockMaterialTable :materials="materials" :quantities="materialQuantities" :editable-material-id="dolineMaterialId" @update-quantity="updateDolineQuantity" />
        </div>

        <div class="flex justify-end">
            <Button :loading="isSubmitting" :disabled="isSubmitting" @click="submit">{{ t('admin.stocks.save') }}</Button>
        </div>
    </div>
</template>
