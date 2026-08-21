<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { HelpCircle } from '@lucide/vue';
import WeeklyMetricChart from '~/partials/admin/WeeklyMetricChart.vue';

defineOptions({ layout: AdminLayout });
const { t } = useI18n();
const { isAdmin } = useAuth();

const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.dashboard.title');

type WeeklyRecap = {
    weekNumber: number;
    startDate: string;
    endDate: string;
    deliveriesAmount: number;
    commissionsAmount: number;
    largeOrderFeesAmount: number;
    profit: number;
    weeklyTax: number;
    licensesAmount: number;
    employeeDueAmount: number;
    capital: number | null;
    stockValue: number | null;
    totalCapital: number | null;
};

const props = defineProps<{
    weeklyRecap: WeeklyRecap[];
    castellanyTaxRate: number;
    largeOrderThresholdQuantity: number;
}>();

function formatWeekRange(recap: WeeklyRecap): string {
    const format = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
    return `${format(recap.startDate)} - ${format(recap.endDate)}`;
}

function formatAmount(amount: number): string {
    return `${amount.toFixed(2)} s`;
}

function formatAmountOrDash(amount: number | null): string {
    return amount === null ? t('admin.dashboard.weeklyRecap.notAvailable') : formatAmount(amount);
}

const castellanyTaxRate = ref(String(props.castellanyTaxRate));
const isSubmittingCastellanyTax = ref(false);

function submitCastellanyTax() {
    isSubmittingCastellanyTax.value = true;
    router.put(urlFor('admin.dashboard.castellanyTax.update'), { rate: castellanyTaxRate.value }, { preserveScroll: true, onFinish: () => (isSubmittingCastellanyTax.value = false) });
}

const largeOrderThresholdQuantity = ref(String(props.largeOrderThresholdQuantity));
const isSubmittingLargeOrderSetting = ref(false);

function submitLargeOrderSetting() {
    isSubmittingLargeOrderSetting.value = true;
    router.put(
        urlFor('admin.dashboard.largeOrderSetting.update'),
        { thresholdQuantity: largeOrderThresholdQuantity.value },
        { preserveScroll: true, onFinish: () => (isSubmittingLargeOrderSetting.value = false) },
    );
}

const currentWeekRecap = computed(() => props.weeklyRecap[0]);

const capitalInput = ref('');
const stockValueInput = ref('');
const isSubmittingCapitalSnapshot = ref(false);

