<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Head, router, usePage } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { useAuth } from '~/composables/use_auth';
import { getTransmit } from '~/lib/transmit';
import { canHaveBalance } from '~/lib/user_balance';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from '~/components/ui/alert-dialog';
import { PackageCheck, ArrowDownToLine, ArrowUpFromLine } from '@lucide/vue';
import DepositModal from '~/partials/deposit/DepositModal.vue';
import BuybackModal from '~/partials/buyback/BuybackModal.vue';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';
import type { Data } from '@generated/data';

type ResourceWithBarrel = Data.Resource & { quantityBarrel: number; myQuantityBarrel: number };
type RemainingLine = { orderLineId: string; resourceName: string; resourceType: string; unitPrice: number; orderedQuantity: number; remainingQuantity: number };
type OrderToDeliver = {
    id: string;
    number: number;
    requesterName: string;
    organizationName: string | null;
    defaultCastellanyId: string | null;
    lines: RemainingLine[];
};

const { t } = useI18n();
const { isAdmin } = useAuth();
const page = usePage<Data.SharedProps>();

type MyDeposit = { id: string; resourceId: string; quantity: number; createdAt: string };

const props = defineProps<{
    resources: ResourceWithBarrel[];
    ordersToDeliver: OrderToDeliver[];
    castellanies: { id: string; name: string; commissionAmount: number }[];
    myDeposits: MyDeposit[];
    pickaxeStock: number | null;
}>();

const isTakingPickaxe = ref(false);
const isDepositingPickaxe = ref(false);

function takePickaxe() {
    isTakingPickaxe.value = true;
    router.post(urlFor('pickaxes.take'), {}, { preserveScroll: true, onFinish: () => (isTakingPickaxe.value = false) });
}

function depositPickaxe() {
    isDepositingPickaxe.value = true;
    router.post(urlFor('pickaxes.deposit'), {}, { preserveScroll: true, onFinish: () => (isDepositingPickaxe.value = false) });
}

const PICKUP = 'pickup';

const deliveryCastellany = reactive<Record<string, string>>({});

function syncDeliveryCastellany(orders: OrderToDeliver[]) {
    for (const orderId of Object.keys(deliveryCastellany)) {
        if (!orders.some((order) => order.id === orderId)) delete deliveryCastellany[orderId];
    }
    for (const order of orders) {
        if (deliveryCastellany[order.id] === undefined) {
            deliveryCastellany[order.id] = order.defaultCastellanyId ?? PICKUP;
        }
    }
}

watch(() => props.ordersToDeliver, syncDeliveryCastellany, { immediate: true, deep: true });

function formatOrderNumber(number: number): string {
    return String(number).padStart(5, '0');
}

const deliveryQuantities = reactive<Record<string, Record<string, number>>>({});

function syncDeliveryQuantities(orders: OrderToDeliver[]) {
    for (const orderId of Object.keys(deliveryQuantities)) {
        if (!orders.some((order) => order.id === orderId)) delete deliveryQuantities[orderId];
    }
    for (const order of orders) {
        const lineQuantities = deliveryQuantities[order.id] ?? (deliveryQuantities[order.id] = {});
        for (const orderLineId of Object.keys(lineQuantities)) {
            if (!order.lines.some((line) => line.orderLineId === orderLineId)) delete lineQuantities[orderLineId];
        }
        for (const line of order.lines) {
            const current = lineQuantities[line.orderLineId];
            lineQuantities[line.orderLineId] = current === undefined ? line.remainingQuantity : Math.min(current, line.remainingQuantity);
        }
    }
}

watch(() => props.ordersToDeliver, syncDeliveryQuantities, { immediate: true, deep: true });

function hasSelection(order: OrderToDeliver): boolean {
    return order.lines.some((line) => (deliveryQuantities[order.id]?.[line.orderLineId] ?? 0) > 0);
}

function confirmDelivery(order: OrderToDeliver) {
    const lines = order.lines.map((line) => ({ orderLineId: line.orderLineId, quantity: deliveryQuantities[order.id]?.[line.orderLineId] ?? 0 }));
    const castellanyId = deliveryCastellany[order.id] === PICKUP ? null : deliveryCastellany[order.id];
    router.post(urlFor('livraisons.store', { orderId: order.id }), { lines, castellanyId }, { preserveScroll: true });
}

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai' && r.quantityBarrel > 0));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot' && r.quantityBarrel > 0));

