<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData, type ChartOptions, type TooltipItem } from 'chart.js';
import { useTheme } from '~/lib/use_theme';

ChartJS.register(ArcElement, Tooltip, Legend);

type OreQuantity = { resourceId: string; resourceName: string; quantity: number };

const { t } = useI18n();
const { theme } = useTheme();

const props = defineProps<{
    // Ordered like the resources list, zero-filled (every ore present) — the fixed order is what
    // keeps a given ore's color stable across weeks, regardless of which ones are non-zero.
    data: OreQuantity[];
}>();

// Categorical hues are assigned in this fixed order and never cycled: beyond 5 slices, the tail
// folds into a single neutral "Autres" slice rather than generating more colors.
const MAX_NAMED_SLICES = 5;

const FALLBACK_CHART_COLORS = ['oklch(0.646 0.222 41.116)', 'oklch(0.6 0.118 184.704)', 'oklch(0.398 0.07 227.392)', 'oklch(0.828 0.189 84.429)', 'oklch(0.769 0.188 70.08)'];
const FALLBACK_OTHER = 'oklch(0.551 0 0)';
const FALLBACK_BORDER = 'oklch(1 0 0)';
const FALLBACK_TEXT = 'oklch(0.554 0.046 257.417)';

function readCssVar(name: string): string | null {
    if (typeof document === 'undefined') return null;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const colors = computed(() => {
    void theme.value;
    return {
        chart: [1, 2, 3, 4, 5].map((n) => readCssVar(`--chart-${n}`) ?? FALLBACK_CHART_COLORS[n - 1]),
        other: readCssVar('--muted-foreground') ?? FALLBACK_OTHER,
        border: readCssVar('--card') ?? FALLBACK_BORDER,
        tooltipBorder: readCssVar('--border') ?? FALLBACK_BORDER,
        text: readCssVar('--muted-foreground') ?? FALLBACK_TEXT,
        surface: readCssVar('--card') ?? FALLBACK_BORDER,
    };
});

const slices = computed(() => {
    const indexed = props.data.map((entry, index) => ({ ...entry, colorIndex: index }));
    const nonZero = indexed.filter((entry) => entry.quantity > 0);

    if (nonZero.length <= MAX_NAMED_SLICES) return nonZero;

    const named = nonZero.slice(0, MAX_NAMED_SLICES - 1);
    const otherQuantity = nonZero.slice(MAX_NAMED_SLICES - 1).reduce((sum, entry) => sum + entry.quantity, 0);
    return [...named, { resourceId: 'other', resourceName: t('admin.livraisons.stats.distribution.other'), quantity: otherQuantity, colorIndex: -1 }];
});

const total = computed(() => slices.value.reduce((sum, entry) => sum + entry.quantity, 0));

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

const chartData = computed<ChartData<'pie'>>(() => ({
    labels: slices.value.map((entry) => entry.resourceName),
    datasets: [
        {
            data: slices.value.map((entry) => entry.quantity),
            backgroundColor: slices.value.map((entry) => (entry.colorIndex >= 0 ? colors.value.chart[entry.colorIndex] : colors.value.other)),
            borderColor: colors.value.border,
            borderWidth: 2,
        },
    ],
}));

const chartOptions = computed<ChartOptions<'pie'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right',
            labels: { color: colors.value.text, boxWidth: 12 },
        },
        tooltip: {
            enabled: true,
            backgroundColor: colors.value.surface,
            titleColor: colors.value.text,
            bodyColor: colors.value.text,
            borderColor: colors.value.tooltipBorder,
            borderWidth: 1,
            padding: 8,
            cornerRadius: 6,
            callbacks: {
                label: (item: TooltipItem<'pie'>) => {
                    const value = Number(item.parsed ?? 0);
                    const percent = total.value > 0 ? Math.round((value / total.value) * 100) : 0;
                    return ` ${numberFormat.format(value)} (${percent} %)`;
                },
            },
        },
    },
}));
</script>

<template>
    <div class="h-72">
        <Pie v-if="total > 0" :data="chartData" :options="chartOptions" />
        <div v-else class="h-full flex items-center justify-center text-sm text-muted-foreground">{{ t('admin.livraisons.stats.distribution.empty') }}</div>
    </div>
</template>
