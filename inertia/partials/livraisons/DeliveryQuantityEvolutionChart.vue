<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, type ChartData, type ChartOptions, type TooltipItem } from 'chart.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { AcceptableValue } from 'reka-ui';
import { useTheme } from '~/lib/use_theme';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip);

type OreQuantity = { resourceId: string; resourceName: string; quantity: number };
type WeeklyOreStat = { weekNumber: number; totalQuantity: number; byOre: OreQuantity[] };

const { t } = useI18n();
const { theme } = useTheme();

const props = defineProps<{
    weeklyOreStats: WeeklyOreStat[]; // reverse-chronological (current week first)
    ores: { resourceId: string; resourceName: string }[]; // ordered like the resources list
}>();

const selected = ref<string>('total');

function onSelectChange(value: AcceptableValue) {
    selected.value = String(value);
}

const chronological = computed(() => [...props.weeklyOreStats].reverse());

function valueForWeek(week: WeeklyOreStat): number {
    if (selected.value === 'total') return week.totalQuantity;
    return week.byOre.find((entry) => entry.resourceId === selected.value)?.quantity ?? 0;
}

// Same theme-aware color approach as WeeklyMetricChart.vue, duplicated here so this chart stays self-contained.
const FALLBACK_COLORS = { line: 'oklch(0.646 0.222 41.116)', grid: 'oklch(0.929 0.013 255.508)', text: 'oklch(0.554 0.046 257.417)', surface: 'oklch(1 0 0)' };

function readCssVar(name: string): string | null {
    if (typeof document === 'undefined') return null;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function withAlpha(color: string, alpha: number): string {
    return color.replace(/\)\s*$/, ` / ${alpha})`);
}

const colors = computed(() => {
    void theme.value;
    const line = readCssVar('--chart-1') ?? FALLBACK_COLORS.line;
    return {
        line,
        fill: withAlpha(line, 0.1),
        grid: readCssVar('--border') ?? FALLBACK_COLORS.grid,
        text: readCssVar('--muted-foreground') ?? FALLBACK_COLORS.text,
        surface: readCssVar('--card') ?? FALLBACK_COLORS.surface,
    };
});

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

const chartData = computed<ChartData<'line'>>(() => ({
    labels: chronological.value.map((week) => `S${week.weekNumber}`),
    datasets: [
        {
            data: chronological.value.map((week) => valueForWeek(week)),
            borderColor: colors.value.line,
            backgroundColor: colors.value.fill,
            borderWidth: 2,
            borderJoinStyle: 'round',
            borderCapStyle: 'round',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHitRadius: 12,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors.value.line,
            pointHoverBorderColor: colors.value.surface,
            pointHoverBorderWidth: 2,
        },
    ],
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true,
            displayColors: false,
            backgroundColor: colors.value.surface,
            titleColor: colors.value.text,
            bodyColor: colors.value.text,
            borderColor: colors.value.grid,
            borderWidth: 1,
            padding: 8,
            cornerRadius: 6,
            callbacks: {
                label: (item: TooltipItem<'line'>) => numberFormat.format(item.parsed.y ?? 0),
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: colors.value.text },
        },
        y: {
            grid: { color: colors.value.grid },
            border: { display: false },
            ticks: { color: colors.value.text, callback: (value) => numberFormat.format(Number(value)) },
        },
    },
}));
</script>

<template>
    <div class="rounded-md border p-4 space-y-4">
        <div class="flex items-center justify-between gap-4">
            <div class="text-sm font-medium">{{ t('admin.livraisons.stats.evolution.title') }}</div>
            <Select :model-value="selected" @update:model-value="onSelectChange">
                <SelectTrigger class="w-56">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="total">{{ t('admin.livraisons.stats.evolution.total') }}</SelectItem>
                    <SelectItem v-for="ore in ores" :key="ore.resourceId" :value="ore.resourceId">{{ ore.resourceName }}</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div class="h-64">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>
