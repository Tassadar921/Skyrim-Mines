<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, type ChartData, type ChartOptions, type TooltipItem } from 'chart.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { AcceptableValue } from 'reka-ui';
import { useTheme } from '~/lib/use_theme';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip);

type WeeklyRecap = {
    weekNumber: number;
    deliveriesAmount: number;
    commissionsAmount: number;
    largeOrderFeesAmount: number;
    profit: number;
    weeklyTax: number;
    buybacksAmount: number;
    licensesAmount: number;
    employeeDueAmount: number;
};

const METRICS = [
    { value: 'deliveriesAmount', labelKey: 'admin.dashboard.weeklyRecap.deliveries' },
    { value: 'commissionsAmount', labelKey: 'admin.dashboard.weeklyRecap.commissions' },
    { value: 'largeOrderFeesAmount', labelKey: 'admin.dashboard.weeklyRecap.largeOrderFees' },
    { value: 'profit', labelKey: 'admin.dashboard.weeklyRecap.profit' },
    { value: 'weeklyTax', labelKey: 'admin.dashboard.weeklyRecap.weeklyTax' },
    { value: 'buybacksAmount', labelKey: 'admin.dashboard.weeklyRecap.buybacks' },
    { value: 'licensesAmount', labelKey: 'admin.dashboard.weeklyRecap.licenses' },
    { value: 'employeeDueAmount', labelKey: 'admin.dashboard.weeklyRecap.employeeDue' },
] as const;

type MetricKey = (typeof METRICS)[number]['value'];

const { t } = useI18n();
const { theme } = useTheme();

const props = defineProps<{
    weeklyRecap: WeeklyRecap[];
}>();

const selectedMetric = ref<MetricKey>('profit');

function onMetricChange(value: AcceptableValue) {
    selectedMetric.value = value as MetricKey;
}

const chronological = computed(() => [...props.weeklyRecap].reverse());

// Chart.js draws to a <canvas>, which is meaningless during SSR anyway — these
// fallbacks (the light-theme defaults) just avoid crashing the server render;
// the client-side mount immediately recomputes real values from the DOM.
const FALLBACK_COLORS = {
    line: 'oklch(0.646 0.222 41.116)',
    grid: 'oklch(0.929 0.013 255.508)',
    text: 'oklch(0.554 0.046 257.417)',
    surface: 'oklch(1 0 0)',
};

function readCssVar(name: string): string | null {
    if (typeof document === 'undefined') return null;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function withAlpha(color: string, alpha: number): string {
    return color.replace(/\)\s*$/, ` / ${alpha})`);
}

const colors = computed(() => {
    // Re-evaluated whenever the theme toggles, since these read CSS custom
    // properties that only change value once the `dark` class is applied.
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

function formatAmount(value: number): string {
    return `${numberFormat.format(value)} s`;
}

const chartData = computed<ChartData<'line'>>(() => ({
    labels: chronological.value.map((recap) => `S${recap.weekNumber}`),
    datasets: [
        {
            data: chronological.value.map((recap) => recap[selectedMetric.value]),
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
                label: (item: TooltipItem<'line'>) => formatAmount(item.parsed.y ?? 0),
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
            ticks: {
                color: colors.value.text,
                callback: (value) => formatAmount(Number(value)),
            },
        },
    },
}));
</script>

<template>
    <div class="rounded-md border p-4 space-y-4">
        <div class="flex items-center justify-between gap-4">
            <div class="text-sm font-medium">{{ t('admin.dashboard.chart.title') }}</div>
            <Select :model-value="selectedMetric" @update:model-value="onMetricChange">
                <SelectTrigger class="w-56">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="metric in METRICS" :key="metric.value" :value="metric.value">
                        {{ t(metric.labelKey) }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div class="h-64">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>
