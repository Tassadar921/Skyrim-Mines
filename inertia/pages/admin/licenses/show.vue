<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
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

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
const { isAdmin } = useAuth();

type Subscriber = { id: string; username: string; role: string };
type Payment = { id: string; weekNumber: number; isCitizen: boolean; amountPaid: number; createdAt: string };
type AvailableWeek = { weekNumber: number; startDate: string; endDate: string };

const props = defineProps<{
    subscriber: Subscriber;
    payments: Payment[];
    prices: { citizenPrice: number; nonCitizenPrice: number };
    currentWeek: number;
    availableWeeks: AvailableWeek[];
}>();

pageTitle.value = `${t('admin.licenses.show.title')} - ${props.subscriber.username}`;

function destroySubscriber() {
    router.delete(urlFor('admin.licenses.subscribers.destroy', { id: props.subscriber.id }));
}

function deletePayment(paymentId: string) {
    router.delete(urlFor('admin.licenses.payments.destroy', { id: paymentId }), { preserveScroll: true });
}

function isWeekPaid(week: number): boolean {
    return props.payments.some((payment) => payment.weekNumber === week);
}

function formatWeekRange(week: AvailableWeek): string {
    const format = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
    return `${format(week.startDate)} - ${format(week.endDate)}`;
}

const citizenshipStatus = ref<'citizen' | 'nonCitizen'>('citizen');
const weekNumber = ref(String(props.availableWeeks.find((week) => !isWeekPaid(week.weekNumber))?.weekNumber ?? props.currentWeek));
const amountPaid = ref(String(props.prices.citizenPrice));
const isSubmittingPayment = ref(false);

watch(citizenshipStatus, (value) => {
    amountPaid.value = String(value === 'citizen' ? props.prices.citizenPrice : props.prices.nonCitizenPrice);
});

function submitPayment() {
    isSubmittingPayment.value = true;
    router.post(
        urlFor('admin.licenses.payments.store', { id: props.subscriber.id }),
        { weekNumber: weekNumber.value, isCitizen: citizenshipStatus.value === 'citizen', amountPaid: amountPaid.value },
        { preserveScroll: true, onFinish: () => (isSubmittingPayment.value = false) },
    );
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <Button variant="outline" class="gap-2" as-child>
                <Link :href="urlFor('admin.licenses.index')">
                    <ArrowLeft class="size-4" />
                    {{ t('admin.licenses.show.back') }}
                </Link>
            </Button>
            <DeleteButton
                v-if="isAdmin"
                :label="t('admin.licenses.show.delete')"
                :title="t('admin.licenses.show.deleteConfirm.title')"
                :description="t('admin.licenses.show.deleteConfirm.description', { username: props.subscriber.username })"
                :cancel-label="t('admin.licenses.show.deleteConfirm.cancel')"
                :confirm-label="t('admin.licenses.show.deleteConfirm.confirm')"
                @confirm="destroySubscriber"
            />
        </div>

        <div class="flex items-center gap-3">
            <h2 class="text-lg font-medium">{{ props.subscriber.username }}</h2>
            <Badge variant="secondary">{{ t(`admin.licenses.roles.${props.subscriber.role}`) }}</Badge>
        </div>

        <div v-if="isAdmin" class="rounded-md border p-5 space-y-4 max-w-lg">
            <div class="text-sm font-medium">{{ t('admin.licenses.payments.add') }}</div>

            <div class="space-y-1">
                <Label>{{ t('admin.licenses.payments.week') }}</Label>
                <Select v-model="weekNumber">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="week in props.availableWeeks" :key="week.weekNumber" :value="String(week.weekNumber)" :disabled="isWeekPaid(week.weekNumber)">
                            {{ formatWeekRange(week) }}
                            <span v-if="week.weekNumber === currentWeek" class="text-muted-foreground">({{ t('admin.common.weekly.current') }})</span>
                            <span v-else-if="isWeekPaid(week.weekNumber)" class="text-muted-foreground">({{ t('admin.licenses.payments.alreadyPaid') }})</span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-1">
                <Label>{{ t('admin.licenses.payments.status') }}</Label>
                <Select v-model="citizenshipStatus">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="citizen">{{ t('admin.licenses.payments.citizen') }}</SelectItem>
                        <SelectItem value="nonCitizen">{{ t('admin.licenses.payments.nonCitizen') }}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Input v-model="amountPaid" type="number" min="0" step="0.01" :label="t('admin.licenses.payments.amount')" />

            <Button :loading="isSubmittingPayment" :disabled="isSubmittingPayment" @click="submitPayment">
                {{ t('admin.licenses.payments.submit') }}
            </Button>
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.licenses.payments.table.week') }}</TableHead>
                        <TableHead>{{ t('admin.licenses.payments.table.status') }}</TableHead>
                        <TableHead>{{ t('admin.licenses.payments.table.amount') }}</TableHead>
                        <TableHead>{{ t('admin.licenses.payments.table.date') }}</TableHead>
                        <TableHead>{{ t('admin.licenses.payments.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="props.payments.length">
                        <TableRow v-for="payment in props.payments" :key="payment.id">
                            <TableCell>
                                <Badge variant="secondary">{{ t('admin.licenses.weekly.weekBadge', { week: payment.weekNumber }) }}</Badge>
                            </TableCell>
                            <TableCell class="text-sm text-muted-foreground">
                                {{ payment.isCitizen ? t('admin.licenses.payments.citizen') : t('admin.licenses.payments.nonCitizen') }}
                            </TableCell>
                            <TableCell class="text-sm font-medium">{{ payment.amountPaid.toFixed(2) }} s</TableCell>
                            <TableCell class="text-sm text-muted-foreground">{{ new Date(payment.createdAt).toLocaleDateString('fr-FR') }}</TableCell>
                            <TableCell>
                                <DeleteButton
                                    v-if="isAdmin"
                                    :label="t('admin.licenses.payments.delete.label')"
                                    :title="t('admin.licenses.payments.delete.title')"
                                    :description="t('admin.licenses.payments.delete.description', { week: payment.weekNumber })"
                                    :cancel-label="t('admin.licenses.payments.delete.cancel')"
                                    :confirm-label="t('admin.licenses.payments.delete.confirm')"
                                    @confirm="deletePayment(payment.id)"
                                />
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="5" class="h-24 text-center text-muted-foreground">
                            {{ t('admin.licenses.payments.table.empty') }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
</template>
