<script setup lang="ts">
import AdminLayout from '~/layouts/admin.vue';
import { useAdminLayout } from '~/composables/use_admin_layout';
import { useI18n } from 'vue-i18n';
import { computed, reactive, ref, watch } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { urlFor } from '~/client';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Input } from '~/components/ui/input';
import { Link } from '@adonisjs/inertia/vue';
import { ArrowLeft } from '@lucide/vue';
import QuantityStepper from '~/partials/stocks/QuantityStepper.vue';
import type { Data } from '@generated/data';

defineOptions({ layout: AdminLayout });

type ClientOption = { id: string; username: string; organizationId: string | null; organizationName: string | null };
type OrganizationOption = { id: string; name: string; castellanyId: string | null };
type AvailableWeek = { weekNumber: number; startDate: string; endDate: string };

const { t } = useI18n();
const { pageTitle } = useAdminLayout();
pageTitle.value = t('admin.orderArchives.create.title');

const props = defineProps<{
    resources: Data.Resource[];
    clients: ClientOption[];
    organizations: OrganizationOption[];
    organizationResourcePrices: Record<string, Record<string, number>>;
    castellanies: { id: string; name: string }[];
    currentWeek: number;
    availableWeeks: AvailableWeek[];
}>();

function formatWeekRange(week: AvailableWeek): string {
    const format = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
    return `${format(week.startDate)} - ${format(week.endDate)}`;
}

const PICKUP = 'pickup';

const minerais = computed(() => props.resources.filter((r) => r.type === 'minerai'));
const lingots = computed(() => props.resources.filter((r) => r.type === 'lingot'));

const clientsWithOrganization = computed(() => props.clients.filter((client) => client.organizationName));
const clientsWithoutOrganization = computed(() => props.clients.filter((client) => !client.organizationName));

const recipientSearch = ref('');

function matchesSearch(...values: (string | null)[]): boolean {
    const needle = recipientSearch.value.trim().toLowerCase();
    if (!needle) return true;
    return values.some((value) => value?.toLowerCase().includes(needle));
}

const filteredClientsWithOrganization = computed(() => clientsWithOrganization.value.filter((client) => matchesSearch(client.username, client.organizationName)));
const filteredClientsWithoutOrganization = computed(() => clientsWithoutOrganization.value.filter((client) => matchesSearch(client.username)));
const filteredOrganizations = computed(() => props.organizations.filter((organization) => matchesSearch(organization.name)));
const hasRecipientResults = computed(() => filteredClientsWithOrganization.value.length || filteredClientsWithoutOrganization.value.length || filteredOrganizations.value.length);

function onRecipientOpenChange(open: boolean) {
    if (!open) recipientSearch.value = '';
}

function onRecipientSearchKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') event.stopPropagation();
}

function buildQuantities(items: Data.Resource[]): Record<string, number> {
    return Object.fromEntries(items.map((item) => [item.id, 0]));
}

const quantities = reactive<Record<string, number>>(buildQuantities(props.resources));

function setQuantity(id: string, value: number) {
    quantities[id] = value;
}

const recipientSelection = ref('');
const recipientScope = ref<'organization' | 'personal'>('organization');

const selectedRecipientType = computed(() => recipientSelection.value.split(':')[0] as 'client' | 'organization' | '');
const selectedRecipientId = computed(() => recipientSelection.value.split(':')[1] ?? '');
const selectedClient = computed<ClientOption | undefined>(() => (selectedRecipientType.value === 'client' ? props.clients.find((client) => client.id === selectedRecipientId.value) : undefined));
const showScopeChoice = computed(() => !!selectedClient.value?.organizationName);

const effectiveOrganizationId = computed<string | null>(() => {
    if (selectedRecipientType.value === 'organization') return selectedRecipientId.value || null;
    if (selectedRecipientType.value === 'client') {
        if (showScopeChoice.value && recipientScope.value === 'personal') return null;
        return selectedClient.value?.organizationId ?? null;
    }
    return null;
});

