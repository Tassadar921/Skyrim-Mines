<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import { useI18n } from 'vue-i18n';
import { urlFor } from '~/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';
import type { Data } from '@generated/data';

type ClientOption = { id: string; username: string; organizationId: string | null; organizationName: string | null };
type OrganizationOption = { id: string; name: string };
type RecipientMode = 'myOrganization' | 'myself' | 'thirdParty';

const { t } = useI18n();

const props = defineProps<{
    resources: Data.Resource[];
    organizationId: string | null;
    organizationName: string | null;
    canRequestForThirdParty: boolean;
    clients: ClientOption[];
    organizations: OrganizationOption[];
    organizationResourcePrices: Record<string, Record<string, number>>;
}>();

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));

const clientsWithOrganization = computed(() => props.clients.filter((client) => client.organizationName));
const clientsWithoutOrganization = computed(() => props.clients.filter((client) => !client.organizationName));

function buildQuantities(items: Data.Resource[]): Record<string, number> {
    return Object.fromEntries(items.map((item) => [item.id, 0]));
}

const quantities = reactive<Record<string, number>>(buildQuantities(props.resources));
const isSubmitting = ref(false);

function setQuantity(id: string, value: number) {
    quantities[id] = value;
}

const totalAmount = computed(() => props.resources.reduce((sum, resource) => sum + priceFor(resource) * (quantities[resource.id] ?? 0), 0));
const hasSelection = computed(() => Object.values(quantities).some((quantity) => quantity > 0));

const recipientMode = ref<RecipientMode>(props.organizationName ? 'myOrganization' : 'myself');
const thirdPartySelection = ref('');
const thirdPartyScope = ref<'organization' | 'personal'>('organization');

const selectedThirdPartyType = computed(() => thirdPartySelection.value.split(':')[0] as 'client' | 'organization' | '');
const selectedThirdPartyId = computed(() => thirdPartySelection.value.split(':')[1] ?? '');
const selectedClient = computed<ClientOption | undefined>(() => (selectedThirdPartyType.value === 'client' ? props.clients.find((client) => client.id === selectedThirdPartyId.value) : undefined));
const showScopeChoice = computed(() => !!selectedClient.value?.organizationName);

const effectiveOrganizationId = computed<string | null>(() => {
    if (recipientMode.value === 'myOrganization') return props.organizationId;
    if (recipientMode.value === 'myself') return null;
    if (selectedThirdPartyType.value === 'organization') return selectedThirdPartyId.value || null;
    if (selectedThirdPartyType.value === 'client') {
        if (showScopeChoice.value && thirdPartyScope.value === 'personal') return null;
        return selectedClient.value?.organizationId ?? null;
    }
    return null;
});

function priceFor(resource: Data.Resource): number {
    const organizationId = effectiveOrganizationId.value;
    if (!organizationId) return resource.sellPrice;
    return props.organizationResourcePrices[organizationId]?.[resource.id] ?? resource.sellPrice;
}

const canSubmit = computed(() => {
    if (!hasSelection.value) return false;
    if (recipientMode.value !== 'thirdParty') return true;
    return selectedThirdPartyType.value === 'client' || selectedThirdPartyType.value === 'organization';
});

function submitOrder() {
    const items = props.resources.map((resource) => ({ resourceId: resource.id, quantity: quantities[resource.id] ?? 0 }));

    const recipient: Record<string, string> = {};
    if (recipientMode.value === 'myOrganization') {
        recipient.recipientMode = 'myOrganization';
    } else if (recipientMode.value === 'myself') {
        recipient.recipientMode = 'myself';
    } else if (selectedThirdPartyType.value === 'client') {
        recipient.recipientMode = 'thirdPartyClient';
        recipient.recipientClientId = selectedThirdPartyId.value;
        if (showScopeChoice.value) recipient.recipientScope = thirdPartyScope.value;
    } else if (selectedThirdPartyType.value === 'organization') {
        recipient.recipientMode = 'thirdPartyOrganization';
        recipient.recipientOrganizationId = selectedThirdPartyId.value;
    }

    isSubmitting.value = true;
    router.post(
        urlFor('commandes.store'),
        { items, ...recipient },
        {
            onFinish: () => {
                isSubmitting.value = false;
            },
        },
    );
}
</script>