function submitCapitalSnapshot() {
    isSubmittingCapitalSnapshot.value = true;
    router.post(
        urlFor('admin.dashboard.capitalSnapshot.store'),
        { capital: capitalInput.value, stockValue: stockValueInput.value },
        { preserveScroll: true, onFinish: () => (isSubmittingCapitalSnapshot.value = false) },
    );
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex flex-wrap gap-4">
            <div class="rounded-md border p-5 space-y-4 w-full max-w-xs">
                <div class="text-sm font-medium">{{ t('admin.dashboard.castellanyTax.title') }}</div>
                <Input v-model="castellanyTaxRate" type="number" :label="t('admin.dashboard.castellanyTax.rate')" min="0" :max="100" step="1" :readonly="!isAdmin" />
                <Button v-if="isAdmin" size="sm" :loading="isSubmittingCastellanyTax" :disabled="isSubmittingCastellanyTax" @click="submitCastellanyTax">
                    {{ t('admin.dashboard.castellanyTax.save') }}
                </Button>
            </div>

            <div class="rounded-md border p-5 space-y-4 w-full max-w-xs">
                <div class="text-sm font-medium">{{ t('admin.dashboard.largeOrderSetting.title') }}</div>
                <Input v-model="largeOrderThresholdQuantity" type="number" :label="t('admin.dashboard.largeOrderSetting.threshold')" min="0" step="1" :readonly="!isAdmin" />
                <Button v-if="isAdmin" size="sm" :loading="isSubmittingLargeOrderSetting" :disabled="isSubmittingLargeOrderSetting" @click="submitLargeOrderSetting">
                    {{ t('admin.dashboard.largeOrderSetting.save') }}
                </Button>
            </div>

            <div class="rounded-md border p-5 space-y-4 w-full max-w-xs">
                <div class="text-sm font-medium">{{ t('admin.dashboard.capitalSnapshot.title') }}</div>
                <template v-if="currentWeekRecap && currentWeekRecap.capital !== null && currentWeekRecap.stockValue !== null">
                    <div class="text-sm flex items-center justify-between">
                        <span class="text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.capital') }}</span>
                        <span class="font-medium">{{ formatAmount(currentWeekRecap.capital) }}</span>
                    </div>
                    <div class="text-sm flex items-center justify-between">
                        <span class="text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.stockValue') }}</span>
                        <span class="font-medium">{{ formatAmount(currentWeekRecap.stockValue) }}</span>
                    </div>
                    <div class="text-sm flex items-center justify-between border-t pt-3">
                        <span class="text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.totalCapital') }}</span>
                        <span class="font-medium">{{ formatAmount(currentWeekRecap.totalCapital ?? 0) }}</span>
                    </div>
                </template>
                <template v-else>
                    <p class="text-xs text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.notEntered') }}</p>
                    <template v-if="isAdmin">
                        <Input v-model="capitalInput" type="number" :label="t('admin.dashboard.capitalSnapshot.capital')" min="0" step="0.01" />
                        <Input v-model="stockValueInput" type="number" :label="t('admin.dashboard.capitalSnapshot.stockValue')" min="0" step="0.01" />
                        <Button size="sm" :loading="isSubmittingCapitalSnapshot" :disabled="isSubmittingCapitalSnapshot" @click="submitCapitalSnapshot">
                            {{ t('admin.dashboard.capitalSnapshot.save') }}
                        </Button>
                    </template>
                </template>
            </div>
        </div>

        <div class="rounded-md border">
            <div class="p-4">
                <div class="text-sm font-medium">{{ t('admin.dashboard.weeklyRecap.title') }}</div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.week') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.deliveries') }}</TableHead>
                        <TableHead>
                            <div class="flex items-center gap-1">
                                {{ t('admin.dashboard.weeklyRecap.profit') }}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <button type="button" class="text-muted-foreground hover:text-foreground">
                                                <HelpCircle class="size-3.5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent class="max-w-64">
                                            {{ t('admin.dashboard.weeklyRecap.profitHelp') }}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.weeklyTax') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.licenses') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.employeeDue') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.capital') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.stockValue') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="weeklyRecap.length">
                        <TableRow v-for="(recap, index) in weeklyRecap" :key="recap.weekNumber">
                            <TableCell>
                                <div class="flex items-center gap-2">
                                    <Badge variant="secondary">S{{ recap.weekNumber }}</Badge>
                                    <Badge v-if="index === 0" variant="outline" class="text-xs">{{ t('admin.common.weekly.current') }}</Badge>
                                    <span class="text-xs text-muted-foreground">{{ formatWeekRange(recap) }}</span>
                                </div>
                            </TableCell>
                            <TableCell class="text-sm">{{ formatAmount(recap.deliveriesAmount) }}</TableCell>
                            <TableCell class="text-sm" :class="recap.profit >= 0 ? 'text-green-600' : 'text-destructive'">
                                {{ formatAmount(recap.profit) }}
                            </TableCell>
                            <TableCell class="text-sm">{{ formatAmount(recap.weeklyTax) }}</TableCell>
                            <TableCell class="text-sm">{{ formatAmount(recap.licensesAmount) }}</TableCell>
                            <TableCell class="text-sm">{{ formatAmount(recap.employeeDueAmount) }}</TableCell>
                            <TableCell class="text-sm">{{ formatAmountOrDash(recap.capital) }}</TableCell>
                            <TableCell class="text-sm">{{ formatAmountOrDash(recap.stockValue) }}</TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell colspan="8" class="text-center text-sm text-muted-foreground py-6">
                            {{ t('admin.dashboard.weeklyRecap.empty') }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <WeeklyMetricChart :weekly-recap="weeklyRecap" />
    </div>
</template>