function priceFor(resource: Data.Resource): number {
    const organizationId = effectiveOrganizationId.value;
    if (!organizationId) return resource.sellPrice;
    return props.organizationResourcePrices[organizationId]?.[resource.id] ?? resource.sellPrice;
}

const hasSelection = computed(() => Object.values(quantities).some((quantity) => quantity > 0));
const totalAmount = computed(() => props.resources.reduce((sum, resource) => sum + priceFor(resource) * (quantities[resource.id] ?? 0), 0));

const form = useForm({
    orderWeek: props.currentWeek,
    deliveryWeek: props.currentWeek,
    recipientClientId: '',
    recipientOrganizationId: '',
    castellanyId: PICKUP,
});

watch(effectiveOrganizationId, (organizationId) => {
    const organization = organizationId ? props.organizations.find((o) => o.id === organizationId) : undefined;
    form.castellanyId = organization?.castellanyId ?? PICKUP;
});

const orderWeekValid = computed(() => Number.isInteger(form.orderWeek) && form.orderWeek >= 1 && form.orderWeek <= props.currentWeek);
const deliveryWeekValid = computed(() => Number.isInteger(form.deliveryWeek) && form.deliveryWeek >= form.orderWeek && form.deliveryWeek <= props.currentWeek);

const deliveryWeekOptions = computed(() => props.availableWeeks.filter((week) => week.weekNumber >= form.orderWeek));

const orderWeekModel = computed({
    get: () => String(form.orderWeek),
    set: (value: string) => (form.orderWeek = Number(value)),
});
const deliveryWeekModel = computed({
    get: () => String(form.deliveryWeek),
    set: (value: string) => (form.deliveryWeek = Number(value)),
});

watch(
    () => form.orderWeek,
    (orderWeek) => {
        if (form.deliveryWeek < orderWeek) form.deliveryWeek = orderWeek;
    },
);

const canSubmit = computed(() => {
    if (!hasSelection.value) return false;
    if (selectedRecipientType.value !== 'client' && selectedRecipientType.value !== 'organization') return false;
    return orderWeekValid.value && deliveryWeekValid.value;
});

function submit() {
    const items = props.resources.map((resource) => ({ resourceId: resource.id, quantity: quantities[resource.id] ?? 0 }));

    const recipient: Record<string, string> = {};
    if (selectedRecipientType.value === 'client') {
        recipient.recipientMode = 'thirdPartyClient';
        recipient.recipientClientId = selectedRecipientId.value;
        if (showScopeChoice.value) recipient.recipientScope = recipientScope.value;
    } else if (selectedRecipientType.value === 'organization') {
        recipient.recipientMode = 'thirdPartyOrganization';
        recipient.recipientOrganizationId = selectedRecipientId.value;
    }

    form.transform((data) => ({ ...data, items, ...recipient, castellanyId: data.castellanyId === PICKUP ? undefined : data.castellanyId })).post(urlFor('admin.orderArchives.store'));
}
</script>

