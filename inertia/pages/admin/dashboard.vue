<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { formatShortDate } from '~/lib/date_format';
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
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { AcceptableValue } from 'reka-ui';
import { HelpCircle } from '@lucide/vue';
import WeeklyMetricChart from '~/partials/admin/WeeklyMetricChart.vue';
import TaxBracketEditor from '~/partials/admin/TaxBracketEditor.vue';

defineOptions({ layout: AdminLayout });
const { t } = useI18n();
const { isManager } = useAuth();

const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.dashboard.title');

type TaxReductions = { donation: boolean; sponsorship: boolean; privilege: boolean };

type WeeklyRecap = {
    weekNumber: number;
    startDate: string;
    endDate: string;
    deliveriesAmount: number;
    profit: number;
    weeklyTax: number;
    taxRate: number;
    topBracket: { index: number; rate: number } | null;
    reductions: TaxReductions | null;
};

type TaxBracketRow = { upperBound: number | null; rate: number };

const props = defineProps<{
    weeklyRecap: WeeklyRecap[];
    employeeDueAmount: number;
    foremanDueAmount: number;
    adminDueAmount: number;
    castellanyTaxRate: number;
    taxSystem: 'flat' | 'progressive' | 'progressive_full';
    taxBrackets: TaxBracketRow[];
    taxTiers: TaxBracketRow[];
}>();

function formatWeekRange(recap: WeeklyRecap): string {
    const format = formatShortDate;
    return `${format(recap.startDate)} - ${format(recap.endDate)}`;
}

function formatAmount(amount: number): string {
    return `${amount.toFixed(2)} s`;
}

const castellanyTaxRate = ref(String(props.castellanyTaxRate));
const isSubmittingCastellanyTax = ref(false);

function submitCastellanyTax() {
    isSubmittingCastellanyTax.value = true;
    router.put(urlFor('admin.dashboard.castellanyTax.update'), { rate: castellanyTaxRate.value }, { preserveScroll: true, onFinish: () => (isSubmittingCastellanyTax.value = false) });
}

const isSubmittingBrackets = ref(false);

function submitBrackets(brackets: TaxBracketRow[]) {
    isSubmittingBrackets.value = true;
    router.put(urlFor('admin.dashboard.taxBrackets.update'), { brackets }, { preserveScroll: true, onFinish: () => (isSubmittingBrackets.value = false) });
}

const isSubmittingTiers = ref(false);

function submitTiers(tiers: TaxBracketRow[]) {
    isSubmittingTiers.value = true;
    router.put(urlFor('admin.dashboard.taxTiers.update'), { tiers }, { preserveScroll: true, onFinish: () => (isSubmittingTiers.value = false) });
}

const currentWeekRecap = computed(() => props.weeklyRecap[0]);

const donationReduction = ref(false);
const sponsorshipReduction = ref(false);
const privilegeReduction = ref(false);
const isSubmittingCapitalSnapshot = ref(false);

// Weeks without a snapshot can still be recorded afterwards to freeze their tax; past weeks with no activity are left out.
const pendingWeeks = computed(() =>
    props.weeklyRecap.filter((recap) => recap.reductions === null && (recap.weekNumber === currentWeekRecap.value?.weekNumber || recap.deliveriesAmount !== 0 || recap.profit !== 0)),
);
const hasPendingPastWeeks = computed(() => pendingWeeks.value.some((recap) => recap.weekNumber !== currentWeekRecap.value?.weekNumber));
const selectedSnapshotWeek = ref<number | null>(null);
const snapshotWeek = computed(() => pendingWeeks.value.find((recap) => recap.weekNumber === selectedSnapshotWeek.value)?.weekNumber ?? pendingWeeks.value[0]?.weekNumber ?? null);

function onSnapshotWeekChange(value: AcceptableValue) {
    selectedSnapshotWeek.value = Number(value);
}

function submitCapitalSnapshot() {
    isSubmittingCapitalSnapshot.value = true;
    router.post(
        urlFor('admin.dashboard.capitalSnapshot.store'),
        {
            weekNumber: snapshotWeek.value,
            donationReduction: donationReduction.value,
            sponsorshipReduction: sponsorshipReduction.value,
            privilegeReduction: privilegeReduction.value,
        },
        { preserveScroll: true, onFinish: () => (isSubmittingCapitalSnapshot.value = false) },
    );
}

