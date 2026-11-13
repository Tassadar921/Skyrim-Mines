<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { TrendingUp } from '@lucide/vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

export type SalesEstimateRow = { resourceId: string; resourceName: string; estimatedSales: number; estimatedOreNeed: number | null };
export type SalesEstimate = {
    targetWeekNumber: number;
    basedOnWeekNumber: number;
    historyWeeks: number;
    ores: SalesEstimateRow[];
    ingots: SalesEstimateRow[];
};

const props = defineProps<{
    estimate: SalesEstimate | null;
}>();

const { t } = useI18n();

const quantityFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/** Full history: lowest and highest weeks are dropped before averaging; shorter history: plain mean. */
const method = computed(() => {
    if (!props.estimate) return '';
    const fromWeek = props.estimate.basedOnWeekNumber - props.estimate.historyWeeks + 1;
    return t(props.estimate.historyWeeks >= 5 ? 'admin.ventes.stats.estimate.methodTrimmed' : 'admin.ventes.stats.estimate.methodMean', {
        from: fromWeek,
        to: props.estimate.basedOnWeekNumber,
    });
});
</script>

<template>
    <div class="rounded-md border p-4 space-y-4">
        <div class="space-y-0.5">
            <div class="flex items-center gap-2 text-sm font-medium">
                <TrendingUp class="size-4 text-muted-foreground" />
                <template v-if="estimate">{{ t('admin.ventes.stats.estimate.title', { week: estimate.targetWeekNumber }) }}</template>
                <template v-else>{{ t('admin.ventes.stats.estimate.titleEmpty') }}</template>
            </div>
            <p class="text-xs text-muted-foreground">{{ estimate ? method : t('admin.ventes.stats.estimate.empty') }}</p>
        </div>

        <div v-if="estimate" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{{ t('admin.ventes.stats.estimate.ores') }}</TableHead>
                            <TableHead class="text-right">{{ t('admin.ventes.stats.estimate.sales') }}</TableHead>
                            <TableHead class="text-right">{{ t('admin.ventes.stats.estimate.oreNeed') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="row in estimate.ores" :key="row.resourceId" :class="row.estimatedOreNeed ? '' : 'text-muted-foreground'">
                            <TableCell class="text-sm font-medium">{{ row.resourceName }}</TableCell>
                            <TableCell class="text-right text-sm">{{ quantityFormat.format(row.estimatedSales) }}</TableCell>
                            <TableCell class="text-right text-sm font-medium">{{ quantityFormat.format(row.estimatedOreNeed ?? 0) }}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <div class="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{{ t('admin.ventes.stats.estimate.ingots') }}</TableHead>
                            <TableHead class="text-right">{{ t('admin.ventes.stats.estimate.sales') }}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="row in estimate.ingots" :key="row.resourceId" :class="row.estimatedSales ? '' : 'text-muted-foreground'">
                            <TableCell class="text-sm font-medium">{{ row.resourceName }}</TableCell>
                            <TableCell class="text-right text-sm">{{ quantityFormat.format(row.estimatedSales) }}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>

        <p v-if="estimate" class="text-xs text-muted-foreground">{{ t('admin.ventes.stats.estimate.oreNeedHelp') }}</p>
    </div>
</template>
