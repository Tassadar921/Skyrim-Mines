<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
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
    profit: number;
    weeklyTax: number;
    buybacksAmount: number;
    licensesAmount: number;
    employeeDueAmount: number;
};

const props = defineProps<{
    weeklyRecap: WeeklyRecap[];
    castellanyTaxRate: number;
}>();

function formatWeekRange(recap: WeeklyRecap): string {
    const format = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
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
</script>

<template>
    <div class="space-y-4">
        <div class="rounded-md border p-5 space-y-4 max-w-xs">
            <div class="text-sm font-medium">{{ t('admin.dashboard.castellanyTax.title') }}</div>
            <Input v-model="castellanyTaxRate" type="number" :label="t('admin.dashboard.castellanyTax.rate')" min="0" :max="100" step="1" :readonly="!isAdmin" />
            <Button v-if="isAdmin" size="sm" :loading="isSubmittingCastellanyTax" :disabled="isSubmittingCastellanyTax" @click="submitCastellanyTax">
                {{ t('admin.dashboard.castellanyTax.save') }}
            </Button>
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
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.profit') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.weeklyTax') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.buybacks') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.licenses') }}</TableHead>
                        <TableHead>{{ t('admin.dashboard.weeklyRecap.employeeDue') }}</TableHead>
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
                            <TableCell class="text-sm">{{ formatAmount(recap.buybacksAmount) }}</TableCell>
                            <TableCell class="text-sm">{{ formatAmount(recap.licensesAmount) }}</TableCell>
                            <TableCell class="text-sm">{{ formatAmount(recap.employeeDueAmount) }}</TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell colspan="7" class="text-center text-sm text-muted-foreground py-6">
                            {{ t('admin.dashboard.weeklyRecap.empty') }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <WeeklyMetricChart :weekly-recap="weeklyRecap" />
    </div>
</template>
