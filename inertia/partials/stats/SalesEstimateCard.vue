<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TrendingUp } from '@lucide/vue';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

/**
 * Per ore, the estimated total need (ore sold as is + ore going into the ingots expected to sell) and the
 * actual one, computed the same way from what was really sold that week.
 */
export type SalesEstimateRow = { resourceId: string; resourceName: string; estimatedOreNeed: number; actualOreNeed: number };
export type SalesEstimate = {
    targetWeekNumber: number;
    basedOnWeekNumber: number;
    historyWeeks: number;
    /** The week is running (or to come): its actual sales are still partial. */
    isInProgress: boolean;
    ores: SalesEstimateRow[];
};

const props = defineProps<{
    /** Most recent first. */
    estimates: SalesEstimate[];
}>();

const { t } = useI18n();

const quantityFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

// The most recent forecast by default; older ones can be picked to check them against what was sold.
const selectedWeek = ref(props.estimates[0]?.targetWeekNumber ?? null);
watch(
    () => props.estimates,
    (estimates) => {
        if (!estimates.some((estimate) => estimate.targetWeekNumber === selectedWeek.value)) selectedWeek.value = estimates[0]?.targetWeekNumber ?? null;
    },
);

const estimate = computed(() => props.estimates.find((candidate) => candidate.targetWeekNumber === selectedWeek.value) ?? null);

const totals = computed(() => ({
    estimated: estimate.value?.ores.reduce((sum, row) => sum + row.estimatedOreNeed, 0) ?? 0,
    actual: estimate.value?.ores.reduce((sum, row) => sum + row.actualOreNeed, 0) ?? 0,
}));

/** Full history: lowest and highest weeks are dropped before averaging; shorter history: plain mean. */
const method = computed(() => {
    if (!estimate.value) return '';
    const fromWeek = estimate.value.basedOnWeekNumber - estimate.value.historyWeeks + 1;
    return t(estimate.value.historyWeeks >= 5 ? 'admin.ventes.stats.estimate.methodTrimmed' : 'admin.ventes.stats.estimate.methodMean', {
        from: fromWeek,
        to: estimate.value.basedOnWeekNumber,
    });
});

function onWeekChange(value: unknown) {
    selectedWeek.value = Number(value);
}
</script>

<template>
    <div class="rounded-md border p-4 space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-0.5">
                <div class="flex items-center gap-2 text-sm font-medium">
                    <TrendingUp class="size-4 text-muted-foreground" />
                    <template v-if="estimate">{{ t('admin.ventes.stats.estimate.title', { week: estimate.targetWeekNumber }) }}</template>
                    <template v-else>{{ t('admin.ventes.stats.estimate.titleEmpty') }}</template>
                </div>
                <p class="text-xs text-muted-foreground">{{ estimate ? method : t('admin.ventes.stats.estimate.empty') }}</p>
            </div>
            <Select v-if="estimates.length > 1" :model-value="String(selectedWeek)" @update:model-value="onWeekChange">
                <SelectTrigger class="w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent class="max-h-64">
                    <SelectItem v-for="candidate in estimates" :key="candidate.targetWeekNumber" :value="String(candidate.targetWeekNumber)">
                        {{ t('admin.ventes.stats.estimate.weekOption', { week: candidate.targetWeekNumber }) }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div v-if="estimate" class="max-w-2xl rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.ventes.stats.estimate.ores') }}</TableHead>
                        <TableHead class="text-right">{{ t('admin.ventes.stats.estimate.oreNeed') }}</TableHead>
                        <TableHead class="text-right">
                            {{ t('admin.ventes.stats.estimate.actual') }}
                            <span v-if="estimate.isInProgress" class="font-normal text-muted-foreground">({{ t('admin.ventes.stats.estimate.inProgress') }})</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="row in estimate.ores" :key="row.resourceId" :class="row.estimatedOreNeed || row.actualOreNeed ? '' : 'text-muted-foreground'">
                        <TableCell class="text-sm font-medium">{{ row.resourceName }}</TableCell>
                        <TableCell class="text-right text-sm font-medium">{{ quantityFormat.format(row.estimatedOreNeed) }}</TableCell>
                        <TableCell class="text-right text-sm">{{ quantityFormat.format(row.actualOreNeed) }}</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell class="text-sm font-medium">{{ t('admin.ventes.stats.estimate.total') }}</TableCell>
                        <TableCell class="text-right text-sm font-medium">{{ quantityFormat.format(totals.estimated) }}</TableCell>
                        <TableCell class="text-right text-sm font-medium">{{ quantityFormat.format(totals.actual) }}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>

        <p v-if="estimate" class="text-xs text-muted-foreground">{{ t('admin.ventes.stats.estimate.oreNeedHelp') }}</p>
    </div>
</template>
