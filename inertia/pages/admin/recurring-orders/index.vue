<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useAuth } from '~/composables/use_auth';
import { useI18n } from 'vue-i18n';
import { computed, ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { TimeInput } from '~/components/ui/time-input';
import DeleteButton from '~/components/ui/DeleteButton.vue';
import { Pencil, Plus, X } from '@lucide/vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

const { t } = useI18n();
const { isManager } = useAuth();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.recurringOrders.title');

type OrderLine = { resourceId: string; resourceName: string; resourceType: string; quantity: number; unitPrice: number };
/** ISO weekday (1 = Monday … 7 = Sunday) and "HH:mm" delivery time. */
type RecurringOrder = { id: string; label: string; weekday: number; time: string; lines: OrderLine[] };

const props = defineProps<{
    orders: RecurringOrder[];
    resources: Data.Resource[];
}>();

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const RESOURCE_TYPES = ['minerai', 'lingot'] as const;

function formatAmount(value: number): string {
    return `${value.toFixed(2)} s`;
}

function orderTotal(lines: { quantity: number | string; unitPrice: number | string }[]): number {
    return lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0), 0);
}

// Form lines keep raw input strings; numbers are sent on submit.
type FormLine = { resourceId: string; quantity: string; unitPrice: string };

const dialogOpen = ref(false);
const editingOrder = ref<RecurringOrder | null>(null);

const form = useForm({
    label: '',
    weekday: '1',
    time: '18:00',
    lines: [] as FormLine[],
});

function openCreate() {
    editingOrder.value = null;
    form.clearErrors();
    form.label = '';
    form.weekday = '1';
    form.time = '18:00';
    form.lines = [{ resourceId: '', quantity: '1', unitPrice: '' }];
    dialogOpen.value = true;
}

function openEdit(order: RecurringOrder) {
    editingOrder.value = order;
    form.clearErrors();
    form.label = order.label;
    form.weekday = String(order.weekday);
    form.time = order.time;
    form.lines = order.lines.map((line) => ({ resourceId: line.resourceId, quantity: String(line.quantity), unitPrice: String(line.unitPrice) }));
    dialogOpen.value = true;
}

function addLine() {
    form.lines.push({ resourceId: '', quantity: '1', unitPrice: '' });
}

function removeLine(index: number) {
    form.lines.splice(index, 1);
}

/** Picking a resource pre-fills its sale price, still editable. */
function onResourceChange(line: FormLine, value: unknown) {
    line.resourceId = String(value);
    const resource = props.resources.find((candidate) => candidate.id === line.resourceId);
    if (resource && !line.unitPrice) line.unitPrice = String(resource.sellPrice);
}

/** A resource already used on another line can't be picked again. */
function isTakenElsewhere(resourceId: string, line: FormLine): boolean {
    return form.lines.some((other) => other !== line && other.resourceId === resourceId);
}

const formTotal = computed(() => orderTotal(form.lines));

const canSubmit = computed(
    () =>
        form.label.trim().length > 0 &&
        !!form.time &&
        form.lines.length > 0 &&
        form.lines.every((line) => line.resourceId && Number(line.quantity) >= 1 && line.unitPrice !== '' && Number(line.unitPrice) >= 0),
);

function submit() {
    form.transform((data) => ({
        label: data.label,
        weekday: Number(data.weekday),
        time: data.time,
        lines: data.lines.map((line) => ({ resourceId: line.resourceId, quantity: Number(line.quantity), unitPrice: Number(line.unitPrice) })),
    }));
    const options = { preserveScroll: true, onSuccess: () => (dialogOpen.value = false) };
    if (editingOrder.value) form.put(urlFor('admin.recurringOrders.update', { id: editingOrder.value.id }), options);
    else form.post(urlFor('admin.recurringOrders.store'), options);
}

function destroy(order: RecurringOrder) {
    router.delete(urlFor('admin.recurringOrders.destroy', { id: order.id }), { preserveScroll: true });
}
</script>

