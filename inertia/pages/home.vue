<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { Head, router, usePage } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { useAuth } from '~/composables/use_auth';
import { getTransmit } from '~/lib/transmit';
import { canHaveBalance } from '~/lib/user_balance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import DepositModal from '~/partials/deposit/DepositModal.vue';
import PermanenceTodayCard, { type PermanenceToday } from '~/partials/permanences/PermanenceTodayCard.vue';
import BuybackModal from '~/partials/buyback/BuybackModal.vue';
import type { Data } from '@generated/data';

type ResourceWithBarrel = Data.Resource & { quantityBarrel: number; myQuantityBarrel: number };

const { t } = useI18n();
const { isAdmin } = useAuth();
const page = usePage<Data.SharedProps>();

type MyDeposit = { id: string; resourceId: string; quantity: number; createdAt: string };

const props = defineProps<{
    resources: ResourceWithBarrel[];
    myDeposits: MyDeposit[];
    /** Owners and foremen only: today's permanences still to come; null for everyone else. */
    permanencesToday: PermanenceToday[] | null;
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai' && r.quantityBarrel > 0));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot' && r.quantityBarrel > 0));

const totalBarrelValue = computed(() => props.resources.reduce((sum, resource) => sum + resource.buyPrice * resource.quantityBarrel, 0));

const myMinerais = computed(() => props.resources.filter((r) => r.type === 'minerai' && r.myQuantityBarrel > 0));
const myLingots = computed(() => props.resources.filter((r) => r.type === 'lingot' && r.myQuantityBarrel > 0));

const totalMyBarrelValue = computed(() => props.resources.reduce((sum, resource) => sum + resource.buyPrice * resource.myQuantityBarrel, 0));

const canSeeCompanyBarrel = page.props.user?.role === 'admin' || page.props.user?.role === 'auditor' || page.props.user?.role === 'staff' || page.props.user?.role === 'foreman';

let barrelSubscription: ReturnType<ReturnType<typeof getTransmit>['subscription']> | undefined;
let permanencesSubscription: ReturnType<ReturnType<typeof getTransmit>['subscription']> | undefined;

onMounted(async () => {
    barrelSubscription = getTransmit().subscription('barrel');
    await barrelSubscription.create();
    barrelSubscription.onMessage(() => {
        router.reload({ only: ['resources'] });
    });

    // Someone said "I'll be there" (or withdrew): refresh the attendee lists live.
    if (props.permanencesToday) {
        permanencesSubscription = getTransmit().subscription('permanences');
        await permanencesSubscription.create();
        permanencesSubscription.onMessage(() => {
            router.reload({ only: ['permanencesToday'] });
        });
    }
});

onUnmounted(() => {
    barrelSubscription?.delete();
    permanencesSubscription?.delete();
});
</script>

<template>
    <Head :title="t('title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-16">
        <div class="flex flex-col items-center text-center gap-6">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('home.title') }}</h1>
            <p v-if="page.props.subtitle" class="max-w-2xl font-serif text-xl font-light text-slate-500 dark:text-slate-400">{{ page.props.subtitle }}</p>
            <p v-if="page.props.user && canHaveBalance(page.props.user.role)" class="text-sm text-slate-600 dark:text-slate-300">
                {{ t('home.balance', { amount: page.props.user.balance.toFixed(2) }) }}
            </p>
            <div class="flex items-center gap-3">
                <DepositModal :resources="resources" :my-deposits="myDeposits" />
                <BuybackModal v-if="isAdmin" :resources="resources" />
            </div>
        </div>

        <PermanenceTodayCard v-if="permanencesToday?.length" :permanences="permanencesToday" />

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

        <div v-if="canSeeCompanyBarrel && (minerais.length || lingots.length)" class="max-w-3xl mx-auto space-y-10">
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