const totalBarrelValue = computed(() => props.resources.reduce((sum, resource) => sum + resource.buyPrice * resource.quantityBarrel, 0));

const myMinerais = computed(() => props.resources.filter((r) => r.type === 'minerai' && r.myQuantityBarrel > 0));
const myLingots = computed(() => props.resources.filter((r) => r.type === 'lingot' && r.myQuantityBarrel > 0));

const totalMyBarrelValue = computed(() => props.resources.reduce((sum, resource) => sum + resource.buyPrice * resource.myQuantityBarrel, 0));

const canSeeToDeliver = page.props.user?.role === 'admin' || page.props.user?.role === 'staff';

let barrelSubscription: ReturnType<ReturnType<typeof getTransmit>['subscription']> | undefined;
let toDeliverSubscription: ReturnType<ReturnType<typeof getTransmit>['subscription']> | undefined;

onMounted(async () => {
    barrelSubscription = getTransmit().subscription('barrel');
    await barrelSubscription.create();
    barrelSubscription.onMessage(() => {
        router.reload({ only: ['resources'] });
    });

    if (canSeeToDeliver) {
        toDeliverSubscription = getTransmit().subscription('to-deliver');
        await toDeliverSubscription.create();
        toDeliverSubscription.onMessage(() => {
            router.reload({ only: ['ordersToDeliver'] });
        });
    }
});

onUnmounted(() => {
    barrelSubscription?.delete();
    toDeliverSubscription?.delete();
});
</script>