<template>
    <div class="space-y-4">
        <p class="max-w-2xl text-sm text-muted-foreground">{{ t('admin.recurringOrders.description') }}</p>

        <div class="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline">{{ orders.length }} {{ t('admin.recurringOrders.count', orders.length) }}</Badge>
            <Button v-if="isManager" size="sm" class="gap-2" @click="openCreate">
                <Plus class="size-4" />
                {{ t('admin.recurringOrders.add') }}
            </Button>
        </div>

        <div class="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{{ t('admin.recurringOrders.table.label') }}</TableHead>
                        <TableHead>{{ t('admin.recurringOrders.table.delivery') }}</TableHead>
                        <TableHead>{{ t('admin.recurringOrders.table.goods') }}</TableHead>
                        <TableHead class="text-right">{{ t('admin.recurringOrders.table.total') }}</TableHead>
                        <TableHead v-if="isManager">{{ t('admin.recurringOrders.table.actions') }}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="orders.length">
                        <TableRow v-for="order in orders" :key="order.id">
                            <TableCell class="text-sm font-medium">{{ order.label }}</TableCell>
                            <TableCell class="whitespace-nowrap text-sm">{{ t(`admin.common.weekdays.${order.weekday}`) }} · {{ order.time }}</TableCell>
                            <TableCell>
                                <div class="flex flex-wrap gap-1">
                                    <Badge v-for="line in order.lines" :key="line.resourceId" variant="secondary" class="font-normal">
                                        {{ line.quantity }} × {{ line.resourceName }} · {{ formatAmount(line.unitPrice) }}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell class="whitespace-nowrap text-right text-sm font-medium">{{ formatAmount(orderTotal(order.lines)) }}</TableCell>
                            <TableCell v-if="isManager">
                                <div class="flex items-center gap-1">
                                    <Button variant="outline" size="sm" class="gap-1" @click="openEdit(order)">
                                        <Pencil class="size-3.5" />
                                        {{ t('admin.recurringOrders.editAction') }}
                                    </Button>
                                    <DeleteButton
                                        :label="t('admin.recurringOrders.delete.label')"
                                        :title="t('admin.recurringOrders.delete.title')"
                                        :description="t('admin.recurringOrders.delete.description', { label: order.label })"
                                        :cancel-label="t('admin.recurringOrders.delete.cancel')"
                                        :confirm-label="t('admin.recurringOrders.delete.confirm')"
                                        @confirm="destroy(order)"
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    </template>
                    <TableRow v-else>
                        <TableCell :colspan="isManager ? 5 : 4" class="h-24 text-center text-muted-foreground">{{ t('admin.recurringOrders.empty') }}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <Dialog v-model:open="dialogOpen">
            <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{{ editingOrder ? t('admin.recurringOrders.edit') : t('admin.recurringOrders.add') }}</DialogTitle>
                </DialogHeader>

                <div class="space-y-4">
                    <Input v-model="form.label" :label="t('admin.recurringOrders.fields.label')" maxlength="100" :error="form.errors.label" />

                    <div class="flex flex-wrap items-end gap-3">
                        <div class="w-44 space-y-1">
                            <Label>{{ t('admin.recurringOrders.fields.weekday') }}</Label>
                            <Select v-model="form.weekday">
                                <SelectTrigger class="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="weekday in WEEKDAYS" :key="weekday" :value="String(weekday)">{{ t(`admin.common.weekdays.${weekday}`) }}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="space-y-1">
                            <Label>{{ t('admin.recurringOrders.fields.time') }}</Label>
                            <TimeInput v-model="form.time" />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label>{{ t('admin.recurringOrders.fields.lines') }}</Label>
                        <div v-for="(line, index) in form.lines" :key="index" class="flex flex-wrap items-end gap-2 rounded-md border p-2">
                            <div class="min-w-40 flex-1 space-y-1">
                                <span class="text-xs text-muted-foreground">{{ t('admin.recurringOrders.fields.resource') }}</span>
                                <Select :model-value="line.resourceId || undefined" @update:model-value="(value) => onResourceChange(line, value)">
                                    <SelectTrigger class="w-full">
                                        <SelectValue :placeholder="t('admin.recurringOrders.fields.resourcePlaceholder')" />
                                    </SelectTrigger>
                                    <SelectContent class="max-h-72">
                                        <SelectGroup v-for="type in RESOURCE_TYPES" :key="type">
                                            <SelectLabel>{{ t(`admin.recurringOrders.types.${type}`) }}</SelectLabel>
                                            <SelectItem
                                                v-for="resource in resources.filter((candidate) => candidate.type === type)"
                                                :key="resource.id"
                                                :value="resource.id"
                                                :disabled="isTakenElsewhere(resource.id, line)"
                                            >
                                                {{ resource.name }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div class="w-24 space-y-1">
                                <span class="text-xs text-muted-foreground">{{ t('admin.recurringOrders.fields.quantity') }}</span>
                                <Input v-model="line.quantity" type="number" min="1" step="1" />
                            </div>
                            <div class="w-32 space-y-1">
                                <span class="text-xs text-muted-foreground">{{ t('admin.recurringOrders.fields.unitPrice') }}</span>
                                <Input v-model="line.unitPrice" type="number" min="0" step="0.01" />
                            </div>
                            <div class="w-24 pb-2 text-right text-sm font-medium">{{ formatAmount(orderTotal([line])) }}</div>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                class="mb-0.5"
                                :aria-label="t('admin.recurringOrders.fields.removeLine')"
                                :title="t('admin.recurringOrders.fields.removeLine')"
                                :disabled="form.lines.length === 1"
                                @click="removeLine(index)"
                            >
                                <X class="size-4" />
                            </Button>
                        </div>
                        <p v-if="form.errors.lines" class="text-sm text-destructive">{{ form.errors.lines }}</p>
                        <Button variant="outline" size="sm" class="gap-1" :disabled="form.lines.length >= resources.length" @click="addLine">
                            <Plus class="size-4" />
                            {{ t('admin.recurringOrders.fields.addLine') }}
                        </Button>
                    </div>

                    <div class="flex items-center justify-between border-t pt-3 text-sm">
                        <span class="text-muted-foreground">{{ t('admin.recurringOrders.fields.total') }}</span>
                        <span class="font-medium">{{ formatAmount(formTotal) }}</span>
                    </div>

                    <Button class="w-full" :loading="form.processing" :disabled="form.processing || !canSubmit" @click="submit">{{ t('admin.recurringOrders.submit') }}</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
