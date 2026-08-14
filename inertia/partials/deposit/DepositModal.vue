<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { router } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Dialog, DialogTrigger, DialogScrollContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';
import type { Data } from '@generated/data';

type MyDeposit = { id: string; resourceId: string; quantity: number; createdAt: string };

const { t } = useI18n();

const props = defineProps<{
    resources: Data.Resource[];
    myDeposits: MyDeposit[];
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));

function buildQuantities(items: Data.Resource[]): Record<string, number> {
    return Object.fromEntries(items.map((item) => [item.id, 0]));
}

const open = ref(false);
const isSubmitting = ref(false);
const quantities = reactive<Record<string, number>>(buildQuantities(props.resources));

const soljundResourceId = computed(() => minerais.value.find((r) => r.name === 'Pierre de Lune')?.id);
const soljundQuantity = ref(0);

watch(
    () => props.resources,
    (value) => {
        Object.assign(quantities, buildQuantities(value));
    },
);

function setQuantity(id: string, value: number) {
    quantities[id] = value;
    if (id === soljundResourceId.value && soljundQuantity.value > value) {
        soljundQuantity.value = value;
    }
}

const EDIT_WINDOW_MS = 60 * 60 * 1000;

const resourceById = computed(() => new Map(props.resources.map((resource) => [resource.id, resource])));

function buildEdits(deposits: MyDeposit[]): Record<string, { resourceId: string; quantity: number }> {
    return Object.fromEntries(deposits.map((deposit) => [deposit.id, { resourceId: deposit.resourceId, quantity: deposit.quantity }]));
}

const edits = reactive<Record<string, { resourceId: string; quantity: number }>>(buildEdits(props.myDeposits));
const savingDepositId = ref<string | null>(null);

watch(
    () => props.myDeposits,
    (value) => {
        Object.assign(edits, buildEdits(value));
    },
);

function isEditable(createdAt: string): boolean {
    return Date.now() - new Date(createdAt).getTime() < EDIT_WINDOW_MS;
}

function saveDeposit(deposit: MyDeposit) {
    const edit = edits[deposit.id];
    if (!edit) return;

    savingDepositId.value = deposit.id;
    router.patch(
        urlFor('deposits.update', { id: deposit.id }),
        { resourceId: edit.resourceId, quantity: edit.quantity },
        {
            preserveScroll: true,
            onFinish: () => {
                savingDepositId.value = null;
            },
        },
    );
}

function submitDeposit() {
    const items = props.resources.map((resource) => ({
        resourceId: resource.id,
        quantity: quantities[resource.id] ?? 0,
        soljundQuantity: resource.id === soljundResourceId.value ? soljundQuantity.value : 0,
    }));

    isSubmitting.value = true;
    router.post(
        urlFor('deposits.store'),
        { items },
        {
            preserveScroll: true,
            onSuccess: () => {
                Object.assign(quantities, buildQuantities(props.resources));
                soljundQuantity.value = 0;
                open.value = false;
            },
            onFinish: () => {
                isSubmitting.value = false;
            },
        },
    );
}
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button>{{ t('deposit.trigger') }}</Button>
        </DialogTrigger>
        <DialogScrollContent class="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{{ t('deposit.title') }}</DialogTitle>
            </DialogHeader>

            <Button class="w-full bg-green-600 text-white hover:bg-green-700" :disabled="isSubmitting" @click="submitDeposit">
                {{ t('deposit.submit') }}
            </Button>

            <div class="space-y-6">
                <div class="space-y-2">
                    <h3 class="text-sm font-medium text-muted-foreground">{{ t('admin.resources.types.minerai') }}</h3>
                    <div class="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{{ t('stocks.table.name') }}</TableHead>
                                    <TableHead>{{ t('deposit.quantity') }}</TableHead>
                                    <TableHead>{{ t('deposit.soljundColumn') }}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="resource in minerais" :key="resource.id">
                                    <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                    <TableCell>
                                        <QuantityStepper :model-value="quantities[resource.id] ?? 0" @update:model-value="(value) => setQuantity(resource.id, value)" />
                                    </TableCell>
                                    <TableCell>
                                        <QuantityStepper
                                            v-if="resource.id === soljundResourceId"
                                            :model-value="soljundQuantity"
                                            :max="quantities[resource.id] ?? 0"
                                            show-max
                                            @update:model-value="(value) => (soljundQuantity = value)"
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div class="space-y-2">
                    <h3 class="text-sm font-medium text-muted-foreground">{{ t('admin.resources.types.lingot') }}</h3>
                    <div class="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{{ t('stocks.table.name') }}</TableHead>
                                    <TableHead>{{ t('deposit.quantity') }}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="resource in lingots" :key="resource.id">
                                    <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                    <TableCell>
                                        <QuantityStepper :model-value="quantities[resource.id] ?? 0" @update:model-value="(value) => setQuantity(resource.id, value)" />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Button class="w-full bg-green-600 text-white hover:bg-green-700" :disabled="isSubmitting" @click="submitDeposit">
                {{ t('deposit.submit') }}
            </Button>

            <div v-if="myDeposits.length" class="space-y-2 pt-4 border-t">
                <div>
                    <h3 class="text-sm font-medium text-muted-foreground">{{ t('deposit.myDeposits.title') }}</h3>
                    <p class="text-xs text-muted-foreground">{{ t('deposit.myDeposits.hint') }}</p>
                </div>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('deposit.myDeposits.resource') }}</TableHead>
                                <TableHead>{{ t('deposit.quantity') }}</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="deposit in myDeposits" :key="deposit.id">
                                <TableCell class="min-w-40">
                                    <Select v-model="edits[deposit.id].resourceId" :disabled="!isEditable(deposit.createdAt)">
                                        <SelectTrigger>
                                            <SelectValue>{{ resourceById.get(edits[deposit.id].resourceId)?.name }}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="resource in resources" :key="resource.id" :value="resource.id">
                                                {{ resource.name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <QuantityStepper
                                        :model-value="edits[deposit.id].quantity"
                                        :disabled="!isEditable(deposit.createdAt)"
                                        @update:model-value="(value) => (edits[deposit.id].quantity = value)"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button size="sm" variant="outline" :disabled="!isEditable(deposit.createdAt) || savingDepositId === deposit.id" @click="saveDeposit(deposit)">
                                        {{ t('deposit.myDeposits.save') }}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DialogScrollContent>
    </Dialog>
</template>