<template>
    <Head :title="t('title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-16">
        <div class="flex flex-col items-center text-center gap-6">
            <img :src="'/logo.png'" alt="Compagnie Minière de la Crevasse" class="size-20" />
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('home.title') }}</h1>
            <p v-if="page.props.user && canHaveBalance(page.props.user.role)" class="text-sm text-slate-600 dark:text-slate-300">
                {{ t('home.balance', { amount: page.props.user.balance.toFixed(2) }) }}
            </p>
            <div class="flex items-center gap-3">
                <DepositModal :resources="resources" :my-deposits="myDeposits" />
                <BuybackModal v-if="isAdmin" :resources="resources" />
            </div>
        </div>

        <div v-if="pickaxeStock !== null" class="max-w-md mx-auto w-full space-y-4">
            <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100 text-center">{{ t('home.pickaxes.title') }}</h2>
            <div class="rounded-md border p-4 space-y-4 text-center">
                <div class="text-sm text-slate-600 dark:text-slate-300">{{ t('home.pickaxes.companyStock', { count: pickaxeStock }) }}</div>
                <div class="flex items-center justify-center gap-3">
                    <Button variant="outline" class="gap-1" :disabled="pickaxeStock === 0 || isTakingPickaxe" @click="takePickaxe">
                        <ArrowDownToLine class="size-4" />
                        {{ t('home.pickaxes.take') }}
                    </Button>
                    <Button variant="outline" class="gap-1" :disabled="isDepositingPickaxe" @click="depositPickaxe">
                        <ArrowUpFromLine class="size-4" />
                        {{ t('home.pickaxes.deposit') }}
                    </Button>
                </div>
            </div>
        </div>

        <div v-if="ordersToDeliver.length" class="max-w-3xl mx-auto space-y-6">
            <div class="flex items-center justify-center gap-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100 text-center">{{ t('home.toDeliver.title') }}</h2>
                <Badge variant="outline">{{ ordersToDeliver.length }} {{ t('home.toDeliver.count', ordersToDeliver.length) }}</Badge>
            </div>

            <div v-for="order in ordersToDeliver" :key="order.id" class="rounded-md border p-4 space-y-3">
                <div>
                    <div class="font-medium text-slate-800 dark:text-slate-100">{{ t('commande.index.table.number') }} {{ formatOrderNumber(order.number) }} — {{ order.requesterName }}</div>
                    <div v-if="order.organizationName" class="text-sm text-muted-foreground">{{ order.organizationName }}</div>
                </div>

                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('stocks.table.name') }}</TableHead>
                                <TableHead>{{ t('home.toDeliver.remaining') }}</TableHead>
                                <TableHead>{{ t('home.toDeliver.quantityToDeliver') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="line in order.lines" :key="line.orderLineId">
                                <TableCell class="text-sm font-medium">{{ line.resourceName }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ line.remainingQuantity }} / {{ line.orderedQuantity }}</TableCell>
                                <TableCell>
                                    <QuantityStepper
                                        :model-value="deliveryQuantities[order.id][line.orderLineId]"
                                        :max="line.remainingQuantity"
                                        show-max
                                        @update:model-value="(value) => (deliveryQuantities[order.id][line.orderLineId] = value)"
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <div class="flex items-end justify-between gap-4">
                    <div class="space-y-1 max-w-xs w-full">
                        <Label>{{ t('home.toDeliver.castellany') }}</Label>
                        <Select v-model="deliveryCastellany[order.id]">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem :value="PICKUP">{{ t('home.toDeliver.castellanyPickup') }}</SelectItem>
                                <SelectItem v-for="castellany in props.castellanies" :key="castellany.id" :value="castellany.id">{{ castellany.name }}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger as-child>
                            <Button size="sm" class="gap-1 shrink-0" :disabled="!hasSelection(order)">
                                <PackageCheck class="size-4" />
                                {{ t('home.toDeliver.deliverButton') }}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{{ t('home.toDeliver.deliverConfirm.title') }}</AlertDialogTitle>
                                <AlertDialogDescription>{{ t('home.toDeliver.deliverConfirm.description', { number: formatOrderNumber(order.number) }) }}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{{ t('home.toDeliver.deliverConfirm.cancel') }}</AlertDialogCancel>
                                <AlertDialogAction @click="confirmDelivery(order)">{{ t('home.toDeliver.deliverConfirm.confirm') }}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>

        <div v-if="myMinerais.length || myLingots.length" class="max-w-3xl mx-auto space-y-10">
            <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100 text-center">{{ t('home.myBarrel.title') }}</h2>

            <div v-if="myMinerais.length" class="space-y-3">
                <h3 class="text-lg font-medium">{{ t('admin.resources.types.minerai') }}</h3>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>{{ t('deposit.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="resource in myMinerais" :key="resource.id">
                                <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ resource.myQuantityBarrel }}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div v-if="myLingots.length" class="space-y-3">
                <h3 class="text-lg font-medium">{{ t('admin.resources.types.lingot') }}</h3>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>{{ t('deposit.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="resource in myLingots" :key="resource.id">
                                <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ resource.myQuantityBarrel }}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div class="flex items-center justify-end gap-2 text-lg">
                <span class="text-slate-600 dark:text-slate-300">{{ t('home.myBarrel.totalValue') }}</span>
                <span class="font-medium text-slate-800 dark:text-slate-100">{{ totalMyBarrelValue.toFixed(2) }} s</span>
            </div>
        </div>

        <div v-if="minerais.length || lingots.length" class="max-w-3xl mx-auto space-y-10">
            <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100 text-center">{{ t('home.barrel.title') }}</h2>

            <div v-if="minerais.length" class="space-y-3">
                <h3 class="text-lg font-medium">{{ t('admin.resources.types.minerai') }}</h3>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>{{ t('deposit.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="resource in minerais" :key="resource.id">
                                <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ resource.quantityBarrel }}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div v-if="lingots.length" class="space-y-3">
                <h3 class="text-lg font-medium">{{ t('admin.resources.types.lingot') }}</h3>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead></TableHead>
                                <TableHead>{{ t('deposit.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="resource in lingots" :key="resource.id">
                                <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ resource.quantityBarrel }}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div class="flex items-center justify-end gap-2 text-lg">
                <span class="text-slate-600 dark:text-slate-300">{{ t('home.barrel.totalValue') }}</span>
                <span class="font-medium text-slate-800 dark:text-slate-100">{{ totalBarrelValue.toFixed(2) }} s</span>
            </div>
        </div>
    </div>
</template>