<template>
    <Head :title="t('commande.title')" />
    <div class="min-h-screen pt-32 pb-24 px-[8%] space-y-16">
        <div class="flex flex-col items-center text-center gap-6">
            <h1 class="font-serif text-4xl font-light text-slate-800 dark:text-slate-100">{{ t('commande.title') }}</h1>
            <p class="text-slate-500 dark:text-slate-400 max-w-xl">{{ t('commande.description') }}</p>
        </div>

        <div class="max-w-5xl mx-auto space-y-10">
            <div class="max-w-xl mx-auto space-y-4 rounded-md border p-4">
                <div class="space-y-1">
                    <Label>{{ t('commande.recipient.title') }}</Label>
                    <Select v-model="recipientMode">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-if="organizationName" value="myOrganization">{{ t('commande.recipient.myOrganization', { name: organizationName }) }}</SelectItem>
                            <SelectItem value="myself">{{ t('commande.recipient.myself') }}</SelectItem>
                            <SelectItem v-if="canRequestForThirdParty" value="thirdParty">{{ t('commande.recipient.thirdParty') }}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div v-if="recipientMode === 'thirdParty'" class="space-y-1">
                    <Label>{{ t('commande.recipient.thirdPartySelect') }}</Label>
                    <Select v-model="thirdPartySelection">
                        <SelectTrigger>
                            <SelectValue :placeholder="t('commande.recipient.thirdPartyPlaceholder')" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup v-if="clientsWithOrganization.length">
                                <SelectLabel>{{ t('commande.recipient.clients') }}</SelectLabel>
                                <SelectItem v-for="client in clientsWithOrganization" :key="client.id" :value="`client:${client.id}`">{{ client.username }} ({{ client.organizationName }})</SelectItem>
                            </SelectGroup>
                            <SelectGroup v-if="clientsWithoutOrganization.length">
                                <SelectLabel>{{ t('commande.recipient.clientsPersonal') }}</SelectLabel>
                                <SelectItem v-for="client in clientsWithoutOrganization" :key="client.id" :value="`client:${client.id}`">
                                    {{ client.username }}
                                </SelectItem>
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>{{ t('commande.recipient.organizations') }}</SelectLabel>
                                <SelectItem v-for="organization in organizations" :key="organization.id" :value="`organization:${organization.id}`">
                                    {{ organization.name }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div v-if="showScopeChoice" class="space-y-1">
                    <Label>{{ t('commande.recipient.scope') }}</Label>
                    <Select v-model="thirdPartyScope">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="organization">{{ t('commande.recipient.scopeOrganization', { name: selectedClient?.organizationName ?? '' }) }}</SelectItem>
                            <SelectItem value="personal">{{ t('commande.recipient.scopePersonal') }}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.minerai') }}</h2>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('stocks.table.name') }}</TableHead>
                                <TableHead>{{ t('stocks.table.sellPrice') }}</TableHead>
                                <TableHead>{{ t('deposit.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="resource in minerais" :key="resource.id">
                                <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ priceFor(resource).toFixed(2) }} s</TableCell>
                                <TableCell>
                                    <QuantityStepper :model-value="quantities[resource.id] ?? 0" @update:model-value="(value) => setQuantity(resource.id, value)" />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div class="space-y-3">
                <h2 class="font-serif text-2xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.lingot') }}</h2>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{{ t('stocks.table.name') }}</TableHead>
                                <TableHead>{{ t('stocks.table.sellPrice') }}</TableHead>
                                <TableHead>{{ t('deposit.quantity') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="resource in lingots" :key="resource.id">
                                <TableCell class="text-sm font-medium">{{ resource.name }}</TableCell>
                                <TableCell class="text-sm text-muted-foreground">{{ priceFor(resource).toFixed(2) }} s</TableCell>
                                <TableCell>
                                    <QuantityStepper :model-value="quantities[resource.id] ?? 0" @update:model-value="(value) => setQuantity(resource.id, value)" />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div class="flex items-center justify-between gap-4 rounded-md border p-4">
                <div class="text-lg">
                    <span class="text-slate-600 dark:text-slate-300">{{ t('commande.totalValue') }}</span>
                    <span class="font-medium text-slate-800 dark:text-slate-100 ml-2">{{ totalAmount.toFixed(2) }} s</span>
                </div>
                <Button :disabled="isSubmitting || !canSubmit" :loading="isSubmitting" @click="submitOrder">
                    {{ t('commande.submit') }}
                </Button>
            </div>
        </div>
    </div>
</template>