<template>
    <div class="space-y-4 max-w-5xl">
        <Button variant="outline" class="gap-2" as-child>
            <Link :href="urlFor('admin.commandes.index')">
                <ArrowLeft class="size-4" />
                {{ t('admin.orderArchives.create.back') }}
            </Link>
        </Button>

        <p class="text-sm text-muted-foreground max-w-2xl">{{ t('admin.orderArchives.create.description') }}</p>

        <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-md border p-4 space-y-4">
                <div class="space-y-1">
                    <Label>{{ t('admin.orderArchives.create.fields.recipient') }}</Label>
                    <Select v-model="recipientSelection" @update:open="onRecipientOpenChange">
                        <SelectTrigger>
                            <SelectValue :placeholder="t('admin.orderArchives.create.fields.recipientPlaceholder')" />
                        </SelectTrigger>
                        <SelectContent>
                            <div class="p-1">
                                <Input v-model="recipientSearch" :placeholder="t('commande.recipient.search')" class="h-8" @click.stop @keydown="onRecipientSearchKeydown" />
                            </div>
                            <p v-if="!hasRecipientResults" class="px-2 py-4 text-center text-sm text-muted-foreground">{{ t('commande.recipient.searchEmpty') }}</p>
                            <SelectGroup v-if="filteredClientsWithOrganization.length">
                                <SelectLabel>{{ t('commande.recipient.clients') }}</SelectLabel>
                                <SelectItem v-for="client in filteredClientsWithOrganization" :key="client.id" :value="`client:${client.id}`">
                                    {{ client.username }} ({{ client.organizationName }})
                                </SelectItem>
                            </SelectGroup>
                            <SelectGroup v-if="filteredClientsWithoutOrganization.length">
                                <SelectLabel>{{ t('commande.recipient.clientsPersonal') }}</SelectLabel>
                                <SelectItem v-for="client in filteredClientsWithoutOrganization" :key="client.id" :value="`client:${client.id}`">
                                    {{ client.username }}
                                </SelectItem>
                            </SelectGroup>
                            <SelectGroup v-if="filteredOrganizations.length">
                                <SelectLabel>{{ t('commande.recipient.organizations') }}</SelectLabel>
                                <SelectItem v-for="organization in filteredOrganizations" :key="organization.id" :value="`organization:${organization.id}`">
                                    {{ organization.name }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <p v-if="form.errors.recipientClientId || form.errors.recipientOrganizationId" class="text-sm text-destructive">
                        {{ form.errors.recipientClientId || form.errors.recipientOrganizationId }}
                    </p>
                </div>

                <div v-if="showScopeChoice" class="space-y-1">
                    <Label>{{ t('commande.recipient.scope') }}</Label>
                    <Select v-model="recipientScope">
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

            <div class="rounded-md border p-4 space-y-4">
                <div class="space-y-1">
                    <Label>{{ t('admin.orderArchives.create.fields.orderWeek') }}</Label>
                    <Select v-model="orderWeekModel">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="week in availableWeeks" :key="week.weekNumber" :value="String(week.weekNumber)">
                                {{ formatWeekRange(week) }}
                                <span v-if="week.weekNumber === currentWeek" class="text-muted-foreground">({{ t('admin.common.weekly.current') }})</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p v-if="form.errors.orderWeek" class="text-sm text-destructive">{{ form.errors.orderWeek }}</p>
                </div>
                <div class="space-y-1">
                    <Label>{{ t('admin.orderArchives.create.fields.deliveryWeek') }}</Label>
                    <Select v-model="deliveryWeekModel">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="week in deliveryWeekOptions" :key="week.weekNumber" :value="String(week.weekNumber)">
                                {{ formatWeekRange(week) }}
                                <span v-if="week.weekNumber === currentWeek" class="text-muted-foreground">({{ t('admin.common.weekly.current') }})</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p v-if="form.errors.deliveryWeek" class="text-sm text-destructive">{{ form.errors.deliveryWeek }}</p>
                </div>
                <div class="space-y-1">
                    <Label>{{ t('home.toDeliver.castellany') }}</Label>
                    <Select v-model="form.castellanyId">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem :value="PICKUP">{{ t('home.toDeliver.castellanyPickup') }}</SelectItem>
                            <SelectItem v-for="castellany in props.castellanies" :key="castellany.id" :value="castellany.id">{{ castellany.name }}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <div class="space-y-3">
            <h2 class="font-serif text-xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.minerai') }}</h2>
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
            <h2 class="font-serif text-xl font-light text-slate-800 dark:text-slate-100">{{ t('admin.resources.types.lingot') }}</h2>
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
            <Button :disabled="form.processing || !canSubmit" :loading="form.processing" @click="submit">
                {{ t('admin.orderArchives.create.submit') }}
            </Button>
        </div>
    </div>
</template>
