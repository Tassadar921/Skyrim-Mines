<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import StockResourceTable from '~/partials/stocks/StockResourceTable.vue';
import StockMaterialTable from '~/partials/stocks/StockMaterialTable.vue';
import BuybackModal from '~/partials/buyback/BuybackModal.vue';
import ExternalBuybackModal from '~/partials/stocks/ExternalBuybackModal.vue';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import OreEvolutionChart from '~/partials/stats/OreEvolutionChart.vue';
import OreDistributionChart from '~/partials/stats/OreDistributionChart.vue';
import { formatShortDate } from '~/lib/date_format';
import type { AcceptableValue } from 'reka-ui';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

type ResourceStockLine = { id: string; quantityBarrel: number; quantityPurchased: number };
type ResourceQuantities = Record<string, { quantityBarrel: number; quantityPurchased: number }>;
type MaterialStockLine = { id: string; quantity: number };
type MaterialQuantities = Record<string, number>;
type OreRef = { resourceId: string; resourceName: string };
type OreQuantity = OreRef & { quantity: number };
type WeeklyOreStat = { weekNumber: number; startDate: string; endDate: string; total: { quantity: number }; byOre: OreQuantity[] };
type Stats = { ores: OreRef[]; oreTotals: OreQuantity[]; weeklyOreStats: WeeklyOreStat[] };

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isManager } = useAuth();
pageTitle.value = t('admin.stocks.title');

const props = defineProps<{
    resources: (Data.Resource & ResourceStockLine)[];
    materials: (Data.Material & MaterialStockLine)[];
    stats: Stats;
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));