function reductionBadges(reductions: TaxReductions | null): string[] {
    if (!reductions) return [];
    const labels: string[] = [];
    if (reductions.donation) labels.push(t('admin.dashboard.capitalSnapshot.taxReductions.donation.label'));
    if (reductions.sponsorship) labels.push(t('admin.dashboard.capitalSnapshot.taxReductions.sponsorship.label'));
    if (reductions.privilege) labels.push(t('admin.dashboard.capitalSnapshot.taxReductions.privilege.label'));
    return labels;
}
</script>

<template>
    <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div class="rounded-md border p-5 space-y-4 min-w-0">
                <div class="text-sm font-medium">{{ t('admin.dashboard.tax.title') }}</div>

                <template v-if="taxSystem === 'flat'">
                    <Input v-model="castellanyTaxRate" type="number" :label="t('admin.dashboard.castellanyTax.rate')" min="0" :max="100" step="1" :readonly="!isManager" />
                    <Button v-if="isManager" size="sm" :loading="isSubmittingCastellanyTax" :disabled="isSubmittingCastellanyTax" @click="submitCastellanyTax">
                        {{ t('admin.dashboard.castellanyTax.save') }}
                    </Button>
                </template>

                <TaxBracketEditor
                    v-else-if="taxSystem === 'progressive'"
                    :rows="taxBrackets"
                    :is-admin="isManager"
                    :processing="isSubmittingBrackets"
                    summary-key="admin.dashboard.taxBrackets.summary"
                    :upper-bound-label="t('admin.dashboard.taxBrackets.upperBound')"
                    :beyond-label="t('admin.dashboard.taxBrackets.beyond')"
                    :rate-label="t('admin.dashboard.taxBrackets.rate')"
                    :add-label="t('admin.dashboard.taxBrackets.add')"
                    :save-label="t('admin.dashboard.taxBrackets.save')"
                    @save="submitBrackets"
                />

                <TaxBracketEditor
                    v-else
                    :rows="taxTiers"
                    :is-admin="isManager"
                    :processing="isSubmittingTiers"
                    summary-key="admin.dashboard.taxTiers.summary"
                    :upper-bound-label="t('admin.dashboard.taxTiers.upperBound')"
                    :beyond-label="t('admin.dashboard.taxTiers.beyond')"
                    :rate-label="t('admin.dashboard.taxTiers.rate')"
                    :add-label="t('admin.dashboard.taxTiers.add')"
                    :save-label="t('admin.dashboard.taxTiers.save')"
                    @save="submitTiers"
                />
            </div>

            <div class="rounded-md border p-5 space-y-3 min-w-0">
                <div class="text-sm font-medium">{{ t('admin.dashboard.amountsDue.title') }}</div>
                <div class="text-sm flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('admin.dashboard.amountsDue.employees') }}</span>
                    <span class="font-medium">{{ formatAmount(employeeDueAmount) }}</span>
                </div>
                <div class="text-sm flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('admin.dashboard.amountsDue.foremen') }}</span>
                    <span class="font-medium">{{ formatAmount(foremanDueAmount) }}</span>
                </div>
                <div class="text-sm flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('admin.dashboard.amountsDue.executives') }}</span>
                    <span class="font-medium">{{ formatAmount(adminDueAmount) }}</span>
                </div>
            </div>

            <div class="rounded-md border p-5 space-y-4 min-w-0">
                <div class="text-sm font-medium">{{ t('admin.dashboard.capitalSnapshot.title') }}</div>
                <template v-if="currentWeekRecap?.reductions">
                    <p class="text-xs text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.recorded') }}</p>
                    <div v-if="reductionBadges(currentWeekRecap.reductions).length" class="flex flex-wrap gap-1 pt-1">
                        <Badge v-for="label in reductionBadges(currentWeekRecap.reductions)" :key="label" variant="secondary" class="text-xs">{{ label }}</Badge>
                    </div>
                </template>
                <p v-else class="text-xs text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.notEntered') }}</p>

                <template v-if="isManager && pendingWeeks.length">
                    <div v-if="hasPendingPastWeeks" class="space-y-2 border-t pt-3">
                        <p class="text-xs text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.catchUpHint', { count: pendingWeeks.length }) }}</p>
                        <Select :model-value="snapshotWeek ?? undefined" @update:model-value="onSnapshotWeekChange">
                            <SelectTrigger class="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="recap in pendingWeeks" :key="recap.weekNumber" :value="recap.weekNumber">
                                    S{{ recap.weekNumber }} · {{ formatWeekRange(recap) }}
                                    <span v-if="recap.weekNumber === currentWeekRecap?.weekNumber" class="text-muted-foreground">({{ t('admin.common.weekly.current') }})</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div v-if="taxSystem === 'progressive'" class="space-y-2 border-t pt-3">
                        <div class="text-xs font-medium">{{ t('admin.dashboard.capitalSnapshot.taxReductions.title') }}</div>
                        <p class="text-xs text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.taxReductions.hint') }}</p>

                        <TooltipProvider>
                            <div class="flex items-start gap-2">
                                <Checkbox id="donationReduction" :model-value="donationReduction" @update:model-value="(v) => (donationReduction = !!v)" />
                                <Label for="donationReduction" class="text-xs cursor-pointer leading-tight">{{ t('admin.dashboard.capitalSnapshot.taxReductions.donation.label') }}</Label>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <button type="button" class="text-muted-foreground hover:text-foreground shrink-0">
                                            <HelpCircle class="size-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent class="max-w-64">{{ t('admin.dashboard.capitalSnapshot.taxReductions.donation.description') }}</TooltipContent>
                                </Tooltip>
                            </div>
                            <div class="flex items-start gap-2">
                                <Checkbox id="sponsorshipReduction" :model-value="sponsorshipReduction" @update:model-value="(v) => (sponsorshipReduction = !!v)" />
                                <Label for="sponsorshipReduction" class="text-xs cursor-pointer leading-tight">{{ t('admin.dashboard.capitalSnapshot.taxReductions.sponsorship.label') }}</Label>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <button type="button" class="text-muted-foreground hover:text-foreground shrink-0">
                                            <HelpCircle class="size-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent class="max-w-64">{{ t('admin.dashboard.capitalSnapshot.taxReductions.sponsorship.description') }}</TooltipContent>
                                </Tooltip>
                            </div>
                            <div class="flex items-start gap-2">
                                <Checkbox id="privilegeReduction" :model-value="privilegeReduction" @update:model-value="(v) => (privilegeReduction = !!v)" />
                                <Label for="privilegeReduction" class="text-xs cursor-pointer leading-tight">{{ t('admin.dashboard.capitalSnapshot.taxReductions.privilege.label') }}</Label>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <button type="button" class="text-muted-foreground hover:text-foreground shrink-0">
                                            <HelpCircle class="size-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent class="max-w-64">{{ t('admin.dashboard.capitalSnapshot.taxReductions.privilege.description') }}</TooltipContent>
                                </Tooltip>
                            </div>
                        </TooltipProvider>
                    </div>

                    <Button size="sm" :loading="isSubmittingCapitalSnapshot" :disabled="isSubmittingCapitalSnapshot" @click="submitCapitalSnapshot">
                        {{ t('admin.dashboard.capitalSnapshot.saveWeek', { week: snapshotWeek }) }}
                    </Button>
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
                        <TableHead v-if="taxSystem === 'progressive'">{{ t('admin.dashboard.weeklyRecap.topBracket') }}</TableHead>
                        <TableHead v-else>{{ t('admin.dashboard.weeklyRecap.taxRate') }}</TableHead>
                        <TableHead v-if="taxSystem === 'progressive'">{{ t('admin.dashboard.weeklyRecap.reductions') }}</TableHead>
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
                            <TableCell v-if="taxSystem === 'progressive'" class="text-sm text-muted-foreground">
                                <template v-if="recap.topBracket">{{ t('admin.dashboard.weeklyRecap.topBracketValue', { index: recap.topBracket.index, rate: recap.topBracket.rate }) }}</template>
                                <template v-else>{{ t('admin.dashboard.weeklyRecap.notAvailable') }}</template>
                            </TableCell>
                            <TableCell v-else class="text-sm text-muted-foreground">{{ recap.taxRate }} %</TableCell>
                            <TableCell v-if="taxSystem === 'progressive'">
                                <div v-if="reductionBadges(recap.reductions).length" class="flex flex-wrap gap-1">
                                    <Badge v-for="label in reductionBadges(recap.reductions)" :key="label" variant="secondary" class="text-xs">{{ label }}</Badge>
                                </div>
                                <span v-else class="text-xs text-muted-foreground">{{ t('admin.dashboard.weeklyRecap.reductionsNone') }}</span>
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="taxSystem === 'progressive' ? 6 : 5" class="text-center text-sm text-muted-foreground py-6">
                            {{ t('admin.dashboard.weeklyRecap.empty') }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <WeeklyMetricChart :weekly-recap="weeklyRecap" />
    </div>
</template>
