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
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
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
    capital: number | null;
    stockValue: number | null;
    totalCapital: number | null;
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

const capitalInput = ref('');
const stockValueInput = ref('');
const donationReduction = ref(false);
const sponsorshipReduction = ref(false);
const privilegeReduction = ref(false);
const isSubmittingCapitalSnapshot = ref(false);

function submitCapitalSnapshot() {
    isSubmittingCapitalSnapshot.value = true;
    router.post(
        urlFor('admin.dashboard.capitalSnapshot.store'),
        {
            capital: capitalInput.value,
            stockValue: stockValueInput.value,
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
        <div class="flex flex-nowrap gap-4">
            <div class="rounded-md border p-5 space-y-4 flex-1 min-w-0">
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

            <div class="rounded-md border p-5 space-y-3 flex-1 min-w-0">
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

            <div class="rounded-md border p-5 space-y-4 flex-1 min-w-0">
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
                    <div v-if="reductionBadges(currentWeekRecap.reductions).length" class="flex flex-wrap gap-1 pt-1">
                        <Badge v-for="label in reductionBadges(currentWeekRecap.reductions)" :key="label" variant="secondary" class="text-xs">{{ label }}</Badge>
                    </div>
                </template>
                <template v-else>
                    <p class="text-xs text-muted-foreground">{{ t('admin.dashboard.capitalSnapshot.notEntered') }}</p>
                    <template v-if="isManager">
                        <Input v-model="capitalInput" type="number" :label="t('admin.dashboard.capitalSnapshot.capital')" min="0" step="0.01" />
                        <Input v-model="stockValueInput" type="number" :label="t('admin.dashboard.capitalSnapshot.stockValue')" min="0" step="0.01" />

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
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.taxRate') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.reductions') }}</TableHead>
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
                            <TableCell class="text-sm text-muted-foreground">{{ recap.taxRate }} %</TableCell>
                            <TableCell>
                                <div v-if="reductionBadges(recap.reductions).length" class="flex flex-wrap gap-1">
                                    <Badge v-for="label in reductionBadges(recap.reductions)" :key="label" variant="secondary" class="text-xs">{{ label }}</Badge>
                                </div>
                                <span v-else class="text-xs text-muted-foreground">{{ t('admin.dashboard.weeklyRecap.reductionsNone') }}</span>
                            </TableCell>
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