function toResourceQuantityMap(items: ResourceStockLine[]): ResourceQuantities {
    return Object.fromEntries(items.map((item) => [item.id, { quantityBarrel: item.quantityBarrel, quantityPurchased: item.quantityPurchased }]));
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

function updateMaterialQuantity(id: string, value: string | number) {
    materialQuantities[id] = Math.max(0, Math.round(Number(value) || 0));
}

const isSubmitting = ref(false);

// Forces any field still focused (e.g. an uncommitted "=50+30" formula) to blur and commit its
// value first — clicking "Enregistrer" doesn't reliably blur the active input on every browser
// (Safari in particular doesn't focus a <button> on click), so we can't rely on that happening on its own.
function flushPendingEdits() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

function submit() {
    flushPendingEdits();
    isSubmitting.value = true;
    router.patch(
        urlFor('admin.stocks.update'),
        {
            materials: props.materials.map((m) => ({
                materialId: m.id,
                quantity: materialQuantities[m.id] ?? 0,
            })),
            resources: props.resources.map((r) => ({
                resourceId: r.id,
                quantityPurchased: resourceQuantities[r.id]?.quantityPurchased ?? 0,
            })),
        },
        { preserveScroll: true, onFinish: () => (isSubmitting.value = false) },
    );
}

// Statistics tab — deposited volume only. The week filter drives the ore totals table and the distribution pie.
const statsWeekFilter = ref<string>('all');

function onStatsWeekFilterChange(value: AcceptableValue) {
    statsWeekFilter.value = String(value ?? 'all');
}

const statsOreData = computed<(OreRef & { value: number })[]>(() => {
    const weekNumber = Number(statsWeekFilter.value);
    const source = statsWeekFilter.value === 'all' ? props.stats.oreTotals : (props.stats.weeklyOreStats.find((week) => week.weekNumber === weekNumber)?.byOre ?? props.stats.oreTotals);
    return source.map((ore) => ({ resourceId: ore.resourceId, resourceName: ore.resourceName, value: ore.quantity }));
});

const formatQuantity = (value: number): string => String(value);

function formatWeekRange(week: WeeklyOreStat): string {
    return `${formatShortDate(week.startDate)} - ${formatShortDate(week.endDate)}`;
}
</script>

<template>
    <Tabs default-value="stocks">
        <TabsList>
            <TabsTrigger value="stocks">{{ t('admin.stocks.tabs.stocks') }}</TabsTrigger>
            <TabsTrigger value="stats">{{ t('admin.stocks.tabs.stats') }}</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" class="space-y-10">
            <div class="flex items-start justify-end gap-4">
                <div class="flex items-center gap-2 shrink-0">
                    <BuybackModal v-if="isManager" :resources="props.resources" />
                    <ExternalBuybackModal v-if="isManager" :resources="props.resources" />
                    <Button :loading="isSubmitting" :disabled="isSubmitting" @click="submit">{{ t('admin.stocks.save') }}</Button>
                </div>
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light">{{ t('admin.resources.types.minerai') }}</h2>
                <StockResourceTable :resources="minerais" :quantities="resourceQuantities" editable-purchased editable-barrel-total @update-purchased="updatePurchased" />
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light">{{ t('admin.resources.types.lingot') }}</h2>
                <StockResourceTable :resources="lingots" :quantities="resourceQuantities" editable-purchased editable-barrel-total @update-purchased="updatePurchased" />
            </div>

            <div class="flex items-center justify-end gap-2 text-lg">
                <span class="text-muted-foreground">{{ t('stocks.totalValue') }}</span>
                <span class="font-medium">{{ totalStockValue.toFixed(2) }}</span>
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light">{{ t('admin.materials.title') }}</h2>
                <StockMaterialTable :materials="materials" :quantities="materialQuantities" editable @update-quantity="updateMaterialQuantity" />
            </div>

            <div class="flex justify-end">
                <Button :loading="isSubmitting" :disabled="isSubmitting" @click="submit">{{ t('admin.stocks.save') }}</Button>
            </div>
        </TabsContent>

        <TabsContent value="stats" class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="text-sm font-medium">{{ t('admin.stocks.stats.oreTotals.title') }}</div>
                <Select :model-value="statsWeekFilter" @update:model-value="onStatsWeekFilterChange">
                    <SelectTrigger class="w-56 max-w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{{ t('admin.stocks.stats.allWeeks') }}</SelectItem>
                        <SelectItem v-for="week in stats.weeklyOreStats" :key="week.weekNumber" :value="String(week.weekNumber)">
                            {{ t('admin.stocks.stats.weekBadge', { week: week.weekNumber }) }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('admin.stocks.stats.oreTotals.resource') }}</TableHead>
                                <TableHead>{{ t('admin.stocks.stats.oreTotals.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <template v-if="statsOreData.length">
                                <TableRow v-for="ore in statsOreData" :key="ore.resourceId">
                                    <TableCell class="text-sm font-medium">{{ ore.resourceName }}</TableCell>
                                    <TableCell class="text-sm text-muted-foreground">{{ ore.value }}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell class="text-sm font-medium">{{ t('admin.stocks.stats.oreTotals.total') }}</TableCell>
                                    <TableCell class="text-sm font-medium">{{ statsOreData.reduce((sum, ore) => sum + ore.value, 0) }}</TableCell>
                                </TableRow>
                            </template>
                            <TableRow v-else>
                                <TableCell :colspan="2" class="h-24 text-center text-muted-foreground">
                                    {{ t('admin.stocks.stats.oreTotals.empty') }}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div class="rounded-md border p-4">
                    <OreDistributionChart :data="statsOreData" :format-value="formatQuantity" :empty-label="t('admin.stocks.stats.distributionEmpty')" />
                </div>
            </div>

            <OreEvolutionChart :weekly-ore-stats="stats.weeklyOreStats" :ores="stats.ores" metric="quantity" :title="t('admin.stocks.stats.evolutionTitle')" :format-value="formatQuantity" />

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light">{{ t('admin.stocks.weeklyDeposits.title') }}</h2>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('admin.stocks.weeklyDeposits.table.week') }}</TableHead>
                                <TableHead>{{ t('admin.stocks.weeklyDeposits.table.total') }}</TableHead>
                                <TableHead>{{ t('admin.stocks.weeklyDeposits.table.detail') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="week in stats.weeklyOreStats" :key="week.weekNumber">
                                <TableCell class="text-sm font-medium">
                                    {{ t('admin.stocks.weeklyDeposits.table.week') }} {{ week.weekNumber }}
                                    <span class="text-xs font-normal text-muted-foreground">{{ formatWeekRange(week) }}</span>
                                </TableCell>
                                <TableCell class="text-sm font-medium">{{ week.total.quantity }} {{ t('admin.stocks.weeklyDeposits.table.units') }}</TableCell>
                                <TableCell>
                                    <div v-if="week.byOre.some((ore) => ore.quantity > 0)" class="flex flex-wrap gap-1">
                                        <Badge v-for="ore in week.byOre.filter((ore) => ore.quantity > 0)" :key="ore.resourceId" variant="secondary" class="text-xs">
                                            {{ ore.resourceName }} : {{ ore.quantity }}
                                        </Badge>
                                    </div>
                                    <span v-else class="text-xs text-muted-foreground">{{ t('admin.stocks.weeklyDeposits.table.none') }}</span>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </TabsContent>
    </Tabs>
</template>
