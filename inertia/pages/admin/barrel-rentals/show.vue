<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();

const NO_TENANT = 'none';

type Rental = { id: string; label: string; price: number; userId: string | null; username: string | null; role: string | null };
type Payment = { id: string; weekNumber: number; amountPaid: number; createdAt: string };
type AvailableWeek = { weekNumber: number; startDate: string; endDate: string };
type EligibleUser = Data.User;

const props = defineProps<{
    rental: Rental;
    payments: Payment[];
    currentWeek: number;
    availableWeeks: AvailableWeek[];
    eligibleUsers: EligibleUser[];
}>();

pageTitle.value = `${t('admin.barrelRentals.show.title')} - ${props.rental.label}`;

function destroyRental() {
    router.delete(urlFor('admin.barrelRentals.destroy', { id: props.rental.id }));
}

function deletePayment(paymentId: string) {
    router.delete(urlFor('admin.barrelRentals.payments.destroy', { id: paymentId }), { preserveScroll: true });
}

function isWeekPaid(week: number): boolean {
    return props.payments.some((payment) => payment.weekNumber === week);
}

function formatWeekRange(week: AvailableWeek): string {
    const format = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
    return `${format(week.startDate)} - ${format(week.endDate)}`;
}

const label = ref(props.rental.label);
const price = ref(String(props.rental.price));
const userId = ref(props.rental.userId ?? NO_TENANT);
const isSubmitting = ref(false);

function submit() {
    isSubmitting.value = true;
    router.put(
        urlFor('admin.barrelRentals.update', { id: props.rental.id }),
        { label: label.value, price: price.value, userId: userId.value === NO_TENANT ? null : userId.value },
        { preserveScroll: true, onFinish: () => (isSubmitting.value = false) },
    );
}

const weekNumber = ref(String(props.availableWeeks.find((week) => !isWeekPaid(week.weekNumber))?.weekNumber ?? props.currentWeek));
const isSubmittingPayment = ref(false);

function submitPayment() {
    isSubmittingPayment.value = true;
    router.post(urlFor('admin.barrelRentals.payments.store', { id: props.rental.id }), { weekNumber: weekNumber.value }, { preserveScroll: true, onFinish: () => (isSubmittingPayment.value = false) });
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <Button variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.barrelRentals.index')">
                    <ArrowLeft class="size-4" />
                    {{ t('admin.barrelRentals.show.back') }}
                </Link>
            </Button>
            <DeleteButton
                v-if="isAdmin"
                :label="t('admin.barrelRentals.show.delete')"
                :title="t('admin.barrelRentals.show.deleteConfirm.title')"
                :description="t('admin.barrelRentals.show.deleteConfirm.description', { label: props.rental.label })"
                :cancel-label="t('admin.barrelRentals.show.deleteConfirm.cancel')"
                :confirm-label="t('admin.barrelRentals.show.deleteConfirm.confirm')"
                @confirm="destroyRental"
            />
        </div>

        <div class="flex items-center gap-3">
            <h2 class="text-lg font-medium">{{ props.rental.label }}</h2>
            <span v-if="props.rental.username" class="inline-flex items-center gap-2 text-sm text-muted-foreground">
                {{ props.rental.username }}
                <Badge variant="secondary">{{ t(`admin.users.show.fields.roles.${props.rental.role}`) }}</Badge>
            </span>
            <Badge v-else variant="outline">{{ t('admin.barrelRentals.fields.noTenant') }}</Badge>
        </div>

        <div class="rounded-md border p-5 space-y-4 max-w-lg">
            <Input v-model="label" :label="t('admin.barrelRentals.fields.label')" maxlength="100" :readonly="!isAdmin" />
            <Input v-model="price" type="number" min="0" step="0.01" :label="t('admin.barrelRentals.fields.price')" :readonly="!isAdmin" />

            <div class="space-y-1">
                <Label>{{ t('admin.barrelRentals.fields.tenant') }}</Label>
                <Select v-model="userId" :disabled="!isAdmin">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem :value="NO_TENANT">{{ t('admin.barrelRentals.fields.noTenant') }}</SelectItem>
                        <SelectItem v-for="eligibleUser in props.eligibleUsers" :key="eligibleUser.id" :value="eligibleUser.id">
                            {{ eligibleUser.username }} ({{ t(`admin.users.show.fields.roles.${eligibleUser.role}`) }})
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <p class="text-xs text-muted-foreground">{{ t('admin.barrelRentals.show.freeHint') }}</p>
            <Button v-if="isAdmin" :loading="isSubmitting" :disabled="isSubmitting" @click="submit">
                {{ t('admin.barrelRentals.show.save') }}
            </Button>
        </div>

        <div v-if="isAdmin && props.rental.userId && props.rental.price > 0" class="rounded-md border p-5 space-y-4 max-w-lg">
            <div class="text-sm font-medium">{{ t('admin.barrelRentals.payments.add') }}</div>

            <div class="space-y-1">
                <Label>{{ t('admin.barrelRentals.payments.week') }}</Label>
                <Select v-model="weekNumber">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="week in props.availableWeeks" :key="week.weekNumber" :value="String(week.weekNumber)" :disabled="isWeekPaid(week.weekNumber)">
                            {{ formatWeekRange(week) }}
                            <span v-if="week.weekNumber === currentWeek" class="text-muted-foreground">({{ t('admin.common.weekly.current') }})</span>
                            <span v-else-if="isWeekPaid(week.weekNumber)" class="text-muted-foreground">({{ t('admin.barrelRentals.payments.alreadyPaid') }})</span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button :loading="isSubmittingPayment" :disabled="isSubmittingPayment" @click="submitPayment">
                {{ t('admin.barrelRentals.payments.submit') }}
            </Button>
        </div>
        <p v-else-if="isAdmin && !props.rental.userId" class="text-sm text-muted-foreground">{{ t('admin.barrelRentals.show.noTenantHint') }}</p>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.barrelRentals.payments.table.week') }}</TableHead>
                        <TableHead>{{ t('admin.barrelRentals.payments.table.amount') }}</TableHead>
                        <TableHead>{{ t('admin.barrelRentals.payments.table.date') }}</TableHead>
                        <TableHead>{{ t('admin.barrelRentals.payments.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="props.payments.length">
                        <TableRow v-for="payment in props.payments" :key="payment.id">
                            <TableCell>
                                <Badge variant="secondary">{{ t('admin.barrelRentals.weekly.weekBadge', { week: payment.weekNumber }) }}</Badge>
                            </TableCell>
                            <TableCell class="text-sm font-medium">{{ payment.amountPaid.toFixed(2) }} s</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ new Date(payment.createdAt).toLocaleDateString('fr-FR') }}</TableCell>
                            <TableCell>
                                <DeleteButton
                                    v-if="isAdmin"
                                    :label="t('admin.barrelRentals.payments.delete.label')"
                                    :title="t('admin.barrelRentals.payments.delete.title')"
                                    :description="t('admin.barrelRentals.payments.delete.description', { week: payment.weekNumber })"
                                    :cancel-label="t('admin.barrelRentals.payments.delete.cancel')"
                                    :confirm-label="t('admin.barrelRentals.payments.delete.confirm')"
                                    @confirm="deletePayment(payment.id)"
                                />
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="4" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.barrelRentals.payments.table.empty') }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
</template>
